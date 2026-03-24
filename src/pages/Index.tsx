import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CaseWorkspace, { type CaseBundle } from "@/components/CaseWorkspace";

const SAMPLES = [
  {
    url: "https://www.reddit.com/r/AmItheAsshole/comments/13xga9y/aita_for_uninviting_my_sister_to_my_wedding/",
    label: "Uninvited my sister to my wedding after she hijacked the engagement party",
    emoji: "💒",
    heat: "HOT",
  },
  {
    url: "https://www.reddit.com/r/AmItheAsshole/comments/1ki8455/aita_for_making_my_sisters_gender_reveal_cake/",
    label: "Made my sister's gender reveal cake grey because nobody told me the gender",
    emoji: "🎂",
    heat: "VIRAL",
  },
];

const REDDIT_URL_RE =
  /^https?:\/\/(www\.)?reddit\.com\/r\/\w+\/comments\/\w+/i;

function validateRedditUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "Please enter a URL.";
  try {
    const u = new URL(trimmed);
    if (!["http:", "https:"].includes(u.protocol))
      return "URL must start with https://";
    if (
      !u.hostname.endsWith("reddit.com") ||
      (u.hostname !== "reddit.com" && u.hostname !== "www.reddit.com")
    )
      return "Only reddit.com links are accepted.";
  } catch {
    return "That doesn't look like a valid URL.";
  }
  if (!REDDIT_URL_RE.test(trimmed))
    return "Please paste a Reddit post URL (e.g. reddit.com/r/…/comments/…)";
  return null;
}

const Index = () => {
  const [view, setView] = useState<"input" | "loading" | "workspace">("input");
  const [bundle, setBundle] = useState<CaseBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const ingest = async (url: string) => {
    const validationError = validateRedditUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }
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
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Animated bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-orange-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-red-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 px-4 py-8">
        <AnimatePresence mode="wait">
          {view === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[85vh] max-w-lg mx-auto"
            >
              {/* Logo */}
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-2"
              >
                <h1 className="text-7xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-400 bg-clip-text text-transparent">
                    AITAH?!
                  </span>
                </h1>
              </motion.div>
              <p className="text-zinc-400 text-center mb-2 text-base">
                Two AI agents. One Reddit post. One verdict.
              </p>
              <p className="text-zinc-600 text-center mb-8 text-sm">
                Powered by Firecrawl + ElevenLabs
              </p>

              {/* URL input */}
              <div className="w-full relative mb-3">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setError(null); }}
                  placeholder="Paste any Reddit AITA post URL..."
                  className="w-full bg-zinc-900/80 border-2 border-zinc-700/60 rounded-xl px-5 py-4 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:bg-zinc-900 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && urlInput.trim()) ingest(urlInput.trim());
                  }}
                />
                <button
                  onClick={() => urlInput.trim() && ingest(urlInput.trim())}
                  disabled={!urlInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 rounded-lg font-bold text-sm transition-all shadow-lg shadow-orange-900/20"
                >
                  Judge it
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full mb-3 px-4 py-2.5 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex items-center gap-3 w-full my-5">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600 font-medium">or try these bangers</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Sample cards */}
              <div className="w-full flex flex-col gap-3">
                {SAMPLES.map((s, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => ingest(s.url)}
                    className="w-full py-4 px-5 rounded-xl border border-zinc-800 hover:border-orange-500/50 bg-zinc-900/50 hover:bg-zinc-900 text-left transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-600/30">
                        {s.heat}
                      </span>
                    </div>
                    <span className="text-2xl mb-2 block">{s.emoji}</span>
                    <span className="text-zinc-200 group-hover:text-white text-sm font-medium leading-snug block">
                      {s.label}
                    </span>
                    <span className="text-xs text-zinc-600 mt-1 block">
                      Click to put on trial
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {view === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[85vh]"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                {"\u2696\uFE0F"}
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-1">
                Court is in session...
              </h2>
              <p className="text-zinc-500 text-sm mb-6">
                AI agents are reviewing the evidence
              </p>
              <div className="flex flex-col items-center gap-3 text-sm">
                <LoadingStep text="Scraping the Reddit thread" delay={0} icon="📥" />
                <LoadingStep text="AI agents analyzing comments" delay={800} icon="🤖" />
                <LoadingStep text="Searching for receipts via Firecrawl" delay={1600} icon="🔥" />
                <LoadingStep text="Prosecution vs Defense debate" delay={2400} icon="⚔️" />
              </div>
            </motion.div>
          )}

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

function LoadingStep({ text, delay, icon }: { text: string; delay: number; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
      className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 w-80"
    >
      <span className="text-base">{icon}</span>
      <span className="text-zinc-300">{text}</span>
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="ml-auto w-2 h-2 rounded-full bg-orange-500"
      />
    </motion.div>
  );
}

export default Index;
