# AITAH?! — The Verdict Bot

Turn a Reddit **Am I the Asshole?** post into a full **AI courtroom trial** with live ElevenLabs agent debates, voice conversations, and auto-generated social media reels.

---

## What it does

1. **Web app** — Paste a Reddit AITA post URL. The backend loads the thread, analyzes top comments (NTA/YTA/ESH), and presents a case workspace.
2. **AI Trial (Agent vs Agent)** — Two **ElevenLabs Conversational AI agents** (Prosecutor and Defense Attorney) debate the case live in text mode. Each agent is dynamically patched with case context and can use **Firecrawl** to search the web for evidence.
3. **Voice Trial (Human vs Agent)** — Talk to "Judge Verdict", an **ElevenLabs Conversational AI agent** that knows the case details, can search for evidence via Firecrawl, and delivers a verdict.
4. **Video export** — A local script runs the ElevenLabs agents server-side via the `simulateConversation` API, captures their debate transcript, generates TTS narration, and renders a **60–90 second vertical reel** with Remotion.

---

## How ElevenLabs agents are used

This project uses **three ElevenLabs Conversational AI agents** as the core of the experience:

### 1. Prosecutor Agent
- **Role:** Argues the OP IS the asshole (YTA)
- **How it works:** Before each session, the agent's prompt is dynamically PATCHed with the Reddit post, comments, and jury data. It has a `search_evidence` webhook tool that calls Firecrawl to find external evidence supporting its argument.
- **Used in:** Frontend AI Trial tab (live text-only WebSocket via `@elevenlabs/react`) + Video pipeline (server-side `simulateConversation` REST API via `@elevenlabs/elevenlabs-js`)

### 2. Defense Agent
- **Role:** Argues the OP is NOT the asshole (NTA)
- **How it works:** Same dynamic patching and Firecrawl tool access as the Prosecutor, but argues the opposite side.
- **Used in:** Frontend AI Trial tab + Video pipeline

### 3. Judge Agent
- **Role:** Neutral judge who can discuss the case with the user via voice
- **How it works:** PATCHed with case context per session. Users speak to it via microphone. It can also call `search_evidence` for Firecrawl-powered web lookups.
- **Used in:** Frontend Voice Trial tab (live WebSocket audio via `@elevenlabs/react`)

### Integration points

| Feature | ElevenLabs API | Method |
|---------|---------------|--------|
| Frontend AI Trial | ConvAI WebSocket (text-only mode) | `@elevenlabs/react` `useConversation` with `textOnly: true` |
| Frontend Voice Trial | ConvAI WebSocket (audio mode) | `@elevenlabs/react` `useConversation` with microphone |
| Video debate | ConvAI `simulateConversation` REST API | `@elevenlabs/elevenlabs-js` SDK (server-side) |
| Video narration | TTS `with-timestamps` endpoint | Direct REST API call |
| Agent tools | Webhook → Firecrawl Search API | Vercel serverless function |

---

## How Firecrawl is used

Firecrawl serves as the "evidence search engine" throughout the project:

1. **Agent webhook tool** — All three ElevenLabs agents have a `search_evidence` tool configured. When an agent decides it needs external evidence, ElevenLabs calls our webhook at `/api/agent/tools/search-evidence`, which queries Firecrawl's Search API and returns relevant snippets.
2. **Ingest receipts** — When a Reddit post is loaded, the backend searches Firecrawl for related articles/discussions to display as "receipts" in the UI.
3. **Video pipeline** — The render script also searches Firecrawl for background context.

---

## Tech stack

| Area | Stack |
|------|--------|
| UI | Vite, React, TypeScript, Tailwind, Framer Motion |
| Local API | Express — `server/index.ts` (port **3001**) |
| Hosted API | Vercel serverless functions (`api/*`) |
| AI agents (frontend) | ElevenLabs ConvAI + `@elevenlabs/react` |
| AI agents (video) | ElevenLabs `simulateConversation` + `@elevenlabs/elevenlabs-js` |
| TTS (video) | ElevenLabs `with-timestamps` API |
| Evidence search | Firecrawl Search API |
| Video rendering | Remotion |

---

## Repository map

| Path | Role |
|------|------|
| `src/pages/Index.tsx` | Landing page: URL validation, sample posts |
| `src/components/CaseWorkspace.tsx` | Tabs: AI Trial, Voice Trial, Post, Comments, Receipts, Verdict |
| `src/components/AgentDebate.tsx` | Live agent-vs-agent text debate using ElevenLabs ConvAI |
| `src/components/VoiceTrial.tsx` | Live voice conversation with Judge agent |
| `server/index.ts` | Express API: ingest, agent session, debate, Firecrawl webhook |
| `api/_lib/reddit.ts` | Shared Reddit parse/jury/debate helpers for Vercel |
| `api/reddit/ingest.ts` | Vercel: Reddit data ingest |
| `api/agent/start-session.ts` | Vercel: patch Judge agent + return signed WebSocket URL |
| `api/agent/start-debate.ts` | Vercel: patch Prosecutor + Defense agents, return signed URLs |
| `api/agent/tools/search-evidence.ts` | Webhook: ElevenLabs agent tool → Firecrawl Search |
| `remotion/` | Video compositions, overlays, Root.tsx |
| `scripts/render-story-reel.ts` | E2E video: fetch → agent debate → TTS → Remotion → MP4 |
| `scripts/setup-agent.ts` | One-time agent configuration helper |

---

## Environment variables

Create `.env` in the repo root:

```env
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...           # Judge agent
ELEVENLABS_PROSECUTOR_AGENT_ID=agent_... # Prosecutor agent
ELEVENLABS_DEFENSE_AGENT_ID=agent_...    # Defense agent
FIRECRAWL_API_KEY=fc-...
ELEVENLABS_FEMALE_VOICE_ID=...           # TTS voice for female narration
ELEVENLABS_MALE_VOICE_ID=...             # TTS voice for male narration
```

---

## Install & run

```sh
git clone <repo-url>
cd the-verdict-bot
npm install
```

### Local development (recommended)

```sh
npm run dev:all
```

- Frontend: http://localhost:8080
- API: http://localhost:3001

### Testing the features

1. Open the app and paste a Reddit AITA post URL
2. **AI Trial tab** — Click "Start AI Trial" to watch Prosecutor vs Defense agents debate live
3. **Voice Trial tab** — Allow microphone, click "Start Voice Trial" to talk with the Judge agent
4. **Verdict tab** — See the final verdict based on Reddit comments and agent analysis

### Render a video

Requires **FFmpeg** on PATH. Background video at `public/video/parkour-bg.mp4` is included in the repo.

```sh
npx tsx scripts/render-story-reel.ts "https://www.reddit.com/r/AmItheAsshole/comments/..."
```

The video pipeline:
1. Fetches Reddit post + comments
2. Runs ElevenLabs agents server-side via `simulateConversation` API
3. Interleaves Prosecutor/Defense responses into debate transcript
4. Generates TTS narration with timestamps
5. Renders with Remotion → outputs `aitah-story-reel-60s.mp4`

---

## End-to-end architecture

```
User pastes Reddit URL
        │
        ▼
┌─────────────────────────────────────────────────┐
│  POST /api/reddit/ingest                        │
│  • Fetch Reddit .json API                       │
│  • Parse comments → jury votes (NTA/YTA/ESH)    │
│  • Search Firecrawl for "receipts"              │
│  • Return caseBundle to frontend                │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┼────────────────┐
        ▼            ▼                ▼
   AI Trial     Voice Trial      Video Render
        │            │                │
        ▼            ▼                ▼
  POST /api/    POST /api/      simulateConversation
  agent/        agent/          REST API (server-side)
  start-debate  start-session         │
        │            │                ▼
        ▼            ▼          Two agents debate
  PATCH both    PATCH Judge     via ElevenLabs API
  agents with   with case       (no WebSocket needed)
  case context  context               │
        │            │                ▼
        ▼            ▼          Build transcript
  Return 2      Return 1       + TTS narration
  signed URLs   signed URL     + Remotion render
        │            │                │
        ▼            ▼                ▼
  Frontend:     Frontend:       MP4 output
  WebSocket     WebSocket       (60-90 seconds)
  text-only     audio mode
  debate        conversation

  Agents can call search_evidence tool
        │
        ▼
  /api/agent/tools/search-evidence
        │
        ▼
  Firecrawl Search API
        │
        ▼
  Returns evidence snippets to agent
```

---

## Vercel deployment

The frontend + serverless API functions deploy to Vercel. Set the same env vars on the Vercel project.

Note: Reddit often returns 403 from cloud IPs. The frontend sends the full `caseBundle` to agent session endpoints so they don't need to re-fetch from Reddit.

The `search_evidence` webhook URL in ElevenLabs agent configuration should point to:
```
https://<your-vercel-domain>/api/agent/tools/search-evidence
```

---

## Security

- Reddit URL validation on client and server
- Rate limiting on Express API routes
- API keys stored in env only; never committed

---

## License

Built for the [ElevenLabs Hackathon](https://hacks.elevenlabs.io/hackathons/0). Integrates ElevenLabs Conversational AI Agents and Firecrawl Search API.
