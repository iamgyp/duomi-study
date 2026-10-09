/**
 * Keyboard layout + touch-typing finger assignment (standard QWERTY).
 */

export type Finger =
  | 'L5' | 'L4' | 'L3' | 'L2' // left pinky, ring, middle, index
  | 'R2' | 'R3' | 'R4' | 'R5' // right index, middle, ring, pinky
  | 'T';                      // thumbs

export interface KeyDef {
  /** value produced by event.key (lowercase) */
  key: string;
  /** label printed on the key cap */
  label: string;
  finger: Finger;
  /** relative width (1 = normal key) */
  width?: number;
  /** home-row bump (F / J) */
  bump?: boolean;
}

export const FINGER_COLORS: Record<Finger, string> = {
  L5: '#EF4444',
  L4: '#F97316',
  L3: '#EAB308',
  L2: '#22C55E',
  R2: '#06B6D4',
  R3: '#3B82F6',
  R4: '#8B5CF6',
  R5: '#EC4899',
  T: '#9CA3AF',
};

/** i18n keys for finger names (Typing.fingers.*) */
export const FINGER_NAME_KEYS: Record<Finger, string> = {
  L5: 'Typing.fingers.L5',
  L4: 'Typing.fingers.L4',
  L3: 'Typing.fingers.L3',
  L2: 'Typing.fingers.L2',
  R2: 'Typing.fingers.R2',
  R3: 'Typing.fingers.R3',
  R4: 'Typing.fingers.R4',
  R5: 'Typing.fingers.R5',
  T: 'Typing.fingers.T',
};

const k = (key: string, finger: Finger, extra: Partial<KeyDef> = {}): KeyDef => ({
  key,
  label: key.toUpperCase(),
  finger,
  ...extra,
});

export const KEYBOARD_ROWS: KeyDef[][] = [
  [
    k('`', 'L5'), k('1', 'L5'), k('2', 'L4'), k('3', 'L3'), k('4', 'L2'), k('5', 'L2'),
    k('6', 'R2'), k('7', 'R2'), k('8', 'R3'), k('9', 'R4'), k('0', 'R5'), k('-', 'R5'), k('=', 'R5'),
  ],
  [
    k('q', 'L5'), k('w', 'L4'), k('e', 'L3'), k('r', 'L2'), k('t', 'L2'),
    k('y', 'R2'), k('u', 'R2'), k('i', 'R3'), k('o', 'R4'), k('p', 'R5'), k('[', 'R5'), k(']', 'R5'),
  ],
  [
    k('a', 'L5'), k('s', 'L4'), k('d', 'L3'), k('f', 'L2', { bump: true }), k('g', 'L2'),
    k('h', 'R2'), k('j', 'R2', { bump: true }), k('k', 'R3'), k('l', 'R4'), k(';', 'R5'), k("'", 'R5'),
  ],
  [
    k('z', 'L5'), k('x', 'L4'), k('c', 'L3'), k('v', 'L2'), k('b', 'L2'),
    k('n', 'R2'), k('m', 'R2'), k(',', 'R3'), k('.', 'R4'), k('/', 'R5'),
  ],
  [k(' ', 'T', { label: 'SPACE', width: 6 })],
];

/** Horizontal offset (in key units) of each row, mimicking a real staggered keyboard. */
export const ROW_OFFSETS = [0, 0.5, 0.75, 1.25, 3.5];

const KEY_MAP: Record<string, KeyDef> = {};
KEYBOARD_ROWS.flat().forEach((def) => {
  KEY_MAP[def.key] = def;
});

export function getKeyDef(key: string): KeyDef | undefined {
  return KEY_MAP[key.toLowerCase()];
}

export function getFingerForKey(key: string): Finger | undefined {
  return getKeyDef(key)?.finger;
}
