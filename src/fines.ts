// fines for things people do on the site; they pile up until the next certificate
import { sound } from './sound.ts';

export interface Fine {
  reason: string;
  amount: number;
}

export const money = (n: number): string => `$${n.toFixed(2)}`;

let owed: Fine[] = [];
let slips: HTMLElement;
let total: HTMLElement;

export function initFines(slipBox: HTMLElement, totalEl: HTMLElement): void {
  slips = slipBox;
  total = totalEl;
  render();
}

function render(): void {
  const sum = owed.reduce((a, f) => a + f.amount, 0);
  total.textContent = owed.length ? `${money(sum)} (${owed.length})` : money(0);
}

// issue a fine: a red notice slip slides in, then leaves on its own
export function fine(reason: string, amount: number): void {
  owed.push({ reason, amount });
  render();
  sound.fine();
  const slip = document.createElement('div');
  slip.className = 'fine-slip';
  const ref = `f-${String(Math.floor(Math.random() * 1e4)).padStart(4, '0')}`;
  slip.innerHTML = `<span class="lbl">notice of fine · ref ${ref}</span><b>${money(amount)}</b><span class="why"></span>`;
  slip.querySelector('.why')!.textContent = reason;
  slips.appendChild(slip);
  setTimeout(() => slip.classList.add('leaving'), 4000);
  setTimeout(() => slip.remove(), 4500);
}

export function finesOwed(): Fine[] {
  return [...owed];
}

// fines are settled on the certificate
export function settleFines(): void {
  owed = [];
  render();
}
