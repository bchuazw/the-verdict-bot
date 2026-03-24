import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

const SPEAKER_CONFIG: Record<
  string,
  { label: string; emoji: string; color: string; accent: string }
> = {
  prosecutor: {
    label: "PROSECUTION",
    emoji: "⚔️",
    color: "#ef4444",
    accent: "rgba(239,68,68,0.25)",
  },
  defense: {
    label: "DEFENSE",
    emoji: "🛡️",
    color: "#22c55e",
    accent: "rgba(34,197,94,0.25)",
  },
  comments: {
    label: "THE INTERNET",
    emoji: "🌐",
    color: "#eab308",
    accent: "rgba(234,179,8,0.25)",
  },
  clerk: {
    label: "HOST",
    emoji: "🎙️",
    color: "#8b5cf6",
    accent: "rgba(139,92,246,0.25)",
  },
};

interface SpeakerCardProps {
  speaker: string;
  text: string;
  index: number;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({
  speaker,
  text,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cfg = SPEAKER_CONFIG[speaker] || SPEAKER_CONFIG.clerk;

  const enterProgress = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const slideY = interpolate(frame, [0, 8], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = interpolate(frame % 45, [0, 22, 45], [0.15, 0.35, 0.15]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-start",
        padding: "0 48px 220px",
      }}
    >
      {/* Speaker badge — lower-third style */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          opacity: enterProgress,
          transform: `translateY(${slideY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 22,
            background: cfg.accent,
            borderRadius: 10,
            padding: "6px 10px",
            border: `1px solid ${cfg.color}40`,
          }}
        >
          {cfg.emoji}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: 3,
            color: cfg.color,
            textTransform: "uppercase",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {cfg.label}
        </div>
      </div>

      {/* Caption card — dark rounded rect, left-aligned, readable */}
      <div
        style={{
          background: "rgba(0,0,0,0.72)",
          borderLeft: `4px solid ${cfg.color}`,
          borderRadius: 16,
          padding: "28px 32px",
          maxWidth: 920,
          opacity: enterProgress,
          transform: `translateY(${slideY}px)`,
          boxShadow: `0 0 ${20 * glowPulse}px ${cfg.accent}, 0 8px 30px rgba(0,0,0,0.5)`,
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            lineHeight: 1.4,
            textAlign: "left",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
