import { bundle } from "@remotion/bundler";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.resolve(ROOT, "public");
const OUT = path.resolve(ROOT, "remotion-bundle");

console.log("Pre-bundling Remotion for Docker...");

const bundled = await bundle({
  entryPoint: path.resolve(ROOT, "remotion", "index.ts"),
  publicDir: PUBLIC,
  outDir: OUT,
  onProgress: (pct: number) => {
    if (pct % 25 === 0) process.stdout.write(`  bundle: ${pct}%\r`);
  },
});

console.log(`\nPre-built bundle saved to: ${bundled}`);
