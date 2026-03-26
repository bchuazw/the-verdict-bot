import { useState } from "react";
import { motion } from "framer-motion";
import DiscussionChat, { type ChatMessage } from "./DiscussionChat";
import VoiceTrial from "./VoiceTrial";
import AgentDebate from "./AgentDebate";


interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  verdictTag: string | null;
}

interface JurySummary {
  analyzedCount: number;
  verdictCounts: Record<string, number>;
  majorityVerdict: string | null;
  topComments: RedditComment[];
}

interface Receipt {
  title: string;
  url: string;
  snippet: string;
}

interface CaseVerdict {
  label: string;
  confidence: number;
  oneLiner: string;
  rationale: string;
}

export interface CaseBundle {
  post: {
    title: string;
    body: string;
    subreddit: string;
    author: string;
    url: string;
  };
  comments: RedditComment[];
  jury: JurySummary;
  debate: ChatMessage[];
  receipts: Receipt[];
  verdict: CaseVerdict;
}

interface Props {
  bundle: CaseBundle;
  onNewCase: () => void;
}

type Tab = "ai-trial" | "voice-trial" | "discussion" | "post" | "comments" | "receipts";

const VERDICT_BG: Record<string, string> = {
  NTA: "from-green-600/20 to-green-900/10 border-green-500/30",
  YTA: "from-red-600/20 to-red-900/10 border-red-500/30",
  ESH: "from-amber-600/20 to-amber-900/10 border-amber-500/30",
  NAH: "from-blue-600/20 to-blue-900/10 border-blue-500/30",
  INFO: "from-purple-600/20 to-purple-900/10 border-purple-500/30",
};
const VERDICT_TEXT: Record<string, string> = {
  NTA: "text-green-400",
  YTA: "text-red-400",
  ESH: "text-amber-400",
  NAH: "text-blue-400",
  INFO: "text-purple-400",
};
const VERDICT_GLOW: Record<string, string> = {
  NTA: "shadow-green-500/20",
  YTA: "shadow-red-500/20",
  ESH: "shadow-amber-500/20",
};
const BAR_COLOR: Record<string, string> = {
  NTA: "bg-green-500",
  YTA: "bg-red-500",
  ESH: "bg-amber-500",
  NAH: "bg-blue-500",
  INFO: "bg-purple-500",
};

export default function CaseWorkspace({ bundle, onNewCase }: Props) {
  const [tab, setTab] = useState<Tab>("ai-trial");
  const [showExportPopup, setShowExportPopup] = useState(false);
  const { post, comments, jury, debate, receipts, verdict } = bundle;
  const tabItems = [
    ["ai-trial", "⚔️ AI Trial"],
    ["voice-trial", "🎙️ Voice Trial"],
    ["discussion", "📝 Script"],
    ["post", "📝 Post"],
    ["comments", `💬 ${comments.length} Comments`],
    ["receipts", `🔥 ${receipts.length} Receipts`],
  ] as const;
  const sidebarCardVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
  };

  const juryBar = Object.entries(jury.verdictCounts).sort(([, a], [, b]) => b - a);
  const totalVotes = jury.analyzedCount || 1;

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black hero-title angry-vibrate tracking-tight">
            AITAH?!
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
              r/{post.subreddit}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
              u/{post.author}
            </span>
          </div>
        </div>
        <button
          onClick={onNewCase}
          className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-800"
        >
          New case
        </button>
      </div>

      {/* Post title */}
      <h2 className="text-xl font-bold text-white mb-5 leading-tight">
        {post.title}
      </h2>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {tabItems.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`tab-pill click-jiggle px-4 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap relative ${
              tab === key
                ? "bg-gradient-to-r from-fuchsia-600/20 via-orange-500/20 to-cyan-500/20 text-orange-300 border border-orange-400/35 shadow-[0_0_20px_hsl(25_95%_58%/0.18)]"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            {label}
            {tab === key && (
              <motion.span
                layoutId="active-tab-underline"
                className="tab-underline"
                transition={{ type: "spring", stiffness: 520, damping: 36 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 pop-card rounded-xl overflow-hidden backdrop-blur-sm">
          {tab === "ai-trial" && (
            <AgentDebate caseBundle={{ post, jury, comments }} />
          )}

          {tab === "voice-trial" && (
            <VoiceTrial
              postUrl={post.url}
              postTitle={post.title}
              caseBundle={{ post, jury, comments }}
              onClose={() => setTab("discussion")}
            />
          )}

          {tab === "discussion" && (
            <DiscussionChat messages={debate} autoPlay delayMs={2400} />
          )}

          {tab === "post" && (
            <div className="p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                {post.body.split("\n\n").map((p, i) => (
                  <p key={i} className="text-zinc-300 leading-relaxed mb-3 text-sm">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}

          {tab === "comments" && (
            <div className="p-4 flex flex-col gap-2.5">
              {comments.slice(0, 12).map((c) => (
                <div
                  key={c.id}
                  className="bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/40 hover:border-fuchsia-400/35 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-zinc-400">
                      u/{c.author}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {"\u2B06"} {c.score.toLocaleString()}
                    </span>
                    {c.verdictTag && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          c.verdictTag === "NTA"
                            ? "bg-green-900/50 text-green-400 border border-green-700/40"
                            : c.verdictTag === "YTA"
                              ? "bg-red-900/50 text-red-400 border border-red-700/40"
                              : "bg-amber-900/50 text-amber-400 border border-amber-700/40"
                        }`}
                      >
                        {c.verdictTag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-3">{c.body}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "receipts" && (
            <div className="p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-orange-500">FIRECRAWL</span>
                <span className="text-[10px] text-zinc-500">web search evidence</span>
              </div>
              {receipts.length === 0 && (
                <p className="text-sm text-zinc-500">No receipts found.</p>
              )}
              {receipts.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/40 hover:border-cyan-400/40 transition-all group"
                >
                  <p className="text-sm font-medium text-zinc-200 group-hover:text-orange-300 mb-1 transition-colors">
                    {r.title || "Source"}
                  </p>
                  <p className="text-xs text-zinc-500 line-clamp-2">{r.snippet}</p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Verdict card — the star */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={sidebarCardVariants}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`rounded-xl border p-5 bg-gradient-to-br shadow-lg ${
              VERDICT_BG[verdict.label] ?? VERDICT_BG.NTA
            } ${VERDICT_GLOW[verdict.label] ?? ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-zinc-400 tracking-widest">
                AI AGENTS VERDICT
              </span>
              <span className="text-xs font-bold text-zinc-500">
                {verdict.confidence}%
              </span>
            </div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6, type: "spring" }}
              className={`text-5xl font-black mb-3 ${VERDICT_TEXT[verdict.label] ?? "text-white"}`}
            >
              {verdict.label}
            </motion.div>
            <p className="text-base text-zinc-200 font-medium mb-2 leading-snug">
              {verdict.oneLiner}
            </p>
            <div className="pt-3 border-t border-white/10">
              {jury.majorityVerdict === verdict.label ? (
                <span className="text-xs font-bold text-green-400">
                  {"\u2705"} Reddit agrees with the AI agents
                </span>
              ) : (
                <span className="text-xs font-bold text-red-400">
                  {"\u274C"} Reddit disagrees — they say{" "}
                  {jury.majorityVerdict ?? "???"}
                </span>
              )}
            </div>
          </motion.div>

          {/* Jury stats */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={sidebarCardVariants}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="pop-card rounded-xl p-4 backdrop-blur-sm"
          >
            <h3 className="text-xs font-black text-zinc-400 tracking-widest mb-3">
              REDDIT JURY
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              {jury.analyzedCount} votes analyzed
            </p>
            <div className="flex flex-col gap-2">
              {juryBar.map(([label, count]) => {
                const pct = Math.round((count / totalVotes) * 100);
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black w-10 ${VERDICT_TEXT[label] ?? "text-zinc-400"}`}
                    >
                      {label}
                    </span>
                    <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${BAR_COLOR[label] ?? "bg-zinc-500"}`}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 w-12 text-right font-mono">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Export */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={sidebarCardVariants}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="pop-card rounded-xl p-4 backdrop-blur-sm"
          >
            <h3 className="text-xs font-black text-zinc-400 tracking-widest mb-3">
              EXPORT REEL
            </h3>

            <p className="text-xs text-zinc-500 mb-3">
              Generate a 60-90s video for TikTok, Reels, or Twitter.
            </p>
            <button
              onClick={() => setShowExportPopup(true)}
              className="click-jiggle w-full py-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-900/20"
            >
              {"\uD83C\uDFAC"} Generate Video
            </button>
          </motion.div>
        </div>
      </div>

      {showExportPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowExportPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="relative mx-4 max-w-md w-full rounded-2xl border border-zinc-700/60 bg-zinc-900/95 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowExportPopup(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 text-lg leading-none"
            >
              {"\u2715"}
            </button>
            <div className="text-center">
              <div className="text-4xl mb-4">{"\uD83C\uDFAC"}</div>
              <h2 className="text-xl font-bold text-white mb-2">
                Create Your Own Verdict Videos
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Clone the repo, set up your agents, and create amazing customised content.
              </p>
              <a
                href="https://github.com/bchuazw/the-verdict-bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-900/20 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
