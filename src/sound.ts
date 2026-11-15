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
// the cast for every case: 4 languages, 1 alien and 1 clear english at desks 1-6 (shuffled),
// and the supreme council at desk 7 sings in english
export type Lang = 'en' | 'fr' | 'zh' | 'ru' | 'es';
type Role = Lang | 'alien';
const ROLES: Role[] = ['zh', 'fr', 'ru', 'es', 'alien', 'en'];
const LANG_NAME: Record<Lang, string> = { en: 'english', fr: 'french', zh: 'mandarin', ru: 'russian', es: 'spanish' };
// clearest voices first; names as macos and chrome report them
const PREFER: Record<Role, string[]> = {
  en: ['Samantha', 'Daniel', 'Karen', 'Moira', 'Alex'],
  fr: ['Thomas', 'Amélie', 'Jacques'],
  zh: ['Tingting', 'Meijia'],
  ru: ['Milena'],
  es: ['Mónica', 'Paulina'],
  alien: ['Zarvox', 'Trinoids'],
};
// stock lines for the departments that do not speak english (subtitled on screen)
const STOCK: Record<Exclude<Lang, 'en'>, { approved: string[]; rejected: string[] }> = {
  fr: {
    approved: ['approuvé. félicitations, je suppose.', 'approuvé. ne le dites à personne.'],
    rejected: ['rejeté. veuillez remplir le formulaire en trois exemplaires.', 'refusé. revenez dans six à huit ans.'],
  },
  zh: {
    approved: ['批准。恭喜你，大概吧。', '批准。请不要告诉别人。'],
    rejected: ['驳回。请一式三份重新填写表格。', '拒绝。请六到八年后再来。'],
  },
  ru: {
    approved: ['одобрено. наверное, поздравляю.', 'одобрено. никому не говорите.'],
    rejected: ['отклонено. заполните форму в трёх экземплярах.', 'отказано. приходите через шесть-восемь лет.'],
  },
  es: {
    approved: ['aprobado. felicidades, supongo.', 'aprobado. no se lo diga a nadie.'],
    rejected: ['rechazado. rellene el formulario por triplicado.', 'denegado. vuelva dentro de seis a ocho años.'],
  },
};

let all: SpeechSynthesisVoice[] = [];
function loadVoices(): void {
  all = synth?.getVoices() ?? [];
}
if (synth) {
  loadVoices();
  synth.addEventListener('voiceschanged', loadVoices);
}
const named = (n: string): SpeechSynthesisVoice | undefined => all.find((v) => v.name === n) ?? all.find((v) => v.name.startsWith(`${n} (`));
const langOf = (v: SpeechSynthesisVoice): string => v.lang.toLowerCase().replace('_', '-');
// the clearest voice for a role: a preferred name, else any voice in that language
function voiceFor(role: Role): SpeechSynthesisVoice | undefined {
  const byName = PREFER[role].map(named).find(Boolean);
  if (byName || role === 'alien') return byName;
  const code = role === 'zh' ? 'zh-cn' : role;
  return all.find((v) => langOf(v).startsWith(code) && v.default) ?? all.find((v) => langOf(v).startsWith(code));
}

interface Persona {
  lang: Lang; // what it says and how it is labelled
  voice?: SpeechSynthesisVoice;
  pitch: number;
  wobble: number; // pitch swing between chunks; 0 reads the line in one go
  sings: boolean;
  alien?: boolean;
}
let cast: Persona[] = [];
const shuffled = <T>(a: T[]): T[] => a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);
const clamp = (n: number): number => Math.max(0.05, Math.min(2, n));

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
    const clearEn = voiceFor('en');
    const english: Persona = { lang: 'en', voice: clearEn, pitch: 1, wobble: 0, sings: false };
    const roles = shuffled(ROLES);
    cast = Array.from({ length: seats - 1 }, (_, i): Persona => {
      const role = roles[i % roles.length];
      const voice = voiceFor(role);
      // a language with no voice on this device falls back to clear english
      if (!voice) return role === 'alien' ? { ...english, pitch: 0.5, wobble: 0.3 } : english;
      if (role === 'alien') return { lang: 'en', voice, pitch: 1, wobble: 0, sings: false, alien: true };
      return { lang: role, voice, pitch: 1, wobble: 0, sings: false };
    });
    const news = named(granted ? 'Good News' : 'Bad News');
    cast.push(news ? { lang: 'en', voice: news, pitch: 1, wobble: 0, sings: true } : english);
  },
  // the language a seat speaks, for the subtitle label (null for english)
  languageOf(seat: number): string | null {
    if (cast[seat]?.alien) return 'alien';
    const lang = cast[seat]?.lang ?? 'en';
    return lang === 'en' ? null : LANG_NAME[lang];
  },
  // what a seat says out loud: english seats read the line, the others read a stock line in their language
  spokenLine(seat: number, name: string, outcome: 'approved' | 'rejected', line: string): string {
    const lang = cast[seat]?.lang ?? 'en';
    if (lang === 'en') return `${name}. ${line}`;
    const options = STOCK[lang][outcome];
    return `${name}. ${options[Math.floor(Math.random() * options.length)]}`;
  },
  // reads text out loud (wobbly voices in short chunks that bounce in pitch); resolves when done, or on a timeout if the browser never says so
  speak(text: string, seat: number): Promise<void> {
    if (!synth || muted || FAST) return Promise.resolve();
    synth.cancel();
    const p: Persona = cast[seat] ?? { lang: 'en', voice: voiceFor('en'), pitch: 1, wobble: 0, sings: false };
    const words = text.split(/\s+/).filter(Boolean);
    // only wobbly voices are split into chunks; everything else reads the line in one go
    const whole = p.sings || p.wobble === 0;
    const chunks: string[] = whole ? [text] : [];
    for (let i = 0; !whole && i < words.length; ) {
      const n = 3 + Math.floor(Math.random() * 3);
      chunks.push(words.slice(i, i + n).join(' '));
      i += n;
    }
    return new Promise((resolve) => {
      const done = (): void => {
        clearTimeout(timer);
        resolve();
      };
      // singing is much slower than talking
      const timer = setTimeout(done, 2500 + text.length * (p.sings ? 220 : 80));
      chunks.forEach((chunk, i) => {
        const u = new SpeechSynthesisUtterance(chunk);
        if (p.voice) u.voice = p.voice;
        u.lang = p.voice?.lang ?? 'en-US';
        u.rate = 1;
        u.pitch = clamp(p.pitch + (i % 2 ? p.wobble : -p.wobble) * (0.5 + Math.random() * 0.5));
        if (i === chunks.length - 1) {
          u.onend = done;
          u.onerror = done;
        }
        synth.speak(u);
      });
    });
  },
  stopSpeaking(): void {
    synth?.cancel();
  },
  // wake the audio context on the first click or key press
  unlockOnGesture(): void {
    const wake = (): void => void audio();
    window.addEventListener('pointerdown', wake, { once: true });
    window.addEventListener('keydown', wake, { once: true });
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
  fanfare(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, i === 3 ? 0.9 : 0.3, 0.12, 'triangle'));
  },
  trombone(): void {
    [392, 370, 349].forEach((f, i) => tone(f, i * 0.32, 0.3, 0.12, 'triangle'));
    tone(330, 0.96, 1.1, 0.12, 'triangle', 247);
  },
};
