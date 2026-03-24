import { useCurrentFrame, interpolate } from "remotion";

export interface StoryChunk {
  text: string;
  startFrame: number;
  endFrame: number;
}

interface Props {
  subreddit: string;
  author: string;
  title: string;
  chunks: StoryChunk[];
}

export const RedditPostCard: React.FC<Props> = ({
  subreddit,
  author,
  title,
  chunks,
}) => {
  const frame = useCurrentFrame();

  const activeIdx = chunks.findIndex(
    (c) => frame >= c.startFrame && frame < c.endFrame,
  );
  const lastRevealed = chunks.reduce(
    (max, c, i) => (frame >= c.startFrame ? i : max),
    -1,
  );
  const safeIdx = activeIdx >= 0 ? activeIdx : lastRevealed;

  const F = "system-ui, sans-serif";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 36px 180px",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "rgba(255, 255, 255, 0.97)",
          borderRadius: 18,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 50px rgba(0,0,0,0.55)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              background: "#ff4500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              fontFamily: F,
            }}
          >
            r/
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#1a1a1b",
                fontFamily: F,
              }}
            >
              r/{subreddit}
            </div>
            <div style={{ fontSize: 11, color: "#7c7c7c", fontFamily: F }}>
              u/{author}
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            padding: "10px 18px 6px",
            fontSize: 22,
            fontWeight: 700,
            color: "#1a1a1b",
            lineHeight: 1.25,
            fontFamily: F,
          }}
        >
          {title}
        </div>

        {/* Engagement bar */}
        <div
          style={{
            padding: "6px 18px 8px",
            display: "flex",
            gap: 14,
            flexShrink: 0,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {[
            { icon: "\u2B06", label: "95K" },
            { icon: "\uD83D\uDCAC", label: "22K" },
            { icon: "\uD83D\uDD17", label: "Share" },
          ].map((b, i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                color: "#7c7c7c",
                fontFamily: F,
                fontWeight: 600,
              }}
            >
              {b.icon} {b.label}
            </span>
          ))}
        </div>

        {/* Body — line-by-line reveal, no scrolling */}
        <div style={{ padding: "8px 18px 16px" }}>
          {chunks.map((chunk, i) => {
            const revealed = frame >= chunk.startFrame;
            const isActive = i === safeIdx;
            const isPast = safeIdx >= 0 && i < safeIdx;

            const reveal = revealed
              ? interpolate(
                  frame,
                  [chunk.startFrame, chunk.startFrame + 8],
                  [0, 1],
                  { extrapolateRight: "clamp" },
                )
              : 0;

            if (!revealed) return null;

            return (
              <div
                key={i}
                style={{
                  fontSize: 20,
                  lineHeight: 1.5,
                  color: isActive ? "#1a1a1b" : isPast ? "#4a4a4b" : "#9a9a9b",
                  fontWeight: isActive ? 600 : 400,
                  padding: "4px 8px",
                  marginBottom: 2,
                  borderRadius: 5,
                  background: isActive
                    ? "rgba(255, 69, 0, 0.08)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #ff4500"
                    : "3px solid transparent",
                  fontFamily: F,
                  opacity: reveal,
                  transform: `translateY(${interpolate(reveal, [0, 1], [6, 0])}px)`,
                }}
              >
                {chunk.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
