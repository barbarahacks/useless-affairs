import './style.css';
import { FAST } from './config.ts';
import { Scene } from './scene.ts';
import { EXAMPLES, buildCase } from './departments.ts';
import type { Case, Outcome } from './departments.ts';

if (FAST) document.documentElement.classList.add('fast');

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, FAST ? 0 : ms));
const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

const scene = new Scene($<HTMLCanvasElement>('scene'));
const who = $('who');
const said = $('said');
const form = $<HTMLFormElement>('form');
const input = $<HTMLInputElement>('req');
const go = $<HTMLButtonElement>('go');
const cert = $('cert');
const caseNo = $('case-no');
const bar = $('progress-bar');
let busy = false;

// tiny webaudio blips, no assets needed
let muted = false;
let ac: AudioContext | undefined;
function blip(freq: number, ms = 40, type: OscillatorType = 'square', vol = 0.04): void {
  if (muted || FAST) return;
  ac ??= new AudioContext();
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms / 1000);
  o.connect(g).connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + ms / 1000);
}
const sadTrombone = (): void => [392, 370, 349, 311].forEach((f, i) => setTimeout(() => blip(f, i === 3 ? 600 : 260, 'sawtooth', 0.05), i * 300));
const jingle = (): void => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 160, 'triangle', 0.08), i * 120));

// typewriter; a newer message cancels an older one mid-sentence
let sayToken = 0;
async function say(name: string, text: string): Promise<void> {
  const token = ++sayToken;
  who.textContent = name;
  said.textContent = '';
  if (FAST) {
    said.textContent = text;
    return;
  }
  for (const ch of text) {
    if (token !== sayToken) return;
    said.textContent += ch;
    if (ch !== ' ') blip(300 + Math.random() * 120, 25);
    await sleep(14);
  }
}

// case file: one row per department
type StepState = 'pending' | 'review' | Outcome;
const CHIP: Record<StepState, string> = { pending: 'pending', review: 'in review', approved: 'approved', rejected: 'rejected' };
const stepList = $('steps');
let steps: HTMLLIElement[] = [];
function openCaseFile(c: Case): void {
  stepList.innerHTML = '';
  steps = c.depts.map((d, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="num">${i + 1}</span><div class="info"><span class="name">${esc(d.name)}</span><span class="reason"></span></div><span class="chip"></span>`;
    stepList.appendChild(li);
    return li;
  });
  steps.forEach((_, i) => setStep(i, 'pending'));
  bar.style.width = '0%';
}
function setStep(i: number, state: StepState, reason = ''): void {
  const li = steps[i];
  li.dataset.state = state;
  li.querySelector('.chip')!.textContent = CHIP[state];
  li.querySelector('.reason')!.textContent = reason;
}
stepList.innerHTML = '<li class="empty">departments are assigned once your request is received, based on what it is about.</li>';

const CREST = `<svg class="crest" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 42 9v13c0 12-8 19-18 23C14 41 6 34 6 22V9Z" fill="#1c2b4a"/><path d="M24 8l13 4.5V22c0 9-6 14.5-13 17.5C17 36.5 11 31 11 22v-9.5Z" fill="none" stroke="#e9d8a6" stroke-width="1.5"/><path d="M19 15h10v3H19zM21 18h6v8h-6zM16 26h16v4H16z" fill="#e9d8a6"/></svg>`;
const SCRIBBLE = `<svg class="scribble" viewBox="0 0 180 44" aria-hidden="true"><path d="M6 30c8-22 16-24 18-10s-4 18 4 8 14-26 18-14-6 22 4 14 10-16 16-8 4 12 12 4 8-12 14-4 2 10 10 6 18-14 30-12 18 2 30-6"/></svg>`;

function certificate(request: string, c: Case, no: string, date: string): string {
  const fee = (Math.random() * 900 + 100).toFixed(2);
  const n = c.depts.length;
  const nos = c.verdicts.filter((v) => v.outcome === 'rejected').length;
  const rows = c.verdicts.map((v, i) => `<tr class="${v.outcome}"><td>${i + 1}</td><td>${esc(c.depts[i].name)}</td><td>${v.outcome}</td></tr>`).join('');
  const text = c.granted
    ? {
        title: 'certificate of provisional permission',
        body: `the bearer of the request <q>${esc(request)}</q> has survived ${n} departments and ${nos} rejection${nos === 1 ? '' : 's'}, and is hereby granted permission, subject to the following terms:`,
        terms: ['valid for 4 minutes', 'non-transferable', 'void if enjoyed', `processing fee: $${fee}`],
        stamp: 'approved<small>reluctantly</small>',
      }
    : {
        title: 'notice of refusal',
        body: `the request <q>${esc(request)}</q> was reviewed by ${n} departments, collected ${nos} rejection${nos === 1 ? '' : 's'}, and has been refused. you may appeal by submitting the exact same request again.`,
        terms: ['refusal valid forever', 'appeals heard 9:00–9:05am', 'non-refundable', `processing fee: $${fee}`],
        stamp: 'denied<small>with joy</small>',
      };
  return `
    <div class="cert-card${c.granted ? '' : ' denied'}">
      <div class="cert-head">
        ${CREST}
        <div><p class="cert-gov">government of nowhere</p><p class="cert-dept">department of useless affairs</p></div>
        <div class="cert-ref"><span>ref. ${no}</span><span>form 0-0-0</span><span>${date}</span></div>
      </div>
      <h2>${text.title}</h2>
      <p class="cert-to">${c.granted ? 'to' : 'regarding:'} <em>${esc(c.action)}</em></p>
      <p class="body">${text.body}</p>
      <ul class="terms">${text.terms.map((t) => `<li>${t}</li>`).join('')}</ul>
      <table class="verdicts"><thead><tr><th>no.</th><th>department</th><th>decision</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="cert-foot">
        <div class="sig">${SCRIBBLE}<span>the minister of final stamps</span></div>
        <div class="cert-stamp">${text.stamp}</div>
      </div>
      <div class="cert-actions">
        <button id="share" type="button">copy result</button>
        <button id="again" type="button" class="secondary">submit another request</button>
      </div>
    </div>`;
}

async function run(request: string): Promise<void> {
  if (busy || !request.trim()) return;
  busy = true;
  go.disabled = true;
  cert.classList.add('hidden');
  const c = buildCase(request);
  scene.reset(c.depts.length);
  openCaseFile(c);

  const no = `ua-${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`;
  const date = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
  caseNo.textContent = `case no. ${no}`;

  await say('reception', `request received: "${request.trim()}". case ${no} opened. assigned to ${c.depts.length} relevant departments.`);
  await sleep(400);

  for (let i = 0; i < c.depts.length; i++) {
    const v = c.verdicts[i];
    setStep(i, 'review');
    await scene.moveTo(i);
    await scene.stamp(i, v.outcome);
    blip(v.outcome === 'approved' ? 880 : 140, 200, v.outcome === 'approved' ? 'triangle' : 'sawtooth', 0.08);
    setStep(i, v.outcome, v.reason);
    bar.style.width = `${((i + 1) / c.depts.length) * 100}%`;
    await say(c.depts[i].name, `${v.outcome}. ${v.reason}`);
    await sleep(700);
  }

  await say('reception', c.granted ? 'processing complete. your certificate has been issued.' : 'processing complete. your request has been refused. a notice has been issued.');
  if (c.granted) jingle();
  else sadTrombone();
  await scene.celebrate();
  cert.innerHTML = certificate(request.trim(), c, no, date);
  cert.classList.remove('hidden');
  cert.scrollIntoView({ behavior: FAST ? 'auto' : 'smooth', block: 'center' });

  const share = $('share');
  share.addEventListener('click', () => {
    const lines = c.verdicts.map((v, i) => `${v.outcome === 'approved' ? '✔' : '✖'} ${c.depts[i].name}`).join('\n');
    const verdict = c.granted ? `granted me provisional permission to ${c.action}` : `refused to let me ${c.action}`;
    const text = `the department of useless affairs (case ${no}) ${verdict}.\n${lines}\n${c.granted ? '(valid for 4 minutes. void if enjoyed.)' : '(appeals heard 9:00–9:05am.)'}`;
    void navigator.clipboard.writeText(text).then(() => (share.textContent = 'copied!'));
  });
  $('again').addEventListener('click', () => {
    input.value = '';
    form.scrollIntoView({ behavior: FAST ? 'auto' : 'smooth', block: 'center' });
    input.focus({ preventScroll: true });
  });

  busy = false;
  go.disabled = false;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  void run(input.value || input.placeholder);
});

const mute = $('mute');
mute.addEventListener('click', () => {
  muted = !muted;
  mute.textContent = muted ? 'sound: off' : 'sound: on';
});

// the nav goes nowhere, officially
for (const a of document.querySelectorAll<HTMLAnchorElement>('[data-nav]')) {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    if (!busy) void say('front desk', `the "${a.textContent}" page is closed for a mandatory break. please try again next fiscal year.`);
  });
}

const ex = $('examples');
for (const e of EXAMPLES) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = e;
  b.addEventListener('click', () => {
    input.value = e;
    void run(e);
  });
  ex.appendChild(b);
}

// ?req=can%20i%20blink auto-runs (handy for demos and screenshots)
const auto = new URLSearchParams(location.search).get('req');
if (auto) void run(auto);
