import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Verdict } from '@/lib/verdict-types';
import { verdictMeta } from '@/lib/verdict-types';
import { triggerVerdictEffect, triggerRainEffect } from '@/lib/verdict-effects';
import AssholeMeter from './AssholeMeter';
import ShareCard from './ShareCard';
import type { SeededCase } from '@/lib/types';

interface VerdictDisplayProps {
  verdict: Verdict;
  onNewCase: () => void;
  activeCase?: SeededCase | null;
}

const verdictGlowMap = {
  NTA: '--verdict-nta',
  YTA: '--verdict-yta',
  ESH: '--verdict-esh',
  NAH: '--verdict-nah',
} as const;

export default function VerdictDisplay({ verdict, onNewCase, activeCase }: VerdictDisplayProps) {
  const meta = verdictMeta[verdict.type];
  const shareRef = useRef<HTMLDivElement>(null);
  const glowVar = verdictGlowMap[verdict.type];

  const pettyScore = verdict.pettyScore ?? Math.floor(Math.random() * 8) + 2;
  const redFlagCount = verdict.redFlagCount ?? Math.floor(Math.random() * 5) + 1;

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ornament">
        <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium">
          The Court Has Spoken
        </span>
      </motion.div>

      {/* Main verdict card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 15 }}
        className="verdict-card p-10 relative"
        style={{ boxShadow: `0 20px 60px hsl(var(--navy-deep) / 0.6), 0 0 80px hsl(var(${glowVar}) / 0.08)` }}
      >
        <div className="text-center space-y-5">
          <motion.div
            initial={{ scale: 4, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.7, type: 'spring', damping: 10 }}
            className="text-6xl"
          >
            {meta.emoji}
          </motion.div>
          <motion.div initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25, duration: 0.5, type: 'spring', damping: 10 }}>
            <h2 className={`text-6xl md:text-7xl font-display font-black ${meta.colorClass} tracking-tight`} style={{ textShadow: `0 0 40px hsl(var(${glowVar}) / 0.3)` }}>
              {verdict.type}
            </h2>
            <div className="ornament mt-3">
              <span className="text-base text-muted-foreground font-display italic">{meta.label}</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</span>
            <span className="font-mono font-bold text-lg gold-text">{verdict.confidence}%</span>
          </motion.div>
        </div>

        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="mt-8">
          <AssholeMeter percentage={verdict.assholePercentage} verdictType={verdict.type} />
        </motion.div>
      </motion.div>

      {/* Petty Score + Red Flag Count */}
      <motion.div custom={0.5} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 gap-4">
          <div className="verdict-card p-6 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Petty Score</div>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className={`w-3 h-6 rounded-sm ${i < pettyScore ? 'bg-gradient-to-t from-yellow-600 to-yellow-400' : 'bg-secondary'}`}
                />
              ))}
            </div>
            <span className="font-mono font-bold text-lg gold-text mt-2 block">{pettyScore}/10</span>
          </div>
          <div className="verdict-card p-6 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Red Flags</div>
            <div className="flex items-center justify-center gap-1 text-2xl">
              {Array.from({ length: redFlagCount }).map((_, i) => (
                <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}>
                  🚩
                </motion.span>
              ))}
            </div>
            <span className="font-mono font-bold text-lg text-red-400 mt-2 block">{redFlagCount} found</span>
          </div>
        </div>
      </motion.div>

      {/* Verdict text */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="verdict-card p-7">
        <div className="ornament mb-4">
          <span className="section-label">📜 The Verdict</span>
        </div>
        <p className="text-foreground leading-relaxed text-base">{verdict.verdictText}</p>
      </motion.div>

      {/* One-liner */}
      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="verdict-card p-8 text-center"
        style={{ boxShadow: `0 20px 60px hsl(var(--navy-deep) / 0.5), 0 0 60px hsl(var(${glowVar}) / 0.06)` }}
      >
        <div className="ornament mb-5">
          <span className="section-label">🔥 Closing Roast</span>
        </div>
        <p className="text-xl md:text-2xl font-display font-bold italic leading-snug" style={{ color: `hsl(var(${glowVar}))` }}>
          "{verdict.oneLiner}"
        </p>
      </motion.div>

      {/* Evidence receipts if seeded case */}
      {activeCase && (
        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible" className="verdict-card p-7">
          <div className="ornament mb-4">
            <span className="section-label">🔍 Firecrawl Receipts</span>
          </div>
          <div className="space-y-3">
            {activeCase.evidencePack.cards.map((card) => (
              <div key={card.id} className="rounded-xl border border-border p-4" style={{ background: 'hsl(var(--secondary))' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                    {card.sourceType}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{card.sourceTitle}</span>
                </div>
                <p className="text-sm text-foreground italic">"{card.quote}"</p>
              </div>
            ))}
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono pt-2">
              <span>✓ Scraped</span>
              <span>✓ Searched</span>
              <span>{activeCase.evidencePack.cards.length} receipts loaded</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Share */}
      <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
        <ShareCard verdict={verdict} ref={shareRef} />
      </motion.div>

      {/* CTA */}
      {activeCase && (
        <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
          <div className="verdict-card p-6 text-center">
            <p className="text-lg font-display font-bold gold-text">{activeCase.debateScript.cta}</p>
          </div>
        </motion.div>
      )}

      {/* New case button */}
      <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible" className="pt-2">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onNewCase} className="gavel-button w-full text-base">
          ⚖️ Try Another Case
        </motion.button>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground opacity-40 pb-10">
        For entertainment only · Main Character Court · Powered by Firecrawl + ElevenLabs 💀
      </p>
    </motion.div>
  );
}
