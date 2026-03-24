import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Verdict } from '@/lib/verdict-types';
import { verdictMeta } from '@/lib/verdict-types';
import { triggerVerdictEffect, triggerRainEffect } from '@/lib/verdict-effects';
import AssholeMeter from './AssholeMeter';
import ShareCard from './ShareCard';
import TwitterVideoButton from './TwitterVideoButton';

interface VerdictDisplayProps {
  verdict: Verdict;
  onNewCase: () => void;
}

const verdictGlowMap = {
  NTA: '--verdict-nta',
  YTA: '--verdict-yta',
  ESH: '--verdict-esh',
  NAH: '--verdict-nah',
} as const;

export default function VerdictDisplay({ verdict, onNewCase }: VerdictDisplayProps) {
  const meta = verdictMeta[verdict.type];
  const shareRef = useRef<HTMLDivElement>(null);
  const glowVar = verdictGlowMap[verdict.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (verdict.type === 'NTA' || verdict.type === 'NAH') {
        triggerVerdictEffect(verdict.type);
      }
      let cleanup: (() => void) | undefined;
      if (verdict.type === 'YTA' || verdict.type === 'ESH') {
        cleanup = triggerRainEffect();
      }
      return () => cleanup?.();
    }, 400);
    return () => clearTimeout(timer);
  }, [verdict.type]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: 0.6 + i * 0.2, duration: 0.6, ease: 'easeOut' as const },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="ornament"
      >
        <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium">
          The Council Has Spoken
        </span>
      </motion.div>

      {/* Main verdict card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 15 }}
        className="verdict-card p-10 relative"
        style={{
          boxShadow: `0 20px 60px hsl(var(--navy-deep) / 0.6), 0 0 80px hsl(var(${glowVar}) / 0.08)`,
        }}
      >
        <div className="text-center space-y-5">
          {/* Emoji stamp */}
          <motion.div
            initial={{ scale: 4, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.7, type: 'spring', damping: 10 }}
            className="text-6xl"
          >
            {meta.emoji}
          </motion.div>

          {/* Verdict type */}
          <motion.div
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5, type: 'spring', damping: 10 }}
          >
            <h2
              className={`text-6xl md:text-7xl font-display font-black ${meta.colorClass} tracking-tight`}
              style={{ textShadow: `0 0 40px hsl(var(${glowVar}) / 0.3)` }}
            >
              {verdict.type}
            </h2>
            <div className="ornament mt-3">
              <span className="text-base text-muted-foreground font-display italic">{meta.label}</span>
            </div>
          </motion.div>

          {/* Confidence */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2"
          >
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Council Consensus</span>
            <span className="font-mono font-bold text-lg gold-text">{verdict.confidence}%</span>
          </motion.div>
        </div>

        {/* Asshole meter */}
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="mt-8">
          <AssholeMeter percentage={verdict.assholePercentage} verdictType={verdict.type} />
        </motion.div>
      </motion.div>

      {/* Verdict text */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="verdict-card p-7">
        <div className="ornament mb-4">
          <span className="section-label">📜 The Verdict</span>
        </div>
        <p className="text-foreground leading-relaxed text-base">{verdict.verdictText}</p>
      </motion.div>

      {/* Perspective flip */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="verdict-card p-7">
        <div className="ornament mb-4">
          <span className="section-label">🔄 Perspective Flip</span>
        </div>
        <p className="text-muted-foreground leading-relaxed italic text-base">"{verdict.perspectiveFlip}"</p>
      </motion.div>

      {/* Lesson */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible" className="verdict-card p-7">
        <div className="ornament mb-4">
          <span className="section-label">🎓 The Lesson</span>
        </div>
        <p className="text-foreground leading-relaxed text-base">{verdict.lesson}</p>
      </motion.div>

      {/* One-liner — hero treatment */}
      <motion.div
        custom={4}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="verdict-card p-8 text-center"
        style={{
          boxShadow: `0 20px 60px hsl(var(--navy-deep) / 0.5), 0 0 60px hsl(var(${glowVar}) / 0.06)`,
        }}
      >
        <div className="ornament mb-5">
          <span className="section-label">💬 One-Liner</span>
        </div>
        <p
          className="text-xl md:text-2xl font-display font-bold italic leading-snug"
          style={{ color: `hsl(var(${glowVar}))` }}
        >
          "{verdict.oneLiner}"
        </p>
      </motion.div>

      {/* Twitter Video Button */}
      <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
        <TwitterVideoButton verdict={verdict} />
      </motion.div>

      {/* Share */}
      <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible">
        <ShareCard verdict={verdict} ref={shareRef} />
      </motion.div>

      {/* New case button */}
      <motion.div custom={7} variants={sectionVariants} initial="hidden" animate="visible" className="pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewCase}
          className="gavel-button w-full text-base"
        >
          ⚖️ Judge Another Case
        </motion.button>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground opacity-40 pb-10">
        For entertainment only · Not legal or therapeutic advice · 3 AI agents, zero chill 💀
      </p>
    </motion.div>
  );
}
