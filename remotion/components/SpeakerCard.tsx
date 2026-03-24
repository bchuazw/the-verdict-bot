import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

const SPEAKER_CONFIG: Record<
  string,
  { label: string; emoji: string; color: string; bgColor: string; accent: string }
> = {
  prosecutor: {
    label: "PROSECUTION",
    emoji: "⚔️",
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.12)",
    accent: "rgba(239, 68, 68, 0.3)",
  },
  defense: {
    label: "DEFENSE",
    emoji: "🛡️",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.12)",
    accent: "rgba(34, 197, 94, 0.3)",
  },
  comments: {
    label: "THE INTERNET",
    emoji: "🌐",
    color: "#eab308",
    bgColor: "rgba(234, 179, 8, 0.12)",
    accent: "rgba(234, 179, 8, 0.3)",
  },
  clerk: {
    label: "COURT CLERK",
    emoji: "📜",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.12)",
    accent: "rgba(139, 92, 246, 0.3)",
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
  const config = SPEAKER_CONFIG[speaker] || SPEAKER_CONFIG.clerk;

  const enterScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const slideX = interpolate(frame, [0, 12], [index % 2 === 0 ? -80 : 80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textReveal = interpolate(frame, [8, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const words = text.split(" ");
  const visibleWords = Math.ceil(words.length * textReveal);

  const glowPulse = interpolate(frame % 60, [0, 30, 60], [0.3, 0.6, 0.3]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 50px",
      }}
    >
      {/* Speaker badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 30,
          opacity: enterScale,
          transform: `translateX(${slideX}px)`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            background: config.bgColor,
            borderRadius: 16,
            padding: "12px 16px",
            border: `2px solid ${config.accent}`,
          }}
        >
          {config.emoji}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 4,
            color: config.color,
            textTransform: "uppercase",
          }}
        >
          {config.label}
        </div>
      </div>

      {/* Speech bubble */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.55)",
          border: `2px solid ${config.accent}`,
          borderRadius: 28,
          padding: "44px 48px",
          maxWidth: 920,
          transform: `scale(${enterScale}) translateX(${slideX}px)`,
          boxShadow: `0 0 ${40 * glowPulse}px ${config.accent}, 0 20px 40px rgba(0,0,0,0.4)`,
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.95)",
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                opacity: i < visibleWords ? 1 : 0,
                fontWeight:
                  i < visibleWords && i >= visibleWords - 3 ? 700 : 600,
              }}
            >
              {word}{" "}
            </span>
          ))}
        </div>
      </div>

      {/* Quote marks */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: 60,
          fontSize: 140,
          color: config.accent,
          fontFamily: "Georgia, serif",
          opacity: 0.15,
          lineHeight: 1,
        }}
      >
        "
      </div>
    </AbsoluteFill>
  );
};
