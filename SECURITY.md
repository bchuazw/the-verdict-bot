# Security Checklist for Public Repo

Use this checklist before switching the repository to public.

## 1) Secrets and credentials

- Keep real values only in local `.env` or platform env vars.
- Never commit API keys, tokens, private keys, or signed URLs.
- Rotate all provider keys before/after making the repo public.
- Ensure ElevenLabs and Firecrawl keys are restricted to least privilege.

## 2) Expected environment variables

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `ELEVENLABS_PROSECUTOR_AGENT_ID`
- `ELEVENLABS_DEFENSE_AGENT_ID`
- `FIRECRAWL_API_KEY`
- `ELEVENLABS_FEMALE_VOICE_ID`
- `ELEVENLABS_MALE_VOICE_ID`
- `ELEVENLABS_NARRATOR_VOICE_ID` (optional)
- `MINIMAX_API_KEY` (optional)

Use `.env.example` as the template.

## 3) Data and assets

- Render outputs (for example `aitah-*.mp4`) should stay local.
- Background asset `public/video/parkour-bg.mp4` is intentionally tracked.
- Generated per-case media in `public/generated/` should remain ignored.

## 4) Quick audit command

Run a local scan before every release:

```bash
rg -n -i "(api[_-]?key|secret|token|password|private[_-]?key|BEGIN RSA|BEGIN PRIVATE|sk-[A-Za-z0-9]|fc-[A-Za-z0-9])"
```

Then inspect matches and confirm no real secret values are present.
