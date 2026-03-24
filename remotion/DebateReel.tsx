import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  spring,
} from "remotion";
import { Background } from "./components/Background";
import { TitleCard } from "./components/TitleCard";
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
  title: string;
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
  title,
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
  const totalSec = durationInFrames / fps;

  const hookDur = 3;
  const setupDur = 4;

  const totalLineSec = lines.reduce(
    (sum, l) => sum + l.approxDurationSec,
    0
  );
  const availableDebateSec = totalSec - hookDur - setupDur - 7 - 2;
  const timeScale =
    totalLineSec > 0 ? availableDebateSec / totalLineSec : 1;

  let debateOffset = hookDur + setupDur;
  const debateSegments = lines.map((line) => {
    const dur = Math.max(2, line.approxDurationSec * timeScale);
    const seg = { ...line, startSec: debateOffset, durationSec: dur };
    debateOffset += dur;
    return seg;
  });

  const verdictStart = debateOffset;
  const verdictDur = 6;
  const ctaStart = verdictStart + verdictDur;
  const ctaDur = Math.max(1, totalSec - ctaStart);

  return (
    <AbsoluteFill>
      <Background />

      <Sequence from={0} durationInFrames={hookDur * fps}>
        <TitleCard hookText={hookText} title={title} />
      </Sequence>

      <Sequence
        from={hookDur * fps}
        durationInFrames={setupDur * fps}
      >
        <SetupCard text={setup} />
      </Sequence>

      {debateSegments.map((seg, i) => (
        <Sequence
          key={i}
          from={Math.round(seg.startSec * fps)}
          durationInFrames={Math.round(seg.durationSec * fps)}
        >
          <SpeakerCard
            speaker={seg.speaker}
            text={seg.text}
            index={i}
          />
        </Sequence>
      ))}

      <Sequence
        from={Math.round(verdictStart * fps)}
        durationInFrames={verdictDur * fps}
      >
        <VerdictCard
          label={verdictLabel}
          oneLiner={verdictOneLiner}
          confidence={verdictConfidence}
          pettyScore={pettyScore}
          redFlagCount={redFlagCount}
        />
      </Sequence>

      <Sequence
        from={Math.round(ctaStart * fps)}
        durationInFrames={Math.round(ctaDur * fps)}
      >
        <CtaCard text={cta} />
      </Sequence>
    </AbsoluteFill>
  );
};
