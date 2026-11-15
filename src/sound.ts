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

export const sound = {
  get muted(): boolean {
    return muted;
  },
  // muting also silences anything already playing
  setMuted(m: boolean): void {
    muted = m;
    if (ctx && out) out.gain.setTargetAtTime(m ? 0 : 0.7, ctx.currentTime, 0.02);
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
  // rubber stamp thunk, then a desk bell or a buzzer
  stamp(approved: boolean): void {
    hiss(0, 0.08, 0.5, 400, 'lowpass');
    tone(140, 0, 0.12, 0.4, 'sine', 55);
    if (approved) {
      tone(1319, 0.1, 0.9, 0.14);
      tone(2637, 0.1, 0.5, 0.04);
    } else {
      tone(98, 0.1, 0.4, 0.07, 'square');
      tone(104, 0.1, 0.4, 0.07, 'square');
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
