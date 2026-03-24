import { Composition } from "remotion";
import { DebateReel, type DebateReelProps } from "./DebateReel";
import {
  RedditStoryReel,
  type RedditStoryReelProps,
} from "./RedditStoryReel";

export const RemotionRoot: React.FC = () => {
  const debateDefaults: DebateReelProps = {
    hookText:
      "She hijacked the engagement party... with a pregnancy announcement.",
    subreddit: "AmItheAsshole",
    author: "throwaway_bride2026",
    setup:
      "Her sister grabbed the mic at HER engagement party to announce she's pregnant. Now she's uninvited from the wedding.",
    lines: [],
    verdictLabel: "NTA",
    verdictOneLiner: "She stole your spotlight and called YOU selfish.",
    verdictConfidence: 82,
    pettyScore: 7,
    redFlagCount: 3,
    cta: "Was the verdict right?",
  };

  const storyDefaults: RedditStoryReelProps = {
    subreddit: "AmItheAsshole",
    author: "throwaway_bride2026",
    title: "AITA for Uninviting My Sister to My Wedding",
    hookText: "Am I the asshole for uninviting my sister to my wedding?",
    chunks: [
      { text: "I'm getting married next month. My sister has always been competitive.", startFrame: 90, endFrame: 250 },
      { text: "At my engagement party she grabbed the mic and announced she was pregnant.", startFrame: 250, endFrame: 430 },
      { text: "The rest of the night became about her. I was devastated.", startFrame: 430, endFrame: 580 },
      { text: "She said I was being selfish and that a baby is bigger news than a wedding.", startFrame: 580, endFrame: 760 },
      { text: "I uninvited her. Our parents are threatening to boycott.", startFrame: 760, endFrame: 940 },
    ],
    debateMessages: [
      { displayName: "The Prosecutor", text: "OP went nuclear over one bad night. Family is permanent.", color: "#ef4444", startFrame: 1050, endFrame: 1200 },
      { displayName: "The Defense", text: "She literally hijacked the engagement party. NTA all day.", color: "#22c55e", startFrame: 1210, endFrame: 1360 },
    ],
    debateStartFrame: 1000,
    debateEndFrame: 1400,
    verdictLabel: "NTA",
    verdictOneLiner: "She stole your spotlight and called you selfish.",
    verdictStartFrame: 1450,
    verdictColor: "#22c55e",
    verdictConfidence: 82,
    verdictVoteSummary: "NTA 12 \u00B7 YTA 3 \u00B7 ESH 1",
    ctaText: "Do you agree? Drop your verdict below.",
    ctaStartFrame: 1600,
    narrationSrc: "",
    audioOffsetFrames: 15,
    hasVideoBackground: false,
  };

  return (
    <>
      <Composition
        id="RedditStoryReel60"
        component={RedditStoryReel}
        durationInFrames={90 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={storyDefaults}
      />
      <Composition
        id="DebateReel30"
        component={DebateReel}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={debateDefaults}
      />
      <Composition
        id="DebateReel"
        component={DebateReel}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={debateDefaults}
      />
    </>
  );
};
