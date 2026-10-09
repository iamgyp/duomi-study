/**
 * Pixel-art sprites for the typing game, defined as character grids and
 * pre-rendered into small offscreen canvases (1 cell = 1 px), then scaled up
 * with image smoothing disabled for a crisp Minecraft look.
 */

type Palette = Record<string, string>;

interface SpriteDef {
  rows: string[];
  palette: Palette;
}

const ZOMBIE_PAL: Palette = {
  G: '#5A9B3C', g: '#3E7A28', K: '#1B1B1B',
  B: '#2E8B9A', b: '#1F6B78', P: '#3B3F99', p: '#2A2D73',
};

const ZOMBIE_TOP = [
  '..GGGGGGGG..',
  '..GGGGGGGG..',
  '..GgGGGGgG..',
  '..KKGGKKGG..',
  '..GGGGGGGG..',
  '..GGgggGGG..',
  '..GGGGGGGG..',
  '..gGGGGGGg..',
  'GGGGBBBBBB..',
  'GGGGBBBBBB..',
  '...BBBBBBB..',
  '...BbBBbBB..',
  '...BBBBBBB..',
  '...BBBBBBB..',
];

const ZOMBIE_LEGS_A = [
  '...PPPPPP...',
  '...PPppPP...',
  '..PPP..PPP..',
  '..PPP..PPP..',
  '.PPP....PPP.',
  '.ppp....ppp.',
];
const ZOMBIE_LEGS_B = [
  '...PPPPPP...',
  '...PPPPPP...',
  '...PPPPPP...',
  '...PPpPPP...',
  '...PPPPPP...',
  '...pppppp...',
];

const CREEPER_PAL: Palette = { C: '#4CAF50', c: '#2E7D32', l: '#8BC34A', K: '#111111' };
const CREEPER_TOP = [
  '.CCClCCCC.',
  '.CcCCCClC.',
  '.CKKCCKKC.',
  '.CKKCCKKC.',
  '.CCCKKCCC.',
  '.ClKKKKCC.',
  '.CCKKKKCc.',
  '.CCKCCKCC.',
  '..CCcCCC..',
  '..CClCCC..',
  '..cCCCCC..',
  '..CCCCcC..',
  '..CCClCC..',
  '..CcCCCC..',
  '..CCCCCC..',
  '..CCCCCl..',
];
const CREEPER_LEGS_A = ['.CCC..CCC.', '.CcC..ClC.', '.CCC..CCC.', '.ccc..ccc.'];
const CREEPER_LEGS_B = ['..CCCCCC..', '..CcCClC..', '..CCCCCC..', '..cccccc..'];

const SKELETON_PAL: Palette = { W: '#DADADA', w: '#9E9E9E', K: '#222222', T: '#8B5A2B' };
const SKELETON_TOP = [
  '..WWWWWWWW..',
  '..WWWWWWWW..',
  '..WwWWWWwW..',
  '..KKWWKKWW..',
  '..WWWWWWWW..',
  '..WKKKKKWW..',
  '..WWWWWWWW..',
  '..wWWWWWWw..',
  'T..wWWWWw...',
  'TWWWwWWw....',
  'T..WWWWW....',
  'T...wWWw....',
  '....WWWW....',
  '....wWWw....',
  '....W..W....',
  '....W..W....',
];
const SKELETON_LEGS_A = ['...W....W...', '...W....W...', '..W......W..', '..w......w..'];
const SKELETON_LEGS_B = ['....W..W....', '....W..W....', '....W..W....', '....w..w....'];

const STEVE_PAL: Palette = {
  H: '#4A3020', S: '#F0A57C', E: '#FFFFFF', I: '#3B82F6', M: '#8B4513',
  T: '#00A8A8', t: '#008080', J: '#3B3BA0', j: '#2A2A7A', O: '#8B5A2B', s: '#EEEEEE',
};
const STEVE = [
  '..HHHHHHHH..',
  '..HHHHHHHH..',
  '..HSSSSSSH..',
  '..SEISSEIS..',
  '..SSSSSSSS..',
  '..SSMMMMSS..',
  '..SSSSSSSS..',
  '..SSSSSSSS.O',
  '...TTTTTSSsO',
  '...TTTTTSSSO',
  '...TtTTTT.sO',
  '...TTTTTT.sO',
  '...TTTtTT.sO',
  '...TTTTTT.O.',
  '...JJJJJJ...',
  '...JJJJJJ...',
  '...JJ..JJ...',
  '...JJ..JJ...',
  '...jj..jj...',
  '...jj..jj...',
];

const TNT_PAL: Palette = { R: '#DB2F1F', r: '#9E1B10', W: '#F2F2F2', K: '#222222' };
const TNT = [
  'RRrRRRrRRR',
  'RRrRRRrRRR',
  'RRrRRRrRRR',
  'WWWWWWWWWW',
  'WKKKWKWKKW',
  'WWKWWKWWKW',
  'WWWWWWWWWW',
  'RRrRRRrRRR',
  'RRrRRRrRRR',
  'RRrRRRrRRR',
];

const HEART_PAL: Palette = { R: '#E53935', W: '#FFCDD2', K: '#3A0A0A' };
const HEART_EMPTY_PAL: Palette = { R: '#4B4B4B', W: '#6B6B6B', K: '#222222' };
const HEART = [
  '.RR.RR.',
  'RWRRRRR',
  'RRRRRRR',
  '.RRRRR.',
  '..RRR..',
  '...R...',
];

function render(def: SpriteDef): HTMLCanvasElement {
  const h = def.rows.length;
  const w = Math.max(...def.rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  def.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = def.palette[row[x]];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
  return c;
}

/** Same sprite but every opaque pixel painted white (hit flash). */
function whiteVersion(src: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(src, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

export type MobKind = 'zombie' | 'creeper' | 'skeleton' | 'boss' | 'tnt';

export interface SpriteSet {
  mobs: Record<MobKind, [HTMLCanvasElement, HTMLCanvasElement]>;
  mobsWhite: Record<MobKind, [HTMLCanvasElement, HTMLCanvasElement]>;
  steve: HTMLCanvasElement;
  heart: HTMLCanvasElement;
  heartEmpty: HTMLCanvasElement;
}

/** Main color of each mob, used for explosion particles. */
export const MOB_COLORS: Record<MobKind, string[]> = {
  zombie: ['#5A9B3C', '#3E7A28', '#2E8B9A', '#3B3F99'],
  creeper: ['#4CAF50', '#2E7D32', '#8BC34A', '#FFFFFF'],
  skeleton: ['#DADADA', '#9E9E9E', '#FFFFFF'],
  boss: ['#5A9B3C', '#3E7A28', '#B71C1C', '#FFD54F'],
  tnt: ['#DB2F1F', '#FFB300', '#FFFFFF', '#555555'],
};

let cache: SpriteSet | null = null;

export function getSprites(): SpriteSet {
  if (cache) return cache;
  const pair = (top: string[], a: string[], b: string[], palette: Palette): [HTMLCanvasElement, HTMLCanvasElement] => [
    render({ rows: [...top, ...a], palette }),
    render({ rows: [...top, ...b], palette }),
  ];
  const bossPal: Palette = { ...ZOMBIE_PAL, K: '#E53935', B: '#6A1B9A', b: '#4A148C' };
  const tnt = render({ rows: TNT, palette: TNT_PAL });
  const mobs: SpriteSet['mobs'] = {
    zombie: pair(ZOMBIE_TOP, ZOMBIE_LEGS_A, ZOMBIE_LEGS_B, ZOMBIE_PAL),
    creeper: pair(CREEPER_TOP, CREEPER_LEGS_A, CREEPER_LEGS_B, CREEPER_PAL),
    skeleton: pair(SKELETON_TOP, SKELETON_LEGS_A, SKELETON_LEGS_B, SKELETON_PAL),
    boss: pair(ZOMBIE_TOP, ZOMBIE_LEGS_A, ZOMBIE_LEGS_B, bossPal),
    tnt: [tnt, tnt],
  };
  const mobsWhite = Object.fromEntries(
    Object.entries(mobs).map(([kind, [a, b]]) => [kind, [whiteVersion(a), whiteVersion(b)]]),
  ) as SpriteSet['mobsWhite'];
  cache = {
    mobs,
    mobsWhite,
    steve: render({ rows: STEVE, palette: STEVE_PAL }),
    heart: render({ rows: HEART, palette: HEART_PAL }),
    heartEmpty: render({ rows: HEART, palette: HEART_EMPTY_PAL }),
  };
  return cache;
}

// ── Static background ──────────────────────────────────────────────────────

/** Deterministic pseudo random so the background looks the same every run. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const SCENE = {
  W: 960,
  H: 540,
  HORIZON: 360,
  PATH_TOP: 405,
  PATH_BOTTOM: 525,
  WALL_X: 150,
  WALL_TOP: 290,
  LANES: [440, 475, 510],
};

export type BiomeType = 'plains' | 'desert' | 'snow' | 'nether' | 'end';

export function renderBackground(dpr: number, biome: BiomeType = 'plains'): HTMLCanvasElement {
  const { W, H, HORIZON, PATH_TOP, PATH_BOTTOM, WALL_X, WALL_TOP } = SCENE;
  const c = document.createElement('canvas');
  c.width = W * dpr;
  c.height = H * dpr;
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const rnd = seeded(biome === 'desert' ? 77 : biome === 'snow' ? 88 : biome === 'nether' ? 99 : biome === 'end' ? 101 : 42);

  // Biome sky colors
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
  if (biome === 'desert') {
    sky.addColorStop(0, '#29B6F6');
    sky.addColorStop(1, '#FFF59D');
  } else if (biome === 'snow') {
    sky.addColorStop(0, '#90CAF9');
    sky.addColorStop(1, '#ECEFF1');
  } else if (biome === 'nether') {
    sky.addColorStop(0, '#3A0909');
    sky.addColorStop(1, '#7F1D1D');
  } else if (biome === 'end') {
    sky.addColorStop(0, '#090314');
    sky.addColorStop(1, '#3B0764');
  } else {
    sky.addColorStop(0, '#4FA3E8');
    sky.addColorStop(1, '#B9E3FF');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HORIZON + 10);

  // Celestial object (Sun / Nether fire / Ender moon)
  if (biome === 'nether') {
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(800, 40, 70, 70);
    ctx.fillStyle = '#F97316';
    ctx.fillRect(812, 52, 46, 46);
  } else if (biome === 'end') {
    ctx.fillStyle = '#A855F7';
    ctx.fillRect(800, 40, 70, 70);
    ctx.fillStyle = '#C084FC';
    ctx.fillRect(812, 52, 46, 46);
  } else {
    ctx.fillStyle = '#FFF59D';
    ctx.fillRect(800, 40, 70, 70);
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(812, 52, 46, 46);
  }

  // Far hills (stepped blocks)
  const drawHills = (color: string, base: number, maxH: number, step: number) => {
    ctx.fillStyle = color;
    let h = maxH / 2;
    for (let x = 0; x < W; x += step) {
      h = Math.max(10, Math.min(maxH, h + (rnd() - 0.5) * step * 1.6));
      ctx.fillRect(x, base - h, step, h + 2);
    }
  };
  const hill1 = biome === 'desert' ? '#D4B359' : biome === 'snow' ? '#CFD8DC' : biome === 'nether' ? '#581C1C' : biome === 'end' ? '#4C1D95' : '#7FB77E';
  const hill2 = biome === 'desert' ? '#C29F45' : biome === 'snow' ? '#B0BEC5' : biome === 'nether' ? '#450A0A' : biome === 'end' ? '#3B0764' : '#5E9C4E';
  drawHills(hill1, HORIZON, 110, 24);
  drawHills(hill2, HORIZON, 60, 20);

  // Horizon decorations (trees or obsidian pillars)
  const tree = (x: number, scale: number) => {
    const b = 8 * scale;
    if (biome === 'desert') {
      // Cactus
      ctx.fillStyle = '#388E3C';
      ctx.fillRect(x + b, HORIZON - b * 5, b * 1.5, b * 5);
      ctx.fillRect(x, HORIZON - b * 4, b * 3.5, b);
      ctx.fillRect(x, HORIZON - b * 5.5, b, b * 1.5);
      ctx.fillRect(x + b * 2.5, HORIZON - b * 5, b, b * 1.5);
    } else if (biome === 'end') {
      // Obsidian pillar with purple beacon
      ctx.fillStyle = '#18181B';
      ctx.fillRect(x, HORIZON - b * 8, b * 3, b * 8);
      ctx.fillStyle = '#C084FC';
      ctx.fillRect(x + b * 0.8, HORIZON - b * 9.5, b * 1.4, b * 1.5);
    } else {
      ctx.fillStyle = biome === 'snow' ? '#4E342E' : biome === 'nether' ? '#7F1D1D' : '#6D4C2F';
      ctx.fillRect(x + b * 1.5, HORIZON - b * 4, b, b * 4);
      ctx.fillStyle = biome === 'snow' ? '#E0F2F1' : biome === 'nether' ? '#991B1B' : '#2F7D32';
      ctx.fillRect(x, HORIZON - b * 7, b * 4, b * 3);
      ctx.fillRect(x + b, HORIZON - b * 8, b * 2, b);
      ctx.fillStyle = biome === 'snow' ? '#FFFFFF' : biome === 'nether' ? '#B91C1C' : '#3E9B42';
      ctx.fillRect(x + b * 0.5, HORIZON - b * 6.5, b, b);
      ctx.fillRect(x + b * 2.5, HORIZON - b * 7.5, b, b);
    }
  };
  tree(330, 1.2);
  tree(520, 1);
  tree(700, 1.4);
  tree(880, 1.1);

  // Field tiles
  const TILE = 20;
  for (let y = HORIZON; y < H; y += TILE) {
    for (let x = 0; x < W; x += TILE) {
      const v = rnd();
      if (biome === 'desert') {
        ctx.fillStyle = v < 0.33 ? '#E0C068' : v < 0.66 ? '#D4B359' : '#EDCE79';
      } else if (biome === 'snow') {
        ctx.fillStyle = v < 0.33 ? '#F0F4F8' : v < 0.66 ? '#E2E8F0' : '#ECEFF1';
      } else if (biome === 'nether') {
        ctx.fillStyle = v < 0.33 ? '#7F1D1D' : v < 0.66 ? '#991B1B' : '#5F1212';
      } else if (biome === 'end') {
        ctx.fillStyle = v < 0.33 ? '#FEF9C3' : v < 0.66 ? '#E4D896' : '#D8CC8C';
      } else {
        ctx.fillStyle = v < 0.33 ? '#5DA130' : v < 0.66 ? '#66AC37' : '#559A2B';
      }
      ctx.fillRect(x, y, TILE, TILE);
    }
  }

  // Path tiles
  for (let y = PATH_TOP; y < PATH_BOTTOM; y += TILE) {
    for (let x = 0; x < W; x += TILE) {
      const v = rnd();
      if (biome === 'desert') {
        ctx.fillStyle = v < 0.33 ? '#B89248' : v < 0.66 ? '#A6823C' : '#C7A258';
      } else if (biome === 'snow') {
        ctx.fillStyle = v < 0.33 ? '#B0BEC5' : v < 0.66 ? '#90A4AE' : '#78909C';
      } else if (biome === 'nether') {
        ctx.fillStyle = v < 0.33 ? '#450A0A' : v < 0.66 ? '#2D0000' : '#520B0B';
      } else if (biome === 'end') {
        ctx.fillStyle = v < 0.33 ? '#6B21A8' : v < 0.66 ? '#581C87' : '#7E22CE';
      } else {
        ctx.fillStyle = v < 0.33 ? '#9B7653' : v < 0.66 ? '#8C6A48' : '#A6805C';
      }
      ctx.fillRect(x, y, TILE, TILE);
    }
  }
  // path edges
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, PATH_TOP, W, 4);
  ctx.fillRect(0, PATH_BOTTOM - 4, W, 4);

  // Village house / fortress behind the wall
  const wallCol = biome === 'desert' ? '#DEB887' : biome === 'snow' ? '#78909C' : biome === 'nether' ? '#450A0A' : biome === 'end' ? '#18181B' : '#8A8A8A';
  const houseCol = biome === 'nether' ? '#2A0505' : biome === 'end' ? '#241038' : '#B5874F';
  ctx.fillStyle = houseCol;
  ctx.fillRect(0, 230, 80, 140);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  for (let y = 230; y < 370; y += 14) ctx.fillRect(0, y, 80, 2);
  ctx.fillStyle = '#6D4C2F';
  ctx.fillRect(0, 210, 92, 22);

  // Cobblestone wall / tower
  const wallLeft = 60;
  for (let y = WALL_TOP; y < H; y += 18) {
    for (let x = wallLeft; x < WALL_X; x += 18) {
      ctx.fillStyle = wallCol;
      ctx.fillRect(x, y, 18, 18);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x, y, 18, 2);
      ctx.fillRect(x, y, 2, 18);
    }
  }
  // battlements
  for (let x = wallLeft; x < WALL_X; x += 30) {
    ctx.fillStyle = wallCol;
    ctx.fillRect(x, WALL_TOP - 16, 16, 16);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, WALL_TOP - 16, 16, 2);
  }
  // wall shadow on the ground
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(WALL_X, PATH_TOP, 14, PATH_BOTTOM - PATH_TOP);

  return c;
}
