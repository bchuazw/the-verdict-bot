import type { SeededCase } from "../lib/types";

export const SEEDED_CASES: SeededCase[] = [
  {
    caseFile: {
      id: "case_wedding_001",
      sourceUrl:
        "https://www.reddit.com/r/AmItheAsshole/comments/example1/aita_for_uninviting_my_sister_from_my_wedding/",
      sourceType: "seeded",
      subreddit: "AmItheAsshole",
      author: "throwaway_bride2026",
      title: "AITA for uninviting my sister from my wedding after she announced her pregnancy at my engagement party?",
      rawText:
        "My sister (28F) announced her pregnancy at my (30F) engagement party last month. She stood up during toasts, grabbed the mic, and told everyone she was expecting. My parents were thrilled and the rest of the night became about her. I was devastated. When I told her how I felt, she said I was being selfish and that 'good news should be shared with family.' I uninvited her from the wedding. Now my parents are threatening to boycott if she's not reinvited. My fiancé supports me but says I should consider the family fallout. AITA?",
      shortSummary:
        "Bride uninvited her sister from the wedding after sister hijacked the engagement party to announce her pregnancy. Parents are threatening to boycott.",
      prosecutionFacts: [
        "Uninviting a sibling from a wedding is a nuclear option",
        "The pregnancy announcement might have been poorly timed but wasn't malicious",
        "This decision is fracturing the entire family",
      ],
      defenseFacts: [
        "The sister deliberately took the mic during toasts at someone else's event",
        "The engagement party was completely overshadowed",
        "When confronted, the sister showed zero remorse and called the bride selfish",
      ],
      missingInfo: [
        "Is there a history of the sister stealing spotlight?",
        "Did parents pressure sister to make the announcement there?",
      ],
      likelyVerdicts: ["NTA", "ESH"],
      topicTags: ["wedding", "family", "boundaries", "pregnancy"],
      safetyFlags: [],
      attribution: {
        platform: "Reddit",
        username: "throwaway_bride2026",
        permalink:
          "https://www.reddit.com/r/AmItheAsshole/comments/example1/",
      },
    },
    evidencePack: {
      cards: [
        {
          id: "ev_001",
          label: "Original Post",
          sourceTitle: "AITA for uninviting my sister from my wedding",
          sourceUrl:
            "https://www.reddit.com/r/AmItheAsshole/comments/example1/",
          sourceType: "original_post",
          quote:
            "She grabbed the mic during toasts and told everyone she was expecting.",
        },
        {
          id: "ev_002",
          label: "Etiquette Reference",
          sourceTitle:
            "Emily Post: Announcing News at Someone Else's Event",
          sourceUrl: "https://emilypost.com/advice/celebration-etiquette",
          sourceType: "etiquette",
          quote:
            "Major personal announcements at another person's celebration are widely considered a breach of social etiquette.",
        },
        {
          id: "ev_003",
          label: "Similar Case",
          sourceTitle:
            "Reddit thread: My cousin proposed at my wedding reception",
          sourceUrl:
            "https://www.reddit.com/r/AmItheAsshole/comments/similar1/",
          sourceType: "similar_case",
          quote:
            "Overwhelming consensus: hijacking someone's event for your own announcement is a major boundary violation.",
        },
      ],
      firecrawlMeta: {
        searched: true,
        scraped: true,
        screenshotCount: 1,
      },
    },
    debateScript: {
      hook: "She grabbed the mic at HER SISTER'S engagement party... to announce her own pregnancy. Now she's uninvited from the wedding.",
      setup: [
        "A bride-to-be had her engagement party hijacked by her own sister's pregnancy announcement.",
        "When confronted, the sister said she was being 'selfish.' Parents are now threatening to boycott the wedding.",
      ],
      lines: [
        {
          speaker: "prosecutor",
          text: "Uninviting your own sister from your wedding? That's not setting a boundary, that's dropping a tactical nuke on Thanksgiving for the next decade.",
          beat: "argument",
          approxDurationSec: 5,
        },
        {
          speaker: "defense",
          text: "She literally commandeered the microphone at someone else's event. That's not sharing joy — that's a hostile takeover with a positive pregnancy test.",
          beat: "counter",
          evidenceIds: ["ev_001"],
          approxDurationSec: 5,
        },
        {
          speaker: "comments",
          text: "The audacity is literally pregnant. 💀",
          beat: "argument",
          approxDurationSec: 2,
        },
        {
          speaker: "prosecutor",
          text: "But cutting your sister out of your wedding creates permanent family damage. Is one bad night worth a lifetime rift?",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "She had every other day to announce. She chose the ONE night that wasn't about her. And when called out? Zero remorse. Called the bride selfish.",
          beat: "counter",
          evidenceIds: ["ev_002"],
          approxDurationSec: 5,
        },
        {
          speaker: "comments",
          text: "Main character syndrome so strong it's having a baby of its own.",
          beat: "argument",
          approxDurationSec: 3,
        },
        {
          speaker: "prosecutor",
          text: "The parents threatening to boycott tells me this family was already on thin ice. Maybe the bride should be the bigger person here.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "Being 'the bigger person' is just code for 'let people walk all over you and smile about it.' The bride set a boundary. Good for her.",
          beat: "counter",
          approxDurationSec: 5,
        },
        {
          speaker: "comments",
          text: "The parents picking the sister's side is the real plot twist. Whole family needs a software update.",
          beat: "argument",
          approxDurationSec: 3,
        },
      ],
      verdict: {
        label: "NTA",
        confidence: 82,
        pettyScore: 7,
        redFlagCount: 3,
        oneLiner:
          "She stole your spotlight and called YOU selfish. The trash took itself out.",
        rationale:
          "The sister deliberately hijacked a significant family event and showed zero accountability. While uninviting from the wedding is extreme, it's a proportional response to a pattern of entitlement. The parents choosing sides only validates the boundary.",
      },
      cta: "Was the court right? Or should the bride have let it go?",
    },
  },
  {
    caseFile: {
      id: "case_roommate_002",
      sourceUrl:
        "https://www.reddit.com/r/AmItheAsshole/comments/example2/aita_for_charging_my_roommate_for_utilities/",
      sourceType: "seeded",
      subreddit: "AmItheAsshole",
      author: "fed_up_roommate",
      title: "AITA for billing my roommate for the exact electricity her crypto mining rig uses?",
      rawText:
        "My roommate (26M) set up a crypto mining rig in his room 3 months ago. Our electric bill went from $80/month to $340/month. We split utilities 50/50 per our lease agreement. I bought a smart plug, measured his rig's usage, and presented him with the data showing his setup accounts for 85% of the increase. I told him he should pay the difference. He says I'm being 'petty and obsessive' and that we agreed to split 50/50. He refuses to pay more. I'm considering going to our landlord. AITA?",
      shortSummary:
        "Roommate's crypto mining rig quadrupled the electric bill. OP measured the exact usage and wants them to pay the difference. Roommate says 50/50 is 50/50.",
      prosecutionFacts: [
        "The lease agreement says 50/50 — technically binding",
        "Buying a smart plug to monitor usage could feel invasive",
        "Going to the landlord escalates a roommate dispute unnecessarily",
      ],
      defenseFacts: [
        "The electric bill went from $80 to $340 — a 325% increase",
        "The mining rig is a personal business expense, not normal living",
        "OP brought data and tried to resolve it directly first",
      ],
      missingInfo: [
        "Does the roommate profit from the mining?",
        "Was there any discussion before the rig was set up?",
      ],
      likelyVerdicts: ["NTA"],
      topicTags: ["roommate", "money", "crypto", "utilities"],
      safetyFlags: [],
      attribution: {
        platform: "Reddit",
        username: "fed_up_roommate",
        permalink:
          "https://www.reddit.com/r/AmItheAsshole/comments/example2/",
      },
    },
    evidencePack: {
      cards: [
        {
          id: "ev_004",
          label: "Original Post",
          sourceTitle: "AITA for billing my roommate for electricity",
          sourceUrl:
            "https://www.reddit.com/r/AmItheAsshole/comments/example2/",
          sourceType: "original_post",
          quote:
            "Our electric bill went from $80/month to $340/month after the mining rig.",
        },
        {
          id: "ev_005",
          label: "Legal Reference",
          sourceTitle: "Tenant Utility Disputes - Legal Guide",
          sourceUrl: "https://www.nolo.com/legal-encyclopedia/utility-disputes",
          sourceType: "commentary",
          quote:
            "When one tenant's usage disproportionately affects shared utilities, courts generally side with equitable distribution over rigid 50/50 splits.",
        },
      ],
      firecrawlMeta: {
        searched: true,
        scraped: true,
        screenshotCount: 0,
      },
    },
    debateScript: {
      hook: "His roommate's crypto rig turned their $80 electric bill into $340. He bought a SMART PLUG to prove it. Now he wants the receipts paid.",
      setup: [
        "A roommate secretly set up a crypto mining rig that quadrupled the electric bill.",
        "OP measured the exact usage and wants fair payment. Roommate says the lease says 50/50.",
      ],
      lines: [
        {
          speaker: "prosecutor",
          text: "You bought a smart plug to spy on your roommate's electricity usage. That's giving forensic accountant energy for a $260 dispute.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "He brought data to a disagreement. That's not petty — that's professional. The roommate is running a side business on someone else's dime.",
          beat: "counter",
          evidenceIds: ["ev_004"],
          approxDurationSec: 5,
        },
        {
          speaker: "comments",
          text: "Bro is mining Ethereum and expecting his roommate to subsidize it. The entitlement is blockchain-verified. 💀",
          beat: "argument",
          approxDurationSec: 3,
        },
        {
          speaker: "prosecutor",
          text: "The lease says 50/50. A deal is a deal. If you don't like it, renegotiate — don't pull out surveillance equipment.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "A 50/50 split assumes normal usage. Running a server farm out of your bedroom is not normal. That's like splitting groceries 50/50 when one person eats for eight.",
          beat: "counter",
          evidenceIds: ["ev_005"],
          approxDurationSec: 5,
        },
        {
          speaker: "comments",
          text: "He's not mining crypto. He's mining his roommate's patience. And it just ran out.",
          beat: "argument",
          approxDurationSec: 3,
        },
        {
          speaker: "prosecutor",
          text: "Going to the landlord over this is a relationship-ending move. Try a conversation first.",
          beat: "argument",
          approxDurationSec: 3,
        },
        {
          speaker: "defense",
          text: "He DID try a conversation. The roommate called him petty and refused. What's left?",
          beat: "counter",
          approxDurationSec: 3,
        },
        {
          speaker: "comments",
          text: "The smart plug was the most reasonable thing anyone's done in this entire subreddit.",
          beat: "argument",
          approxDurationSec: 3,
        },
      ],
      verdict: {
        label: "NTA",
        confidence: 91,
        pettyScore: 4,
        redFlagCount: 2,
        oneLiner:
          "He came with receipts. Literally. The data doesn't lie even if your roommate does.",
        rationale:
          "Running a crypto mining rig that quadruples shared utilities without adjusting the cost split is freeloading. OP tried to resolve it with data and conversation. The roommate's refusal to engage fairly justifies escalation.",
      },
      cta: "Was the court right? Should roommates always split 50/50 no matter what?",
    },
  },
  {
    caseFile: {
      id: "case_birthday_003",
      sourceUrl:
        "https://www.reddit.com/r/AmItheAsshole/comments/example3/aita_for_leaving_my_own_birthday_dinner/",
      sourceType: "seeded",
      subreddit: "AmItheAsshole",
      author: "birthday_walkout",
      title: "AITA for walking out of my own birthday dinner when my friends made me pay for everyone?",
      rawText:
        "My friends (all late 20s) organized a birthday dinner for me at a nice restaurant. I was really touched until the bill came and they said 'birthday person treats!' I was shocked — I didn't pick the restaurant, didn't know we were going somewhere expensive, and the bill was $480 for 6 people. I said I couldn't afford that. They laughed and said it's tradition. I put down money for my own meal, said 'happy birthday to me I guess,' and left. Now half the group is calling me dramatic and the other half thinks I was right. AITA?",
      shortSummary:
        "Friends organized a birthday dinner at an expensive restaurant, then expected the birthday person to pay the entire $480 bill. OP walked out after paying for their own meal.",
      prosecutionFacts: [
        "Walking out of your own birthday dinner is dramatically public",
        "The friends may have genuinely thought this was a normal tradition",
        "Could have handled it privately after dinner",
      ],
      defenseFacts: [
        "Friends chose the expensive restaurant without OP's input",
        "Springing a $480 bill on someone is not a 'tradition' — it's a trap",
        "OP still paid for their own meal before leaving",
      ],
      missingInfo: [
        "Is this actually a tradition in this friend group?",
        "Did anyone offer to split it differently?",
      ],
      likelyVerdicts: ["NTA"],
      topicTags: ["friends", "money", "birthday", "etiquette"],
      safetyFlags: [],
      attribution: {
        platform: "Reddit",
        username: "birthday_walkout",
        permalink:
          "https://www.reddit.com/r/AmItheAsshole/comments/example3/",
      },
    },
    evidencePack: {
      cards: [
        {
          id: "ev_006",
          label: "Original Post",
          sourceTitle: "AITA for walking out of my birthday dinner",
          sourceUrl:
            "https://www.reddit.com/r/AmItheAsshole/comments/example3/",
          sourceType: "original_post",
          quote:
            "I put down money for my own meal, said 'happy birthday to me I guess,' and left.",
        },
        {
          id: "ev_007",
          label: "Etiquette",
          sourceTitle: "Who Pays for a Birthday Dinner?",
          sourceUrl: "https://www.brides.com/who-pays-birthday-dinner",
          sourceType: "etiquette",
          quote:
            "If you organize a dinner for someone, the general expectation is that the organizers cover the cost — not the guest of honor.",
        },
      ],
      firecrawlMeta: {
        searched: true,
        scraped: true,
        screenshotCount: 0,
      },
    },
    debateScript: {
      hook: "Her friends threw her a birthday dinner at a fancy restaurant... then handed HER the $480 bill. She walked out.",
      setup: [
        "Friends organized a birthday dinner at a restaurant they picked, then expected the birthday person to pay for everyone.",
        "OP paid for their own meal and left. The friend group is now split.",
      ],
      lines: [
        {
          speaker: "prosecutor",
          text: "Walking out of your own birthday dinner is peak dramatic exit energy. You could have dealt with this after dessert.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "They ambushed her with a $480 bill for a dinner SHE didn't plan at a restaurant SHE didn't choose. That's not a birthday — that's a hostage situation.",
          beat: "counter",
          evidenceIds: ["ev_006"],
          approxDurationSec: 5,
        },
        {
          speaker: "comments",
          text: "Happy birthday! Here's your gift: financial anxiety and trust issues. 🎂",
          beat: "argument",
          approxDurationSec: 3,
        },
        {
          speaker: "prosecutor",
          text: "Maybe it IS their tradition. Different friend groups have different norms. She should have asked before assuming.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "If your tradition involves surprising someone with a bill they can't afford, your tradition is broken. Traditions require informed consent.",
          beat: "counter",
          evidenceIds: ["ev_007"],
          approxDurationSec: 4,
        },
        {
          speaker: "comments",
          text: "They organized a dinner and made the guest of honor pay. That's just a scam with candles. 🕯️",
          beat: "argument",
          approxDurationSec: 3,
        },
        {
          speaker: "prosecutor",
          text: "She still embarrassed the group by walking out publicly. There's a way to handle disagreements with grace.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "She paid for her own meal, said one sentence, and left. That IS grace. Most people would have flipped the table.",
          beat: "counter",
          approxDurationSec: 4,
        },
        {
          speaker: "comments",
          text: "'Happy birthday to me I guess' is the most iconic exit line of all time. Legend behavior.",
          beat: "argument",
          approxDurationSec: 3,
        },
      ],
      verdict: {
        label: "NTA",
        confidence: 88,
        pettyScore: 6,
        redFlagCount: 2,
        oneLiner:
          "Your friends organized a surprise party... where the surprise was the bill. NTA.",
        rationale:
          "If you organize someone's celebration, you don't hand them the check. OP handled it better than most would have — paid their share and left without a scene. The friends who are upset are the ones who should be embarrassed.",
      },
      cta: "Was the court right? Would you have stayed and paid?",
    },
  },
  {
    caseFile: {
      id: "case_inlaw_004",
      sourceUrl:
        "https://www.reddit.com/r/AmItheAsshole/comments/example4/aita_for_telling_my_mil_she_cant_rearrange_my_kitchen/",
      sourceType: "seeded",
      subreddit: "AmItheAsshole",
      author: "kitchen_queen",
      title: "AITA for telling my mother-in-law she can't rearrange my kitchen every time she visits?",
      rawText:
        "Every time my MIL (62F) visits (about once a month), she 'reorganizes' my kitchen. She moves spices, rearranges cabinets, even throws out food she deems 'expired' (it's not). Last visit she replaced my knife set with one she bought because mine were 'dangerous.' I finally snapped and told her that this is MY home and she needs to stop rearranging it. She cried, said she was 'just trying to help,' and my husband called me harsh. He thinks I should let it go because 'she means well.' Now she won't come over and my husband blames me. AITA?",
      shortSummary:
        "Mother-in-law reorganizes OP's kitchen every visit, throws out food, and replaced the knife set. OP finally snapped. MIL cried, husband is siding with his mom.",
      prosecutionFacts: [
        "OP 'snapped' rather than setting the boundary calmly first",
        "The MIL may genuinely be trying to help in her own way",
        "The delivery could have been gentler",
      ],
      defenseFacts: [
        "MIL has been overstepping boundaries repeatedly for months",
        "She threw out food and replaced OP's possessions without permission",
        "Husband dismissing OP's feelings makes it worse",
      ],
      missingInfo: [
        "Did OP try to set this boundary before snapping?",
        "Does the husband ever defend OP to his mother?",
      ],
      likelyVerdicts: ["NTA", "ESH"],
      topicTags: ["in-laws", "boundaries", "marriage", "home"],
      safetyFlags: [],
      attribution: {
        platform: "Reddit",
        username: "kitchen_queen",
        permalink:
          "https://www.reddit.com/r/AmItheAsshole/comments/example4/",
      },
    },
    evidencePack: {
      cards: [
        {
          id: "ev_008",
          label: "Original Post",
          sourceTitle: "AITA for telling my MIL to stop rearranging my kitchen",
          sourceUrl:
            "https://www.reddit.com/r/AmItheAsshole/comments/example4/",
          sourceType: "original_post",
          quote:
            "She replaced my knife set with one she bought because mine were 'dangerous.'",
        },
        {
          id: "ev_009",
          label: "Relationship Advice",
          sourceTitle: "Setting Boundaries with In-Laws",
          sourceUrl:
            "https://www.psychologytoday.com/us/blog/in-law-relationships",
          sourceType: "commentary",
          quote:
            "When a partner consistently sides with their parent over their spouse on household matters, it signals an unresolved boundary issue in the marriage itself.",
        },
      ],
      firecrawlMeta: {
        searched: true,
        scraped: true,
        screenshotCount: 0,
      },
    },
    debateScript: {
      hook: "Her mother-in-law rearranges her kitchen EVERY visit, throws out food, and replaced her knives. She finally said something. Now SHE'S the bad guy.",
      setup: [
        "A mother-in-law 'reorganizes' OP's kitchen every monthly visit — including throwing out food and replacing kitchen tools.",
        "OP snapped after the latest visit. MIL cried. Husband says OP was too harsh.",
      ],
      lines: [
        {
          speaker: "prosecutor",
          text: "You 'snapped' at a 62-year-old woman who was trying to help. There's a difference between setting a boundary and detonating one.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "She's been rearranging someone else's home for months. She threw out food. She REPLACED the knives. 'Helping' without consent is just control with a smile.",
          beat: "counter",
          evidenceIds: ["ev_008"],
          approxDurationSec: 5,
        },
        {
          speaker: "comments",
          text: "The husband said 'she means well.' Sir, your mother means to run this household and you're holding the door open. 🚪",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "prosecutor",
          text: "MIL is from a generation where this is how you show love. Maybe try understanding her love language before shutting her down.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "If your love language is 'reorganizing someone else's life without permission,' your love language needs a software update.",
          beat: "counter",
          approxDurationSec: 4,
        },
        {
          speaker: "comments",
          text: "The real villain is the husband. Two women are fighting and he's in the comments section. Pick a side, bro.",
          beat: "argument",
          approxDurationSec: 3,
        },
        {
          speaker: "prosecutor",
          text: "Now MIL won't visit at all. Is that really the outcome you wanted? This could have been handled with a gentle conversation.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "MIL won't visit because she was told she can't control someone else's home. If that's enough to keep her away, the boundary is working perfectly.",
          beat: "counter",
          evidenceIds: ["ev_009"],
          approxDurationSec: 5,
        },
        {
          speaker: "comments",
          text: "MIL threw out food, replaced the knives, and SHE cried? The manipulation is award-winning. Oscar-level.",
          beat: "argument",
          approxDurationSec: 3,
        },
      ],
      verdict: {
        label: "NTA",
        confidence: 79,
        pettyScore: 5,
        redFlagCount: 4,
        oneLiner:
          "Your kitchen, your rules. The real asshole is the husband watching from the sidelines.",
        rationale:
          "Repeated boundary violations don't become acceptable because they come from family. The MIL was consistently overstepping, and the husband's failure to support his spouse is the deeper issue here. OP's delivery could have been softer, but the message was overdue.",
      },
      cta: "Was the court right? Should OP have let the MIL keep 'helping'?",
    },
  },
  {
    caseFile: {
      id: "case_office_005",
      sourceUrl:
        "https://www.reddit.com/r/AmItheAsshole/comments/example5/aita_for_refusing_to_cover_my_coworkers_shift/",
      sourceType: "seeded",
      subreddit: "AmItheAsshole",
      author: "pto_defender",
      title: "AITA for refusing to cover my coworker's shift on my approved PTO day so she could go to a concert?",
      rawText:
        "I (28F) had PTO approved 2 months ago for a mental health day. My coworker (25F) bought concert tickets and asked me to cover her shift that day. I said no — I have plans (even though my plan is literally to do nothing and recover). She told the team I was 'selfish' for not helping when I'm 'just sitting at home.' My manager said it's my choice but hinted I should be a 'team player.' Now the whole office is weird. Half think I should have helped, half think she's entitled. AITA?",
      shortSummary:
        "Coworker wants OP to give up her pre-approved PTO so the coworker can attend a concert. OP refused. Now the office is divided.",
      prosecutionFacts: [
        "OP's PTO plan is literally 'do nothing' — it's flexible",
        "Helping a coworker builds goodwill",
        "Manager hinted at team player expectations",
      ],
      defenseFacts: [
        "PTO was approved 2 months in advance",
        "Mental health days are valid regardless of activity",
        "Coworker's concert is less important than pre-approved time off",
        "Coworker went to the team to shame OP instead of accepting the answer",
      ],
      missingInfo: [
        "Has OP covered for this coworker before?",
        "Does the coworker ever reciprocate?",
      ],
      likelyVerdicts: ["NTA"],
      topicTags: ["work", "PTO", "boundaries", "coworker"],
      safetyFlags: [],
      attribution: {
        platform: "Reddit",
        username: "pto_defender",
        permalink:
          "https://www.reddit.com/r/AmItheAsshole/comments/example5/",
      },
    },
    evidencePack: {
      cards: [
        {
          id: "ev_010",
          label: "Original Post",
          sourceTitle: "AITA for refusing to cover my coworker's shift",
          sourceUrl:
            "https://www.reddit.com/r/AmItheAsshole/comments/example5/",
          sourceType: "original_post",
          quote:
            "She told the team I was 'selfish' for not helping when I'm 'just sitting at home.'",
        },
        {
          id: "ev_011",
          label: "Workplace Norms",
          sourceTitle: "PTO Rights and Workplace Boundaries",
          sourceUrl: "https://www.askamanager.org/pto-boundaries",
          sourceType: "commentary",
          quote:
            "Approved PTO is not negotiable based on what you plan to do with it. Rest IS a valid use of time off.",
        },
      ],
      firecrawlMeta: {
        searched: true,
        scraped: true,
        screenshotCount: 0,
      },
    },
    debateScript: {
      hook: "She took a mental health day. Her coworker wanted it for a CONCERT. When she said no, the whole office turned against her.",
      setup: [
        "OP had PTO approved two months ago for a mental health day. A coworker bought concert tickets for the same day and demanded OP give up her time off.",
        "When OP refused, the coworker told the whole team. Now the manager is hinting OP should be a 'team player.'",
      ],
      lines: [
        {
          speaker: "prosecutor",
          text: "Your plans are to sit at home and do nothing. Hers are to see a concert. It wouldn't have killed you to flex a little for a colleague.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "Rest IS the plan. Mental health days exist for a reason. Nobody needs to justify their PTO with a permission slip detailing how they'll spend it.",
          beat: "counter",
          evidenceIds: ["ev_011"],
          approxDurationSec: 5,
        },
        {
          speaker: "comments",
          text: "She bought concert tickets AFTER OP's PTO was approved and somehow OP is the problem? The math isn't mathing. 📐",
          beat: "argument",
          approxDurationSec: 3,
        },
        {
          speaker: "prosecutor",
          text: "The manager hinted at being a team player. You might be right on principle, but office politics is a real game with real consequences.",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "defense",
          text: "A manager who passively pressures employees to give up approved time off is the problem here, not the employee who said no.",
          beat: "counter",
          approxDurationSec: 4,
        },
        {
          speaker: "comments",
          text: "Coworker went to the group chat to start a smear campaign because she couldn't go to Beyoncé. The audacity is in surround sound. 🔊",
          beat: "argument",
          approxDurationSec: 4,
        },
        {
          speaker: "prosecutor",
          text: "Sometimes being right isn't the same as being kind. A small sacrifice goes a long way in team dynamics.",
          beat: "argument",
          approxDurationSec: 3,
        },
        {
          speaker: "defense",
          text: "She said no politely. The coworker responded with a public shaming campaign. Only one of those is unkind — and it's not OP.",
          beat: "counter",
          evidenceIds: ["ev_010"],
          approxDurationSec: 4,
        },
        {
          speaker: "comments",
          text: "Doing nothing on your day off is an elite-level plan and I will not tolerate its disrespect.",
          beat: "argument",
          approxDurationSec: 3,
        },
      ],
      verdict: {
        label: "NTA",
        confidence: 94,
        pettyScore: 2,
        redFlagCount: 3,
        oneLiner:
          "Your PTO, your rules. She can stream the concert from her shift.",
        rationale:
          "Pre-approved time off is non-negotiable. The coworker's poor planning doesn't create an obligation for OP. Going public to shame someone for declining is manipulative. The manager's passive pressure is also a red flag.",
      },
      cta: "Was the court right? Should OP have been a 'team player'?",
    },
  },
];

export function getSeededCase(caseId: string): SeededCase | undefined {
  return SEEDED_CASES.find((c) => c.caseFile.id === caseId);
}

export function getRandomSeededCase(): SeededCase {
  return SEEDED_CASES[Math.floor(Math.random() * SEEDED_CASES.length)];
}
