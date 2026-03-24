import path from "path";
import { fileURLToPath } from "url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { SEEDED_CASES } from "../src/data/seeded-cases.js";
import type { DebateReelProps } from "../remotion/DebateReel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const caseIdx = parseInt(process.argv[2] || "0", 10);
  const seeded = SEEDED_CASES[caseIdx];
  if (!seeded) {
    console.error(`No seeded case at index ${caseIdx}. Available: 0-${SEEDED_CASES.length - 1}`);
    process.exit(1);
  }

  const { caseFile, debateScript } = seeded;
  console.log(`\n⚖️  MAIN CHARACTER COURT — Rendering reel for: "${caseFile.title}"\n`);

  const inputProps: DebateReelProps = {
    hookText: debateScript.hook,
    title: "Main Character Court",
    setup: debateScript.setup.join(" "),
    lines: debateScript.lines
      .filter((l) => l.speaker !== "clerk")
      .map((l) => ({
        speaker: l.speaker as "prosecutor" | "defense" | "comments",
        text: l.text,
        approxDurationSec: l.approxDurationSec,
      })),
    verdictLabel: debateScript.verdict.label,
    verdictOneLiner: debateScript.verdict.oneLiner,
    verdictConfidence: debateScript.verdict.confidence,
    pettyScore: debateScript.verdict.pettyScore,
    redFlagCount: debateScript.verdict.redFlagCount,
    cta: debateScript.cta,
  };

  console.log("📦 Bundling Remotion project...");
  const entryPoint = path.resolve(__dirname, "..", "remotion", "index.ts");
  const bundled = await bundle({
    entryPoint,
    onProgress: (pct) => {
      if (pct % 20 === 0) process.stdout.write(`  bundle: ${pct}%\r`);
    },
  });
  console.log("  Bundle complete.\n");

  const compositionId = "DebateReel";
  console.log(`🎬 Selecting composition "${compositionId}"...`);
  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
    inputProps,
  });

  const outputPath = path.resolve(
    __dirname,
    "..",
    `main-character-court-${caseFile.id}.mp4`
  );

  console.log(`🎥 Rendering to: ${outputPath}`);
  console.log(`   Resolution: ${composition.width}x${composition.height}`);
  console.log(`   Duration: ${composition.durationInFrames / composition.fps}s @ ${composition.fps}fps`);
  console.log("");

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      process.stdout.write(`  Rendering: ${pct}%\r`);
    },
  });

  console.log(`\n\n✅ Reel saved to: ${outputPath}`);
  console.log(`   Case: "${caseFile.title}"`);
  console.log(`   Verdict: ${debateScript.verdict.label} (${debateScript.verdict.confidence}% confidence)`);
  console.log(`   One-liner: "${debateScript.verdict.oneLiner}"\n`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
