import type { Verdict, VerdictType } from './verdict-types';

const ytaKeywords = ['lied', 'lying', 'stole', 'stealing', 'ignored', 'ghosted', 'ditched', 'cheated', 'screamed', 'yelled', 'insulted', 'broke', 'refused to apologize', 'pretended', 'manipulated', 'guilt trip', 'revenge', 'petty', 'spite'];
const ntaKeywords = ['boundaries', 'toxic', 'respect', 'labeled', 'my own', 'mine', 'personal', 'privacy', 'consent', 'without asking', 'stealing my', 'my wedding', 'my house', 'my money', 'set limits', 'safety'];
const eshKeywords = ['both', 'we both', 'argued', 'fight', 'escalated', 'neither', 'equally', 'retaliated', 'back and forth', 'mutual'];
const nahKeywords = ['misunderstanding', 'miscommunication', 'didn\'t realize', 'accident', 'honest mistake', 'meant well', 'good intentions', 'trying to help', 'different perspectives'];

function score(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
}

const verdictTemplates: Record<VerdictType, Array<{
  verdictText: string; perspectiveFlip: string; lesson: string; oneLiner: string;
}>> = {
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
};

export function generateVerdict(situation: string): Verdict {
  const scores: Record<VerdictType, number> = {
    NTA: score(situation, ntaKeywords),
    YTA: score(situation, ytaKeywords),
    ESH: score(situation, eshKeywords),
    NAH: score(situation, nahKeywords),
  };

  // Add randomness
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

  const templates = verdictTemplates[type];
  const template = templates[Math.floor(Math.random() * templates.length)];

  return { type, confidence, assholePercentage, ...template };
}
