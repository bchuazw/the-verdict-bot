import { Composition } from "remotion";
import { DebateReel, type DebateReelProps } from "./DebateReel";
import {
  RedditStoryReel,
  type RedditStoryReelProps,
} from "./RedditStoryReel";

export const RemotionRoot: React.FC = () => {
  /* ── Legacy debate reel defaults ── */
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

  /* ── New story reel defaults (for Remotion preview) ── */
  const storyDefaults: RedditStoryReelProps = {
    subreddit: "AmItheAsshole",
    author: "throwaway_bride2026",
    title: "AITA for Uninviting My Sister to My Wedding",
    hookText: "Am I the asshole for uninviting my sister to my wedding?",
    chunks: [
      {
        text: "I'm getting married next month. My sister has always been competitive.",
        startFrame: 90,
        endFrame: 250,
      },
      {
        text: "At my engagement party she grabbed the mic during toasts and announced she was pregnant.",
        startFrame: 250,
        endFrame: 430,
      },
      {
        text: "The rest of the night became about her. I was devastated.",
        startFrame: 430,
        endFrame: 580,
      },
      {
        text: "When I confronted her, she said I was being selfish and that a baby is bigger news than a wedding.",
        startFrame: 580,
        endFrame: 760,
      },
      {
        text: "I uninvited her from the wedding. Our parents are threatening to boycott if she isn't reinvited.",
        startFrame: 760,
        endFrame: 940,
      },
      {
        text: "My fiancé supports me completely. He says she showed her true colors.",
        startFrame: 940,
        endFrame: 1100,
      },
      {
        text: "I don't want drama on my wedding day. But I also don't want to lose my whole family over this.",
        startFrame: 1100,
        endFrame: 1300,
      },
    ],
    verdictLabel: "NTA",
    verdictOneLiner: "She stole your spotlight and called you selfish.",
    verdictStartFrame: 1500,
    ctaText: "Was the verdict right? Drop yours below.",
    ctaStartFrame: 1680,
    narrationSrc: "",
    audioOffsetFrames: 15,
  };

  return (
    <>
      {/* ─── Primary: Reddit Story Reel ─── */}
      <Composition
        id="RedditStoryReel60"
        component={RedditStoryReel}
        durationInFrames={90 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={storyDefaults}
      />

      {/* ─── Legacy debate reels ─── */}
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
