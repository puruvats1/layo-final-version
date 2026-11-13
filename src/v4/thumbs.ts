/* Asset thumbnails: every object's own 3D model, drawn once from an isometric camera on a transparent background.
   Made from the same procedural models the room uses, so a thumbnail always matches what the object looks like in the room. */
import * as THREE from 'three';
import type { Room3DScene } from '../utils/proceduralRoom3D';
import { INITIAL_SCENARIO_STATE } from '../data/scenarioSteps';
import { START, PREPARED, type Obj } from './room';

const SIZE = 192;
let cache: Record<string, string> | null = null;

export const makeThumbs = (room: Room3DScene): Record<string, string> => {
  if (cache) return cache;
  const out: Record<string, string> = {};
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    const all: Obj[] = [...START, ...Object.values(PREPARED)];
    // Everything that is not part of the room's own set is built through the staged-object path
    const staged = all.filter((o) => o.origin !== 'room').map((o) => ({ id: o.id, name: o.name, type: o.model || 'chair', position: [0, 0, 0] as [number, number, number], rotationY: 0, isWireframe: false, isGlowing: false, dimensions: o.dims }));
    room.updateScenarioState?.({ ...INITIAL_SCENARIO_STATE, palette: 'warm_studio' as any, removedAssetIds: [] }, staged as any, false, {}, false, {}, false, 'completed');

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(SIZE, SIZE, false); renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    // One lighting rig for the whole set: warm key with a soft shadow, a gentle sky fill, a cool rim from behind
    scene.add(new THREE.HemisphereLight(0xfff8ef, 0xcfc4b6, 0.95));
    const sun = new THREE.DirectionalLight(0xfff0dc, 2.1); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0006; sun.shadow.radius = 4; scene.add(sun, sun.target);
    const rim = new THREE.DirectionalLight(0xcfe2ff, 0.8); scene.add(rim);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);

    for (const o of all) {
      const src = room.group.getObjectByName(o.origin === 'room' ? o.id : `staged_${o.id}`);
      if (!src) continue;
      const g = src.clone(true); g.traverse((c) => { const m = c as THREE.Mesh; if (m.isMesh) m.castShadow = true; });
      g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.scale.set(1, 1, 1); g.visible = true;
      scene.add(g); g.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(g);
      if (box.isEmpty()) { scene.remove(g); continue; }
      const centre = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
      sun.position.copy(centre).add(new THREE.Vector3(r * 1.1, r * 2.6, r * 0.7)); sun.target.position.copy(centre);
      const sc = sun.shadow.camera; sc.left = -r * 1.8; sc.right = r * 1.8; sc.top = r * 1.8; sc.bottom = -r * 1.8; sc.near = 0.1; sc.far = r * 8; sc.updateProjectionMatrix();
      rim.position.copy(centre).add(new THREE.Vector3(-r * 1.5, r * 1.2, -r * 2));
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(r * 7, r * 7), new THREE.ShadowMaterial({ opacity: 0.24 })); floor.rotation.x = -Math.PI / 2; floor.position.set(centre.x, box.min.y - 0.002, centre.z); floor.receiveShadow = true; scene.add(floor);
      const dir = new THREE.Vector3(1, 0.82, 1).normalize();
      cam.position.copy(centre).addScaledVector(dir, 20); cam.lookAt(centre);
      const half = r * 1.04; cam.left = -half; cam.right = half; cam.top = half; cam.bottom = -half; cam.updateProjectionMatrix();
      renderer.render(scene, cam);
      out[o.id] = renderer.domElement.toDataURL('image/png');
      scene.remove(g, floor); floor.geometry.dispose();
    }
    // Photos for the add flow's recents: the bookshelf against a wall, the poster hung on one
    const photo = (id: string, hang: boolean) => {
      const src = room.group.getObjectByName(`staged_${id}`); const ob = all.find((q) => q.id === id); if (!src || !ob) return;
      const sc = new THREE.Scene(); sc.background = new THREE.Color(0xe9e2d6);
      sc.add(new THREE.HemisphereLight(0xfff8ef, 0xcfc4b6, 1.1)); const key = new THREE.DirectionalLight(0xfff0dc, 1.8); key.position.set(-2, 3, 4); sc.add(key);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: 0xd9d2c4, roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; sc.add(floor);
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshStandardMaterial({ color: 0xece6da, roughness: 1 })); wall.position.set(0, 2, -1); sc.add(wall);
      const g = src.clone(true); g.rotation.set(0, 0, 0); g.scale.set(1, 1, 1);
      g.position.set(0, hang ? 1.35 : ob.dims[1] / 2, -1 + ob.dims[2] / 2 + 0.005); sc.add(g);
      const cam = new THREE.PerspectiveCamera(hang ? 34 : 40, 1, 0.1, 30); cam.position.set(hang ? 0.45 : 0.9, hang ? 1.4 : 1.15, hang ? 2.1 : 2.6); cam.lookAt(0, hang ? 1.35 : 0.8, -1);
      renderer!.setClearColor(0xe9e2d6, 1); renderer!.render(sc, cam); out['photo:' + id] = renderer!.domElement.toDataURL('image/jpeg', 0.9); renderer!.setClearColor(0x000000, 0);
    };
    photo('added_shelf', false); photo('added_poster', true);
  } catch { /* thumbnails are a nicety: tiles fall back to a letter */ }
  finally { try { renderer?.dispose(); renderer?.forceContextLoss(); } catch { /* already gone */ } }
  cache = out;
  return out;
};
