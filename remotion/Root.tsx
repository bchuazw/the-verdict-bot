import { Composition } from "remotion";
import { DebateReel, type DebateReelProps } from "./DebateReel";

export const RemotionRoot: React.FC = () => {
  const defaultProps: DebateReelProps = {
    hookText: "Court is now in session.",
    title: "Main Character Court",
    setup: "Loading case...",
    lines: [],
    verdictLabel: "NTA",
    verdictOneLiner: "The court has spoken.",
    verdictConfidence: 85,
    pettyScore: 5,
    redFlagCount: 2,
    cta: "Was the court right?",
  };

  return (
    <>
      <Composition
        id="DebateReel"
        component={DebateReel}
        durationInFrames={35 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="DebateReel20"
        component={DebateReel}
        durationInFrames={20 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="DebateReel60"
        component={DebateReel}
        durationInFrames={60 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
    </>
  );
};
