import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  sanitizeRedditUrl,
  fetchRedditThread,
  buildCaseBundle,
  searchFirecrawlReceipts,
} from "../_lib/reddit.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    let url: string;
    try {
      url = sanitizeRedditUrl(req.body?.url);
    } catch (e: unknown) {
      return res.status(400).json({ error: e instanceof Error ? e.message : "Invalid URL" });
    }

    const raw = await fetchRedditThread(url);
    const bundle = buildCaseBundle(raw, url);

    const receipts = await searchFirecrawlReceipts(
      `${bundle.post.title} AITA reddit etiquette`,
    );

    return res.json({ ...bundle, receipts });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}
