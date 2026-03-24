import {
  AbsoluteFill,
  useVideoConfig,
  Sequence,
  Audio,
  staticFile,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { Background } from "./components/Background";
import { HookCard } from "./components/HookCard";
import { SetupCard } from "./components/SetupCard";
import { SpeakerCard } from "./components/SpeakerCard";
import { VerdictCard } from "./components/VerdictCard";
import { CtaCard } from "./components/CtaCard";

export interface DebateLineInput {
  speaker: "prosecutor" | "defense" | "comments" | "clerk";
  text: string;
  approxDurationSec: number;
}

export interface DebateReelProps {
  hookText: string;
  subreddit?: string;
  author?: string;
  setup: string;
  lines: DebateLineInput[];
  verdictLabel: string;
  verdictOneLiner: string;
  verdictConfidence: number;
  pettyScore: number;
  redFlagCount: number;
  cta: string;
}

export const DebateReel: React.FC<DebateReelProps> = ({
  hookText,
  subreddit,
  author,
  setup,
  lines,
  verdictLabel,
  verdictOneLiner,
  verdictConfidence,
  pettyScore,
  redFlagCount,
  cta,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const totalSec = durationInFrames / fps;

  // Hook-first timing: hook(1.5s) → setup(3.5s) → debate → verdict(5s) → cta(2s)
  const hookDur = 1.5;
  const setupDur = 3.5;
  const verdictDur = 5;
  const ctaDur = 2;

  const totalLineSec = lines.reduce((s, l) => s + l.approxDurationSec, 0);
  const availableDebateSec = totalSec - hookDur - setupDur - verdictDur - ctaDur;
  const timeScale = totalLineSec > 0 ? availableDebateSec / totalLineSec : 1;

  let debateOffset = hookDur + setupDur;
  const debateSegments = lines.map((line) => {
    const dur = Math.max(1.8, line.approxDurationSec * timeScale);
    const seg = { ...line, startSec: debateOffset, durationSec: dur };
    debateOffset += dur;
    return seg;
  });

  const verdictStart = debateOffset;
  const ctaStart = verdictStart + verdictDur;

  // Progress bar
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill>
      {/* Layer 1: Kinetic background */}
      <Background />

      {/* Layer 2: Audio tracks */}
      <Audio src={staticFile("audio/ambient-music.wav")} volume={0.15} />
      <Sequence from={Math.round(verdictStart * fps)} durationInFrames={30}>
        <Audio src={staticFile("audio/gavel-hit.wav")} volume={0.6} />
      </Sequence>

      {/* Layer 3: Content scenes */}
      <Sequence from={0} durationInFrames={Math.round(hookDur * fps)}>
        <HookCard text={hookText} subreddit={subreddit} author={author} />
      </Sequence>

      <Sequence from={Math.round(hookDur * fps)} durationInFrames={Math.round(setupDur * fps)}>
        <Audio src={staticFile("audio/whoosh.wav")} volume={0.3} />
        <SetupCard text={setup} />
      </Sequence>

      {debateSegments.map((seg, i) => (
        <Sequence
          key={i}
          from={Math.round(seg.startSec * fps)}
          durationInFrames={Math.round(seg.durationSec * fps)}
        >
          {i % 3 === 0 && i > 0 && (
            <Audio src={staticFile("audio/ping.wav")} volume={0.2} />
          )}
          <SpeakerCard speaker={seg.speaker} text={seg.text} index={i} />
        </Sequence>
      ))}

      <Sequence from={Math.round(verdictStart * fps)} durationInFrames={Math.round(verdictDur * fps)}>
        <VerdictCard
          label={verdictLabel}
          oneLiner={verdictOneLiner}
          confidence={verdictConfidence}
          pettyScore={pettyScore}
          redFlagCount={redFlagCount}
        />
      </Sequence>

      <Sequence from={Math.round(ctaStart * fps)} durationInFrames={Math.round(ctaDur * fps)}>
        <CtaCard text={cta} />
      </Sequence>

      {/* Layer 4: Progress bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #fbbf24, #d97706)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
