import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioDir = path.resolve(__dirname, "..", "public", "audio");

function writeWav(filePath: string, sampleRate: number, samples: Float32Array) {
  const numSamples = samples.length;
  const bitsPerSample = 16;
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

function generateAmbientMusic(durationSec: number, sampleRate = 44100): Float32Array {
  const numSamples = Math.floor(durationSec * sampleRate);
  const samples = new Float32Array(numSamples);

  const freqs = [55, 82.5, 110, 165, 220];
  const amps = [0.12, 0.08, 0.06, 0.03, 0.02];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    for (let f = 0; f < freqs.length; f++) {
      const lfo = 1 + 0.3 * Math.sin(2 * Math.PI * (0.05 + f * 0.02) * t);
      val += amps[f] * Math.sin(2 * Math.PI * freqs[f] * lfo * t);
    }
    const pad = 0.03 * Math.sin(2 * Math.PI * 0.5 * t) * Math.sin(2 * Math.PI * 330 * t);
    val += pad;
    const fadeIn = Math.min(1, t / 1.5);
    const fadeOut = Math.min(1, (durationSec - t) / 2);
    samples[i] = val * fadeIn * fadeOut * 0.7;
  }
  return samples;
}

function generateGavelHit(sampleRate = 44100): Float32Array {
  const duration = 0.4;
  const numSamples = Math.floor(duration * sampleRate);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 15);
    const hit = Math.sin(2 * Math.PI * 120 * t) * 0.8 +
                Math.sin(2 * Math.PI * 80 * t) * 0.5 +
                Math.sin(2 * Math.PI * 200 * t) * 0.3;
    const noise = (Math.random() * 2 - 1) * 0.4 * Math.exp(-t * 30);
    samples[i] = (hit * decay + noise) * 0.6;
  }
  return samples;
}

function generateWhoosh(sampleRate = 44100): Float32Array {
  const duration = 0.3;
  const numSamples = Math.floor(duration * sampleRate);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.sin(Math.PI * t / duration);
    const noise = (Math.random() * 2 - 1) * env * 0.35;
    const sweep = Math.sin(2 * Math.PI * (200 + 2000 * t / duration) * t) * env * 0.15;
    samples[i] = noise + sweep;
  }
  return samples;
}

function generatePing(sampleRate = 44100): Float32Array {
  const duration = 0.25;
  const numSamples = Math.floor(duration * sampleRate);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 12);
    const tone = Math.sin(2 * Math.PI * 880 * t) * 0.3 +
                 Math.sin(2 * Math.PI * 1320 * t) * 0.15;
    samples[i] = tone * decay;
  }
  return samples;
}

fs.mkdirSync(audioDir, { recursive: true });

console.log("Generating ambient music (60s)...");
writeWav(path.join(audioDir, "ambient-music.wav"), 44100, generateAmbientMusic(60));

console.log("Generating gavel hit SFX...");
writeWav(path.join(audioDir, "gavel-hit.wav"), 44100, generateGavelHit());

console.log("Generating whoosh SFX...");
writeWav(path.join(audioDir, "whoosh.wav"), 44100, generateWhoosh());

console.log("Generating evidence ping SFX...");
writeWav(path.join(audioDir, "ping.wav"), 44100, generatePing());

console.log("All audio assets generated in public/audio/");
