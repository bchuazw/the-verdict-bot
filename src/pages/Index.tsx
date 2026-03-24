import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CaseWorkspace, { type CaseBundle } from "@/components/CaseWorkspace";

const SAMPLES = [
  {
    url: "https://www.reddit.com/r/AmItheAsshole/comments/13xga9y/aita_for_uninviting_my_sister_to_my_wedding/",
    label: "AITA for Uninviting My Sister to My Wedding",
    emoji: "💒",
  },
  {
    url: "https://www.reddit.com/r/AmItheAsshole/comments/1ki8455/aita_for_making_my_sisters_gender_reveal_cake/",
    label: "AITA for making my sister's gender reveal cake grey",
    emoji: "🎂",
  },
];

const Index = () => {
  const [view, setView] = useState<"input" | "loading" | "workspace">("input");
  const [bundle, setBundle] = useState<CaseBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const ingest = async (url: string) => {
    setView("loading");
    setError(null);
    try {
      const res = await fetch("/api/reddit/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Server returned ${res.status}`);
      }
      const data: CaseBundle = await res.json();
      setBundle(data);
      setView("workspace");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setView("input");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* subtle bg gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 pointer-events-none" />

      <div className="relative z-10 px-4 py-8">
        <AnimatePresence mode="wait">
          {/* ── INPUT VIEW ── */}
          {view === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[80vh] max-w-xl mx-auto"
            >
              <h1 className="text-6xl font-black text-orange-500 mb-2 tracking-tight">
                AITAH?!
              </h1>
              <p className="text-zinc-400 text-center mb-10 text-lg">
                Read the post. Hear the comments. Get the verdict.
              </p>

              {/* URL input */}
              <div className="w-full flex gap-2 mb-4">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste a Reddit AITA / AITAH thread URL…"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && urlInput.trim()) ingest(urlInput.trim());
                  }}
                />
                <button
                  onClick={() => urlInput.trim() && ingest(urlInput.trim())}
                  disabled={!urlInput.trim()}
                  className="px-5 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg font-bold text-sm transition-colors"
                >
                  Go
                </button>
              </div>

              <div className="flex items-center gap-3 w-full mb-6">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600">or</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Sample buttons */}
              <div className="w-full flex flex-col gap-2">
                <p className="text-xs text-zinc-500 font-medium mb-1">
                  🎯 Try a sample case
                </p>
                {SAMPLES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => ingest(s.url)}
                    className="w-full py-3 px-4 rounded-lg border border-zinc-700 hover:border-orange-500 bg-zinc-800/50 hover:bg-orange-950/30 text-left text-sm transition-all group"
                  >
                    <span className="text-base mr-2">{s.emoji}</span>
                    <span className="text-zinc-300 group-hover:text-orange-400 transition-colors">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <p className="mt-10 text-[11px] text-zinc-600 text-center">
                AITAH?! · Powered by Firecrawl + ElevenLabs · For entertainment
                only
              </p>
            </motion.div>
          )}

          {/* ── LOADING VIEW ── */}
          {view === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <div className="text-5xl mb-6 animate-bounce">⚖️</div>
              <h2 className="text-xl font-bold text-white mb-2">
                Loading the case…
              </h2>
              <div className="flex flex-col items-center gap-2 text-sm text-zinc-500">
                <LoadingStep text="Fetching Reddit thread" delay={0} />
                <LoadingStep text="Analyzing comments" delay={800} />
                <LoadingStep text="Loading Firecrawl receipts" delay={1600} />
                <LoadingStep text="Generating the debate" delay={2400} />
              </div>
            </motion.div>
          )}

          {/* ── WORKSPACE VIEW ── */}
          {view === "workspace" && bundle && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              <CaseWorkspace
                bundle={bundle}
                onNewCase={() => {
                  setBundle(null);
                  setView("input");
                  setUrlInput("");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function LoadingStep({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.3 }}
      className="flex items-center gap-2"
    >
      <svg
        className="animate-spin h-3.5 w-3.5 text-orange-500"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>{text}</span>
    </motion.div>
  );
}

export default Index;
