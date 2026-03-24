import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

const VERDICT_COLORS: Record<string, { color: string; bg: string }> = {
  NTA: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" },
  YTA: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
  ESH: { color: "#eab308", bg: "rgba(234, 179, 8, 0.15)" },
  NAH: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" },
  INFO: { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" },
};

const VERDICT_LABELS: Record<string, string> = {
  NTA: "NOT THE ASSHOLE",
  YTA: "YOU'RE THE ASSHOLE",
  ESH: "EVERYONE SUCKS HERE",
  NAH: "NO ASSHOLES HERE",
  INFO: "NOT ENOUGH INFO",
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
  const vc = VERDICT_COLORS[label] || VERDICT_COLORS.NTA;
  const fullLabel = VERDICT_LABELS[label] || label;

  // Gavel slam animation
  const gavelScale = spring({
    frame,
    fps,
    config: { damping: 6, stiffness: 200 },
  });
  const gavelRotate = interpolate(frame, [0, 4, 8], [-45, 10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Verdict text slam
  const verdictSlam = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  // Stats fade in
  const statsOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // One-liner fade in
  const oneLinerOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const oneLinerY = interpolate(frame, [70, 90], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow
  const glowIntensity = interpolate(frame % 60, [0, 30, 60], [20, 50, 20]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 50px",
      }}
    >
      {/* Flash effect on slam */}
      {frame < 15 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: vc.color,
            opacity: interpolate(frame, [8, 15], [0.3, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      )}

      {/* Gavel */}
      <div
        style={{
          fontSize: 100,
          transform: `scale(${gavelScale}) rotate(${gavelRotate}deg)`,
          marginBottom: 20,
        }}
      >
        🔨
      </div>

      {/* THE VERDICT label */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 8,
          color: "rgba(251, 191, 36, 0.7)",
          textTransform: "uppercase",
          marginBottom: 24,
          opacity: verdictSlam,
        }}
      >
        THE VERDICT
      </div>

      {/* Verdict type */}
      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          fontFamily: "Georgia, serif",
          color: vc.color,
          textShadow: `0 0 ${glowIntensity}px ${vc.color}`,
          transform: `scale(${verdictSlam})`,
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        {label}
      </div>

      {/* Full label */}
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.6)",
          letterSpacing: 3,
          marginBottom: 40,
          opacity: verdictSlam,
        }}
      >
        {fullLabel}
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 40,
          opacity: statsOpacity,
          marginBottom: 40,
        }}
      >
        <StatBox label="CONFIDENCE" value={`${confidence}%`} color={vc.color} />
        <StatBox label="PETTY SCORE" value={`${pettyScore}/10`} color="#eab308" />
        <StatBox
          label="RED FLAGS"
          value={`${redFlagCount} 🚩`}
          color="#ef4444"
        />
      </div>

      {/* One-liner */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          border: `1px solid ${vc.color}40`,
          borderRadius: 20,
          padding: "30px 40px",
          maxWidth: 880,
          opacity: oneLinerOpacity,
          transform: `translateY(${oneLinerY}px)`,
          boxShadow: `0 0 30px ${vc.color}20`,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            fontStyle: "italic",
            color: vc.color,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          "{oneLiner}"
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StatBox: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div
    style={{
      background: "rgba(0, 0, 0, 0.4)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 16,
      padding: "16px 24px",
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 2,
        color: "rgba(255, 255, 255, 0.4)",
        marginBottom: 6,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
  </div>
);
