import { motion } from 'framer-motion';
import type { VerdictType } from '@/lib/verdict-types';
import { verdictBgMap } from '@/lib/verdict-types';

interface AssholeMeterProps {
  percentage: number;
  verdictType: VerdictType;
}

export default function AssholeMeter({ percentage, verdictType }: AssholeMeterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Asshole Meter</span>
        <span className="font-mono font-bold gold-text">{percentage}%</span>
      </div>
      <div className="meter-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.8 }}
          className={`h-full rounded-full ${verdictBgMap[verdictType]}`}
          style={{ boxShadow: `0 0 12px hsl(var(--verdict-${verdictType.toLowerCase()}) / 0.5)` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
