import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToneType } from '@/lib/verdict-engine';
import { toneOptions } from '@/lib/verdict-engine';

interface CaseInputProps {
  onSubmit: (situation: string, tone: ToneType) => void;
  isLoading: boolean;
}

const placeholders = [
  "My roommate keeps eating my labeled food...",
  "I didn't invite my toxic aunt to my wedding...",
  "I got promoted over the coworker who trained me...",
  "I told my friend their business idea was bad...",
  "I refused to lend money to my sibling again...",
];

const typingTexts = [
  "Tell the court what happened...",
  "Describe the situation honestly...",
  "Spill the tea, the whole cup...",
];

export default function CaseInput({ onSubmit, isLoading }: CaseInputProps) {
  const [situation, setSituation] = useState('');
  const [tone, setTone] = useState<ToneType>('sassy');
  const [placeholder] = useState(() => placeholders[Math.floor(Math.random() * placeholders.length)]);
  const [typingText, setTypingText] = useState('');
  const [typingIdx, setTypingIdx] = useState(0);

  // Animated typing effect for subtitle
  useEffect(() => {
    const text = typingTexts[typingIdx % typingTexts.length];
    let i = 0;
    setTypingText('');
    const interval = setInterval(() => {
      if (i <= text.length) {
        setTypingText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setTypingIdx(prev => prev + 1), 3000);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [typingIdx]);

  const handleSubmit = () => {
    if (situation.trim().length < 20) return;
    onSubmit(situation.trim(), tone);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, duration: 0.8, type: 'spring', damping: 10 }}
          className="text-7xl mb-6 inline-block"
        >
          ⚖️
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-6xl font-display font-black tracking-tight mb-4"
        >
          <span className="gold-text">Am I The</span>
          <br />
          <span className="gold-text">Asshole?</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="ornament mb-4"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI Judge</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-base text-muted-foreground font-mono h-6"
        >
          {typingText}<span className="animate-pulse">|</span>
        </motion.p>
      </div>

      {/* Input */}
      <div className="space-y-5">
        <div className="ornament mb-1">
          <span className="section-label">📋 Present Your Case</span>
        </div>

        <textarea
          className="input-court min-h-[160px]"
          placeholder={placeholder}
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          maxLength={2000}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground font-mono">
            {situation.length}<span className="opacity-40">/2000</span>
            {situation.length > 0 && situation.length < 20 && (
              <span className="ml-2 text-verdict-yta">· {20 - situation.length} more chars needed</span>
            )}
          </span>
          {situation.length >= 20 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-verdict-nta"
            >
              ✓ Ready
            </motion.span>
          )}
        </div>

        {/* Tone selector */}
        <div>
          <div className="ornament mb-4">
            <span className="section-label">🎭 Judge's Tone</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {toneOptions.map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTone(opt.value)}
                disabled={isLoading}
                className={`tone-card ${tone === opt.value ? 'tone-card-active' : ''} disabled:opacity-50`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{opt.emoji}</span>
                  <span className={`text-sm font-semibold ${tone === opt.value ? 'gold-text' : 'text-foreground'}`}>
                    {opt.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-7">{opt.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={situation.trim().length < 20 || isLoading}
          className="gavel-button w-full text-lg tracking-wide disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <motion.span
                  animate={{ rotate: [0, -25, 0, 25, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="text-2xl"
                >
                  🔨
                </motion.span>
                The Court Is Deliberating...
              </motion.span>
            ) : (
              <motion.span
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                🔨 Deliver The Verdict
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2 }}
        className="text-center text-xs text-muted-foreground mt-8"
      >
        For entertainment only · The AI Judge is sassy, not a therapist
      </motion.p>
    </motion.div>
  );
}
