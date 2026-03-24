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
}

interface Props {
  messages: VideoDebateMessage[];
  sectionStartFrame: number;
  sectionEndFrame: number;
}

const MSG_HEIGHT = 140;
const MAX_VISIBLE = 4;

export const DebateOverlay: React.FC<Props> = ({
  messages,
  sectionStartFrame,
  sectionEndFrame,
}) => {
  const frame = useCurrentFrame();

  if (frame < sectionStartFrame - 10 || frame > sectionEndFrame + 30)
    return null;

  const sectionEnter = interpolate(
    frame,
    [sectionStartFrame, sectionStartFrame + 15],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );
  const sectionExit =
    frame > sectionEndFrame
      ? interpolate(frame, [sectionEndFrame, sectionEndFrame + 15], [1, 0], {
          extrapolateRight: "clamp",
        })
      : 1;

  const opacity = sectionEnter * sectionExit;
  const visible = messages.filter((m) => frame >= m.startFrame);
  const scrollOffset = Math.max(0, (visible.length - MAX_VISIBLE) * MSG_HEIGHT);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Header badge */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(
            frame,
            [sectionStartFrame, sectionStartFrame + 12],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
          ),
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.8)",
            border: "1px solid rgba(255,69,0,0.5)",
            borderRadius: 14,
            padding: "12px 28px",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#ff4500",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: 3,
            }}
          >
            REDDIT TRIAL
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          position: "absolute",
          top: 290,
          left: 44,
          right: 44,
          bottom: 200,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            transform: `translateY(-${scrollOffset}px)`,
          }}
        >
          {visible.map((msg, i) => {
            const enter = interpolate(
              frame,
              [msg.startFrame, msg.startFrame + 10],
              [0, 1],
              {
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.back(1.05)),
              },
            );

            const isProsecutor = msg.color === "#ef4444";
            const isDefense = msg.color === "#22c55e";
            const emoji = isProsecutor ? "\u2694\uFE0F" : isDefense ? "\uD83D\uDEE1\uFE0F" : "\uD83C\uDF10";

            return (
              <div
                key={i}
                style={{
                  opacity: enter,
                  transform: `translateX(${interpolate(enter, [0, 1], [isProsecutor ? -40 : 40, 0])}px)`,
                  background: "rgba(0,0,0,0.72)",
                  borderLeft: `4px solid ${msg.color}`,
                  borderRadius: 14,
                  padding: "14px 18px",
                  backdropFilter: "blur(10px)",
                  boxShadow: `0 4px 20px ${msg.color}22`,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: msg.color,
                    fontFamily: "system-ui, sans-serif",
                    marginBottom: 6,
                    letterSpacing: 0.5,
                  }}
                >
                  {emoji} {msg.displayName}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: "#fff",
                    lineHeight: 1.35,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
