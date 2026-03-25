import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  sanitizeRedditUrl,
  fetchRedditThread,
  buildCaseBundle,
  buildCaseContext,
} from "../_lib/reddit.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  if (!AGENT_ID || !API_KEY) {
    return res.status(500).json({ error: "Agent not configured" });
  }

  try {
    let caseContext: string;
    let caseTitle: string;
    let caseSub: string;
    let juryCount: number;

    if (req.body?.caseBundle) {
      const bundle = req.body.caseBundle;
      caseContext = buildCaseContext({
        post: bundle.post,
        jury: bundle.jury,
        comments: bundle.comments ?? [],
      });
      caseTitle = bundle.post?.title ?? "Unknown case";
      caseSub = bundle.post?.subreddit ?? "AmItheAsshole";
      juryCount = bundle.jury?.analyzedCount ?? 0;
    } else {
      const url = sanitizeRedditUrl(req.body?.url);
      const raw = await fetchRedditThread(url);
      const bundle = buildCaseBundle(raw, url);
      caseContext = buildCaseContext(bundle);
      caseTitle = bundle.post.title;
      caseSub = bundle.post.subreddit;
      juryCount = bundle.jury.analyzedCount;
    }

    const patchRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: "PATCH",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_config: {
            agent: {
              prompt: {
                prompt: buildSystemPrompt(caseContext),
              },
              first_message: `Order in the court! I'm Judge Verdict, and I've just reviewed the case: "${caseTitle}" from r/${caseSub}. ${juryCount} Reddit jurors have already weighed in, and let me tell you... this one is SPICY. Say "begin the trial" and I'll present both sides, or ask me anything about the case.`,
            },
          },
        }),
      },
    );

    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error("Agent PATCH failed:", patchRes.status, err);
      return res.status(500).json({ error: "Failed to configure agent for this case" });
    }

    const signedUrlRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
      {
        headers: { "xi-api-key": API_KEY },
      },
    );

    if (!signedUrlRes.ok) {
      return res.status(500).json({ error: "Failed to get signed URL" });
    }

    const { signed_url } = (await signedUrlRes.json()) as { signed_url: string };

    return res.json({
      signedUrl: signed_url,
      caseTitle,
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}

function buildSystemPrompt(caseContext: string): string {
  return `You are Judge Verdict — a dramatic, entertaining, and slightly unhinged Reddit courtroom judge presiding over AITA (Am I The Asshole) cases.

Your job is to run a dramatic trial:

1. OPENING: Dramatically summarize the case in 2-3 punchy sentences. Set the scene.
2. PROSECUTION: Present the strongest YTA arguments. Quote real Reddit comments and upvote counts.
3. DEFENSE: Present the strongest NTA arguments. Quote real Reddit comments.
4. EVIDENCE: Use your search_evidence tool to find any relevant external context about the situation. Mention what you found.
5. VERDICT: Deliver a dramatic verdict with your reasoning. Slam the gavel.

STYLE RULES:
- Keep each response to 2-4 sentences MAX. Be punchy. This is TikTok-style entertainment.
- Be funny, memeable, and slightly chaotic. Think Judge Judy meets Reddit.
- Reference upvote counts and user comments to back up arguments.
- If the user challenges your verdict or asks questions, engage with them. Be witty and dramatic.
- Use phrases like "Order in the court!", "The evidence speaks for itself", "The internet has spoken".
- After the verdict, invite the user to challenge you or ask questions.

CASE CONTEXT:
${caseContext}`;
}
