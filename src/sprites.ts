// pixel sprites: each row is a string, one char per pixel, '.' is transparent.
// palette keys map to colors; 'b' (body) is swapped per clerk.

export const PAL: Record<string, string> = {
  k: '#2a1f14', // outline
  w: '#ffffff',
  g: '#b8c0cc', // paper lines
  s: '#ffd0a0', // skin
  h: '#6b3f1d', // hair
  e: '#2a1f14', // eyes
  m: '#c2273a', // mouth
  u: '#3a3f6b', // suit sleeve
  r: '#a8642a', // stamp handle
  R: '#ff3b4e', // stamp base
  G: '#12b76a',
  Y: '#ffd23f',
};

export type Sprite = string[];

export const CLERK: Sprite = [
  '...kkkkkk...',
  '..khhhhhhk..',
  '..khhhhhhk..',
  '..kssssssk..',
  '..ksessesk..',
  '..kssssssk..',
  '..kssmmssk..',
  '....kssk....',
  '..kbbbbbbk..',
  '.kbbwwwwbbk.',
  '.kbbbwwbbbk.',
  '.kbbbbbbbbk.',
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
