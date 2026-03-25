import type { VercelRequest, VercelResponse } from "@vercel/node";

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const query =
    req.body?.query ??
    req.body?.parameters?.query ??
    req.body?.tool_call?.parameters?.query;

  if (!query || typeof query !== "string") {
    return res.json({
      result: "No query provided. Ask the user what they want to know more about.",
    });
  }

  if (!FIRECRAWL_KEY) {
    return res.json({ result: "Search unavailable at the moment." });
  }

  try {
    const fcRes = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_KEY}`,
      },
      body: JSON.stringify({
        query: `${query} AITA reddit etiquette advice`,
        limit: 3,
      }),
    });

    if (!fcRes.ok) {
      return res.json({ result: `Firecrawl search returned ${fcRes.status}. No results found.` });
    }

    const json = await fcRes.json();
    const results = ((json as any)?.data ?? [])
      .slice(0, 3)
      .map((r: any) => ({
        title: r.title ?? "Untitled",
        url: r.url ?? "",
        excerpt: ((r.markdown ?? r.description ?? "") as string).slice(0, 300),
      }));

    if (results.length === 0) {
      return res.json({ result: "No relevant evidence found on the web for this query." });
    }

    const formatted = results
      .map(
        (r: any, i: number) =>
          `[${i + 1}] "${r.title}" (${r.url})\n${r.excerpt}`,
      )
      .join("\n\n");

    return res.json({
      result: `Found ${results.length} pieces of evidence:\n\n${formatted}`,
    });
  } catch (err: unknown) {
    return res.json({
      result: `Search failed: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}
