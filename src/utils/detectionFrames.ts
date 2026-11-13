import * as THREE from 'three';
import { DetectionShape, Vec3 } from '../types';

/** Where the viewer's eyes are in the room. Detections are directions from here. */
export const EYE = new THREE.Vector3(0, 1.35, 0);

/** Closest two corners may get, in degrees. Stops a drag from collapsing the shape. */
const MIN_EDGE_DEG = 1.5;
/** Distance (m) assumed when a shape is drawn with no depth, such as a tap-to-place. */
const DRAW_DISTANCE = 1.8;
const RAD = 180 / Math.PI;

const toV3 = (v: THREE.Vector3): Vec3 => [v.x, v.y, v.z];
export const vec = (v: Vec3) => new THREE.Vector3(v[0], v[1], v[2]);

export const centroidOf = (points: DetectionShape) =>
  points.reduce((acc, p) => acc.add(vec(p)), new THREE.Vector3()).normalize();

/** Right/up axes of the view looking along `c`. Right is the direction yaw grows in. */
const basisAt = (c: THREE.Vector3) => {
  const worldUp = Math.abs(c.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(c, worldUp).normalize();
  const up = new THREE.Vector3().crossVectors(right, c).normalize();
  return { right, up };
};

/** Flatten directions onto the plane touching the sphere at `c`. Null if too far round the back. */
const flatten = (c: THREE.Vector3, points: Vec3[]): [number, number][] | null => {
  const { right, up } = basisAt(c);
  const out: [number, number][] = [];
  for (const p of points) {
    const v = vec(p);
    const d = v.dot(c);
    if (d <= 0.08) return null;
    out.push([v.dot(right) / d, v.dot(up) / d]);
  }
  return out;
};

const cross2 = (o: [number, number], a: [number, number], b: [number, number]) =>
  (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/** Convex hull, counter-clockwise, as indices into `pts`. */
const hull = (pts: [number, number][]): number[] => {
  const idx = pts.map((_, i) => i).sort((a, b) => pts[a][0] - pts[b][0] || pts[a][1] - pts[b][1]);
  const lower: number[] = [];
  for (const i of idx) {
    while (lower.length >= 2 && cross2(pts[lower[lower.length - 2]], pts[lower[lower.length - 1]], pts[i]) <= 0) lower.pop();
    lower.push(i);
  }
  const upper: number[] = [];
  for (const i of [...idx].reverse()) {
    while (upper.length >= 2 && cross2(pts[upper[upper.length - 2]], pts[upper[upper.length - 1]], pts[i]) <= 0) upper.pop();
    upper.push(i);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
};

const boxCorners = (position: Vec3, dims: Vec3) => {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    out.push(
      new THREE.Vector3(
        position[0] + (i & 1 ? 1 : -1) * dims[0] / 2,
        position[1] + (i & 2 ? 1 : -1) * dims[1] / 2,
        position[2] + (i & 4 ? 1 : -1) * dims[2] / 2,
      ),
    );
  }
  return out;
};

/**
 * Where a catalogued object's outline sits on the image.
 * - `face`: fixtures fixed to a wall. The four corners of the face toward the room, so a window's
 *   corners are the window's corners.
 * - `silhouette`: furniture. The outline of its box as seen from the eye.
 */
export const outlineFromBox = (position: Vec3, dims: Vec3, mode: 'face' | 'silhouette'): DetectionShape => {
  let corners: THREE.Vector3[];
  if (mode === 'face') {
    const axis = dims.indexOf(Math.min(...dims));
    const centre = vec(position);
    const near = centre.clone();
    near.setComponent(axis, centre.getComponent(axis) - dims[axis] / 2);
    const far = centre.clone();
    far.setComponent(axis, centre.getComponent(axis) + dims[axis] / 2);
    const faceCentre = near.distanceTo(EYE) <= far.distanceTo(EYE) ? near : far;
    const sign = faceCentre === near ? -1 : 1;
    corners = boxCorners(position, dims).filter((c) => Math.sign(c.getComponent(axis) - position[axis]) === sign);
  } else {
    corners = boxCorners(position, dims);
  }
  const dirs: Vec3[] = corners.map((c) => toV3(c.clone().sub(EYE).normalize()));
  const flat = flatten(centroidOf(dirs), dirs);
  if (!flat) return dirs;
  return hull(flat).map((i) => dirs[i]);
};

/** Tap-to-place: a screen-facing quad around `centre`, sized from the label's real dimensions. */
export const defaultQuad = (centre: THREE.Vector3, dims: Vec3): DetectionShape => {
  const c = centre.clone().normalize();
  const { right, up } = basisAt(c);
  const width = Math.max(dims[0], dims[2], 0.3);
  const height = Math.max(dims[1], 0.3);
  const halfW = Math.max(Math.atan(width / 2 / DRAW_DISTANCE), 4 / RAD);
  const halfH = Math.max(Math.atan(height / 2 / DRAW_DISTANCE), 4 / RAD);
  const corner = (sx: number, sy: number) =>
    toV3(c.clone().addScaledVector(right, Math.tan(halfW) * sx).addScaledVector(up, Math.tan(halfH) * sy).normalize());
  return [corner(-1, 1), corner(1, 1), corner(1, -1), corner(-1, -1)];
};

const segmentsCross = (a: [number, number], b: [number, number], c: [number, number], d: [number, number]) =>
  cross2(a, b, c) * cross2(a, b, d) < 0 && cross2(c, d, a) * cross2(c, d, b) < 0;

/** A drag is only kept if the shape stays a simple polygon with no collapsed edges. */
export const isValidShape = (points: DetectionShape): boolean => {
  const n = points.length;
  if (n < 3) return false;
  for (let i = 0; i < n; i++) {
    const a = vec(points[i]);
    const b = vec(points[(i + 1) % n]);
    if (Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1)) * RAD < MIN_EDGE_DEG) return false;
  }
  const flat = flatten(centroidOf(points), points);
  if (!flat) return false;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      if (segmentsCross(flat[i], flat[(i + 1) % n], flat[j], flat[(j + 1) % n])) return false;
    }
  }
  return true;
};

/** Turn the whole shape, or one corner of it, as the finger turns from `from` to `to`. */
export const dragShape = (start: DetectionShape, kind: 'move' | number, from: THREE.Vector3, to: THREE.Vector3): DetectionShape => {
  const q = new THREE.Quaternion().setFromUnitVectors(from, to);
  const turn = (p: Vec3): Vec3 => toV3(vec(p).applyQuaternion(q).normalize());
  return start.map((p, i) => (kind === 'move' || kind === i ? turn(p) : p));
};

/** Direction of the screen point under (x, y), given the camera. */
export const directionFromScreen = (
  camera: THREE.PerspectiveCamera,
  rect: DOMRect,
  clientX: number,
  clientY: number,
) => {
  const ndc = new THREE.Vector3(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1, 0.5);
  return ndc.unproject(camera).sub(camera.position).normalize();
};

/** Which way is "in front" for a direction: false when it is behind the camera. */
export const isInFront = (camera: THREE.PerspectiveCamera, p: Vec3, scratch = new THREE.Vector3()) => {
  camera.getWorldDirection(scratch);
  return vec(p).dot(scratch) > 0.08;
};
