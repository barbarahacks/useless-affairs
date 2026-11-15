import './style.css';
import { FAST } from './config.ts';
import { Scene } from './scene.ts';
import { DEPTS, EXAMPLES, buildCase } from './departments.ts';
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
const steps = DEPTS.map((d, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<span class="num">${i + 1}</span><div class="info"><span class="name">${esc(d.name)}</span><span class="reason"></span></div><span class="chip"></span>`;
  $('steps').appendChild(li);
  return li;
});
function setStep(i: number, state: StepState, reason = ''): void {
  const li = steps[i];
  li.dataset.state = state;
  li.querySelector('.chip')!.textContent = CHIP[state];
  li.querySelector('.reason')!.textContent = reason;
}
function resetSteps(): void {
  steps.forEach((_, i) => setStep(i, 'pending'));
  bar.style.width = '0%';
}
resetSteps();

const CREST = `<svg class="crest" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 42 9v13c0 12-8 19-18 23C14 41 6 34 6 22V9Z" fill="#1c2b4a"/><path d="M24 8l13 4.5V22c0 9-6 14.5-13 17.5C17 36.5 11 31 11 22v-9.5Z" fill="none" stroke="#e9d8a6" stroke-width="1.5"/><path d="M19 15h10v3H19zM21 18h6v8h-6zM16 26h16v4H16z" fill="#e9d8a6"/></svg>`;
const SCRIBBLE = `<svg class="scribble" viewBox="0 0 180 44" aria-hidden="true"><path d="M6 30c8-22 16-24 18-10s-4 18 4 8 14-26 18-14-6 22 4 14 10-16 16-8 4 12 12 4 8-12 14-4 2 10 10 6 18-14 30-12 18 2 30-6"/></svg>`;

function certificate(request: string, c: Case, no: string, date: string): string {
  const fee = (Math.random() * 900 + 100).toFixed(2);
  const rows = c.verdicts.map((v, i) => `<tr class="${v.outcome}"><td>${i + 1}</td><td>${esc(DEPTS[i].name)}</td><td>${v.outcome}</td></tr>`).join('');
  return `
    <div class="cert-card">
      <div class="cert-head">
        ${CREST}
        <div><p class="cert-gov">government of nowhere</p><p class="cert-dept">department of useless affairs</p></div>
        <div class="cert-ref"><span>ref. ${no}</span><span>form 0-0-0</span><span>${date}</span></div>
      </div>
      <h2>certificate of provisional permission</h2>
      <p class="cert-to">to <em>${esc(c.action)}</em></p>
      <p class="body">the bearer of the request <q>${esc(request)}</q> has survived 7 departments and 4 rejections, and is hereby granted permission, subject to the following terms:</p>
      <ul class="terms"><li>valid for 4 minutes</li><li>non-transferable</li><li>void if enjoyed</li><li>processing fee: $${fee}</li></ul>
      <table class="verdicts"><thead><tr><th>no.</th><th>department</th><th>decision</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="cert-foot">
        <div class="sig">${SCRIBBLE}<span>the minister of final stamps</span></div>
        <div class="cert-stamp">approved<small>reluctantly</small></div>
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
  scene.reset();
  resetSteps();

  const c = buildCase(request);
  const no = `ua-${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`;
  const date = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
  caseNo.textContent = `case no. ${no}`;

  await say('reception', `request received: "${request.trim()}". case ${no} opened. routing to 7 departments.`);
  await sleep(400);

  for (let i = 0; i < DEPTS.length; i++) {
    const v = c.verdicts[i];
    setStep(i, 'review');
    await scene.moveTo(i);
    await scene.stamp(i, v.outcome);
    blip(v.outcome === 'approved' ? 880 : 140, 200, v.outcome === 'approved' ? 'triangle' : 'sawtooth', 0.08);
    setStep(i, v.outcome, v.reason);
    bar.style.width = `${((i + 1) / DEPTS.length) * 100}%`;
    await say(DEPTS[i].name, `${v.outcome}. ${v.reason}`);
    await sleep(700);
  }

  await say('reception', 'processing complete. your certificate has been issued.');
  jingle();
  await scene.celebrate();
  cert.innerHTML = certificate(request.trim(), c, no, date);
  cert.classList.remove('hidden');
  cert.scrollIntoView({ behavior: FAST ? 'auto' : 'smooth', block: 'center' });

  const share = $('share');
  share.addEventListener('click', () => {
    const lines = c.verdicts.map((v, i) => `${v.outcome === 'approved' ? '✔' : '✖'} ${DEPTS[i].name}`).join('\n');
    const text = `the department of useless affairs (case ${no}) granted me provisional permission to ${c.action}.\n${lines}\n(valid for 4 minutes. void if enjoyed.)`;
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
