import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface HookCardProps {
  text: string;
  subreddit?: string;
  author?: string;
}

export const HookCard: React.FC<HookCardProps> = ({ text, subreddit, author }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const textOpacity = interpolate(frame, [3, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chipOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "120px 56px 200px",
      }}
    >
      {/* Source chip */}
      {subreddit && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            opacity: chipOpacity,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "8px 16px",
              fontSize: 18,
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            r/{subreddit}
          </div>
          {author && (
            <div
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              u/{author}
            </div>
          )}
        </div>
      )}

      {/* Hook text — big, bold, left-aligned */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: "white",
          lineHeight: 1.3,
          textAlign: "left",
          maxWidth: 950,
          opacity: textOpacity,
          transform: `scale(${cardScale})`,
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {text}
      </div>

      {/* AITAH?! watermark */}
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 56,
          fontSize: 20,
          fontWeight: 900,
          color: "rgba(251,191,36,0.4)",
          letterSpacing: 2,
          fontFamily: "system-ui, sans-serif",
          opacity: chipOpacity,
        }}
      >
        AITAH?!
      </div>
    </AbsoluteFill>
  );
};
