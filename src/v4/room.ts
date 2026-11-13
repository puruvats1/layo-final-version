/* Layo V4 prototype: the room's data and rules. Pure functions, no rendering.
   Coordinates: metres, x east, z south, the room is 3.4 x 3.4 centred on 0,0. Door on the north wall. */
import { computePlacement, type ProxyKind } from '../utils/stagingProxy';

export type Origin = 'room' | 'added' | 'suggested';
export type Dims = [number, number, number];
export interface Obj {
  id: string; name: string; type: string; kind: ProxyKind;
  dims: Dims; det: Dims; at: [number, number]; rot: number;
  inRoom: boolean; origin: Origin; src: 'room' | 'page' | 'photo' | 'you';
  finish: string; history: string[];
  powered?: boolean; link?: string; flat?: boolean; small?: boolean;
  model?: string; typeOk?: boolean; isNew?: boolean;
  /** Hangs on a wall: it snaps to the nearest wall, faces into the room, and sits at height y (the middle of it) */
  wall?: boolean; y?: number;
}
export interface Prefs {
  given: boolean; name: string; refs: string[]; preset: string;
  main: string[]; some: string[]; priorities: string[]; words: string[];
}
export interface Fixed { id: string; name: string; pos: [number, number, number]; unsure?: string; state: 'ok' | 'unsure' | 'gone'; label?: string; user?: boolean; notPlug?: boolean }
export interface Check { key: string; obj: string; rule: string; kind: 'fact' | 'pref'; text: string; why?: string; hedge?: boolean; before?: boolean; quiet?: boolean; m?: string; acts?: string[]; rank?: number }
export interface Change { id: string; at?: [number, number]; rot?: number; remove?: boolean; add?: boolean; finish?: string; note?: string }
export interface Proposal { title: string; changes: Change[]; palette?: 'warm_studio' | 'cool_pastel'; restyle?: boolean; multi?: boolean }
export interface Option { n: number; key: string; where: string; m: string; findings: string[]; at: [number, number]; rot: number; cost: string; also?: string; alsoName?: string }

const P = Math.PI;
const o = (id: string, name: string, type: string, kind: ProxyKind, dims: Dims, at: [number, number], rot: number, finish: string, extra: Partial<Obj> = {}): Obj =>
  ({ id, name, type, kind, dims, det: dims, at, rot, inRoom: true, origin: 'room', src: 'room', finish, history: [], ...extra });

export const START: Obj[] = [
  o('obj_bed', 'Bed', 'Bed', 'bed', [1.02, 1.02, 1.95], [-1.15, 0.69], P, 'Teak, paisley sheet'),
  o('obj_study_table', 'Study desk', 'Desk', 'desk', [1.05, 0.95, 0.6], [1.38, -0.95], -P / 2, 'Walnut', { powered: true, link: 'obj_chair' }),
  o('obj_chair', 'Desk chair', 'Chair', 'chair', [0.5, 0.92, 0.5], [0.88, -0.95], P / 2, 'Black mesh', { link: 'obj_study_table', small: true }),
  o('obj_side_table', 'Side cabinet', 'Cabinet', 'cabinet', [0.45, 0.66, 0.45], [1.47, -0.15], -P / 2, 'Walnut', { small: true }),
  o('obj_dressing_table', 'Dressing table', 'Dressing table', 'dresser', [0.76, 1.4, 0.4], [1.48, 0.5], -P / 2, 'Walnut, mirror'),
  o('obj_dressing_stool', 'Stool', 'Stool', 'stool', [0.32, 0.4, 0.32], [1.02, 0.5], 0, 'Cane', { small: true }),
  o('obj_laundry', 'Laundry hamper', 'Hamper', 'hamper', [0.43, 0.68, 0.43], [1.46, 1.25], 0, 'Rattan', { small: true }),
  o('obj_clutter', 'Storage boxes', 'Boxes', 'clutter', [0.81, 0.52, 0.46], [0.76, 1.3], 0.1, 'Cardboard', { small: true }),
  o('obj_pedestal_fan', 'Pedestal fan', 'Fan', 'fan', [0.5, 1.5, 0.5], [-0.22, 1.42], 2.67, 'White', { powered: true, small: true }),
  // Not in the room yet: stand-ins taken from the references
  o('added_mat', 'Yoga mat', 'Mat', 'carpet', [1.8, 0.01, 0.6], [0.3, -0.2], 0, 'Sage', { inRoom: false, origin: 'suggested', flat: true, model: 'mat', src: 'photo' }),
  o('added_lounge', 'Lounge chair', 'Chair', 'lounge', [0.8, 0.85, 0.85], [1.28, -1.28], -0.785, 'Oat linen', { inRoom: false, origin: 'suggested', model: 'lounge', src: 'photo' }),
  o('added_lamp', 'Floor lamp', 'Lamp', 'lamp', [0.38, 1.5, 0.38], [0.9, -1.4], 0, 'Brass', { inRoom: false, origin: 'suggested', model: 'floor_lamp', powered: true, small: true, src: 'photo' }),
  o('added_plant', 'Plant', 'Plant', 'plant', [0.4, 0.9, 0.4], [0.3, 1.4], 0, 'Terracotta pot', { inRoom: false, origin: 'suggested', model: 'plant', small: true, src: 'photo' }),
];
/** What Add can bring in (the prepared set, DEC-001). */
export const PREPARED: Record<string, Obj> = {
  gallery: o('added_shelf', 'Bookshelf', 'Shelf', 'shelf', [0.8, 1.6, 0.3], [0, 0], 0, 'Oak', { inRoom: false, origin: 'added', model: 'bookcase', src: 'photo', isNew: true }),
  link: o('added_rug', 'Jute rug', 'Rug', 'carpet', [1.6, 0.02, 1.1], [0, 0], 0, 'Jute', { inRoom: false, origin: 'added', flat: true, model: 'carpet', src: 'page', isNew: true }),
  poster: o('added_poster', 'World map poster', 'Poster', 'generic', [0.9, 0.62, 0.02], [0, 0], 0, 'Paper', { inRoom: false, origin: 'added', flat: true, wall: true, y: 1.45, model: 'poster', src: 'photo', isNew: true }),
  camera: o('added_beanbag', 'Bean bag', 'Chair', 'beanbag', [0.8, 0.6, 0.8], [0, 0], 0, 'Mustard', { inRoom: false, origin: 'added', model: 'beanbag', src: 'photo', isNew: true }),
};
export const TYPES = ['Poster', 'Desk', 'Chair', 'Bed', 'Cabinet', 'Shelf', 'Rug', 'Mat', 'Lamp', 'Plant', 'Fan', 'Hamper', 'Boxes', 'Stool', 'Dressing table'];
export const FINISHES = ['Warm oak', 'Walnut', 'Terracotta', 'Sage', 'Oat linen', 'Charcoal'];

export const FIXED: Fixed[] = [
  { id: 'door', name: 'Door', pos: [0, 1.2, -1.66], state: 'ok' },
  { id: 'wardrobe', name: 'Built-in wardrobe', pos: [-1.3, 1.5, -1.3], state: 'ok' },
  { id: 'win1', name: 'Window 1', pos: [-0.92, 1.3, 1.66], state: 'ok' },
  { id: 'win2', name: 'Window 2', pos: [0.92, 1.3, 1.66], state: 'ok' },
  { id: 'ac', name: 'Split AC', pos: [-0.92, 2.38, 1.56], state: 'ok' },
  { id: 'plugA', name: 'Plug by the door', pos: [0.86, 1.15, -1.66], state: 'ok' },
  { id: 'plugB', name: 'Plug between the windows', pos: [0, 0.95, 1.66], state: 'unsure', unsure: 'Is this a plug?' },
  { id: 'tube', name: 'Tube light', pos: [1.66, 2.45, 0], state: 'ok' },
];
export const FIXED_TYPES = ['Plug', 'Light switch', 'Window', 'Door', 'Light', 'Vent'];

export const ACTIVITIES = ['Working or studying', 'Resting', 'Exercising', 'Relaxing', 'Gaming', 'Getting ready', 'Hosting friends', 'Keeping plants'];
export const PRIORITIES: [string, string][] = [
  ['Privacy', "We'll watch what can be seen from the door."],
  ['Natural light', "We'll keep your desk near a window."],
  ['Restful sleep', "We'll keep the AC off your pillow."],
  ['Open floor', "We'll keep a clear patch in the middle."],
  ['Fresh air', "We'll keep the windows free."],
  ['Easy storage access', "We'll keep doors and drawers clear."],
];
export const PRESETS: { id: string; name: string; colors: string[] }[] = [
  { id: 'warm', name: 'Warm minimal', colors: ['#c98d6b', '#f3eadc', '#8a5a3c', '#dfe8cc'] },
  { id: 'cool', name: 'Cool pastel', colors: ['#a9d6ea', '#f8d6de', '#dfe8cc', '#fbf7f1'] },
  { id: 'earth', name: 'Earthy boho', colors: ['#a3361f', '#f7dd85', '#4f6b3a', '#e8dccb'] },
  { id: 'mono', name: 'Quiet mono', colors: ['#2b2522', '#786c65', '#d9cab5', '#fbf7f1'] },
];
export const DEFAULT_PREFS: Prefs = { given: false, name: "Aarav's room", refs: [], preset: 'warm', main: [], some: [], priorities: [], words: [] };

/* ---------------- geometry ---------------- */
type Rect = [number, number, number, number]; // x0 x1 z0 z1
export const ext = (b: Pick<Obj, 'dims' | 'rot'>) => {
  const [w, , d] = b.dims, c = Math.abs(Math.cos(b.rot)), s = Math.abs(Math.sin(b.rot));
  return { hx: (c * w + s * d) / 2, hz: (s * w + c * d) / 2 };
};
export const rect = (b: Pick<Obj, 'dims' | 'rot' | 'at'>): Rect => { const e = ext(b); return [b.at[0] - e.hx, b.at[0] + e.hx, b.at[1] - e.hz, b.at[1] + e.hz]; };
const hit = (a: Rect, b: Rect, pad = 0) => a[0] < b[1] - pad && a[1] > b[0] + pad && a[2] < b[3] - pad && a[3] > b[2] + pad;
const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const distRect = (r: Rect, p: number[]) => Math.hypot(Math.max(r[0] - p[0], 0, p[0] - r[1]), Math.max(r[2] - p[1], 0, p[1] - r[3]));
const segHits = (a: number[], b: number[], r: Rect) => { for (let i = 1; i < 20; i++) { const t = i / 20, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; if (x > r[0] && x < r[1] && z > r[2] && z < r[3]) return true; } return false; };
const local = (b: Obj, lx: number, lz: number): [number, number] => [b.at[0] + lx * Math.cos(b.rot) + lz * Math.sin(b.rot), b.at[1] - lx * Math.sin(b.rot) + lz * Math.cos(b.rot)];

const WARDROBE: Rect = [-1.7, -0.75, -1.7, -1.12];
const WARD_FRONT: Rect = [-1.7, -0.75, -1.12, -0.55];
const DOOR_SWING: Rect = [-0.5, 0.5, -1.7, -0.8];
const WINS: [string, Rect, number[]][] = [['window 1', [-1.4, -0.5, 1.3, 1.7], [-0.92, 1.7]], ['window 2', [0.4, 1.45, 1.3, 1.7], [0.92, 1.7]]];
const DOOR = [0, -1.6], AC = [-0.92, 1.56];
/** Someone at the door stands just outside, on its centre line, and sees only through the 0.88 m opening (less the frame). A corner beside the door is out of sight [OPEN OI-111]. */
const seenFromDoor = (pt: number[], tall: Obj[]) => {
  const v = [0, -2.1], t = (-1.7 - v[1]) / (pt[1] - v[1]), x = v[0] + t * (pt[0] - v[0]);
  return t > 0 && Math.abs(x) <= 0.41 && !tall.some((o) => segHits(v, pt, rect(o)));
};
export const PLUGS: Record<string, [number, number, number]> = { plugA: [0.86, 1.15, -1.67], plugB: [0, 0.95, 1.68] };
export const ZONES: { id: string; r: Rect }[] = [{ id: 'door', r: DOOR_SWING }, { id: 'wardrobe', r: WARD_FRONT }];

/** Keeps a box in the room and off the wardrobe; snaps flush to walls. Silent (DEC-020). */
/** Does the footprint cover more than half of the window's width? A slim lamp leaves the window open. */
const blocksWindow = (r: Rect, strip: Rect) => Math.max(0, Math.min(r[1], strip[1]) - Math.max(r[0], strip[0])) / (strip[1] - strip[0]) > 0.5;
export const place = (x: number, z: number, b: Pick<Obj, 'dims' | 'rot'>): [number, number] => {
  const p = computePlacement(x, z, b.dims, b.rot);
  const e = ext(b);
  if (p.x - e.hx < WARDROBE[1] && p.z - e.hz < WARDROBE[3]) {
    if (WARDROBE[1] - (p.x - e.hx) < WARDROBE[3] - (p.z - e.hz)) p.x = WARDROBE[1] + e.hx; else p.z = WARDROBE[3] + e.hz;
  }
  return [p.x, p.z];
};
/** The solid thing this object would overlap, if any. Flat things lie under furniture and a linked pair may tuck together. */
export const overlapOf = (b: Obj, objs: Obj[]): Obj | undefined =>
  !b.flat ? objs.find((x) => x.inRoom && x.id !== b.id && x.id !== b.link && x.link !== b.id && !x.flat && hit(rect(b), rect(x), 0.06)) : undefined;
/** Slides a dropped object off anything solid it overlaps. A chair may tuck into its desk; flat things lie under furniture. */
export const settle = (b: Obj, objs: Obj[]): [number, number] => {
  let at = b.at;
  if (b.flat) return at;
  for (let n = 0; n < 4; n++) {
    const r = rect({ ...b, at });
    const other = objs.find((x) => x.inRoom && x.id !== b.id && x.id !== b.link && !x.flat && hit(r, rect(x), 0.04));
    if (!other) break;
    const q = rect(other), e = ext(b);
    const moves: [number, number, number][] = [[q[0] - e.hx, at[1], Math.abs(q[0] - e.hx - at[0])], [q[1] + e.hx, at[1], Math.abs(q[1] + e.hx - at[0])], [at[0], q[2] - e.hz, Math.abs(q[2] - e.hz - at[1])], [at[0], q[3] + e.hz, Math.abs(q[3] + e.hz - at[1])]];
    const ok = moves.filter((m) => Math.abs(m[0]) + e.hx <= 1.701 && Math.abs(m[1]) + e.hz <= 1.701).sort((a, c) => a[2] - c[2])[0];
    if (!ok) break;
    at = place(ok[0], ok[1], b);
  }
  return at;
};

/* ---------------- what is watched ---------------- */
export const watched = (p: Prefs) => {
  const has = (s: string) => p.priorities.includes(s);
  const act = (s: string) => p.main.includes(s) || p.some.includes(s);
  return {
    privacy: has('Privacy') ? 'You chose Privacy.' : p.words.includes('privacy') ? 'From what you wrote: you take calls here.' : '',
    light: has('Natural light') ? 'You chose Natural light.' : act('Working or studying') ? 'You work or study here.' : '',
    sleep: has('Restful sleep') ? 'You chose Restful sleep.' : '',
    floor: has('Open floor') ? 'You chose Open floor.' : act('Exercising') ? 'You exercise here.' : '',
    relax: act('Relaxing') ? 'You relax here.' : '',
    quiet: (rule: string) => (rule === 'light' && !has('Natural light') && !p.main.includes('Working or studying')) || (rule === 'floor' && !has('Open floor') && !p.main.includes('Exercising')) || (rule === 'relax' && !p.main.includes('Relaxing')),
  };
};
const same = (a: Obj, b?: Obj) => !!b && a.inRoom === b.inRoom && Math.abs(a.at[0] - b.at[0]) < 0.01 && Math.abs(a.at[1] - b.at[1]) < 0.01 && Math.abs(a.rot - b.rot) < 0.01;
export const sig = (b: Obj) => `${b.at[0].toFixed(1)},${b.at[1].toFixed(1)},${b.rot.toFixed(1)},${b.dims.join('x')}`;

export const runChecks = (objs: Obj[], prefs: Prefs, fixed: Fixed[]): Check[] => {
  const out: Check[] = [];
  const room = objs.filter((b) => b.inRoom);
  const w = watched(prefs);
  const fx = (id: string) => fixed.find((f) => f.id === id);
  const add = (b: Obj, rule: string, kind: Check['kind'], text: string, why?: string, more: Partial<Check> = {}) =>
    out.push({ key: `${rule}:${b.id}`, obj: b.id, rule, kind, text, why, before: same(b, START.find((s) => s.id === b.id)), quiet: kind === 'pref' && w.quiet(rule), ...more });
  for (const b of room) {
    const r = rect(b);
    const hitter = !b.flat && room.find((x) => x.id !== b.id && x.id !== b.link && x.link !== b.id && !x.flat && hit(r, rect(x), 0.06));
    if (hitter) add(b, 'clash', 'fact', `This overlaps the ${hitter.name.toLowerCase()}.`, undefined, { m: `its footprint overlaps the ${hitter.name.toLowerCase()}'s` });
    if (!b.flat && hit(r, DOOR_SWING, 0.03)) add(b, 'door', 'fact', "This would be in the door's way.", undefined, { m: 'its footprint overlaps the area the door swings through' });
    if (!b.flat && hit(r, WARD_FRONT, 0.03)) add(b, 'wardrobe', 'fact', "The wardrobe doors wouldn't open freely.", undefined, { m: 'its footprint is inside the 0.57 m strip in front of the wardrobe' });
    if (b.dims[1] > 1.05) for (const [name, strip] of WINS) if (hit(r, strip, 0.03) && blocksWindow(r, strip)) add(b, 'window', 'fact', `This would block ${name}.`, undefined, { m: `it is ${b.dims[1].toFixed(2)} m tall, above the 1.05 m sill line, and stands in the 0.40 m strip in front of ${name}` });
    if (b.powered) {
      const usable = Object.keys(PLUGS).filter((id) => fx(id)?.state !== 'gone' && !fx(id)?.notPlug);
      const hider = (id: string) => room.find((x) => x.id !== b.id && x.dims[1] >= PLUGS[id][1] + 0.05 && distRect(rect(x), [PLUGS[id][0], PLUGS[id][2]]) < 0.2);
      const free = usable.filter((id) => !hider(id)).map((id) => dist(b.at, [PLUGS[id][0], PLUGS[id][2]]));
      if (!free.length || Math.min(...free) > 2.0) {
        const near = usable.find((id) => hider(id) && dist(b.at, [PLUGS[id][0], PLUGS[id][2]]) <= 2.0);
        const h = near ? hider(near)! : null, unsure = near ? fx(near)?.state === 'unsure' : false;
        if (h) add(b, 'plug', 'fact', unsure ? `If that's a plug between the windows, it's behind the ${h.name.toLowerCase()}.` : `The plug between the windows is behind the ${h.name.toLowerCase()}.`, undefined, { hedge: unsure, quiet: unsure, m: `plug B is ${dist(b.at, [PLUGS[near!][0], PLUGS[near!][2]]).toFixed(2)} m away but the ${h.name.toLowerCase()} stands in front of it; the nearest free plug is ${free.length ? Math.min(...free).toFixed(2) : 'none'} m away; reach limit 2.00 m` });
        else add(b, 'plug', 'fact', 'The nearest free plug is a long way off.', undefined, { m: `nearest free plug ${free.length ? Math.min(...free).toFixed(2) + ' m' : 'none'}; reach limit 2.00 m` });
      }
    }
    if (b.id === 'obj_study_table') {
      if (w.privacy && seenFromDoor(b.at, room.filter((x) => x.id !== b.id && x.dims[1] >= 1.5))) add(b, 'privacy', 'pref', 'From the door, your desk would be in view.', w.privacy, { m: `clear line of sight through the door opening to the desk, ${dist(DOOR, b.at).toFixed(2)} m, nothing 1.50 m or taller in between` });
      if (w.light && Math.min(...WINS.map((x) => dist(b.at, x[2]))) > 1.5) add(b, 'light', 'pref', 'Your desk would be far from daylight.', w.light, { m: `nearest window ${Math.min(...WINS.map((x) => dist(b.at, x[2]))).toFixed(2)} m; limit 1.50 m` });
    }
    if (b.id === 'obj_bed' && w.sleep && dist(local(b, 0, -0.8), AC) < 1.2) add(b, 'sleep', 'pref', 'The AC would blow straight at your pillow.', w.sleep, { m: `pillow to AC ${dist(local(b, 0, -0.8), AC).toFixed(2)} m; limit 1.20 m; turning the bed round clears it` });
    if (w.floor && !b.flat && Math.abs(b.at[0] - 0.1) < 0.6 && Math.abs(b.at[1] + 0.1) < 0.6) add(b, 'floor', 'pref', "There's no clear space for your mat here.", w.floor, { m: 'it stands in the 1.80 x 0.90 m patch kept clear in the middle of the floor' });
    if (w.relax && b.id === 'added_lounge' && !room.some((x) => x.id === 'added_lamp' && dist(x.at, b.at) < 1.2)) add(b, 'relax', 'pref', "There's no soft light by your chair.", w.relax, { m: 'no lamp within 1.20 m of the chair' });
  }
  const order = ['clash', 'door', 'wardrobe', 'plug', 'window', ...prefs.priorities.map((p) => ({ Privacy: 'privacy', 'Natural light': 'light', 'Restful sleep': 'sleep', 'Open floor': 'floor' } as Record<string, string>)[p] || ''), 'privacy', 'light', 'sleep', 'floor', 'relax'];
  return out.sort((a, b) => order.indexOf(a.rule) - order.indexOf(b.rule));
};

/** The one signal to show while dragging (DEC-041): the most serious relationship in reach. */
/** One signal at a time while dragging, the most serious first, room facts before preferences (DEC-041):
 *  floor zone (door swing, wardrobe front) > window blocked > plug connection > window still open > sightline (only if Privacy was picked). */
export const signalFor = (b: Obj, objs: Obj[], fixed: Fixed[], prefs?: Prefs) => {
  const r = rect(b);
  const hitter = !b.flat && objs.find((x) => x.inRoom && x.id !== b.id && x.id !== b.link && x.link !== b.id && !x.flat && hit(r, rect(x), 0.06));
  if (hitter) return { hot: true, tone: 'problem', text: `Overlaps the ${hitter.name.toLowerCase()}` };
  for (const z of ZONES) if (!b.flat && hit(r, [z.r[0] - 0.35, z.r[1] + 0.35, z.r[2] - 0.35, z.r[3] + 0.35])) return { zone: z.r, hot: hit(r, z.r, 0.03), text: z.id === 'door' ? "Door's swing" : 'Wardrobe front' };
  // Window: its frame glows while the object leaves it open, and turns red when the object would block it
  let win: { frame: [number, number, number]; hot: boolean; text: string } | null = null;
  if (!b.flat) for (const [name, strip, c] of WINS) if (hit(r, [strip[0] - 0.3, strip[1] + 0.3, strip[2] - 0.3, strip[3] + 0.3])) {
    const hot = b.dims[1] > 1.05 && hit(r, strip, 0.03) && blocksWindow(r, strip), label = name[0].toUpperCase() + name.slice(1);
    win = { frame: [c[0], 1.3, c[1]], hot, text: hot ? `${label}, blocked` : `${label}, still open` }; break;
  }
  if (win?.hot) return win;
  if (b.powered) {
    const usable = Object.keys(PLUGS).filter((id) => { const f = fixed.find((q) => q.id === id); return f?.state !== 'gone' && !f?.notPlug; });
    const best = usable.map((id) => ({ id, d: dist(b.at, [PLUGS[id][0], PLUGS[id][2]]) })).sort((a, c) => a.d - c.d)[0];
    if (best) {
      const hidden = objs.some((x) => x.inRoom && x.id !== b.id && x.dims[1] >= PLUGS[best.id][1] + 0.05 && distRect(rect(x), [PLUGS[best.id][0], PLUGS[best.id][2]]) < 0.2);
      const tone = hidden || best.d > 2 ? 'problem' : best.d > 1.5 ? 'stretch' : 'fine';
      return { line: PLUGS[best.id], ring: true, tone, text: tone === 'fine' ? 'Plug, in reach' : hidden ? 'Plug, hidden' : tone === 'stretch' ? 'Plug, a stretch' : 'Plug, a long way' };
    }
  }
  if (win) return win;
  // Sightline: a soft ray from the door to the desk; interrupted when something tall is in between
  if (prefs && watched(prefs).privacy && b.id === 'obj_study_table') {
    const seen = seenFromDoor(b.at, objs.filter((x) => x.inRoom && x.id !== b.id && x.dims[1] >= 1.5));
    return { line: [DOOR[0], 1.2, DOOR[1] - 0.06] as [number, number, number], tone: seen ? 'stretch' : 'fine', text: seen ? 'In view from the door' : 'Out of view from the door' };
  }
  return null;
};

/* ---------------- Show options (AI-04) ---------------- */
// Where things can go. Furniture mostly lives against a wall, so wall and corner spots come first; the open middle is only for flat things (mats, rugs) or when little else is free.
const SPOTS: [number, number, number][] = [[0.745, 1.18, P], [1.4, -0.95, -P / 2], [1.4, 0.4, -P / 2], [-1.25, -0.25, P / 2], [1.2, -1.3, -P / 2], [0.3, 1.35, P], [-0.9, 1.2, P]];
const WALL_SPOTS: [number, number, number][] = [
  ...[-1.1, -0.5, 0.5, 1.1].map((x): [number, number, number] => [x, -1.7, 0]),          // north wall, facing in
  ...[-1.2, -0.6, 0.1, 0.6, 1.2].map((x): [number, number, number] => [x, 1.7, P]),      // south wall
  ...[-1.0, -0.4, 0.2, 0.8, 1.3].map((z): [number, number, number] => [1.7, z, -P / 2]), // east wall
  ...[-1.0, -0.4, 0.2, 0.8, 1.3].map((z): [number, number, number] => [-1.7, z, P / 2]), // west wall
  [1.7, 1.7, -P / 2], [-1.7, 1.7, P / 2], [1.7, -1.7, -P / 2], [-1.7, -1.7, P / 2],       // corners
];
const MIDDLE_SPOTS: [number, number, number][] = [[-0.1, -0.2, 0], [-0.3, 0.6, 0], [0.6, -0.6, 0]];
export const optionsFor = (id: string, objs: Obj[], prefs: Prefs, fixed: Fixed[]): Option[] => optionCandidates(id, objs, prefs, fixed).slice(0, 2);
export const optionCandidates = (id: string, objs: Obj[], prefs: Prefs, fixed: Fixed[]): Option[] => {
  const b = objs.find((x) => x.id === id);
  if (!b) return [];
  type Mx = { winD: number; plugD: number; seen: boolean; lat: number; facts: string[]; prefs: string[] };
  type Cand = Omit<Option, 'n' | 'key'> & { score: number; mx: Mx };
  const make = ([x, z, rot]: [number, number, number]): Cand | null => {
    const trial = { ...b, rot: b.flat ? 0 : rot, inRoom: true };
    trial.at = place(x, z, trial);
    if (b.inRoom && dist(trial.at, b.at) < 0.35) return null;
    const clash = b.flat ? [] : objs.filter((q) => q.inRoom && q.id !== b.id && q.id !== b.link && !q.flat && hit(rect(trial), rect(q), 0.05));
    if (clash.length > 1 || (clash[0] && !clash[0].small)) return null;
    const also = clash[0];
    const next = objs.map((q) => (q.id === b.id ? trial : also && q.id === also.id ? { ...q, inRoom: false } : q));
    const cs = runChecks(next, prefs, fixed).filter((c) => c.obj === b.id);
    const parts = [also ? `Only if the ${also.name.toLowerCase()} go${also.name.endsWith('s') ? '' : 'es'} to Assets.` : '', cs[0] ? cs[0].text : ''].filter(Boolean);
    const tall = objs.filter((q) => q.inRoom && q.id !== b.id && q.dims[1] >= 1.5);
    const mx: Mx = {
      winD: Math.min(...WINS.map((q) => dist(trial.at, q[2]))), plugD: Math.min(...Object.values(PLUGS).map((q) => dist(trial.at, [q[0], q[2]]))),
      seen: seenFromDoor(trial.at, tall), lat: Math.abs((trial.at[0] * 0.4) / (trial.at[1] + 2.1)), // how far off the line through the door it sits: smaller is more in line
      facts: cs.filter((c) => c.kind === 'fact').map((c) => c.rule), prefs: cs.filter((c) => c.kind === 'pref').map((c) => c.rule),
    };
    const m = [`nearest window ${Math.min(...WINS.map((q) => dist(trial.at, q[2]))).toFixed(2)} m`, b.powered ? `nearest plug ${Math.min(...Object.values(PLUGS).map((q) => dist(trial.at, [q[0], q[2]]))).toFixed(2)} m` : '', `${dist(trial.at, DOOR).toFixed(2)} m from the door`].filter(Boolean).join(', ');
    return { where: where(trial), m, findings: cs.map((c) => c.text), at: trial.at, rot: trial.rot, cost: parts.join(' ') || 'Takes a little floor. Nothing else we can see.', also: also?.id, alsoName: also?.name.toLowerCase(), score: cs.reduce((n, c) => n + (c.kind === 'fact' ? 3 : 1), 0) + (also ? 1 : 0), mx }; // a room fact (door, wardrobe, window, plug) costs more than a preference
  };
  // Rank every spot by what it costs. The open middle starts half a step behind for furniture (and ahead for flat things), and each kind of place appears once
  const ranked = [...[...SPOTS, ...WALL_SPOTS].map(make), ...MIDDLE_SPOTS.map((sp) => { const o = make(sp); return o ? { ...o, score: o.score + (b.flat ? -0.5 : 0.5) } : o; })]
    .filter((o): o is Cand => !!o).sort((x, y) => x.score - y.score);
  const out: Cand[] = [];
  for (const o of ranked) if (out.length < 6 && !out.some((q) => dist(q.at, o.at) < 0.5 || (!b.flat && q.where === o.where))) out.push(o);
  // The words: the first spot says what it gives (or that nothing is in the way); the others say how they differ from it
  const FACT: Record<string, string> = { door: "In the door's way", wardrobe: 'Blocks the wardrobe doors', window: 'Blocks the window', plug: 'Plug out of reach', clash: 'Overlaps something' };
  const PREF: Record<string, string> = { light: 'farther from daylight', privacy: 'in view from the door', floor: 'uses your open floor', sleep: 'the AC blows at the pillow', relax: 'no lamp nearby' };
  const privacyOn = b.id === 'obj_study_table' && !!watched(prefs).privacy;
  const say = (o: Cand, ref?: Cand) => {
    const m = o.mx, facts = m.facts.slice(0, 2).map((r) => FACT[r] ?? 'Something in the way');
    const pref = m.prefs.find((r) => PREF[r]);
    if (!ref) { // the first spot: what it gives, or that nothing is in the way
      if (facts.length || o.also) return [...facts, ...(o.also ? [`Needs the ${o.alsoName} out`] : [])].join('. ') + '.';
      return 'Best fit: nothing in the way.' + (pref ? ` Heads up: ${PREF[pref]}.` : '');
    }
    const r = ref.mx, pos: string[] = [], neg: string[] = [...facts.map((f) => f.toLowerCase())];
    if (privacyOn) {
      if (r.seen && !m.seen) pos.push("out of the door's view"); else if (r.seen && m.seen && m.lat > r.lat + 0.015) pos.push('less in line with the door');
      else if (!r.seen && m.seen) neg.push('in view from the door'); else if (r.seen && m.seen && m.lat < r.lat - 0.015) neg.push('more in line with the door');
    }
    if (m.winD < r.winD - 0.4) pos.push('closer to daylight'); else if (m.winD > r.winD + 0.4) neg.push('farther from daylight');
    if (b.powered) { if (m.plugD < r.plugD - 0.4) pos.push('nearer a plug'); else if (m.plugD > r.plugD + 0.4) neg.push('farther from a plug'); }
    if (o.also) neg.push(`needs the ${o.alsoName} out`);
    const heads = neg[0] ?? (privacyOn && m.seen ? 'still in view from the door' : pref ? PREF[pref] : '');
    if (pos.length) return `Better placed: ${pos.slice(0, 2).join(', ')}.` + (heads ? ` Heads up: ${heads}.` : '');
    if (neg.length) return `Trade-off: ${neg.slice(0, 2).join(', ')}.`;
    return 'Much the same fit, in another place.';
  };
  return out.map((o, i) => ({ ...o, n: i + 1, key: 's' + (i + 1), cost: say(o, i ? out[0] : undefined) }));
};

/** A spot with nothing against it: one short, honest line of encouragement. */
export const praise = (b: Obj, objs: Obj[], prefs: Prefs): string => {
  const why: string[] = [];
  if (b.powered && Math.min(...Object.values(PLUGS).map((q) => dist(b.at, [q[0], q[2]]))) < 1.5) why.push('a plug in reach');
  if (!b.flat && Math.min(...WINS.map((q) => dist(b.at, q[2]))) < 1.5) why.push('daylight close by');
  if (b.id === 'obj_study_table' && watched(prefs).privacy && !seenFromDoor(b.at, objs.filter((x) => x.inRoom && x.id !== b.id && x.dims[1] >= 1.5))) why.push("out of the door's view");
  const t = why.slice(0, 2).join(' and ');
  return t ? `Good spot. ${t[0].toUpperCase() + t.slice(1)}.` : 'Good spot. Nothing in the way.';
};

/** Things that hang: flush against the nearest wall (clamped along it), facing into the room. */
export const wallSnap = (at: [number, number], dims: Dims): [number, number] => {
  const H = 1.7, hw = dims[0] / 2, t = dims[2] / 2, clampX = Math.max(-H + hw, Math.min(H - hw, at[0])), clampZ = Math.max(-H + hw, Math.min(H - hw, at[1]));
  const d = [H - at[0], H + at[0], H - at[1], H + at[1]], i = d.indexOf(Math.min(...d)); // east, west, south, north
  return i === 0 ? [H - t, clampZ] : i === 1 ? [-H + t, clampZ] : i === 2 ? [clampX, H - t] : [clampX, -H + t];
};
export const wallRot = (at: [number, number]): number => { const d = [1.7 - at[0], 1.7 + at[0], 1.7 - at[1], 1.7 + at[1]], i = d.indexOf(Math.min(...d)); return [-P / 2, P / 2, P, 0][i]; };

/* ---------------- Spots for several things at once ---------------- */
const ALIASES: [string, RegExp][] = [
  ['obj_dressing_stool', /\bstool\b/], ['obj_dressing_table', /dressing table|dresser|vanity/], ['obj_side_table', /side (table|cabinet)|bedside|cabinet/],
  ['added_lounge', /lounge( chair)?|armchair/], ['obj_chair', /desk chair|office chair|\bchair\b/], ['obj_study_table', /study (desk|table)|\bdesk\b/],
  ['obj_laundry', /laundry|hamper|basket/], ['obj_clutter', /(storage )?boxes/], ['obj_pedestal_fan', /\bfan\b/], ['obj_bed', /\bbed\b/],
  ['added_mat', /yoga|\bmat\b/], ['added_lamp', /lamp/], ['added_plant', /plant/], ['added_shelf', /book ?shelf|shelf/], ['added_rug', /\brug\b/], ['added_beanbag', /bean ?bag/], ['added_poster', /poster|world map|\bmap\b|picture/],
];
/** "Suggest positions for the dressing table, the laundry basket and the side table": the things named, in the order they were named. Two or more. */
export const multiIntent = (text: string, objs: Obj[]): string[] | null => {
  let rest = text.toLowerCase();
  if (!/suggest|where|position|place|arrange|put|spot|layout|set up|move|fit/.test(rest)) return null;
  const hits: { id: string; at: number }[] = [];
  for (const [id, re] of ALIASES) {
    const m = re.exec(rest);
    if (m && objs.some((o) => o.id === id) && !hits.some((h) => h.id === id)) { hits.push({ id, at: m.index }); rest = rest.replace(re, (x) => ' '.repeat(x.length)); }
  }
  return hits.length >= 2 ? hits.sort((a, b) => a.at - b.at).map((h) => h.id) : null;
};
/** The space between two things' edges, in metres (0 when they touch or overlap). */
const gapBetween = (a: Obj, b: Obj) => { const r = rect(a), q = rect(b); return Math.hypot(Math.max(r[0] - q[1], q[0] - r[1], 0), Math.max(r[2] - q[3], q[2] - r[3], 0)); };
const lastWord = (n: string) => { const w = n.trim().toLowerCase().split(/\s+/); return w[w.length - 1]; };
const cap1 = (t: string) => t[0].toUpperCase() + t.slice(1);
/** One proposal for all of them: each gets a free spot, one after another, so no two proposed spots overlap.
 *  Where the room's own logic says so: the dressing table goes in the gap between the bed's foot and the windows (when the bed is along the
 *  west wall and there is a gap), the laundry hamper beside the dressing table, the side cabinet on the east wall. Each row says why. */
export const multiProposal = (ids: string[], objs: Obj[], prefs: Prefs, fixed: Fixed[]): { proposal: Proposal; text: string } | null => {
  // The things being placed start out of the way, so their old spots are free for each other
  const wasIn = Object.fromEntries(ids.map((i) => [i, !!objs.find((o) => o.id === i)?.inRoom]));
  let cur = objs.map((o) => (ids.includes(o.id) ? { ...o, inRoom: false } : { ...o }));
  const done: Record<string, Change> = {}, left: string[] = [];
  const put = (id: string, at: [number, number], rot: number, note?: string) => { done[id] = { id, at, rot, add: !wasIn[id], ...(note ? { note } : {}) }; cur = cur.map((x) => (x.id === id ? { ...x, at, rot, inRoom: true } : x)); };
  /** A spot we want, if it is free */
  const tryAt = (id: string, x: number, z: number, rot: number): [number, number] | null => {
    const o = cur.find((q) => q.id === id)!, at = place(x, z, { dims: o.dims, rot });
    return overlapOf({ ...o, at, rot, inRoom: true }, cur) ? null : at;
  };
  const bed = cur.find((x) => x.id === 'obj_bed' && x.inRoom);
  const gap = bed && bed.at[0] < -0.9 ? 1.7 - (bed.at[1] + ext(bed).hz) : 0; // free floor between the bed's foot and the windows
  const custom: string[] = [];
  if (ids.includes('obj_dressing_table')) {
    const dt = cur.find((q) => q.id === 'obj_dressing_table')!;
    const at = bed && gap >= dt.dims[2] + 0.2 ? tryAt(dt.id, bed.at[0], 1.7, Math.PI) : null;
    if (at) { put(dt.id, at, Math.PI, 'Fills the gap between the bed and the window.'); custom.push(dt.id); }
  }
  if (ids.includes('obj_laundry')) {
    const dt = cur.find((q) => q.id === 'obj_dressing_table' && q.inRoom), h = cur.find((q) => q.id === 'obj_laundry')!;
    if (dt) for (const side of [1, -1]) {
      const at = tryAt(h.id, dt.at[0] + side * (ext(dt).hx + h.dims[0] / 2 + 0.01), dt.at[1], h.rot);
      if (at) { put(h.id, at, h.rot, 'Beside the dressing table, where you change.'); custom.push(h.id); break; }
    }
  }
  if (ids.includes('obj_side_table')) {
    const c0 = cur.find((q) => q.id === 'obj_side_table')!;
    for (const z of [-0.15, 0.25, -0.55, 0.65, -0.9, 1.0]) { const at = tryAt(c0.id, 1.7, z, -Math.PI / 2); if (at) { put(c0.id, at, -Math.PI / 2, 'On the east wall, out of the walkway.'); custom.push(c0.id); break; } }
  }
  for (const id of ids) {
    if (custom.includes(id)) continue;
    const o = cur.find((x) => x.id === id)!;
    if (o.wall) { left.push(o.name.toLowerCase()); continue; } // a poster hangs on a wall: it is placed by hand
    // Furniture goes by a wall where it can: a clean wall or corner spot first, then a clean middle, then the least costly
    const cs = optionCandidates(id, cur, prefs, fixed).filter((x) => !x.also), mid = (x: { where: string }) => x.where === 'in the middle of the room';
    const c = cs.find((x) => !x.findings.length && !mid(x)) ?? cs.find((x) => !x.findings.length) ?? cs.find((x) => !mid(x)) ?? cs[0];
    if (!c) { left.push(o.name.toLowerCase()); continue; }
    put(id, c.at, c.rot);
  }
  // A reason for every row: what the spot sits beside, and where it is (the room's own reasons are written above)
  const changes: Change[] = ids.filter((i) => done[i]).map((id) => {
    if (done[id].note) return done[id];
    const o = cur.find((x) => x.id === id)!, others = cur.filter((x) => x.inRoom && x.id !== id && !x.flat);
    const nearest = others.map((x) => ({ x, g: gapBetween(o, x) })).sort((p1, q1) => p1.g - q1.g)[0];
    return { ...done[id], note: [nearest && nearest.g < 0.7 ? `Beside the ${lastWord(nearest.x.name)}` : '', cap1(where(o))].filter(Boolean).join('. ') + '.' };
  });
  if (!changes.length) return null;
  const names = changes.map((c) => 'the ' + objs.find((o) => o.id === c.id)!.name.toLowerCase());
  const list = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0];
  return { proposal: { title: 'Spots for ' + list, changes, multi: true }, text: `Here are spots for ${list}.${left.length ? ` I couldn't find a free spot for the ${left.join(' or the ')}.` : ''} Look around, and tap a row to see each one. You can drag any of them, or take one out.` };
};

/* ---------------- What to move (FN-01) ---------------- */
export const moveList = (now: Obj[]): string[] => {
  const steps: { b: Obj; from: Obj; text: string; pri: number }[] = [];
  for (const b of now) {
    const from = START.find((s) => s.id === b.id) || { ...b, inRoom: false };
    if (same(b, from)) continue;
    const text = !b.inRoom ? `Take the ${b.name.toLowerCase()} out of the room.` : !from.inRoom ? `Bring in the ${b.name.toLowerCase()} and set it ${where(b)}.`
      : dist(b.at, from.at) < 0.05 ? `Turn the ${b.name.toLowerCase()} where it stands.` : `Move the ${b.name.toLowerCase()} ${where(b)}.`;
    steps.push({ b, from: from as Obj, text, pri: !b.inRoom ? 0 : 1 });
  }
  // Clear a spot before something moves into it
  steps.sort((a, c) => a.pri - c.pri);
  for (let i = 0; i < steps.length; i++) for (let j = i + 1; j < steps.length; j++) {
    const a = steps[i], c = steps[j];
    if (a.b.inRoom && c.from.inRoom && hit(rect(a.b), rect(c.from), 0.05)) { steps.splice(j, 1); steps.splice(i, 0, c); }
  }
  return steps.map((s) => s.text);
};
export const where = (b: Pick<Obj, 'at'>) => {
  const [x, z] = b.at;
  if (z > 0.9 && x > 0.2) return 'under window 2';
  if (z > 0.9 && x < -0.2) return 'under window 1';
  if (z > 0.9) return 'between the windows';
  if (z < -0.8 && x > 0.4) return 'in the corner by the door';
  if (z < -0.5 && x < -0.5) return 'in front of the wardrobe';
  if (z < -0.8) return 'along the north wall';
  if (x > 0.9) return 'against the east wall';
  if (x < -0.9) return 'against the west wall';
  return 'in the middle of the room';
};

/* ---------------- the AI's script (DEC-001: every answer is scripted for this room) ---------------- */
export interface AiMsg { me?: boolean; text: string; proposal?: Proposal; optionsFor?: string; ask?: string[]; link?: { label: string; to: 'eo' | 're' | 'rc' | 'fn' | 'save' | 'add' | 'prefs'; id?: string }; rule?: string }
export const chipsFor = (ctx: string[], checks: Check[], justConfirmed: boolean): string[] => {
  if (justConfirmed && !ctx.length) return ['What do I move first?', 'Save this layout'];
  if (ctx.length > 1) return ['Where would these feel right?', 'Make these match'];
  if (ctx.length === 1) return checks.some((c) => c.obj === ctx[0]) ? ['Why this check?', 'Show options', 'Keep it as is'] : ['Where else could it go?', 'Make it warmer', 'Remove it'];
  return checks.length ? ["What's not working?", 'Put the desk by the window', 'Restyle like my references'] : ['Restyle like my references', 'Where could a reading corner go?', 'Put the desk by the window'];
};
export const reply = (raw: string, ctx: string[], objs: Obj[], checks: Check[], prefs: Prefs): AiMsg => {
  const t = raw.toLowerCase();
  const named = objs.find((b) => t.includes(b.name.toLowerCase()) || t.includes(b.type.toLowerCase() + ' ') || t.endsWith(b.type.toLowerCase()));
  const b = objs.find((x) => x.id === ctx[0]) || named;
  const nm = b ? b.name.toLowerCase() : 'it';
  if (/shop|buy|price|order|amazon|ikea/.test(t)) return { text: "I can't shop for you. If you have a link, add it from Assets.", link: { label: 'Add from a link', to: 'add' } };
  if (/\b(bigger|smaller|size|resize|shape|wider|taller)\b/.test(t) && !/how/.test(t)) return { text: "I can't change its size, but you can correct it in Edit Object.", link: b ? { label: `Edit ${nm}`, to: 'eo', id: b.id } : undefined };
  if (/(move|change|paint|remove) (the |a |my )?(walls?|plugs?|door|windows?|floor|wardrobe|ac)\b/.test(t)) return { text: "I can't change the plug, walls or windows. If we got one wrong, you can fix it in Room edit.", link: { label: 'Open Room edit', to: 're' } };
  if (/how (wide|big|tall|long|deep)/.test(t) && b) return { text: `Your ${nm} is ${Math.round(b.dims[0] * 100)} cm wide, ${Math.round(b.dims[2] * 100)} cm deep and ${Math.round(b.dims[1] * 100)} cm tall. Change it in Edit Object.`, link: { label: `Edit ${nm}`, to: 'eo', id: b.id } };
  if (/calls?\b|meeting/.test(t)) return { text: "Noted. I'll watch what can be seen from the door while you're at your desk.", rule: 'privacy' };
  if (/why/.test(t)) { const c = checks.find((x) => !b || x.obj === b.id); return { text: c ? `${c.text} ${c.why || "That's a fact of the room, not a preference."}` : 'Nothing is open here right now.' }; }
  if (/not working|what.?s wrong|problems?/.test(t)) return checks.length ? { text: `${checks.length} thing${checks.length > 1 ? 's are' : ' is'} open. The first: ${checks[0].text}`, link: { label: 'Open Room Check', to: 'rc' } } : { text: 'Nothing to check right now.' };
  if (/first|what do i move/.test(t)) return { text: 'Here is the order to move things in the real room.', link: { label: 'What to move', to: 'fn' } };
  if (/save/.test(t)) return { text: 'Give this layout a name and it stays in Layouts.', link: { label: 'Save layout', to: 'save' } };
  if (/keep it/.test(t)) return { text: "Kept. I won't raise it again unless something changes." , rule: 'keep' };
  if (/best/.test(t)) return { text: "There isn't one best layout. Here are some options and what each costs.", optionsFor: b?.id || 'obj_study_table' };
  if (/restyle|references|match|warmer|cozy|cosy|feel like/.test(t)) {
    if (b && ctx.length === 1) return { text: `A warmer finish for the ${nm}.`, proposal: { title: `Warmer ${nm}`, changes: [{ id: b.id, finish: 'Terracotta' }] } };
    const ids = (ctx.length > 1 ? ctx : ['obj_bed', 'obj_study_table', 'obj_dressing_table']);
    return { text: `From your ${prefs.refs.length ? 'references' : 'default preset'}: softer colours on the bedding, curtains and furniture. Walls and floor stay.`, proposal: { title: 'Restyle', restyle: true, palette: 'cool_pastel', changes: ids.map((id) => ({ id, finish: 'Soft pastel' })) } };
  }
  if (/remove|get rid|take .*out/.test(t) && b) return { text: `The ${nm} would go to Assets. You can drag it back.`, proposal: { title: `Remove the ${nm}`, changes: [{ id: b.id, remove: true }] } };
  if (/add|reading corner|plant|lamp|mat\b/.test(t) && !/where else/.test(t)) {
    if (/reading|lounge|corner/.test(t)) return { text: 'A lounge chair and a lamp fit the corner by the door.', proposal: { title: 'Reading corner', changes: [{ id: 'added_lounge', add: true, at: [1.28, -1.28], rot: -0.785 }, { id: 'added_lamp', add: true, at: [0.72, -1.48], rot: 0 }] } };
    const id = /lamp/.test(t) ? 'added_lamp' : /mat|yoga/.test(t) ? 'added_mat' : 'added_plant';
    const a = objs.find((x) => x.id === id)!;
    return { text: `A ${a.name.toLowerCase()} from your Suggested items.`, proposal: { title: `Add a ${a.name.toLowerCase()}`, changes: [{ id, add: true, at: place(a.at[0], a.at[1], a), rot: a.rot }] } };
  }
  if (/window/.test(t) && (!b || b.id === 'obj_study_table')) return { text: 'The desk under window 2, facing the light. The storage boxes would go to Assets to make room.', proposal: { title: 'Desk by the window', changes: [{ id: 'obj_study_table', at: [0.745, 1.18], rot: P }, { id: 'obj_chair', at: [0.745, 0.64], rot: 0 }, { id: 'obj_clutter', remove: true }] } };
  if (/where|options|could|go\b/.test(t)) return b ? { text: `A few places the ${nm} could go, and what each costs.`, optionsFor: b.id } : { text: 'Which piece are you thinking about?', ask: ['Study desk', 'Bed', 'Pedestal fan'] };
  if (/^(move it|make it better|fix it|help|change it|improve)/.test(t) || t.length < 9) return b ? { text: `What would you like for the ${nm}?`, ask: ['Where else could it go?', 'Make it warmer', 'Remove it'] } : { text: 'Which piece do you mean?', ask: ['Study desk', 'Bed', 'Pedestal fan'] };
  return { text: "That's outside what I can do here. I can move, add, remove or restyle things in this room." };
};
