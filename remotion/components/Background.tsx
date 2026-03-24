import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const gradientAngle = interpolate(frame, [0, 900], [135, 225], {
    extrapolateRight: "extend",
  });

  const pulse = interpolate(frame % 90, [0, 45, 90], [0.03, 0.08, 0.03]);

  return (
    <AbsoluteFill>
      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${gradientAngle}deg, #0a0e1a 0%, #111827 40%, #1a1025 70%, #0f172a 100%)`,
        }}
      />

      {/* Floating orbs */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(139, 92, 246, ${pulse}) 0%, transparent 70%)`,
          transform: `translate(${Math.sin(frame / 60) * 30}px, ${Math.cos(frame / 80) * 20}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "5%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(217, 161, 55, ${pulse * 0.7}) 0%, transparent 70%)`,
          transform: `translate(${Math.cos(frame / 70) * 25}px, ${Math.sin(frame / 90) * 15}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "30%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(220, 38, 38, ${pulse * 0.5}) 0%, transparent 70%)`,
          transform: `translate(${Math.sin(frame / 50) * 20}px, ${Math.cos(frame / 60) * 25}px)`,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          transform: `translateY(${-frame * 0.3}px)`,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
