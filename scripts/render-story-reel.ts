import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.resolve(ROOT, "public");
const GEN = path.resolve(PUBLIC, "generated");

/* ════════════════════════════════════════════════════
   Types
   ════════════════════════════════════════════════════ */

interface ScrapedPost {
  title: string;
  body: string;
  subreddit: string;
  author: string;
}

interface ParsedComment {
  author: string;
  body: string;
  score: number;
  verdictTag: string | null;
}

interface JurySummary {
  analyzedCount: number;
  verdictCounts: Record<string, number>;
  majorityVerdict: string | null;
}

interface TTSResult {
  durationSec: number;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  } | null;
}

interface TimedChunk {
  text: string;
  startSec: number;
  endSec: number;
}

interface VideoDebateMessage {
  displayName: string;
  text: string;
  color: string;
  startFrame: number;
  endFrame: number;
  isSummary?: boolean;
  tag?: string;
}

/* ════════════════════════════════════════════════════
   Reddit JSON API — fetch post + comments
   ════════════════════════════════════════════════════ */

function extractVerdictTag(body: string): string | null {
  const m = body.slice(0, 300).match(/\b(NTA|YTA|ESH|NAH|INFO)\b/);
  return m ? m[1].toUpperCase() : null;
}

async function fetchRedditData(
  url: string,
): Promise<{ post: ScrapedPost; comments: ParsedComment[] }> {
  const jsonUrl = url.replace(/\/?(\?.*)?$/, ".json");
  console.log(`  Fetching: ${jsonUrl}`);
  const res = await fetch(jsonUrl, {
    headers: { "User-Agent": "AITAH-Hackathon/1.0" },
  });
  if (!res.ok) throw new Error(`Reddit API ${res.status}`);
  const data = await res.json();

  const pd = data?.[0]?.data?.children?.[0]?.data;
  if (!pd) throw new Error("Could not parse Reddit JSON");

  const clean = (s: string) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#x200B;/g, "");

  const post: ScrapedPost = {
    title: pd.title ?? "Untitled",
    body: clean(pd.selftext ?? ""),
    subreddit: pd.subreddit ?? "AITAH",
    author: pd.author ?? "throwaway_poster",
  };

  const rawComments = data?.[1]?.data?.children ?? [];
  const comments: ParsedComment[] = rawComments
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
      author: d.author as string,
      body: clean(d.body ?? ""),
      score: (d.score as number) ?? 0,
      verdictTag: extractVerdictTag(d.body ?? ""),
    }))
    .sort((a: ParsedComment, b: ParsedComment) => b.score - a.score);

  return { post, comments };
}

/* ════════════════════════════════════════════════════
   Jury computation
   ════════════════════════════════════════════════════ */

function computeJury(comments: ParsedComment[]): JurySummary {
  const counts: Record<string, number> = {};
  for (const c of comments) {
    if (c.verdictTag) counts[c.verdictTag] = (counts[c.verdictTag] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const majority =
    Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  return { analyzedCount: total, verdictCounts: counts, majorityVerdict: majority };
}

/* ════════════════════════════════════════════════════
   Firecrawl receipts
   ════════════════════════════════════════════════════ */

interface FirecrawlReceipt {
  title: string;
  url: string;
  snippet: string;
}

async function searchFirecrawlReceipts(
  query: string,
): Promise<FirecrawlReceipt[]> {
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
      snippet: ((r.markdown ?? r.description ?? "") as string).slice(0, 200),
    }));
  } catch {
    return [];
  }
}

/* ════════════════════════════════════════════════════
   Gender detection via MiniMax
   ════════════════════════════════════════════════════ */

async function detectGender(
  text: string,
): Promise<"male" | "female" | "unknown"> {
  const regexMatch = text.match(/\((\d+)\s*([MmFf])\)/);
  if (regexMatch) {
    const g = regexMatch[2].toLowerCase() === "m" ? "male" : "female";
    console.log(`  Regex detected: ${g} (from ${regexMatch[0]})`);
    return g as "male" | "female";
  }

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    console.log("  MINIMAX_API_KEY not set, defaulting to unknown");
    return "unknown";
  }

  try {
    const res = await fetch(
      "https://api.minimax.io/v1/text/chatcompletion_v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "MiniMax-M2",
          messages: [
            {
              role: "system",
              content:
                "Detect the original poster's gender from this Reddit post. Look for age/gender patterns like (23M), (20F), pronouns, or contextual clues like 'my husband' (female OP) or 'my wife' (male OP). Reply with EXACTLY one word: male, female, or unknown.",
            },
            { role: "user", content: text.slice(0, 800) },
          ],
          max_tokens: 5,
          temperature: 0.1,
        }),
      },
    );

    if (!res.ok) throw new Error(`MiniMax HTTP ${res.status}`);
    const data = await res.json();
    const answer = (
      data.choices?.[0]?.message?.content ?? "unknown"
    )
      .toLowerCase()
      .trim();
    if (answer.includes("female")) return "female";
    if (answer.includes("male") && !answer.includes("female")) return "male";
    return "unknown";
  } catch (e: unknown) {
    console.log(
      `  MiniMax failed: ${e instanceof Error ? e.message : e}, using unknown`,
    );
    return "unknown";
  }
}

function selectVoice(gender: "male" | "female" | "unknown"): string {
  const m = process.env.ELEVENLABS_MALE_VOICE_ID;
  const f = process.env.ELEVENLABS_FEMALE_VOICE_ID;
  const def = process.env.ELEVENLABS_NARRATOR_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
  if (gender === "male" && m) return m;
  if (gender === "female" && f) return f;
  return def;
}

/* ════════════════════════════════════════════════════
   Text processing
   ════════════════════════════════════════════════════ */

function condense(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  const cut = words.slice(0, maxWords).join(" ");
  const lp = cut.lastIndexOf(".");
  return lp > cut.length * 0.6 ? cut.slice(0, lp + 1) : cut;
}

function chunkStory(text: string, target = 14): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const merged: string[] = [];
  let buf = "";

  for (const s of sentences) {
    const t = s.trim();
    if (!t) continue;
    const bw = buf ? buf.split(/\s+/).length : 0;
    const sw = t.split(/\s+/).length;
    if (buf && bw + sw > target * 1.4) {
      merged.push(buf.trim());
      buf = t;
    } else {
      buf = buf ? `${buf} ${t}` : t;
    }
  }
  if (buf.trim()) merged.push(buf.trim());

  const out: string[] = [];
  for (const c of merged) {
    const w = c.split(/\s+/).length;
    if (w > target * 2.2) {
      const words = c.split(/\s+/);
      const mid = Math.ceil(words.length / 2);
      out.push(words.slice(0, mid).join(" "));
      out.push(words.slice(mid).join(" "));
    } else {
      out.push(c);
    }
  }
  return out;
}

/* ════════════════════════════════════════════════════
   Debate narration (brief summary for TTS)
   ════════════════════════════════════════════════════ */

function trunc(s: string, max = 120): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return (last > max * 0.5 ? cut.slice(0, last) : cut) + "...";
}

function firstSentence(text: string, max = 65): string {
  const s = text.split(/[.!?\n]/)[0].trim();
  return s.length > max ? s.slice(0, max) + "..." : s;
}

function buildDebateNarration(comments: ParsedComment[]): string {
  const nta = comments
    .filter((c) => c.verdictTag === "NTA")
    .sort((a, b) => b.score - a.score);
  const yta = comments
    .filter((c) => c.verdictTag === "YTA" || c.verdictTag === "ESH")
    .sort((a, b) => b.score - a.score);

  const parts: string[] = [];
  parts.push("Now two AI agents go head to head.");

  if (yta.length > 0)
    parts.push(`The prosecution opens with: ${firstSentence(yta[0].body, 60)}.`);
  if (nta.length > 0)
    parts.push(`The defense fires back: ${firstSentence(nta[0].body, 60)}.`);

  if (yta.length > 1)
    parts.push(`The prosecution doubles down: ${firstSentence(yta[1].body, 50)}.`);
  if (nta.length > 1)
    parts.push(`But the defense counters: ${firstSentence(nta[1].body, 50)}.`);

  parts.push("Let's see the final arguments from each side.");

  return parts.join(" ");
}

function generateOneLiner(label: string): string {
  const t: Record<string, string[]> = {
    NTA: [
      "Boundaries aren't optional, they're the bare minimum.",
      "You protected your peace. That's not selfish, that's survival.",
    ],
    YTA: [
      "Sometimes the call IS coming from inside the house.",
      "Self-awareness is free, but apparently out of stock.",
    ],
    ESH: [
      "Everyone in this story needs a timeout.",
      "Two wrongs don't make a right, but they do make a Reddit post.",
    ],
  };
  const opts = t[label] ?? t.NTA!;
  return opts[Math.floor(Math.random() * opts.length)];
}

/* ════════════════════════════════════════════════════
   Build video debate messages (visual chat bubbles)
   ════════════════════════════════════════════════════ */

function buildSummary(comments: ParsedComment[], side: "YTA" | "NTA"): string {
  if (comments.length === 0) {
    return side === "YTA"
      ? "The response was disproportionate. Even if the other party was wrong, escalation shows poor judgment and a lack of empathy for the broader consequences."
      : "Setting boundaries is healthy and necessary. The poster acted in self-preservation after repeated disrespect, and the community overwhelmingly supports that choice.";
  }

  const sentences: string[] = [];
  for (const c of comments.slice(0, 4)) {
    const parts = c.body.split(/[.!?\n]/).filter((s) => s.trim().length > 15);
    for (const p of parts.slice(0, 2)) {
      sentences.push(p.trim());
      if (sentences.length >= 4) break;
    }
    if (sentences.length >= 4) break;
  }

  const joined = sentences.join(". ").replace(/\.+/g, ".").trim();
  if (!joined.endsWith(".")) return trunc(joined + ".", 320);
  return trunc(joined, 320);
}

function extractQuote(c: ParsedComment, maxLen = 120): string {
  const firstSent = c.body.split(/[.!?\n]/).filter((s) => s.trim().length > 10)[0]?.trim() ?? c.body;
  return trunc(firstSent, maxLen);
}

function buildVideoDebateMessages(
  comments: ParsedComment[],
  jury: JurySummary,
  debateStartFrame: number,
  debateEndFrame: number,
  fps: number,
): VideoDebateMessage[] {
  const nta = comments
    .filter((c) => c.verdictTag === "NTA")
    .sort((a, b) => b.score - a.score);
  const yta = comments
    .filter((c) => c.verdictTag === "YTA" || c.verdictTag === "ESH")
    .sort((a, b) => b.score - a.score);

  const totalAvail = debateEndFrame - debateStartFrame;
  const CONVO_RATIO = 0.55;
  const convoEnd = debateStartFrame + Math.round(totalAvail * CONVO_RATIO);

  const msgs: VideoDebateMessage[] = [];
  let f = debateStartFrame + Math.round(0.5 * fps);
  const MSG_GAP = Math.round(2.2 * fps);

  const prosArgs = [
    yta[0] ? `"${extractQuote(yta[0])}" — u/${yta[0].author} (${yta[0].score.toLocaleString()} upvotes)` : "OP escalated when they could have communicated. That's a choice with consequences.",
    yta[1] ? `"${extractQuote(yta[1])}" — u/${yta[1].author} agrees` : "Even if the other party was wrong, the response needs to match. This was disproportionate.",
    yta[2] ? `"${extractQuote(yta[2], 100)}"` : "Multiple Reddit users flagged this as an overreaction.",
  ];
  const defArgs = [
    nta[0] ? `"${extractQuote(nta[0])}" — u/${nta[0].author} (${nta[0].score.toLocaleString()} upvotes)` : "OP set a boundary. That's healthy, not dramatic.",
    nta[1] ? `"${extractQuote(nta[1])}" — u/${nta[1].author} backs this up` : "Boundaries aren't punishments — they're self-preservation.",
    nta[2] ? `"${extractQuote(nta[2], 100)}"` : `${jury.verdictCounts["NTA"] ?? 0} Redditors voted NTA. The people have spoken.`,
  ];

  const convoMsgs: Array<{ side: "pros" | "def"; text: string; tag: string }> = [
    { side: "pros", text: prosArgs[0], tag: "OPENING" },
    { side: "def", text: defArgs[0], tag: "REBUTTAL" },
    { side: "pros", text: prosArgs[1], tag: "EVIDENCE" },
    { side: "def", text: defArgs[1], tag: "COUNTER" },
  ];

  const convoGap = Math.min(MSG_GAP, Math.round((convoEnd - f) / convoMsgs.length));

  for (const cm of convoMsgs) {
    if (f >= convoEnd - fps) break;
    msgs.push({
      displayName: cm.side === "pros" ? "Prosecutor" : "Defense",
      text: cm.text,
      color: cm.side === "pros" ? "#ef4444" : "#22c55e",
      startFrame: f,
      endFrame: convoEnd,
      tag: cm.tag,
    });
    f = Math.min(f + convoGap, convoEnd - Math.round(fps * 0.5));
  }

  const summaryStart = convoEnd + Math.round(0.3 * fps);
  const SUMMARY_GAP = Math.round(3.5 * fps);

  msgs.push({
    displayName: "PROSECUTION",
    text: buildSummary(yta, "YTA"),
    color: "#ef4444",
    startFrame: summaryStart,
    endFrame: debateEndFrame,
    isSummary: true,
  });

  msgs.push({
    displayName: "DEFENSE",
    text: buildSummary(nta, "NTA"),
    color: "#22c55e",
    startFrame: summaryStart + SUMMARY_GAP,
    endFrame: debateEndFrame,
    isSummary: true,
  });

  return msgs;
}

/* ════════════════════════════════════════════════════
   ElevenLabs TTS
   ════════════════════════════════════════════════════ */

async function generateTTS(text: string, voiceId: string): Promise<TTSResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set in .env");

  const payload = {
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.62,
      similarity_boost: 0.78,
      style: 0.12,
      use_speaker_boost: true,
      speed: 1.2,
    },
  };

  try {
    console.log("  Trying with-timestamps endpoint...");
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const buf = Buffer.from(data.audio_base64, "base64");
    fs.writeFileSync(path.join(GEN, "narration.mp3"), buf);
    console.log(`  Audio saved (${(buf.length / 1024).toFixed(0)} KB)`);

    const endTimes: number[] | undefined =
      data.alignment?.character_end_times_seconds;
    const dur = endTimes?.length
      ? endTimes[endTimes.length - 1]
      : (buf.length * 8) / 128_000;

    return { durationSec: dur, alignment: data.alignment ?? null };
  } catch (e: unknown) {
    console.log(
      `  Timestamps unavailable (${e instanceof Error ? e.message : e}), fallback...`,
    );
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok)
    throw new Error(`ElevenLabs TTS ${res.status}: ${await res.text()}`);

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(GEN, "narration.mp3"), buf);
  console.log(`  Audio saved (${(buf.length / 1024).toFixed(0)} KB)`);
  return { durationSec: (buf.length * 8) / 128_000, alignment: null };
}

/* ════════════════════════════════════════════════════
   Timing helpers
   ════════════════════════════════════════════════════ */

function findTextTimestamp(
  alignment: TTSResult["alignment"],
  fullText: string,
  searchText: string,
): number | null {
  if (!alignment) return null;
  const idx = fullText.indexOf(searchText);
  if (idx < 0) return null;
  const ci = Math.min(idx, alignment.character_start_times_seconds.length - 1);
  return alignment.character_start_times_seconds[ci] ?? null;
}

function mapChunkTiming(
  chunks: string[],
  fullText: string,
  audioDur: number,
  alignment: TTSResult["alignment"],
  storyStartSec: number,
): TimedChunk[] {
  if (alignment) {
    const charStarts = alignment.character_start_times_seconds;
    const charEnds = alignment.character_end_times_seconds;
    const result: TimedChunk[] = [];
    let search = 0;

    for (const text of chunks) {
      const idx = fullText.indexOf(text, search);
      if (idx < 0) continue;
      const si = Math.min(idx, charStarts.length - 1);
      const ei = Math.min(idx + text.length - 1, charEnds.length - 1);
      result.push({
        text,
        startSec: charStarts[si] ?? 0,
        endSec: (charEnds[ei] ?? 0) + 0.25,
      });
      search = idx + text.length;
    }
    if (result.length > 0) return result;
  }

  const totalWords = chunks.reduce((s, c) => s + c.split(/\s+/).length, 0);
  const fullWords = fullText.split(/\s+/).length;
  const storyDurSec = audioDur * (totalWords / fullWords);
  let offset = storyStartSec;
  return chunks.map((text) => {
    const wc = text.split(/\s+/).length;
    const dur = Math.max(1.8, (wc / totalWords) * storyDurSec);
    const item: TimedChunk = { text, startSec: offset, endSec: offset + dur };
    offset += dur;
    return item;
  });
}

/* ════════════════════════════════════════════════════
   Server-side ElevenLabs Agent Debate (simulateConversation REST API)
   ════════════════════════════════════════════════════ */

interface AgentTurn {
  role: "prosecutor" | "defense";
  text: string;
}

async function patchAgent(apiKey: string, agentId: string, prompt: string, firstMessage: string) {
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_config: {
        agent: { prompt: { prompt }, first_message: firstMessage },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Agent PATCH failed (${agentId}): ${res.status} ${err}`);
  }
}

async function runServerSideAgentDebate(
  post: ScrapedPost,
  comments: ParsedComment[],
  jury: JurySummary,
): Promise<AgentTurn[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const prosId = process.env.ELEVENLABS_PROSECUTOR_AGENT_ID;
  const defId = process.env.ELEVENLABS_DEFENSE_AGENT_ID;

  if (!apiKey || !prosId || !defId) {
    console.log("  Agent IDs not configured, skipping live debate");
    return [];
  }

  const client = new ElevenLabsClient({ apiKey });

  const yta = comments.filter((c) => c.verdictTag === "YTA" || c.verdictTag === "ESH").sort((a, b) => b.score - a.score);
  const nta = comments.filter((c) => c.verdictTag === "NTA").sort((a, b) => b.score - a.score);
  const juryLine = Object.entries(jury.verdictCounts).sort(([, a], [, b]) => b - a).map(([k, v]) => `${k}: ${v}`).join(", ");

  let ctx = `TITLE: ${post.title}\nAUTHOR: u/${post.author}\nSUBREDDIT: r/${post.subreddit}\n\nPOST:\n${post.body.slice(0, 1500)}\n\nJURY (${jury.analyzedCount} votes): ${juryLine}\n`;
  ctx += "\nYTA/ESH COMMENTS:\n";
  for (const c of yta.slice(0, 3)) ctx += `- u/${c.author} (${c.score} pts): "${trunc(c.body)}"\n`;
  ctx += "\nNTA COMMENTS:\n";
  for (const c of nta.slice(0, 3)) ctx += `- u/${c.author} (${c.score} pts): "${trunc(c.body)}"\n`;

  const caseTitle = post.title;
  const prosPrompt = `You are The Prosecutor in an AITA Reddit courtroom trial. Argue OP IS the asshole (YTA). Keep every response to 2-3 punchy sentences MAX. Quote Reddit comments as evidence. Be dramatic, fierce, and quotable. Never break character.\n\nCASE:\n${ctx}`;
  const defPrompt = `You are The Defense Attorney in an AITA Reddit courtroom trial. Argue OP is NOT the asshole (NTA). Keep every response to 2-3 punchy sentences MAX. Quote Reddit comments as evidence. Be passionate and persuasive. Never break character.\n\nCASE:\n${ctx}`;

  console.log("  Patching agents with case context...");
  await Promise.all([
    patchAgent(apiKey, prosId, prosPrompt, `The prosecution is ready. Case: "${caseTitle}". Reddit jury: ${juryLine}. Let me present why OP is the asshole.`),
    patchAgent(apiKey, defId, defPrompt, `The defense is ready. Case: "${caseTitle}". Reddit jury: ${juryLine}. Let me explain why OP is NOT the asshole.`),
  ]);

  const simulatedUserPrompt = `You are a courtroom moderator. Ask the lawyer to present arguments about this Reddit AITA case: "${caseTitle}". Ask for opening argument first, then ask them to respond to counterarguments, then ask for a closing statement. Keep your prompts to 1 sentence each.`;

  console.log("  Running simulateConversation for both agents...");
  const [prosResult, defResult] = await Promise.all([
    client.conversationalAi.agents.simulateConversation(prosId, {
      simulationSpecification: {
        simulatedUserConfig: {
          prompt: { prompt: simulatedUserPrompt },
          firstMessage: `Present your opening argument: why is the OP in "${caseTitle}" the asshole?`,
          language: "en",
        },
      },
      newTurnsLimit: 6,
    }),
    client.conversationalAi.agents.simulateConversation(defId, {
      simulationSpecification: {
        simulatedUserConfig: {
          prompt: { prompt: simulatedUserPrompt },
          firstMessage: `Present your opening argument: why is the OP in "${caseTitle}" NOT the asshole?`,
          language: "en",
        },
      },
      newTurnsLimit: 6,
    }),
  ]);

  const prosData = (prosResult as any).body ?? prosResult;
  const defData = (defResult as any).body ?? defResult;

  const prosMessages = (prosData.simulatedConversation ?? prosData.simulated_conversation ?? [])
    .filter((t: any) => t.role === "agent" && t.message)
    .map((t: any) => t.message as string);
  const defMessages = (defData.simulatedConversation ?? defData.simulated_conversation ?? [])
    .filter((t: any) => t.role === "agent" && t.message)
    .map((t: any) => t.message as string);

  const turns: AgentTurn[] = [];
  const maxLen = Math.max(prosMessages.length, defMessages.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < prosMessages.length) {
      turns.push({ role: "prosecutor", text: prosMessages[i] });
      console.log(`    [Prosecutor ${i + 1}] ${trunc(prosMessages[i], 80)}`);
    }
    if (i < defMessages.length) {
      turns.push({ role: "defense", text: defMessages[i] });
      console.log(`    [Defense ${i + 1}] ${trunc(defMessages[i], 80)}`);
    }
  }

  console.log(`  Agent debate complete: ${turns.length} turns`);
  return turns;
}

function buildDebateFromAgentTranscript(
  turns: AgentTurn[],
  debateStartFrame: number,
  debateEndFrame: number,
  fps: number,
): { messages: VideoDebateMessage[]; narration: string } {
  const totalAvail = debateEndFrame - debateStartFrame;
  const CONVO_RATIO = 0.55;
  const convoEnd = debateStartFrame + Math.round(totalAvail * CONVO_RATIO);

  const msgs: VideoDebateMessage[] = [];
  let f = debateStartFrame + Math.round(0.5 * fps);
  const convoGap = Math.round((convoEnd - f) / Math.max(turns.length, 1));
  const tags = ["OPENING", "REBUTTAL", "EVIDENCE", "COUNTER", "CLOSING", "CLOSING"];

  for (let i = 0; i < Math.min(turns.length, 4); i++) {
    const t = turns[i];
    msgs.push({
      displayName: t.role === "prosecutor" ? "Prosecutor" : "Defense",
      text: trunc(t.text, 140),
      color: t.role === "prosecutor" ? "#ef4444" : "#22c55e",
      startFrame: f,
      endFrame: convoEnd,
      tag: tags[i] ?? "ARGUMENT",
    });
    f = Math.min(f + convoGap, convoEnd - Math.round(fps * 0.5));
  }

  const summaryStart = convoEnd + Math.round(0.3 * fps);
  const SUMMARY_GAP = Math.round(3.5 * fps);

  const prosTurns = turns.filter((t) => t.role === "prosecutor");
  const defTurns = turns.filter((t) => t.role === "defense");

  const prosSummary = prosTurns.map((t) => t.text).join(" ").slice(0, 300);
  const defSummary = defTurns.map((t) => t.text).join(" ").slice(0, 300);

  msgs.push({
    displayName: "PROSECUTION",
    text: trunc(prosSummary, 280),
    color: "#ef4444",
    startFrame: summaryStart,
    endFrame: debateEndFrame,
    isSummary: true,
  });

  msgs.push({
    displayName: "DEFENSE",
    text: trunc(defSummary, 280),
    color: "#22c55e",
    startFrame: summaryStart + SUMMARY_GAP,
    endFrame: debateEndFrame,
    isSummary: true,
  });

  const narrationParts = ["Now two ElevenLabs AI agents debate this case live."];
  if (prosTurns[0]) narrationParts.push(`The prosecution opens: ${firstSentence(prosTurns[0].text, 60)}.`);
  if (defTurns[0]) narrationParts.push(`The defense fires back: ${firstSentence(defTurns[0].text, 60)}.`);
  if (prosTurns.length > 1) narrationParts.push(`The prosecution doubles down: ${firstSentence(prosTurns[1].text, 50)}.`);
  if (defTurns.length > 1) narrationParts.push(`But the defense counters: ${firstSentence(defTurns[1].text, 50)}.`);
  narrationParts.push("Here are the final arguments from each side.");

  return { messages: msgs, narration: narrationParts.join(" ") };
}

/* ════════════════════════════════════════════════════
   Main
   ════════════════════════════════════════════════════ */

async function main() {
  const redditUrl =
    process.argv[2] ??
    "https://www.reddit.com/r/AmItheAsshole/comments/13xga9y/aita_for_uninviting_my_sister_to_my_wedding/";

  fs.mkdirSync(GEN, { recursive: true });

  /* ── 1. Fetch post + comments ── */
  console.log("\n\u{1F4E5} Step 1 \u2014 Fetching Reddit thread...");
  const { post, comments } = await fetchRedditData(redditUrl);
  console.log(`  Title   : ${post.title}`);
  console.log(`  Body    : ${post.body.slice(0, 100)}...`);
  console.log(`  Comments: ${comments.length}`);

  /* ── 2. Jury ── */
  const jury = computeJury(comments);
  const verdictLabel = jury.majorityVerdict ?? "NTA";
  const verdictColor =
    verdictLabel === "NTA"
      ? "#22c55e"
      : verdictLabel === "YTA"
        ? "#ef4444"
        : verdictLabel === "ESH"
          ? "#f59e0b"
          : "#3b82f6";
  console.log(
    `  Jury    : ${JSON.stringify(jury.verdictCounts)} \u2192 ${verdictLabel}`,
  );

  /* ── 3. Firecrawl ── */
  console.log("\n\u{1F525} Step 2 \u2014 Searching receipts...");
  const receipts = await searchFirecrawlReceipts(
    `${post.title} reddit AITA`,
  );
  console.log(`  Found ${receipts.length} receipt(s)`);

  /* ── 4. Detect gender + select voice ── */
  console.log("\n\u{1F9E0} Step 3 \u2014 Detecting poster gender...");
  const gender = await detectGender(`${post.title}\n${post.body}`);
  const voiceId = selectVoice(gender);
  console.log(`  Gender  : ${gender}`);
  console.log(`  Voice   : ${voiceId}`);

  /* ── 4b. Run live ElevenLabs agent debate ── */
  console.log("\n\u2694\uFE0F  Step 2b \u2014 Running ElevenLabs Agent Debate...");
  const agentTurns = await runServerSideAgentDebate(post, comments, jury);
  const usedLiveDebate = agentTurns.length >= 2;
  console.log(`  Live debate: ${usedLiveDebate ? `YES (${agentTurns.length} turns)` : "NO (fallback to scripted)"}`);

  /* ── 5. Text processing ── */
  console.log("\n\u2702\uFE0F  Step 4 \u2014 Processing text...");
  const condensed = condense(post.body, 180);
  const chunks = chunkStory(condensed);
  console.log(`  Chunks  : ${chunks.length}`);
  chunks.forEach((c, i) => console.log(`    [${i}] ${c.slice(0, 70)}`));

  /* ── 6. Build narration ── */
  const hookLine = post.title
    .replace(/^AITA\s/i, "Am I the asshole ")
    .replace(/\??\s*$/, "?");
  const storyText = chunks.join(" ");
  const debateNarration = usedLiveDebate
    ? buildDebateFromAgentTranscript(agentTurns, 0, 100, 30).narration
    : buildDebateNarration(comments);
  const oneLiner = generateOneLiner(verdictLabel);
  const verdictNarration = `After hearing both ElevenLabs AI agents argue their case, the verdict is in. ${verdictLabel}. ${oneLiner}`;
  const ctaLine = "Do you agree? Drop your verdict in the comments.";

  const fullNarration = [
    hookLine,
    "Here's what happened.",
    storyText,
    debateNarration,
    verdictNarration,
    ctaLine,
  ].join(" ");

  console.log(`  Narration: ${fullNarration.split(/\s+/).length} words`);

  /* ── 7. TTS ── */
  console.log("\n\u{1F3A4} Step 5 \u2014 Generating TTS...");
  const tts = await generateTTS(fullNarration, voiceId);
  console.log(`  Duration : ${tts.durationSec.toFixed(1)}s`);

  /* ── 8. Timing ── */
  console.log("\n\u23F1\uFE0F  Step 6 \u2014 Calculating timing...");
  const FPS = 30;
  const AUDIO_OFFSET_SEC = 0.5;

  const timedChunks = mapChunkTiming(
    chunks,
    fullNarration,
    tts.durationSec,
    tts.alignment,
    AUDIO_OFFSET_SEC,
  );

  const storyEndSec =
    timedChunks.length > 0
      ? timedChunks[timedChunks.length - 1].endSec
      : tts.durationSec * 0.6;

  const debateStartSec =
    findTextTimestamp(tts.alignment, fullNarration, debateNarration) ??
    storyEndSec + 0.3;
  const verdictStartSec =
    findTextTimestamp(tts.alignment, fullNarration, "the verdict is in") ??
    debateStartSec + 20;
  const ctaStartSec =
    findTextTimestamp(tts.alignment, fullNarration, ctaLine) ??
    verdictStartSec + 8;

  const totalSec = Math.min(90, Math.max(60, tts.durationSec + 2));
  const totalFrames = Math.ceil(totalSec * FPS);

  console.log(`  Story   : 0 \u2013 ${storyEndSec.toFixed(1)}s`);
  console.log(`  Debate  : ${debateStartSec.toFixed(1)}s`);
  console.log(`  Verdict : ${verdictStartSec.toFixed(1)}s`);
  console.log(`  CTA     : ${ctaStartSec.toFixed(1)}s`);
  console.log(`  Total   : ${totalSec.toFixed(1)}s (${totalFrames} frames)`);

  /* ── 9. Build debate visual messages ── */
  const debateEndFrame = Math.round(verdictStartSec * FPS) - 10;
  let videoDebateMessages: VideoDebateMessage[];

  if (usedLiveDebate) {
    const result = buildDebateFromAgentTranscript(
      agentTurns,
      Math.round(debateStartSec * FPS),
      debateEndFrame,
      FPS,
    );
    videoDebateMessages = result.messages;
    console.log(`  Debate msgs: ${videoDebateMessages.length} (LIVE from ElevenLabs agents)`);
  } else {
    videoDebateMessages = buildVideoDebateMessages(
      comments,
      jury,
      Math.round(debateStartSec * FPS),
      debateEndFrame,
      FPS,
    );
    console.log(`  Debate msgs: ${videoDebateMessages.length} (scripted fallback)`);
  }

  /* ── 10. Check video background ── */
  const hasVideo = fs.existsSync(
    path.join(PUBLIC, "video", "parkour-bg.mp4"),
  );
  console.log(`  Video bg : ${hasVideo ? "YES" : "no (programmatic)"}`);

  /* ── 11. Remotion props — verdict from AI agents debate ── */
  const prosComments = comments.filter(
    (c) => c.verdictTag === "YTA" || c.verdictTag === "ESH",
  );
  const defComments = comments.filter((c) => c.verdictTag === "NTA");
  const prosScore = prosComments.reduce((s, c) => s + c.score, 0);
  const defScore = defComments.reduce((s, c) => s + c.score, 0);
  const totalScore = prosScore + defScore || 1;
  const prosStrength = Math.round((prosScore / totalScore) * 100);
  const defStrength = 100 - prosStrength;
  const agentWinner = prosStrength >= defStrength ? "prosecution" : "defense";
  const confidence =
    agentWinner === "prosecution" ? prosStrength : defStrength;
  const voteSummary = `Prosecution ${prosStrength}% vs Defense ${defStrength}%`;

  console.log(
    `  AI Debate: Prosecution ${prosStrength}% | Defense ${defStrength}% → ${agentWinner} wins`,
  );

  console.log(`  Confidence: ${confidence}% | Votes: ${voteSummary}`);

  const inputProps = {
    subreddit: post.subreddit,
    author: post.author,
    title: post.title,
    hookText: hookLine,
    chunks: timedChunks.map((c) => ({
      text: c.text,
      startFrame: Math.round(c.startSec * FPS),
      endFrame: Math.round(c.endSec * FPS),
    })),
    debateMessages: videoDebateMessages,
    debateStartFrame: Math.round(debateStartSec * FPS),
    debateEndFrame,
    verdictLabel,
    verdictOneLiner: oneLiner,
    verdictStartFrame: Math.round(verdictStartSec * FPS),
    verdictColor,
    verdictConfidence: confidence,
    verdictVoteSummary: voteSummary,
    ctaText: ctaLine,
    ctaStartFrame: Math.round(ctaStartSec * FPS),
    narrationSrc: "generated/narration.mp3",
    audioOffsetFrames: Math.round(AUDIO_OFFSET_SEC * FPS),
    hasVideoBackground: hasVideo,
  };

  /* ── 12. Bundle ── */
  console.log("\n\u{1F4E6} Step 7 \u2014 Bundling Remotion...");
  const entryPoint = path.resolve(ROOT, "remotion", "index.ts");
  const bundled = await bundle({
    entryPoint,
    publicDir: PUBLIC,
    onProgress: (pct: number) => {
      if (pct % 20 === 0) process.stdout.write(`  bundle: ${pct}%\r`);
    },
  });
  console.log("  Bundle complete.\n");

  /* ── 13. Render ── */
  const compositionId = "RedditStoryReel60";
  console.log(`\u{1F3AC} Step 8 \u2014 Rendering "${compositionId}"...`);
  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
    inputProps,
  });

  const adjusted = { ...composition, durationInFrames: totalFrames };
  const outputPath = path.resolve(ROOT, "aitah-story-reel-60s.mp4");
  console.log(`  Output  : ${outputPath}`);
  console.log(
    `  Res     : ${adjusted.width}x${adjusted.height} @ ${adjusted.fps}fps`,
  );
  console.log(`  Frames  : ${totalFrames}\n`);

  await renderMedia({
    composition: adjusted,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }: { progress: number }) => {
      process.stdout.write(
        `  Rendering: ${Math.round(progress * 100)}%\r`,
      );
    },
  });

  console.log(`\n\n\u2705 Story reel saved \u2192 ${outputPath}`);
  console.log(`   Duration : ~${totalSec.toFixed(0)}s`);
  console.log(`   Verdict  : ${verdictLabel}`);
  console.log(`   Gender   : ${gender} \u2192 voice ${voiceId}`);
  console.log(`   Video bg : ${hasVideo}`);
  console.log(`   Reddit   : ${redditUrl}\n`);
}

main().catch((err) => {
  console.error("\n\u274C Render failed:", err);
  process.exit(1);
});
