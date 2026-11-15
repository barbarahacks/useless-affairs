// office sounds made with webaudio, no assets needed
import { FAST } from './config.ts';

let ctx: AudioContext | undefined;
let out: GainNode | undefined;
let noise: AudioBuffer | undefined;
let muted = false;

function audio(): { ac: AudioContext; out: GainNode; noise: AudioBuffer } | null {
  if (muted || FAST) return null;
  if (!ctx) {
    ctx = new AudioContext();
    out = ctx.createGain();
    out.gain.value = 0.7;
    out.connect(ctx.createDynamicsCompressor()).connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate / 2, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  // browsers start audio suspended until the page gets a click or key press
  if (ctx.state === 'suspended') void ctx.resume();
  return { ac: ctx, out: out!, noise: noise! };
}

// every sound gets a proper attack/decay envelope, so nothing clicks or plays silent
function envelope(ac: AudioContext, t: number, dur: number, vol: number): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return g;
}

function tone(freq: number, at: number, dur: number, vol: number, type: OscillatorType = 'sine', slideTo?: number): void {
  const a = audio();
  if (!a) return;
  const t = a.ac.currentTime + at;
  const o = a.ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  o.connect(envelope(a.ac, t, dur, vol)).connect(a.out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function hiss(at: number, dur: number, vol: number, freq: number, filter: BiquadFilterType = 'bandpass', q = 1): void {
  const a = audio();
  if (!a) return;
  const t = a.ac.currentTime + at;
  const src = a.ac.createBufferSource();
  src.buffer = a.noise;
  const f = a.ac.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  f.Q.value = q;
  src.connect(f).connect(envelope(a.ac, t, dur, vol)).connect(a.out);
  src.start(t, Math.random() * 0.3);
  src.stop(t + dur + 0.05);
}

// silly voices from the browser's speech synthesis
const synth: SpeechSynthesis | undefined = 'speechSynthesis' in window ? window.speechSynthesis : undefined;
// the cast: every department (and reception) uses one clear, funny english voice;
// the supreme council at desk 7 sings its verdict with "good news" or "bad news".
// funniest first, as macos, ios and chrome name them; falls back to the clearest plain english voice.
const FUNNY = ['Eddy', 'Grandpa', 'Fred'];
let all: SpeechSynthesisVoice[] = [];
function loadVoices(): void {
  all = synth?.getVoices() ?? [];
}
if (synth) {
  loadVoices();
  synth.addEventListener('voiceschanged', loadVoices);
}
const langOf = (v: SpeechSynthesisVoice): string => v.lang.toLowerCase().replace('_', '-');
const isNamed = (v: SpeechSynthesisVoice, n: string): boolean => v.name === n || v.name.startsWith(`${n} (`);
const named = (n: string): SpeechSynthesisVoice | undefined => all.find((v) => isNamed(v, n));

// the clearest plain english voice: chrome's google us english, then apple premium/enhanced, then samantha and co
function clearEnglish(): SpeechSynthesisVoice | undefined {
  const en = all.filter((v) => langOf(v).startsWith('en'));
  const us = (list: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => list.find((v) => langOf(v) === 'en-us') ?? list[0];
  return (
    us(en.filter((v) => v.name.startsWith('Google'))) ??
    us(en.filter((v) => /\((premium|enhanced)\)/i.test(v.name))) ??
    ['Samantha', 'Daniel', 'Karen', 'Moira', 'Alex'].map(named).find(Boolean) ??
    en.find((v) => v.default) ??
    en[0]
  );
}

// the department voice: the first of FUNNY this device has (english, us version first), else clear english
function clerkVoice(): SpeechSynthesisVoice | undefined {
  // the list can still be empty on the very first tap; read it again so reception gets the same voice
  if (!all.length) loadVoices();
  for (const n of FUNNY) {
    const english = all.filter((v) => isNamed(v, n) && langOf(v).startsWith('en'));
    const v = english.find((x) => langOf(x) === 'en-us') ?? english[0];
    if (v) return v;
  }
  return clearEnglish();
}

interface Persona {
  voice?: SpeechSynthesisVoice;
  sings: boolean; // singing takes much longer, so it gets a longer timeout
}
let cast: Persona[] = [];

export const sound = {
  get muted(): boolean {
    return muted;
  },
  // muting also silences anything already playing
  setMuted(m: boolean): void {
    muted = m;
    if (ctx && out) out.gain.setTargetAtTime(m ? 0 : 0.7, ctx.currentTime, 0.02);
    if (m) synth?.cancel();
  },
  // recast the 7 seats for this case
  newCast(seats: number, granted: boolean): void {
    const clerk: Persona = { voice: clerkVoice(), sings: false };
    cast = Array.from({ length: seats - 1 }, () => clerk);
    const news = named(granted ? 'Good News' : 'Bad News');
    cast.push(news ? { voice: news, sings: true } : clerk);
  },
  // reads text out loud; resolves when done, or on a timeout if the browser never says so
  speak(text: string, seat: number): Promise<void> {
    if (!synth || muted || FAST) return Promise.resolve();
    synth.cancel();
    const p: Persona = cast[seat] ?? { voice: clerkVoice(), sings: false };
    return new Promise((resolve) => {
      const done = (): void => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(done, 2500 + text.length * (p.sings ? 220 : 80));
      // some mobile browsers drop speech that starts right after cancel(), so wait a moment
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text);
        if (p.voice) u.voice = p.voice;
        u.lang = p.voice?.lang ?? 'en-US';
        u.onend = done;
        u.onerror = done;
        synth.speak(u);
      }, 60);
    });
  },
  // says a line right away, inside the tap that started the case. on iphones speech only works after a real
  // line has been spoken during a tap, so this unlocks the voices for every department after it
  speakNow(text: string): void {
    if (!synth || muted || FAST) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = clerkVoice();
    if (v) u.voice = v;
    u.lang = v?.lang ?? 'en-US';
    synth.speak(u);
  },
  // wake the audio context on the first click or key press
  // phones only allow speech that starts inside a tap: speaking a silent line on the first tap unlocks it for the visit
  unlockOnGesture(): void {
    const wake = (): void => void audio();
    window.addEventListener('pointerdown', wake, { once: true });
    window.addEventListener('keydown', wake, { once: true });
    let speechUnlocked = false;
    const wakeSpeech = (): void => {
      if (speechUnlocked || !synth) return;
      speechUnlocked = true;
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      synth.speak(u);
      for (const type of ['click', 'touchend', 'keydown']) window.removeEventListener(type, wakeSpeech);
    };
    for (const type of ['click', 'touchend', 'keydown']) window.addEventListener(type, wakeSpeech);
  },
  // typewriter key
  key(): void {
    hiss(0, 0.035, 0.18, 2200 + Math.random() * 1600, 'bandpass', 3);
  },
  // rubber stamp: a wooden knock and a clack (in the range laptop speakers can play), then a desk bell or a buzzer
  stamp(approved: boolean): void {
    hiss(0, 0.08, 1, 900, 'bandpass', 1.2);
    hiss(0, 0.025, 0.7, 3500, 'highpass');
    tone(260, 0, 0.16, 0.7, 'triangle', 110);
    if (approved) {
      tone(1319, 0.12, 1.1, 0.24);
      tone(2637, 0.12, 0.6, 0.08);
    } else {
      tone(150, 0.12, 0.45, 0.13, 'square');
      tone(158, 0.12, 0.45, 0.13, 'square');
    }
  },
  // the big stamp on the certificate: a heavier double knock, then a bell or a long buzzer
  bigStamp(approved: boolean): void {
    hiss(0, 0.12, 1, 700, 'bandpass', 1);
    hiss(0, 0.03, 0.8, 3000, 'highpass');
    tone(200, 0, 0.25, 0.8, 'triangle', 80);
    hiss(0.07, 0.06, 0.5, 1100, 'bandpass', 1.5);
    if (approved) {
      tone(1568, 0.16, 1.4, 0.24);
      tone(2093, 0.16, 1.1, 0.1);
    } else {
      tone(140, 0.16, 0.8, 0.14, 'square');
      tone(147, 0.16, 0.8, 0.14, 'square');
    }
  },
  // a fine: cash register ka-ching
  fine(): void {
    hiss(0, 0.05, 0.6, 3000, 'highpass');
    tone(2093, 0.04, 0.25, 0.14);
    tone(2637, 0.12, 0.6, 0.14);
  },
  fanfare(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, i === 3 ? 0.9 : 0.3, 0.12, 'triangle'));
  },
  trombone(): void {
    [392, 370, 349].forEach((f, i) => tone(f, i * 0.32, 0.3, 0.12, 'triangle'));
    tone(330, 0.96, 1.1, 0.12, 'triangle', 247);
  },
};
