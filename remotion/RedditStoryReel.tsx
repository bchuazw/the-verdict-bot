import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Sequence,
} from "remotion";
import { GameplayBackground } from "./components/GameplayBackground";
import { RedditPostCard, type StoryChunk } from "./components/RedditPostCard";

export interface RedditStoryReelProps {
  subreddit: string;
  author: string;
  title: string;
  hookText: string;
  chunks: StoryChunk[];
  verdictLabel: string;
  verdictOneLiner: string;
  verdictStartFrame: number;
  ctaText: string;
  ctaStartFrame: number;
  narrationSrc: string;
  audioOffsetFrames: number;
}

export const RedditStoryReel: React.FC<RedditStoryReelProps> = ({
  subreddit,
  author,
  title,
  hookText,
  chunks,
  verdictLabel,
  verdictOneLiner,
  verdictStartFrame,
  ctaText,
  ctaStartFrame,
  narrationSrc,
  audioOffsetFrames,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const isVerdictPhase = frame >= verdictStartFrame;
  const isCtaPhase = frame >= ctaStartFrame;

  // Card entrance (first ~18 frames)
  const cardEnter = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Card fades when verdict appears
  const cardOpacity = isVerdictPhase
    ? interpolate(frame, [verdictStartFrame, verdictStartFrame + 12], [1, 0], {
        extrapolateRight: "clamp",
      })
    : 1;

  // Verdict entrance
  const verdictEnter = isVerdictPhase
    ? interpolate(frame, [verdictStartFrame, verdictStartFrame + 14], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.back(1.2)),
      })
    : 0;

  // CTA entrance
  const ctaEnter = isCtaPhase
    ? interpolate(frame, [ctaStartFrame, ctaStartFrame + 10], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  const progress = frame / durationInFrames;

  const verdictColor =
    verdictLabel === "NTA"
      ? "#22c55e"
      : verdictLabel === "YTA"
        ? "#ef4444"
        : verdictLabel === "ESH"
          ? "#f59e0b"
          : "#3b82f6";

  return (
    <AbsoluteFill>
      <GameplayBackground />

      {/* Narration audio */}
      {narrationSrc && (
        <Sequence from={audioOffsetFrames}>
          <Audio src={staticFile(narrationSrc)} volume={0.92} />
        </Sequence>
      )}

      {/* Subtle ambient bed */}
      <Audio src={staticFile("audio/ambient-music.wav")} volume={0.06} />

      {/* Hook text (first 3 seconds, overlaid on card) */}
      {frame < 90 && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            right: 60,
            opacity: interpolate(frame, [0, 10, 75, 90], [0, 1, 1, 0], {
              extrapolateRight: "clamp",
            }),
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              borderRadius: 12,
              padding: "16px 20px",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#ff4500",
                fontFamily: "system-ui, sans-serif",
                marginBottom: 6,
              }}
            >
              AITAH?!
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.25,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {hookText}
            </div>
          </div>
        </div>
      )}

      {/* Reddit story card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: cardOpacity * cardEnter,
          transform: `translateY(${interpolate(cardEnter, [0, 1], [30, 0])}px)`,
        }}
      >
        <RedditPostCard
          subreddit={subreddit}
          author={author}
          title={title}
          chunks={chunks}
        />
      </div>

      {/* Quick "Receipts loaded via Firecrawl" chip before verdict */}
      {frame >= verdictStartFrame - 240 && frame < verdictStartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: 200,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: interpolate(
              frame,
              [
                verdictStartFrame - 240,
                verdictStartFrame - 220,
                verdictStartFrame - 30,
                verdictStartFrame,
              ],
              [0, 1, 1, 0],
              { extrapolateRight: "clamp" },
            ),
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.65)",
              borderRadius: 20,
              padding: "8px 18px",
              fontSize: 16,
              color: "#fbbf24",
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
              backdropFilter: "blur(6px)",
            }}
          >
            🔥 Receipts loaded via Firecrawl
          </div>
        </div>
      )}

      {/* Verdict overlay */}
      {verdictEnter > 0 && (
        <AbsoluteFill
          style={{
            opacity: verdictEnter,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
              padding: "0 70px",
              transform: `scale(${interpolate(verdictEnter, [0, 1], [0.85, 1])})`,
            }}
          >
            <div
              style={{
                fontSize: 130,
                fontWeight: 900,
                color: verdictColor,
                letterSpacing: -5,
                textShadow: `0 4px 40px ${verdictColor}66`,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {verdictLabel}
            </div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 600,
                color: "#fff",
                textAlign: "center",
                lineHeight: 1.3,
                textShadow: "0 2px 12px rgba(0,0,0,0.7)",
                fontFamily: "system-ui, sans-serif",
                maxWidth: 800,
              }}
            >
              {verdictOneLiner}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* CTA */}
      {ctaEnter > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 130,
            left: 70,
            right: 70,
            opacity: ctaEnter,
            textAlign: "center",
            transform: `translateY(${interpolate(ctaEnter, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#fbbf24",
              textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {ctaText}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #ff4500, #fbbf24)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
