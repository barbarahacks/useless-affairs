import { CHECK, CLERK, CROSS, HAND, PAPER, drawSprite } from './sprites.ts';
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

const ease = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

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
  private paper = { x: -14, y: PAPER_Y, visible: true, stamped: null as Outcome | null };
  private hand = { x: 0, y: HAND_UP };
  private active = -1;
  private confetti: { x: number; y: number; vx: number; vy: number; c: string }[] = [];

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
    this.paper = { x: -14, y: PAPER_Y, visible: true, stamped: null };
    this.hand = { x: 0, y: HAND_UP };
    this.active = -1;
    this.confetti = [];
  }

  async moveTo(i: number): Promise<void> {
    this.active = i;
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

  async celebrate(): Promise<void> {
    const colors = ['#ff5a5f', '#ffd23f', '#2f9bff', '#5ed67a', '#d65bff'];
    this.confetti = Array.from({ length: 70 }, (_, n) => ({ x: Math.random() * W, y: -Math.random() * 40, vx: (Math.random() - 0.5) * 0.8, vy: 0.6 + Math.random() * 1.2, c: colors[n % colors.length] }));
    await tween(1800, () => {
      for (const c of this.confetti) {
        c.x += c.vx;
        c.y += c.vy;
      }
    });
    this.confetti = [];
  }

  private draw(): void {
    const { ctx } = this;
    const now = performance.now();
    ctx.clearRect(0, 0, W, H);

    // wall with a brick-ish pattern
    ctx.fillStyle = '#bfeaff';
    ctx.fillRect(0, 0, W, 92);
    ctx.fillStyle = '#a6dcf5';
    for (let y = 0; y < 92; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < W; x += 16) ctx.fillRect(x, y, 15, 1);
    // floor
    ctx.fillStyle = '#8be3b0';
    ctx.fillRect(0, 92, W, H - 92);
    ctx.fillStyle = '#6fcf9a';
    for (let x = 0; x < W; x += 16) ctx.fillRect(x, 92, 1, H - 92);
    ctx.fillStyle = '#2a1f14';
    ctx.fillRect(0, 92, W, 1);

    // stations
    for (let i = 0; i < DEPTS.length; i++) {
      const cx = stationX(i);
      const bob = this.active === i && this.hand.y > HAND_UP + 4 ? 1 : 0;
      const idle = Math.sin(now / 400 + i) > 0.9 ? 1 : 0;
      drawSprite(ctx, CLERK, cx - 8, 58 - bob - idle, { b: DEPTS[i].clerk });

      // desk
      ctx.fillStyle = '#2a1f14';
      ctx.fillRect(cx - 18, DESK_Y, 36, 20);
      ctx.fillStyle = '#ffb84d';
      ctx.fillRect(cx - 17, DESK_Y + 1, 34, 4);
      ctx.fillStyle = '#e08a1e';
      ctx.fillRect(cx - 17, DESK_Y + 5, 34, 14);
      ctx.fillStyle = '#fff6dc';
      ctx.font = "6px 'Press Start 2P'";
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), cx, DESK_Y + 15);

      const mark = this.marks[i];
      if (mark) drawSprite(ctx, mark === 'approved' ? CHECK : CROSS, cx + 9, 48);
    }

    // paper
    if (this.paper.visible) {
      const px = this.paper.x;
      drawSprite(ctx, PAPER, px, this.paper.y);
      if (this.paper.stamped) {
        ctx.fillStyle = this.paper.stamped === 'approved' ? '#12b76a' : '#ff3b4e';
        ctx.fillRect(Math.round(px) + 1, Math.round(this.paper.y) + 3, 6, 4);
      }
    }

    // hand + stamp
    if (this.hand.y > HAND_UP - 1) drawSprite(ctx, HAND, this.hand.x, this.hand.y);
    else drawSprite(ctx, HAND, this.hand.x, this.hand.y);

    // confetti
    for (const c of this.confetti) {
      ctx.fillStyle = c.c;
      ctx.fillRect(Math.round(c.x), Math.round(c.y), 2, 2);
    }
  }
}
