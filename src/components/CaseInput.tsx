import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToneType } from '@/lib/verdict-engine';
import { toneOptions } from '@/lib/verdict-engine';
import RedditLinkInput from './RedditLinkInput';
import { SEEDED_CASES } from '@/data/seeded-cases';
import type { SeededCase } from '@/lib/types';

interface CaseInputProps {
  onSubmit: (situation: string, tone: ToneType) => void;
  isLoading: boolean;
  onSeededCase: (seeded: SeededCase) => void;
}

const placeholders = [
  "My roommate keeps eating my labeled food...",
  "I didn't invite my toxic aunt to my wedding...",
  "I told my friend their business idea was bad...",
  "I refused to lend money to my sibling again...",
];

const roastingSubtitles = [
  "Internet drama, tried in public. ⚖️",
  "3 AI lawyers. 1 verdict. Zero mercy. 🔥",
  "Paste the drama. We'll roast it. 💀",
  "Your story. Their arguments. Maximum chaos. 🤡",
];

export default function CaseInput({ onSubmit, isLoading, onSeededCase }: CaseInputProps) {
  const [situation, setSituation] = useState('');
  const [tone, setTone] = useState<ToneType>('sassy');
  const [placeholder] = useState(() => placeholders[Math.floor(Math.random() * placeholders.length)]);
  const [inputMode, setInputMode] = useState<'choose' | 'reddit' | 'manual'>('choose');
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');

  useEffect(() => {
    const text = roastingSubtitles[subtitleIdx % roastingSubtitles.length];
    let i = 0;
    setDisplayedSubtitle('');
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedSubtitle(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setSubtitleIdx((prev) => prev + 1), 3000);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [subtitleIdx]);

  const handleSubmit = () => {
    if (situation.trim().length < 20) return;
    onSubmit(situation.trim(), tone);
  };

  const handleRedditPaste = (url: string) => {
    setSituation(`[Reddit Post] ${url}\n\nAITA for doing something that made my friend upset? So basically, I told them the truth about their cooking and now they won't talk to me. I was just being honest but my other friends say I was too harsh. The food was genuinely bad and I thought they'd want honest feedback rather than fake praise...`);
    setInputMode('manual');
  };

  const handleRandomCase = () => {
    const randomCase = SEEDED_CASES[Math.floor(Math.random() * SEEDED_CASES.length)];
    onSeededCase(randomCase);
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
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, duration: 0.8, type: 'spring', damping: 10 }}
          className="text-7xl mb-4 inline-block"
        >
          <motion.span
            animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="inline-block"
          >
            ⚖️
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-7xl font-display font-black tracking-tight mb-3"
        >
          <motion.span
            className="gold-text inline-block"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AITAH?!
          </motion.span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', damping: 8 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono border"
          style={{
            background: 'hsl(var(--gold) / 0.08)',
            borderColor: 'hsl(var(--gold) / 0.2)',
          }}
        >
          <span className="text-sm">⚔️</span>
          <span className="gold-text font-bold">PROSECUTOR</span>
          <span className="text-muted-foreground">×</span>
          <span className="gold-text font-bold">DEFENSE</span>
          <span className="text-muted-foreground">×</span>
          <span className="gold-text font-bold">THE INTERNET</span>
          <span className="text-sm">🌐</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-base text-muted-foreground font-mono h-6 mt-4"
        >
          {displayedSubtitle}<span className="animate-pulse text-gold">|</span>
        </motion.p>
      </div>

      {/* Seeded Cases Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-8"
      >
        <div className="ornament mb-4">
          <span className="section-label">🔥 Hot Cases</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {SEEDED_CASES.slice(0, 3).map((seeded) => (
            <motion.button
              key={seeded.caseFile.id}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSeededCase(seeded)}
              className="tone-card text-left px-5 py-4 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">
                  {seeded.debateScript.verdict.label === 'NTA' ? '🟢' :
                   seeded.debateScript.verdict.label === 'YTA' ? '🔴' :
                   seeded.debateScript.verdict.label === 'ESH' ? '🟡' : '🔵'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {seeded.caseFile.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {seeded.caseFile.shortSummary}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {seeded.caseFile.topicTags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs gold-text font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  TRY →
                </span>
              </div>
            </motion.button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRandomCase}
          className="w-full mt-3 rounded-xl border border-dashed px-4 py-3 text-sm font-display font-bold transition-all duration-300"
          style={{
            borderColor: 'hsl(var(--gold) / 0.3)',
            background: 'hsl(var(--gold) / 0.03)',
          }}
        >
          <span className="gold-text">🎲 Give me a messy case</span>
        </motion.button>
      </motion.div>

      {/* Input mode selector */}
      <AnimatePresence mode="wait">
        {inputMode === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="ornament mb-4">
              <span className="section-label">📋 Or Present Your Own Case</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setInputMode('reddit')}
                className="tone-card text-center py-8 group"
              >
                <motion.span className="text-5xl block mb-3" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  🔗
                </motion.span>
                <span className="text-base font-display font-bold text-foreground block">Paste Reddit Link</span>
                <span className="text-xs text-muted-foreground mt-1 block">Drop an r/AITA post URL</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setInputMode('manual')}
                className="tone-card text-center py-8 group"
              >
                <motion.span className="text-5xl block mb-3" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  ✍️
                </motion.span>
                <span className="text-base font-display font-bold text-foreground block">Write Your Story</span>
                <span className="text-xs text-muted-foreground mt-1 block">Type your situation directly</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {inputMode === 'reddit' && (
          <motion.div key="reddit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="ornament mb-4">
              <span className="section-label">🔗 Paste Reddit Link</span>
            </div>
            <RedditLinkInput onPaste={handleRedditPaste} onSwitchToManual={() => setInputMode('manual')} />
          </motion.div>
        )}

        {inputMode === 'manual' && (
          <motion.div key="manual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="ornament flex-1">
                <span className="section-label">📋 Present Your Case</span>
              </div>
              <button onClick={() => setInputMode('choose')} className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
                ← Back
              </button>
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
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs text-verdict-nta">
                  ✓ Ready to be judged
                </motion.span>
              )}
            </div>
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
                      <span className={`text-sm font-semibold ${tone === opt.value ? 'gold-text' : 'text-foreground'}`}>{opt.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-7">{opt.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={situation.trim().length < 20 || isLoading}
              className="gavel-button w-full text-lg tracking-wide disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    <motion.span animate={{ rotate: [0, -25, 0, 25, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="text-2xl">🔨</motion.span>
                    Court is now in session...
                  </motion.span>
                ) : (
                  <motion.span key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    ⚖️ Put it on trial
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2 }}
        className="text-center text-xs text-muted-foreground mt-8"
      >
        AITAH?! · Powered by Firecrawl + ElevenLabs · For entertainment only 💀
      </motion.p>
    </motion.div>
  );
}
