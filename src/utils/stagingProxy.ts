import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/*
 * Staging proxies: the simple stand-ins shown while a piece is being repositioned.
 *
 * We cannot count on accurate 3D models from a photo, so the staging view never tries to look like
 * the object. It says three things with a tiny vocabulary of soft primitives (rounded boxes, discs,
 * thin cylinders):
 *   1. how big it is and roughly what shape   → a few primitives per object KIND
 *   2. which way it faces                      → one flat arrow lying on its top surface
 *   3. where it stands                         → a light, soft contact shadow, and the face that
 *                                                 touches a wall flashes when it snaps
 *
 * A new object needs only a kind (a line in KIND_RULES, or nothing: it falls back to one rounded
 * box with the same arrow). The drawing code below is the only place that knows about shapes.
 */

export const ROOM_HALF = 1.7;
export const WALL_SNAP = 0.22;

export const BOX_FREE = 0x7dd3fc;
export const BOX_SNAPPED = 0xffffff;

export type ProxyKind = 'bed' | 'desk' | 'chair' | 'lounge' | 'beanbag' | 'stool' | 'hamper' | 'fan' | 'lamp' | 'plant' | 'shelf' | 'cabinet' | 'dresser' | 'clutter' | 'carpet' | 'generic';

/** First match wins. Ids, types and names all go through the same rules. */
const KIND_RULES: [RegExp, ProxyKind][] = [
  [/poster/, 'generic'],
  [/bean ?bag/, 'beanbag'],
  [/bed/, 'bed'],
  [/lounge|armchair/, 'lounge'],
  [/lamp/, 'lamp'],
  [/plant/, 'plant'],
  [/shelf|bookcase|vertical_storage/, 'shelf'],
  [/dressing(?!.*stool)/, 'dresser'],
  [/stool/, 'stool'],
  [/laundry|hamper|basket/, 'hamper'],
  [/clutter|box/, 'clutter'],
  [/fan/, 'fan'],
  [/chair/, 'chair'],
  [/side|wardrobe|storage|separator|cabinet/, 'cabinet'],
  [/table|desk/, 'desk'],
  [/carpet|rug|\bmat\b/, 'carpet'],
];

export const proxyKindFor = (idOrType: string, name = ''): ProxyKind => {
  const lower = `${idOrType} ${name}`.toLowerCase();
  return KIND_RULES.find(([re]) => re.test(lower))?.[1] ?? 'generic';
};

/** Round from above: their shadow is round too, and the pick volume is a cylinder. */
const ROUND: ProxyKind[] = ['stool', 'hamper', 'fan', 'lamp', 'plant', 'beanbag'];
/** No meaningful front, so no arrow. */
const NO_FRONT: ProxyKind[] = ['stool', 'hamper', 'carpet', 'lamp', 'plant', 'beanbag'];

/* ----- Primitives ---------------------------------------------------------- */

type Segs = number[];
const line = (s: Segs, a: [number, number, number], b: [number, number, number]) => s.push(...a, ...b);

interface Built {
  /** The soft translucent bodies */
  meshes: THREE.Mesh[];
  /** Outline strokes: rounded loops and rings, one colour */
  outline: Segs;
}

const bodyMaterial = () =>
  new THREE.MeshBasicMaterial({ color: BOX_FREE, transparent: true, opacity: 0.17, depthWrite: false });

/** A rounded loop around a rectangle at height y. The soft stand-in for a box's sharp edges. */
const roundedLoop = (s: Segs, cx: number, y: number, cz: number, w: number, d: number, r: number) => {
  const rr = Math.max(0.001, Math.min(r, w / 2, d / 2));
  const steps = 5;
  const pts: [number, number][] = [];
  const corners: [number, number, number][] = [
    [w / 2 - rr, d / 2 - rr, 0],
    [-(w / 2 - rr), d / 2 - rr, Math.PI / 2],
    [-(w / 2 - rr), -(d / 2 - rr), Math.PI],
    [w / 2 - rr, -(d / 2 - rr), (Math.PI * 3) / 2],
  ];
  corners.forEach(([ox, oz, a0]) => {
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (i / steps) * (Math.PI / 2);
      pts.push([ox + Math.cos(a) * rr, oz + Math.sin(a) * rr]);
    }
  });
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    line(s, [cx + p[0], y, cz + p[1]], [cx + q[0], y, cz + q[1]]);
  });
};

const ring = (s: Segs, cx: number, y: number, cz: number, rx: number, rz: number, n = 28) => {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    line(s, [cx + Math.cos(a0) * rx, y, cz + Math.sin(a0) * rz], [cx + Math.cos(a1) * rx, y, cz + Math.sin(a1) * rz]);
  }
};

/** A rounded slab: a soft body, with a rounded outline on its top and bottom. */
const slab = (b: Built, cx: number, cy: number, cz: number, w: number, h: number, d: number, radius = 0.06) => {
  const r = Math.max(0.004, Math.min(radius, w * 0.45, h * 0.45, d * 0.45));
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), bodyMaterial());
  mesh.position.set(cx, cy, cz);
  b.meshes.push(mesh);
  roundedLoop(b.outline, cx, cy + h / 2, cz, w, d, r);
  roundedLoop(b.outline, cx, cy - h / 2, cz, w, d, r);
  // The outline wraps the body: a vertical stroke up each rounded corner joins the top loop to the bottom one
  const rr = Math.max(0.001, Math.min(r, w / 2, d / 2));
  [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => {
    const x = cx + sx * (w / 2 - rr + rr * Math.SQRT1_2), z = cz + sz * (d / 2 - rr + rr * Math.SQRT1_2);
    line(b.outline, [x, cy - h / 2, z], [x, cy + h / 2, z]);
  });
};

/** A disc or tapered cylinder: a soft body, with a ring top and bottom. */
const cyl = (b: Built, cx: number, cy: number, cz: number, rTop: number, rBottom: number, h: number, axis: 'y' | 'z' = 'y') => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, 28), bodyMaterial());
  mesh.position.set(cx, cy, cz);
  if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  b.meshes.push(mesh);
  if (axis === 'y') {
    ring(b.outline, cx, cy + h / 2, cz, rTop, rTop);
    ring(b.outline, cx, cy - h / 2, cz, rBottom, rBottom);
    [0, 1, 2, 3].forEach((i) => { const a = (i * Math.PI) / 2; line(b.outline, [cx + Math.cos(a) * rBottom, cy - h / 2, cz + Math.sin(a) * rBottom], [cx + Math.cos(a) * rTop, cy + h / 2, cz + Math.sin(a) * rTop]); });
  } else {
    // a disc facing the front: its rim in the x-y plane
    for (let i = 0; i < 28; i++) {
      const a0 = (i / 28) * Math.PI * 2;
      const a1 = ((i + 1) / 28) * Math.PI * 2;
      line(b.outline, [cx + Math.cos(a0) * rTop, cy + Math.sin(a0) * rTop, cz + h / 2], [cx + Math.cos(a1) * rTop, cy + Math.sin(a1) * rTop, cz + h / 2]);
    }
  }
};

/** A soft ellipsoid (a bean bag, a plant's leaves): outlined by its equator and two upright rings. */
const blob = (b: Built, cx: number, cy: number, cz: number, rx: number, ry: number, rz: number) => {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), bodyMaterial());
  mesh.scale.set(rx, ry, rz); mesh.position.set(cx, cy, cz); b.meshes.push(mesh);
  ring(b.outline, cx, cy, cz, rx, rz);
  for (const axis of ['x', 'z'] as const) {
    const n = 28;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      const pt = (a: number): [number, number, number] => [cx + (axis === 'x' ? Math.cos(a) * rx : 0), cy + Math.sin(a) * ry, cz + (axis === 'z' ? Math.cos(a) * rz : 0)];
      line(b.outline, pt(a0), pt(a1));
    }
  }
};

/** A thin leg or pole: a soft body only, no outline. */
const leg = (b: Built, x: number, z: number, y0: number, y1: number, radius = 0.022) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, y1 - y0, 12), bodyMaterial());
  mesh.position.set(x, (y0 + y1) / 2, z);
  b.meshes.push(mesh);
};

/** The few primitives that say what this is. Local space: centred, +z is the front. */
const buildShape = (kind: ProxyKind, w: number, h: number, d: number): Built => {
  const b: Built = { meshes: [], outline: [] };
  const yb = -h / 2;
  const yt = h / 2;
  const rx = w / 2;
  const rz = d / 2;
  const corners = (inset: number): [number, number][] => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => [sx * (rx - inset), sz * (rz - inset)]);

  switch (kind) {
    case 'bed': {
      const baseH = Math.min(0.4, h * 0.5);
      slab(b, 0, yb + baseH / 2, 0.04, w, baseH, d - 0.08, 0.07);
      slab(b, 0, 0, -rz + 0.05, w, h, 0.1, 0.05); // headboard: the back
      break;
    }
    case 'desk': {
      slab(b, 0, yt - 0.03, 0, w, 0.06, d, 0.03);
      corners(0.05).forEach(([x, z]) => leg(b, x, z, yb, yt - 0.06));
      break;
    }
    case 'chair': {
      const sy = yb + h * 0.55;
      slab(b, 0, sy, 0, w, 0.06, d, 0.03);
      slab(b, 0, (sy + yt) / 2 + 0.03, -rz + 0.025, w, yt - sy - 0.03, 0.05, 0.025); // backrest: the back
      corners(0.04).forEach(([x, z]) => leg(b, x, z, yb, sy - 0.03, 0.02));
      break;
    }
    case 'lounge': { // a low armchair: thick seat, tall back, two arms, short legs
      const bottom = yb + 0.12;
      slab(b, 0, bottom + 0.1, 0.03, w, 0.2, d - 0.06, 0.07);
      slab(b, 0, (bottom + yt) / 2, -rz + 0.09, w, yt - bottom, 0.16, 0.07); // the back
      [-1, 1].forEach((sx) => slab(b, sx * (rx - 0.06), bottom + 0.25, 0.04, 0.12, 0.3, d - 0.12, 0.05));
      corners(0.1).forEach(([x, z]) => leg(b, x, z, yb, bottom, 0.025));
      break;
    }
    case 'beanbag':
      blob(b, 0, 0, 0, rx, h / 2, rz);
      break;
    case 'lamp': { // a round base, a thin pole and a drum shade
      cyl(b, 0, yb + 0.015, 0, Math.min(rx, 0.16), Math.min(rx, 0.16), 0.03);
      leg(b, 0, 0, yb + 0.03, yt - 0.3, 0.012);
      cyl(b, 0, yt - 0.15, 0, rx * 0.76, rx, 0.3);
      break;
    }
    case 'plant': { // a tapered pot and a rounded crown of leaves
      const pot = Math.min(0.38, h * 0.4);
      cyl(b, 0, yb + pot / 2, 0, rx * 0.8, rx * 0.6, pot);
      blob(b, 0, yb + pot - 0.04 + (h - pot + 0.04) / 2, 0, rx * 0.95, (h - pot + 0.04) / 2, rz * 0.95); // the crown sits down into the pot
      break;
    }
    case 'shelf': { // an open bookcase: two sides and five boards
      [-1, 1].forEach((sx) => slab(b, sx * (rx - 0.015), 0, 0, 0.03, h, d, 0.01));
      for (let k = 0; k < 5; k++) slab(b, 0, yb + 0.015 + (k * (h - 0.03)) / 4, 0, w - 0.06, 0.03, d, 0.01);
      break;
    }
    case 'stool': {
      cyl(b, 0, yt - 0.025, 0, rx, rx, 0.05);
      [0, 1, 2, 3].forEach((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        leg(b, Math.cos(a) * rx * 0.7, Math.sin(a) * rx * 0.7, yb, yt - 0.05, 0.02);
      });
      break;
    }
    case 'hamper':
      cyl(b, 0, 0, 0, rx, rx * 0.86, h);
      break;
    case 'fan': {
      const headY = yt - 0.2;
      cyl(b, 0, yb + 0.015, 0, rx * 0.9, rx * 0.9, 0.03);
      leg(b, 0, 0, yb + 0.03, headY, 0.016);
      cyl(b, 0, headY, 0.05, Math.min(rx, 0.21), Math.min(rx, 0.21), 0.05, 'z'); // the head, facing the front
      break;
    }
    case 'cabinet': {
      slab(b, 0, 0, 0, w, h, d, 0.05);
      line(b.outline, [0, yb + 0.03, rz], [0, yt - 0.03, rz]); // door seam on the front
      break;
    }
    case 'dresser': {
      const th = Math.min(0.75, h * 0.55);
      slab(b, 0, yb + th / 2, 0, w, th, d, 0.05);
      slab(b, 0, yb + th + (h - th) / 2, -rz + 0.025, w * 0.9, h - th, 0.05, 0.04); // mirror: the back
      break;
    }
    case 'clutter': {
      slab(b, -w * 0.12, yb + h * 0.3, 0, w * 0.7, h * 0.6, d * 0.8, 0.05);
      slab(b, w * 0.16, yb + h * 0.18, d * 0.06, w * 0.55, h * 0.36, d * 0.7, 0.05);
      break;
    }
    case 'carpet':
      slab(b, 0, 0, 0, w, Math.max(h, 0.02), d, 0.01);
      break;
    default:
      slab(b, 0, 0, 0, w, h, d, 0.06);
  }
  return b;
};

/* ----- Arrow and shadow ------------------------------------------------------- */

let arrowTex: THREE.CanvasTexture | null = null;
/** A soft icon-style arrow: round caps and joins, like the app's own icons. Drawn once. */
const arrowTexture = () => {
  if (arrowTex) return arrowTex;
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(64, 98);
  ctx.lineTo(64, 32);
  ctx.moveTo(38, 56);
  ctx.lineTo(64, 30);
  ctx.lineTo(90, 56);
  ctx.stroke();
  arrowTex = new THREE.CanvasTexture(c);
  arrowTex.colorSpace = THREE.SRGBColorSpace;
  return arrowTex;
};

const shadowCache = new Map<string, THREE.CanvasTexture>();
/**
 * A light contact shadow made of two Gaussian blurs of the footprint: a wide faint one that
 * diffuses, and a tight one that keeps the edge easy to read.
 */
const softShadowTexture = (w: number, d: number, spread: number, round: boolean) => {
  const key = `${w.toFixed(2)}x${d.toFixed(2)}x${spread.toFixed(2)}${round ? 'r' : ''}`;
  const hit = shadowCache.get(key);
  if (hit) return hit;
  const size = 192;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const fx = (w / (w + 2 * spread)) * size; // footprint size in px
  const fz = (d / (d + 2 * spread)) * size;
  const px = (size - fx) / 2;
  const pz = (size - fz) / 2;
  const far = size * 2; // the shape is drawn off-canvas; only its blurred shadow lands inside

  const cast = (blur: number, alpha: number, grow: number) => {
    ctx.save();
    ctx.shadowColor = `rgba(40, 44, 56, ${alpha})`;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = far;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    const x = px - far - grow;
    const z = pz - grow;
    const rw = fx + grow * 2;
    const rd = fz + grow * 2;
    if (round) ctx.ellipse(x + rw / 2, z + rd / 2, rw / 2, rd / 2, 0, 0, Math.PI * 2);
    else if (ctx.roundRect) ctx.roundRect(x, z, rw, rd, Math.min(rw, rd) * 0.22);
    else ctx.rect(x, z, rw, rd);
    ctx.fill();
    ctx.restore();
  };
  cast(14, 0.09, 0); // wide, very faint: a little diffusion
  cast(4, 0.15, -1); // tight: a crisp edge
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  shadowCache.set(key, tex);
  return tex;
};

const FACES = [
  { name: 'face_px', normal: [1, 0] },
  { name: 'face_nx', normal: [-1, 0] },
  { name: 'face_pz', normal: [0, 1] },
  { name: 'face_nz', normal: [0, -1] },
] as const;

/**
 * Builds the staging proxy for one object. root > 'active_directional_cuboid' (centred, +z front)
 * holding the soft bodies ('body'), their outline ('box_edges'), an invisible pick volume
 * ('box_fill'), the arrow, the soft shadow, and four invisible side faces used to flash the one
 * that snaps to a wall.
 */
export const buildStagingProxy = (kind: ProxyKind, w: number, h: number, d: number): THREE.Group => {
  const root = new THREE.Group();
  root.name = 'staging_root_group';
  const cuboid = new THREE.Group();
  cuboid.name = 'active_directional_cuboid';
  cuboid.userData.proxyKind = kind;

  // Soft contact shadow first, so everything draws over it
  const spread = Math.min(0.16, 0.06 + h * 0.04);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(w + 2 * spread, d + 2 * spread),
    new THREE.MeshBasicMaterial({ map: softShadowTexture(w, d, spread, ROUND.includes(kind)), transparent: true, depthWrite: false }),
  );
  shadow.name = 'soft_shadow';
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -h / 2 + 0.006;
  shadow.renderOrder = 2;
  shadow.raycast = () => {};
  cuboid.add(shadow);

  const built = buildShape(kind, w, h, d);
  const body = new THREE.Group();
  body.name = 'body';
  built.meshes.forEach((m) => {
    m.raycast = () => {};
    body.add(m);
  });
  cuboid.add(body);

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(built.outline, 3));
  const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: BOX_FREE, transparent: true, opacity: 0.85, depthTest: false }));
  edges.name = 'box_edges';
  edges.renderOrder = 10;
  edges.raycast = () => {};
  cuboid.add(edges);

  // What a finger picks up: an invisible volume the size of the piece
  const pick = new THREE.Mesh(
    ROUND.includes(kind) ? new THREE.CylinderGeometry(w / 2, w / 2, h, 20) : new THREE.BoxGeometry(w, h, d),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  pick.name = 'box_fill';
  cuboid.add(pick);

  if (!NO_FRONT.includes(kind)) {
    // Direction: one flat arrow lying on the top surface (on the floor inside for pieces taller than eye level)
    const len = THREE.MathUtils.clamp(Math.min(w, d) * 0.55, 0.2, 0.42);
    const arrow = new THREE.Mesh(
      new THREE.PlaneGeometry(len, len),
      new THREE.MeshBasicMaterial({ map: arrowTexture(), transparent: true, depthWrite: false, depthTest: false }),
    );
    arrow.name = 'front_arrow';
    arrow.rotation.set(-Math.PI / 2, 0, Math.PI); // flat, pointing to +z
    arrow.position.y = h <= 1.25 ? h / 2 + 0.004 : -h / 2 + 0.01;
    arrow.renderOrder = 12;
    arrow.raycast = () => {};
    cuboid.add(arrow);
  }

  // Side faces for the snap flash (invisible until flashed)
  FACES.forEach(({ name, normal }) => {
    const sideX = normal[0] !== 0;
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(sideX ? d : w, h),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, depthTest: false }),
    );
    face.name = name;
    face.renderOrder = 11;
    face.raycast = () => {};
    if (sideX) {
      face.rotation.y = Math.PI / 2;
      face.position.x = normal[0] * (w / 2 + 0.003);
    } else {
      face.position.z = normal[1] * (d / 2 + 0.003);
    }
    cuboid.add(face);
  });

  root.add(cuboid);
  return root;
};

/* ----- Ghost from the real model ------------------------------------------------ */

interface Silhouette {
  /** Each visible mesh of the piece, as geometry + transform in the proxy's centred local space */
  parts: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }[];
  /** Feature edges of every part, merged, in the same space */
  edges: Float32Array;
}
const silhouetteCache = new Map<string, Silhouette>();
const MAX_EDGE_FLOATS = 90_000; // ~15k segments; above that, keep only sharper edges

/**
 * The piece's own meshes, re-expressed around the centre of its measured box (unrotated, +z front),
 * so the ghost has exactly the size and shape of the furniture it stands in for.
 * `centre` is the measured box centre relative to the object's origin, in the object's local axes.
 */
const silhouetteOf = (id: string, obj: THREE.Object3D, centre: THREE.Vector3): Silhouette | null => {
  const hit = silhouetteCache.get(id);
  if (hit) return hit;
  const savedRot = obj.rotation.y;
  obj.rotation.y = 0;
  obj.updateMatrixWorld(true);
  const toLocal = obj.matrixWorld.clone().invert();
  const shift = new THREE.Matrix4().makeTranslation(-centre.x, -centre.y, -centre.z);
  const parts: Silhouette['parts'] = [];
  obj.traverse((c) => {
    const mesh = c as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry || mesh.userData?.isDetectorGlow || mesh.name === 'detected_glow') return;
    for (let cur: THREE.Object3D | null = mesh; cur && cur !== obj; cur = cur.parent) if (!cur.visible) return;
    parts.push({ geometry: mesh.geometry, matrix: shift.clone().multiply(toLocal.clone().multiply(mesh.matrixWorld)) });
  });
  obj.rotation.y = savedRot;
  obj.updateMatrixWorld(true);
  if (parts.length === 0) return null;

  const collect = (threshold: number) => {
    const out: number[] = [];
    const v = new THREE.Vector3();
    for (const p of parts) {
      const eg = new THREE.EdgesGeometry(p.geometry, threshold);
      const pos = eg.getAttribute('position');
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(p.matrix);
        out.push(v.x, v.y, v.z);
      }
      eg.dispose();
      if (out.length > MAX_EDGE_FLOATS) return null;
    }
    return out;
  };
  const edges = collect(30) ?? collect(60) ?? [];
  const s = { parts, edges: new Float32Array(edges) };
  silhouetteCache.set(id, s);
  return s;
};

/**
 * Staging proxy shaped like the real piece: same tree as buildStagingProxy (shadow, 'body',
 * 'box_edges', pick volume, arrow, snap faces), but the body and outline are the model's own
 * geometry in the ghost material. Falls back to the primitive proxy if the model gives nothing.
 */
export const buildStagingProxyFromObject = (
  id: string,
  obj: THREE.Object3D,
  measured: { dims: [number, number, number]; offset: [number, number, number] },
  kind: ProxyKind,
): THREE.Group => {
  const [w, h, d] = measured.dims;
  const objPos = new THREE.Vector3();
  obj.getWorldPosition(objPos);
  // offset x/z are relative to the origin; offset y is the absolute height of the box centre
  const centre = new THREE.Vector3(measured.offset[0], measured.offset[1] - objPos.y, measured.offset[2]);
  const sil = silhouetteOf(id, obj, centre);
  const root = buildStagingProxy(kind, w, h, d);
  if (!sil) return root;

  const cuboid = root.getObjectByName('active_directional_cuboid')!;
  const body = cuboid.getObjectByName('body')!;
  body.clear();
  sil.parts.forEach(({ geometry, matrix }) => {
    const m = new THREE.Mesh(geometry, bodyMaterial());
    m.matrixAutoUpdate = false;
    m.matrix.copy(matrix);
    m.raycast = () => {};
    body.add(m);
  });

  const edges = cuboid.getObjectByName('box_edges') as THREE.LineSegments;
  edges.geometry.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(sil.edges, 3));
  edges.geometry = g;
  // A real model has many more edges than a primitive; keep them lighter so the ghost reads as one shape
  (edges.material as THREE.LineBasicMaterial).opacity = 0.55;
  return root;
};

/** Colour (and optionally strength) of the proxy: free = blue, snapped = white. */
export const setBoxLook = (cuboid: THREE.Object3D, color: number, fillOpacity?: number) => {
  const edges = cuboid.getObjectByName('box_edges') as THREE.LineSegments | undefined;
  if (edges?.material) (edges.material as THREE.LineBasicMaterial).color.setHex(color);
  cuboid.getObjectByName('body')?.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.color.setHex(color);
    if (fillOpacity !== undefined) mat.opacity = Math.min(0.5, fillOpacity * 1.5);
  });
};

export interface Placement {
  x: number;
  z: number;
  snapped: boolean;
  /** Wall each axis is flush against: -1 / 1 for the min / max wall, 0 for none */
  walls: { x: -1 | 0 | 1; z: -1 | 0 | 1 };
}

/** Keeps a box inside the room, flush against a wall when it gets close. */
export const computePlacement = (hitX: number, hitZ: number, dims: [number, number, number], rotY: number, id = ''): Placement => {
  const [w, , d] = dims;
  const hx = Math.abs(Math.cos(rotY)) * w / 2 + Math.abs(Math.sin(rotY)) * d / 2;
  const hz = Math.abs(Math.sin(rotY)) * w / 2 + Math.abs(Math.cos(rotY)) * d / 2;
  const minX = -ROOM_HALF + hx, maxX = ROOM_HALF - hx;
  const minZ = -ROOM_HALF + hz, maxZ = ROOM_HALF - hz;
  let x = Math.max(minX, Math.min(maxX, hitX));
  let z = Math.max(minZ, Math.min(maxZ, hitZ));

  let snapped = false;
  if (x - minX < WALL_SNAP) { x = minX; snapped = true; } else if (maxX - x < WALL_SNAP) { x = maxX; snapped = true; }
  if (z - minZ < WALL_SNAP) { z = minZ; snapped = true; } else if (maxZ - z < WALL_SNAP) { z = maxZ; snapped = true; }

  // Scripted scenario spots (Diagrams 2 and 3) still pull the bed and desk in
  if (id.includes('bed') && x > 0.4 && z > 0.4) {
    x = 1.15; z = 1.30; snapped = true;
  } else if ((id.includes('table') || id.includes('desk')) && !id.includes('side') && !id.includes('dressing') && x < -0.4 && z > -1.2 && z < 0.2) {
    x = -1.25; z = -0.65; snapped = true;
  }

  const walls = {
    x: (x - minX < 0.02 ? -1 : maxX - x < 0.02 ? 1 : 0) as -1 | 0 | 1,
    z: (z - minZ < 0.02 ? -1 : maxZ - z < 0.02 ? 1 : 0) as -1 | 0 | 1,
  };
  return { x, z, snapped, walls };
};

/** Which of the box's own faces touches each wall it is flush against, given its rotation. */
export const snappedFaceNames = (rotY: number, walls: Placement['walls']): string[] => {
  const cos = Math.cos(rotY);
  const sin = Math.sin(rotY);
  const out: string[] = [];
  const wallNormals: [number, number][] = [];
  if (walls.x !== 0) wallNormals.push([walls.x, 0]);
  if (walls.z !== 0) wallNormals.push([0, walls.z]);
  wallNormals.forEach(([nx, nz]) => {
    let best = FACES[0].name as string;
    let bestDot = -Infinity;
    FACES.forEach(({ name, normal }) => {
      const wx = normal[0] * cos + normal[1] * sin;
      const wz = -normal[0] * sin + normal[1] * cos;
      const dot = wx * nx + wz * nz;
      if (dot > bestDot) { bestDot = dot; best = name; }
    });
    out.push(best);
  });
  return out;
};

export interface Flash {
  material: THREE.MeshBasicMaterial;
  start: number;
}
const FLASH_MS = 900;

/** Lights the given faces, which then fade on their own. */
export const flashFaces = (cuboid: THREE.Object3D, names: string[], now: number, list: Flash[]) => {
  names.forEach((name) => {
    const face = cuboid.getObjectByName(name) as THREE.Mesh | undefined;
    if (!face) return;
    const material = face.material as THREE.MeshBasicMaterial;
    const existing = list.find((f) => f.material === material);
    if (existing) existing.start = now;
    else list.push({ material, start: now });
  });
};

/** Advance the flashes. Call every frame. */
export const tickFlashes = (list: Flash[], now: number) => {
  for (let i = list.length - 1; i >= 0; i--) {
    const t = (now - list[i].start) / FLASH_MS;
    if (t >= 1) {
      list[i].material.opacity = 0;
      list.splice(i, 1);
    } else {
      list[i].material.opacity = 0.5 * (1 - t) * (1 - t);
    }
  }
};
