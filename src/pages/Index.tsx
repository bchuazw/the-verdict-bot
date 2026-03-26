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
      let redditRaw: unknown = null;
      try {
        const path = new URL(url).pathname.replace(/\/$/, "");
        const jsonUrl = `https://www.reddit.com${path}.json?raw_json=1`;
        const r = await fetch(jsonUrl);
        if (r.ok) redditRaw = await r.json();
      } catch {
        // CORS or network error — server will fetch instead
      }

      const res = await fetch("/api/reddit/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, redditRaw }),
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
    <div className="min-h-screen bg-[hsl(230_30%_5%)] text-foreground overflow-hidden font-body antialiased">
      <div className="party-bg" aria-hidden />
      <div className="ambient-bg" aria-hidden />
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(43_80%_55%/0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="fixed inset-0 pointer-events-none shadow-[inset_0_0_120px_hsl(230_30%_3%/0.85)]"
        aria-hidden
      />
      <span className="angry-float left-[8%] top-[18%]" aria-hidden>😡</span>
      <span className="angry-float right-[12%] top-[26%]" style={{ animationDelay: "0.8s" }} aria-hidden>🤬</span>
      <span className="angry-float left-[20%] bottom-[18%]" style={{ animationDelay: "1.4s" }} aria-hidden>😤</span>
      <span className="angry-float right-[20%] bottom-[22%]" style={{ animationDelay: "2.1s" }} aria-hidden>😠</span>

      <div className="relative z-10 px-4 py-8 sm:py-12">
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
              <p className="section-label mb-4 text-center tracking-[0.25em]">
                The court of public opinion
              </p>
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-2"
              >
                <h1 className="font-display text-6xl sm:text-7xl font-black tracking-tight drop-shadow-[0_0_40px_hsl(43_80%_55%/0.15)]">
                  <span className="hero-title angry-vibrate">AITAH?!</span>
                </h1>
              </motion.div>
              <p className="text-foreground/90 text-center mb-2 text-base max-w-md leading-relaxed">
                Two AI agents. One Reddit post. One verdict.
              </p>
              <p className="text-muted-foreground text-center mb-8 text-sm flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden>🔥</span> Firecrawl
                </span>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden>🎙️</span> ElevenLabs
                </span>
              </p>

              {/* URL input */}
              <div className="w-full relative mb-3 neon-ring rounded-2xl">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setError(null); }}
                  placeholder="Paste any Reddit AITA post URL..."
                  className="w-full rounded-2xl border-2 border-border bg-gradient-to-b from-secondary to-card px-5 py-4 pr-[7.5rem] text-base text-foreground placeholder:text-muted-foreground shadow-[inset_0_2px_8px_hsl(230_30%_3%/0.35)] transition-all focus:border-gold-bright/70 focus:outline-none focus:ring-2 focus:ring-gold/20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && urlInput.trim()) ingest(urlInput.trim());
                  }}
                />
                <button
                  onClick={() => urlInput.trim() && ingest(urlInput.trim())}
                  disabled={!urlInput.trim()}
                  className="gavel-button absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 text-sm disabled:pointer-events-none disabled:opacity-45"
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

              <div className="ornament w-full max-w-md my-6 text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dim">
                  Or try these bangers
                </span>
              </div>

              {/* Sample cards */}
              <div className="w-full flex flex-col gap-3">
                {SAMPLES.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 * i }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => ingest(s.url)}
                    className="verdict-card pop-card click-jiggle w-full py-4 px-5 text-left transition-all group relative overflow-hidden border-border/80 hover:border-gold-dim/50 hover:shadow-[0_12px_40px_hsl(230_30%_3%/0.45)]"
                  >
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-burgundy/25 text-gold-bright border border-gold-dim/40 glow-pulse">
                        {s.heat}
                      </span>
                    </div>
                    <span className="text-2xl mb-2 block">{s.emoji}</span>
                    <span className="text-card-foreground/95 group-hover:text-foreground text-sm font-medium leading-snug block">
                      {s.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 block">
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
