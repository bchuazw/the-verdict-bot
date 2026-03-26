# AITAH?! — The Verdict Bot

Turn a Reddit **Am I the Asshole?** post into a full **AI courtroom trial** with live ElevenLabs agent debates, voice conversations, and auto-generated social media reels.

---

## What it does

1. **Web app** — Paste a Reddit AITA post URL. The backend loads the thread, analyzes top comments (NTA/YTA/ESH), and presents a case workspace.
2. **AI Trial (Agent vs Agent)** — Two **ElevenLabs Conversational AI agents** (Prosecutor and Defense Attorney) debate the case live in text mode.
3. **Voice Trial (Human vs Agent)** — Talk to "Judge Verdict", an ElevenLabs agent that knows the case details, can search for evidence via Firecrawl, and delivers a verdict.
4. **Video export** — A local script runs the agents server-side via the `simulateConversation` API, captures their debate transcript, generates TTS narration, and renders a **60–90 second vertical reel** with Remotion.

---

## Quick start

### 1. Clone and install

```sh
git clone https://github.com/bchuazw/the-verdict-bot.git
cd the-verdict-bot
npm install
cp .env.example .env
```

### 2. Get your API keys

| Service | Where to sign up | What you need |
|---------|-----------------|---------------|
| **ElevenLabs** | [elevenlabs.io](https://elevenlabs.io) | API key (Profile → API Keys) + voice IDs from the Voice Library |
| **Firecrawl** | [firecrawl.dev](https://firecrawl.dev) | API key — powers evidence search for agents and receipts |
| **MiniMax** *(optional)* | [minimaxi.com](https://www.minimaxi.com) | API key — used for gender detection to pick the narrator voice |

### 3. Create your ElevenLabs agents

Go to the [ElevenLabs Conversational AI dashboard](https://elevenlabs.io/conversational-ai) and create three agents:

#### Prosecutor Agent
- **Role:** Argues the OP IS the asshole (YTA)
- Set the system prompt to argue the prosecution side of AITA posts
- Add a `search_evidence` webhook tool pointing to your `/api/agent/tools/search-evidence` endpoint
- Enable **text-only mode** in platform overrides → conversation config
- Copy the agent ID → `ELEVENLABS_PROSECUTOR_AGENT_ID`

#### Defense Agent
- **Role:** Argues the OP is NOT the asshole (NTA)
- Mirror the Prosecutor setup but argue the defense side
- Same `search_evidence` tool and text-only mode
- Copy the agent ID → `ELEVENLABS_DEFENSE_AGENT_ID`

#### Judge Agent
- **Role:** Neutral judge who users talk to via voice
- Set up with **audio mode** (not text-only) so users can speak to it
- Same `search_evidence` tool for evidence lookup
- Copy the agent ID → `ELEVENLABS_AGENT_ID`

### 4. Fill in your `.env`

```env
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...           # Judge
ELEVENLABS_PROSECUTOR_AGENT_ID=agent_... # Prosecutor
ELEVENLABS_DEFENSE_AGENT_ID=agent_...    # Defense
ELEVENLABS_NARRATOR_VOICE_ID=...         # Pick from Voice Library
ELEVENLABS_FEMALE_VOICE_ID=...           # Female narrator voice
ELEVENLABS_MALE_VOICE_ID=...             # Male narrator voice
FIRECRAWL_API_KEY=fc-...
MINIMAX_API_KEY=...                      # Optional
```

### 5. Run locally

```sh
npm run dev:all
```

- Frontend: http://localhost:8080
- API: http://localhost:3001

Open the app, paste any Reddit AITA/AITAH post URL, and watch the AI trial.

### 6. Generate video content

Render a 60-90 second vertical reel locally (requires FFmpeg):

```sh
npx tsx scripts/render-story-reel.ts \
  "https://www.reddit.com/r/AmItheAsshole/comments/..."
```

The pipeline:
1. Fetches Reddit post + comments
2. Runs both agents via ElevenLabs `simulateConversation` API
3. Interleaves Prosecutor/Defense responses into a debate transcript
4. Generates TTS narration with timestamps
5. Renders with Remotion → outputs `aitah-story-reel-60s.mp4`

---

## How ElevenLabs agents are used

This project uses **three ElevenLabs Conversational AI agents** as the core of the experience:

| Feature | ElevenLabs API | Method |
|---------|---------------|--------|
| Frontend AI Trial | ConvAI WebSocket (text-only mode) | `@elevenlabs/react` `useConversation` |
| Frontend Voice Trial | ConvAI WebSocket (audio mode) | `@elevenlabs/react` `useConversation` with microphone |
| Video debate | ConvAI `simulateConversation` REST API | `@elevenlabs/elevenlabs-js` SDK (server-side) |
| Video narration | TTS `with-timestamps` endpoint | Direct REST API call |
| Agent tools | Webhook → Firecrawl Search API | Express endpoint |

Before each session, the agents are dynamically **PATCHed** with the Reddit post, comments, and jury data so they debate the specific case.

---

## How Firecrawl is used

1. **Agent webhook tool** — All three agents have a `search_evidence` tool. When an agent needs external evidence, ElevenLabs calls `/api/agent/tools/search-evidence`, which queries Firecrawl's Search API.
2. **Ingest receipts** — When a Reddit post is loaded, the backend searches Firecrawl for related articles/discussions to display as "receipts" in the UI.

---

## Tech stack

| Area | Stack |
|------|--------|
| UI | Vite, React, TypeScript, Tailwind, Framer Motion |
| Backend | Express — `server/index.ts` |
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
| `src/pages/Guide.tsx` | Setup guide for cloning and configuring agents |
| `src/components/CaseWorkspace.tsx` | Tabs: AI Trial, Voice Trial, Post, Comments, Receipts, Verdict |
| `src/components/AgentDebate.tsx` | Live agent-vs-agent text debate |
| `src/components/VoiceTrial.tsx` | Live voice conversation with Judge agent |
| `server/index.ts` | Express API: ingest, agent session, debate, Firecrawl webhook, video render |
| `remotion/` | Video compositions, overlays, Root.tsx |
| `scripts/render-story-reel.ts` | E2E video: fetch → agent debate → TTS → Remotion → MP4 |
| `scripts/prebundle.ts` | Pre-bundles Remotion at Docker build time |
| `Dockerfile` | Docker image with Chromium for Remotion rendering |

---

## Deployment

### Frontend (Vercel)

Deploy the frontend + Vercel serverless functions. Set env vars on the Vercel project dashboard.

### Backend (Render.com)

The Express server (including video rendering with Remotion) deploys as a Docker web service on Render.com. The `render.yaml` blueprint is included.

Set `VITE_API_URL` in Vercel to your Render.com URL, and `ALLOWED_ORIGIN` in Render.com to your Vercel URL.

The `search_evidence` webhook URL in ElevenLabs agent configuration should point to:
```
https://<your-domain>/api/agent/tools/search-evidence
```

---

## Architecture

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
  PATCH both    PATCH Judge     simulateConversation
  agents with   with case       REST API (server-side)
  case context  context               │
        │            │                ▼
        ▼            ▼          Two agents debate
  Return 2      Return 1       via ElevenLabs API
  signed URLs   signed URL           │
        │            │                ▼
        ▼            ▼          Build transcript
  Frontend:     Frontend:       + TTS narration
  WebSocket     WebSocket       + Remotion render
  text-only     audio mode            │
  debate        conversation          ▼
                                 MP4 output
  Agents can call search_evidence tool
        │
        ▼
  /api/agent/tools/search-evidence → Firecrawl Search API
```

---

## License

Built for the [ElevenLabs Hackathon](https://hacks.elevenlabs.io/hackathons/0). Integrates ElevenLabs Conversational AI Agents and Firecrawl Search API.
