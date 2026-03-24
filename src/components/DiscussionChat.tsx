import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatMessage {
  id: string;
  speaker: "system" | "prosecutor" | "defense" | "internet" | "verdict";
  displayName: string;
  text: string;
  source?: { author: string; score: number };
  color: string;
}

interface Props {
  messages: ChatMessage[];
  autoPlay?: boolean;
  delayMs?: number;
}

const SPEAKER_META: Record<
  string,
  { emoji: string; bg: string; border: string }
> = {
  system: { emoji: "⚖️", bg: "bg-zinc-800/80", border: "border-orange-500/40" },
  prosecutor: { emoji: "🔴", bg: "bg-red-950/60", border: "border-red-500/50" },
  defense: { emoji: "🟢", bg: "bg-green-950/60", border: "border-green-500/50" },
  internet: { emoji: "🌐", bg: "bg-purple-950/60", border: "border-purple-500/50" },
  verdict: { emoji: "⚖️", bg: "bg-amber-950/60", border: "border-amber-400/60" },
};

export default function DiscussionChat({
  messages,
  autoPlay = true,
  delayMs = 2200,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(autoPlay ? 0 : messages.length);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoPlay) return;
    setVisibleCount(0);
    const first = setTimeout(() => setVisibleCount(1), 600);
    return () => clearTimeout(first);
  }, [messages, autoPlay]);

  useEffect(() => {
    if (!autoPlay || visibleCount === 0 || visibleCount >= messages.length) return;
    const next = setTimeout(
      () => setVisibleCount((p) => p + 1),
      delayMs + (messages[visibleCount - 1]?.speaker === "verdict" ? 1200 : 0),
    );
    return () => clearTimeout(next);
  }, [visibleCount, messages, autoPlay, delayMs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);

  const visible = messages.slice(0, visibleCount);
  const isTyping = autoPlay && visibleCount < messages.length;

  return (
    <div className="flex flex-col gap-3 px-2 py-4 overflow-y-auto max-h-[70vh]">
      <AnimatePresence>
        {visible.map((msg) => {
          const meta = SPEAKER_META[msg.speaker] ?? SPEAKER_META.system;
          const isVerdict = msg.speaker === "verdict";
          const isSystem = msg.speaker === "system";

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`rounded-xl border p-4 ${meta.bg} ${meta.border} ${
                isVerdict ? "text-center my-4" : ""
              }`}
            >
              {/* speaker label */}
              {!isSystem && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{meta.emoji}</span>
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: msg.color }}
                  >
                    {msg.displayName}
                  </span>
                  {msg.source && (
                    <span className="text-[11px] text-zinc-500 ml-auto">
                      citing u/{msg.source.author} · ⬆{" "}
                      {msg.source.score.toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* message body */}
              <p
                className={`leading-relaxed ${
                  isVerdict
                    ? "text-2xl font-black"
                    : isSystem
                      ? "text-sm text-zinc-400"
                      : "text-[15px] text-zinc-200"
                }`}
                style={isVerdict ? { color: msg.color } : undefined}
              >
                {msg.text}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* typing indicator */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2 text-zinc-500 text-sm"
        >
          <span className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
          <span>
            {messages[visibleCount]?.displayName ?? "Someone"} is typing…
          </span>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
