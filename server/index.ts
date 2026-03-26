import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
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

app.set("trust proxy", 1);

const allowedOrigin = process.env.ALLOWED_ORIGIN ?? "*";
app.use(cors({
  origin: allowedOrigin === "*" ? true : [allowedOrigin, "http://localhost:8080"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json({ limit: "2mb" }));

const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please wait a minute." },
  validate: { xForwardedForHeader: false },
});
app.use("/api/", apiLimiter);

const REDDIT_URL_RE =
  /^https?:\/\/(www\.)?reddit\.com\/r\/\w+\/comments\/\w+/i;

function sanitizeRedditUrl(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) throw new Error("url is required");
  const trimmed = raw.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Invalid URL format");
  }
  if (!["http:", "https:"].includes(parsed.protocol))
    throw new Error("URL must use https");
  if (
    parsed.hostname !== "reddit.com" &&
    parsed.hostname !== "www.reddit.com"
  )
    throw new Error("Only reddit.com links are accepted");
  if (!REDDIT_URL_RE.test(trimmed))
    throw new Error("URL must be a Reddit post (reddit.com/r/…/comments/…)");
  return `https://www.reddit.com${parsed.pathname}`;
}

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
  const parsedPath = new URL(url).pathname.replace(/\/$/, "");
  const jsonUrl = `https://www.reddit.com${parsedPath}.json?raw_json=1`;

  const res = await fetch(jsonUrl, {
    headers: {
      "User-Agent": "AITAH-Bot/1.0",
      Accept: "application/json",
    },
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

function extractArg(body: string, maxLen = 100): string {
  let text = body.trim();
  text = text.replace(/^\*{0,2}\s*(NTA|YTA|ESH|NAH|INFO)\b[.!:,\-—\s]*/i, "");
  text = text.replace(/^(not the a\w*|the a\w*|no a\w* here)\b[.!:,\-—\s]*/i, "");
  const sentences = text.split(/(?<=[.!?\n])/).map((s) => s.trim()).filter((s) => s.length > 15);
  const core = sentences[0] ?? text;
  return trunc(core.charAt(0).toUpperCase() + core.slice(1), maxLen);
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
   Agent routes (ElevenLabs Conversational AI)
   ═══════════════════════════════════════════════════ */

app.post("/api/agent/start-session", async (req, res) => {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!agentId || !apiKey) {
    return res.status(500).json({ error: "Agent not configured" });
  }

  try {
    let post: { title: string; body: string; subreddit: string; author: string };
    let comments: RedditComment[];
    let jury: JurySummary;

    if (req.body?.caseBundle) {
      const bundle = req.body.caseBundle;
      post = bundle.post;
      comments = bundle.comments ?? [];
      jury = bundle.jury;
      console.log(`\n🎙️ Starting voice trial (pre-computed): ${post.title}`);
    } else {
      let url: string;
      try {
        url = sanitizeRedditUrl(req.body?.url);
      } catch (e: unknown) {
        return res.status(400).json({ error: e instanceof Error ? e.message : "Invalid URL" });
      }

      console.log(`\n🎙️ Starting voice trial for: ${url}`);

      const raw = await fetchRedditThread(url);
      const postData = (raw as any)[0]?.data?.children?.[0]?.data;
      if (!postData) throw new Error("Could not parse Reddit post");

      post = {
        title: postData.title as string,
        body: ((postData.selftext as string) ?? "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
        subreddit: postData.subreddit as string,
        author: postData.author as string,
      };

      comments = parseComments(raw as unknown[]);
      jury = computeJury(comments);
    }

    const yta = comments.filter((c) => c.verdictTag === "YTA" || c.verdictTag === "ESH").sort((a, b) => b.score - a.score);
    const nta = comments.filter((c) => c.verdictTag === "NTA").sort((a, b) => b.score - a.score);

    const juryLine = Object.entries(jury.verdictCounts).sort(([, a], [, b]) => b - a).map(([k, v]) => `${k}: ${v}`).join(", ");
    let ctx = `SUBREDDIT: r/${post.subreddit}\nAUTHOR: u/${post.author}\nTITLE: ${post.title}\n\nPOST:\n${post.body.slice(0, 1500)}\n\nJURY VOTES (${jury.analyzedCount} total): ${juryLine}\nMAJORITY: ${jury.majorityVerdict ?? "unclear"}\n`;
    ctx += "\nTOP YTA/ESH COMMENTS (Prosecution evidence):\n";
    for (const c of yta.slice(0, 3)) ctx += `- u/${c.author} (${c.score} upvotes): "${trunc(c.body)}"\n`;
    ctx += "\nTOP NTA COMMENTS (Defense evidence):\n";
    for (const c of nta.slice(0, 3)) ctx += `- u/${c.author} (${c.score} upvotes): "${trunc(c.body)}"\n`;

    const systemPrompt = `You are Judge Verdict — a dramatic, entertaining, and slightly unhinged Reddit courtroom judge presiding over AITA cases.

Your job is to run a dramatic trial:
1. OPENING: Dramatically summarize the case in 2-3 punchy sentences.
2. PROSECUTION: Present the strongest YTA arguments. Quote real Reddit comments.
3. DEFENSE: Present the strongest NTA arguments. Quote real Reddit comments.
4. EVIDENCE: Use your search_evidence tool to find external context about the situation.
5. VERDICT: Deliver a dramatic verdict with reasoning. Slam the gavel.

STYLE RULES:
- Keep each response to 2-4 sentences MAX. Be punchy. TikTok-style entertainment.
- Be funny, memeable, slightly chaotic. Think Judge Judy meets Reddit.
- Reference upvote counts and user comments.
- If the user challenges your verdict, engage with them. Be witty and dramatic.
- After the verdict, invite the user to challenge you.

CASE CONTEXT:
${ctx}`;

    const patchRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: "PATCH",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            prompt: { prompt: systemPrompt },
            first_message: `Order in the court! I'm Judge Verdict, and I've just reviewed the case: "${post.title}" from r/${post.subreddit}. ${jury.analyzedCount} Reddit jurors have already weighed in, and let me tell you... this one is SPICY. Say "begin the trial" and I'll present both sides, or ask me anything about the case.`,
          },
        },
      }),
    });

    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error("Agent PATCH failed:", patchRes.status, err);
      return res.status(500).json({ error: "Failed to configure agent" });
    }

    console.log("  Agent configured with case context");

    const signedUrlRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { "xi-api-key": apiKey } },
    );
    if (!signedUrlRes.ok) {
      return res.status(500).json({ error: "Failed to get signed URL" });
    }

    const { signed_url } = (await signedUrlRes.json()) as { signed_url: string };
    console.log("  Signed URL generated");

    res.json({ signedUrl: signed_url, caseTitle: post.title });
  } catch (err: unknown) {
    console.error("Agent session error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

app.post("/api/agent/start-debate", async (req, res) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const prosId = process.env.ELEVENLABS_PROSECUTOR_AGENT_ID;
  const defId = process.env.ELEVENLABS_DEFENSE_AGENT_ID;

  if (!apiKey || !prosId || !defId) {
    return res.status(500).json({ error: "Debate agents not configured" });
  }

  try {
    const bundle = req.body?.caseBundle;
    if (!bundle?.post) return res.status(400).json({ error: "caseBundle required" });

    console.log(`\n⚔️ Starting agent debate for: ${bundle.post.title}`);

    const yta = (bundle.comments ?? []).filter((c: any) => c.verdictTag === "YTA" || c.verdictTag === "ESH").sort((a: any, b: any) => b.score - a.score);
    const nta = (bundle.comments ?? []).filter((c: any) => c.verdictTag === "NTA").sort((a: any, b: any) => b.score - a.score);
    const juryLine = Object.entries(bundle.jury?.verdictCounts ?? {}).sort(([, a]: any, [, b]: any) => (b as number) - (a as number)).map(([k, v]) => `${k}: ${v}`).join(", ");

    let ctx = `TITLE: ${bundle.post.title}\nAUTHOR: u/${bundle.post.author}\nSUBREDDIT: r/${bundle.post.subreddit}\n\nPOST:\n${(bundle.post.body ?? "").slice(0, 1500)}\n\nJURY (${bundle.jury?.analyzedCount ?? 0} votes): ${juryLine}\n`;
    ctx += "\nYTA/ESH COMMENTS:\n";
    for (const c of yta.slice(0, 3)) ctx += `- u/${c.author} (${c.score} pts): "${trunc(c.body)}"\n`;
    ctx += "\nNTA COMMENTS:\n";
    for (const c of nta.slice(0, 3)) ctx += `- u/${c.author} (${c.score} pts): "${trunc(c.body)}"\n`;

    const prosPrompt = `You are The Prosecutor in an AITA Reddit courtroom trial about THIS SPECIFIC case: "${bundle.post.title}".

CRITICAL RULES:
- You MUST ONLY discuss THIS Reddit post. Every argument must reference specific details from the post below.
- Argue that OP (u/${bundle.post.author}) IS the asshole (YTA).
- Quote specific actions, words, or decisions OP made in the post.
- Reference real Reddit comments provided below as evidence.
- Keep responses to 2-4 punchy sentences. Be dramatic and quotable.
- NEVER make generic arguments. Always tie back to the specific situation described.

CASE:\n${ctx}`;
    const defPrompt = `You are The Defense Attorney in an AITA Reddit courtroom trial about THIS SPECIFIC case: "${bundle.post.title}".

CRITICAL RULES:
- You MUST ONLY discuss THIS Reddit post. Every argument must reference specific details from the post below.
- Argue that OP (u/${bundle.post.author}) is NOT the asshole (NTA).
- Quote specific actions, words, or decisions OP made in the post.
- Reference real Reddit comments provided below as evidence.
- Keep responses to 2-4 punchy sentences. Be passionate and persuasive.
- NEVER make generic arguments. Always tie back to the specific situation described.

CASE:\n${ctx}`;

    async function patchAndSign(agentId: string, prompt: string, firstMsg: string) {
      const patchRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: "PATCH",
        headers: { "xi-api-key": apiKey!, "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_config: { agent: { prompt: { prompt }, first_message: firstMsg } } }),
      });
      if (!patchRes.ok) {
        const errBody = await patchRes.text().catch(() => "");
        console.error(`  PATCH failed for ${agentId}: ${patchRes.status} ${errBody}`);
        throw new Error(`Agent config failed (${patchRes.status}): ${errBody.slice(0, 200)}`);
      }
      const signRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`, { headers: { "xi-api-key": apiKey! } });
      if (!signRes.ok) {
        const errBody = await signRes.text().catch(() => "");
        throw new Error(`Signed URL failed (${signRes.status}): ${errBody.slice(0, 200)}`);
      }
      const { signed_url } = (await signRes.json()) as { signed_url: string };
      return signed_url;
    }

    async function checkAgent(agentId: string, label: string) {
      const r = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        headers: { "xi-api-key": apiKey! },
      });
      if (!r.ok) {
        console.error(`  ${label} agent GET failed: ${r.status}`);
        return;
      }
      const a = await r.json() as any;
      const llm = a.conversation_config?.agent?.prompt?.llm;
      const tts = a.conversation_config?.tts;
      const firstMsg = a.conversation_config?.agent?.first_message;
      const overrides = a.platform_settings?.overrides;
      const auth = a.platform_settings?.auth;
      console.log(`  ${label}: llm=${llm ?? "MISSING"}, tts_voice=${tts?.voice_id ?? "MISSING"}, first_msg=${firstMsg ? "yes" : "MISSING"}`);
      console.log(`  ${label} overrides: ${JSON.stringify(overrides ?? "none")}`);
      console.log(`  ${label} auth: ${JSON.stringify(auth ?? "none")}`);
    }

    await Promise.all([checkAgent(prosId, "Prosecutor"), checkAgent(defId, "Defense")]);

    const prosFirstArg = yta[0]
      ? `In the case of "${bundle.post.title}" — ${extractArg(yta[0].body, 100)}`
      : `In the case of "${bundle.post.title}" — OP escalated when they could have communicated.`;
    const defFirstArg = nta[0]
      ? `Regarding "${bundle.post.title}" — ${extractArg(nta[0].body, 100)}`
      : `Regarding "${bundle.post.title}" — OP set a reasonable boundary.`;

    const [prosUrl, defUrl] = await Promise.all([
      patchAndSign(prosId, prosPrompt, prosFirstArg),
      patchAndSign(defId, defPrompt, defFirstArg),
    ]);

    console.log("  Both agents configured + signed URLs generated");
    console.log("  Testing prosecutor WebSocket from server...");
    try {
      const { default: WS } = await import("ws");
      await new Promise<void>((resolve) => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        const ws = new WS(prosUrl);
        ws.on("open", () => { console.log("  WS open!"); });
        ws.on("message", (data: any) => {
          try {
            const msg = JSON.parse(data.toString());
            console.log("  WS msg:", msg.type, msg.error ? JSON.stringify(msg) : "");
            if (msg.type === "conversation_initiation_metadata" || msg.error) {
              ws.close();
              finish();
            }
          } catch { console.log("  WS raw:", data.toString().slice(0, 300)); }
        });
        ws.on("error", (err: any) => { console.error("  WS error:", err.message); finish(); });
        ws.on("close", (code: number, reason: any) => { console.error(`  WS closed: ${code} ${reason?.toString()}`); finish(); });
        setTimeout(() => { ws.close(); finish(); }, 8000);
      });
    } catch (e: any) { console.error("  WS test error:", e.message); }

    res.json({ prosecutorSignedUrl: prosUrl, defenseSignedUrl: defUrl, caseTitle: bundle.post.title });
  } catch (err: unknown) {
    console.error("Debate error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

app.post("/api/agent/tools/search-evidence", async (req, res) => {
  const query = req.body?.query ?? req.body?.parameters?.query ?? req.body?.tool_call?.parameters?.query;

  if (!query || typeof query !== "string") {
    return res.json({ result: "No query provided." });
  }

  console.log(`  🔍 Agent searching: "${query}"`);

  const fcKey = process.env.FIRECRAWL_API_KEY;
  if (!fcKey) return res.json({ result: "Search unavailable." });

  try {
    const fcRes = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${fcKey}` },
      body: JSON.stringify({ query: `${query} AITA reddit etiquette advice`, limit: 3 }),
    });

    if (!fcRes.ok) return res.json({ result: `Search returned ${fcRes.status}.` });

    const json = await fcRes.json();
    const results = ((json as any)?.data ?? []).slice(0, 3).map((r: any) => ({
      title: r.title ?? "Untitled",
      url: r.url ?? "",
      excerpt: ((r.markdown ?? r.description ?? "") as string).slice(0, 300),
    }));

    if (results.length === 0) return res.json({ result: "No evidence found." });

    const formatted = results.map((r: any, i: number) => `[${i + 1}] "${r.title}" (${r.url})\n${r.excerpt}`).join("\n\n");
    console.log(`  Found ${results.length} results`);
    res.json({ result: `Found ${results.length} pieces of evidence:\n\n${formatted}` });
  } catch {
    res.json({ result: "Search failed." });
  }
});

/* ═══════════════════════════════════════════════════
   Routes
   ═══════════════════════════════════════════════════ */

app.post("/api/reddit/ingest", async (req, res) => {
  try {
    let url: string;
    try {
      url = sanitizeRedditUrl(req.body?.url);
    } catch (e: unknown) {
      return res
        .status(400)
        .json({ error: e instanceof Error ? e.message : "Invalid URL" });
    }

    console.log(`\n📥 Ingesting: ${url}`);

    let raw: unknown;
    if (req.body?.redditRaw && Array.isArray(req.body.redditRaw) && req.body.redditRaw.length >= 2) {
      console.log(`  Using client-provided Reddit data`);
      raw = req.body.redditRaw;
    } else {
      raw = await fetchRedditThread(url);
    }
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
let renderError: string | null = null;
let renderLastStartedAt: number | null = null;
let renderLastFinishedAt: number | null = null;
let renderOutputFile: string | null = null;

app.post("/api/reels/render", async (req, res) => {
  if (renderInProgress) {
    return res.status(202).json({
      status: "running",
      message: "Render already in progress",
      startedAt: renderLastStartedAt,
    });
  }

  try {
    const { url } = req.body as { url: string };
    const redditUrl =
      url ??
      "https://www.reddit.com/r/AmItheAsshole/comments/13xga9y/aita_for_uninviting_my_sister_to_my_wedding/";

    renderInProgress = true;
    renderError = null;
    renderLastStartedAt = Date.now();
    renderLastFinishedAt = null;
    renderOutputFile = null;

    console.log(`\n🎬 Starting reel render for: ${redditUrl}`);

    const script = path.resolve(ROOT, "scripts", "render-story-reel.ts");
    const child = spawn("npx", ["tsx", script, redditUrl], {
      cwd: ROOT,
      shell: true,
      stdio: "pipe",
      env: { ...process.env },
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
      renderLastFinishedAt = Date.now();
      if (code === 0) {
        const mp4Path = path.resolve(ROOT, "aitah-story-reel-60s.mp4");
        if (fs.existsSync(mp4Path)) {
          renderOutputFile = mp4Path;
          console.log(`✅ Reel ready: ${mp4Path}`);
        } else {
          renderError = "Render completed but output missing";
        }
      } else {
        renderError = `Render failed (exit ${code}). ${output.slice(-600)}`;
      }
    });

    return res.status(202).json({
      status: "started",
      message: "Render started",
      startedAt: renderLastStartedAt,
    });
  } catch (err: unknown) {
    renderInProgress = false;
    renderError = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: renderError });
  }
});

app.get("/api/reels/status", (_req, res) => {
  if (renderInProgress) {
    return res.json({
      status: "running",
      startedAt: renderLastStartedAt,
    });
  }
  if (renderError) {
    return res.status(500).json({
      status: "error",
      error: renderError,
      startedAt: renderLastStartedAt,
      finishedAt: renderLastFinishedAt,
    });
  }
  if (renderOutputFile && fs.existsSync(renderOutputFile)) {
    const stat = fs.statSync(renderOutputFile);
    return res.json({
      status: "ready",
      file: "aitah-story-reel-60s.mp4",
      size: stat.size,
      finishedAt: renderLastFinishedAt,
    });
  }
  return res.json({ status: "idle" });
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

/* ── Global error handler ── */
app.use((err: unknown, _req: import("express").Request, res: import("express").Response, _next: import("express").NextFunction) => {
  console.error("Unhandled Express error:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ═══════════════════════════════════════════════════
   Start
   ═══════════════════════════════════════════════════ */

const PORT = parseInt(process.env.PORT ?? "3001", 10);
app.listen(PORT, () => {
  console.log(`\n⚖️  AITAH?! Server running on http://localhost:${PORT}`);
  console.log(`   POST /api/reddit/ingest               — load a Reddit thread`);
  console.log(`   POST /api/agent/start-debate          — start AI trial (agent vs agent)`);
  console.log(`   POST /api/agent/start-session          — start voice trial (human vs agent)`);
  console.log(`   POST /api/agent/tools/search-evidence  — agent Firecrawl webhook`);
  console.log(`   POST /api/reels/render                 — render a story reel`);
  console.log(`   GET  /api/reels/status                 — check render progress/status`);
  console.log(`   GET  /api/reels/download                — download latest reel\n`);
});
