// pixel sprites: each row is a string, one char per pixel, '.' is transparent.
// palette keys map to colors; 'b' (suit) and 'h' (hair) are swapped per clerk.

export const PAL: Record<string, string> = {
  k: '#2b2f3a', // outline
  w: '#ffffff',
  g: '#b8bcc6', // paper lines
  s: '#f1c9a0', // skin
  h: '#4a3020', // hair
  e: '#2b2f3a', // eyes
  m: '#8a4b3f', // mouth (unimpressed)
  t: '#c8312f', // tie
  u: '#2f3b55', // suit sleeve
  r: '#7a5a3a', // stamp handle
  R: '#c8312f', // stamp base / rejected
  G: '#2e7d4f', // approved
};

export type Sprite = string[];

export const CLERK: Sprite = [
  '...kkkkkk...',
  '..khhhhhhk..',
  '..khhhhhhk..',
  '..kssssssk..',
  '..ksessesk..',
  '..kssssssk..',
  '..ksmmmmsk..',
  '....kssk....',
  '..kbbwwbbk..',
  '.kbbwttwbbk.',
  '.kbbbttbbbk.',
  '.kbbbttbbbk.',
  '.kbbbbbbbbk.',
  '.kkkkkkkkkk.',
];

export const PAPER: Sprite = [
  'kkkkkkk.',
  'kwwwwwkk',
  'kwggggwk',
  'kwwwwwwk',
  'kwggggwk',
  'kwwwwwwk',
  'kwgggwwk',
  'kwwwwwwk',
  'kwwwwwwk',
  'kkkkkkkk',
];

export const HAND: Sprite = [
  '...uuuuuuuu.....',
  '...uuuuuuuu.....',
  '...uuuuuuuu.....',
  '...wwwwwwww.....',
  '..kssssssssk....',
  '.kssssssssssk...',
  '.kssssssssssk...',
  '.kssssssssssk...',
  '..kssssssssk....',
  '....krrrrk......',
  '.....krrk.......',
  '.....krrk.......',
  '...kkRRRRRRkk...',
  '...kRRRRRRRRk...',
  '...kkkkkkkkkk...',
];

export const CHECK: Sprite = [
  '........',
  '......GG',
  '.....GG.',
  'G...GG..',
  'GG.GG...',
  '.GGG....',
  '..G.....',
  '........',
];

export const CROSS: Sprite = [
  'R.....R.',
  'RR...RR.',
  '.RR.RR..',
  '..RRR...',
  '..RRR...',
  '.RR.RR..',
  'RR...RR.',
  'R.....R.',
];

export const CLOCK: Sprite = [
  '..kkkkk..',
  '.kwwwwwk.',
  'kwwwwwwwk',
  'kwwwwwwwk',
  'kwwwwwwwk',
  'kwwwwwwwk',
  'kwwwwwwwk',
  '.kwwwwwk.',
  '..kkkkk..',
];

// 3x5 desk-plate digits
export const DIGITS: Record<number, Sprite> = {
  1: ['.w.', 'ww.', '.w.', '.w.', 'www'],
  2: ['ww.', '..w', '.w.', 'w..', 'www'],
  3: ['ww.', '..w', '.w.', '..w', 'ww.'],
  4: ['w.w', 'w.w', 'www', '..w', '..w'],
  5: ['www', 'w..', 'ww.', '..w', 'ww.'],
  6: ['.ww', 'w..', 'www', 'w.w', 'www'],
  7: ['www', '..w', '.w.', '.w.', '.w.'],
};

export function drawSprite(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number, swap: Record<string, string> = {}): void {
  for (let row = 0; row < sprite.length; row++) {
    const line = sprite[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.') continue;
      const color = swap[ch] ?? PAL[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x) + col, Math.round(y) + row, 1, 1);
    }
  }
}
