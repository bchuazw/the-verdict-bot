import { useState, useRef, useEffect, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";

interface TranscriptEntry {
  role: "agent" | "user";
  text: string;
  timestamp: number;
}

interface Props {
  postUrl: string;
  postTitle: string;
  caseBundle?: any;
  onClose: () => void;
}

export default function VoiceTrial({ postUrl, postTitle, caseBundle, onClose }: Props) {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      setStatus("connected");
    },
    onDisconnect: () => {
      setStatus("idle");
    },
    onMessage: (msg) => {
      const message = msg as { source?: string; message?: string };
      if (message.message) {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.source === "user" ? "user" : "agent",
            text: message.message!,
            timestamp: Date.now(),
          },
        ]);
      }
    },
    onError: (err) => {
      console.error("Conversation error:", err);
      setErrorMsg(typeof err === "string" ? err : "Connection error");
      setStatus("error");
    },
    onStatusChange: (s) => {
      setIsSpeaking(
        (s as { status?: string }).status === "speaking" || s === ("speaking" as any),
      );
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const startTrial = useCallback(async () => {
    setStatus("connecting");
    setTranscript([]);
    setErrorMsg("");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const res = await fetch("/api/agent/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseBundle ? { caseBundle } : { url: postUrl }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Server returned ${res.status}`);
      }

      const { signedUrl } = await res.json();

      await conversation.startSession({ signedUrl });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to start trial");
      setStatus("error");
    }
  }, [postUrl, conversation]);

  const endTrial = useCallback(async () => {
    await conversation.endSession();
    setStatus("idle");
  }, [conversation]);

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <motion.div
            animate={
              status === "connected"
                ? { rotate: [0, -8, 8, 0] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className="text-3xl"
          >
            {"\u2696\uFE0F"}
          </motion.div>
          <div>
            <h3 className="text-sm font-black text-white tracking-wide">
              JUDGE VERDICT
            </h3>
            <p className="text-[10px] text-zinc-500">
              {status === "connected"
                ? isSpeaking
                  ? "Speaking..."
                  : "Listening..."
                : status === "connecting"
                  ? "Entering courtroom..."
                  : "Voice AI Trial"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "connected" && (
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? "bg-orange-500" : "bg-green-500"
                }`}
              />
              <span className="text-[10px] text-zinc-400 font-mono">LIVE</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Transcript area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {status === "idle" && transcript.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              {"\uD83D\uDD28"}
            </motion.div>
            <div>
              <p className="text-lg font-bold text-white mb-1">
                Ready to put this case on trial?
              </p>
              <p className="text-sm text-zinc-400 max-w-sm">
                Judge Verdict will present prosecution and defense arguments,
                search for evidence using Firecrawl, and deliver a dramatic
                verdict. You can challenge the ruling!
              </p>
            </div>
            <p className="text-xs text-zinc-600 mt-2 max-w-xs">
              "{postTitle}"
            </p>
          </div>
        )}

        {status === "connecting" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-4xl"
            >
              {"\u2696\uFE0F"}
            </motion.div>
            <p className="text-sm text-zinc-400">
              Preparing the courtroom...
            </p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
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
              onClick={startTrial}
              className="text-sm px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        <AnimatePresence>
          {transcript.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                entry.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  entry.role === "user"
                    ? "bg-orange-600/20 border border-orange-600/30 rounded-br-sm"
                    : "bg-zinc-800/80 border border-zinc-700/50 rounded-bl-sm"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-wider">
                    {entry.role === "user" ? (
                      <span className="text-orange-400">YOU</span>
                    ) : (
                      <span className="text-zinc-400">
                        {"\u2696\uFE0F"} JUDGE VERDICT
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  {entry.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {status === "connected" && isSpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2"
          >
            <span className="text-xs text-zinc-500">
              {"\u2696\uFE0F"} Judge Verdict is speaking
            </span>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 16, 4] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-1 bg-orange-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-zinc-800">
        {status === "idle" || status === "error" ? (
          <button
            onClick={startTrial}
            className="w-full py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white transition-all shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2"
          >
            <span className="text-lg">{"\uD83C\uDF99\uFE0F"}</span>
            Start Voice Trial
          </button>
        ) : status === "connecting" ? (
          <div className="w-full py-3.5 rounded-xl font-bold text-base bg-zinc-700 text-zinc-400 text-center cursor-wait">
            Connecting to courtroom...
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
              <motion.div
                animate={
                  !isSpeaking
                    ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }
                    : {}
                }
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${
                  isSpeaking ? "bg-orange-500" : "bg-green-500"
                }`}
              />
              <span className="text-sm text-zinc-300">
                {isSpeaking
                  ? "Judge is speaking... wait for your turn"
                  : "Your turn \u2014 speak now!"}
              </span>
            </div>
            <button
              onClick={endTrial}
              className="px-5 py-3 rounded-xl font-bold text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 transition-all"
            >
              End Trial
            </button>
          </div>
        )}

        {status === "connected" && (
          <p className="text-[10px] text-zinc-600 text-center mt-2">
            Powered by ElevenLabs Conversational AI + Firecrawl Search
          </p>
        )}
      </div>
    </div>
  );
}
