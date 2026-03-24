import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface SetupCardProps {
  text: string;
}

export const SetupCard: React.FC<SetupCardProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({ frame, fps, config: { damping: 15 } });
  const textReveal = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const words = text.split(" ");
  const visibleWords = Math.ceil(words.length * textReveal);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 60px",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 4,
          color: "rgba(251, 191, 36, 0.7)",
          textTransform: "uppercase",
          marginBottom: 30,
          opacity: spring({ frame, fps, config: { damping: 20 } }),
        }}
      >
        📋 THE CASE
      </div>

      {/* Story card */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 24,
          padding: "48px 52px",
          maxWidth: 920,
          transform: `scale(${cardScale})`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.95)",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                opacity: i < visibleWords ? 1 : 0.1,
                transition: "opacity 0.1s",
              }}
            >
              {word}{" "}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
