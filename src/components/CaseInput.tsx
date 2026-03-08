import { useState } from 'react';
import { motion } from 'framer-motion';

interface CaseInputProps {
  onSubmit: (situation: string) => void;
  isLoading: boolean;
}

const placeholders = [
  "My roommate keeps eating my labeled food...",
  "I didn't invite my toxic aunt to my wedding...",
  "I got promoted over the coworker who trained me...",
  "I told my friend their business idea was bad...",
  "I refused to lend money to my sibling again...",
];

export default function CaseInput({ onSubmit, isLoading }: CaseInputProps) {
  const [situation, setSituation] = useState('');
  const [placeholder] = useState(() => placeholders[Math.floor(Math.random() * placeholders.length)]);

  const handleSubmit = () => {
    if (situation.trim().length < 20) return;
    onSubmit(situation.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-6xl mb-4"
        >
          ⚖️
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-3">
          <span className="gold-text">Am I The Asshole?</span>
        </h1>
        <p className="text-lg font-display italic text-muted-foreground">
          AI Judge — "Let AI settle your disputes"
        </p>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
          📋 Present Your Case
        </label>
        <textarea
          className="input-court min-h-[180px]"
          placeholder={placeholder}
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          maxLength={2000}
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {situation.length}/2000 {situation.length < 20 && situation.length > 0 && '· Minimum 20 characters'}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={situation.trim().length < 20 || isLoading}
          className="gavel-button w-full text-lg tracking-wide disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <motion.span
                animate={{ rotate: [0, -20, 0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-2xl"
              >
                🔨
              </motion.span>
              The Court Is Deliberating...
            </>
          ) : (
            <>
              🔨 Deliver The Verdict
            </>
          )}
        </motion.button>
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-muted-foreground mt-6 opacity-60">
        For entertainment only. The AI Judge is sassy, not a therapist.
      </p>
    </motion.div>
  );
}
