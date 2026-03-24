import { useCurrentFrame, interpolate } from "remotion";

export interface StoryChunk {
  text: string;
  startFrame: number;
  endFrame: number;
}

interface RedditPostCardProps {
  subreddit: string;
  author: string;
  title: string;
  chunks: StoryChunk[];
}

const CHUNK_HEIGHT = 88;
const VISIBLE_CHUNKS = 8;
const SCROLL_LEAD = 3;

export const RedditPostCard: React.FC<RedditPostCardProps> = ({
  subreddit,
  author,
  title,
  chunks,
}) => {
  const frame = useCurrentFrame();

  const activeIdx = chunks.findIndex(
    (c) => frame >= c.startFrame && frame < c.endFrame,
  );
  const safeIdx =
    activeIdx >= 0
      ? activeIdx
      : frame < (chunks[0]?.startFrame ?? 0)
        ? -1
        : chunks.length - 1;

  const maxScroll = Math.max(
    0,
    (chunks.length - VISIBLE_CHUNKS) * CHUNK_HEIGHT,
  );

  // Build scroll keyframes: hold-then-move for each new scroll target
  const scrollTargets = chunks.map((_, i) =>
    Math.min(Math.max(0, (i - SCROLL_LEAD) * CHUNK_HEIGHT), maxScroll),
  );
  const kfFrames: number[] = [0];
  const kfValues: number[] = [0];

  for (let i = 0; i < chunks.length; i++) {
    const target = scrollTargets[i];
    const prev = kfValues[kfValues.length - 1];
    if (target !== prev) {
      kfFrames.push(Math.max(chunks[i].startFrame - 1, kfFrames[kfFrames.length - 1] + 1));
      kfValues.push(prev);
      kfFrames.push(chunks[i].startFrame + 9);
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
        top: 140,
        left: 130,
        right: 130,
        height: 1100,
        background: "rgba(255, 255, 255, 0.97)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 50px rgba(0,0,0,0.55)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 22px",
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
            fontSize: 15,
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
            u/{author} · 12h
          </div>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          padding: "14px 22px 6px",
          fontSize: 26,
          fontWeight: 700,
          color: "#1a1a1b",
          lineHeight: 1.22,
          fontFamily: "system-ui, sans-serif",
          flexShrink: 0,
        }}
      >
        {title}
      </div>

      {/* Body – scrollable chunks */}
      <div
        style={{
          flex: 1,
          padding: "6px 22px 20px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ transform: `translateY(-${scrollY}px)` }}>
          {chunks.map((chunk, i) => {
            const isActive = i === safeIdx;
            const isPast = safeIdx >= 0 && i < safeIdx;

            return (
              <div
                key={i}
                style={{
                  fontSize: 24,
                  lineHeight: 1.38,
                  color: isActive
                    ? "#1a1a1b"
                    : isPast
                      ? "#4a4a4b"
                      : "#9a9a9b",
                  fontWeight: isActive ? 600 : 400,
                  padding: "5px 8px",
                  marginBottom: 4,
                  borderRadius: 6,
                  background: isActive
                    ? "rgba(255, 69, 0, 0.07)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #ff4500"
                    : "3px solid transparent",
                  fontFamily: "system-ui, sans-serif",
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
          padding: "10px 22px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: 18,
          fontSize: 13,
          color: "#7c7c7c",
          fontFamily: "system-ui, sans-serif",
          flexShrink: 0,
        }}
      >
        <span>⬆ 2.4k</span>
        <span>💬 847</span>
        <span>🔗 Share</span>
      </div>
    </div>
  );
};
