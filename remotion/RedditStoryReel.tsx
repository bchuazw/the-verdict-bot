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
  verdictConfidence: number;
  verdictVoteSummary: string;
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
    subreddit, author, title, hookText, chunks,
    debateMessages, debateStartFrame, debateEndFrame,
    verdictLabel, verdictOneLiner, verdictStartFrame, verdictColor,
    verdictConfidence, verdictVoteSummary,
    ctaText, ctaStartFrame,
    narrationSrc, audioOffsetFrames, hasVideoBackground,
  } = props;

  const isVerdictPhase = frame >= verdictStartFrame;
  const isCtaPhase = frame >= ctaStartFrame;
  const F = "system-ui, sans-serif";

  /* ─── Card entrance / exit ─── */
  const cardEnter = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cardFade =
    frame >= debateStartFrame - 12
      ? interpolate(frame, [debateStartFrame - 12, debateStartFrame], [1, 0], {
          extrapolateRight: "clamp",
        })
      : 1;

  /* ─── Verdict animations (staggered) ─── */
  const vf = frame - verdictStartFrame;
  const darkFlash = isVerdictPhase
    ? interpolate(vf, [0, 6, 18], [0, 0.9, 0.7], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      })
    : 0;
  const headerEnt = isVerdictPhase
    ? interpolate(vf, [8, 22], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;
  const iconEnt = isVerdictPhase
    ? interpolate(vf, [18, 32], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: Easing.out(Easing.back(1.8)),
      })
    : 0;
  const labelSlam = isVerdictPhase
    ? interpolate(vf, [28, 42], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: Easing.out(Easing.back(1.5)),
      })
    : 0;
  const barEnt = isVerdictPhase
    ? interpolate(vf, [42, 58], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      })
    : 0;
  const confEnt = isVerdictPhase
    ? interpolate(vf, [50, 65], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;
  const voteEnt = isVerdictPhase
    ? interpolate(vf, [58, 72], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;
  const oneEnt = isVerdictPhase
    ? interpolate(vf, [70, 85], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;
  const glowP = vf > 42 ? 1 + 0.06 * Math.sin(((vf - 42) / fps) * Math.PI * 3) : 1;

  /* ─── CTA ─── */
  const ctaEnt = isCtaPhase
    ? interpolate(frame, [ctaStartFrame, ctaStartFrame + 12], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  const progress = frame / durationInFrames;

  const verdictIcon =
    verdictLabel === "YTA"
      ? "\uD83D\uDC46"
      : verdictLabel === "NTA"
        ? "\u274C"
        : verdictLabel === "ESH"
          ? "\uD83E\uDD37"
          : "\u2753";

  return (
    <AbsoluteFill>
      {/* ── Background ── */}
      {hasVideoBackground ? (
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile("video/parkour-bg.mp4")}
            style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }}
            volume={0}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
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
      <Sequence from={verdictStartFrame + 28}>
        <Audio src={staticFile("audio/gavel-hit.wav")} volume={0.75} />
      </Sequence>

      {/* ── HOOK ── */}
      {frame < 80 && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 40,
            right: 40,
            opacity: interpolate(frame, [0, 8, 60, 78], [0, 1, 1, 0], {
              extrapolateRight: "clamp",
            }),
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "rgba(26,26,27,0.92)",
              borderRadius: 16,
              padding: "16px 22px",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,69,0,0.35)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: "#ff4500",
                fontFamily: F,
                marginBottom: 8,
                letterSpacing: 2,
              }}
            >
              AITAH?!
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.25,
                fontFamily: F,
              }}
            >
              {hookText}
            </div>
          </div>
        </div>
      )}

      {/* ── STORY CARD ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: cardFade * cardEnter,
          transform: `translateY(${interpolate(cardEnter, [0, 1], [25, 0])}px)`,
        }}
      >
        <RedditPostCard subreddit={subreddit} author={author} title={title} chunks={chunks} />
      </div>

      {/* ── DEBATE ── */}
      <DebateOverlay
        messages={debateMessages}
        sectionStartFrame={debateStartFrame}
        sectionEndFrame={debateEndFrame}
      />

      {/* ── VERDICT ── */}
      {isVerdictPhase && (
        <AbsoluteFill>
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${darkFlash})` }} />

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              padding: "0 50px",
            }}
          >
            {/* "THE VERDICT IS IN" */}
            <div
              style={{
                opacity: headerEnt,
                transform: `translateY(${interpolate(headerEnt, [0, 1], [-20, 0])}px)`,
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: 10,
                fontFamily: F,
                textShadow: "0 2px 24px rgba(0,0,0,0.9)",
              }}
            >
              THE VERDICT IS IN
            </div>

            {/* Visual indicator icon */}
            <div
              style={{
                opacity: iconEnt,
                transform: `scale(${interpolate(iconEnt, [0, 1], [0.3, 1])})`,
                fontSize: 80,
                lineHeight: 1,
              }}
            >
              {verdictIcon}
            </div>

            {/* Giant label */}
            <div
              style={{
                opacity: labelSlam,
                transform: `scale(${interpolate(labelSlam, [0, 1], [0.2, 1]) * glowP})`,
                fontSize: 160,
                fontWeight: 900,
                color: verdictColor,
                fontFamily: F,
                letterSpacing: -4,
                lineHeight: 1,
                textShadow: `0 0 ${50 * glowP}px ${verdictColor}99, 0 0 80px ${verdictColor}44, 0 6px 30px rgba(0,0,0,0.8)`,
              }}
            >
              {verdictLabel}
            </div>

            {/* Gradient bar */}
            <div
              style={{
                width: interpolate(barEnt, [0, 1], [0, 500]),
                height: 4,
                background: `linear-gradient(90deg, transparent, ${verdictColor}, transparent)`,
                borderRadius: 2,
                boxShadow: `0 0 20px ${verdictColor}66`,
              }}
            />

            {/* Confidence */}
            <div
              style={{
                opacity: confEnt,
                transform: `translateY(${interpolate(confEnt, [0, 1], [12, 0])}px)`,
                fontSize: 40,
                fontWeight: 800,
                color: verdictColor,
                fontFamily: F,
                textShadow: `0 2px 16px ${verdictColor}66`,
              }}
            >
              {verdictConfidence}% confidence
            </div>

            {/* Vote summary */}
            <div
              style={{
                opacity: voteEnt,
                transform: `translateY(${interpolate(voteEnt, [0, 1], [10, 0])}px)`,
                fontSize: 20,
                fontWeight: 600,
                color: "#a0a0a0",
                fontFamily: F,
                letterSpacing: 2,
                textShadow: "0 2px 10px rgba(0,0,0,0.7)",
              }}
            >
              {verdictVoteSummary}
            </div>

            {/* One-liner */}
            <div
              style={{
                opacity: oneEnt,
                transform: `translateY(${interpolate(oneEnt, [0, 1], [14, 0])}px)`,
                fontSize: 32,
                fontWeight: 600,
                color: "#fff",
                textAlign: "center",
                lineHeight: 1.35,
                textShadow: "0 2px 20px rgba(0,0,0,0.85)",
                fontFamily: F,
                maxWidth: 860,
                marginTop: 4,
              }}
            >
              {verdictOneLiner}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── CTA ── */}
      {ctaEnt > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 110,
            left: 50,
            right: 50,
            opacity: ctaEnt,
            textAlign: "center",
            transform: `translateY(${interpolate(ctaEnt, [0, 1], [16, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#fbbf24",
              textShadow: "0 2px 16px rgba(0,0,0,0.85)",
              fontFamily: F,
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
