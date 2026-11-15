// scrolling news ticker of other citizens' cases (all fictional)
import { FAST } from './config.ts';

const NEWS = [
  'kanata resident denied permission to sneeze.',
  'permit to skate on the rideau canal under review since 1832.',
  'orléans man approved to blink, but only on weekdays.',
  'byward market vendor fined for unlicensed smiling.',
  'o-train delayed. passengers asked to complete form d-14 (delay acknowledgement).',
  "barrhaven family's request for a backyard rejected. they may keep the front yard.",
  'tulip festival postponed pending tulip background checks.',
  'glebe resident granted permission to have one (1) opinion.',
  'westboro yoga class cited for excessive stretching.',
  'shawarma consumption limit raised to 3 per day after public outcry.',
  'queensway construction completes phase 1 of 4,000.',
  'snow removal request received. snow advised to leave on its own.',
  "nepean man's request to stand up enters committee. he has been sitting since march.",
  "rideau canal reclassified as a road, then a canal, then 'complicated'.",
  'gatineau requests permission to be across the river. approved.',
  "citizen asks if they can 'just ask a quick question'. denied.",
];

const SPEED = 70; // px per second
const shuffle = <T>(a: T[]): T[] => a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

let track: HTMLElement;
let row: HTMLElement;
let offset = 0;
let paused = false;

function item(text: string): HTMLSpanElement {
  const s = document.createElement('span');
  s.className = 'ticker-item';
  s.textContent = text;
  return s;
}

// moves the row left; an item that fully leaves on the left is moved to the back of the line
function frame(last: number, now: number): void {
  const dt = Math.min(0.1, (now - last) / 1000);
  if (!paused) offset -= SPEED * dt;
  const first = row.firstElementChild as HTMLElement | null;
  if (first && offset + first.offsetWidth <= 0) {
    offset += first.offsetWidth;
    // the user's case stops glowing after its first pass
    delete first.dataset.fresh;
    row.appendChild(first);
  }
  row.style.transform = `translateX(${offset}px)`;
  requestAnimationFrame((t) => frame(now, t));
}

export function initTicker(target: HTMLElement): void {
  row = target;
  track = target.parentElement!;
  for (const t of shuffle(NEWS)) row.appendChild(item(t));
  const still = FAST || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) return;
  const bar = track.closest('.ticker')!;
  bar.addEventListener('mouseenter', () => (paused = true));
  bar.addEventListener('mouseleave', () => (paused = false));
  requestAnimationFrame((t) => frame(t, t));
}

// the user's decided case is the next headline to scroll in from the right
export function reportCase(text: string): void {
  const edge = track.clientWidth;
  // an older case that hasn't come on screen yet is replaced
  for (const old of row.querySelectorAll<HTMLElement>('[data-fresh]')) {
    if (old.offsetLeft + offset > edge) old.remove();
  }
  const next = item(text);
  next.dataset.fresh = '1';
  const offscreen = [...row.children].find((c) => (c as HTMLElement).offsetLeft + offset >= edge);
  row.insertBefore(next, offscreen ?? null);
}
