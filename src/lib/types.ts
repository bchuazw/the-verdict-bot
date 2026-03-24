export type VerdictLabel = "NTA" | "YTA" | "ESH" | "NAH" | "INFO";

export type Speaker = "clerk" | "prosecutor" | "defense" | "comments";

export type Beat =
  | "hook"
  | "setup"
  | "argument"
  | "counter"
  | "verdict"
  | "cta";

export interface CaseFile {
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
  likelyVerdicts: VerdictLabel[];
  topicTags: string[];
  safetyFlags: string[];
  attribution: {
    platform: "Reddit";
    username?: string;
    permalink?: string;
  };
}

export interface EvidenceCard {
  id: string;
  label: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType:
    | "original_post"
    | "similar_case"
    | "etiquette"
    | "news"
    | "commentary";
  quote: string;
  screenshotUrl?: string;
}

export interface EvidencePack {
  cards: EvidenceCard[];
  firecrawlMeta: {
    searched: boolean;
    scraped: boolean;
    screenshotCount: number;
  };
}

export interface DebateLine {
  speaker: Speaker;
  text: string;
  beat: Beat;
  evidenceIds?: string[];
  approxDurationSec: number;
}

export interface CourtVerdict {
  label: VerdictLabel;
  confidence: number;
  pettyScore: number;
  redFlagCount: number;
  oneLiner: string;
  rationale: string;
}

export interface DebateScript {
  hook: string;
  setup: string[];
  lines: DebateLine[];
  verdict: CourtVerdict;
  cta: string;
}

export interface ReelScene {
  type:
    | "title"
    | "story-card"
    | "speaker-card"
    | "evidence-card"
    | "verdict-card"
    | "cta-card";
  startSec: number;
  endSec: number;
  payload: Record<string, unknown>;
}

export interface ReelSpec {
  id: string;
  preset: "20s" | "35s" | "60s";
  style: "story" | "debate";
  width: 1080;
  height: 1920;
  fps: 30;
  title: string;
  hookText: string;
  scenes: ReelScene[];
  thumbnailText: string;
}

export interface SeededCase {
  caseFile: CaseFile;
  evidencePack: EvidencePack;
  debateScript: DebateScript;
}
