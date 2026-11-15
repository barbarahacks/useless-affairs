// a department stops to ask a follow-up question. every answer is insufficient.
// dummy questions from templates for now; claude can ask real ones later.
import { mainThing } from './departments.ts';
import { clearHintOnInput, nudgeIfEmpty } from './nudge.ts';

export const ANSWER_SECONDS = 10;

// "not submit my homework" -> "not submit your homework"
const you = (s: string): string =>
  s
    .replace(/\bmyself\b/g, 'yourself')
    .replace(/\bmy\b/g, 'your')
    .replace(/\bmine\b/g, 'yours')
    .replace(/\bme\b/g, 'you')
    .replace(/\bi\b/g, 'you');

const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export function question(action: string): string {
  const act = you(action);
  const thing = you(mainThing(action) ?? 'it');
  return pick([
    `why do you need to ${act}?`,
    `on a scale of 1 to 10, how much do you need to ${act}?`,
    `can you prove that ${thing} exists?`,
    `who told you about ${thing}?`,
    `is ${thing} a hobby or a lifestyle?`,
    `what would your mother say if you were allowed to ${act}?`,
  ]);
}

const clip = (s: string): string => (s.length > 40 ? `${s.slice(0, 40)}...` : s);

// why the answer was not good enough
export function insufficient(answer: string | null): string {
  if (answer === null) return `no answer received within the allotted ${ANSWER_SECONDS} seconds. insufficient.`;
  if (!answer.trim()) return 'you said nothing. that is also insufficient.';
  const a = clip(answer.trim().toLowerCase());
  return pick([`"${a}" is insufficient.`, `"${a}". that's what they all say.`, `we were hoping you would not say "${a}".`, `"${a}". interesting. no.`]);
}

// shows an answer box under the correspondence; resolves with the answer, or null when time runs out
export function askForAnswer(panel: HTMLElement): Promise<string | null> {
  const form = document.createElement('form');
  form.className = 'answer';
  form.autocomplete = 'off';
  form.innerHTML = `<label class="lbl" for="answer">your answer</label><div class="answer-row"><input id="answer" type="text" maxlength="80" placeholder="type your answer" /><button type="submit">answer</button><span class="countdown" aria-live="off">${ANSWER_SECONDS}s</span></div><p class="hint" role="status" hidden></p>`;
  panel.appendChild(form);
  const input = form.querySelector('input')!;
  const countdown = form.querySelector('.countdown')!;
  const hint = form.querySelector<HTMLElement>('.hint')!;
  clearHintOnInput(input, hint);
  input.focus({ preventScroll: true });

  return new Promise((resolve) => {
    let left = ANSWER_SECONDS;
    const finish = (answer: string | null): void => {
      clearInterval(tick);
      form.remove();
      resolve(answer);
    };
    const tick = setInterval(() => {
      left--;
      countdown.textContent = `${left}s`;
      if (left <= 0) finish(null);
    }, 1000);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // an empty answer is not submitted; the countdown keeps going
      if (nudgeIfEmpty(input, hint)) return;
      finish(input.value);
    });
  });
}
