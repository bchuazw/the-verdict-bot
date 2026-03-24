import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface TitleCardProps {
  hookText: string;
  title: string;
}

export const TitleCard: React.FC<TitleCardProps> = ({ hookText, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 12 } });
  const hookOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hookY = interpolate(frame, [15, 30], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const gavelRotate = interpolate(frame, [0, 8, 12, 15], [-30, -30, 5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gavelScale = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 8 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 60px",
      }}
    >
      {/* Gavel emoji */}
      <div
        style={{
          fontSize: 120,
          transform: `scale(${gavelScale}) rotate(${gavelRotate}deg)`,
          marginBottom: 40,
        }}
      >
        ⚖️
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          fontFamily: "Georgia, serif",
          textAlign: "center",
          background: "linear-gradient(135deg, #fbbf24, #d97706, #b45309)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          transform: `scale(${titleScale})`,
          lineHeight: 1.1,
          marginBottom: 40,
        }}
      >
        {title}
      </div>

      {/* Hook text */}
      <div
        style={{
          fontSize: 38,
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.9)",
          textAlign: "center",
          lineHeight: 1.4,
          maxWidth: 900,
          opacity: hookOpacity,
          transform: `translateY(${hookY}px)`,
          padding: "24px 36px",
          background: "rgba(0, 0, 0, 0.4)",
          borderRadius: 20,
          border: "1px solid rgba(251, 191, 36, 0.2)",
        }}
      >
        {hookText}
      </div>

      {/* Court is in session badge */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 6,
          color: "rgba(251, 191, 36, 0.6)",
          textTransform: "uppercase",
          opacity: interpolate(frame, [40, 55], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        COURT IS NOW IN SESSION
      </div>
    </AbsoluteFill>
  );
};
