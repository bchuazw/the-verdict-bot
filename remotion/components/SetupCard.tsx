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

  const slideIn = spring({ frame, fps, config: { damping: 15 } });
  const slideX = interpolate(frame, [0, 10], [-40, 0], {
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
      {/* Label */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 3,
          color: "rgba(251,191,36,0.6)",
          textTransform: "uppercase",
          marginBottom: 20,
          opacity: slideIn,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        THE STORY
      </div>

      {/* Setup text card — dark bg, left-aligned, big readable text */}
      <div
        style={{
          background: "rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "36px 40px",
          maxWidth: 940,
          opacity: slideIn,
          transform: `translateX(${slideX}px)`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.5,
            textAlign: "left",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {text}
        </div>
      </div>

      {/* AITAH?! watermark */}
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 56,
          fontSize: 20,
          fontWeight: 900,
          color: "rgba(251,191,36,0.3)",
          letterSpacing: 2,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        AITAH?!
      </div>
    </AbsoluteFill>
  );
};
