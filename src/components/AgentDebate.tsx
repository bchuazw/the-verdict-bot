import { useState, useRef, useEffect, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";

interface DebateEntry {
  id: string;
  speaker: "system" | "prosecutor" | "defense" | "verdict";
  displayName: string;
  text: string;
  color: string;
}

interface Props {
  caseBundle: any;
  onDebateComplete?: (messages: DebateEntry[]) => void;
}

const PROMPTS = [
  { target: "prosecutor", text: "Present your opening argument. Why is the OP the asshole?" },
  { target: "defense", text: "The prosecution just argued. Present your rebuttal — why is OP NOT the asshole?" },
  { target: "prosecutor", text: "The defense has responded. Hit back with your strongest evidence. Search the web if needed." },
  { target: "defense", text: "Counter the prosecution's latest point. Use evidence from the web if helpful." },
  { target: "prosecutor", text: "Give your closing statement. Make it memorable." },
  { target: "defense", text: "Give your closing statement. Make it count." },
];

const SPEAKER_META = {
  system: { emoji: "\u2696\uFE0F", bg: "bg-zinc-800/80", border: "border-orange-500/40", label: "COURT" },
  prosecutor: { emoji: "\uD83D\uDD34", bg: "bg-red-950/60", border: "border-red-500/50", label: "PROSECUTION" },
  defense: { emoji: "\uD83D\uDFE2", bg: "bg-green-950/60", border: "border-green-500/50", label: "DEFENSE" },
  verdict: { emoji: "\u2696\uFE0F", bg: "bg-amber-950/60", border: "border-amber-400/60", label: "VERDICT" },
};

export default function AgentDebate({ caseBundle, onDebateComplete }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "done" | "error">("idle");
  const [messages, setMessages] = useState<DebateEntry[]>([]);
  const [currentRound, setCurrentRound] = useState(-1);
  const [errorMsg, setErrorMsg] = useState("");
  const [waitingFor, setWaitingFor] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prosUrlRef = useRef<string>("");
  const defUrlRef = useRef<string>("");
  const roundRef = useRef(0);
  const msgsRef = useRef<DebateEntry[]>([]);
  const prosConnectedRef = useRef(false);
  const defConnectedRef = useRef(false);

  const addMsg = useCallback((entry: DebateEntry) => {
    msgsRef.current = [...msgsRef.current, entry];
    setMessages([...msgsRef.current]);
  }, []);

  const prosecutor = useConversation({
    onConnect: () => { prosConnectedRef.current = true; },
    onDisconnect: () => { prosConnectedRef.current = false; },
    onMessage: (msg) => {
      const m = msg as { source?: string; message?: string };
      if (m.message && m.source !== "user") {
        addMsg({
          id: `pros-${Date.now()}`,
          speaker: "prosecutor",
          displayName: "The Prosecutor",
          text: m.message,
          color: "#ef4444",
        });
        setWaitingFor(null);
      }
    },
    onError: (err) => {
      console.error("Prosecutor error:", err);
    },
  });

  const defense = useConversation({
    onConnect: () => { defConnectedRef.current = true; },
    onDisconnect: () => { defConnectedRef.current = false; },
    onMessage: (msg) => {
      const m = msg as { source?: string; message?: string };
      if (m.message && m.source !== "user") {
        addMsg({
          id: `def-${Date.now()}`,
          speaker: "defense",
          displayName: "The Defense",
          text: m.message,
          color: "#22c55e",
        });
        setWaitingFor(null);
      }
    },
    onError: (err) => {
      console.error("Defense error:", err);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startDebate = useCallback(async () => {
    setStatus("loading");
    setMessages([]);
    msgsRef.current = [];
    setErrorMsg("");
    setShowConfetti(false);
    roundRef.current = 0;

    try {
      addMsg({
        id: "sys-0",
        speaker: "system",
        displayName: "COURT",
        text: `Case loaded: "${caseBundle.post.title}" \u2014 ${caseBundle.jury?.analyzedCount ?? 0} Reddit jurors have weighed in.`,
        color: "#ff4500",
      });

      const res = await fetch("/api/agent/start-debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseBundle }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Server returned ${res.status}`);
      }

      const { prosecutorSignedUrl, defenseSignedUrl } = await res.json();
      prosUrlRef.current = prosecutorSignedUrl;
      defUrlRef.current = defenseSignedUrl;

      await Promise.all([
        prosecutor.startSession({ signedUrl: prosecutorSignedUrl, overrides: { conversation: { textOnly: true } } }),
        defense.startSession({ signedUrl: defenseSignedUrl, overrides: { conversation: { textOnly: true } } }),
      ]);

      setStatus("running");
      setCurrentRound(0);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to start debate");
      setStatus("error");
    }
  }, [caseBundle, prosecutor, defense, addMsg]);

  useEffect(() => {
    if (status !== "running" || currentRound < 0 || currentRound >= PROMPTS.length) return;
    if (waitingFor) return;

    const prompt = PROMPTS[currentRound];
    if (!prompt) return;

    const timer = setTimeout(() => {
      const lastMsg = msgsRef.current[msgsRef.current.length - 1];
      const contextFromOtherSide = lastMsg && lastMsg.speaker !== "system"
        ? ` They said: "${lastMsg.text.slice(0, 200)}"`
        : "";

      const fullPrompt = prompt.text + contextFromOtherSide;

      if (prompt.target === "prosecutor") {
        setWaitingFor("prosecutor");
        prosecutor.sendUserMessage({ text: fullPrompt });
      } else {
        setWaitingFor("defense");
        defense.sendUserMessage({ text: fullPrompt });
      }
    }, currentRound === 0 ? 2000 : 3000);

    return () => clearTimeout(timer);
  }, [status, currentRound, waitingFor, prosecutor, defense]);

  useEffect(() => {
    if (waitingFor === null && status === "running" && currentRound >= 0) {
      const nextRound = currentRound + 1;
      if (nextRound >= PROMPTS.length) {
        const label = caseBundle.jury?.majorityVerdict ?? "NTA";
        const conf = caseBundle.jury?.analyzedCount > 0
          ? Math.round(((caseBundle.jury.verdictCounts?.[label] ?? 0) / caseBundle.jury.analyzedCount) * 100)
          : 75;
        const verdictColor = label === "NTA" ? "#22c55e" : label === "YTA" ? "#ef4444" : "#f59e0b";

        const timer = setTimeout(() => {
          addMsg({
            id: "verdict-final",
            speaker: "verdict",
            displayName: "THE VERDICT",
            text: `${label} \u2014 ${conf}% confidence. Both AI agents have presented their cases. The internet has spoken.`,
            color: verdictColor,
          });
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2600);
          setStatus("done");
          prosecutor.endSession();
          defense.endSession();
          onDebateComplete?.(msgsRef.current);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setCurrentRound(nextRound);
      }
    }
  }, [waitingFor, status, currentRound, caseBundle, prosecutor, defense, addMsg, onDebateComplete]);

  const meta = (speaker: string) => SPEAKER_META[speaker as keyof typeof SPEAKER_META] ?? SPEAKER_META.system;

  return (
    <div className="flex flex-col h-full min-h-[500px] relative">
      {showConfetti && (
        <div className="confetti-wrap" aria-hidden>
          {Array.from({ length: 42 }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${(i * 97) % 100}%`,
                background: i % 4 === 0
                  ? "#f43f5e"
                  : i % 4 === 1
                    ? "#f59e0b"
                    : i % 4 === 2
                      ? "#22d3ee"
                      : "#a78bfa",
                animationDelay: `${(i % 10) * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{"\u2694\uFE0F"}</span>
          <div>
            <h3 className="text-sm font-black text-white tracking-wide">
              AI TRIAL \u2014 AGENT VS AGENT
            </h3>
            <p className="text-[10px] text-zinc-500">
              {status === "running"
                ? waitingFor
                  ? `${waitingFor === "prosecutor" ? "Prosecution" : "Defense"} is arguing...`
                  : `Round ${Math.min(currentRound + 1, PROMPTS.length)}/${PROMPTS.length}`
                : status === "done"
                  ? "Trial complete"
                  : status === "loading"
                    ? "Preparing courtroom..."
                    : "Two ElevenLabs agents debate the case"}
            </p>
          </div>
        </div>
        {status === "running" && (
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-orange-500"
            />
            <span className="text-[10px] text-zinc-400 font-mono">LIVE</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="flex gap-4 text-5xl">
              <span>{"\uD83D\uDD34"}</span>
              <span className="text-zinc-500">vs</span>
              <span>{"\uD83D\uDFE2"}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white mb-1">
                AI Prosecutor vs AI Defense Attorney
              </p>
              <p className="text-sm text-zinc-400 max-w-sm">
                Two ElevenLabs agents will debate this case, using Firecrawl
                to search the internet for evidence. Watch the trial unfold live.
              </p>
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-4xl"
            >
              {"\u2696\uFE0F"}
            </motion.div>
            <p className="text-sm text-zinc-400">Summoning the AI lawyers...</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-orange-500"
                />
              ))}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-4xl">{"\u274C"}</span>
            <p className="text-sm text-red-400">{errorMsg}</p>
            <button
              onClick={startDebate}
              className="text-sm px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => {
            const m = meta(msg.speaker);
            const isVerdict = msg.speaker === "verdict";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`rounded-xl border p-4 ${m.bg} ${m.border} ${isVerdict ? "text-center my-4" : ""}`}
              >
                {msg.speaker !== "system" && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{m.emoji}</span>
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: msg.color }}
                    >
                      {msg.displayName}
                    </span>
                    <span className="text-[10px] text-zinc-600 ml-auto">ElevenLabs Agent</span>
                  </div>
                )}
                <p
                  className={`leading-relaxed ${
                    isVerdict
                      ? "text-2xl font-black"
                      : msg.speaker === "system"
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

        {waitingFor && (
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
              {waitingFor === "prosecutor" ? "The Prosecutor" : "The Defense"} is arguing...
            </span>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800">
        {status === "idle" || status === "error" ? (
          <button
            onClick={startDebate}
            className="w-full click-jiggle py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-red-600 via-orange-600 to-green-600 hover:from-red-500 hover:via-orange-500 hover:to-green-500 text-white transition-all shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2"
          >
            <span className="text-lg">{"\u2694\uFE0F"}</span>
            Start AI Trial
          </button>
        ) : status === "loading" ? (
          <div className="w-full py-3.5 rounded-xl font-bold text-base bg-zinc-700 text-zinc-400 text-center cursor-wait">
            Connecting agents...
          </div>
        ) : status === "done" ? (
          <div className="w-full py-3.5 rounded-xl font-bold text-base bg-zinc-800 text-zinc-300 text-center border border-zinc-700">
            Trial complete \u2014 switch to Voice Trial to challenge the verdict
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-orange-500"
            />
            <span className="text-sm text-zinc-300">
              Round {Math.min(currentRound + 1, PROMPTS.length)}/{PROMPTS.length} \u2014 agents are debating live
            </span>
          </div>
        )}

        <p className="text-[10px] text-zinc-600 text-center mt-2">
          Powered by ElevenLabs Conversational AI Agents + Firecrawl Search
        </p>
      </div>
    </div>
  );
}
