import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CaseInput from '@/components/CaseInput';
import VerdictDisplay from '@/components/VerdictDisplay';
import { generateVerdict } from '@/lib/verdict-engine';
import type { ToneType } from '@/lib/verdict-engine';
import type { Verdict } from '@/lib/verdict-types';

const floatingIcons = ['⚖️', '🔨', '📜', '👨‍⚖️', '🏛️'];

const Index = () => {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'input' | 'verdict'>('input');

  const handleSubmit = (situation: string, tone: ToneType) => {
    setIsLoading(true);
    setTimeout(() => {
      const result = generateVerdict(situation, tone);
      setVerdict(result);
      setIsLoading(false);
      setView('verdict');
    }, 2000 + Math.random() * 1500);
  };

  const handleNewCase = () => {
    setVerdict(null);
    setView('input');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative">
      {/* Ambient background glow */}
      <div className="ambient-bg" />

      {/* Dot pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      {/* Floating decorative icons */}
      {floatingIcons.map((icon, i) => (
        <span
          key={i}
          className="floating-icon text-4xl md:text-5xl select-none"
          style={{
            top: `${15 + i * 18}%`,
            left: `${5 + (i % 3) * 35}%`,
            animationDelay: `${i * 3}s`,
            fontSize: `${1.5 + (i % 3) * 0.5}rem`,
          }}
        >
          {icon}
        </span>
      ))}

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {view === 'input' ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <CaseInput onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          ) : verdict ? (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <VerdictDisplay verdict={verdict} onNewCase={handleNewCase} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
