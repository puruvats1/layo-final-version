/* The room stage: the app's procedural 3D room, seen from its centre, with Layo V4 staging boxes,
   "where it was" outlines, AI ghosts, one drag signal, and HTML pins that follow points in the room. */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { build3DSquareRoom, type Room3DScene } from '../utils/proceduralRoom3D';
import { buildStagingProxy, setBoxLook } from '../utils/stagingProxy';
import { INITIAL_SCENARIO_STATE } from '../data/scenarioSteps';
import { START, ext, place, overlapOf, wallSnap, wallRot, type Obj, type Dims } from './room';
import { makeThumbs } from './thumbs';

const DEG = Math.PI / 180;
/** Where an object's top face is, as a share of its height: a chair's seat, a bed's mattress. The tap menu sits just above it. */
const TOPF: Partial<Record<string, number>> = { chair: 0.58, lounge: 0.55, bed: 0.5, dresser: 0.55 };
const topH = (o: { dims: Dims; kind: string }) => o.dims[1] * (TOPF[o.kind] ?? 1);
const FOV_MIN = 40, FOV_MAX = 100;
const C = { paper: 0xfbf7f1, ink: 0x2b2522, rose: 0xf2b8c6, roseStrong: 0xa8345f, blue: 0x24698d, sky: 0xcde7f3, fine: 0x2f8c64, stretch: 0xc27c0e, problem: 0xc4452f, butter: 0xf7dd85 };
const LIGHT = { preset: 'natural_daylight', colorTempK: 5500, intensity: 1 } as const;

export interface Ghost { id: string; dims: Dims; at: [number, number]; rot: number; kind?: Obj['kind']; focus?: boolean; loading?: boolean }
export interface Pin { id: string; pos?: [number, number, number]; follow?: string; node: React.ReactNode; shift?: string; clamp?: boolean; fit?: boolean; with?: string }
export interface Signal { line?: [number, number, number]; ring?: boolean; frame?: [number, number, number]; tone?: string; zone?: [number, number, number, number]; hot?: boolean; text: string }
export interface StageApi { lookAt: (x: number, z: number, lat?: number) => void; centre: () => [number, number]; floorAt: (clientX: number, clientY: number) => [number, number] | null; inView: (pts: [number, number, number][]) => boolean; moving: () => boolean; wallAt: (clientX: number, clientY: number) => [number, number, number] | null; moveCarry: (id: string, at: [number, number], y?: number) => void; carryPoint: (id: string | null, clientX?: number, clientY?: number) => void; liveY: (id: string) => number | undefined; liveAt: (id: string) => [number, number] | null }
interface Props {
  objs: Obj[]; boxIds: string[]; liftedIds: string[]; selected: string[];
  was: Ghost[]; ghosts: Ghost[]; pins: Pin[]; palette: string;
  mode: 'edit' | 'look' | 'rotate'; rotateId?: string | null; soft?: boolean;
  signal?: (id: string, at: [number, number]) => Signal | null;
  onTap?: (id: string | null) => void; onHold?: (id: string) => void; onHoldRelease?: (id: string) => void;
  onDrop?: (id: string, at: [number, number], y?: number, rot?: number) => boolean | void; onRotated?: (id: string, rot: number) => void;
  onSignal?: (s: Signal | null) => void; apiRef?: React.MutableRefObject<StageApi | null>;
  start?: [number, number];
  /** Look around by moving the phone instead of dragging. Touch still taps and holds. */
  gyro?: boolean; onGyroFail?: () => void;
  /** Called a moment after the view stops changing */
  onLook?: () => void;
  /** Where the view points, every time it changes (degrees) */
  onAim?: (lon: number, lat: number) => void;
  /** The staging boxes are being rendered: they carry the sheen until they become furniture */
  rendering?: boolean;
  /** A proposed spot let go somewhere new (hold it, drag it) */
  onGhostDrop?: (id: string, at: [number, number]) => void;
  /** Any touch on the room (a tap or the start of a pan) */
  onTouch?: () => void;
  /** Isometric thumbnails of every object's 3D model, made once the room is built */
  onThumbs?: (t: Record<string, string>) => void;
}

const edges = (d: Dims, color: number, dashed: boolean, onTop: boolean) => {
  const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(d[0], Math.max(d[1], 0.04), d[2]));
  const m = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.09, gapSize: 0.06, depthTest: !onTop, transparent: true }) : new THREE.LineBasicMaterial({ color, depthTest: !onTop, transparent: true });
  const l = new THREE.LineSegments(g, m);
  if (dashed) l.computeLineDistances();
  l.renderOrder = 28;
  return l;
};
const floorPatch = (w: number, d: number, color: number, opacity: number) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.014; m.renderOrder = 4;
  return m;
};

export const Stage: React.FC<Props> = (props) => {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pinEls = useRef<Record<string, HTMLDivElement | null>>({});
  const P = useRef(props); P.current = props;
  const S = useRef<{
    renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; room: Room3DScene;
    overlay: THREE.Group; sig: THREE.Group; cubs: Record<string, THREE.Object3D>; live: Record<string, { at: [number, number]; rot: number; y?: number }>;
    lon: number; lat: number; toLon: number | null; drag: any; w: number; h: number; gy: any; dirty: boolean; last: string; carry: { id: string; cx: number; cy: number } | null; uT: { value: number }; gcubs: Record<string, THREE.Object3D>; glive: Record<string, { at: [number, number] }>;
  } | null>(null);

  // ---- build once
  useEffect(() => {
    const el = canvas.current!, box = wrap.current!;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap; // blurred, diffuse shadows
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0c10);
    const room = build3DSquareRoom('baseline', LIGHT as any);
    scene.add(room.group);
    const overlay = new THREE.Group(), sig = new THREE.Group(); scene.add(overlay, sig);
    const camera = new THREE.PerspectiveCamera(FOV_MAX, 1, 0.1, 100); // starts at the widest view, for the best coverage of the room
    const st: NonNullable<typeof S.current> = { renderer, scene, camera, room, overlay, sig, cubs: {}, live: {}, lon: P.current.start?.[0] ?? -30, lat: P.current.start?.[1] ?? -22, toLon: null as number | null, drag: null as any, w: 1, h: 1, gy: null, dirty: true, last: '', gcubs: {}, glive: {}, uT: { value: 0 }, carry: null };
    S.current = st;
    // Room lighting: the flat ambient fill gives way to a sky and floor bounce, and the two window lights become a warm key with real shadows
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0xc9b49a, 0.75));
    let key = false;
    room.group.traverse((o) => {
      const l = o as THREE.Light & { isAmbientLight?: boolean; isDirectionalLight?: boolean; isPointLight?: boolean };
      if (l.isAmbientLight) l.intensity = 0.26;
      else if (l.isDirectionalLight) {
        const d = o as THREE.DirectionalLight; d.color.setHex(0xfff0da);
        if (!key) { // the one shadow caster: nearly straight down, so shadows sit under the furniture
          key = true; d.intensity = 1.1; d.position.set(0.3, 6, 0.5); d.target.position.set(0.3, 0, 0); d.castShadow = true; d.shadow.mapSize.set(1024, 1024);
          const c = d.shadow.camera; c.left = -2.1; c.right = 2.1; c.top = 2.1; c.bottom = -2.1; c.near = 2; c.far = 9; c.updateProjectionMatrix();
          d.shadow.bias = -0.0002; d.shadow.normalBias = 0.004; d.shadow.radius = 9; d.shadow.blurSamples = 20; // wide, soft edges so objects sit in their shadow instead of floating above it
        } else { d.intensity = 0.45; d.castShadow = false; d.position.set(-0.6, 4, 2.5); } // a soft fill from the windows, no shadow cost
      } else if (l.isPointLight) l.castShadow = false; // a cube shadow map is six extra renders
      if ((o as THREE.Mesh).isMesh) o.receiveShadow = true;
    });
    // The room is still: shadows are drawn when the furniture changes, not every frame
    renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
    P.current.onThumbs?.(makeThumbs(room)); // the sync effect below rebuilds the real scenario straight after
    const size =() => { st.dirty = true; st.w = box.clientWidth || 1; st.h = box.clientHeight || 1; renderer.setSize(st.w, st.h, false); camera.aspect = st.w / st.h; camera.updateProjectionMatrix(); };
    size();
    const ro = new ResizeObserver(size); ro.observe(box);

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), v = new THREE.Vector3();
    const setRay = (e: { clientX: number; clientY: number }) => { const r = el.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); };
    const wallPoint = (): [number, number, number] | null => { // the wall (not the floor or ceiling) the view ray meets, and where
      const o = ray.ray.origin.toArray(), dr = ray.ray.direction.toArray(); let best: { t: number; p: [number, number, number] } | null = null;
      for (const a of [0, 2]) for (const bd of [-1.7, 1.7]) {
        if (Math.abs(dr[a]) < 1e-6) continue; const t = (bd - o[a]) / dr[a]; if (t <= 0 || (best && t >= best.t)) continue;
        const pt = [o[0] + dr[0] * t, o[1] + dr[1] * t, o[2] + dr[2] * t] as [number, number, number], k = a === 0 ? 2 : 0;
        if (Math.abs(pt[k]) <= 1.7 && pt[1] >= 0 && pt[1] <= 2.75) best = { t, p: pt };
      }
      return best ? best.p : null;
    };
    const moveWall = (id: string, pt: [number, number, number]) => { // a poster slides along the walls, at the height it is taken to, and faces into the room
      const o = P.current.objs.find((x) => x.id === id), L = st.live[id]; if (!o || !L) return;
      const at = wallSnap([pt[0], pt[2]], o.dims); L.at = at; L.rot = wallRot(at); L.y = Math.max(o.dims[1] / 2 + 0.4, Math.min(2.3 - o.dims[1] / 2, pt[1]));
      const c = st.cubs[id]; if (c) { c.position.set(at[0], L.y, at[1]); c.rotation.y = L.rot; }
    };
    const carryStep = () => { // put what is being carried under the finger, for the view as it is now
      const c = st.carry; if (!c || !st.live[c.id]) return; camera.updateMatrixWorld(); setRay({ clientX: c.cx, clientY: c.cy });
      if (P.current.objs.find((x) => x.id === c.id)?.wall) { const wp = wallPoint(); if (wp) moveWall(c.id, wp); } else { const fh = floorHit(); if (fh) moveTo(c.id, fh); }
    };
    const floorHit = (): [number, number] | null => { const d = ray.ray.direction, o = ray.ray.origin; if (d.y > -0.05) return null; const t = -o.y / d.y; return [o.x + d.x * t, o.z + d.z * t]; };
    const pick = (): string | null => {
      let best: string | null = null, bd = 1e9; const b3 = new THREE.Box3();
      for (const o of P.current.objs) {
        if (!o.inRoom) continue;
        const L = st.live[o.id] || o, e = ext({ dims: o.dims, rot: L.rot });
        if (o.wall) { // something hung on a wall is picked where it hangs, with a little depth to tap
          const yc = (L as { y?: number }).y ?? o.y ?? 1.45, pd = 0.06;
          b3.min.set(L.at[0] - e.hx - pd, yc - o.dims[1] / 2, L.at[1] - e.hz - pd); b3.max.set(L.at[0] + e.hx + pd, yc + o.dims[1] / 2, L.at[1] + e.hz + pd);
        } else { b3.min.set(L.at[0] - e.hx, 0, L.at[1] - e.hz); b3.max.set(L.at[0] + e.hx, Math.max(o.dims[1], 0.06), L.at[1] + e.hz); }
        const hitP = ray.ray.intersectBox(b3, v);
        if (hitP) { const d = hitP.distanceTo(ray.ray.origin) + (o.flat ? 0.5 : 0); if (d < bd) { bd = d; best = o.id; } }
      }
      return best;
    };
    const pickGhost = (): string | null => {
      let best: string | null = null, bd = 1e9; const b3 = new THREE.Box3();
      for (const g of P.current.ghosts) {
        const G = st.glive[g.id]; if (!G) continue; const e = ext({ dims: g.dims, rot: g.rot });
        b3.min.set(G.at[0] - e.hx, 0, G.at[1] - e.hz); b3.max.set(G.at[0] + e.hx, Math.max(g.dims[1], 0.06), G.at[1] + e.hz);
        const hp = ray.ray.intersectBox(b3, v); if (hp) { const d = hp.distanceTo(ray.ray.origin); if (d < bd) { bd = d; best = g.id; } }
      }
      return best;
    };
    const moveGhost = (id: string, at: [number, number]) => {
      const g = P.current.ghosts.find((x) => x.id === id), G = st.glive[id], cb = st.gcubs[id]; if (!g || !G) return;
      G.at = place(at[0], at[1], { dims: g.dims, rot: g.rot }); if (cb) cb.position.set(G.at[0], cb.position.y, G.at[1]);
      // Overlapping anything (the room, or another proposed spot) is not allowed: the model turns red
      const now = P.current.objs.map((x) => { const gg = P.current.ghosts.find((q) => q.id === x.id), GL = gg ? st.glive[gg.id] : null; return gg && GL ? { ...x, at: GL.at, rot: gg.rot, dims: gg.dims, inRoom: true } : x; });
      const me = now.find((x) => x.id === id); if (cb) setBoxLook(cb, me && overlapOf(me, now) ? 0xe58b7c : C.paper, 0.4);
    };
    const buzz = (n = 8) => { try { navigator.vibrate?.(n); } catch { /* no haptics */ } };
    const moveTo = (id: string, at: [number, number]) => {
      const o = P.current.objs.find((x) => x.id === id); if (!o) return;
      const L = st.live[id]; const prev = L.at; L.at = o.wall ? wallSnap(at, o.dims) : place(at[0], at[1], { dims: o.dims, rot: L.rot });
      if (o.wall) { L.rot = wallRot(L.at); const cw = st.cubs[id]; if (cw) cw.rotation.y = L.rot; } // it slides along the walls and faces into the room
      const po = o.link ? P.current.objs.find((x) => x.id === o.link) : null;
      if (po && st.live[po.id] && P.current.liftedIds.includes(po.id)) {
        // The partner keeps its place relative to this one, and neither leaves the room
        const M = st.live[po.id]; const m0 = M.at; let d: [number, number] = [L.at[0] - prev[0], L.at[1] - prev[1]];
        for (let i = 0; i < 3; i++) {
          const pt = place(m0[0] + d[0], m0[1] + d[1], { dims: po.dims, rot: M.rot }); d = [pt[0] - m0[0], pt[1] - m0[1]];
          const a = place(prev[0] + d[0], prev[1] + d[1], { dims: o.dims, rot: L.rot }); d = [a[0] - prev[0], a[1] - prev[1]];
        }
        L.at = place(prev[0] + d[0], prev[1] + d[1], { dims: o.dims, rot: L.rot }); M.at = place(m0[0] + d[0], m0[1] + d[1], { dims: po.dims, rot: M.rot });
        const c2 = st.cubs[po.id]; if (c2) c2.position.set(M.at[0], c2.position.y, M.at[1]);
      }
      const c = st.cubs[id]; if (c) c.position.set(L.at[0], c.position.y, L.at[1]);
      const now = P.current.objs.map((x) => (st.live[x.id] ? { ...x, at: st.live[x.id].at, rot: st.live[x.id].rot } : x));
      bad = overlapOf(now.find((x) => x.id === id)!, now) ?? (po ? overlapOf(now.find((x) => x.id === po.id)!, now) : undefined) ?? null; // overlapping is not allowed: the carried model turns red
      for (const q of [id, po?.id]) { const cb = q ? st.cubs[q] : null; if (cb) setBoxLook(cb, bad ? SOFT_RED : C.paper, 0.26); }
      drawSignal(id);
    };
    const drawSignal = (id: string | null) => {
      st.sig.clear();
      const s = id ? P.current.signal?.(id, st.live[id].at) ?? null : null;
      P.current.onSignal?.(s);
      if (!s || !id) return;
      const col = s.zone ? (s.hot ? C.stretch : C.sky) : (C as any)[s.tone || 'fine'];
      if (s.zone) {
        const [x0, x1, z0, z1] = s.zone, p = floorPatch(x1 - x0, z1 - z0, s.hot ? C.butter : C.sky, s.hot ? 0.5 : 0.3);
        p.position.set((x0 + x1) / 2, 0.016, (z0 + z1) / 2); st.sig.add(p);
        const e = edges([x1 - x0, 0.02, z1 - z0], col, !!s.hot, true); e.position.set((x0 + x1) / 2, 0.03, (z0 + z1) / 2); st.sig.add(e);
      } else if (s.frame) {
        const [cx, cy, cz] = s.frame, W = 1.05, H = 1.15, z = cz > 0 ? cz - 0.03 : cz + 0.03, fc = s.hot ? C.problem : C.butter;
        const bar = (w: number, h: number, x: number, y: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), new THREE.MeshBasicMaterial({ color: fc, depthTest: false })); m.position.set(cx + x, cy + y, z); m.renderOrder = 30; st.sig.add(m); };
        bar(W + 0.12, 0.06, 0, H / 2 + 0.03); bar(W + 0.12, 0.06, 0, -H / 2 - 0.03); bar(0.06, H, -W / 2 - 0.03, 0); bar(0.06, H, W / 2 + 0.03, 0);
        if (!s.hot) { const g = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ color: C.butter, transparent: true, opacity: 0.32, depthTest: false, side: THREE.DoubleSide })); g.position.set(cx, cy, z); g.renderOrder = 29; st.sig.add(g); }
      } else if (s.line) {
        const o = P.current.objs.find((x) => x.id === id)!;
        const a = new THREE.Vector3(st.live[id].at[0], o.dims[1] * 0.8, st.live[id].at[1]), b = new THREE.Vector3(...s.line);
        const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + Math.min(0.8, a.distanceTo(b) * 0.3);
        const curve = new THREE.CatmullRomCurve3([a, mid, b]);
        const n = s.tone === 'fine' ? 1 : s.tone === 'stretch' ? 14 : 6, part = s.tone === 'fine' ? 1 : s.tone === 'stretch' ? 0.6 : 0.4;
        for (let i = 0; i < n; i++) {
          const pts: THREE.Vector3[] = []; for (let k = 0; k <= 8; k++) pts.push(curve.getPoint((i + (k / 8) * part) / n));
          for (const [wd, cl] of [[0.03, C.paper], [0.018, col]] as [number, number][]) { const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, wd, 6), new THREE.MeshBasicMaterial({ color: cl, depthTest: false })); t.renderOrder = cl === C.paper ? 29 : 30; st.sig.add(t); }
        }
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshBasicMaterial({ color: col, depthTest: false })); dot.position.copy(b); dot.renderOrder = 31; st.sig.add(dot);
        if (s.ring) { const rg = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.13, 36), new THREE.MeshBasicMaterial({ color: col, depthTest: false, side: THREE.DoubleSide, transparent: true, opacity: s.tone === 'stretch' ? 0.7 : 1 })); rg.position.set(b.x, b.y, b.z + (b.z > 0 ? -0.02 : 0.02)); rg.renderOrder = 31; st.sig.add(rg); }
      }
    };

    const ptrs = new Map<number, { x: number; y: number }>();
    const mid = () => { const [a, b] = [...ptrs.values()]; return (a.y + b.y) / 2; }; // two fingers swiping up or down: the field of view
    const twistAngle = () => { const [a, b] = [...ptrs.values()]; return Math.atan2(b.y - a.y, b.x - a.x); };
    // With an object held, a second finger twists it on the floor (about its upright axis); the finger holding it keeps carrying it
    const updateTwist = (d: any) => {
      const L = st.live[d.id]; if (!L) return;
      let rot = d.twist.rot0 - (twistAngle() - d.twist.a0); const q = Math.round(rot / (Math.PI / 2)) * (Math.PI / 2);
      if (Math.abs(rot - q) < 0.1) { rot = q; if (!d.twist.snap) buzz(6); d.twist.snap = true; } else d.twist.snap = false;
      L.rot = rot; const c = st.cubs[d.id]; if (c) c.rotation.y = rot; st.dirty = true;
    };
    const zoom = (fov: number) => { camera.fov = Math.max(FOV_MIN, Math.min(FOV_MAX, fov)); camera.updateProjectionMatrix(); st.dirty = true; };
    const down = (e: PointerEvent) => {
      P.current.onTouch?.();
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2 && st.drag && (st.drag.kind === 'held' || st.drag.kind === 'drag') && st.live[st.drag.id] && !P.current.objs.find((x) => x.id === st.drag.id)?.wall) { // an object is held: the second finger twists it
        st.drag.kind = 'drag'; st.drag.moved = true; st.drag.twist = { a0: twistAngle(), rot0: st.live[st.drag.id].rot, snap: false }; return;
      }
      if (ptrs.size === 2 && (!st.drag || st.drag.kind === 'wait' || st.drag.kind === 'look')) { // two fingers, nothing held: a vertical swipe changes the field of view
        if (st.drag) clearTimeout(st.drag.t);
        st.drag = { kind: 'pinch', y0: mid(), fov0: camera.fov, moved: true, t: 0 }; return;
      }
      if (st.drag) return;
      try { el.setPointerCapture(e.pointerId); } catch { /* fine */ }
      setRay(e);
      const p = P.current;
      const d: any = { pid: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, lon: st.lon, lat: st.lat, kind: 'wait', id: null, moved: false, t: 0 };
      st.toLon = null;
      if (p.mode === 'rotate' && p.rotateId) { d.kind = 'rotate'; d.id = p.rotateId; d.rot0 = st.live[p.rotateId]?.rot ?? 0; d.snap = false;
        // A linked pair turns as one, about the middle between them
        const ob = p.objs.find((x) => x.id === p.rotateId), po = ob?.link ? p.objs.find((x) => x.id === ob.link) : null;
        if (ob?.inRoom && po?.inRoom && st.live[po.id] && st.live[ob.id]) d.pair = { id: po.id, at: [...st.live[po.id].at], rot: st.live[po.id].rot, a0: [...st.live[ob.id].at] };
      }
      else if (p.mode === 'edit') {
        d.id = pick();
        if (d.id) d.t = window.setTimeout(() => {
          if (st.drag !== d || d.moved) return;
          d.kind = 'held'; buzz(10);
          const fh = floorHit(), L = st.live[d.id]; d.off = fh ? [L.at[0] - fh[0], L.at[1] - fh[1]] : [0, 0];
          p.onHold?.(d.id);
        }, 300);
      }
      else if (p.mode === 'look' && p.ghosts.length && p.onGhostDrop) { // a proposed spot: tap it, or hold and drag it
        d.id = pickGhost();
        if (d.id) d.t = window.setTimeout(() => { if (st.drag !== d || d.moved) return; d.kind = 'gheld'; buzz(10); const fh = floorHit(), G = st.glive[d.id]; d.off = fh && G ? [G.at[0] - fh[0], G.at[1] - fh[1]] : [0, 0]; }, 300);
      }
      st.drag = d;
    };
    const move = (e: PointerEvent) => {
      if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const d = st.drag; if (!d) return;
      if (d.kind === 'pinch') { if (ptrs.size >= 2) zoom(d.fov0 + (mid() - d.y0) * 0.12); return; } // swipe up: closer; swipe down: wider
      if (d.twist && ptrs.size >= 2) updateTwist(d);
      if (d.pid !== undefined && e.pointerId !== d.pid) return; // only the finger holding it carries it
      const dx = e.clientX - d.x, dy = e.clientY - d.y; d.lx = e.clientX; d.ly = e.clientY;
      if (!d.moved && Math.hypot(dx, dy) > 7) { d.moved = true; if (d.kind === 'wait') { clearTimeout(d.t); d.kind = 'look'; } else if (d.kind === 'held') d.kind = 'drag'; else if (d.kind === 'gheld') d.kind = 'gdrag'; }
      if (d.kind === 'look') { if (P.current.gyro) return; st.lon = d.lon - dx * 0.22; st.lat = Math.max(-70, Math.min(55, d.lat + dy * 0.16)); }
      else if (d.kind === 'drag') { setRay(e); if (P.current.objs.find((x) => x.id === d.id)?.wall) { const wp = wallPoint(); if (wp) moveWall(d.id, wp); } else { const fh = floorHit(); if (fh) moveTo(d.id, [fh[0] + d.off[0], fh[1] + d.off[1]]); } }
      else if (d.kind === 'gdrag') { setRay(e); const fh = floorHit(); if (fh) moveGhost(d.id, [fh[0] + d.off[0], fh[1] + d.off[1]]); }
      else if (d.kind === 'rotate') {
        let rot = d.rot0 + dx * 0.012; const q = Math.round(rot / (Math.PI / 2)) * (Math.PI / 2);
        if (Math.abs(rot - q) < 0.14) { rot = q; if (!d.snap) buzz(6); d.snap = true; } else d.snap = false;
        const L = st.live[d.id]; if (L) { L.rot = rot; const c = st.cubs[d.id]; if (c) c.rotation.y = rot; }
        if (d.pair && L) {
          const dl = rot - d.rot0, cs = Math.cos(dl), sn = Math.sin(dl), cx = (d.pair.a0[0] + d.pair.at[0]) / 2, cz = (d.pair.a0[1] + d.pair.at[1]) / 2;
          const spin = (a: number[]): [number, number] => [cx + (a[0] - cx) * cs + (a[1] - cz) * sn, cz - (a[0] - cx) * sn + (a[1] - cz) * cs];
          const pa = spin(d.pair.a0), pb = spin(d.pair.at), PL = st.live[d.pair.id], pc = st.cubs[d.pair.id];
          L.at = pa; const c0 = st.cubs[d.id]; if (c0) c0.position.set(pa[0], c0.position.y, pa[1]);
          if (PL) { PL.at = pb; PL.rot = d.pair.rot + dl; if (pc) { pc.position.set(pb[0], pc.position.y, pb[1]); pc.rotation.y = PL.rot; } }
        }
      }
    };
    const up = (e: PointerEvent) => {
      st.dirty = true; ptrs.delete(e.pointerId);
      const d = st.drag; if (!d) return;
      if (d.kind === 'pinch') { if (ptrs.size < 2) st.drag = null; return; }
      if (d.twist && e.pointerId !== d.pid) { d.twist = null; return; } // the twisting finger lifts: the object stays held and turned
      st.drag = null; clearTimeout(d.t);
      const p = P.current;
      if (d.kind === 'wait') p.onTap?.(d.id);
      else if (d.kind === 'held') p.onHoldRelease?.(d.id);
      else if (d.kind === 'gdrag') { const G = st.glive[d.id]; if (G) p.onGhostDrop?.(d.id, G.at); }
      else if (d.kind === 'drag') {
        drawSignal(null); bad = null;
        // The editor drops it at the nearest free spot; only if there is none does it go back to where it was
        if (p.onDrop?.(d.id, st.live[d.id].at, st.live[d.id].y, st.live[d.id].rot) === false) {
          for (const q of [d.id, p.objs.find((x) => x.id === d.id)?.link]) { const ob = p.objs.find((x) => x.id === q); if (!ob || !st.live[ob.id] || !p.liftedIds.includes(ob.id)) continue; st.live[ob.id].at = [ob.at[0], ob.at[1]]; const cb = st.cubs[ob.id]; if (cb) { cb.position.set(ob.at[0], cb.position.y, ob.at[1]); setBoxLook(cb, C.paper, 0.26); } }
        }
      }
      else if (d.kind === 'rotate' && d.moved) p.onRotated?.(d.id, st.live[d.id].rot);
    };
    const wheel = (e: WheelEvent) => { e.preventDefault(); zoom(camera.fov * (1 + e.deltaY * 0.001)); };
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);

    let raf = 0, lookT: number | undefined, toLat = -24; // where the view tilts to when it turns to a spot
    let bad: Obj | null = null; // what the carried object currently overlaps
    const SOFT_RED = 0xe58b7c;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const d = st.drag;
      if ((d?.kind === 'drag' || d?.kind === 'gdrag') && d.ly !== undefined && !st.gy?.got) { // pan at the screen edge (not needed when the phone is the view)
        const r = el.getBoundingClientRect(), k = d.lx - r.left < 40 ? -0.9 : d.lx - r.left > r.width - 40 ? 0.9 : 0;
        if (k) { st.lon += k; aim(); setRay({ clientX: d.lx, clientY: d.ly }); if (d.kind === 'drag' && P.current.objs.find((x) => x.id === d.id)?.wall) { const wp = wallPoint(); if (wp) moveWall(d.id, wp); } else { const fh = floorHit(); if (fh) (d.kind === 'gdrag' ? moveGhost : moveTo)(d.id, [fh[0] + d.off[0], fh[1] + d.off[1]]); } }
      }
      if (st.toLon !== null) { const diff = ((st.toLon - st.lon + 540) % 360) - 180; st.lon += diff * 0.12; st.lat += (toLat - st.lat) * 0.12; if (Math.abs(diff) < 0.3) st.toLon = null; }
      // Gyro look-around. The view is where the phone's back camera points: the tilt comes from gravity, so the floor of the room is the real
      // ground, and the turn is counted from the heading the room was based on. A carried object keeps moving under the finger as the view moves.
      const gy = st.gy;
      if (gy?.got) {
        const dr = Math.PI / 180, ca = Math.cos(gy.a * dr), sa = Math.sin(gy.a * dr), sb = Math.sin(gy.b * dr), cb = Math.cos(gy.b * dr), sg = Math.sin(gy.g * dr), cg = Math.cos(gy.g * dr);
        const dx = -(ca * sg + sa * sb * cg), dy = -(sa * sg - ca * sb * cg), dz = -(cb * cg); // the back camera's direction: east, north, up
        const el = Math.asin(Math.max(-1, Math.min(1, dz))) / dr, az = Math.atan2(dx, dy) / dr;
        if (st.toLon !== null) gy.rebase = true; // the view is gliding to a spot: take the heading again afterwards
        else {
          if (gy.rebase) { gy.az0 = az; gy.lon0 = st.lon; gy.rebase = false; }
          st.lon = gy.lon0 + (((az - gy.az0 + 540) % 360) - 180); st.lat = Math.max(-85, Math.min(85, el));
        }
      }
      aim();
      if (gy?.got) {
        const dd = st.drag; // an object held under the finger follows the finger as the view moves
        if ((dd?.kind === 'drag' || dd?.kind === 'gdrag') && dd.ly !== undefined) {
          camera.updateMatrixWorld(); setRay({ clientX: dd.lx, clientY: dd.ly });
          if (dd.kind === 'gdrag') { const fh = floorHit(); if (fh) moveGhost(dd.id, [fh[0] + dd.off[0], fh[1] + dd.off[1]]); }
          else if (P.current.objs.find((x) => x.id === dd.id)?.wall) { const wp = wallPoint(); if (wp) moveWall(dd.id, wp); }
          else { const fh = floorHit(); if (fh) moveTo(dd.id, [fh[0] + dd.off[0], fh[1] + dd.off[1]]); }
        }
        if (st.carry) carryStep();
      }
      if (P.current.rendering || P.current.ghosts.some((g) => g.loading)) { st.uT.value = performance.now() / 1000; st.dirty = true; } // the sheen moves, so keep drawing
      const cs = `${st.lon.toFixed(3)},${st.lat.toFixed(3)},${camera.fov.toFixed(2)}`;
      if (!st.dirty && !st.drag && cs === st.last) return; // nothing moved: skip the draw
      if (cs !== st.last) { P.current.onAim?.(st.lon, st.lat); clearTimeout(lookT); lookT = window.setTimeout(() => P.current.onLook?.(), 100); }
      st.last = cs; st.dirty = false;
      renderer.render(scene, camera);
      // pins
      const pv = new THREE.Vector3();
      for (const pin of P.current.pins) {
        const node = pinEls.current[pin.id]; if (!node) continue;
        let pos = pin.pos;
        if (pin.follow) { const o = P.current.objs.find((x) => x.id === pin.follow), L = st.live[pin.follow]; if (o && L) { // a pin can sit on the mean position of two linked objects
            const o2 = pin.with ? P.current.objs.find((x) => x.id === pin.with) : null, L2 = pin.with ? st.live[pin.with] : null;
            pos = o2 && L2 ? [(L.at[0] + L2.at[0]) / 2, (topH(o) + topH(o2)) / 2 + 0.05, (L.at[1] + L2.at[1]) / 2] : [L.at[0], (o.wall ? (L.y ?? o.y ?? 1.45) + o.dims[1] / 2 : topH(o)) + 0.05, L.at[1]];
          } }
        if (!pos) { node.style.display = 'none'; continue; }
        pv.set(pos[0], pos[1], pos[2]).project(camera);
        if (pv.z > 1 || Math.abs(pv.x) > 1.15 || Math.abs(pv.y) > 1.1) { node.style.display = 'none'; continue; }
        node.style.display = '';
        if (pin.clamp) { // a menu attached to an object: centred above it, but kept on screen and clear of the top and bottom bars
          const w = node.offsetWidth, h = node.offsetHeight;
          const x = Math.max(8, Math.min(st.w - w - 8, (pv.x + 1) / 2 * st.w - w / 2)), y = Math.max(124, Math.min(st.h - 150 - h, (1 - pv.y) / 2 * st.h - h - 6));
          node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          continue;
        }
        if (pin.fit) { // a label under the object, kept inside the screen sideways
          const w = node.offsetWidth, x = Math.max(8, Math.min(st.w - w - 8, (pv.x + 1) / 2 * st.w - w / 2));
          node.style.transform = `translate(${x.toFixed(1)}px, ${((1 - pv.y) / 2 * st.h + 14).toFixed(1)}px)`; continue;
        }
        node.style.transform =`translate(${((pv.x + 1) / 2 * st.w).toFixed(1)}px, ${((1 - pv.y) / 2 * st.h).toFixed(1)}px) ${pin.shift || 'translate(-50%, -100%)'}`;
      }
    };
    const aim = () => {
      const phi = (90 - st.lat) * DEG, th = st.lon * DEG;
      camera.position.set(0, 1.35, 0);
      camera.lookAt(50 * Math.sin(phi) * Math.cos(th), 1.35 + 50 * Math.cos(phi), 50 * Math.sin(phi) * Math.sin(th));
    };
    frame();
    if (P.current.apiRef) P.current.apiRef.current = {
      lookAt: (x, z, lat) => { st.toLon = Math.atan2(z, x) / DEG; toLat = lat ?? -24; },
      centre: () => { const th = st.lon * DEG; return [Math.cos(th) * 0.8, Math.sin(th) * 0.8]; },
      moving: () => st.toLon !== null,
      carryPoint: (id, cx, cy) => { st.carry = id ? { id, cx: cx ?? 0, cy: cy ?? 0 } : null; if (id) carryStep(); },
      moveCarry: (id, at, y) => { if (!st.live[id]) return; const ob = P.current.objs.find((x) => x.id === id); if (ob?.wall && y !== undefined) moveWall(id, [at[0], y, at[1]]); else moveTo(id, at); },
      liveY: (id) => st.live[id]?.y, // carry an object that the editor is holding (a tile dragged out of the drawer)
      liveAt: (id) => (st.live[id] ? [st.live[id].at[0], st.live[id].at[1]] : null),
      wallAt: (cx, cy) => { // the first wall, floor or ceiling the view ray meets
        setRay({ clientX: cx, clientY: cy }); const o = ray.ray.origin.toArray(), dr = ray.ray.direction.toArray(), lo = [-1.7, 0, -1.7], hi = [1.7, 2.75, 1.7];
        let best: { t: number; p: [number, number, number] } | null = null;
        for (let a = 0; a < 3; a++) for (const bd of [lo[a], hi[a]]) {
          if (Math.abs(dr[a]) < 1e-6) continue; const t = (bd - o[a]) / dr[a]; if (t <= 0 || (best && t >= best.t)) continue;
          const p = [o[0] + dr[0] * t, o[1] + dr[1] * t, o[2] + dr[2] * t] as [number, number, number];
          if ([0, 1, 2].every((k) => k === a || (p[k] >= lo[k] - 1e-3 && p[k] <= hi[k] + 1e-3))) { p[a] = bd + (bd === lo[a] ? 0.03 : -0.03); best = { t, p }; }
        }
        return best?.p ?? null;
      },
      inView: (pts) => pts.every((q) => { const v3 = new THREE.Vector3(q[0], q[1], q[2]).project(camera); return v3.z < 1 && Math.abs(v3.x) <= 1 && Math.abs(v3.y) <= 1; }),
      floorAt: (cx, cy) => { setRay({ clientX: cx, clientY: cy }); return floorHit(); },
    };
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener('wheel', wheel); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      try { room.dispose(); renderer.dispose(); } catch { /* already gone */ }
      S.current = null;
    };
  }, []);

  // Anything React changes (pins, objects, selection) needs one redraw
  useEffect(() => { if (S.current) S.current.dirty = true; });

  // ---- gyro look-around
  useEffect(() => {
    const st = S.current; if (!st || !props.gyro) return;
    const gy = { a: 0, b: 0, g: 0, az0: 0, lon0: 0, got: false, rebase: true }; st.gy = gy;
    const on = (e: DeviceOrientationEvent) => { if (e.alpha == null || e.beta == null) return; gy.a = e.alpha; gy.b = e.beta; gy.g = e.gamma ?? 0; gy.got = true; };
    window.addEventListener('deviceorientation', on);
    const t = setTimeout(() => { if (!gy.got) P.current.onGyroFail?.(); }, 1500);
    return () => { window.removeEventListener('deviceorientation', on); clearTimeout(t); if (st.gy === gy) st.gy = null; };
  }, [props.gyro]);

  // ---- sync the room to the objects
  const { objs, boxIds, liftedIds, selected, was, ghosts, palette } = props;
  const key = JSON.stringify([objs.map((o) => [o.id, o.at, o.rot, o.inRoom, o.dims]), boxIds, liftedIds, selected, was, ghosts, palette, props.rendering]);
  useEffect(() => {
    const st = S.current; if (!st) return;
    const cp: Record<string, [number, number, number]> = {}, cr: Record<string, number> = {};
    const removed: string[] = [], staged: any[] = [];
    st.live = {};
    for (const o of objs) {
      st.live[o.id] = { at: [o.at[0], o.at[1]], rot: o.rot };
      if (o.origin === 'room') {
        if (!o.inRoom) { removed.push(o.id); continue; }
        const s0 = START.find((s) => s.id === o.id)!;
        if (s0.at[0] !== o.at[0] || s0.at[1] !== o.at[1] || s0.rot !== o.rot) { cp[o.id] = [o.at[0], 0, o.at[1]]; cr[o.id] = o.rot; }
      } else if (o.inRoom && !boxIds.includes(o.id)) {
        staged.push({ id: o.id, name: o.name, type: o.model || 'chair', position: [o.at[0], o.wall ? (o.y ?? 1.45) : 0, o.at[1]], rotationY: o.rot, isWireframe: false, isGlowing: false, dimensions: o.dims });
        cr[o.id] = o.rot;
      }
    }
    st.room.updateScenarioState?.({ ...INITIAL_SCENARIO_STATE, palette: palette as any, removedAssetIds: removed }, staged, false, cp, false, cr, false, 'completed');
    // The room's own pieces take the size they were edited to, so the rendered object matches its staging shape.
    // Scaled about the footprint centre, then dropped back onto the floor.
    for (const o of objs) {
      if (o.origin !== 'room' || !o.inRoom) continue;
      const k = o.dims.map((v, i) => v / o.det[i]);
      if (k.every((x) => Math.abs(x - 1) < 1e-3)) continue;
      const g = st.room.group.getObjectByName(o.id); if (!g) continue;
      g.updateMatrixWorld(true); const y0 = new THREE.Box3().setFromObject(g).min.y;
      g.scale.set(k[0], k[1], k[2]); g.updateMatrixWorld(true);
      g.position.y += y0 - new THREE.Box3().setFromObject(g).min.y;
    }
    // Furniture casts and receives the room's light
    for (const o of objs) st.room.group.getObjectByName(o.origin === 'room' ? o.id : `staged_${o.id}`)?.traverse((c) => { const m = c as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    st.renderer.shadowMap.needsUpdate = true;
    st.overlay.clear(); st.cubs = {}; st.gcubs = {}; st.glive = {};
    // While Layo is finding spots, the ghosts carry a soft rose sheen that sweeps across them
    const shimmer = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uT: st.uT },
      vertexShader: 'varying vec3 vP; void main() { vP = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform float uT; varying vec3 vP; void main() { float s = 0.5 + 0.5 * sin((vP.x + vP.z * 0.7 + vP.y * 1.4) * 5.0 - uT * 2.6); float band = smoothstep(0.35, 1.0, s); vec3 col = mix(vec3(0.98, 0.96, 0.93), vec3(0.95, 0.62, 0.72), band); gl_FragColor = vec4(col, 0.2 + 0.36 * band); }',
    });
    const selMat = new THREE.MeshBasicMaterial({ color: 0xfff4e6, transparent: true, opacity: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    for (const o of objs) {
      if (!o.inRoom) continue;
      const isBox = boxIds.includes(o.id);
      if (isBox) {
        const m = st.room.group.getObjectByName(o.id); if (m) m.visible = false;
        const tree = buildStagingProxy(o.kind, o.dims[0], Math.max(o.dims[1], 0.04), o.dims[2]);
        const cub = tree.getObjectByName('active_directional_cuboid')!;
        cub.position.set(o.at[0], o.wall ? (o.y ?? 1.45) : Math.max(o.dims[1], 0.04) / 2 + 0.01, o.at[1]); if (o.wall && st.live[o.id]) st.live[o.id].y = o.y ?? 1.45; cub.rotation.y = o.rot;
        if (o.wall) { const sh = cub.getObjectByName('soft_shadow'); if (sh) sh.visible = false; } // a poster casts no shadow on the floor
        setBoxLook(cub, C.paper, selected.includes(o.id) || liftedIds.includes(o.id) ? 0.3 : 0.16);
        if (P.current.rendering) cub.getObjectByName('body')?.traverse((m) => { if ((m as THREE.Mesh).isMesh) (m as THREE.Mesh).material = shimmer; }); // being rendered
        const outline = cub.getObjectByName('box_edges'); if (outline) outline.visible = false; // fill only, no outline
        st.overlay.add(tree); st.cubs[o.id] = cub;
      }
      if (selected.includes(o.id) && !liftedIds.includes(o.id) && !isBox) {
        // Selected: the object's own meshes, redrawn with a light translucent shader laid over them
        const g = st.room.group.getObjectByName(o.origin === 'room' ? o.id : `staged_${o.id}`);
        if (g) {
          g.updateMatrixWorld(true);
          g.traverse((c) => {
            const m = c as THREE.Mesh; if (!m.isMesh || !m.geometry || m.userData?.isDetectorGlow) return;
            for (let q: THREE.Object3D | null = m; q && q !== g.parent; q = q.parent) if (!q.visible) return;
            const ov = new THREE.Mesh(m.geometry, selMat); ov.matrixAutoUpdate = false; ov.matrix.copy(m.matrixWorld); ov.renderOrder = 25; ov.raycast = () => {}; st.overlay.add(ov);
          });
        }
      }
    }
    for (const g of was) {
      const grp = new THREE.Group(), e = edges(g.dims, C.blue, true, false); e.position.y = g.dims[1] / 2; grp.add(e, floorPatch(g.dims[0], g.dims[2], C.sky, 0.32));
      grp.position.set(g.at[0], 0, g.at[1]); grp.rotation.y = g.rot; st.overlay.add(grp);
    }
    for (const g of ghosts) { // an AI proposal: the same soft staging model as a carried object, outlined with a dashed paper-white stroke along its own edges
      const h = Math.max(g.dims[1], 0.04);
      const tree = buildStagingProxy(g.kind ?? 'generic', g.dims[0], h, g.dims[2]);
      const cub = tree.getObjectByName('active_directional_cuboid')!;
      cub.position.set(g.at[0], h / 2 + 0.01, g.at[1]); cub.rotation.y = g.rot; setBoxLook(cub, C.paper, g.focus ? 0.4 : 0.26); st.gcubs[g.id] = cub; st.glive[g.id] = { at: [g.at[0], g.at[1]] };
      if (g.loading) cub.getObjectByName('body')?.traverse((m) => { if ((m as THREE.Mesh).isMesh) (m as THREE.Mesh).material = shimmer; });
      // The dashed stroke belongs to the translucent model: its own outline (rounded like the body, wrapping top, bottom and corners) is switched to a dashed paper-white line
      const own = cub.getObjectByName('box_edges') as THREE.LineSegments | undefined;
      if (own) { own.material = new THREE.LineDashedMaterial({ color: C.paper, dashSize: 0.07, gapSize: 0.05, transparent: true, opacity: 0.95, depthTest: false }); own.computeLineDistances(); own.visible = true; }
      st.overlay.add(tree);
    }
  }, [key]);

  return (
    <div ref={wrap} className="stage">
      <canvas ref={canvas} role="img" aria-label="Your room in 3D, seen from its centre. Drag to look around." style={{ filter: props.soft ? 'blur(10px) saturate(110%)' : 'none', transform: props.soft ? 'scale(1.06)' : 'none', cursor: 'grab' }} />
      {props.pins.map((p) => <div key={p.id} className="pin" ref={(n) => { pinEls.current[p.id] = n; }} style={{ display: 'none' }}>{p.node}</div>)}
    </div>
  );
};
