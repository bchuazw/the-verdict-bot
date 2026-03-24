import { motion } from 'framer-motion';

const emojis = ['⚖️', '🔨', '📜', '👨‍⚖️', '🏛️', '💀', '🔥', '👀', '🚩', '🤡', '😭', '💅', '🫠', '☕'];

const orbs = [
  { size: 400, x: '10%', y: '20%', color: '--burgundy', delay: 0, duration: 18 },
  { size: 300, x: '70%', y: '60%', color: '--gold', delay: 3, duration: 22 },
  { size: 250, x: '80%', y: '10%', color: '--verdict-nta', delay: 6, duration: 20 },
  { size: 350, x: '20%', y: '80%', color: '--verdict-yta', delay: 2, duration: 25 },
];

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, hsl(var(${orb.color}) / 0.12) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 50, -30, 20, 0],
            y: [0, -40, 30, -20, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--gold) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--gold) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Floating meme emojis */}
      {emojis.map((emoji, i) => (
        <motion.span
          key={`emoji-${i}`}
          className="absolute text-2xl md:text-3xl select-none"
          style={{
            left: `${(i * 7.3) % 90 + 3}%`,
            top: `${(i * 11.7) % 85 + 5}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.15, 0.08, 0.15, 0],
            scale: [0.5, 1, 0.8, 1.1, 0.5],
            y: [0, -30, -10, -40, 0],
            rotate: [0, 10, -5, 15, 0],
          }}
          transition={{
            duration: 12 + (i % 5) * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'easeInOut',
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(var(--gold) / 0.15), transparent)`,
        }}
        animate={{ top: ['-5%', '105%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-gold/10 rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-gold/10 rounded-br-3xl" />
    </div>
  );
}
