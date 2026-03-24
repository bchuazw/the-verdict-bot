import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SeededCase } from '@/lib/types';

interface DebateMessage {
  speaker: string;
  emoji: string;
  color: string;
  label: string;
  text: string;
  reaction?: string;
}

const COURT_SPEAKERS = {
  prosecutor: { emoji: '⚔️', color: '#ef4444', label: 'Prosecution' },
  defense: { emoji: '🛡️', color: '#22c55e', label: 'Defense' },
  comments: { emoji: '🌐', color: '#eab308', label: 'The Internet' },
  clerk: { emoji: '📜', color: '#8b5cf6', label: 'Court Clerk' },
} as const;

const REACTION_MAP: Record<string, string> = {
  prosecutor: '🔥',
  defense: '💡',
  comments: '💀',
};

const FALLBACK_SCRIPT: { speaker: keyof typeof COURT_SPEAKERS; text: string }[] = [
  { speaker: 'prosecutor', text: "I've seen the file. Open and shut. We're not doing a sequel." },
  { speaker: 'defense', text: "Counterpoint — what if there's more to this than meets the eye?" },
  { speaker: 'comments', text: "Everyone's a little wrong here and honestly? I'm entertained." },
  { speaker: 'prosecutor', text: "Gavel dropped. No appeals. Pack it up." },
  { speaker: 'comments', text: "Plot twist: this post left out the spicy half of the story." },
  { speaker: 'defense', text: "Context matters. Always. The defense rests on nuance." },
  { speaker: 'comments', text: "Main character syndrome is carrying this whole narrative." },
  { speaker: 'prosecutor', text: "I'm not your comfort character. I'm your consequence." },
];

interface AgentDebateProps {
  isActive: boolean;
  activeCase?: SeededCase | null;
}

export default function AgentDebate({ isActive, activeCase }: AgentDebateProps) {
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [votingPhase, setVotingPhase] = useState(false);

  const script: DebateMessage[] = useMemo(() => {
    if (activeCase) {
      return activeCase.debateScript.lines.map((line) => {
        const sp = COURT_SPEAKERS[line.speaker] || COURT_SPEAKERS.clerk;
        return {
          speaker: line.speaker,
          emoji: sp.emoji,
          color: sp.color,
          label: sp.label,
          text: line.text,
          reaction: REACTION_MAP[line.speaker],
        };
      });
    }
    return FALLBACK_SCRIPT.map((line) => {
      const sp = COURT_SPEAKERS[line.speaker];
      return {
        speaker: line.speaker,
        emoji: sp.emoji,
        color: sp.color,
        label: sp.label,
        text: line.text,
        reaction: REACTION_MAP[line.speaker],
      };
    });
  }, [activeCase]);

  useEffect(() => {
    if (!isActive) {
      setMessages([]);
      setCurrentIdx(0);
      setVotingPhase(false);
      return;
    }

    if (currentIdx >= script.length) {
      setVotingPhase(true);
      return;
    }

    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, script[currentIdx]]);
      setCurrentIdx((prev) => prev + 1);
    }, 800 + Math.random() * 600);

    return () => clearTimeout(timer);
  }, [isActive, currentIdx, script]);

  if (!isActive) return null;

  const hookText = activeCase?.debateScript.hook;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-3">
          ⚖️
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-display font-black gold-text">
          AITAH?! Court is in session
        </h2>
        {hookText && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto italic"
          >
            "{hookText}"
          </motion.p>
        )}
        <p className="text-sm text-muted-foreground mt-2 font-mono">
          {votingPhase ? '🔨 The court has seen enough…' : 'Prosecution × Defense × The Internet'}
        </p>
      </div>

      {/* Court speaker badges */}
      <div className="flex justify-center gap-3 mb-6">
        {Object.entries(COURT_SPEAKERS).filter(([k]) => k !== 'clerk').map(([key, sp], i) => (
          <motion.div
            key={key}
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', damping: 10 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 relative"
              style={{
                borderColor: `${sp.color}50`,
                background: `${sp.color}15`,
              }}
              animate={
                messages.length > 0 && messages[messages.length - 1]?.speaker === key
                  ? { scale: [1, 1.2, 1], borderColor: [sp.color + '50', sp.color, sp.color + '50'] }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              {sp.emoji}
              {messages.length > 0 && currentIdx < script.length && script[currentIdx]?.speaker === key && (
                <motion.div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: sp.color }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  💬
                </motion.div>
              )}
            </motion.div>
            <span className="text-[10px] text-muted-foreground mt-1 font-mono truncate max-w-[60px] text-center">
              {sp.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Chat messages */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto px-2 scrollbar-thin">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex items-start gap-3"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 border"
                style={{
                  borderColor: `${msg.color}30`,
                  background: `${msg.color}15`,
                }}
              >
                {msg.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold" style={{ color: msg.color }}>
                    {msg.label}
                  </span>
                  {msg.reaction && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="text-sm">
                      {msg.reaction}
                    </motion.span>
                  )}
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-2 text-sm border"
                  style={{
                    background: `${msg.color}08`,
                    borderColor: `${msg.color}20`,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!votingPhase && messages.length < script.length && currentIdx < script.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 pl-11 text-muted-foreground">
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-xs font-mono">
              {COURT_SPEAKERS[script[currentIdx].speaker as keyof typeof COURT_SPEAKERS]?.label || 'Court'} is speaking…
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Verdict loading */}
      <AnimatePresence>
        {votingPhase && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6 text-center">
            <motion.div
              className="verdict-card p-6"
              animate={{
                boxShadow: ['0 0 20px hsl(var(--gold) / 0.1)', '0 0 40px hsl(var(--gold) / 0.2)', '0 0 20px hsl(var(--gold) / 0.1)'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }} className="text-4xl mb-2">
                🔨
              </motion.div>
              <p className="text-sm font-display text-muted-foreground italic">Deliberating…</p>
              <motion.div className="mt-3 flex justify-center gap-1" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-gold"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
