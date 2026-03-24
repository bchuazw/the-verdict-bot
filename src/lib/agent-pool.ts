export interface Agent {
  name: string;
  emoji: string;
  color: string;
  role: string;
}

type Archetype = 'hardliner' | 'empath' | 'chaos';

type PooledAgent = Agent & { archetype: Archetype };

/**
 * Small roster of loud, funny *personas* (not random human names).
 * Each run picks one hardliner + one empath + one chaos so combos feel familiar but fresh.
 */
const POOL: PooledAgent[] = [
  // Hardliner — verdict first, feelings later
  { archetype: 'hardliner', name: 'Judge Skill Issue', emoji: '🗿', color: '--verdict-yta', role: 'YTA speedrun' },
  { archetype: 'hardliner', name: 'The Gavel Goblin', emoji: '🔨', color: '--verdict-yta', role: 'No appeals' },
  { archetype: 'hardliner', name: 'Karen: Final Form', emoji: '👑', color: '--gold', role: 'Speaks to mgmt' },
  { archetype: 'hardliner', name: 'Silkwood Shower Judge', emoji: '🧼', color: '--verdict-nah', role: 'Deep cleanse' },
  { archetype: 'hardliner', name: 'Verdict Goblin', emoji: '💀', color: '--verdict-yta', role: 'Case closed' },
  // Empath — soft launch, big feelings
  { archetype: 'empath', name: 'Touch Grass Bro', emoji: '🌿', color: '--verdict-nta', role: 'Healing era' },
  { archetype: 'empath', name: 'Therapy Villain', emoji: '💅', color: '--verdict-nta', role: 'Trauma lore' },
  { archetype: 'empath', name: 'Boundaries Bestie', emoji: '🫂', color: '--verdict-nta', role: 'No is a sentence' },
  { archetype: 'empath', name: 'Copium Pharmacist', emoji: '🤗', color: '--verdict-nta', role: 'NTA hopium' },
  { archetype: 'empath', name: 'The Gentle Ratio', emoji: '🕊️', color: '--verdict-esh', role: 'Ur valid fr' },
  // Chaos — ESH, drama, popcorn
  { archetype: 'chaos', name: 'Chaos Goblin', emoji: '🤡', color: '--verdict-esh', role: 'ESH scholar' },
  { archetype: 'chaos', name: 'Main Character', emoji: '🎭', color: '--verdict-esh', role: 'Lore unclear' },
  { archetype: 'chaos', name: 'AITA Comments', emoji: '🧌', color: '--verdict-nah', role: 'Sort by spicy' },
  { archetype: 'chaos', name: 'Goblin Mode', emoji: '🫠', color: '--gold', role: 'Unhinged' },
  { archetype: 'chaos', name: 'Both-Sides Gremlin', emoji: '🎪', color: '--verdict-esh', role: 'Everyone wrong' },
  { archetype: 'chaos', name: 'Plot Armor OP', emoji: '🛡️', color: '--verdict-esh', role: 'Missing pages' },
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** One random hardliner, empath, and chaos — order matches debate script slots. */
export function pickRandomCouncil(): Agent[] {
  const hardliners = POOL.filter(a => a.archetype === 'hardliner');
  const empaths = POOL.filter(a => a.archetype === 'empath');
  const chaos = POOL.filter(a => a.archetype === 'chaos');
  const strip = ({ name, emoji, color, role }: PooledAgent): Agent => ({ name, emoji, color, role });
  return [strip(pickRandom(hardliners)), strip(pickRandom(empaths)), strip(pickRandom(chaos))];
}
