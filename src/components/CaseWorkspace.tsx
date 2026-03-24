import { useState } from "react";
import { motion } from "framer-motion";
import DiscussionChat, { type ChatMessage } from "./DiscussionChat";

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

type Tab = "discussion" | "post" | "comments" | "receipts";

const VERDICT_COLORS: Record<string, string> = {
  NTA: "text-green-400",
  YTA: "text-red-400",
  ESH: "text-amber-400",
  NAH: "text-blue-400",
  INFO: "text-purple-400",
};

export default function CaseWorkspace({ bundle, onNewCase }: Props) {
  const [tab, setTab] = useState<Tab>("discussion");
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

  const juryBar = Object.entries(jury.verdictCounts)
    .sort(([, a], [, b]) => b - a);
  const totalVotes = jury.analyzedCount || 1;

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-orange-500 tracking-tight">
            AITAH?!
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            r/{post.subreddit} · u/{post.author}
          </p>
        </div>
        <button
          onClick={onNewCase}
          className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500"
        >
          ← New case
        </button>
      </div>

      {/* Post title */}
      <h2 className="text-xl font-bold text-white mb-4 leading-tight">
        {post.title}
      </h2>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 border-b border-zinc-800 pb-1">
        {(
          [
            ["discussion", "💬 Discussion"],
            ["post", "📝 Post"],
            ["comments", `💭 Comments (${comments.length})`],
            ["receipts", `🔥 Receipts (${receipts.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === key
                ? "bg-zinc-800 text-white border-b-2 border-orange-500"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
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
            <div className="p-4 flex flex-col gap-3">
              {comments.slice(0, 12).map((c) => (
                <div
                  key={c.id}
                  className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-zinc-400">
                      u/{c.author}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      ⬆ {c.score.toLocaleString()}
                    </span>
                    {c.verdictTag && (
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          c.verdictTag === "NTA"
                            ? "bg-green-900/50 text-green-400"
                            : c.verdictTag === "YTA"
                              ? "bg-red-900/50 text-red-400"
                              : "bg-amber-900/50 text-amber-400"
                        }`}
                      >
                        {c.verdictTag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-3">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === "receipts" && (
            <div className="p-4 flex flex-col gap-3">
              <p className="text-xs text-amber-500 font-semibold mb-2">
                🔥 Loaded via Firecrawl
              </p>
              {receipts.length === 0 && (
                <p className="text-sm text-zinc-500">No receipts found.</p>
              )}
              {receipts.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50 hover:border-orange-500/40 transition-colors"
                >
                  <p className="text-sm font-medium text-zinc-200 mb-1">
                    {r.title || "Source"}
                  </p>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {r.snippet}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Reddit Jury */}
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-bold text-orange-500 mb-3">
              📊 Reddit Jury
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              {jury.analyzedCount} votes analyzed
            </p>

            {/* verdict bars */}
            <div className="flex flex-col gap-2 mb-3">
              {juryBar.map(([label, count]) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold w-10 ${VERDICT_COLORS[label] ?? "text-zinc-400"}`}
                  >
                    {label}
                  </span>
                  <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.round((count / totalVotes) * 100)}%`,
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full ${
                        label === "NTA"
                          ? "bg-green-500"
                          : label === "YTA"
                            ? "bg-red-500"
                            : label === "ESH"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Verdict */}
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-bold text-orange-500 mb-3">
              🤖 AI Verdict
            </h3>
            <div
              className={`text-4xl font-black mb-2 ${VERDICT_COLORS[verdict.label] ?? "text-white"}`}
            >
              {verdict.label}
            </div>
            <p className="text-sm text-zinc-300 mb-2">{verdict.oneLiner}</p>
            <p className="text-xs text-zinc-500">
              {verdict.confidence}% confidence
            </p>

            {/* Reddit agrees / disagrees */}
            <div className="mt-3 pt-3 border-t border-zinc-700">
              {jury.majorityVerdict === verdict.label ? (
                <span className="text-xs font-bold text-green-400">
                  ✅ Reddit agrees with the AI
                </span>
              ) : (
                <span className="text-xs font-bold text-red-400">
                  ❌ Reddit disagrees — they say{" "}
                  {jury.majorityVerdict ?? "???"}
                </span>
              )}
            </div>
          </div>

          {/* Export to Video */}
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-bold text-orange-500 mb-3">
              🎬 Export Reel
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              Generate a ~60s story reel for TikTok, Reels, or Twitter.
            </p>

            {!renderDone ? (
              <button
                onClick={handleExport}
                disabled={rendering}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                  rendering
                    ? "bg-zinc-700 text-zinc-400 cursor-wait"
                    : "bg-orange-600 hover:bg-orange-500 text-white"
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
                    Rendering… (this takes ~90s)
                  </span>
                ) : (
                  "Generate Video"
                )}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-lg font-bold text-sm bg-green-600 hover:bg-green-500 text-white transition-all"
              >
                ⬇ Download Reel (.mp4)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
