import './style.css';
import { FAST } from './config.ts';
import { Scene } from './scene.ts';
import { DEPTS, EXAMPLES, buildCase } from './departments.ts';
import type { Case } from './departments.ts';

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

async function say(name: string, text: string): Promise<void> {
  who.textContent = name;
  said.textContent = '';
  if (FAST) {
    said.textContent = text;
    return;
  }
  for (const ch of text) {
    said.textContent += ch;
    if (ch !== ' ') blip(300 + Math.random() * 120, 25);
    await sleep(14);
  }
}

function certificate(request: string, c: Case): string {
  const fee = (Math.random() * 900 + 100).toFixed(2);
  const rows = c.verdicts.map((v, i) => `<li class="${v.outcome}"><b>${v.outcome === 'approved' ? '✔' : '✖'}</b> ${esc(DEPTS[i].name)}</li>`).join('');
  return `
    <div class="cert-card">
      <div class="seal">★</div>
      <p class="small">government of nowhere · form 0-0-0</p>
      <h2>certificate of provisional permission to ${esc(c.action)}</h2>
      <p class="body">the bearer of the request <em>"${esc(request)}"</em> has survived 7 departments and 4 rejections, and is hereby granted permission, subject to the following terms:</p>
      <ul class="terms"><li>valid for 4 minutes</li><li>non-transferable</li><li>void if enjoyed</li><li>processing fee: $${fee}</li></ul>
      <ul class="stamps">${rows}</ul>
      <p class="sign">signed, the minister of final stamps</p>
      <button id="share" type="button">copy result</button>
    </div>`;
}

async function run(request: string): Promise<void> {
  if (busy || !request.trim()) return;
  busy = true;
  go.disabled = true;
  cert.classList.add('hidden');
  scene.reset();

  const c = buildCase(request);
  await say('reception', `request received: "${request.trim()}". routing to 7 departments.`);
  await sleep(400);

  for (let i = 0; i < DEPTS.length; i++) {
    await scene.moveTo(i);
    const v = c.verdicts[i];
    await scene.stamp(i, v.outcome);
    blip(v.outcome === 'approved' ? 880 : 140, 200, v.outcome === 'approved' ? 'triangle' : 'sawtooth', 0.08);
    await say(DEPTS[i].name, `${v.outcome === 'approved' ? 'approved. ' : 'rejected. '}${v.reason}`);
    await sleep(700);
  }

  await say('reception', 'all done. your certificate is ready.');
  jingle();
  await scene.celebrate();
  cert.innerHTML = certificate(request.trim(), c);
  cert.classList.remove('hidden');
  const share = document.getElementById('share');
  share?.addEventListener('click', () => {
    const text = `the department of useless affairs granted me provisional permission to ${c.action}.\n${c.verdicts.map((v, i) => `${v.outcome === 'approved' ? '✔' : '✖'} ${DEPTS[i].name}`).join('\n')}\n(valid for 4 minutes. void if enjoyed.)`;
    void navigator.clipboard.writeText(text).then(() => { share.textContent = 'copied!'; });
  });
  cert.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
