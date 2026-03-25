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
  tag?: string;
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
  const F = "system-ui, sans-serif";

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

  const conversation = messages.filter((m) => !m.isSummary);
  const summaries = messages.filter((m) => m.isSummary);

  const visibleConvo = conversation.filter((m) => frame >= m.startFrame);
  const visibleSummaries = summaries.filter((m) => frame >= m.startFrame);

  const summaryPhaseActive = visibleSummaries.length > 0;

  const convoFade = summaryPhaseActive
    ? interpolate(
        frame,
        [summaries[0].startFrame - 8, summaries[0].startFrame],
        [1, 0],
        { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
      )
    : 1;

  return (
    <AbsoluteFill style={{ opacity: sectionEnter * sectionExit }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* ─── HEADER ─── */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 28 }}>{"\u2696\uFE0F"}</span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              fontFamily: F,
              letterSpacing: 8,
              textShadow: "0 2px 24px rgba(0,0,0,0.9)",
            }}
          >
            THE TRIAL
          </span>
          <span style={{ fontSize: 28 }}>{"\u2696\uFE0F"}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "#ef4444",
              borderRadius: 20,
              padding: "4px 16px",
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              fontFamily: F,
              letterSpacing: 1.5,
            }}
          >
            PROSECUTION
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "#fbbf24",
              fontFamily: F,
              textShadow: "0 0 12px rgba(251,191,36,0.6)",
            }}
          >
            VS
          </span>
          <div
            style={{
              background: "#22c55e",
              borderRadius: 20,
              padding: "4px 16px",
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              fontFamily: F,
              letterSpacing: 1.5,
            }}
          >
            DEFENSE
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            fontFamily: F,
            letterSpacing: 2,
            marginTop: 2,
          }}
        >
          POWERED BY ELEVENLABS AI AGENTS
        </div>
      </div>

      {/* ─── CONVERSATION PHASE ─── */}
      {convoFade > 0 && (
        <div
          style={{
            position: "absolute",
            top: 170,
            left: 28,
            right: 28,
            bottom: 60,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            justifyContent: "flex-start",
            opacity: convoFade,
          }}
        >
          {visibleConvo.map((msg, i) => {
            const enter = interpolate(
              frame,
              [msg.startFrame, msg.startFrame + 12],
              [0, 1],
              {
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );

            const isPros = msg.color === "#ef4444";
            const slideDir = isPros ? -30 : 30;

            return (
              <div
                key={`c-${i}`}
                style={{
                  opacity: enter,
                  transform: `translateX(${interpolate(enter, [0, 1], [slideDir, 0])}px)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isPros ? "flex-start" : "flex-end",
                }}
              >
                <div
                  style={{
                    maxWidth: "92%",
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  {/* Speaker bar */}
                  <div
                    style={{
                      background: `${msg.color}`,
                      padding: "6px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>
                      {isPros ? "\uD83D\uDD34" : "\uD83D\uDFE2"}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#fff",
                        fontFamily: F,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                      }}
                    >
                      {msg.displayName}
                    </span>
                    {msg.tag && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.7)",
                          background: "rgba(0,0,0,0.3)",
                          borderRadius: 8,
                          padding: "2px 8px",
                          fontFamily: F,
                          marginLeft: "auto",
                        }}
                      >
                        {msg.tag}
                      </span>
                    )}
                  </div>
                  {/* Message body */}
                  <div
                    style={{
                      background: `${msg.color}18`,
                      border: `1px solid ${msg.color}30`,
                      borderTop: "none",
                      padding: "12px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#f0f0f0",
                        lineHeight: 1.35,
                        fontFamily: F,
                        textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── SUMMARY PHASE ─── */}
      {summaryPhaseActive && (
        <div
          style={{
            position: "absolute",
            top: 170,
            left: 28,
            right: 28,
            bottom: 60,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            justifyContent: "flex-start",
          }}
        >
          {visibleSummaries.map((msg, i) => {
            const enter = interpolate(
              frame,
              [msg.startFrame, msg.startFrame + 15],
              [0, 1],
              {
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );

            const isPros = msg.color === "#ef4444";

            return (
              <div
                key={`s-${i}`}
                style={{
                  opacity: enter,
                  transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px) scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
                }}
              >
                {/* Summary card */}
                <div
                  style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: `0 4px 30px ${msg.color}33, 0 0 60px ${msg.color}11`,
                  }}
                >
                  {/* Card header */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${msg.color}, ${isPros ? "#dc2626" : "#16a34a"})`,
                      padding: "14px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>
                      {isPros ? "\u2694\uFE0F" : "\uD83D\uDEE1\uFE0F"}
                    </span>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#fff",
                        fontFamily: F,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                      }}
                    >
                      {isPros ? "PROSECUTION CASE" : "DEFENSE CASE"}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: F,
                        background: "rgba(0,0,0,0.25)",
                        borderRadius: 12,
                        padding: "3px 12px",
                      }}
                    >
                      {isPros ? "YTA" : "NTA"}
                    </span>
                  </div>
                  {/* Card body */}
                  <div
                    style={{
                      background: `linear-gradient(180deg, ${msg.color}15, ${msg.color}08)`,
                      border: `1px solid ${msg.color}25`,
                      borderTop: "none",
                      padding: "20px 24px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 600,
                        color: "#fff",
                        lineHeight: 1.4,
                        fontFamily: F,
                        textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Bottom accent line ─── */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 60,
          right: 60,
          height: 2,
          background:
            "linear-gradient(90deg, #ef4444, transparent 30%, transparent 70%, #22c55e)",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
