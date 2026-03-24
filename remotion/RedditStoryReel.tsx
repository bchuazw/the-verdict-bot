import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Sequence,
} from "remotion";
import { GameplayBackground } from "./components/GameplayBackground";
import { RedditPostCard, type StoryChunk } from "./components/RedditPostCard";
import {
  DebateOverlay,
  type VideoDebateMessage,
} from "./components/DebateOverlay";

export interface RedditStoryReelProps {
  subreddit: string;
  author: string;
  title: string;
  hookText: string;
  chunks: StoryChunk[];
  debateMessages: VideoDebateMessage[];
  debateStartFrame: number;
  debateEndFrame: number;
  verdictLabel: string;
  verdictOneLiner: string;
  verdictStartFrame: number;
  verdictColor: string;
  ctaText: string;
  ctaStartFrame: number;
  narrationSrc: string;
  audioOffsetFrames: number;
  hasVideoBackground: boolean;
}

export const RedditStoryReel: React.FC<RedditStoryReelProps> = (props) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const {
    subreddit,
    author,
    title,
    hookText,
    chunks,
    debateMessages,
    debateStartFrame,
    debateEndFrame,
    verdictLabel,
    verdictOneLiner,
    verdictStartFrame,
    verdictColor,
    ctaText,
    ctaStartFrame,
    narrationSrc,
    audioOffsetFrames,
    hasVideoBackground,
  } = props;

  const isVerdictPhase = frame >= verdictStartFrame;
  const isCtaPhase = frame >= ctaStartFrame;

  /* ─── Card entrance / exit ─── */
  const cardEnter = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cardFade =
    frame >= debateStartFrame - 15
      ? interpolate(
          frame,
          [debateStartFrame - 15, debateStartFrame],
          [1, 0],
          { extrapolateRight: "clamp" },
        )
      : 1;

  /* ─── Verdict animations ─── */
  const vf = frame - verdictStartFrame;
  const darkFlash = isVerdictPhase
    ? interpolate(vf, [0, 6, 18], [0, 0.88, 0.65], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      })
    : 0;
  const headerEnter = isVerdictPhase
    ? interpolate(vf, [8, 22], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;
  const labelSlam = isVerdictPhase
    ? interpolate(vf, [22, 38], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: Easing.out(Easing.back(1.6)),
      })
    : 0;
  const barGrow = isVerdictPhase
    ? interpolate(vf, [35, 50], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      })
    : 0;
  const oneLineEnter = isVerdictPhase
    ? interpolate(vf, [45, 60], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;
  const glowPulse =
    vf > 38
      ? 1 + 0.08 * Math.sin(((vf - 38) / fps) * Math.PI * 4)
      : 1;

  /* ─── CTA ─── */
  const ctaEnter = isCtaPhase
    ? interpolate(frame, [ctaStartFrame, ctaStartFrame + 12], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill>
      {/* ── Background ── */}
      {hasVideoBackground ? (
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile("video/parkour-bg.mp4")}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            volume={0}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.30)",
            }}
          />
        </AbsoluteFill>
      ) : (
        <GameplayBackground />
      )}

      {/* ── Audio ── */}
      {narrationSrc && (
        <Sequence from={audioOffsetFrames}>
          <Audio src={staticFile(narrationSrc)} volume={0.92} />
        </Sequence>
      )}
      <Audio src={staticFile("audio/ambient-music.wav")} volume={0.04} />
      <Sequence from={verdictStartFrame + 20}>
        <Audio src={staticFile("audio/gavel-hit.wav")} volume={0.75} />
      </Sequence>

      {/* ── HOOK (first ~3s) ── */}
      {frame < 90 && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 48,
            right: 48,
            opacity: interpolate(frame, [0, 10, 68, 88], [0, 1, 1, 0], {
              extrapolateRight: "clamp",
            }),
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.78)",
              borderRadius: 16,
              padding: "18px 24px",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,69,0,0.3)",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#ff4500",
                fontFamily: "system-ui, sans-serif",
                marginBottom: 8,
                letterSpacing: 2,
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

      {/* ── STORY CARD — line-by-line reveal ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: cardFade * cardEnter,
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

      {/* ── DEBATE SECTION ── */}
      <DebateOverlay
        messages={debateMessages}
        sectionStartFrame={debateStartFrame}
        sectionEndFrame={debateEndFrame}
      />

      {/* ── VERDICT ── */}
      {isVerdictPhase && (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `rgba(0, 0, 0, ${darkFlash})`,
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 28,
              padding: "0 60px",
            }}
          >
            {/* "THE VERDICT IS IN" */}
            <div
              style={{
                opacity: headerEnter,
                transform: `translateY(${interpolate(headerEnter, [0, 1], [-25, 0])}px)`,
                fontSize: 24,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: 10,
                fontFamily: "system-ui, sans-serif",
                textShadow: "0 2px 24px rgba(0,0,0,0.9)",
              }}
            >
              THE VERDICT IS IN
            </div>

            {/* Giant label */}
            <div
              style={{
                opacity: labelSlam,
                transform: `scale(${interpolate(labelSlam, [0, 1], [0.2, 1]) * glowPulse})`,
                fontSize: 170,
                fontWeight: 900,
                color: verdictColor,
                fontFamily: "system-ui, sans-serif",
                letterSpacing: -4,
                lineHeight: 1,
                textShadow: `0 0 ${50 * glowPulse}px ${verdictColor}99, 0 0 100px ${verdictColor}44, 0 6px 40px rgba(0,0,0,0.8)`,
              }}
            >
              {verdictLabel}
            </div>

            {/* Animated gradient bar */}
            <div
              style={{
                width: interpolate(barGrow, [0, 1], [0, 500]),
                height: 4,
                background: `linear-gradient(90deg, transparent, ${verdictColor}, transparent)`,
                borderRadius: 2,
                boxShadow: `0 0 20px ${verdictColor}66`,
              }}
            />

            {/* One-liner */}
            <div
              style={{
                opacity: oneLineEnter,
                transform: `translateY(${interpolate(oneLineEnter, [0, 1], [18, 0])}px)`,
                fontSize: 36,
                fontWeight: 600,
                color: "#fff",
                textAlign: "center",
                lineHeight: 1.35,
                textShadow: "0 2px 20px rgba(0,0,0,0.85)",
                fontFamily: "system-ui, sans-serif",
                maxWidth: 880,
              }}
            >
              {verdictOneLiner}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── CTA ── */}
      {ctaEnter > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 60,
            right: 60,
            opacity: ctaEnter,
            textAlign: "center",
            transform: `translateY(${interpolate(ctaEnter, [0, 1], [18, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#fbbf24",
              textShadow: "0 2px 16px rgba(0,0,0,0.85)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {ctaText}
          </div>
        </div>
      )}

      {/* ── Progress bar ── */}
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
