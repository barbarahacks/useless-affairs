import { CHECK, CLERK, CLOCK, CROSS, DIGITS, HAND, PAPER, drawSprite } from './sprites.ts';
import { FAST } from './config.ts';
import { DEPTS } from './departments.ts';
import type { Outcome } from './departments.ts';

export const W = 320;
export const H = 130;

const stationX = (i: number): number => 28 + i * 44;
const DESK_Y = 70;
const PAPER_Y = 60;
const HAND_UP = -22;
const HAND_DOWN = PAPER_Y - 15;
const FLOOR_Y = 92;
const OUTLINE = '#2b2f3a';
const HAIR = ['#3b2a1e', '#6b4a2b', '#1f1f24', '#8a8a8a', '#a8823f', '#4a3020', '#d9d9d9'];
const LIGHTS = [18, 98, 178, 258];

const ease = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// deterministic carpet speckle
const rand = (n: number, k: number): number => {
  const x = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const SPECKS = Array.from({ length: 160 }, (_, n) => ({
  x: Math.floor(rand(n, 1) * W),
  y: FLOOR_Y + 1 + Math.floor(rand(n, 2) * (H - FLOOR_Y - 1)),
  c: rand(n, 3) > 0.5 ? '#7d8496' : '#5c6273',
}));

function tween(ms: number, step: (t: number) => void): Promise<void> {
  if (FAST) {
    step(1);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / ms);
      step(ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

export class Scene {
  private ctx: CanvasRenderingContext2D;
  private marks: (Outcome | null)[] = DEPTS.map(() => null);
  private paper = { x: -14, y: PAPER_Y, stamped: null as Outcome | null };
  private hand = { x: 0, y: HAND_UP };
  private active = -1;
  private rush = false; // the clock spins while your case is open
  private shreds: { x: number; y: number; vx: number; vy: number; c: string; p: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    this.ctx = ctx;
    ctx.imageSmoothingEnabled = false;
    const loop = (): void => {
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  reset(): void {
    this.marks = DEPTS.map(() => null);
    this.paper = { x: -14, y: PAPER_Y, stamped: null };
    this.hand = { x: 0, y: HAND_UP };
    this.active = -1;
    this.rush = false;
    this.shreds = [];
  }

  async moveTo(i: number): Promise<void> {
    this.active = i;
    this.rush = true;
    const from = this.paper.x;
    const to = stationX(i) + 4;
    this.paper.stamped = null;
    await tween(520, (t) => {
      this.paper.x = from + (to - from) * t;
      this.paper.y = PAPER_Y - Math.sin(t * Math.PI) * 14; // little hop
    });
    this.paper.y = PAPER_Y;
  }

  async stamp(i: number, outcome: Outcome): Promise<void> {
    this.hand.x = stationX(i) + 4 - 8;
    await tween(260, (t) => (this.hand.y = HAND_UP + (HAND_DOWN - HAND_UP) * t));
    this.paper.stamped = outcome;
    this.marks[i] = outcome;
    await tween(160, () => undefined);
    await tween(260, (t) => (this.hand.y = HAND_DOWN + (HAND_UP - HAND_DOWN) * t));
  }

  // shredded paperwork instead of confetti
  async celebrate(): Promise<void> {
    const colors = ['#fbfaf5', '#e9d8a6', '#ffffff', '#cfcabb'];
    this.shreds = Array.from({ length: 80 }, (_, n) => ({
      x: Math.random() * W,
      y: -Math.random() * 50,
      vx: (Math.random() - 0.5) * 0.3,
      vy: 0.45 + Math.random() * 0.7,
      c: colors[n % colors.length],
      p: Math.random() * 6,
    }));
    await tween(2000, () => {
      for (const s of this.shreds) {
        s.x += s.vx;
        s.y += s.vy;
      }
    });
    this.shreds = [];
    this.rush = false;
  }

  private poster(x: number, y: number, kind: 'line' | 'bars'): void {
    const { ctx } = this;
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x, y, 30, 22);
    ctx.fillStyle = '#fbfaf5';
    ctx.fillRect(x + 1, y + 1, 28, 20);
    ctx.fillStyle = '#b8bcc6';
    ctx.fillRect(x + 3, y + 3, 14, 1);
    ctx.fillStyle = '#9a9a90';
    ctx.fillRect(x + 4, y + 18, 23, 1);
    ctx.fillRect(x + 4, y + 7, 1, 11);
    if (kind === 'line') {
      // number go down
      const pts = [[5, 8], [9, 9], [13, 8], [17, 12], [21, 13], [26, 17]];
      ctx.fillStyle = '#c8312f';
      for (let p = 0; p < pts.length - 1; p++) {
        const [x0, y0] = pts[p];
        const [x1, y1] = pts[p + 1];
        for (let px = x0; px <= x1; px++) ctx.fillRect(x + px, y + Math.round(y0 + ((y1 - y0) * (px - x0)) / (x1 - x0)), 1, 1);
      }
    } else {
      ctx.fillStyle = '#2d4370';
      [10, 8, 6, 4, 2].forEach((h, n) => ctx.fillRect(x + 6 + n * 4, y + 18 - h, 3, h));
    }
  }

  private draw(): void {
    const { ctx } = this;
    const now = performance.now();
    ctx.clearRect(0, 0, W, H);

    // ceiling + fluorescent panels (one of them is dying)
    ctx.fillStyle = '#bdbab0';
    ctx.fillRect(0, 0, W, 9);
    ctx.fillStyle = '#a9a69b';
    ctx.fillRect(0, 9, W, 1);
    // wall
    ctx.fillStyle = '#dedcd0';
    ctx.fillRect(0, 10, W, FLOOR_Y - 10);
    LIGHTS.forEach((x, k) => {
      const dead = k === 2 && Math.random() < 0.08;
      ctx.fillStyle = dead ? '#cfd0c4' : '#f6f8ec';
      ctx.fillRect(x, 3, 46, 3);
      if (!dead) {
        ctx.fillStyle = 'rgba(255, 255, 235, 0.35)';
        ctx.fillRect(x - 4, 10, 54, 6);
      }
    });
    // wainscot + skirting
    ctx.fillStyle = '#c9c6b6';
    ctx.fillRect(0, 64, W, FLOOR_Y - 64);
    ctx.fillStyle = '#b3b0a1';
    ctx.fillRect(0, 63, W, 1);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(0, FLOOR_Y - 1, W, 1);
    // carpet
    ctx.fillStyle = '#6a7183';
    ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
    for (const s of SPECKS) {
      ctx.fillStyle = s.c;
      ctx.fillRect(s.x, s.y, 1, 1);
    }

    // wall decor: sad charts and a clock that spins while you wait
    this.poster(44, 18, 'line');
    this.poster(246, 18, 'bars');
    drawSprite(ctx, CLOCK, 156, 20);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(160, 22, 1, 3); // hour hand
    const a = now / (this.rush ? 90 : 5000);
    for (let r = 1; r <= 3; r++) ctx.fillRect(160 + Math.round(Math.cos(a) * r), 24 + Math.round(Math.sin(a) * r), 1, 1);

    // stations
    for (let i = 0; i < DEPTS.length; i++) {
      const cx = stationX(i);
      const bob = this.active === i && this.hand.y > HAND_UP + 4 ? 1 : 0;
      const idle = Math.sin(now / 400 + i) > 0.9 ? 1 : 0;
      drawSprite(ctx, CLERK, cx - 6, 58 - bob - idle, { b: DEPTS[i].clerk, h: HAIR[i] });

      // in-tray of forms and a mug
      ctx.fillStyle = OUTLINE;
      ctx.fillRect(cx - 16, DESK_Y - 4, 8, 4);
      ctx.fillStyle = '#fbfaf5';
      ctx.fillRect(cx - 15, DESK_Y - 4, 6, 3);
      ctx.fillStyle = '#b8bcc6';
      ctx.fillRect(cx - 15, DESK_Y - 3, 6, 1);
      ctx.fillStyle = '#fbfaf5';
      ctx.fillRect(cx + 13, DESK_Y - 3, 3, 3);
      ctx.fillRect(cx + 16, DESK_Y - 2, 1, 1);

      // desk
      ctx.fillStyle = OUTLINE;
      ctx.fillRect(cx - 18, DESK_Y, 36, 20);
      ctx.fillStyle = '#d8d2c1';
      ctx.fillRect(cx - 17, DESK_Y + 1, 34, 4);
      ctx.fillStyle = '#a39c88';
      ctx.fillRect(cx - 17, DESK_Y + 5, 34, 14);
      ctx.fillStyle = OUTLINE;
      ctx.fillRect(cx - 3, DESK_Y + 8, 7, 7);
      drawSprite(ctx, DIGITS[i + 1], cx - 1, DESK_Y + 9);

      const mark = this.marks[i];
      if (mark) drawSprite(ctx, mark === 'approved' ? CHECK : CROSS, cx + 9, 48);
    }

    // paper
    const px = this.paper.x;
    drawSprite(ctx, PAPER, px, this.paper.y);
    if (this.paper.stamped) {
      ctx.fillStyle = this.paper.stamped === 'approved' ? '#2e7d4f' : '#c8312f';
      ctx.fillRect(Math.round(px) + 1, Math.round(this.paper.y) + 3, 6, 4);
    }

    // hand + stamp
    drawSprite(ctx, HAND, this.hand.x, this.hand.y);

    // shreds flutter down
    for (const s of this.shreds) {
      ctx.fillStyle = s.c;
      ctx.fillRect(Math.round(s.x + Math.sin(now / 180 + s.p)), Math.round(s.y), 1, 3);
    }
  }
}
