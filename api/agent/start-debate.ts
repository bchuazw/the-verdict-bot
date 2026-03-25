import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildCaseContext } from "../_lib/reddit.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  const PROS_ID = process.env.ELEVENLABS_PROSECUTOR_AGENT_ID;
  const DEF_ID = process.env.ELEVENLABS_DEFENSE_AGENT_ID;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  if (!API_KEY || !PROS_ID || !DEF_ID) {
    return res.status(500).json({ error: "Debate agents not configured" });
  }

  try {
    const bundle = req.body?.caseBundle;
    if (!bundle?.post) {
      return res.status(400).json({ error: "caseBundle with post data is required" });
    }

    const caseCtx = buildCaseContext({
      post: bundle.post,
      jury: bundle.jury,
      comments: bundle.comments ?? [],
    });

    const juryLine = Object.entries(bundle.jury?.verdictCounts ?? {})
      .sort(([, a]: any, [, b]: any) => b - a)
      .map(([k, v]: any) => `${k}: ${v}`)
      .join(", ");

    const prosPrompt = `You are The Prosecutor in an AITA Reddit courtroom trial. You argue the OP IS the asshole (YTA).

RULES:
- Keep every response to 2-4 punchy sentences MAX. This is TikTok-style entertainment.
- Quote real Reddit comments and upvote counts as evidence.
- Use search_evidence to find external etiquette rules or relationship advice supporting YTA.
- Be dramatic, fierce, and quotable. Think courtroom drama meets social media.
- Never break character. You are ALWAYS the prosecutor.

CASE:
${caseCtx}`;

    const defPrompt = `You are The Defense Attorney in an AITA Reddit courtroom trial. You argue the OP is NOT the asshole (NTA).

RULES:
- Keep every response to 2-4 punchy sentences MAX. This is TikTok-style entertainment.
- Quote real Reddit comments and upvote counts as evidence.
- Use search_evidence to find external context supporting NTA.
- Be passionate, empathetic, and persuasive. Think courtroom drama meets social media.
- Never break character. You are ALWAYS the defense.

CASE:
${caseCtx}`;

    const [prosRes, defRes] = await Promise.all([
      patchAndSign(API_KEY, PROS_ID, prosPrompt, `The prosecution is ready. Case: "${bundle.post.title}". Reddit jury: ${juryLine}. Let me present why OP is the asshole.`),
      patchAndSign(API_KEY, DEF_ID, defPrompt, `The defense is ready. Case: "${bundle.post.title}". Reddit jury: ${juryLine}. Let me explain why OP is NOT the asshole.`),
    ]);

    return res.json({
      prosecutorSignedUrl: prosRes.signedUrl,
      defenseSignedUrl: defRes.signedUrl,
      caseTitle: bundle.post.title,
    });
  } catch (err: unknown) {
    console.error("start-debate error:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}

async function patchAndSign(apiKey: string, agentId: string, prompt: string, firstMessage: string) {
  const patchRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_config: {
        agent: {
          prompt: { prompt },
          first_message: firstMessage,
        },
      },
    }),
  });

  if (!patchRes.ok) {
    const err = await patchRes.text();
    throw new Error(`Agent PATCH failed (${agentId}): ${patchRes.status} ${err}`);
  }

  const signRes = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
    { headers: { "xi-api-key": apiKey } },
  );

  if (!signRes.ok) throw new Error(`Signed URL failed for ${agentId}`);
  const { signed_url } = (await signRes.json()) as { signed_url: string };
  return { signedUrl: signed_url };
}
