export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  depth: number;
  permalink?: string;
  verdictTag: string | null;
}

export interface JurySummary {
  analyzedCount: number;
  verdictCounts: Record<string, number>;
  majorityVerdict: string | null;
  topComments: RedditComment[];
  funniestComment?: RedditComment;
}

export interface DebateMessage {
  id: string;
  speaker: "system" | "prosecutor" | "defense" | "internet" | "verdict";
  displayName: string;
  text: string;
  source?: { author: string; score: number };
  color: string;
}

export interface Receipt {
  title: string;
  url: string;
  snippet: string;
}

const REDDIT_URL_RE =
  /^https?:\/\/(www\.)?reddit\.com\/r\/\w+\/comments\/\w+/i;

export function sanitizeRedditUrl(raw: unknown): string {
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
  if (parsed.hostname !== "reddit.com" && parsed.hostname !== "www.reddit.com")
    throw new Error("Only reddit.com links are accepted");
  if (!REDDIT_URL_RE.test(trimmed))
    throw new Error("URL must be a Reddit post (reddit.com/r/…/comments/…)");
  return `https://www.reddit.com${parsed.pathname}`;
}

export async function fetchRedditThread(url: string) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY not set");

  const path = new URL(url).pathname.replace(/\/$/, "");
  const jsonUrl = `https://www.reddit.com${path}.json?raw_json=1`;

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      url: jsonUrl,
      formats: ["rawHtml"],
      waitFor: 2000,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Firecrawl scrape failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = await res.json() as any;
  const raw = json?.data?.rawHtml ?? json?.data?.html ?? "";
  if (!raw) throw new Error("Firecrawl returned empty content");

  const preMatch = raw.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  const text = preMatch ? preMatch[1] : raw;
  const cleaned = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse Reddit JSON from Firecrawl response");
  }
}

function extractVerdictTag(body: string): string | null {
  const first300 = body.slice(0, 300);
  const m = first300.match(/\b(NTA|YTA|ESH|NAH|INFO)\b/);
  return m ? m[1].toUpperCase() : null;
}

export function parseComments(raw: unknown[]): RedditComment[] {
  const children = (raw as any)?.[1]?.data?.children ?? [];
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

export function computeJury(comments: RedditComment[]): JurySummary {
  const counts: Record<string, number> = {};
  for (const c of comments) {
    if (c.verdictTag) counts[c.verdictTag] = (counts[c.verdictTag] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const majority =
    Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  const topComments = comments.filter((c) => c.depth === 0).slice(0, 8);
  const funniestComment =
    comments.find((c) => c.score > 100 && c.body.length < 250) ?? topComments[0];
  return { analyzedCount: total, verdictCounts: counts, majorityVerdict: majority, topComments, funniestComment };
}

function trunc(s: string, max = 180) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return (last > max * 0.5 ? cut.slice(0, last) : cut) + "\u2026";
}

export function generateDebate(
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

  const nta = comments.filter((c) => c.verdictTag === "NTA").sort((a, b) => b.score - a.score);
  const yta = comments.filter((c) => c.verdictTag === "YTA" || c.verdictTag === "ESH").sort((a, b) => b.score - a.score);
  const top = [...comments].sort((a, b) => b.score - a.score);

  push("system", "AITAH?!", `Case loaded: ${post.title}`, "#ff4500");
  const juryParts = Object.entries(jury.verdictCounts).sort(([, a], [, b]) => b - a).map(([k, v]) => `${k} ${v}`).join(" \u00B7 ");
  push("system", "Reddit Jury", `${jury.analyzedCount} votes analyzed \u2014 ${juryParts}`, "#ff4500");

  if (yta[0]) push("prosecutor", "The Prosecutor", `u/${yta[0].author} says: "${trunc(yta[0].body, 160)}". ${yta[0].score.toLocaleString()} people agreed.`, "#ef4444", { author: yta[0].author, score: yta[0].score });
  else push("prosecutor", "The Prosecutor", "OP went nuclear instead of communicating. That's a choice you can't undo.", "#ef4444");

  if (nta[0]) push("defense", "The Defense", `u/${nta[0].author} put it: "${trunc(nta[0].body, 160)}". ${nta[0].score.toLocaleString()} upvotes.`, "#22c55e", { author: nta[0].author, score: nta[0].score });
  else push("defense", "The Defense", "OP set a boundary. That's healthy, not dramatic.", "#22c55e");

  if (top[0]) push("internet", "The Internet", trunc(top[0].body, 200), "#8b5cf6", { author: top[0].author, score: top[0].score });

  if (yta[1]) push("prosecutor", "The Prosecutor", `u/${yta[1].author}: "${trunc(yta[1].body, 140)}". The opposition has receipts.`, "#ef4444", { author: yta[1].author, score: yta[1].score });
  else push("prosecutor", "The Prosecutor", "Family relationships are permanent. Was this one bad night worth burning it all?", "#ef4444");

  if (nta[1]) push("defense", "The Defense", `u/${nta[1].author} said: "${trunc(nta[1].body, 140)}". The defense has an army.`, "#22c55e", { author: nta[1].author, score: nta[1].score });
  else push("defense", "The Defense", "Boundaries aren't punishments \u2014 they're self-preservation.", "#22c55e");

  const funny = jury.funniestComment ?? top.find((c) => c.body.length < 200 && c.score > 50) ?? top[1];
  if (funny && funny.id !== top[0]?.id) push("internet", "The Internet", trunc(funny.body, 200), "#8b5cf6", { author: funny.author, score: funny.score });

  push("prosecutor", "The Prosecutor", "Even if the other party was wrong, the response has to match. Everyone could do better.", "#ef4444");
  push("defense", "The Defense", `Reddit has spoken. ${jury.analyzedCount} comments analyzed. ${jury.verdictCounts["NTA"] ?? 0} said NTA.`, "#22c55e");

  if (top[2] && top[2].id !== funny?.id) push("internet", "The Internet", trunc(top[2].body, 200), "#8b5cf6", { author: top[2].author, score: top[2].score });

  const label = jury.majorityVerdict ?? "NTA";
  const confidence = jury.analyzedCount > 0 ? Math.round(((jury.verdictCounts[label] ?? 0) / jury.analyzedCount) * 100) : 75;
  const verdictColor = label === "NTA" ? "#22c55e" : label === "YTA" ? "#ef4444" : "#f59e0b";
  push("verdict", "\u2696\uFE0F THE VERDICT", `${label} \u2014 ${confidence}% of Reddit agrees. The people have spoken.`, verdictColor);

  return msgs;
}

function generateOneLiner(_title: string, label: string): string {
  const t: Record<string, string[]> = {
    NTA: ["Boundaries aren't optional.", "You protected your peace.", "The trash took itself out."],
    YTA: ["The call IS coming from inside the house.", "Self-awareness is free, but apparently out of stock."],
    ESH: ["Everyone in this story needs a timeout.", "Two wrongs don't make a right, but they do make a Reddit post."],
  };
  const opts = t[label] ?? t.NTA!;
  return opts[Math.floor(Math.random() * opts.length)];
}

export async function searchFirecrawlReceipts(query: string): Promise<Receipt[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
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

export function buildCaseBundle(raw: any, url: string) {
  const postData = (raw as any)[0]?.data?.children?.[0]?.data;
  if (!postData) throw new Error("Could not parse Reddit post");

  const post = {
    title: postData.title as string,
    body: ((postData.selftext as string) ?? "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
    subreddit: postData.subreddit as string,
    author: postData.author as string,
    permalink: postData.permalink as string,
    url,
  };

  const comments = parseComments(raw as unknown[]);
  const jury = computeJury(comments);
  const debate = generateDebate(post, comments, jury);

  const label = jury.majorityVerdict ?? "NTA";
  const confidence = jury.analyzedCount > 0 ? Math.round(((jury.verdictCounts[label] ?? 0) / jury.analyzedCount) * 100) : 75;

  return {
    post,
    comments: comments.slice(0, 15),
    jury,
    debate,
    verdict: {
      label,
      confidence,
      oneLiner: generateOneLiner(post.title, label),
      rationale: `Based on ${jury.analyzedCount} Reddit comments, the majority verdict is ${label}.`,
    },
  };
}

export function buildFallbackCaseBundle(url: string) {
  const post = {
    title:
      "AITA for uninviting my sister to my wedding after she hijacked the engagement party?",
    body:
      "My sister grabbed the mic at my engagement party and announced her pregnancy. " +
      "The night became about her and she called me selfish when I confronted her. " +
      "I uninvited her from the wedding and now my parents are threatening to boycott.",
    subreddit: "AmItheAsshole",
    author: "throwaway_bride2026",
    permalink: "/r/AmItheAsshole/comments/demo_case_001/",
    url,
  };

  const comments: RedditComment[] = [
    {
      id: "demo-1",
      author: "top_commenter_1",
      body: "NTA. Announcing a pregnancy at someone else's engagement party is wild.",
      score: 8421,
      depth: 0,
      permalink: "/r/AmItheAsshole/comments/demo_case_001/c1/",
      verdictTag: "NTA",
    },
    {
      id: "demo-2",
      author: "family_first_77",
      body: "ESH. Your sister was wrong, but uninviting her escalated things fast.",
      score: 3990,
      depth: 0,
      permalink: "/r/AmItheAsshole/comments/demo_case_001/c2/",
      verdictTag: "ESH",
    },
    {
      id: "demo-3",
      author: "boundariesmatter",
      body: "NTA. Boundaries are healthy. She wanted your spotlight.",
      score: 5034,
      depth: 0,
      permalink: "/r/AmItheAsshole/comments/demo_case_001/c3/",
      verdictTag: "NTA",
    },
    {
      id: "demo-4",
      author: "softtake123",
      body: "YTA for going straight to uninvite without a cool-down conversation.",
      score: 1880,
      depth: 0,
      permalink: "/r/AmItheAsshole/comments/demo_case_001/c4/",
      verdictTag: "YTA",
    },
  ];

  const jury = computeJury(comments);
  const debate = generateDebate(post, comments, jury);
  const label = jury.majorityVerdict ?? "NTA";
  const confidence =
    jury.analyzedCount > 0
      ? Math.round(((jury.verdictCounts[label] ?? 0) / jury.analyzedCount) * 100)
      : 75;

  return {
    post,
    comments,
    jury,
    debate,
    verdict: {
      label,
      confidence,
      oneLiner: generateOneLiner(post.title, label),
      rationale: `Fallback demo case used because Reddit blocked the request. Majority verdict is ${label}.`,
    },
  };
}

export function buildCaseContext(bundle: {
  post: { title: string; body: string; subreddit: string; author: string };
  jury: JurySummary;
  comments: RedditComment[];
}): string {
  const { post, jury, comments } = bundle;
  const yta = comments.filter((c) => c.verdictTag === "YTA" || c.verdictTag === "ESH").sort((a, b) => b.score - a.score);
  const nta = comments.filter((c) => c.verdictTag === "NTA").sort((a, b) => b.score - a.score);

  const juryLine = Object.entries(jury.verdictCounts).sort(([, a], [, b]) => b - a).map(([k, v]) => `${k}: ${v}`).join(", ");

  let ctx = `SUBREDDIT: r/${post.subreddit}\nAUTHOR: u/${post.author}\nTITLE: ${post.title}\n\nPOST:\n${post.body.slice(0, 1500)}\n\nJURY VOTES (${jury.analyzedCount} total): ${juryLine}\nMAJORITY: ${jury.majorityVerdict ?? "unclear"}\n`;

  ctx += "\nTOP YTA/ESH COMMENTS (Prosecution evidence):\n";
  for (const c of yta.slice(0, 3)) {
    ctx += `- u/${c.author} (${c.score} upvotes): "${trunc(c.body, 200)}"\n`;
  }

  ctx += "\nTOP NTA COMMENTS (Defense evidence):\n";
  for (const c of nta.slice(0, 3)) {
    ctx += `- u/${c.author} (${c.score} upvotes): "${trunc(c.body, 200)}"\n`;
  }

  return ctx;
}
