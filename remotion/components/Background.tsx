import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  const gradAngle = interpolate(frame, [0, 1800], [135, 315], { extrapolateRight: "extend" });

  return (
    <AbsoluteFill>
      {/* Base dark gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${gradAngle}deg, #06080f 0%, #0d1117 30%, #161b2e 60%, #0a0e1a 100%)`,
        }}
      />

      {/* Fast-moving grid (retention anchor) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: `translateY(${(-frame * 1.8) % 40}px)`,
        }}
      />

      {/* Diagonal speed lines */}
      {Array.from({ length: 12 }).map((_, i) => {
        const baseX = (i * 95 + frame * (1.2 + i * 0.15)) % 1200 - 60;
        const opacity = 0.03 + 0.02 * Math.sin(frame / 30 + i);
        return (
          <div
            key={`line-${i}`}
            style={{
              position: "absolute",
              top: 0,
              left: baseX,
              width: 2,
              height: "100%",
              background: `linear-gradient(180deg, transparent 0%, rgba(251,191,36,${opacity}) 30%, rgba(139,92,246,${opacity}) 70%, transparent 100%)`,
              transform: "skewX(-8deg)",
            }}
          />
        );
      })}

      {/* Floating particles (moving upward fast) */}
      {Array.from({ length: 30 }).map((_, i) => {
        const seed = i * 137.5;
        const x = (seed * 7.3) % 1080;
        const speed = 1.5 + (seed % 3);
        const y = ((1920 + 40) - (frame * speed + seed * 11) % (1920 + 80));
        const size = 2 + (i % 4);
        const hue = i % 3 === 0 ? "251,191,36" : i % 3 === 1 ? "139,92,246" : "59,130,246";
        const alpha = 0.15 + 0.1 * Math.sin(frame / 20 + i);
        return (
          <div
            key={`p-${i}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `rgba(${hue},${alpha})`,
              boxShadow: `0 0 ${size * 3}px rgba(${hue},${alpha * 0.5})`,
            }}
          />
        );
      })}

      {/* Pulsing energy orbs */}
      {[
        { cx: "20%", cy: "30%", color: "139,92,246", speed: 0.02 },
        { cx: "75%", cy: "65%", color: "251,191,36", speed: 0.015 },
        { cx: "50%", cy: "85%", color: "239,68,68", speed: 0.025 },
        { cx: "30%", cy: "55%", color: "59,130,246", speed: 0.018 },
      ].map((orb, i) => {
        const pulse = 0.04 + 0.03 * Math.sin(frame * orb.speed * Math.PI * 2);
        const dx = Math.sin(frame / (40 + i * 10)) * 40;
        const dy = Math.cos(frame / (50 + i * 8)) * 30;
        return (
          <div
            key={`orb-${i}`}
            style={{
              position: "absolute",
              left: orb.cx,
              top: orb.cy,
              width: 350,
              height: 350,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${orb.color},${pulse}) 0%, transparent 70%)`,
              transform: `translate(${dx}px, ${dy}px)`,
              filter: "blur(2px)",
            }}
          />
        );
      })}

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Top/bottom gradient for caption readability */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: "linear-gradient(transparent, rgba(0,0,0,0.5))",
        }}
      />
    </AbsoluteFill>
  );
};
