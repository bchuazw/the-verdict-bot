import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CaseInput from '@/components/CaseInput';
import VerdictDisplay from '@/components/VerdictDisplay';
import { generateVerdict } from '@/lib/verdict-engine';
import type { Verdict } from '@/lib/verdict-types';

const Index = () => {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'input' | 'verdict'>('input');

  const handleSubmit = (situation: string) => {
    setIsLoading(true);
    // Simulate deliberation
    setTimeout(() => {
      const result = generateVerdict(situation);
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      <AnimatePresence mode="wait">
        {view === 'input' ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
          >
            <CaseInput onSubmit={handleSubmit} isLoading={isLoading} />
          </motion.div>
        ) : verdict ? (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.4 }}
          >
            <VerdictDisplay verdict={verdict} onNewCase={handleNewCase} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Index;
