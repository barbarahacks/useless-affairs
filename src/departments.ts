export type Outcome = 'approved' | 'rejected';

export interface Dept {
  name: string;
  clerk: string; // suit color
  reject: string[];
  approve: string[];
}

// {req} is the user's request, lowercased with the "can i" part removed.
export const DEPTS: Dept[] = [
  {
    name: 'bureau of preliminary paperwork',
    clerk: '#2f4a7a',
    reject: ['form 27b-stroke-6 is missing. in triplicate. in blue ink.', 'your request was filed on a tuesday, which is not a day.'],
    approve: ['preliminary paperwork exists. this is the best we have ever seen.'],
  },
  {
    name: 'ministry of minor bodily autonomy',
    clerk: '#4a4f5c',
    reject: ['you have not proven the body doing "{req}" is yours.', 'your elbows were not consulted.'],
    approve: ['your body is yours until the end of the fiscal quarter.'],
  },
  {
    name: 'department of snack oversight',
    clerk: '#7a3b3b',
    reject: ['no snack has been identified in this request. suspicious.', 'we do not recognize "{req}" as a legitimate activity.'],
    approve: ['approved, but only if it is crunchy.'],
  },
  {
    name: 'office of gravity compliance',
    clerk: '#5d6b45',
    reject: ['gravity has not signed off on "{req}".', 'you are currently being pulled down without a permit.'],
    approve: ['gravity says "sure, whatever".'],
  },
  {
    name: 'bureau of sitting & standing',
    clerk: '#9a7a4e',
    reject: ['vertical clearance certificate not on file.', 'your posture is under investigation.'],
    approve: ['approved on the condition that you remain upright or horizontal. no diagonals.'],
  },
  {
    name: 'ministry of vibes',
    clerk: '#3f6f73',
    reject: ['the vibes are off. we cannot say how.', '"{req}" gave the committee a bad feeling.'],
    approve: ['vibes are acceptable. barely.'],
  },
  {
    name: 'supreme council of final stamps',
    clerk: '#1c2b4a',
    reject: [],
    approve: ['after 6 hours of deliberation, we stamped it just to make it stop.'],
  },
];

// funnier rejections when the request mentions something specific
const SPECIAL: [RegExp, string][] = [
  [/blink|eye/, 'your eyelids lack proper documentation.'],
  [/chip|snack|eat|cookie|food|fries/, 'the chip has not been registered as a snack.'],
  [/sleep|bed|nap/, 'your bed does not hold a valid building permit.'],
  [/stand|sit|walk/, 'you need a vertical-clearance certificate to do that.'],
  [/breath|air/, 'air is government property and you are behind on rent.'],
  [/cry|sad|feel|emotion/, 'feelings must be filed in the quarterly emotions report first.'],
  [/dance|jump|run|move/, 'motion requires a permit from the department of inertia (closed).'],
  [/talk|speak|say|shout|scream/, 'your words have been classified. you may not say them.'],
  [/phone|scroll|text|email|internet|wifi/, 'the device has not been inspected by a certified thumb.'],
  [/coffee|tea|drink|water/, 'liquids are only permitted in approved cups. yours is unapproved.'],
  [/think|idea|remember|forget/, 'thoughts are processed in the order received. yours is #4,000,012.'],
];

export interface Verdict {
  outcome: Outcome;
  reason: string;
}

export interface Case {
  action: string;
  verdicts: Verdict[];
}

const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const fill = (s: string, req: string): string => s.replaceAll('{req}', req);

export function cleanAction(request: string): string {
  return request
    .trim()
    .toLowerCase()
    .replace(/[?!.]+$/, '')
    .replace(/^(can|may|could) i (please )?(have permission to )?/, '')
    .replace(/^am i (legally )?(allowed|permitted) to /, '')
    .replace(/^i (want|would like) to /, '')
    || 'do absolutely nothing';
}

// exactly 4 rejections among the first 6 departments, the 7th always approves
export function buildCase(request: string): Case {
  const action = cleanAction(request);
  const idx = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, 4);
  const specials = SPECIAL.filter(([re]) => re.test(action)).map(([, line]) => line);

  const verdicts = DEPTS.map((d, i): Verdict => {
    if (idx.includes(i)) {
      const reason = specials.length ? specials.shift()! : pick(d.reject);
      return { outcome: 'rejected', reason: fill(reason, action) };
    }
    return { outcome: 'approved', reason: fill(pick(d.approve), action) };
  });
  return { action, verdicts };
}

export const EXAMPLES = ['can i blink?', 'can i eat another chip?', 'am i legally allowed to go to bed?', 'can i have permission to stand up?'];
