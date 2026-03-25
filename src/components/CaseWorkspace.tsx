import { useState } from "react";
import { motion } from "framer-motion";
import DiscussionChat, { type ChatMessage } from "./DiscussionChat";
import VoiceTrial from "./VoiceTrial";

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

type Tab = "voice-trial" | "discussion" | "post" | "comments" | "receipts";

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
  const [tab, setTab] = useState<Tab>("voice-trial");
  const [rendering, setRendering] = useState(false);
  const [renderDone, setRenderDone] = useState(false);

  const { post, comments, jury, debate, receipts, verdict } = bundle;

  const handleExport = async () => {
    setRendering(true);
    setRenderDone(false);
    try {
      const res = await fetch("/api/reels/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: post.url }),
      });
      if (res.ok) setRenderDone(true);
    } catch {
      /* ignore */
    } finally {
      setRendering(false);
    }
  };

  const handleDownload = () => {
    window.open("/api/reels/download", "_blank");
  };

  const juryBar = Object.entries(jury.verdictCounts).sort(([, a], [, b]) => b - a);
  const totalVotes = jury.analyzedCount || 1;

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent tracking-tight">
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
        {(
          [
            ["voice-trial", "\uD83C\uDF99\uFE0F Voice Trial"],
            ["discussion", "\u2694\uFE0F Text Trial"],
            ["post", "\uD83D\uDCDD Post"],
            ["comments", `\uD83D\uDCAC ${comments.length} Comments`],
            ["receipts", `\uD83D\uDD25 ${receipts.length} Receipts`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              tab === key
                ? "bg-orange-600/20 text-orange-400 border border-orange-500/30"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 bg-zinc-900/60 rounded-xl border border-zinc-800/80 overflow-hidden backdrop-blur-sm">
          {tab === "voice-trial" && (
            <VoiceTrial
              postUrl={post.url}
              postTitle={post.title}
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
                  className="bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/40 hover:border-zinc-600/50 transition-colors"
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
                  className="block bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/40 hover:border-orange-500/40 transition-all group"
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
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-4 backdrop-blur-sm">
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
          </div>

          {/* Export */}
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-4 backdrop-blur-sm">
            <h3 className="text-xs font-black text-zinc-400 tracking-widest mb-3">
              EXPORT REEL
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              Generate a 60-90s video for TikTok, Reels, or Twitter.
            </p>

            {!renderDone ? (
              <button
                onClick={handleExport}
                disabled={rendering}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  rendering
                    ? "bg-zinc-700 text-zinc-400 cursor-wait"
                    : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-900/20"
                }`}
              >
                {rendering ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    Rendering... (~90s)
                  </span>
                ) : (
                  "\uD83C\uDFAC Generate Video"
                )}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-500 text-white transition-all"
              >
                {"\u2B07"} Download Reel (.mp4)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
