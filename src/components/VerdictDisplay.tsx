import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Verdict } from '@/lib/verdict-types';
import { verdictMeta, verdictBgMap } from '@/lib/verdict-types';
import { triggerVerdictEffect, triggerRainEffect } from '@/lib/verdict-effects';
import AssholeMeter from './AssholeMeter';
import ShareCard from './ShareCard';

interface VerdictDisplayProps {
  verdict: Verdict;
  onNewCase: () => void;
}

export default function VerdictDisplay({ verdict, onNewCase }: VerdictDisplayProps) {
  const meta = verdictMeta[verdict.type];
  const shareRef = useRef<HTMLDivElement>(null);

  const sectionVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: 0.5 + i * 0.25, duration: 0.5, ease: 'easeOut' as const },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium"
      >
        ⚖️ The Court Has Reached A Decision
      </motion.p>

      {/* Verdict stamp */}
      <div className="verdict-card p-8">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 3, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', damping: 12 }}
          >
            <span className="text-5xl">{meta.emoji}</span>
          </motion.div>
          <motion.div
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', damping: 10 }}
          >
            <h2 className={`text-5xl md:text-6xl font-display font-black ${meta.colorClass}`}>
              {verdict.type}
            </h2>
            <p className="text-lg text-muted-foreground font-display italic mt-1">{meta.label}</p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            Confidence: <span className="font-mono font-bold gold-text">{verdict.confidence}%</span>
          </motion.p>
        </div>

        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="mt-6">
          <AssholeMeter percentage={verdict.assholePercentage} verdictType={verdict.type} />
        </motion.div>
      </div>

      {/* Verdict text */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="verdict-card p-6 space-y-1">
        <h3 className="text-xs uppercase tracking-[0.2em] gold-text font-semibold mb-2">📜 The Verdict</h3>
        <p className="text-foreground leading-relaxed">{verdict.verdictText}</p>
      </motion.div>

      {/* Perspective flip */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="verdict-card p-6 space-y-1">
        <h3 className="text-xs uppercase tracking-[0.2em] gold-text font-semibold mb-2">🔄 Perspective Flip</h3>
        <p className="text-muted-foreground leading-relaxed italic">"{verdict.perspectiveFlip}"</p>
      </motion.div>

      {/* Lesson */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible" className="verdict-card p-6 space-y-1">
        <h3 className="text-xs uppercase tracking-[0.2em] gold-text font-semibold mb-2">🎓 The Lesson</h3>
        <p className="text-foreground leading-relaxed">{verdict.lesson}</p>
      </motion.div>

      {/* One-liner */}
      <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible" className="verdict-card p-6 text-center">
        <h3 className="text-xs uppercase tracking-[0.2em] gold-text font-semibold mb-3">💬 One-Liner</h3>
        <p className="text-xl md:text-2xl font-display font-bold text-foreground italic">
          "{verdict.oneLiner}"
        </p>
      </motion.div>

      {/* Share card */}
      <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
        <ShareCard verdict={verdict} ref={shareRef} />
      </motion.div>

      {/* Actions */}
      <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible" className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewCase}
          className="gavel-button flex-1 text-base"
        >
          ⚖️ New Case
        </motion.button>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground opacity-50 pb-8">
        For entertainment only · Not legal or therapeutic advice
      </p>
    </motion.div>
  );
}
