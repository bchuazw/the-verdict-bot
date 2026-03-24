# AITAH?! — Builder Brief v4

## Objective

Use the current repo (`the-verdict-bot`) as the base and continue the build in a **front-end first**, then **video generation** order.

The product name is now:

**AITAH?!**

Suggested tagline:

**Read the post. Hear the comments. Get the verdict.**

This project is for the ElevenHacks Firecrawl x ElevenAgents hackathon. The submission demo must stay under 90 seconds, while the generated social reel should target about **55–65 seconds**.

---

## What changed since the last brief

The next builder pass must focus on **three things**:

1. **Bring Reddit comments into the product in a meaningful way**
   - not just the original post
   - show the top comments on the front end
   - use comments to influence the verdict / discussion
   - include comments in the generated reel

2. **Fix the visual direction**
   - the current output still feels too empty and too “template-like”
   - the card needs to feel more like a Reddit/social screenshot over gameplay
   - the current legacy court/gold visual language should be reduced heavily

3. **Use ElevenLabs properly**
   - the front end should use **ElevenAgents** for the live experience
   - the reel/video should use **ElevenLabs TTS API** for deterministic export
   - do **not** depend on a live agent for export rendering

---

## Very important decisions

### Decision 1 — Use **one fresh ElevenLabs agent** for the front end

Do **not** rely on the currently configured agent prompt shown in the screenshot (`NOPE AI: Negotiation-Oriented Policy Escalation AI`). That prompt is for customer-support disputes and is the wrong product/persona.

### Decision 2 — Do **not** build 3 live agents first

For this hackathon, the most reliable architecture is:

- **1 live ElevenAgent** in the front end for the interactive host / court clerk / explainer
- **server-side debate generation** for the 3-perspective discussion
- **ElevenLabs TTS API** for the exported reel narration and optional multi-voice playback

Reason:

- 3 simultaneous live agents are harder to coordinate
- they are slower and less reliable in a public demo
- they are not necessary to satisfy the hackathon requirement
- the exported reel needs deterministic timing, which is better with TTS than with live conversational turns

### Decision 3 — Comments become the “Reddit Jury”

Comments should no longer be an afterthought.

Comments must be used for:

- the **front-end jury panel**
- the **AI debate inputs**
- the **verdict comparison** (`Reddit Jury` vs `AI Verdict`)
- the **video’s final third**

This is the most meaningful way to integrate comments into the product.

### Decision 4 — Keep `AITAH?!` as the product name

Do not use `Main Character Court`.
Do not use `Sass Court`.
Do not keep the old luxury courtroom voice for the product.

Keep the brand simple and internet-native:

- **AITAH?!**
- Reddit orange + dark neutrals
- cleaner, more social-native, less ornate

---

## Confirmed hackathon constraints

The builder should respect these constraints while implementing:

- the **submission/demo video must stay under 90 seconds**
- the first **3–5 seconds** need to explain the product outcome clearly
- **Firecrawl Search + ElevenAgents** must both be used and visibly demonstrated
- the generated social reel can be around **60 seconds**
- the actual hackathon submission/demo should still show the live site briefly, not just the exported reel

The builder should optimize for:

- a live product demo around **20–30 seconds**
- one generated reel clip around **55–65 seconds**
- a total hackathon submission video around **60–85 seconds**

---

## Current repo audit (use the existing code, do not rewrite from scratch)

The current repo already has useful foundations.

### Front-end foundations already present

- `src/components/CaseInput.tsx`
- `src/components/RedditLinkInput.tsx`
- `src/components/AgentDebate.tsx`
- `src/components/VerdictDisplay.tsx`
- `src/pages/Index.tsx`
- seeded cases and types in `src/data/seeded-cases.ts` and `src/lib/types.ts`

### Video/remotion foundations already present

- `scripts/render-story-reel.ts`
- `remotion/RedditStoryReel.tsx`
- `remotion/components/RedditPostCard.tsx`
- `remotion/components/GameplayBackground.tsx`
- `remotion/Root.tsx`

### What is already working

- real Reddit post fetch for the test URL
- Firecrawl search for external receipts
- ElevenLabs TTS narration with timestamps
- synchronized story chunk highlighting
- 1080x1920 Remotion export

### What is still wrong / weak

- front end still uses fake/local flows in places
- `handleRedditPaste()` currently injects placeholder/fake story text instead of calling a real ingest API
- there is no real back-end API layer shared between front end and video render
- comments are not first-class data
- the front end does not actually use ElevenAgents yet
- the visual identity still carries too much old “courtroom/gold” styling
- the reel still feels sparse and does not use comments as a strong second act
- the Firecrawl evidence beat is too small and too late to matter visually
- the background is currently synthetic, not the parkour/gameplay style requested

---

# PHASE 1 — FRONT END FIRST

## Goal for Phase 1

When a user pastes a Reddit AITA/AITAH thread URL, the front end should:

1. fetch the post
2. fetch the top comments
3. fetch external receipts via Firecrawl
4. compute a “Reddit Jury” summary
5. show a clean case workspace
6. let the user talk to an ElevenLabs voice host about the case
7. let the user generate the reel from the same loaded case

---

## Front-end product direction

### Replace the current flow

The current flow is too much like:

`input -> fake debate -> verdict`

Replace it with:

`input -> case workspace -> Reddit Jury + AI Host + receipts -> generate reel`

### New front-end layout

#### Desktop layout
Use a 2-column workspace after a case loads:

- **Left/main column (dominant)**
  - Reddit-style post card
  - post body
  - inline highlight on selected lines or summarized beats
  - tabs for `Post`, `Comments`, `Receipts`

- **Right/sidebar column**
  - `Reddit Jury` panel
  - `Ask AITAH?!` live voice panel (ElevenAgent)
  - `AI Verdict` panel
  - `Generate Reel` button

#### Mobile layout
Use a stacked mobile layout with tabs:

1. Post
2. Top Comments
3. Receipts
4. Voice Host
5. Verdict / Generate Reel

---

## The comments plan (important)

### What to fetch

For each Reddit thread, fetch:

- post title
- post body
- subreddit
- author
- permalink
- top-level comments
- comment score / upvotes
- comment author
- reply count if available
- verdict labels found in comments (`NTA`, `YTA`, `ESH`, `NAH`, `INFO`)

### How to fetch comments

Use a **hybrid approach**:

#### Primary source for canonical thread + comments
Use Reddit thread JSON for reliable structured data.

Expected source pattern:

- thread URL + `.json`

This should be the source of truth for the post and top-level comments.

#### Firecrawl usage on the thread itself
Use Firecrawl on the same thread URL (or `old.reddit.com` version if needed) to:

- scrape the thread page markdown
- capture a screenshot if useful
- pull visible page content for display/receipts

#### Why hybrid is required

Reddit JSON is the cleanest structured source for comments.
Firecrawl is still needed in the hackathon and should visibly power:

- scraping the thread page
- external receipts/search results
- screenshots / source previews

If Firecrawl returns complete comment text from the page, great.
If not, fall back to Reddit JSON for canonical comments and still show that Firecrawl was used for thread/page scraping and external receipts.

### Comment filtering rules

Top comments should:

- exclude `AutoModerator`
- exclude `[deleted]` / `[removed]`
- prefer top-level comments only for v1
- sort by score descending
- keep 8–15 for the front end
- use 3 for the reel
- use 10–20 for verdict distribution analysis

### Comment verdict extraction

Detect verdict tags with regex:

- `NTA`
- `YTA`
- `ESH`
- `NAH`
- `INFO`

If a comment contains one of those tags near the beginning or in the first sentence, count it toward the Reddit Jury split.

### Build a Reddit Jury summary

Compute:

- total analyzed comments
- count by verdict label
- top 3 highest-signal comments
- funniest comment / most viral phrasing
- strongest supportive comment
- strongest opposing comment

Use this in the UI as:

- `Reddit Jury: NTA 7 · YTA 2 · ESH 1`
- `Top Comment`
- `Most Viral Take`

---

## How comments should be integrated meaningfully

### In the front end

Comments are not a hidden data tab. They must become a core product surface.

#### Add a `Reddit Jury` card
Show:

- verdict split bar
- count of analyzed comments
- top 3 comments
- tag chips (`NTA`, `YTA`, etc.)
- a `Reddit agrees` / `Reddit disagrees` badge after AI verdict is generated

#### Add a `Top Comments` panel/tab
Each comment card should show:

- author
- upvotes/score
- extracted verdict tag (if any)
- shortened text (2–4 lines)
- “play this take” button (optional TTS later)

#### Use comments inside the debate generation
When generating the 3-perspective discussion:

- **Prosecution** should use the strongest anti-OP comment if one exists
- **Defense** should use the strongest pro-OP comment if one exists
- **Internet/Jury** should use the funniest or most viral comment energy

This makes the debate actually informed by Reddit, not generic.

#### Add a `Reddit vs AI` comparison
This is a strong viral mechanic.

Examples:

- `Reddit says NTA. AI says NTA.`
- `Reddit says NTA. AI says ESH.`

If the AI disagrees with Reddit, highlight that conflict.
That is good for discussion and comments.

### In the video

Comments should appear in the **final third** of the reel.

Recommended structure:

- read the post first
- then show 2–3 top comments as “Reddit Jury”
- then show the AI verdict
- then ask whether the AI got it right

This is more engaging than jumping straight from post -> verdict.

---

## Front-end ElevenLabs agent plan

### What the front-end agent should do

Use ElevenAgents for a **live voice host** / explainer.

This agent is not there to produce the exported video.
It is there to make the site demo feel alive and to satisfy the hackathon requirement visibly.

### Recommended role

Create one fresh agent called:

**AITAH?! Front Desk**

or

**AITAH?! Court Clerk**

### Recommended behavior

The agent should:

- greet the user briefly
- explain the currently loaded case
- summarize what the top comments think
- mention when Firecrawl receipts are loaded
- answer questions about the case by voice
- encourage the user to compare Reddit vs AI verdict
- optionally trigger UI actions via client tools

### Recommended system prompt

Use this as the starting prompt:

```text
You are AITAH?!, the live voice host for a Reddit-drama analysis app.

Your job is to help users understand the currently loaded AITA/AITAH thread, summarize what happened, explain what the top Reddit comments think, mention the external receipts loaded via Firecrawl, and invite the user to compare the Reddit Jury with the AI verdict.

You are not a customer-support agent and not a generic assistant.
You must stay within the current case context provided to you.
Do not invent facts.

Style:
- quick, clear, witty, internet-native
- 1–3 short sentences per turn unless the user asks for more detail
- lightly funny, never cruel
- confident and easy to follow
- no “as an AI” phrasing

If there is no active case, ask the user to paste a Reddit AITA/AITAH thread URL.
If a case is active, treat the provided case summary, top comments, and Firecrawl receipts as the source of truth.

When useful, use client tools to:
- show the case summary
- open the comments panel
- focus a comment
- open Firecrawl receipts
- highlight the verdict
- queue reel generation
```

### Recommended first message

```text
Paste a thread or ask me what Reddit thinks — I’ll read the case, the top comments, and the verdict.
```

### Recommended voice and settings

- use a conversational voice that sounds natural and fast enough for short turns
- enable expressive mode only if it sounds stable and not theatrical
- keep interruptions enabled if the UX feels natural
- default language: English

### What to do about the current agent ID

The screenshot shows the current agent ID points to an unrelated older prompt.

**Preferred path:**
- create a fresh agent for `AITAH?!`
- update `ELEVENLABS_AGENT_ID` to the new ID

**Fallback path if owner wants to reuse the existing agent:**
- completely replace the prompt
- replace the first message
- change the agent name in ElevenLabs dashboard
- remove all customer-support language and policy-escalation logic

### Public vs private agent

Default recommendation:

- keep the agent **private/authenticated**
- create a backend endpoint that returns a signed URL or conversation token
- do not expose the ElevenLabs API key client-side

---

## Front-end client tool plan

When integrating `@elevenlabs/react`, define client tools so the agent can control the UI.

Implement these tools in the front end:

- `show_case_summary`
- `show_comments`
- `focus_comment`
- `show_receipts`
- `highlight_verdict`
- `queue_reel_render`

Suggested signatures:

```ts
show_case_summary(): string
show_comments(): string
focus_comment({ commentId: string }): string
show_receipts(): string
highlight_verdict(): string
queue_reel_render({ preset: '60s' }): string
```

The response strings can be short confirmations.

---

## Front-end implementation checklist

### Replace fake Reddit flow

#### Existing problem
`src/components/CaseInput.tsx` currently fakes a story when a Reddit URL is pasted.

#### Required change
Replace that with a real API call.

Add a backend endpoint:

- `POST /api/reddit/ingest`

Input:

```json
{ "url": "https://www.reddit.com/r/AmItheAsshole/comments/..." }
```

Output should include:

- normalized post data
- top comments
- Reddit Jury summary
- Firecrawl receipts
- optional Firecrawl screenshot URL

### Add a real case workspace

Create a new front-end component, e.g.:

- `src/components/CaseWorkspace.tsx`

This should replace the current fake debate-only middle state.

### Add new components

Recommended new components:

- `src/components/RedditThreadCard.tsx`
- `src/components/RedditJuryPanel.tsx`
- `src/components/CommentCard.tsx`
- `src/components/FirecrawlReceiptsPanel.tsx`
- `src/components/ElevenAgentPanel.tsx`
- `src/components/GenerateReelButton.tsx`

### Update the front-end state machine

Refactor `src/pages/Index.tsx` so the main phases become:

- `input`
- `loading`
- `workspace`
- `verdict` (optional separate route or modal)

Recommended: keep the verdict inside the workspace and do not navigate away from the case.

### Strong recommendation on styling

Reduce the old courtroom/luxury theme.

Move toward:

- near-black / charcoal surfaces
- Reddit orange accents
- cleaner typography
- fewer gold ornaments and decorative separators
- less empty space
- stronger content density

The product should feel closer to a social content tool than a fantasy courtroom.

---

## Back-end/API plan

There is currently no shared back-end API layer. Add one.

Recommended structure:

- `server/index.ts`
- `server/routes/reddit.ts`
- `server/routes/reel.ts`
- `server/routes/elevenlabs.ts`
- `server/lib/reddit.ts`
- `server/lib/firecrawl.ts`
- `server/lib/elevenlabs.ts`
- `server/lib/comments.ts`
- `server/lib/debate.ts`
- `server/lib/types.ts`

### Minimum endpoints

#### `POST /api/reddit/ingest`
Fetch post + comments + Firecrawl receipts.

#### `POST /api/cases/debate`
Given a normalized case bundle, generate:

- AI verdict
- 3-perspective discussion lines
- Reddit vs AI comparison

#### `GET /api/elevenlabs/signed-url`
Return signed URL or conversation token if the agent is private.

#### `POST /api/reels/render`
Queue or run the 60-second story reel render.

#### `GET /api/reels/:id`
Return render status and output URLs.

---

## Normalized thread shape (must add to types)

Extend `src/lib/types.ts` and shared backend types with something like:

```ts
export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  depth: number;
  permalink?: string;
  verdictTag?: 'NTA' | 'YTA' | 'ESH' | 'NAH' | 'INFO' | null;
}

export interface RedditJurySummary {
  analyzedCount: number;
  verdictCounts: Record<string, number>;
  majorityVerdict?: 'NTA' | 'YTA' | 'ESH' | 'NAH' | 'INFO' | null;
  topComments: RedditComment[];
  funniestComment?: RedditComment;
  strongestSupportComment?: RedditComment;
  strongestOppositionComment?: RedditComment;
}

export interface FirecrawlReceipt {
  title: string;
  url: string;
  snippet: string;
  screenshot?: string;
}

export interface CaseBundle {
  post: {
    title: string;
    body: string;
    subreddit: string;
    author: string;
    permalink: string;
    sourceUrl: string;
  };
  comments: RedditComment[];
  jury: RedditJurySummary;
  receipts: FirecrawlReceipt[];
  firecrawlThreadScreenshot?: string;
  aiVerdict?: {
    label: 'NTA' | 'YTA' | 'ESH' | 'NAH' | 'INFO';
    confidence: number;
    oneLiner: string;
    rationale: string;
  };
  debate?: {
    prosecutor: string[];
    defense: string[];
    internet: string[];
  };
}
```

---

# PHASE 2 — VIDEO GENERATION

## Goal for Phase 2

Upgrade the reel so it feels like:

- a social-native Reddit story reel
- a readable story-over-gameplay video
- with comments as a second act
- with real narration
- with a clear final verdict

Do not make it feel like a slide deck.

---

## What must improve in the current reel

### 1. The layout still feels too sparse

Fixes:

- make the post card larger
- reduce empty margins
- use a dark-mode Reddit-style card so the composition feels denser
- keep the background visible, but subordinate to the story card

### 2. Comments are missing from the reel

Fix:

- add a `Reddit Jury` section near the end
- show 2–3 top comments as stacked cards or sequential cards
- read them aloud or narrate them briefly

### 3. The Firecrawl beat is too tiny

Fix:

- make the receipts beat more legible
- show at least 1 compact source card or screenshot strip
- keep it brief but visible

### 4. The final verdict section is too empty

Fix:

- show `AI Verdict`
- show `Reddit Jury` next to it or just above it
- optionally show `Reddit agrees` / `Reddit disagrees`

### 5. The background needs to be real gameplay

Fix:

- replace the synthetic background with an actual loopable background video asset
- preferred style: parkour / obstacle / satisfying kinetic gameplay
- darken and blur it enough for readability

### 6. Text pacing must stay readable

Fix:

- do not advance based only on rough duration estimates
- use ElevenLabs timestamps
- enforce minimum dwell time per highlighted chunk
- merge chunks if they are too short

---

## Reel format to build

### Final target

- resolution: `1080x1920`
- fps: `30`
- duration target: `55–65 seconds`
- export format: `mp4`

### Reel story structure

#### 0s – 3s: Hook

Show:

- `AITAH?!`
- thread title / cleaned hook
- immediate premise in one line

Example:

- `AITAH?! My sister used my engagement party for her pregnancy reveal.`

#### 3s – 38s: Read the Reddit post

- show a Reddit-style dark card
- narrator reads the post
- move highlight line by line / chunk by chunk
- only scroll when necessary
- keep reading pace comfortable

#### 38s – 50s: Reddit Jury

- show top 2–3 comments
- display verdict tags if present
- narrator says what the top comments were basically saying
- show a small verdict split bar if available

#### 50s – 57s: AI Verdict

- show `AI Verdict: NTA` (or relevant label)
- include one-liner
- include `Reddit agrees` or `Reddit disagrees`

#### 57s – 60s: CTA

- `Was the AI right?`
- `Drop your verdict below.`

---

## Exact reel content rules

### Story card style

Use a **Reddit-inspired dark card**.

Not a plain slide.
Not a luxury courtroom plaque.

Suggested visual treatment:

- dark charcoal card
- rounded corners
- Reddit icon/subreddit row at top
- white title text
- muted gray metadata
- off-white body text
- orange active highlight / subtle orange left border

### Chunking rules

- target **10–18 words per chunk**
- keep **1 active chunk** highlighted at a time
- minimum visible time per chunk: **2.2 seconds**
- preferred visible time: **2.5–4.0 seconds**
- if timestamped chunk is too short, merge it with the next chunk
- if too long, split only at sentence boundaries

### Comment card rules

Each comment card should show:

- `u/author`
- score/upvotes if available
- extracted verdict tag
- 1–2 short lines of comment text

Do not dump giant comments.

### Audio rules

The reel must not be silent.

Use:

- main ElevenLabs narrator track
- optional secondary voice for comment section or verdict sting
- subtle background bed
- subtle pings/whooshes only where necessary

Mix target:

- narration: dominant
- music: low
- SFX: tasteful only

---

## Video implementation plan in the current repo

### Extend `scripts/render-story-reel.ts`

Do not rewrite from zero. Extend it.

Add:

- Reddit comment fetch/parsing
- jury summary
- comment chunk selection
- optional second TTS generation for comments/verdict
- shared normalized case bundle output

### Add helper modules instead of keeping everything inline

Move logic into reusable files:

- `server/lib/reddit.ts` or `scripts/lib/reddit.ts`
- `server/lib/comments.ts`
- `server/lib/firecrawl.ts`
- `server/lib/elevenlabs.ts`
- `server/lib/reel.ts`

Then reuse that logic from both the API and render script.

### Update `remotion/RedditStoryReel.tsx`

Add props for:

- `commentCards`
- `jurySummary`
- `receiptCards`
- `redditVsAiAgreement`
- `backgroundVideoSrc`

### Update `remotion/components/RedditPostCard.tsx`

Improve:

- card density
- dark mode
- less empty white space
- better highlight contrast
- better scroll thresholds

### Replace `remotion/components/GameplayBackground.tsx`

Current synthetic animation is no longer the main target.

Change behavior:

1. if a background video exists, use it
2. otherwise fall back to the synthetic background

Suggested asset path:

- `public/backgrounds/parkour.mp4`

Add blur + dim overlay so text is always readable.

### Add new Remotion components

Recommended new components:

- `remotion/components/RedditCommentCard.tsx`
- `remotion/components/RedditJuryBar.tsx`
- `remotion/components/ReceiptStrip.tsx`
- `remotion/components/AgreementBadge.tsx`

---

## Recommended video background approach

Use a real video background, not the current abstract geometry.

### Preferred asset

- a self-recorded or properly licensed loopable parkour / satisfying gameplay clip
- vertical or easily center-cropped to 9:16

### Required behavior

- slow movement but continuous motion
- never visually overpower the card
- dark overlay + blur layer on top
- slight scale/zoom for depth

### Implementation note

The builder can use a local asset in:

- `public/backgrounds/parkour.mp4`

and read it from Remotion.

If no licensed asset is available yet, leave the synthetic fallback in place but keep the code path ready for the real asset.

---

## Firecrawl integration plan (front end + video)

### Firecrawl must be visible in the product

Do not hide Firecrawl entirely in the backend.

### Use Firecrawl for 3 things

#### 1. Thread/page scrape
Use Firecrawl to scrape the Reddit thread page itself and optionally capture a screenshot.

This can power:

- a thread preview image
- a receipt thumbnail
- UI proof that the thread page was scraped

#### 2. External receipts
Use Firecrawl Search to fetch related supporting context such as:

- similar AITA posts
- etiquette sources
- context pages
- related media/pages only if actually useful

Avoid noisy results that feel random.

#### 3. Optional comment screenshot evidence
If Firecrawl can scrape comment permalinks or the thread page including comments well enough, use it to power comment/source cards.

If not, still use Reddit JSON for canonical comment text.

### Front-end Firecrawl UI surfaces

Show:

- `Receipts loaded via Firecrawl`
- source cards
- optional screenshot preview
- source title + short snippet

### Reel Firecrawl surface

Show a compact but visible moment:

- `Receipts loaded via Firecrawl`
- one small source strip or screenshot

Do not let this dominate the reel.
The reel is still primarily the post + comments + verdict.

---

## ElevenLabs TTS plan for the reel

### Do not use the live agent for rendering

The reel renderer should use direct ElevenLabs TTS API.

### Why

- deterministic timing
- easier retries
- stable durations
- cleaner caption/highlight sync

### Recommended TTS setup

Required:

- narrator voice ID

Optional if available:

- comment voice ID
- verdict voice ID

### Recommended env names

Use or add:

- `ELEVENLABS_NARRATOR_VOICE_ID`
- `ELEVENLABS_COMMENTS_VOICE_ID` (optional)
- `ELEVENLABS_VERDICT_VOICE_ID` (optional)

If only one voice is available, use one voice for v1.

---

## Suggested file-by-file changes

### Front end

#### `src/components/CaseInput.tsx`
- remove fake Reddit paste behavior
- call real ingest API
- simplify copy around the new brand
- stop leaning on old courtroom copy

#### `src/components/RedditLinkInput.tsx`
- support `www`, `old`, `new` Reddit URLs
- support canonical thread URLs robustly
- call ingest API once valid

#### `src/pages/Index.tsx`
- replace current timer-based flow with real async fetch state
- mount `CaseWorkspace` after successful ingest
- keep data in state/query cache

#### `src/components/AgentDebate.tsx`
- either replace entirely or refactor into a real `DebatePanel`
- it should use actual case data, comments, and API results
- remove fake timed bubble progression as the primary experience

#### `src/components/VerdictDisplay.tsx`
- add `Reddit agrees/disagrees`
- add `Reddit Jury` summary
- add link to generate reel from the same case

### Video generation

#### `scripts/render-story-reel.ts`
- fetch top comments
- calculate Reddit Jury split
- add comment narration segment generation
- add reel prop output for comments + agreement badge

#### `remotion/RedditStoryReel.tsx`
- add separate phases for story, comments, verdict, CTA
- support background video
- support richer comments phase

#### `remotion/components/RedditPostCard.tsx`
- shift to Reddit dark mode styling
- enlarge card footprint
- reduce empty margins
- stronger highlight readability

#### `remotion/components/GameplayBackground.tsx`
- support `parkour.mp4` first
- fallback to synthetic background if file missing

#### `remotion/Root.tsx`
- add/update default props to include comments/jury data
- keep 60-second composition default

---

## Manual ElevenLabs setup the builder must guide the owner through

If any manual setup is required, the builder must explicitly guide the owner through it.
Do not assume the owner already knows the dashboard steps.

### Required guidance the builder must provide

#### If creating a fresh agent
The builder must tell the owner:

1. where to click in the ElevenLabs dashboard
2. what to name the agent
3. what prompt to paste
4. what first message to use
5. whether to make it public or private
6. which voice to select
7. whether to enable expressive mode
8. how to copy the new agent ID back into `.env`

#### If private auth is enabled
The builder must tell the owner:

1. that the front end will use a signed URL endpoint
2. that the API key stays server-side only
3. how to verify the front end can start a session

#### If additional voices are needed for video
The builder must tell the owner:

1. how to choose/copy voice IDs
2. which env names to put them into
3. which ones are optional vs required

---

## Secrets / environment handling

The current repo already includes a `.env` with the required keys.
The builder should **use the existing local values** from the repo for development, but must **not** print them into logs, commit them, or duplicate them into public files.

### Current important env variables already present in the repo

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `FIRECRAWL_API_KEY`
- `ELEVENLABS_NARRATOR_VOICE_ID`

### Add these if needed

- `ELEVENLABS_COMMENTS_VOICE_ID`
- `ELEVENLABS_VERDICT_VOICE_ID`
- `VITE_API_BASE_URL`
- `PUBLIC_SITE_URL`
- `BACKGROUND_VIDEO_PATH` (optional)

### Important security step

Because the current repo bundle contains real secrets, the builder should strongly recommend that the owner **rotate the keys before public deployment**.

---

## Test verification case

Use this real Reddit thread for end-to-end verification:

```text
https://www.reddit.com/r/AmItheAsshole/comments/13xga9y/aita_for_uninviting_my_sister_to_my_wedding/
```

### Expected test behavior

For this URL, the app should:

1. load the real Reddit title/body
2. parse top-level comments
3. compute a Reddit Jury split
4. show at least 3 useful comments in the UI
5. load at least 1 Firecrawl receipt
6. allow the ElevenAgent host to discuss the case
7. render a ~60 second reel with:
   - story section
   - comments section
   - AI verdict section
   - CTA

---

## Acceptance criteria

The builder is done only when all of the following are true:

### Front end

- I can paste a real Reddit AITA thread URL and it loads real data
- I can see the original post clearly in the UI
- I can see the top comments clearly in the UI
- I can see a Reddit Jury verdict split
- I can see Firecrawl receipts in the UI
- I can start a working ElevenLabs voice session from the front end
- the agent discusses the current loaded case, not generic filler

### Video generation

- I can render a 55–65 second MP4 from the loaded case
- the reel includes the original post
- the reel includes comments
- the reel includes the AI verdict
- the reel includes narration
- the reel uses a gameplay/video background if asset is available
- the reel text pacing is readable and not rushed
- the final verdict screen does not feel empty

### Hackathon/demo readiness

- the live demo of the site + the generated reel can be shown in under 90 seconds
- Firecrawl usage is visible
- ElevenAgents usage is visible
- the product feels cohesive and intentionally designed, not like 2 disconnected prototypes

---

## Suggested implementation order (strict)

### Step 1
Set up the backend API layer and shared normalized case bundle.

### Step 2
Replace fake Reddit ingest on the front end with real ingest.

### Step 3
Add comments parsing + Reddit Jury summary.

### Step 4
Integrate ElevenLabs front-end voice host.

### Step 5
Refactor the workspace UI so post + comments + receipts are all visible and coherent.

### Step 6
Extend the video renderer to include comments and Reddit-vs-AI comparison.

### Step 7
Swap in real gameplay background support.

### Step 8
Render the verification reel and tune pacing.

### Step 9
Guide the owner through any final ElevenLabs dashboard steps.

---

## Final product positioning

The product should now feel like:

**AITAH?! — a Reddit drama reader + Reddit Jury analyzer + AI voice host + reel generator**

Not:

- a fake courtroom toy
- a silent template video tool
- a static verdict generator

The core user experience should be:

1. paste thread
2. see post
3. see what Reddit thinks
4. hear the AI host explain it
5. generate a polished social reel

That is the version to keep building.
