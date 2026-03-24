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
    [sectionStartFrame, sectionStartFrame + 12],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );
  const sectionExit =
    frame > sectionEndFrame
      ? interpolate(frame, [sectionEndFrame, sectionEndFrame + 12], [1, 0], {
          extrapolateRight: "clamp",
        })
      : 1;

  const visible = messages.filter((m) => frame >= m.startFrame);
  const F = "system-ui, sans-serif";

  const isPros = (c: string) => c === "#ef4444";
  const isDef = (c: string) => c === "#22c55e";
  const icon = (c: string) =>
    isPros(c) ? "\u2694\uFE0F" : isDef(c) ? "\uD83D\uDEE1\uFE0F" : "\uD83D\uDCAC";

  return (
    <AbsoluteFill style={{ opacity: sectionEnter * sectionExit }}>
      {/* Header badge */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.85)",
            border: "1px solid rgba(255,69,0,0.5)",
            borderRadius: 12,
            padding: "7px 20px",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "#ff4500",
              fontFamily: F,
              letterSpacing: 4,
            }}
          >
            REDDIT TRIAL
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#888",
              fontFamily: F,
              marginLeft: 8,
            }}
          >
            powered by AI Agents
          </span>
        </div>
      </div>

      {/* Chat messages — tight, fill screen */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 28,
          right: 28,
          bottom: 100,
          display: "flex",
          flexDirection: "column",
          gap: 8,
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

          return (
            <div
              key={i}
              style={{
                opacity: enter,
                transform: `translateY(${interpolate(enter, [0, 1], [14, 0])}px)`,
                background: "rgba(0,0,0,0.82)",
                borderLeft: `4px solid ${msg.color}`,
                borderRadius: 12,
                padding: "12px 16px",
                backdropFilter: "blur(12px)",
                boxShadow: `0 4px 20px ${msg.color}22`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>{icon(msg.color)}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: msg.color,
                    fontFamily: F,
                    letterSpacing: 1,
                  }}
                >
                  {msg.displayName.toUpperCase()}
                </span>
                {(isPros(msg.color) || isDef(msg.color)) && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#555",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 5,
                      padding: "1px 6px",
                      fontFamily: F,
                    }}
                  >
                    AI AGENT
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "#fff",
                  lineHeight: 1.35,
                  fontFamily: F,
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
