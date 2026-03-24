import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CaseInput from '@/components/CaseInput';
import VerdictDisplay from '@/components/VerdictDisplay';
import AgentDebate from '@/components/AgentDebate';
import AnimatedBackground from '@/components/AnimatedBackground';
import { generateVerdict } from '@/lib/verdict-engine';
import type { ToneType } from '@/lib/verdict-engine';
import type { Verdict } from '@/lib/verdict-types';

const Index = () => {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'input' | 'debating' | 'verdict'>('input');

  const handleSubmit = (situation: string, tone: ToneType) => {
    setIsLoading(true);
    setView('debating');

    // Show debate for ~5 seconds then reveal verdict
    setTimeout(() => {
      const result = generateVerdict(situation, tone);
      setVerdict(result);
      setIsLoading(false);
      setView('verdict');
    }, 9000);
  };

  const handleNewCase = () => {
    setVerdict(null);
    setView('input');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative">
      <AnimatedBackground />

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {view === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <CaseInput onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          )}

          {view === 'debating' && (
            <motion.div
              key="debating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <AgentDebate isActive={true} />
            </motion.div>
          )}

          {view === 'verdict' && verdict && (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <VerdictDisplay verdict={verdict} onNewCase={handleNewCase} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
