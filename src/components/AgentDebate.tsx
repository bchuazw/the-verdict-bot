import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Agent {
  name: string;
  emoji: string;
  color: string;
  role: string;
}

const agents: Agent[] = [
  { name: 'Judge Judy', emoji: '👩‍⚖️', color: '--verdict-yta', role: 'The Hardliner' },
  { name: 'Dr. Phil', emoji: '🧘', color: '--verdict-nta', role: 'The Empath' },
  { name: 'Chaos Goblin', emoji: '🤡', color: '--verdict-esh', role: 'Devil\'s Advocate' },
];

interface DebateMessage {
  agent: Agent;
  text: string;
  reaction?: string;
}

const debateScripts: DebateMessage[][] = [
  [
    { agent: agents[0], text: "I've read the evidence. This is CLEAR cut.", reaction: '🔥' },
    { agent: agents[1], text: "Let's consider their feelings though...", reaction: '💭' },
    { agent: agents[2], text: "Actually, everyone's kinda wrong here lmao", reaction: '💀' },
    { agent: agents[0], text: "The gavel has spoken!", reaction: '🔨' },
    { agent: agents[2], text: "Plot twist: OP left out the important details", reaction: '👀' },
    { agent: agents[1], text: "I sense unresolved childhood trauma here", reaction: '🧠' },
    { agent: agents[2], text: "This is giving main character energy", reaction: '✨' },
    { agent: agents[0], text: "We're not here to coddle anyone.", reaction: '⚖️' },
  ],
];

interface AgentDebateProps {
  isActive: boolean;
}

export default function AgentDebate({ isActive }: AgentDebateProps) {
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [votingPhase, setVotingPhase] = useState(false);
  const script = debateScripts[0];

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
      setMessages(prev => [...prev, script[currentIdx]]);
      setCurrentIdx(prev => prev + 1);
    }, 800 + Math.random() * 600);

    return () => clearTimeout(timer);
  }, [isActive, currentIdx, script]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl mb-3"
        >
          🏛️
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-display font-black gold-text">
          The Council Deliberates
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          {votingPhase ? '📊 Reaching consensus...' : `${agents.length} agents debating...`}
        </p>
      </div>

      {/* Agent avatars */}
      <div className="flex justify-center gap-3 mb-6">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', damping: 10 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 relative"
              style={{
                borderColor: `hsl(var(${agent.color}) / 0.5)`,
                background: `hsl(var(${agent.color}) / 0.1)`,
              }}
              animate={
                messages.length > 0 && messages[messages.length - 1].agent.name === agent.name
                  ? { scale: [1, 1.2, 1], borderColor: [`hsl(var(${agent.color}) / 0.5)`, `hsl(var(${agent.color}))`, `hsl(var(${agent.color}) / 0.5)`] }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              {agent.emoji}
              {/* Typing indicator */}
              {messages.length > 0 && messages.length < script.length && currentIdx < script.length && script[currentIdx].agent.name === agent.name && (
                <motion.div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: `hsl(var(${agent.color}))` }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  💬
                </motion.div>
              )}
            </motion.div>
            <span className="text-[10px] text-muted-foreground mt-1 font-mono truncate max-w-[60px] text-center">
              {agent.role}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Chat messages */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto px-2 scrollbar-thin">
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
                  borderColor: `hsl(var(${msg.agent.color}) / 0.3)`,
                  background: `hsl(var(${msg.agent.color}) / 0.1)`,
                }}
              >
                {msg.agent.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-xs font-bold"
                    style={{ color: `hsl(var(${msg.agent.color}))` }}
                  >
                    {msg.agent.name}
                  </span>
                  {msg.reaction && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="text-sm"
                    >
                      {msg.reaction}
                    </motion.span>
                  )}
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-2 text-sm border"
                  style={{
                    background: `hsl(var(${msg.agent.color}) / 0.05)`,
                    borderColor: `hsl(var(${msg.agent.color}) / 0.15)`,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {!votingPhase && messages.length < script.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 pl-11 text-muted-foreground"
          >
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-xs font-mono"
            >
              someone is typing...
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Voting phase animation */}
      <AnimatePresence>
        {votingPhase && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <motion.div
              className="verdict-card p-6"
              animate={{
                boxShadow: [
                  '0 0 20px hsl(var(--gold) / 0.1)',
                  '0 0 40px hsl(var(--gold) / 0.2)',
                  '0 0 20px hsl(var(--gold) / 0.1)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                className="text-4xl mb-2"
              >
                🔨
              </motion.div>
              <p className="text-sm font-display text-muted-foreground italic">
                The council has reached a verdict...
              </p>
              <motion.div
                className="mt-3 flex justify-center gap-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {['⬛', '⬛', '⬛'].map((_, i) => (
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
