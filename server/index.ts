import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { execSync, spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const app = express();
app.use(cors());
app.use(express.json());

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  depth: number;
  permalink?: string;
  verdictTag: string | null;
}

interface JurySummary {
  analyzedCount: number;
  verdictCounts: Record<string, number>;
  majorityVerdict: string | null;
  topComments: RedditComment[];
  funniestComment?: RedditComment;
}

interface DebateMessage {
  id: string;
  speaker: "system" | "prosecutor" | "defense" | "internet" | "verdict";
  displayName: string;
  text: string;
  source?: { author: string; score: number };
  color: string;
}

interface Receipt {
  title: string;
  url: string;
  snippet: string;
}

/* ═══════════════════════════════════════════════════
   Reddit fetch
   ═══════════════════════════════════════════════════ */

async function fetchRedditThread(url: string) {
  const jsonUrl = url.replace(/\/?(\?.*)?$/, ".json");
  const res = await fetch(jsonUrl, {
    headers: { "User-Agent": "AITAH-Hackathon/1.0" },
  });
  if (!res.ok) throw new Error(`Reddit ${res.status}`);
  return res.json();
}

function extractVerdictTag(body: string): string | null {
  const first300 = body.slice(0, 300);
  const m = first300.match(/\b(NTA|YTA|ESH|NAH|INFO)\b/);
  return m ? m[1].toUpperCase() : null;
}

function parseComments(raw: unknown[]): RedditComment[] {
  const children =
    (raw as any)?.[1]?.data?.children ?? [];
  return children
    .filter((c: any) => c.kind === "t1")
    .map((c: any) => c.data)
    .filter(
      (d: any) =>
        d.author !== "AutoModerator" &&
        d.author !== "[deleted]" &&
        d.body !== "[removed]" &&
        d.body !== "[deleted]",
    )
    .map((d: any) => ({
      id: d.id as string,
      author: d.author as string,
      body: (d.body as string)
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#x200B;/g, ""),
      score: (d.score as number) ?? 0,
      depth: (d.depth as number) ?? 0,
      permalink: d.permalink as string | undefined,
      verdictTag: extractVerdictTag(d.body ?? ""),
    }))
    .sort((a: RedditComment, b: RedditComment) => b.score - a.score);
}

/* ═══════════════════════════════════════════════════
   Jury computation
   ═══════════════════════════════════════════════════ */

function computeJury(comments: RedditComment[]): JurySummary {
  const counts: Record<string, number> = {};
  for (const c of comments) {
    if (c.verdictTag) counts[c.verdictTag] = (counts[c.verdictTag] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const majority =
    Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

  const topComments = comments.filter((c) => c.depth === 0).slice(0, 8);
  const funniestComment =
    comments.find((c) => c.score > 100 && c.body.length < 250) ??
    topComments[0];

  return {
    analyzedCount: total,
    verdictCounts: counts,
    majorityVerdict: majority,
    topComments,
    funniestComment,
  };
}

/* ═══════════════════════════════════════════════════
   Debate generator  (2-agent: Prosecutor vs Defense)
   Uses REAL Reddit comments as evidence.
   ═══════════════════════════════════════════════════ */

function trunc(s: string, max = 180) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return (last > max * 0.5 ? cut.slice(0, last) : cut) + "…";
}

function generateDebate(
  post: { title: string; body: string },
  comments: RedditComment[],
  jury: JurySummary,
): DebateMessage[] {
  const msgs: DebateMessage[] = [];
  let id = 0;
  const push = (
    speaker: DebateMessage["speaker"],
    displayName: string,
    text: string,
    color: string,
    source?: { author: string; score: number },
  ) => msgs.push({ id: `msg-${id++}`, speaker, displayName, text, color, source });

  const nta = comments
    .filter((c) => c.verdictTag === "NTA")
    .sort((a, b) => b.score - a.score);
  const yta = comments
    .filter((c) => c.verdictTag === "YTA" || c.verdictTag === "ESH")
    .sort((a, b) => b.score - a.score);
  const top = [...comments].sort((a, b) => b.score - a.score);

  // ── system intro ──
  push("system", "AITAH?!", `📋 Case loaded: ${post.title}`, "#ff4500");

  const juryParts = Object.entries(jury.verdictCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `${k} ${v}`)
    .join(" · ");
  push(
    "system",
    "Reddit Jury",
    `📊 ${jury.analyzedCount} votes analyzed — ${juryParts}`,
    "#ff4500",
  );

  // ── round 1: openings ──
  if (yta.length > 0) {
    push(
      "prosecutor",
      "The Prosecutor",
      `I'll let Reddit speak for me. u/${yta[0].author} says: "${trunc(yta[0].body, 160)}". ${yta[0].score.toLocaleString()} people agreed. The case writes itself.`,
      "#ef4444",
      { author: yta[0].author, score: yta[0].score },
    );
  } else {
    push(
      "prosecutor",
      "The Prosecutor",
      `Everyone's rushing to NTA, but let me play devil's advocate. OP went nuclear instead of communicating. Uninviting your own sibling is a choice you can't undo.`,
      "#ef4444",
    );
  }

  if (nta.length > 0) {
    push(
      "defense",
      "The Defense",
      `Objection. As u/${nta[0].author} put it: "${trunc(nta[0].body, 160)}". That's ${nta[0].score.toLocaleString()} upvotes worth of agreement.`,
      "#22c55e",
      { author: nta[0].author, score: nta[0].score },
    );
  } else {
    push(
      "defense",
      "The Defense",
      `OP was pushed to a breaking point. Sometimes setting boundaries IS the healthy response.`,
      "#22c55e",
    );
  }

  // ── internet reaction 1 ──
  if (top[0]) {
    push(
      "internet",
      "The Internet",
      `${trunc(top[0].body, 200)}`,
      "#8b5cf6",
      { author: top[0].author, score: top[0].score },
    );
  }

  // ── round 2: escalation ──
  if (yta.length > 1) {
    push(
      "prosecutor",
      "The Prosecutor",
      `And it's not just one person. u/${yta[1].author}: "${trunc(yta[1].body, 140)}". The opposition exists and it has receipts.`,
      "#ef4444",
      { author: yta[1].author, score: yta[1].score },
    );
  } else {
    push(
      "prosecutor",
      "The Prosecutor",
      `Let's zoom out. Family relationships are permanent. This one bad night will echo through every holiday, every birthday, every family dinner for years. Was it worth it?`,
      "#ef4444",
    );
  }

  if (nta.length > 1) {
    push(
      "defense",
      "The Defense",
      `Meanwhile, u/${nta[1].author} said: "${trunc(nta[1].body, 140)}". The defense has an army.`,
      "#22c55e",
      { author: nta[1].author, score: nta[1].score },
    );
  } else {
    push(
      "defense",
      "The Defense",
      `Boundaries aren't punishments — they're self-preservation. OP communicated a limit and stuck to it. That's not "nuclear." That's healthy.`,
      "#22c55e",
    );
  }

  // ── internet reaction 2 (funniest) ──
  const funny =
    jury.funniestComment ??
    top.find((c) => c.body.length < 200 && c.score > 50) ??
    top[1];
  if (funny && funny.id !== top[0]?.id) {
    push(
      "internet",
      "The Internet",
      `${trunc(funny.body, 200)}`,
      "#8b5cf6",
      { author: funny.author, score: funny.score },
    );
  }

  // ── round 3: closing arguments ──
  push(
    "prosecutor",
    "The Prosecutor",
    `My closing argument: actions have proportionality. Even if the other party was wrong, the response has to match. I'm not saying OP is THE asshole — I'm saying everyone could do better.`,
    "#ef4444",
  );

  push(
    "defense",
    "The Defense",
    `And my closing: Reddit has spoken. ${jury.analyzedCount} comments analyzed. ${jury.verdictCounts["NTA"] ?? 0} said NTA. The people's court has rendered its judgment.`,
    "#22c55e",
  );

  // ── internet reaction 3 ──
  if (top[2] && top[2].id !== funny?.id) {
    push(
      "internet",
      "The Internet",
      `${trunc(top[2].body, 200)}`,
      "#8b5cf6",
      { author: top[2].author, score: top[2].score },
    );
  }

  // ── verdict ──
  const label = jury.majorityVerdict ?? "NTA";
  const confidence = jury.analyzedCount > 0
    ? Math.round(((jury.verdictCounts[label] ?? 0) / jury.analyzedCount) * 100)
    : 75;
  const verdictColor = label === "NTA" ? "#22c55e" : label === "YTA" ? "#ef4444" : "#f59e0b";

  push(
    "verdict",
    "⚖️ THE VERDICT",
    `${label} — ${confidence}% of Reddit agrees. The people have spoken.`,
    verdictColor,
  );

  return msgs;
}

/* ═══════════════════════════════════════════════════
   Firecrawl receipts
   ═══════════════════════════════════════════════════ */

async function searchFirecrawlReceipts(query: string): Promise<Receipt[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query, limit: 3 }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return ((json as any)?.data ?? []).map((r: any) => ({
      title: (r.title ?? "") as string,
      url: (r.url ?? "") as string,
      snippet: ((r.markdown ?? r.description ?? "") as string).slice(0, 250),
    }));
  } catch {
    return [];
  }
}

/* ═══════════════════════════════════════════════════
   Routes
   ═══════════════════════════════════════════════════ */

app.post("/api/reddit/ingest", async (req, res) => {
  try {
    const { url } = req.body as { url: string };
    if (!url) return res.status(400).json({ error: "url is required" });

    console.log(`\n📥 Ingesting: ${url}`);

    const raw = await fetchRedditThread(url);
    const postData = (raw as any)[0]?.data?.children?.[0]?.data;
    if (!postData) throw new Error("Could not parse Reddit post");

    const post = {
      title: postData.title as string,
      body: ((postData.selftext as string) ?? "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">"),
      subreddit: postData.subreddit as string,
      author: postData.author as string,
      permalink: postData.permalink as string,
      url,
    };

    console.log(`  Title: ${post.title}`);

    const comments = parseComments(raw as unknown[]);
    console.log(`  Comments: ${comments.length}`);

    const jury = computeJury(comments);
    console.log(`  Jury: ${JSON.stringify(jury.verdictCounts)}`);

    const debate = generateDebate(post, comments, jury);
    console.log(`  Debate: ${debate.length} messages`);

    const receipts = await searchFirecrawlReceipts(
      `${post.title} AITA reddit etiquette`,
    );
    console.log(`  Receipts: ${receipts.length}`);

    const label = jury.majorityVerdict ?? "NTA";
    const confidence =
      jury.analyzedCount > 0
        ? Math.round(
            ((jury.verdictCounts[label] ?? 0) / jury.analyzedCount) * 100,
          )
        : 75;

    res.json({
      post,
      comments: comments.slice(0, 15),
      jury,
      debate,
      receipts,
      verdict: {
        label,
        confidence,
        oneLiner: generateOneLiner(post.title, label),
        rationale: `Based on ${jury.analyzedCount} Reddit comments, the majority verdict is ${label}.`,
      },
    });
  } catch (err: unknown) {
    console.error("Ingest error:", err);
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

function generateOneLiner(title: string, label: string): string {
  const templates: Record<string, string[]> = {
    NTA: [
      "Boundaries aren't optional — they're the bare minimum.",
      "You protected your peace. That's not selfish, that's survival.",
      "The trash took itself out.",
    ],
    YTA: [
      "Sometimes the call IS coming from inside the house.",
      "Self-awareness is free, but apparently out of stock.",
      "The main character syndrome is real.",
    ],
    ESH: [
      "Everyone in this story needs a timeout.",
      "Two wrongs don't make a right, but they do make a Reddit post.",
      "This is a masterclass in mutual self-destruction.",
    ],
  };
  const options = templates[label] ?? templates.NTA;
  return options[Math.floor(Math.random() * options.length)];
}

/* ── Render endpoint ── */

let renderInProgress = false;

app.post("/api/reels/render", async (req, res) => {
  if (renderInProgress) {
    return res.status(409).json({ error: "Render already in progress" });
  }
  renderInProgress = true;

  try {
    const { url } = req.body as { url: string };
    const redditUrl =
      url ??
      "https://www.reddit.com/r/AmItheAsshole/comments/13xga9y/aita_for_uninviting_my_sister_to_my_wedding/";

    console.log(`\n🎬 Starting reel render for: ${redditUrl}`);

    const script = path.resolve(ROOT, "scripts", "render-story-reel.ts");
    const child = spawn("npx", ["tsx", script, redditUrl], {
      cwd: ROOT,
      shell: true,
      stdio: "pipe",
    });

    let output = "";
    child.stdout.on("data", (d: Buffer) => {
      output += d.toString();
      process.stdout.write(d);
    });
    child.stderr.on("data", (d: Buffer) => {
      output += d.toString();
      process.stderr.write(d);
    });

    child.on("close", (code) => {
      renderInProgress = false;
      if (code === 0) {
        const mp4Path = path.resolve(ROOT, "aitah-story-reel-60s.mp4");
        if (fs.existsSync(mp4Path)) {
          res.json({
            success: true,
            file: "aitah-story-reel-60s.mp4",
            size: fs.statSync(mp4Path).size,
          });
        } else {
          res.status(500).json({ error: "Render completed but output missing" });
        }
      } else {
        res.status(500).json({ error: `Render failed (exit ${code})`, output });
      }
    });
  } catch (err: unknown) {
    renderInProgress = false;
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

app.get("/api/reels/download", (_req, res) => {
  const mp4 = path.resolve(ROOT, "aitah-story-reel-60s.mp4");
  if (!fs.existsSync(mp4)) {
    return res.status(404).json({ error: "No reel found. Render one first." });
  }
  res.download(mp4, "aitah-story-reel.mp4");
});

/* ── Static serve for generated files ── */
app.use("/generated", express.static(path.resolve(ROOT, "public", "generated")));

/* ═══════════════════════════════════════════════════
   Start
   ═══════════════════════════════════════════════════ */

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n⚖️  AITAH?! Server running on http://localhost:${PORT}`);
  console.log(`   POST /api/reddit/ingest — load a Reddit thread`);
  console.log(`   POST /api/reels/render  — render a story reel`);
  console.log(`   GET  /api/reels/download — download latest reel\n`);
});
