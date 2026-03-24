import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const GameplayBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const blocks = Array.from({ length: 50 }, (_, i) => ({
    x: (i * 73 + 31) % 1080,
    yBase: (i * 127 + 53) % 2400 - 400,
    width: 50 + ((i * 43) % 140),
    height: 70 + ((i * 67) % 220),
    hue: (i * 37) % 360,
    speed: 35 + ((i * 23) % 90),
    opacity: 0.12 + ((i * 7) % 12) / 100,
    layer: i < 25 ? 0 : 1,
  }));

  const particles = Array.from({ length: 35 }, (_, i) => ({
    x: (i * 97 + 17) % 1080,
    yBase: (i * 83 + 41) % 2200,
    size: 2 + ((i * 13) % 5),
    speed: 50 + ((i * 31) % 120),
    opacity: 0.25 + ((i * 11) % 4) / 10,
  }));

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(170deg, #0b0d1a 0%, #0d1a2a 25%, #0f1f30 50%, #0a1520 75%, #070a12 100%)",
        }}
      />

      {/* Far layer – slow, dim blocks */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, opacity: 0.45 }}
      >
        {blocks
          .filter((b) => b.layer === 0)
          .map((b, i) => {
            const y =
              ((b.yBase - t * b.speed * 0.6 + 2400) % 2400) - 400;
            return (
              <rect
                key={`far-${i}`}
                x={b.x}
                y={y}
                width={b.width}
                height={b.height}
                rx={5}
                fill={`hsla(${b.hue}, 45%, 22%, ${b.opacity})`}
              />
            );
          })}
      </svg>

      {/* Near layer – faster, brighter blocks */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, opacity: 0.6 }}
      >
        {blocks
          .filter((b) => b.layer === 1)
          .map((b, i) => {
            const y = ((b.yBase - t * b.speed + 2400) % 2400) - 400;
            return (
              <rect
                key={`near-${i}`}
                x={b.x}
                y={y}
                width={b.width * 1.2}
                height={b.height * 1.15}
                rx={6}
                fill={`hsla(${b.hue}, 55%, 28%, ${b.opacity * 1.4})`}
                stroke={`hsla(${b.hue}, 65%, 45%, 0.12)`}
                strokeWidth={1}
              />
            );
          })}
      </svg>

      {/* Diagonal speed lines */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        {Array.from({ length: 18 }, (_, i) => {
          const baseX = (i * 67 + 23) % 1080;
          const speed = 180 + ((i * 41) % 350);
          const offset = (t * speed) % 2400;
          const alpha = 0.025 + (i % 4) * 0.012;
          return (
            <line
              key={`speed-${i}`}
              x1={baseX}
              y1={-200 + offset}
              x2={baseX + 30}
              y2={300 + offset}
              stroke={`rgba(255,255,255,${alpha})`}
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {/* Rising particles */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        {particles.map((p, i) => {
          const y = ((p.yBase - t * p.speed + 2400) % 2400) - 200;
          return (
            <circle
              key={`p-${i}`}
              cx={p.x}
              cy={y}
              r={p.size}
              fill={`rgba(255,255,255,${p.opacity})`}
            />
          );
        })}
      </svg>

      {/* Energy orbs */}
      {[
        { cx: 180, cy: 350, r: 200, hue: 245 },
        { cx: 900, cy: 1100, r: 250, hue: 330 },
        { cx: 540, cy: 1750, r: 180, hue: 210 },
      ].map((orb, i) => {
        const pulse = 1 + 0.12 * Math.sin(t * (0.7 + i * 0.25));
        return (
          <div
            key={`orb-${i}`}
            style={{
              position: "absolute",
              left: orb.cx - orb.r * pulse,
              top: orb.cy - orb.r * pulse,
              width: orb.r * 2 * pulse,
              height: orb.r * 2 * pulse,
              borderRadius: "50%",
              background: `hsla(${orb.hue}, 60%, 30%, 0.07)`,
              filter: "blur(50px)",
            }}
          />
        );
      })}

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.26)",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
