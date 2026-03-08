import { motion } from 'framer-motion';
import type { VerdictType } from '@/lib/verdict-types';
import { verdictBgMap } from '@/lib/verdict-types';

interface AssholeMeterProps {
  percentage: number;
  verdictType: VerdictType;
}

const glowMap: Record<VerdictType, string> = {
  NTA: '--verdict-nta',
  YTA: '--verdict-yta',
  ESH: '--verdict-esh',
  NAH: '--verdict-nah',
};

export default function AssholeMeter({ percentage, verdictType }: AssholeMeterProps) {
  const glow = glowMap[verdictType];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="section-label text-xs">Asshole Meter</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="font-mono font-bold text-lg gold-text"
        >
          {percentage}%
        </motion.span>
      </div>
      <div className="meter-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.8 }}
          className={`h-full rounded-full ${verdictBgMap[verdictType]} relative`}
          style={{
            boxShadow: `0 0 16px hsl(var(${glow}) / 0.6), 0 0 4px hsl(var(${glow}) / 0.3)`,
          }}
        >
          {/* Shine effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 60%)',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
