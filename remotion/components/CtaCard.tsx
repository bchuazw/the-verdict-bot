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
  const pulse = interpolate(frame % 40, [0, 20, 40], [1, 1.03, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 56px",
      }}
    >
      {/* CTA card */}
      <div
        style={{
          background: "rgba(0,0,0,0.65)",
          border: "2px solid rgba(251,191,36,0.3)",
          borderRadius: 24,
          padding: "44px 48px",
          maxWidth: 880,
          textAlign: "center",
          transform: `scale(${scale * pulse})`,
          boxShadow: "0 0 50px rgba(251,191,36,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 46,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.3,
            marginBottom: 20,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {text}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            background: "linear-gradient(135deg, #fbbf24, #d97706)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 3,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          AITAH?!
        </div>
      </div>
    </AbsoluteFill>
  );
};
