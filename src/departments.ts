export type Outcome = 'approved' | 'rejected';

// placeholders: {req} is the cleaned request ("not submit my homework"), {thing} its main word ("homework")
export interface Dept {
  name: string;
  reject: string[];
  approve: string[];
}

export interface Verdict {
  outcome: Outcome;
  reason: string;
}

export interface Case {
  action: string;
  depts: Dept[];
  verdicts: Verdict[];
  granted: boolean; // what the final council decided
  question: string | null; // claude's follow-up question, when claude made the case
  source: 'claude' | 'dummy';
}

// what /api/case returns: claude's 6 departments and a follow-up question
export interface AiCase {
  departments: { name: string; reject: string; approve: string }[];
  question: string;
}

// matches whole words, plus a trailing "s"
const words = (list: string): RegExp => new RegExp(`\\b(${list})s?\\b`);

// departments that only get involved when the request is about their thing
const TOPICS: { re: RegExp; depts: Dept[] }[] = [
  {
    re: words('homework|school|class|exam|test|quiz|assignment|essay|study|studying|teacher|grade|university|college|lecture|deadline|project'),
    depts: [
      { name: 'ministry of education-adjacent matters', reject: ['the homework has filed a complaint about being ignored.', "your teacher was cc'd on this request. good luck."], approve: ['learning was detected nearby. close enough.'] },
      { name: 'bureau of deadlines & extensions', reject: ['extensions must be requested 3 weeks before the deadline you forgot about.', 'the deadline has been extended to yesterday.'], approve: ['deadline postponed until the heat death of the universe.'] },
      { name: 'office of the dog that ate it', reject: ['the dog has an alibi.', 'no dog is registered at your address.'], approve: ['the dog confirms it was delicious.'] },
    ],
  },
  {
    re: words('eat|eating|chip|snack|food|cookie|fries|pizza|lunch|dinner|breakfast|cake|candy|burger|sandwich|cereal'),
    depts: [
      { name: 'department of snack oversight', reject: ['the chip has not been registered as a snack.', 'no crunch level was declared.'], approve: ['approved, but only if it is crunchy.'] },
      { name: 'office of crumb management', reject: ['projected crumb output exceeds the quarterly limit.'], approve: ['crumbs have been pre-approved for the couch.'] },
      { name: 'committee on portion control', reject: ['"another" is not a recognized portion size.'], approve: ['one (1) more is fine. we counted.'] },
    ],
  },
  {
    re: words('sleep|sleeping|bed|nap|rest|tired|lie down|snooze|pillow'),
    depts: [
      { name: 'bureau of horizontal affairs', reject: ['your bed does not hold a valid building permit.', 'horizontal status requires form h-0.'], approve: ['you may lie down, provided you lie down efficiently.'] },
      { name: 'ministry of eyelids', reject: ['eyelid closure is only permitted during scheduled blinks.'], approve: ['eyelids may close. they may not enjoy it.'] },
    ],
  },
  {
    re: words('blink|breathe|breath|breathing|sneeze|yawn|stretch|scratch|eye|cough|hiccup|sweat'),
    depts: [
      { name: 'ministry of minor bodily autonomy', reject: ['you have not proven the body doing "{req}" is yours.', 'your elbows were not consulted.'], approve: ['your body is yours until the end of the fiscal quarter.'] },
      { name: 'office of involuntary actions', reject: ['involuntary actions must be scheduled 48 hours in advance.', 'air is government property and you are behind on rent.'], approve: ['approved, as long as you do not do it on purpose.'] },
    ],
  },
  {
    re: words('stand|stand up|sit|sit down|walk|run|dance|jump|move|leave|go outside|exercise|gym|swim'),
    depts: [
      { name: 'bureau of sitting & standing', reject: ['vertical clearance certificate not on file.', 'your posture is under investigation.'], approve: ['approved on the condition that you remain upright or horizontal. no diagonals.'] },
      { name: 'office of gravity compliance', reject: ['gravity has not signed off on "{req}".', 'you are currently being pulled down without a permit.'], approve: ['gravity says "sure, whatever".'] },
    ],
  },
  {
    re: words('work|job|boss|meeting|email|office|quit|shift|coworker|resign|zoom|slack|call in sick'),
    depts: [
      { name: 'department of synergy', reject: ['this request lacks synergy. please add synergy and resubmit.'], approve: ['synergy levels nominal. proceed, team player.'] },
      { name: 'office of circling back', reject: ['we will circle back on this. we will not circle back on this.', "let's take this offline. permanently."], approve: ["circled back. it's a yes. do not reply-all."] },
    ],
  },
  {
    re: words('buy|spend|pay|money|shop|shopping|purchase|order|price|cost|afford'),
    depts: [{ name: 'treasury of small purchases', reject: ['the treasury does not recognize your money as money.', 'a 3-year cost-benefit study is required first.'], approve: ['funds released: $0.04. spend it wisely.'] }],
  },
  {
    re: words('cry|sad|happy|feel|feeling|laugh|smile|love|angry|mad|emotion'),
    depts: [
      { name: 'ministry of vibes', reject: ['the vibes are off. we cannot say how.', '"{req}" gave the committee a bad feeling.'], approve: ['vibes are acceptable. barely.'] },
      { name: 'office of emotional paperwork', reject: ['feelings must be filed in the quarterly emotions report first.'], approve: ['one (1) feeling has been approved. use it wisely.'] },
    ],
  },
  {
    re: words('phone|scroll|scrolling|internet|wifi|game|gaming|computer|tiktok|youtube|netflix|watch|tv|laptop|screen|online'),
    depts: [
      { name: 'office of screen time', reject: ['the device has not been inspected by a certified thumb.', 'your screen time report has been forwarded to your mother.'], approve: ['5 more minutes approved. we both know it will be 3 hours.'] },
      { name: 'bureau of notifications', reject: ['this request has been muted.'], approve: ['notification received. marked as read. not read.'] },
    ],
  },
  {
    re: words('coffee|tea|drink|water|juice|soda|milk|latte|beverage'),
    depts: [{ name: 'department of approved cups', reject: ['liquids are only permitted in approved cups. yours is unapproved.'], approve: ['cup inspected. it is, technically, a cup.'] }],
  },
  {
    re: words('talk|speak|say|shout|scream|call|friend|party|hang out|text|date|sing'),
    depts: [{ name: 'bureau of small talk', reject: ['your words have been classified. you may not say them.', 'all conversations must open with a comment about the weather.'], approve: ['approved. please keep it under 3 sentences.'] }],
  },
  {
    re: /\b(not|don'?t|never|skip|avoid|stop|ignore|cancel|forget)\b/,
    depts: [
      { name: 'department of not doing things', reject: ['not doing "{req}" still counts as doing something. denied.', 'inaction requires the same paperwork as action, plus a form explaining the inaction.'], approve: ['approved. we will also not do anything about it.'] },
      { name: 'office of strategic avoidance', reject: ['avoidance must be pre-avoided. you are late.'], approve: ['we looked away. officially.'] },
    ],
  },
];

// general bureaucracy, used to fill the remaining seats
const GENERIC: Dept[] = [
  { name: 'bureau of preliminary paperwork', reject: ['form 27b-stroke-6 is missing. in triplicate. in blue ink.', 'your request was filed on a tuesday, which is not a day.'], approve: ['preliminary paperwork exists. this is the best we have ever seen.'] },
  { name: 'office of forms about forms', reject: ['you need form f-1 to request form f-2, which replaces form f-1.'], approve: ['form approved. the form about the form is pending.'] },
  { name: 'department of further review', reject: ['this requires further review. the reviewer requires further review.'], approve: ['further review complete. it was very brief.'] },
  { name: 'committee for committees', reject: ['a subcommittee has been formed to decide which committee should decide.'], approve: ['the committee agreed, mostly to end the meeting.'] },
  { name: 'bureau of rubber stamps', reject: ['we are out of ink. the ink requisition was rejected.'], approve: ['stamped. we really like stamping.'] },
  { name: 'ministry of vibes', reject: ['the vibes are off. we cannot say how.', '"{req}" gave the committee a bad feeling.'], approve: ['vibes are acceptable. barely.'] },
  { name: 'department of procedural delays', reject: ['your request is number 4,000,012 in the queue. we are on number 9.'], approve: ['approved ahead of schedule. this has never happened. please leave.'] },
  { name: 'office of public patience', reject: ['you appeared impatient on the security camera.'], approve: ['thank you for your patience. we have kept it.'] },
];

const FINAL: Dept = {
  name: 'supreme council of final stamps',
  reject: ['after 6 hours of deliberation, the answer is no. we feel great about it.', 'the council voted 4 to 3 against, with 9 abstentions.'],
  approve: ['after 6 hours of deliberation, we stamped it just to make it stop.'],
};

// a department invented on the spot for whatever the request is about
function thingDept(): Dept {
  return {
    name: pick([`office of {thing} affairs`, `bureau of {thing} compliance`, `{thing} regulatory authority`, `standing committee on {thing}`]),
    reject: ['"{thing}" is not on the list of approved nouns.', 'you need a {thing} permit. to get one, you need a {thing}.', 'our {thing} specialist is on leave until further notice.'],
    approve: ['{thing} cleared. we did not look at it.', 'the {thing} checks out. we are as surprised as you.'],
  };
}

const STOP = new Set(
  "a an the my your our their his her its to of for in on at with and or but not no do does did dont don't never please just really even some any this that these those it me i you we they be is am are was were can could may might will would should have has had get got one more another again now today tonight tomorrow without".split(' '),
);

const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const shuffle = <T>(a: T[]): T[] => a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

export function cleanAction(request: string): string {
  return (
    request
      .trim()
      .toLowerCase()
      .replace(/[?!.]+$/, '')
      .replace(/^(can|may|could) i (please )?(have permission to )?/, '')
      .replace(/^am i (legally )?(allowed|permitted) to /, '')
      .replace(/^i (want|would like) to /, '') || 'do absolutely nothing'
  );
}

// the last meaningful word is usually the thing: "not submit my homework" -> "homework"
export function mainThing(action: string): string | null {
  const ws = action.replace(/[^a-z\s'-]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  return ws.at(-1) ?? null;
}

// departments come from claude when it answered, otherwise from the local dummy generator
export function buildCase(request: string, ai: AiCase | null = null): Case {
  const action = cleanAction(request);
  const thing = mainThing(action) ?? 'nothing';
  const total = 7; // 6 departments plus the final council

  const seats: Dept[] = [];
  const add = (d: Dept): void => {
    if (seats.length < total - 1 && !seats.some((s) => s.name === d.name)) seats.push(d);
  };
  if (ai) {
    ai.departments.forEach((d) => add({ name: d.name, reject: [d.reject], approve: [d.approve] }));
  } else {
    shuffle(TOPICS.filter((t) => t.re.test(action)).flatMap((t) => t.depts)).slice(0, 3).forEach(add);
    add(thingDept());
  }
  // only fills seats claude left empty (or the dummy's leftovers)
  shuffle(GENERIC).forEach(add);
  const depts = [...(ai ? seats : shuffle(seats)), FINAL];

  // every department judges independently; at least one says no
  const outcomes: Outcome[] = seats.map(() => (Math.random() < 0.6 ? 'rejected' : 'approved'));
  if (!outcomes.includes('rejected')) outcomes[Math.floor(Math.random() * outcomes.length)] = 'rejected';
  const granted = Math.random() < 0.75;
  outcomes.push(granted ? 'approved' : 'rejected');

  const fill = (s: string): string => s.replaceAll('{req}', action).replaceAll('{thing}', thing);
  const named = depts.map((d) => ({ ...d, name: fill(d.name) }));
  const verdicts = outcomes.map((outcome, i): Verdict => ({ outcome, reason: fill(pick(outcome === 'approved' ? depts[i].approve : depts[i].reject)) }));
  return { action, depts: named, verdicts, granted, question: ai?.question ?? null, source: ai ? 'claude' : 'dummy' };
}

export const EXAMPLES = ['can i blink?', 'can i not submit my homework?', 'can i eat another chip?', 'am i legally allowed to go to bed?', 'can i quit my job?'];
