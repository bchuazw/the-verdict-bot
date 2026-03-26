import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const REPO_URL = "https://github.com/bchuazw/the-verdict-bot";

const steps = [
  {
    num: "01",
    title: "Clone the Repository",
    body: (
      <>
        <pre className="bg-black/40 rounded-lg p-4 text-sm text-green-400 overflow-x-auto mb-3 border border-zinc-800">
          <code>{`git clone ${REPO_URL}.git\ncd the-verdict-bot\nnpm install`}</code>
        </pre>
        <p>
          Copy the environment template and fill in your API keys:
        </p>
        <pre className="bg-black/40 rounded-lg p-4 text-sm text-green-400 overflow-x-auto mt-2 border border-zinc-800">
          <code>cp .env.example .env</code>
        </pre>
      </>
    ),
  },
  {
    num: "02",
    title: "Get Your API Keys",
    body: (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center text-sm">
            {"\uD83D\uDD0A"}
          </span>
          <div>
            <p className="font-semibold text-white">ElevenLabs</p>
            <p className="text-sm text-zinc-400">
              Sign up at{" "}
              <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline underline-offset-2 hover:text-violet-300">
                elevenlabs.io
              </a>
              {" "}and grab your API key from Profile &rarr; API Keys. You'll also need voice IDs for narration (pick any from the Voice Library).
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-7 h-7 rounded-full bg-orange-600/20 flex items-center justify-center text-sm">
            {"\uD83D\uDD25"}
          </span>
          <div>
            <p className="font-semibold text-white">Firecrawl</p>
            <p className="text-sm text-zinc-400">
              Sign up at{" "}
              <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline underline-offset-2 hover:text-orange-300">
                firecrawl.dev
              </a>
              {" "}for your API key. This powers the evidence search for agents and receipts.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-7 h-7 rounded-full bg-blue-600/20 flex items-center justify-center text-sm">
            {"\uD83E\uDD16"}
          </span>
          <div>
            <p className="font-semibold text-white">MiniMax <span className="text-zinc-500 font-normal">(optional)</span></p>
            <p className="text-sm text-zinc-400">
              Used for gender detection to pick the right narrator voice. Without it, a default voice is used.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    title: "Create Your ElevenLabs Agents",
    body: (
      <div className="space-y-4">
        <p>
          Go to the{" "}
          <a href="https://elevenlabs.io/conversational-ai" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline underline-offset-2 hover:text-violet-300">
            ElevenLabs Conversational AI dashboard
          </a>
          {" "}and create three agents:
        </p>

        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4">
          <h4 className="font-bold text-red-400 mb-1">{"\u2694\uFE0F"} Prosecutor Agent</h4>
          <ul className="text-sm text-zinc-400 list-disc list-inside space-y-1">
            <li>Argues the OP <strong className="text-red-300">IS</strong> the asshole (YTA)</li>
            <li>Set the system prompt to argue the prosecution side of AITA posts</li>
            <li>Add a <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">search_evidence</code> webhook tool pointing to your deployed <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">/api/agent/tools/search-evidence</code> endpoint</li>
            <li>Enable <strong className="text-zinc-300">text-only mode</strong> in platform overrides</li>
          </ul>
        </div>

        <div className="rounded-xl border border-green-900/40 bg-green-950/20 p-4">
          <h4 className="font-bold text-green-400 mb-1">{"\uD83D\uDEE1\uFE0F"} Defense Agent</h4>
          <ul className="text-sm text-zinc-400 list-disc list-inside space-y-1">
            <li>Argues the OP is <strong className="text-green-300">NOT</strong> the asshole (NTA)</li>
            <li>Mirror the Prosecutor's setup but argue the defense side</li>
            <li>Same <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">search_evidence</code> tool and text-only mode</li>
          </ul>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
          <h4 className="font-bold text-amber-400 mb-1">{"\u2696\uFE0F"} Judge Agent</h4>
          <ul className="text-sm text-zinc-400 list-disc list-inside space-y-1">
            <li>Neutral judge who users talk to via voice</li>
            <li>Set it up with <strong className="text-zinc-300">audio mode</strong> (not text-only)</li>
            <li>Same <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">search_evidence</code> tool for evidence lookup</li>
          </ul>
        </div>

        <p className="text-sm text-zinc-500">
          Copy each agent's ID into your <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">.env</code> file.
        </p>
      </div>
    ),
  },
  {
    num: "04",
    title: "Fill In Your .env",
    body: (
      <pre className="bg-black/40 rounded-lg p-4 text-sm text-zinc-300 overflow-x-auto border border-zinc-800 leading-relaxed">
        <code>{`ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...           # Judge
ELEVENLABS_PROSECUTOR_AGENT_ID=agent_... # Prosecutor
ELEVENLABS_DEFENSE_AGENT_ID=agent_...    # Defense
FIRECRAWL_API_KEY=fc-...
ELEVENLABS_NARRATOR_VOICE_ID=...         # Pick from Voice Library
ELEVENLABS_FEMALE_VOICE_ID=...           # Female narrator voice
ELEVENLABS_MALE_VOICE_ID=...             # Male narrator voice
MINIMAX_API_KEY=...                      # Optional`}</code>
      </pre>
    ),
  },
  {
    num: "05",
    title: "Run Locally",
    body: (
      <>
        <pre className="bg-black/40 rounded-lg p-4 text-sm text-green-400 overflow-x-auto mb-3 border border-zinc-800">
          <code>npm run dev:all</code>
        </pre>
        <p>
          This starts both the frontend (<code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">localhost:8080</code>) and the Express API server (<code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">localhost:3001</code>).
        </p>
        <p className="mt-2">
          Open the app, paste any Reddit AITA/AITAH post URL, and watch the AI trial unfold.
        </p>
      </>
    ),
  },
  {
    num: "06",
    title: "Generate Video Content",
    body: (
      <>
        <p className="mb-3">
          Render a 60-90 second vertical reel locally (requires FFmpeg):
        </p>
        <pre className="bg-black/40 rounded-lg p-4 text-sm text-green-400 overflow-x-auto mb-3 border border-zinc-800">
          <code>{`npx tsx scripts/render-story-reel.ts \\
  "https://www.reddit.com/r/AmItheAsshole/comments/..."`}</code>
        </pre>
        <p>
          The pipeline fetches the post, runs both agents via ElevenLabs' <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">simulateConversation</code> API, generates TTS narration with timestamps, and renders the video with Remotion.
        </p>
        <p className="mt-2">
          Output: <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">aitah-story-reel-60s.mp4</code> — ready for TikTok, Reels, or Twitter.
        </p>
      </>
    ),
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function Guide() {
  return (
    <div className="min-h-screen bg-[hsl(230_30%_5%)] text-zinc-200 overflow-hidden font-body antialiased">
      <div className="party-bg" aria-hidden />
      <div className="ambient-bg" aria-hidden />
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(43_80%_55%/0.08),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          &larr; Back to app
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
            Build Your Own <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Verdict Bot</span>
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
            Clone the repo, set up your ElevenLabs agents, and start generating AI courtroom content from any Reddit post.
          </p>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm p-6 sm:p-8"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-800/30 flex items-center justify-center text-sm font-black text-orange-400">
                  {step.num}
                </span>
                <h2 className="text-xl font-bold text-white pt-1.5">{step.title}</h2>
              </div>
              <div className="text-sm text-zinc-400 leading-relaxed pl-14">
                {step.body}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center space-y-4"
        >
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-900/20 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            View on GitHub
          </a>
          <p className="text-xs text-zinc-600">
            Built with ElevenLabs Conversational AI &middot; Firecrawl &middot; Remotion
          </p>
        </motion.div>
      </div>
    </div>
  );
}
