export type VerdictType = 'NTA' | 'YTA' | 'ESH' | 'NAH';

export interface Verdict {
  type: VerdictType;
  confidence: number;
  assholePercentage: number;
  verdictText: string;
  perspectiveFlip: string;
  lesson: string;
  oneLiner: string;
  pettyScore?: number;
  redFlagCount?: number;
}

export const verdictMeta: Record<VerdictType, { label: string; emoji: string; colorClass: string }> = {
  NTA: { label: 'Not The Asshole', emoji: '🟢', colorClass: 'text-verdict-nta' },
  YTA: { label: "You're The Asshole", emoji: '🔴', colorClass: 'text-verdict-yta' },
  ESH: { label: 'Everyone Sucks Here', emoji: '🟡', colorClass: 'text-verdict-esh' },
  NAH: { label: 'No Assholes Here', emoji: '🔵', colorClass: 'text-verdict-nah' },
};

export const verdictBgMap: Record<VerdictType, string> = {
  NTA: 'bg-verdict-nta',
  YTA: 'bg-verdict-yta',
  ESH: 'bg-verdict-esh',
  NAH: 'bg-verdict-nah',
};
