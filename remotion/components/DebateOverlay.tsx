import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";

export interface VideoDebateMessage {
  displayName: string;
  text: string;
  color: string;
  startFrame: number;
  endFrame: number;
  isSummary?: boolean;
}

interface Props {
  messages: VideoDebateMessage[];
  sectionStartFrame: number;
  sectionEndFrame: number;
}

export const DebateOverlay: React.FC<Props> = ({
  messages,
  sectionStartFrame,
  sectionEndFrame,
}) => {
  const frame = useCurrentFrame();

  if (frame < sectionStartFrame - 5 || frame > sectionEndFrame + 20)
    return null;

  const sectionEnter = interpolate(
    frame,
    [sectionStartFrame, sectionStartFrame + 10],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );
  const sectionExit =
    frame > sectionEndFrame
      ? interpolate(frame, [sectionEndFrame, sectionEndFrame + 10], [1, 0], {
          extrapolateRight: "clamp",
        })
      : 1;

  const visible = messages.filter((m) => frame >= m.startFrame);
  const F = "system-ui, sans-serif";

  const isPros = (c: string) => c === "#ef4444";
  const isDef = (c: string) => c === "#22c55e";

  return (
    <AbsoluteFill style={{ opacity: sectionEnter * sectionExit }}>
      {/* Gradient overlay for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 50,
            height: 3,
            background: "#ef4444",
            borderRadius: 2,
          }}
        />
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#fff",
            fontFamily: F,
            letterSpacing: 6,
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          REDDIT TRIAL
        </span>
        <div
          style={{
            width: 50,
            height: 3,
            background: "#22c55e",
            borderRadius: 2,
          }}
        />
      </div>

      {/* VS badge */}
      <div
        style={{
          position: "absolute",
          top: 108,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: F,
            letterSpacing: 1.5,
          }}
        >
          <span style={{ color: "#ef4444" }}>PROSECUTION</span>
          <span
            style={{
              color: "#fbbf24",
              fontSize: 18,
              fontWeight: 900,
              textShadow: "0 0 15px rgba(251,191,36,0.5)",
            }}
          >
            VS
          </span>
          <span style={{ color: "#22c55e" }}>DEFENSE</span>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          position: "absolute",
          top: 148,
          left: 24,
          right: 24,
          bottom: 80,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          justifyContent: "flex-start",
        }}
      >
        {visible.map((msg, i) => {
          const enter = interpolate(
            frame,
            [msg.startFrame, msg.startFrame + 10],
            [0, 1],
            {
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          );

          if (msg.isSummary) {
            return (
              <div
                key={i}
                style={{
                  opacity: enter,
                  transform: `scale(${interpolate(enter, [0, 1], [0.95, 1])})`,
                  background: `linear-gradient(135deg, ${msg.color}22, ${msg.color}11)`,
                  border: `2px solid ${msg.color}88`,
                  borderRadius: 16,
                  padding: "16px 20px",
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: msg.color,
                    fontFamily: F,
                    letterSpacing: 2,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  {isPros(msg.color) ? "\u2694\uFE0F" : "\uD83D\uDEE1\uFE0F"}{" "}
                  {msg.displayName}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.35,
                    fontFamily: F,
                    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          }

          const isLeft = isPros(msg.color);

          return (
            <div
              key={i}
              style={{
                opacity: enter,
                transform: `translateX(${interpolate(enter, [0, 1], [isLeft ? -20 : 20, 0])}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: isLeft ? "flex-start" : "flex-end",
              }}
            >
              <div
                style={{
                  maxWidth: "88%",
                  background: isLeft
                    ? "rgba(239,68,68,0.12)"
                    : isDef(msg.color)
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(139,92,246,0.12)",
                  border: `1px solid ${msg.color}44`,
                  borderRadius: isLeft
                    ? "4px 14px 14px 14px"
                    : "14px 4px 14px 14px",
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: msg.color,
                    fontFamily: F,
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {msg.displayName}
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    color: "#e0e0e0",
                    lineHeight: 1.3,
                    fontFamily: F,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
