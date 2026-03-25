/**
 * One-time script to configure the ElevenLabs conversational agent
 * with the Trial Judge persona and Firecrawl search tool.
 *
 * Usage: npx tsx scripts/setup-agent.ts <webhook_base_url>
 * Example: npx tsx scripts/setup-agent.ts https://the-verdict-bot.vercel.app
 */
import "dotenv/config";

const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;
const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!AGENT_ID || !API_KEY) {
  console.error("Missing ELEVENLABS_AGENT_ID or ELEVENLABS_API_KEY in .env");
  process.exit(1);
}

const webhookBase = process.argv[2];
if (!webhookBase) {
  console.error("Usage: npx tsx scripts/setup-agent.ts <webhook_base_url>");
  console.error("Example: npx tsx scripts/setup-agent.ts https://your-app.vercel.app");
  process.exit(1);
}

const SYSTEM_PROMPT = `You are Judge Verdict — a dramatic, entertaining, and slightly unhinged Reddit courtroom judge presiding over AITA (Am I The Asshole) cases.

You will receive case details including the Reddit post, top comments from both sides, and jury vote tallies. Your job is to run a dramatic trial:

1. OPENING: Dramatically summarize the case in 2-3 punchy sentences. Set the scene.
2. PROSECUTION: Present the strongest YTA (You're The Asshole) arguments. Quote real comments. Be fierce.
3. DEFENSE: Present the strongest NTA (Not The Asshole) arguments. Quote real comments. Be passionate.
4. EVIDENCE: Use your search_evidence tool to find any relevant external context about the situation (etiquette rules, legal precedents, relationship advice). Mention what you found.
5. VERDICT: Deliver your dramatic verdict with reasoning. Slam the gavel.

STYLE RULES:
- Keep each response to 2-4 sentences. Be punchy. This is TikTok-style entertainment.
- Use dramatic pauses. Build tension.
- Be funny, memeable, and slightly chaotic. Think Judge Judy meets Reddit.
- Reference upvote counts and comment sentiment to back up arguments.
- If the user challenges your verdict or asks questions, engage with them. Be witty.
- Use phrases like "Order in the court!", "The evidence speaks for itself", "The internet has spoken".

CASE CONTEXT:
{{case_context}}`;

const FIRST_MESSAGE =
  "Order in the court! I'm Judge Verdict, and I've reviewed today's case. Let me tell you... this one is SPICY. Ready to hear the trial? Say 'begin' or ask me anything about the case.";

async function setupAgent() {
  console.log(`\nConfiguring agent ${AGENT_ID}...`);
  console.log(`Webhook base: ${webhookBase}\n`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
    {
      method: "PATCH",
      headers: {
        "xi-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Judge Verdict — AITAH Trial Judge",
        conversation_config: {
          agent: {
            prompt: {
              prompt: SYSTEM_PROMPT,
            },
            first_message: FIRST_MESSAGE,
            language: "en",
          },
          tts: {
            voice_id: process.env.ELEVENLABS_MALE_VOICE_ID || "EkK5I93UQWFDigLMpZcX",
          },
        },
        platform_settings: {
          widget: {
            variant: "full",
            avatar: {
              type: "url",
              url: "https://em-content.zobj.net/source/apple/391/balance-scale_2696-fe0f.png",
            },
          },
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to update agent: ${res.status}\n${err}`);
    process.exit(1);
  }

  console.log("Agent updated successfully.");

  console.log("\n--- IMPORTANT ---");
  console.log("You need to manually add the search_evidence server tool in the ElevenLabs dashboard:");
  console.log(`  1. Go to https://elevenlabs.io/app/conversational-ai/agents/${AGENT_ID}`);
  console.log("  2. Click 'Tools' in the left sidebar");
  console.log("  3. Add a new 'Server Tool' (webhook) with:");
  console.log(`     - Name: search_evidence`);
  console.log(`     - Description: Search the web for relevant context, evidence, etiquette rules, or relationship advice related to the AITA case. Use this to find external perspectives.`);
  console.log(`     - URL: ${webhookBase}/api/agent/tools/search-evidence`);
  console.log(`     - Method: POST`);
  console.log(`     - Parameters:`);
  console.log(`       - query (string, required): The search query to find relevant evidence`);
  console.log("  4. Enable 'Conversation Overrides' in Security settings (to allow dynamic prompts)");
  console.log("\n  After adding the tool, the agent is ready to use.\n");

  const agentData = await res.json();
  console.log("Agent ID:", (agentData as any).agent_id ?? AGENT_ID);
}

setupAgent().catch(console.error);
