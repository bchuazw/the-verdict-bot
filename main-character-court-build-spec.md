# Main Character Court - Build Spec for ElevenHacks Submission

## 1) What this project is

**Recommended final name:** **AITAH Court**

**One-line pitch:**  
Paste any Reddit / AITAH story. Three AI courtroom personalities argue over it, deliver a verdict, and turn the case into a viral-ready vertical reel.

**Short tagline:**  
**Internet drama, tried in public.**

**What makes this submission strong:**
- It is instantly understandable in under 5 seconds.
- It creates built-in comment bait because people will disagree with the verdict.
- It visibly uses both sponsor technologies:
  - **Firecrawl** for ingestion, search, receipts, screenshots, and supporting evidence
  - **ElevenLabs / ElevenAgents** for the live court host, voices, and interactive UI moments
- It naturally produces short-form content for Reels / TikTok / X / LinkedIn.
- It is more original and more socially native than a generic voice-search assistant.

---

## 2) Hackathon constraints this build must satisfy

This hackathon specifically asks entrants to combine **Firecrawl Search** with **ElevenAgents**, build something unusual, and submit it with a high-quality viral-style video. Official judging is weighted **40% creativity/originality**, **40% effective use of partner tech + ElevenLabs**, and **20% quality of presentation/demo**. The submission guide also emphasizes that the first **3-5 seconds** matter heavily, recommends keeping demos around **60-90 seconds**, says under **60 seconds** can perform even better socially, and strongly recommends captions plus vertical 9:16 exports for Reels / TikTok. Social posts are also directly rewarded in the scoring system. Therefore this project must be built as both a product and a clip machine.

**Implication for implementation:**  
Do not just build a website that debates Reddit stories. Build a website that can also generate a polished vertical video automatically from the same structured case data.

---

## 3) Reference reel analysis from the uploaded example

The uploaded reel is useful because it proves the target style does **not** require complex AI video generation.

### What the reference reel is actually doing
Observed structure from the uploaded sample:
- One **continuous, satisfying motion background** (parkour / obby / game movement)
- One large **text card** on top
- The text is **revealed over time**
- Little to no complex scene editing
- The retention mechanic is curiosity + readable text + soothing motion
- The video can be fully automated from structured text and a looped background clip

### Key takeaway
Do **not** build a "prompt-to-video" generator.  
Build a **deterministic motion graphics renderer**.

That means:
- background loop
- cards
- text reveal
- voiceover
- timed captions
- light animations
- export to 9:16 MP4

This is dramatically simpler, more reliable, and easier to polish in time for a hackathon.

---

## 4) Final product concept

### Product name
**Main Character Court**

### Product promise
A user pastes a Reddit / AITAH / AmITheAsshole URL, or taps **"Give me a messy case."**  
The app ingests the story, gathers live receipts, runs a three-way courtroom argument, returns a verdict, and generates a reel from the case.

### Final verdict types
- NTA
- YTA
- ESH
- NAH
- INFO

### Extra verdict metadata
- **Confidence**
- **Petty Score**
- **Red Flag Count**
- **Closing Roast**
- **Minority Opinion** (optional)

### Why this works
It has:
- built-in conflict
- recognizable format
- fast demo value
- endless inputs
- strong social CTA: **"Was the court right?"**

---

## 5) Tone and brand direction

### Tone
- smart
- funny
- internet-native
- quick
- slightly savage
- never robotic
- never cringe-random

### It should NOT sound like
- "As an AI..."
- a therapist
- a legal disclaimer machine
- a generic assistant
- overly edgy or offensive

### Visual direction
- punchy
- readable on mobile
- bold title cards
- courtroom energy, but meme-forward
- not a chatbot UI

### Good recurring phrases
- "Court is now in session."
- "Objection."
- "Receipts loaded."
- "The court has seen enough."
- "Deliberating..."
- "This is spiritually petty."
- "The internet will not let this slide."

---

## 6) The three debate personas

These personas are core to the experience. They must feel genuinely different.

### 1. Prosecutor - Counsel for Common Sense
**Role:** argues why the original poster is in the wrong  
**Voice:** sharp, dry, decisive  
**Style:** logic-first, mildly savage  
**Length:** max 2 short sentences per turn  
**Purpose:** makes the obvious case against the poster

### 2. Defense - Attorney of Technicalities
**Role:** argues why the original poster is not in the wrong  
**Voice:** witty, clever, sympathetic  
**Style:** contextual, persuasive, sly  
**Length:** max 2 short sentences per turn  
**Purpose:** finds the hidden angle, nuance, or justified pettiness

### 3. Comment Section - The Internet Itself
**Role:** chaotic jury energy / top-comment brain  
**Voice:** funniest and shortest  
**Style:** meme-literate, highly quotable  
**Length:** max 1 short sentence per turn  
**Purpose:** delivers the lines people quote and share

### Optional fourth voice
A neutral **Court Clerk / Host** powered by an ElevenAgent that narrates the setup, introduces the case, and triggers UI actions.

This is optional but recommended because it visibly showcases ElevenAgents in the live product.

---

## 7) Core user journeys

### A. Paste-a-link journey
1. User pastes a Reddit / AITAH URL
2. App imports story
3. App shows summary + tags + receipts loading
4. User taps **Put it on trial**
5. Debate plays with voice + animated captions
6. Verdict appears
7. User taps **Generate Reel**
8. MP4 renders and becomes downloadable/shareable

### B. Random case journey
1. User lands on homepage
2. Taps **Give me a messy case**
3. App loads seeded or live case
4. Debate plays immediately
5. User shares verdict or generates reel

### C. Demo mode journey (for hackathon recording)
1. Use a guaranteed-safe, preloaded case
2. Everything renders instantly or near-instantly
3. No live ingestion dependency during the recorded demo
4. Video export works reliably

---

## 8) Scope control: what NOT to build

Do not waste time on:
- user auth
- accounts
- saved histories
- social feeds
- editing every word of the generated debate
- full moderation dashboard
- advanced analytics
- full legal case simulation
- comment scraping at scale
- too many video templates

### Hard rule
This is a hackathon demo.  
Optimize for **one beautiful flow**.

---

## 9) Architecture recommendation

## Primary recommendation
**Frontend:** existing Lovable frontend  
**Backend:** Node.js + TypeScript  
**Storage:** Supabase Storage or equivalent object storage  
**Rendering:** **Remotion + FFmpeg**  
**Voice:** ElevenLabs TTS / ElevenAgents  
**Web data:** Firecrawl Search + Scrape

### Why this is the best choice
The reel style you want is deterministic and template-based. Remotion is the best fit because:
- the frontend already lives in a React-like ecosystem
- the same composition can be previewed in-app and rendered to MP4
- text cards, staged reveals, verdict slams, lower-thirds, and caption timing are easy to control
- you are not dependent on a third-party video template vendor for the main flow

## Backup rendering option if time gets tight
**Creatomate**
- Use if you want the fastest managed rendering pipeline
- Best when the reel can be represented as a fixed template with text / background replacements

## Secondary managed alternative
**Shotstack**
- Use if you want a JSON timeline renderer as a service
- Good, but the React parity is weaker than Remotion for this particular product

### Final recommendation
**Ship with Remotion first.**
Use **Creatomate** only as a fallback if server-side rendering becomes a deployment headache.

---

## 10) Why Remotion is the right renderer for this project

Use Remotion because the project needs:
- in-browser preview
- server-side rendering
- reusable templates
- precise timing for text reveal and captions
- multiple short presets (20s / 35s / 60s)

### The exact fit
This product is not "AI video generation."  
It is **programmatic video composition**.

Main Character Court should render videos from a single object:
- case file
- debate script
- audio URLs
- timings
- reel style preset

That object should drive:
1. live preview in the browser
2. downloadable MP4 export

---

## 11) Backend data flow

### Step 1: import the case
Input:
- Reddit URL
- or seeded case ID

Output:
- normalized case file

### Step 2: gather receipts
Use Firecrawl to:
- scrape the original story page
- optionally capture screenshot(s)
- search for related norms / etiquette / precedent / similar cases
- fetch supporting links and concise evidence cards

### Step 3: normalize the story
A text model converts raw story text into:
- short summary
- prosecution facts
- defense facts
- missing info
- safe tags
- likely verdicts
- reel hook

### Step 4: generate debate
A text model writes:
- hook
- setup
- 3-voice debate
- verdict line
- CTA line

### Step 5: generate audio
Use ElevenLabs to create:
- prosecutor voice
- defense voice
- comment-section voice
- optional court clerk voice

### Step 6: create reel spec
Assemble:
- background clip choice
- text cards
- timing
- captions
- audio tracks
- animation instructions

### Step 7: render
Remotion reads the reel spec and produces:
- MP4
- thumbnail
- optional preview GIF / JPG

---

## 12) Recommended API surface

### POST /api/cases/import
Input:
```json
{
  "url": "https://reddit.com/..."
}
```

Output:
```json
{
  "caseId": "case_123",
  "caseFile": {}
}
```

### POST /api/cases/random
Input:
```json
{
  "category": "weddings",
  "safeOnly": true
}
```

### POST /api/cases/:id/debate
Output:
```json
{
  "caseFile": {},
  "evidencePack": {},
  "debateScript": {},
  "audio": {},
  "verdict": {}
}
```

### POST /api/cases/:id/reel
Input:
```json
{
  "preset": "35s",
  "style": "debate"
}
```

Output:
```json
{
  "jobId": "render_123"
}
```

### GET /api/reels/:jobId
Output:
```json
{
  "status": "queued|rendering|done|failed",
  "videoUrl": "...",
  "thumbnailUrl": "..."
}
```

### GET /api/agent/signed-url
Returns whatever token / signed URL is needed for the live ElevenAgent session.

---

## 13) Shared schema: case file

```ts
type CaseFile = {
  id: string;
  sourceUrl: string;
  sourceType: "reddit" | "seeded";
  subreddit?: string;
  author?: string;
  title: string;
  rawText: string;
  shortSummary: string;
  prosecutionFacts: string[];
  defenseFacts: string[];
  missingInfo: string[];
  likelyVerdicts: ("NTA" | "YTA" | "ESH" | "NAH" | "INFO")[];
  topicTags: string[];
  safetyFlags: string[];
  attribution: {
    platform: "Reddit";
    username?: string;
    permalink?: string;
  };
};
```

---

## 14) Shared schema: evidence pack

```ts
type EvidenceCard = {
  id: string;
  label: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: "original_post" | "similar_case" | "etiquette" | "news" | "commentary";
  quote: string;
  screenshotUrl?: string;
};

type EvidencePack = {
  cards: EvidenceCard[];
  firecrawlMeta: {
    searched: boolean;
    scraped: boolean;
    screenshotCount: number;
  };
};
```

---

## 15) Shared schema: debate script

```ts
type DebateLine = {
  speaker: "clerk" | "prosecutor" | "defense" | "comments";
  text: string;
  beat: "hook" | "setup" | "argument" | "counter" | "verdict" | "cta";
  evidenceIds?: string[];
  approxDurationSec: number;
};

type Verdict = {
  label: "NTA" | "YTA" | "ESH" | "NAH" | "INFO";
  confidence: number;
  pettyScore: number;
  redFlagCount: number;
  oneLiner: string;
  rationale: string;
};

type DebateScript = {
  hook: string;
  setup: string[];
  lines: DebateLine[];
  verdict: Verdict;
  cta: string;
};
```

---

## 16) Shared schema: reel spec

```ts
type ReelSpec = {
  id: string;
  preset: "20s" | "35s" | "60s";
  style: "story" | "debate";
  width: 1080;
  height: 1920;
  fps: 30;
  title: string;
  hookText: string;
  backgroundVideoUrl: string;
  audioTracks: {
    speaker: string;
    url: string;
    startSec: number;
  }[];
  scenes: Array<{
    type: "title" | "story-card" | "speaker-card" | "evidence-card" | "verdict-card" | "cta-card";
    startSec: number;
    endSec: number;
    payload: Record<string, unknown>;
  }>;
  thumbnailText: string;
};
```

---

## 17) Frontend requirements

Reuse the existing Lovable app as the shell. Do not redesign from scratch.

### Required routes
- `/` - landing page
- `/case/:caseId` - live case page
- `/studio/:caseId` - reel studio / export page

### Required components
- `CaseInput`
- `SeededCaseCarousel`
- `CaseSummary`
- `EvidenceRail`
- `DebateStage`
- `VerdictPanel`
- `ReelStudio`
- `RenderStatus`
- `ShareCard`
- `FirecrawlReceiptStrip`

### Landing page must include
- headline with one-line pitch
- paste URL input
- "Put a case on trial" CTA
- "Give me a messy case" CTA
- 3-5 seeded cases
- one visual preview of the reel output

### Case page must include
- title
- short summary
- source attribution
- visible Firecrawl receipts
- live debate panel
- verdict panel
- generate reel button

### Reel studio must include
- 20s / 35s / 60s preset buttons
- preview
- render button
- download MP4 button
- download thumbnail button
- platform caption copy

---

## 18) UI behavior for the live debate

The live experience should feel like a show, not a chatbot.

### Required interactions
- intro sting: "Court is now in session"
- evidence card fly-in
- speaker highlight when a voice is active
- objection stamp
- verdict slam animation
- petty meter animation
- CTA button after verdict

### Firecrawl visibility
This is mandatory.

The user and the judges must be able to see:
- source cards
- search / scrape states
- receipt snippets
- screenshot thumbnails if available

Do not hide Firecrawl in the backend.  
Make it part of the visible product magic.

---

## 19) How Firecrawl should be used

Use Firecrawl in a meaningful, visible way.

### Required uses
1. **Scrape the original case**
   - get clean text
   - get metadata
   - optionally get screenshot

2. **Search for related supporting context**
   Examples:
   - etiquette norms
   - similar public cases
   - topic-specific evidence
   - recent related discussions where relevant

3. **Return visual receipts**
   - screenshot thumbnails
   - quote snippets
   - source titles
   - links

### Firecrawl usage pattern
- first scrape the original input URL
- then run topic-specific search queries
- then convert top results into concise evidence cards
- keep the evidence UI short and digestible

### Important engineering note
Firecrawl may not always succeed on every public Reddit URL.  
Therefore:
- include seeded safe cases
- add "paste the story text instead" fallback
- cache successful imports

---

## 20) How ElevenLabs should be used

This project should use ElevenLabs in two ways:

### A. Live experience
Use an **ElevenAgent** as the Court Clerk / Host inside the web app.

Responsibilities:
- greet the user
- introduce the case
- trigger UI actions
- narrate the court process

### B. Rendered debate audio
Generate the debate voices using ElevenLabs voices for:
- prosecutor
- defense
- comment section

### Recommended architecture
For reliability:
- use **one live ElevenAgent host**
- generate the 3 debate voices on the backend using structured text + TTS

This is better than forcing a fully live multi-agent orchestration if stability becomes an issue.

### Client-side tools to implement
Define these client tools in ElevenAgents and mirror them in the frontend:
- `showCaseSummary`
- `showEvidenceCard`
- `highlightSpeaker`
- `animateVerdict`
- `openReelStudio`
- `playGavel`
- `showPettyScore`

---

## 21) Video generation plan

## Primary style preset to implement first
**Style:** `debate`

### 35-second structure (recommended default)
**0-3s**
- hook card
- title + strongest premise
- fast movement background

**3-8s**
- source story setup
- one short summary card

**8-22s**
- 3-agent debate
- rapid alternating speaker cards
- evidence cards pop in when useful

**22-29s**
- last round
- funniest line
- tension before verdict

**29-34s**
- verdict slam
- petty score
- red flag count
- closing roast

**34-35s**
- CTA
- "Was the court right?"

## Secondary style preset (optional)
**Style:** `story`
This is the closest to the uploaded reel:
- long text card
- slow text reveal
- soothing motion background
- lighter edits

Only build this if the debate preset is already polished.

---

## 22) Background strategy

Do **not** generate backgrounds with AI.

Use:
- owned footage
- licensed stock
- custom recorded gameplay loops
- simple looping motion backgrounds

### Recommended starter set
- 1 obby / parkour style loop
- 1 subway-runner style loop
- 1 neon courtroom motion loop

### Rule
All backgrounds must be:
- vertical or crop-safe to 9:16
- visually satisfying
- low-distraction
- reusable

---

## 23) Captions and text strategy

### Important rule
Do not rely on speech-to-text for captions.

You already have the exact script.  
Use the script and timings to generate captions deterministically.

### Caption rules
- large
- high contrast
- centered or top-card aligned
- readable on phone
- never more than ~2 lines at once
- important words can be highlighted

### Card rules
- round black / dark translucent panels are fine
- white text
- key verdict color accent
- avoid clutter

---

## 24) Moderation and safety rules

Reject or refuse to process stories involving:
- self-harm
- sexual assault
- minors in sexual situations
- graphic violence
- explicit hate
- active criminal accusations against identifiable people
- doxxing
- highly defamatory content

### If a story is unsafe
Return:
- "This case is not eligible for court."
- offer a safe seeded case instead

### Comedy limits
Allowed:
- witty
- savage
- petty
- meme-y

Not allowed:
- slurs
- hate
- explicit sexual jokes
- dangerous content
- harassment of identifiable private people

---

## 25) Rights / attribution rules

If using public Reddit stories:
- attribute Reddit as source
- include username if available
- link back to the original post
- do not heavily modify quoted source text beyond formatting / summarization
- avoid bulk storing unnecessary content
- prefer seeded cases that you have manually reviewed

For the hackathon demo, the safest path is:
- use public posts
- keep attribution visible
- keep usage bounded
- do not pretend the content is original

---

## 26) Seeded demo cases

Seed at least **5 guaranteed-good cases**.

### Ideal seeded case topics
- wedding invite drama
- roommate rent split
- birthday trip payment issue
- in-law boundary problem
- office PTO / group-chat blame issue

### Why seeded cases matter
They let you:
- record the hackathon demo without ingestion risk
- test timings and rendering
- keep content safe and funny
- make the product feel instantly alive

### Seeded case requirements
Each seeded case must have:
- title
- safe source link
- attribution
- pre-generated summary
- pre-generated debate
- pre-generated audio
- pre-generated reel option if possible

---

## 27) Prompts for the text generation layer

## Prompt A - Case normalizer
Use a reliable text model with structured JSON output.

```text
SYSTEM:
You are the Clerk of Main Character Court.
Your job is to convert a public internet drama story into a clean, factual case file for a funny courtroom-style debate.

RULES:
- Preserve facts.
- Do not invent missing details.
- If information is missing, list it under missingInfo.
- Keep the tone neutral in this step.
- Extract only the strongest facts that support each side.
- Flag unsafe content.
- Optimize the output for short-form video and voice debate.

RETURN JSON ONLY with:
{
  "shortSummary": string,
  "prosecutionFacts": string[],
  "defenseFacts": string[],
  "missingInfo": string[],
  "likelyVerdicts": ["NTA"|"YTA"|"ESH"|"NAH"|"INFO"],
  "topicTags": string[],
  "safetyFlags": string[],
  "hookOptions": string[]
}
```

## Prompt B - Debate writer
```text
SYSTEM:
You are writing a viral short-form courtroom debate script for Main Character Court.

GOAL:
Turn the case into a funny, fast, highly shareable 3-voice argument.

VOICES:
1. Prosecutor - sharp, logical, mildly savage
2. Defense - witty, contextual, persuasive
3. Comment Section - shortest lines, funniest lines, meme-literate

RULES:
- Never use generic AI phrasing.
- Never say "as an AI".
- Keep turns short and punchy.
- Keep the total script appropriate for a vertical reel.
- At least one memorable punchline every 2-3 turns.
- The script must preserve the facts.
- If facts are missing, embrace INFO rather than inventing details.
- End with a clear verdict and a CTA asking viewers whether the court was right.

RETURN JSON ONLY with:
{
  "hook": string,
  "setup": string[],
  "lines": [
    {
      "speaker": "prosecutor" | "defense" | "comments",
      "text": string,
      "approxDurationSec": number,
      "evidenceRefs": string[]
    }
  ],
  "verdict": {
    "label": "NTA" | "YTA" | "ESH" | "NAH" | "INFO",
    "confidence": number,
    "pettyScore": number,
    "redFlagCount": number,
    "oneLiner": string,
    "rationale": string
  },
  "cta": string
}
```

## Prompt C - Platform captions
```text
SYSTEM:
Write platform-specific launch copy for Main Character Court.

INPUTS:
- case title
- verdict
- best punchline
- CTA

RETURN JSON with:
{
  "x": string,
  "linkedin": string,
  "instagram": string,
  "tiktok": string
}

RULES:
- Each caption needs a hook.
- Each caption should invite disagreement / engagement.
- Keep LinkedIn a bit more polished.
- Keep Instagram and TikTok more playful.
- Include #ElevenHacks.
}
```

---

## 28) Voice direction

Each voice should have a distinct emotional profile.

### Prosecutor
- crisp
- dry
- judgey
- slightly faster pace

### Defense
- playful
- articulate
- confident
- conversational

### Comment Section
- shortest clips
- biggest personality
- slightly exaggerated delivery is okay

### Court Clerk / Host
- polished
- theatrical
- introduces segments cleanly

---

## 29) File / repo structure recommendation

```text
root/
  src/
    components/
      CaseInput.tsx
      SeededCaseCarousel.tsx
      DebateStage.tsx
      EvidenceRail.tsx
      VerdictPanel.tsx
      ReelStudio.tsx
    pages/
      Home.tsx
      CasePage.tsx
      StudioPage.tsx
    lib/
      api.ts
      types.ts
      agents.ts
  server/
    routes/
      cases.ts
      debate.ts
      reels.ts
      agent.ts
    services/
      firecrawl.ts
      cases.ts
      debate.ts
      voices.ts
      reels.ts
      moderation.ts
      storage.ts
    prompts/
      case-normalizer.txt
      debate-writer.txt
      social-copy.txt
  remotion/
    compositions/
      DebateReel.tsx
      StoryReel.tsx
    components/
      SpeakerCard.tsx
      EvidenceCard.tsx
      VerdictCard.tsx
      Captions.tsx
    presets/
      debate35.ts
      debate20.ts
      debate60.ts
  public/
    demo-cases/
      ...
```

---

## 30) Environment variables

```bash
FIRECRAWL_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
APP_BASE_URL=
STORAGE_BUCKET=
STORAGE_PUBLIC_URL=
VIDEO_RENDERER=remotion

# Optional fallbacks
CREATOMATE_API_KEY=
SHOTSTACK_API_KEY=
```

---

## 31) Caching strategy

Cache:
- imported case files
- evidence packs
- debate scripts
- generated audio
- rendered reels

### Why
This keeps:
- demo flows fast
- costs lower
- repeated renders reliable

### Minimum requirement
If a case was already processed once, the second load should feel nearly instant.

---

## 32) Error handling

### If Reddit URL import fails
Show:
- "Could not load that case."
- buttons:
  - `Try a seeded case`
  - `Paste story text instead`

### If Firecrawl search fails
Keep the case usable.
Fallback to:
- original story only
- verdict still works
- receipts section shows limited mode

### If audio generation fails
Fallback to:
- text-only debate
- render without voice
- still allow reel generation if possible

### If render fails
Show:
- clear retry button
- preserve render spec
- do not lose the case

---

## 33) Build order

## P0 - must have
- rename branding to Main Character Court
- import seeded cases
- case page
- 3-voice debate text
- Firecrawl visible receipts
- verdict panel
- reel export for one preset

## P1 - should have
- live ElevenAgent host
- voice generation for all three debaters
- 20s / 35s / 60s presets
- thumbnail export
- platform caption generation

## P2 - nice to have
- alternate video style
- multiple background packs
- more advanced evidence animations
- dynamic OG images per case

---

## 34) Acceptance criteria

A build is acceptable only if all of the below are true:

1. I can paste a Reddit URL and get a usable case page.
2. I can open a seeded demo case and it always works.
3. I can visibly see Firecrawl-powered receipts.
4. I can hear or play back three distinct debate voices.
5. I get a clear verdict with petty score and closing roast.
6. I can render and download a vertical MP4.
7. The output looks good on mobile.
8. The site feels fun and shareable, not like a utilitarian chatbot.
9. The demo is stable enough to record a hackathon video in one take.
10. It is obvious to a judge how Firecrawl and ElevenLabs were used.

---

## 35) Submission packaging requirements

The project must be ready for a hackathon submission page.

### Required deliverables
- live demo URL
- repo URL
- 60-90 second submission video
- vertical cut for Reels / TikTok
- cover image
- short description
- platform-specific launch copy

### Submission video structure
**0-5s**
- "Paste any Reddit drama. Three AI lawyers fight over the verdict. Then it turns the case into a reel."

**5-20s**
- show paste URL
- show story loading
- show Firecrawl receipts coming in

**20-45s**
- show live debate with distinct voices
- show UI reacting
- show funniest line

**45-60s**
- show verdict
- show reel export
- show final generated clip

**Final seconds**
- clearly mention Firecrawl + ElevenLabs
- end with "Was the court right?"

---

## 36) Better-than-average social strategy

This app is naturally suited for volume and virality.

### Post angles
- "I built an AI courtroom for Reddit drama"
- "Paste any AITAH post and it turns it into a reel"
- "Three AI lawyers decide who is actually the problem"

### Comment bait
Always end videos with:
- "Was the court right?"
- "Appeal this verdict in the comments."
- "Who was actually the villain here?"

### Content loop
One product can generate:
- live demo
- launch reel
- follow-up clips from seeded cases
- response clips from comments
- thread / carousel posts

---

## 37) Recommended implementation details for the reel renderer

### Render presets
#### 20s
- hook
- 1 setup beat
- 3-5 debate lines
- quick verdict
- CTA

#### 35s
- best default
- enough room for humor and verdict

#### 60s
- for deeper cases
- still keep cuts fast

### Animation rules
- subtle scale and fade
- no overdesigned motion
- avoid motion sickness
- prioritize legibility over flair

### Sound rules
- voice first
- background music low
- optional gavel impact on verdict
- optional whoosh on evidence cards

---

## 38) Exact builder instruction on video generation software

### Use this plan
**Primary stack:** Remotion + FFmpeg  
**Fallback:** Creatomate  
**Alternative managed API:** Shotstack

### Why
The uploaded reference reel is basically:
- background loop
- timed text card
- voiceover
- captions
- light animations

That is best solved by structured timeline rendering, not AI video generation.

### Important rule
Do not spend time integrating complex generative video tools.  
That is not needed for this format.

---

## 39) Exact builder handoff prompt

Copy-paste this into the builder agent if needed:

```text
Build a hackathon-ready app called Main Character Court using my existing Lovable frontend as the shell.

Core promise:
Paste any Reddit / AITAH story URL and the app will:
1. ingest the story,
2. gather visible Firecrawl receipts,
3. run a funny 3-way AI courtroom debate,
4. return a verdict,
5. generate a vertical reel from the same case.

Non-negotiables:
- Reuse the current Lovable frontend and styling direction; do not redesign from scratch.
- The product must visibly use Firecrawl in the UI.
- The product must visibly use ElevenLabs / ElevenAgents.
- Include 5 seeded safe demo cases.
- Support reel generation to 1080x1920 MP4 with burned captions.
- Optimize for hackathon demo quality and virality, not enterprise scope.

Recommended stack:
- Frontend: existing Lovable app
- Backend: Node + TypeScript
- Video rendering: Remotion + FFmpeg
- Storage: Supabase or equivalent
- Voice: ElevenLabs
- Data ingestion: Firecrawl

User flow:
- Homepage with URL input + random case + seeded demo cases
- Case page with summary, receipts, debate, verdict
- Reel studio with 20s / 35s / 60s export

Required personas:
1. Prosecutor - sharp, logical, mildly savage
2. Defense - witty, contextual, persuasive
3. Comment Section - funniest, shortest, most memeable

Required verdict:
- label: NTA / YTA / ESH / NAH / INFO
- confidence
- petty score
- red flag count
- one-line closing roast

Firecrawl requirements:
- scrape original case
- search for supporting evidence / similar cases / norms
- show receipts in the UI
- use screenshots where useful
- cache results

ElevenLabs requirements:
- one live ElevenAgent host / clerk in the web app
- TTS voices for the 3 debaters
- client tools for UI actions:
  - showCaseSummary
  - showEvidenceCard
  - highlightSpeaker
  - animateVerdict
  - openReelStudio
  - playGavel

Video requirements:
- use Remotion
- render a deterministic reel from structured data
- use licensed or owned looped vertical background footage
- captions come from the script and timings, not speech-to-text
- include CTA at the end: "Was the court right?"

Safety requirements:
- reject unsafe stories
- keep comedy meme-y but not hateful
- preserve source attribution

Acceptance criteria:
1. Paste URL works.
2. Seeded cases always work.
3. Firecrawl is visible.
4. Three voices feel distinct.
5. Verdict is funny and clear.
6. Reel export works.
7. Demo is recordable in one take.

Build the fastest reliable version first.
```

---

## 40) Final strategic note

The biggest mistake here would be building a technically impressive debate engine that is not visually sticky.

The reference reel proves the opposite:
**simple structure + strong hook + satisfying motion + readable text + punchy voice = high retention**

So the winning approach is:
- make the app real
- make the voices distinct
- make Firecrawl visible
- make the verdict funny
- make the export automatic
- make the demo look like content people would actually share

That is the build.


---

## 41) Official references for the builder

Use these when implementing or checking assumptions:

- ElevenHacks Hack #1 page: https://hacks.elevenlabs.io/hackathons/0
- ElevenHacks submission guide: https://hacks.elevenlabs.io/guide
- ElevenHacks official rules: https://hacks.elevenlabs.io/terms
- Firecrawl Search docs: https://docs.firecrawl.dev/features/search
- Firecrawl Scrape endpoint docs: https://docs.firecrawl.dev/api-reference/endpoint/scrape
- ElevenAgents overview: https://elevenlabs.io/docs/eleven-agents/overview
- ElevenLabs client tools docs: https://elevenlabs.io/docs/eleven-agents/customization/tools/client-tools
- ElevenLabs React SDK docs: https://elevenlabs.io/docs/eleven-agents/libraries/react
- Remotion home/docs: https://www.remotion.dev/
- Remotion Player docs: https://www.remotion.dev/docs/player/
- Creatomate template rendering quickstart: https://creatomate.com/docs/api/quick-start/create-a-video-by-template
- Shotstack API docs: https://shotstack.io/docs/api/
- Reddit Developer Terms: https://redditinc.com/policies/developer-terms
- Lovable external deployment docs: https://docs.lovable.dev/tips-tricks/external-deployment-hosting
- Lovable SEO / social preview docs: https://docs.lovable.dev/tips-tricks/seo-geo
