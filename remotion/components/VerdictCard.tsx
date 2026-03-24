import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

const VERDICT_COLORS: Record<string, string> = {
  NTA: "#22c55e",
  YTA: "#ef4444",
  ESH: "#eab308",
  NAH: "#3b82f6",
  INFO: "#8b5cf6",
};

interface VerdictCardProps {
  label: string;
  oneLiner: string;
  confidence: number;
  pettyScore: number;
  redFlagCount: number;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  label,
  oneLiner,
  confidence,
  pettyScore,
  redFlagCount,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = VERDICT_COLORS[label] || "#22c55e";

  const slam = spring({ frame, fps, config: { damping: 6, stiffness: 200 } });
  const flashOpacity = interpolate(frame, [6, 14], [0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const oneLinerOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const oneLinerY = interpolate(frame, [35, 50], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const statsOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowSize = interpolate(frame % 60, [0, 30, 60], [30, 60, 30]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 56px",
      }}
    >
      {/* Flash */}
      {frame < 15 && (
        <div style={{ position: "absolute", inset: 0, background: color, opacity: flashOpacity }} />
      )}

      {/* Verdict label — huge, center, immediate */}
      <div
        style={{
          fontSize: 180,
          fontWeight: 900,
          color,
          textShadow: `0 0 ${glowSize}px ${color}`,
          transform: `scale(${slam})`,
          lineHeight: 1,
          fontFamily: "system-ui, -apple-system, sans-serif",
          marginBottom: 16,
        }}
      >
        {label}
      </div>

      {/* One-liner — the memorable quote */}
      <div
        style={{
          background: "rgba(0,0,0,0.6)",
          borderLeft: `4px solid ${color}`,
          borderRadius: 16,
          padding: "24px 32px",
          maxWidth: 880,
          opacity: oneLinerOpacity,
          transform: `translateY(${oneLinerY}px)`,
          marginBottom: 30,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontStyle: "italic",
            color,
            lineHeight: 1.4,
            textAlign: "left",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          "{oneLiner}"
        </div>
      </div>

      {/* Stats row — secondary */}
      <div
        style={{
          display: "flex",
          gap: 24,
          opacity: statsOpacity,
        }}
      >
        <StatPill label="Confidence" value={`${confidence}%`} color={color} />
        <StatPill label="Petty" value={`${pettyScore}/10`} color="#eab308" />
        <StatPill label="Red Flags" value={`${redFlagCount}🚩`} color="#ef4444" />
      </div>

      {/* Watermark */}
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

const StatPill: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div
    style={{
      background: "rgba(0,0,0,0.5)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: "12px 20px",
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 2,
        color: "rgba(255,255,255,0.4)",
        marginBottom: 4,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {label.toUpperCase()}
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "system-ui, sans-serif" }}>
      {value}
    </div>
  </div>
);
