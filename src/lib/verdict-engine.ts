import type { Verdict, VerdictType } from './verdict-types';

export type ToneType = 'sassy' | 'therapist' | 'brutal' | 'genz';

export const toneOptions: { value: ToneType; label: string; emoji: string; description: string }[] = [
  { value: 'sassy', label: 'Sassy Judge', emoji: '💅', description: 'Witty roasting with style' },
  { value: 'therapist', label: 'Therapist Mode', emoji: '🧘', description: 'Gentle & understanding' },
  { value: 'brutal', label: 'Brutally Honest', emoji: '🔥', description: 'No sugar coating' },
  { value: 'genz', label: 'Gen Z', emoji: '💀', description: 'Bestie energy, no cap' },
];

const ytaKeywords = ['lied', 'lying', 'stole', 'stealing', 'ignored', 'ghosted', 'ditched', 'cheated', 'screamed', 'yelled', 'insulted', 'broke', 'refused to apologize', 'pretended', 'manipulated', 'guilt trip', 'revenge', 'petty', 'spite'];
const ntaKeywords = ['boundaries', 'toxic', 'respect', 'labeled', 'my own', 'mine', 'personal', 'privacy', 'consent', 'without asking', 'stealing my', 'my wedding', 'my house', 'my money', 'set limits', 'safety'];
const eshKeywords = ['both', 'we both', 'argued', 'fight', 'escalated', 'neither', 'equally', 'retaliated', 'back and forth', 'mutual'];
const nahKeywords = ['misunderstanding', 'miscommunication', 'didn\'t realize', 'accident', 'honest mistake', 'meant well', 'good intentions', 'trying to help', 'different perspectives'];

function score(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
}

type Template = { verdictText: string; perspectiveFlip: string; lesson: string; oneLiner: string };

const toneTemplates: Record<ToneType, Record<VerdictType, Template[]>> = {
  sassy: {
    NTA: [
      { verdictText: "You're standing your ground and that's not a crime. The other party seems to have crossed a line that most reasonable humans would recognize.", perspectiveFlip: "They might feel hurt or defensive, but that doesn't make their behavior okay. Being called out stings — that's accountability, not aggression.", lesson: "Setting boundaries isn't selfish. It's self-preservation with manners.", oneLiner: "You brought receipts. They brought audacity." },
      { verdictText: "The court finds you not guilty of assholery. You were simply defending what's yours — whether that's your stuff, your time, or your sanity.", perspectiveFlip: "From their angle, they might feel blindsided. But surprise accountability isn't the same as unfairness.", lesson: "You can't control how people react to fair boundaries. That's a them problem.", oneLiner: "They played the victim. You played it right." },
      { verdictText: "Not only are you not the asshole, you might be the most patient person in this story. Gold star for restraint.", perspectiveFlip: "They probably don't see themselves as the problem — most people don't. But the evidence speaks for itself.", lesson: "Being the bigger person is exhausting, but you're doing it. Keep going.", oneLiner: "You're the main character. They're the cautionary tale." },
    ],
    YTA: [
      { verdictText: "Look, I get it — you had your reasons. But those reasons don't hold up in court. You crossed a line, and deep down, you probably know it.", perspectiveFlip: "Put yourself in their shoes for just a moment. Would you be okay with someone doing this to you? Yeah, didn't think so.", lesson: "Owning your mistakes isn't weakness — it's the first step to not repeating them.", oneLiner: "You didn't just miss the point. You drove past it at full speed." },
      { verdictText: "The gavel falls heavy on this one. Your intentions may have been okay-ish, but the execution was pure assholery.", perspectiveFlip: "They're probably sitting somewhere wondering what they did to deserve this. Spoiler: not much.", lesson: "Good intentions don't fix bad actions. Apologize. Mean it. Do better.", oneLiner: "You came for validation. The court delivers accountability." },
      { verdictText: "I hate to break it to you, but you're the villain in this story. Not the supervillain — more like the annoying antagonist everyone roots against.", perspectiveFlip: "They trusted you, or at least expected basic decency. That expectation wasn't unreasonable.", lesson: "The fact that you're asking means you have self-awareness. Use it.", oneLiner: "Congratulations, you played yourself." },
    ],
    ESH: [
      { verdictText: "This is a masterclass in mutual destruction. Both sides had valid points, and both sides fumbled them spectacularly.", perspectiveFlip: "Everyone here thinks they're the hero. Plot twist: there are no heroes in this story.", lesson: "When everyone's throwing stones, nobody's house survives. Try a conversation instead.", oneLiner: "You both chose violence. The relationship chose the exit." },
      { verdictText: "It's like watching two people argue about who started the fire while the house burns down. You're both holding matches.", perspectiveFlip: "Each of you can point to something the other did wrong. And you'd both be right. And that's the problem.", lesson: "Being 'less wrong' isn't the same as being right. Aim higher.", oneLiner: "Two wrongs made a very entertaining mess." },
    ],
    NAH: [
      { verdictText: "Here's the thing — nobody's the asshole here. You're both reasonable people who saw the same situation from different angles.", perspectiveFlip: "Their reaction makes perfect sense from where they're standing. And so does yours. That's the beauty and tragedy of being human.", lesson: "Not every conflict has a villain. Sometimes it's just two good people bumping into each other's blind spots.", oneLiner: "No assholes detected. Just humans being human." },
      { verdictText: "The court finds... no crime committed. This is a classic case of miscommunication, not malice. Everyone meant well, execution just got lost in translation.", perspectiveFlip: "They're not mad at you — they're mad at the situation. And honestly, so are you. Redirect that energy into a conversation.", lesson: "Talk it out. You'll probably laugh about this later.", oneLiner: "Two good hearts, one bad signal. Try again." },
    ],
  },
  therapist: {
    NTA: [
      { verdictText: "It sounds like you were honoring your own needs, and that's a healthy thing to do. Boundaries are an act of self-love, not selfishness.", perspectiveFlip: "The other person may be experiencing this as rejection, which can trigger a defensive response. Their hurt is valid, even if their actions weren't.", lesson: "You can hold space for someone's feelings without abandoning your own boundaries.", oneLiner: "Your needs matter. Full stop." },
      { verdictText: "What you did was protect your peace, and that takes courage. It's okay to feel conflicted about it — that shows empathy.", perspectiveFlip: "They may not have the tools to process this constructively yet. That's their journey, not your burden.", lesson: "You're allowed to prioritize your wellbeing without guilt.", oneLiner: "Growth sometimes looks like saying no." },
    ],
    YTA: [
      { verdictText: "I can see this came from a place of frustration, and that's understandable. But the way you handled it caused harm, and acknowledging that is the first step toward repair.", perspectiveFlip: "Imagine receiving what you gave. How would that land in your body? Sit with that feeling — it's trying to teach you something.", lesson: "You can be right about the issue and still be wrong about the approach. Both things can be true.", oneLiner: "Hurt people hurt people. Break the cycle." },
      { verdictText: "It takes real strength to ask if you were wrong. The answer here is yes, but that doesn't define you — your next action does.", perspectiveFlip: "They're likely carrying the weight of this interaction. A genuine apology can lift that weight for both of you.", lesson: "Accountability isn't punishment. It's the foundation of trust.", oneLiner: "The bravest thing you can do now is make it right." },
    ],
    ESH: [
      { verdictText: "This situation shows two people who both had unmet needs and didn't have the tools to communicate them effectively. That's human, and it's fixable.", perspectiveFlip: "Both of you were reacting from a place of pain. Neither response was ideal, but both are understandable.", lesson: "When conflict escalates, it's usually because both sides feel unheard. Try listening before defending.", oneLiner: "Two people in pain, reaching for connection the wrong way." },
    ],
    NAH: [
      { verdictText: "This is a beautiful example of how two caring people can see the same situation completely differently. Nobody did anything wrong — you just need to bridge the gap.", perspectiveFlip: "Their perspective is shaped by their experiences, just as yours is. Neither view is more 'correct' — they're just different.", lesson: "The goal isn't to be right. It's to understand and be understood.", oneLiner: "Connection over correction. Always." },
    ],
  },
  brutal: {
    NTA: [
      { verdictText: "You're fine. They're wrong. End of story. Anyone who tells you otherwise is either delusional or benefiting from your doormat tendencies.", perspectiveFlip: "Sure, they might have feelings about it. So what? Having feelings doesn't make you right.", lesson: "Stop apologizing for having standards. It's embarrassing.", oneLiner: "You're not the asshole. They're just not used to consequences." },
      { verdictText: "Absolutely not the asshole. In fact, you were too nice about it. Most people would've handled this way worse.", perspectiveFlip: "They'll survive. People who cross boundaries always act shocked when walls go up.", lesson: "Stop asking permission to have basic self-respect.", oneLiner: "They f*cked around. They found out." },
    ],
    YTA: [
      { verdictText: "Yeah, you're the asshole. No sugarcoating, no 'but your feelings are valid' nonsense. You messed up. Own it.", perspectiveFlip: "They probably think you're a terrible person right now. Based on what you described? Hard to argue.", lesson: "Fix it or don't, but stop looking for strangers to tell you it was okay. It wasn't.", oneLiner: "You already knew. You just wanted someone to lie to you." },
      { verdictText: "Massively the asshole. Like, textbook. If someone described what you did to me at a party, I'd cringe.", perspectiveFlip: "Literally anyone hearing this story would side with them. That should tell you something.", lesson: "The only thing worse than being wrong is being wrong AND defensive about it.", oneLiner: "Not a good look. Not even a little." },
    ],
    ESH: [
      { verdictText: "You're both awful in this situation. Congratulations on finding each other — you deserve the chaos.", perspectiveFlip: "Neither of you is innocent, so stop pretending. You're both messy and you both know it.", lesson: "Get your act together. Both of you. Separately if necessary.", oneLiner: "A dumpster fire has two sides. You're both flames." },
    ],
    NAH: [
      { verdictText: "Nobody's the asshole, but let's not pretend this is some beautiful misunderstanding. You both just suck at communicating. Fix that.", perspectiveFlip: "They're not wrong. You're not wrong. You're both just bad at talking to each other like adults.", lesson: "Use your words. Clearly. Like you're explaining it to someone who doesn't live in your head.", oneLiner: "Not assholes. Just terrible communicators." },
    ],
  },
  genz: {
    NTA: [
      { verdictText: "Bestie you did NOTHING wrong, this is literally giving main character energy and they're just salty they're an NPC in your storyline fr fr.", perspectiveFlip: "They're probably in their feels rn but like... that's a them problem. They gave pick-me energy and expected you to just take it.", lesson: "Setting boundaries is literally self-care and anyone who says otherwise has the ick. Period.", oneLiner: "They're not giving what they think they're giving. 💀" },
      { verdictText: "No cap, you ate and left no crumbs. The other person is giving delulu energy thinking THEY'RE the victim here. The audacity is astronomical.", perspectiveFlip: "They're probably writing their own AITA post rn and getting cooked in the comments. As they should.", lesson: "You don't owe anyone your peace. That's the tea. ☕", oneLiner: "Slay. They can stay pressed about it. 💅" },
    ],
    YTA: [
      { verdictText: "Oof bestie... this ain't it. You fumbled SO hard and I'm saying this with love but also with second-hand embarrassment because YIKES.", perspectiveFlip: "Like... put yourself in their shoes for literally two seconds. You'd be writing a callout post. Be so fr rn.", lesson: "Take the L, apologize, and pray this doesn't end up on their TikTok storytime.", oneLiner: "The villain origin story nobody asked for. 😬" },
      { verdictText: "Not you thinking you were the hero here 😭 This is giving unhinged behavior and not the fun kind. The red flag is coming from inside the house.", perspectiveFlip: "They're probably trauma dumping to their group chat about you rn and honestly? Valid.", lesson: "Touch grass, reflect, and come back with an apology that HITS.", oneLiner: "POV: you're the toxic friend in the group chat. 💀" },
    ],
    ESH: [
      { verdictText: "This whole situation is giving chaos and not the aesthetic kind. Y'all are both messy and honestly it's kind of iconic but also... please stop.", perspectiveFlip: "Both of you are on your own delulu arc rn. The lack of self-awareness is giving ✨nothing✨.", lesson: "Someone needs to be the bigger person and bestie... neither of you is volunteering.", oneLiner: "Two people with main character syndrome in the same plotline. 😭" },
    ],
    NAH: [
      { verdictText: "Okay so like... nobody's the asshole here? This is literally just a miscommunication arc and honestly it's lowkey wholesome that you care enough to ask.", perspectiveFlip: "They're probably overthinking this just as much as you are. Just talk it out, it's not that deep fr.", lesson: "Sometimes things are just awkward and weird and that's okay. Not everything needs to be a whole thing.", oneLiner: "No drama detected. Just two overthinkers living their truth. 🫶" },
    ],
  },
};

export function generateVerdict(situation: string, tone: ToneType = 'sassy'): Verdict {
  const scores: Record<VerdictType, number> = {
    NTA: score(situation, ntaKeywords),
    YTA: score(situation, ytaKeywords),
    ESH: score(situation, eshKeywords),
    NAH: score(situation, nahKeywords),
  };

  (Object.keys(scores) as VerdictType[]).forEach(k => {
    scores[k] += Math.random() * 1.5;
  });

  const sorted = (Object.entries(scores) as [VerdictType, number][]).sort((a, b) => b[1] - a[1]);
  const type = sorted[0][0];
  const total = sorted.reduce((a, b) => a + b[1], 0);
  const confidence = Math.min(98, Math.max(55, Math.round((sorted[0][1] / Math.max(total, 1)) * 100 + Math.random() * 20)));

  let assholePercentage: number;
  switch (type) {
    case 'NTA': assholePercentage = Math.round(5 + Math.random() * 20); break;
    case 'YTA': assholePercentage = Math.round(65 + Math.random() * 30); break;
    case 'ESH': assholePercentage = Math.round(35 + Math.random() * 25); break;
    case 'NAH': assholePercentage = Math.round(3 + Math.random() * 15); break;
  }

  const templates = toneTemplates[tone][type];
  const template = templates[Math.floor(Math.random() * templates.length)];

  return { type, confidence, assholePercentage, ...template };
}
