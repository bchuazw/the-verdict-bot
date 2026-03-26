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

const F = "'Inter', 'SF Pro Display', system-ui, sans-serif";

const ProsecutorFigure: React.FC<{ active: boolean; glow: number }> = ({
  active,
  glow,
}) => {
  const brightness = active ? 1 : 0.45;
  const scale = active ? 1.05 : 0.95;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity: brightness,
        transform: `scale(${scale})`,
        transition: "transform 0.3s",
      }}
    >
      {/* Avatar ring */}
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ef4444, #991b1b)",
          padding: 4,
          boxShadow: active
            ? `0 0 ${30 + glow * 20}px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.2)`
            : "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "linear-gradient(180deg, #1a0505 0%, #2d0a0a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
          }}
        >
          {"\u2694\uFE0F"}
        </div>
      </div>
      {/* Name */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color: "#ef4444",
          fontFamily: F,
          letterSpacing: 3,
          textShadow: active
            ? "0 0 12px rgba(239,68,68,0.6)"
            : "0 2px 8px rgba(0,0,0,0.6)",
        }}
      >
        PROSECUTION
      </div>
      {/* Role subtitle */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(239,68,68,0.6)",
          fontFamily: F,
          letterSpacing: 2,
          marginTop: -6,
        }}
      >
        ARGUES YTA
      </div>
    </div>
  );
};

const DefenseFigure: React.FC<{ active: boolean; glow: number }> = ({
  active,
  glow,
}) => {
  const brightness = active ? 1 : 0.45;
  const scale = active ? 1.05 : 0.95;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity: brightness,
        transform: `scale(${scale})`,
        transition: "transform 0.3s",
      }}
    >
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #22c55e, #166534)",
          padding: 4,
          boxShadow: active
            ? `0 0 ${30 + glow * 20}px rgba(34,197,94,0.6), 0 0 60px rgba(34,197,94,0.2)`
            : "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "linear-gradient(180deg, #031a09 0%, #0a2d14 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
          }}
        >
          {"\uD83D\uDEE1\uFE0F"}
        </div>
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color: "#22c55e",
          fontFamily: F,
          letterSpacing: 3,
          textShadow: active
            ? "0 0 12px rgba(34,197,94,0.6)"
            : "0 2px 8px rgba(0,0,0,0.6)",
        }}
      >
        DEFENSE
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(34,197,94,0.6)",
          fontFamily: F,
          letterSpacing: 2,
          marginTop: -6,
        }}
      >
        ARGUES NTA
      </div>
    </div>
  );
};

const SpeechBubble: React.FC<{
  text: string;
  color: string;
  tag?: string;
  isPros: boolean;
  enter: number;
}> = ({ text, color, tag, isPros, enter }) => {
  const darkBg = isPros
    ? "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(153,27,27,0.06))"
    : "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(22,101,52,0.06))";

  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
        display: "flex",
        flexDirection: "column",
        alignItems: isPros ? "flex-start" : "flex-end",
        width: "100%",
      }}
    >
      {/* Tail pointer */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderBottom: `14px solid ${color}30`,
          marginLeft: isPros ? 80 : "auto",
          marginRight: isPros ? "auto" : 80,
          marginBottom: -1,
        }}
      />
      {/* Bubble */}
      <div
        style={{
          maxWidth: "100%",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 40px ${color}18`,
          border: `2px solid ${color}30`,
        }}
      >
        {/* Tag bar */}
        {tag && (
          <div
            style={{
              background: `linear-gradient(135deg, ${color}, ${isPros ? "#991b1b" : "#166534"})`,
              padding: "8px 22px",
              display: "flex",
              alignItems: "center",
              gap: 10,
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
                letterSpacing: 2.5,
                textTransform: "uppercase",
              }}
            >
              {isPros ? "Prosecution" : "Defense"} — {tag}
            </span>
          </div>
        )}
        {/* Text body */}
        <div
          style={{
            background: darkBg,
            backdropFilter: "blur(16px)",
            padding: "18px 24px",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "#f5f5f5",
              lineHeight: 1.5,
              fontFamily: F,
              textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

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
    [sectionStartFrame, sectionStartFrame + 15],
    [0, 1],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
      easing: Easing.out(Easing.cubic),
    },
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

  const latestMsg = visibleConvo[visibleConvo.length - 1];
  const prosActive = latestMsg ? latestMsg.color === "#ef4444" : false;
  const defActive = latestMsg ? latestMsg.color === "#22c55e" : false;

  const glowPulse =
    0.5 + 0.5 * Math.sin(((frame - sectionStartFrame) / 15) * Math.PI);

  const figureEnter = interpolate(
    frame,
    [sectionStartFrame, sectionStartFrame + 20],
    [0, 1],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
      easing: Easing.out(Easing.back(1.4)),
    },
  );

  const vsEnter = interpolate(
    frame,
    [sectionStartFrame + 8, sectionStartFrame + 22],
    [0, 1],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
      easing: Easing.out(Easing.back(2)),
    },
  );

  return (
    <AbsoluteFill style={{ opacity: sectionEnter * sectionExit }}>
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(5,5,20,0.6) 30%, rgba(5,5,20,0.6) 70%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Colored ambient glow behind figures */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          opacity: prosActive ? 0.9 : 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 200,
          right: -60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          opacity: defActive ? 0.9 : 0.3,
        }}
      />

      {/* ─── HEADER ─── */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 120,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)",
            borderRadius: 1,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 30 }}>{"\u2696\uFE0F"}</span>
          <span
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: "#fff",
              fontFamily: F,
              letterSpacing: 10,
              textShadow:
                "0 0 30px rgba(251,191,36,0.25), 0 2px 20px rgba(0,0,0,0.9)",
            }}
          >
            THE TRIAL
          </span>
          <span style={{ fontSize: 30 }}>{"\u2696\uFE0F"}</span>
        </div>
        <div
          style={{
            width: 200,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          }}
        />
      </div>

      {/* ─── FIGURES AREA ─── */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 40,
          right: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: figureEnter,
          transform: `translateY(${interpolate(figureEnter, [0, 1], [20, 0])}px)`,
        }}
      >
        {/* Prosecutor */}
        <ProsecutorFigure active={prosActive} glow={glowPulse} />

        {/* VS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            opacity: vsEnter,
            transform: `scale(${interpolate(vsEnter, [0, 1], [0.3, 1])})`,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))",
              border: "2px solid rgba(251,191,36,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(251,191,36,0.15)",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fbbf24",
                fontFamily: F,
                textShadow: "0 0 16px rgba(251,191,36,0.8)",
              }}
            >
              VS
            </span>
          </div>
        </div>

        {/* Defense */}
        <DefenseFigure active={defActive} glow={glowPulse} />
      </div>

      {/* ─── CONVERSATION PHASE — Speech Bubbles ─── */}
      {convoFade > 0 && (
        <div
          style={{
            position: "absolute",
            top: 420,
            left: 36,
            right: 36,
            bottom: 50,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            justifyContent: "flex-start",
            opacity: convoFade,
          }}
        >
          {visibleConvo.map((msg, i) => {
            const enter = interpolate(
              frame,
              [msg.startFrame, msg.startFrame + 14],
              [0, 1],
              {
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );
            const isPros = msg.color === "#ef4444";

            return (
              <SpeechBubble
                key={`c-${i}`}
                text={msg.text}
                color={msg.color}
                tag={msg.tag}
                isPros={isPros}
                enter={enter}
              />
            );
          })}
        </div>
      )}

      {/* ─── SUMMARY PHASE ─── */}
      {summaryPhaseActive && (
        <div
          style={{
            position: "absolute",
            top: 420,
            left: 36,
            right: 36,
            bottom: 50,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            justifyContent: "flex-start",
          }}
        >
          {visibleSummaries.map((msg, i) => {
            const enter = interpolate(
              frame,
              [msg.startFrame, msg.startFrame + 18],
              [0, 1],
              {
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );

            const isPros = msg.color === "#ef4444";
            const accentColor = isPros ? "#ef4444" : "#22c55e";
            const gradEnd = isPros ? "#b91c1c" : "#15803d";

            return (
              <div
                key={`s-${i}`}
                style={{
                  opacity: enter,
                  transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px) scale(${interpolate(enter, [0, 1], [0.95, 1])})`,
                }}
              >
                <div
                  style={{
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: `0 12px 48px rgba(0,0,0,0.6), 0 0 50px ${accentColor}20`,
                    border: `2px solid ${accentColor}30`,
                  }}
                >
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, ${gradEnd})`,
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
                        fontSize: 17,
                        fontWeight: 900,
                        color: "#fff",
                        fontFamily: F,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                      }}
                    >
                      {isPros ? "PROSECUTION RESTS" : "DEFENSE RESTS"}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#fff",
                        fontFamily: F,
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: 14,
                        padding: "4px 14px",
                        letterSpacing: 1,
                      }}
                    >
                      {isPros ? "YTA" : "NTA"}
                    </span>
                  </div>
                  <div
                    style={{
                      background: `linear-gradient(180deg, ${accentColor}12, ${accentColor}05)`,
                      backdropFilter: "blur(12px)",
                      padding: "20px 24px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 500,
                        color: "#fff",
                        lineHeight: 1.5,
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
          bottom: 22,
          left: 60,
          right: 60,
          height: 2,
          background:
            "linear-gradient(90deg, #ef4444, rgba(251,191,36,0.4) 50%, #22c55e)",
          opacity: 0.35,
          borderRadius: 1,
        }}
      />
    </AbsoluteFill>
  );
};
