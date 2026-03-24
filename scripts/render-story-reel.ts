import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.resolve(ROOT, "public");
const GEN = path.resolve(PUBLIC, "generated");

/* ────────────────────────────────────────────────── */
/*  Reddit JSON API – fetch public post               */
/* ────────────────────────────────────────────────── */

interface ScrapedPost {
  title: string;
  body: string;
  subreddit: string;
  author: string;
}

async function fetchRedditPost(url: string): Promise<ScrapedPost> {
  const jsonUrl = url.replace(/\/?(\?.*)?$/, ".json");
  console.log(`  Fetching: ${jsonUrl}`);
  const res = await fetch(jsonUrl, {
    headers: { "User-Agent": "AITAH-Hackathon/1.0" },
  });
  if (!res.ok) throw new Error(`Reddit API ${res.status}`);

  const data = await res.json();
  const post = data?.[0]?.data?.children?.[0]?.data;
  if (!post) throw new Error("Could not parse Reddit JSON response");

  return {
    title: post.title ?? "Untitled",
    body: (post.selftext ?? "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
    subreddit: post.subreddit ?? "AITAH",
    author: post.author ?? "throwaway_poster",
  };
}

/* ────────────────────────────────────────────────── */
/*  Firecrawl – search for related receipts           */
/* ────────────────────────────────────────────────── */

interface FirecrawlReceipt {
  title: string;
  url: string;
  snippet: string;
}

async function searchFirecrawlReceipts(
  query: string,
): Promise<FirecrawlReceipt[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    console.log("  FIRECRAWL_API_KEY not set, skipping receipts");
    return [];
  }

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query, limit: 3 }),
    });
    if (!res.ok) {
      console.log(`  Firecrawl search ${res.status}, continuing without receipts`);
      return [];
    }
    const json = await res.json();
    const results: FirecrawlReceipt[] = (json?.data ?? []).map(
      (r: Record<string, unknown>) => ({
        title: (r.title as string) ?? "",
        url: (r.url as string) ?? "",
        snippet: ((r.markdown ?? r.description ?? "") as string).slice(0, 200),
      }),
    );
    console.log(`  Firecrawl found ${results.length} related result(s)`);
    return results;
  } catch (e: unknown) {
    console.log(
      `  Firecrawl search error: ${e instanceof Error ? e.message : e}`,
    );
    return [];
  }
}

/* ────────────────────────────────────────────────── */
/*  Text processing                                   */
/* ────────────────────────────────────────────────── */

function condense(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  const cut = words.slice(0, maxWords).join(" ");
  const lastPeriod = cut.lastIndexOf(".");
  return lastPeriod > cut.length * 0.6 ? cut.slice(0, lastPeriod + 1) : cut;
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

/* ────────────────────────────────────────────────── */
/*  ElevenLabs TTS                                    */
/* ────────────────────────────────────────────────── */

interface TTSResult {
  durationSec: number;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  } | null;
}

async function generateTTS(text: string): Promise<TTSResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set in .env");
  const voiceId =
    process.env.ELEVENLABS_NARRATOR_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

  const payload = {
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.62,
      similarity_boost: 0.78,
      style: 0.12,
      use_speaker_boost: true,
    },
  };

  /* Try with-timestamps first */
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
    const audioBuffer = Buffer.from(data.audio_base64, "base64");
    fs.writeFileSync(path.join(GEN, "narration.mp3"), audioBuffer);
    console.log(
      `  Audio saved (${(audioBuffer.length / 1024).toFixed(0)} KB)`,
    );

    const endTimes: number[] | undefined =
      data.alignment?.character_end_times_seconds;
    const dur = endTimes?.length
      ? endTimes[endTimes.length - 1]
      : (audioBuffer.length * 8) / 128_000;

    return { durationSec: dur, alignment: data.alignment ?? null };
  } catch (e: unknown) {
    console.log(
      `  Timestamps endpoint unavailable (${e instanceof Error ? e.message : e}), falling back...`,
    );
  }

  /* Fallback: regular TTS */
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs TTS ${res.status}: ${await res.text()}`);

  const audioBuffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(GEN, "narration.mp3"), audioBuffer);
  console.log(`  Audio saved (${(audioBuffer.length / 1024).toFixed(0)} KB)`);

  const dur = (audioBuffer.length * 8) / 128_000;
  return { durationSec: dur, alignment: null };
}

/* ────────────────────────────────────────────────── */
/*  Chunk timing from alignment or proportional       */
/* ────────────────────────────────────────────────── */

interface TimedChunk {
  text: string;
  startSec: number;
  endSec: number;
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
      const startCharIdx = Math.min(idx, charStarts.length - 1);
      const endCharIdx = Math.min(
        idx + text.length - 1,
        charEnds.length - 1,
      );
      result.push({
        text,
        startSec: charStarts[startCharIdx] ?? 0,
        endSec: (charEnds[endCharIdx] ?? 0) + 0.25,
      });
      search = idx + text.length;
    }
    if (result.length > 0) return result;
  }

  /* Proportional fallback */
  const totalWords = chunks.reduce(
    (s, c) => s + c.split(/\s+/).length,
    0,
  );
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

/* ────────────────────────────────────────────────── */
/*  Main                                              */
/* ────────────────────────────────────────────────── */

async function main() {
  const redditUrl =
    process.argv[2] ??
    "https://www.reddit.com/r/AmItheAsshole/comments/13xga9y/aita_for_uninviting_my_sister_to_my_wedding/";

  fs.mkdirSync(GEN, { recursive: true });

  /* ── 1a. Fetch post from Reddit ── */
  console.log("\n📥 Step 1a — Fetching Reddit post...");
  const post = await fetchRedditPost(redditUrl);
  console.log(`  Title : ${post.title}`);
  console.log(`  Body  : ${post.body.slice(0, 120)}...`);
  console.log(`  r/${post.subreddit} · u/${post.author}`);

  /* ── 1b. Firecrawl receipts ── */
  console.log("\n🔥 Step 1b — Searching related receipts with Firecrawl...");
  const receipts = await searchFirecrawlReceipts(
    `${post.title} reddit AITA wedding etiquette`,
  );
  receipts.forEach((r) => console.log(`  📎 ${r.title.slice(0, 60)}`));

  /* ── 2. Text processing ── */
  console.log("\n✂️  Step 2 — Chunking story...");
  const condensed = condense(post.body, 140);
  const chunks = chunkStory(condensed);
  console.log(`  Chunks: ${chunks.length}`);
  chunks.forEach((c, i) => console.log(`    [${i}] ${c.slice(0, 70)}`));

  /* ── 3. Build narration text ── */
  const hookLine = post.title
    .replace(/^AITA\s/i, "Am I the asshole ")
    .replace(/\??\s*$/, "?");
  const storyText = chunks.join(". ");
  const verdictLine = "The verdict? Not the asshole.";
  const oneLiner = "She stole the spotlight and called you selfish.";
  const ctaLine = "Was the verdict right? Drop yours below.";
  const fullNarration = `${hookLine} ${storyText} ${verdictLine} ${oneLiner} ${ctaLine}`;
  console.log(
    `\n  Narration: ${fullNarration.split(/\s+/).length} words`,
  );

  /* ── 4. ElevenLabs TTS ── */
  console.log("\n🎤 Step 3 — Generating narration with ElevenLabs...");
  const tts = await generateTTS(fullNarration);
  console.log(`  Duration: ${tts.durationSec.toFixed(1)}s`);

  /* ── 5. Timing ── */
  console.log("\n⏱️  Step 4 — Calculating timing...");
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
      : tts.durationSec;
  const verdictStartSec = storyEndSec + 0.5;
  const verdictDurSec = 6;
  const ctaStartSec = verdictStartSec + verdictDurSec;
  const ctaDurSec = 2.5;
  const totalSec = Math.max(55, ctaStartSec + ctaDurSec + 0.5);
  const totalFrames = Math.ceil(totalSec * FPS);

  console.log(`  Story   : 0 – ${storyEndSec.toFixed(1)}s`);
  console.log(`  Verdict : ${verdictStartSec.toFixed(1)}s`);
  console.log(`  CTA     : ${ctaStartSec.toFixed(1)}s`);
  console.log(`  Total   : ${totalSec.toFixed(1)}s (${totalFrames} frames)`);

  /* ── 6. Remotion props ── */
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
    verdictLabel: "NTA",
    verdictOneLiner: oneLiner,
    verdictStartFrame: Math.round(verdictStartSec * FPS),
    ctaText: ctaLine,
    ctaStartFrame: Math.round(ctaStartSec * FPS),
    narrationSrc: "generated/narration.mp3",
    audioOffsetFrames: Math.round(AUDIO_OFFSET_SEC * FPS),
  };

  /* ── 7. Bundle ── */
  console.log("\n📦 Step 5 — Bundling Remotion...");
  const entryPoint = path.resolve(ROOT, "remotion", "index.ts");
  const bundled = await bundle({
    entryPoint,
    publicDir: PUBLIC,
    onProgress: (pct: number) => {
      if (pct % 20 === 0) process.stdout.write(`  bundle: ${pct}%\r`);
    },
  });
  console.log("  Bundle complete.\n");

  /* ── 8. Render ── */
  const compositionId = "RedditStoryReel60";
  console.log(`🎬 Step 6 — Rendering "${compositionId}"...`);
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
      process.stdout.write(`  Rendering: ${Math.round(progress * 100)}%\r`);
    },
  });

  console.log(`\n\n✅ Story reel saved → ${outputPath}`);
  console.log(`   Duration : ~${totalSec.toFixed(0)}s`);
  console.log(`   Reddit   : ${redditUrl}`);
  console.log(`   Verdict  : NTA\n`);
}

main().catch((err) => {
  console.error("\n❌ Render failed:", err);
  process.exit(1);
});
