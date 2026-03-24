import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface CtaCardProps {
  text: string;
}

export const CtaCard: React.FC<CtaCardProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12 } });
  const pulse = interpolate(frame % 45, [0, 22, 45], [1, 1.04, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 60px",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(217, 119, 6, 0.1))",
          border: "2px solid rgba(251, 191, 36, 0.3)",
          borderRadius: 28,
          padding: "48px 56px",
          maxWidth: 880,
          textAlign: "center",
          transform: `scale(${scale * pulse})`,
          boxShadow: "0 0 60px rgba(251, 191, 36, 0.1)",
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            background: "linear-gradient(135deg, #fbbf24, #d97706)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.4,
            marginBottom: 24,
          }}
        >
          {text}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.5)",
            letterSpacing: 3,
          }}
        >
          MAIN CHARACTER COURT
        </div>
      </div>
    </AbsoluteFill>
  );
};
