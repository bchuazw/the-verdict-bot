import {
  sanitizeRedditUrl,
  fetchRedditThread,
  buildCaseBundle,
  searchFirecrawlReceipts,
} from "../_lib/reddit.js";

export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "POST only" }, { status: 405 });
  }

  try {
    const body = await req.json();
    let url: string;
    try {
      url = sanitizeRedditUrl(body?.url);
    } catch (e: unknown) {
      return Response.json(
        { error: e instanceof Error ? e.message : "Invalid URL" },
        { status: 400 },
      );
    }

    let raw: unknown;
    if (body?.redditRaw && Array.isArray(body.redditRaw) && body.redditRaw.length >= 2) {
      raw = body.redditRaw;
    } else {
      raw = await fetchRedditThread(url);
    }

    const bundle = buildCaseBundle(raw, url);

    const receipts = await searchFirecrawlReceipts(
      `${bundle.post.title} AITA reddit etiquette`,
    );

    return Response.json({ ...bundle, receipts });
  } catch (err: unknown) {
    console.error("Ingest error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
