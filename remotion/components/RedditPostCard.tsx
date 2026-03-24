import { useCurrentFrame, interpolate, Easing } from "remotion";

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

const CHUNK_HEIGHT = 80;
const VIEWPORT_CHUNKS = 7;
const SCROLL_LEAD = 2;

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

  const maxScroll = Math.max(
    0,
    (chunks.length - VIEWPORT_CHUNKS) * CHUNK_HEIGHT,
  );

  const scrollTargets = chunks.map((_, i) =>
    Math.min(Math.max(0, (i - SCROLL_LEAD) * CHUNK_HEIGHT), maxScroll),
  );
  const kfFrames: number[] = [0];
  const kfValues: number[] = [0];

  for (let i = 0; i < chunks.length; i++) {
    const target = scrollTargets[i];
    const prev = kfValues[kfValues.length - 1];
    if (target !== prev) {
      kfFrames.push(
        Math.max(
          chunks[i].startFrame - 1,
          kfFrames[kfFrames.length - 1] + 1,
        ),
      );
      kfValues.push(prev);
      kfFrames.push(chunks[i].startFrame + 12);
      kfValues.push(target);
    }
  }
  const lastEnd = chunks[chunks.length - 1]?.endFrame ?? 1;
  kfFrames.push(lastEnd);
  kfValues.push(kfValues[kfValues.length - 1]);

  const scrollY = interpolate(frame, kfFrames, kfValues, {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 48,
        right: 48,
        bottom: 220,
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
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: "#ff4500",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          r/
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1a1a1b",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            r/{subreddit}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#7c7c7c",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            u/{author}
          </div>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          padding: "12px 20px 6px",
          fontSize: 24,
          fontWeight: 700,
          color: "#1a1a1b",
          lineHeight: 1.22,
          fontFamily: "system-ui, sans-serif",
          flexShrink: 0,
        }}
      >
        {title}
      </div>

      {/* Body — line-by-line reveal */}
      <div
        style={{
          flex: 1,
          padding: "6px 20px 18px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ transform: `translateY(-${scrollY}px)` }}>
          {chunks.map((chunk, i) => {
            const isRevealed = frame >= chunk.startFrame;
            const isActive = i === safeIdx;
            const isPast = safeIdx >= 0 && i < safeIdx;

            const revealProgress = isRevealed
              ? interpolate(
                  frame,
                  [chunk.startFrame, chunk.startFrame + 10],
                  [0, 1],
                  { extrapolateRight: "clamp" },
                )
              : 0;

            return (
              <div
                key={i}
                style={{
                  fontSize: 22,
                  lineHeight: 1.42,
                  color: isActive
                    ? "#1a1a1b"
                    : isPast
                      ? "#4a4a4b"
                      : "#9a9a9b",
                  fontWeight: isActive ? 600 : 400,
                  padding: "6px 10px",
                  marginBottom: 4,
                  borderRadius: 6,
                  background: isActive
                    ? "rgba(255, 69, 0, 0.08)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #ff4500"
                    : "3px solid transparent",
                  fontFamily: "system-ui, sans-serif",
                  opacity: revealProgress,
                  transform: `translateY(${interpolate(revealProgress, [0, 1], [10, 0])}px)`,
                }}
              >
                {chunk.text}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom metadata */}
      <div
        style={{
          padding: "10px 20px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: 18,
          fontSize: 13,
          color: "#7c7c7c",
          fontFamily: "system-ui, sans-serif",
          flexShrink: 0,
        }}
      >
        <span>{"\u2B06"} 2.4k</span>
        <span>{"\uD83D\uDCAC"} 847</span>
        <span>{"\uD83D\uDD17"} Share</span>
      </div>
    </div>
  );
};
