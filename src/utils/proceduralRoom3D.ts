import { buildStagingProxy, proxyKindFor, setBoxLook, BOX_FREE } from './stagingProxy';
import * as THREE from 'three';
import { RoomModeId, LightingSetting, ScenarioState, StagedObject, IdentificationStep } from '../types';
import { DETECTED_BASELINE_OBJECTS } from '../data/mockData';
import {
  createPolishedCeramicFloorTexture,
  createOffWhitePlasterWallTexture,
  createDarkWalnutDoorTexture,
  createFloralCurtainTexture,
  createBurgundyCurtainTexture,
  createTerracottaCurtainTexture,
  createCoolPastelCurtainTexture,
  createACFrontPanelTexture,
  createOutdoorGardenWindowTexture,
  createPaisleyBedsheetTexture,
  createCoolPastelBedsheetTexture,
  createBohoRugTexture,
  createWoodSlatsTexture,
  createNaturalWoodGrainTexture,
  createWovenRattanHamperTexture,
  createBrushedMetalTexture,
  createFabricLinenTexture
} from './proceduralRoomTextures';

export interface Room3DScene {
  group: THREE.Group;
  interactiveMeshes: THREE.Object3D[];
  updateLighting: (lighting: LightingSetting) => void;
  updateScenarioState?: (
    state: ScenarioState,
    stagedObjects?: StagedObject[],
    showDetectedOutlines?: boolean,
    customPositions?: Record<string, [number, number, number]>,
    isRoomCleared?: boolean,
    customRotations?: Record<string, number>,
    isDetectionPhase?: boolean,
    identificationStep?: IdentificationStep
  ) => void;
  tickAnimation: (delta: number) => void;
  fanMeshGroup: THREE.Group | null;
  dispose: () => void;
}

/**
 * Procedural 3D Square Room Architectural Reconstruction
 * Faithful to user specifications, reference equirectangular photo, and attached architectural floor plan:
 *
 * 1. North Wall (Z = -HALF_L):
 *    - Door in dead center of the room (X = 0)
 *    - Wardrobe on the left of the door (North-West corner)
 *    - Modular switchboard & socket ("E") on the right of the door
 *    - Dropped ceiling beam overhead
 *
 * 2. South Wall (Z = +HALF_L):
 *    - 2 Sliding Windows with aluminium frames, safety grills, marble sills & curtains
 *    - High-Wall Split AC unit mounted above Window 1 with dedicated AC starter box & conduit
 *    - Modular switchboard & power sockets ("E") in dead center between the 2 windows
 *    - Dropped ceiling beam overhead
 *
 * 3. West Wall (X = -HALF_W):
 *    - Flat architectural wall (NO window, NO switchboard)
 *    - Bed positioned along this wall as marked on the floor plan
 *
 * 4. East Wall (X = +HALF_W):
 *    - Flat architectural wall (NO recessed alcove geometry, NO switchboard)
 *    - Study table & side furniture as marked on the floor plan
 *    - Slimline LED batten tube light fixture mounted high for ambient illumination
 *
 * 5. Ceiling:
 *    - Center 3-Blade Aerodynamic Ceiling Fan with animated blade rotation
 *
 * 6. Floor:
 *    - Polished square ceramic tiles (3.40m x 3.40m)
 */
/** A world map for the poster: sea, continents with a shaded edge, a graticule, a few city dots, a compass and a title. */
function createWorldMapTexture(): THREE.CanvasTexture {
  const W = 2048, H = 1400, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!;
  const M = 70, mw = W - 2 * M, mh = H - 2 * M - 150; // the map's rectangle; equirectangular, 85 N to 60 S
  g.fillStyle = '#f4ecda'; g.fillRect(0, 0, W, H);
  const sea = g.createLinearGradient(0, M, 0, M + mh); sea.addColorStop(0, '#bcd6dc'); sea.addColorStop(1, '#9fc4cf'); g.fillStyle = sea; g.fillRect(M, M, mw, mh);
  const px = (lon: number) => M + ((lon + 180) / 360) * mw, py = (lat: number) => M + ((85 - lat) / 145) * mh;
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2;
  for (let lon = -150; lon <= 150; lon += 30) { g.beginPath(); g.moveTo(px(lon), M); g.lineTo(px(lon), M + mh); g.stroke(); }
  for (let lat = -45; lat <= 75; lat += 30) { g.beginPath(); g.moveTo(M, py(lat)); g.lineTo(M + mw, py(lat)); g.stroke(); }
  const land: [number, number][][] = [
    [[-168,66],[-156,71],[-140,70],[-125,72],[-95,73],[-80,73],[-62,60],[-55,50],[-66,44],[-76,35],[-81,25],[-97,26],[-97,18],[-87,21],[-83,10],[-78,8],[-90,14],[-105,20],[-112,30],[-117,33],[-124,40],[-125,49],[-135,58],[-150,60],[-165,60]],
    [[-72,78],[-55,83],[-20,82],[-20,70],[-43,60],[-52,67]],
    [[-78,8],[-62,11],[-50,0],[-35,-6],[-40,-22],[-48,-27],[-58,-38],[-65,-45],[-70,-55],[-75,-48],[-73,-30],[-70,-18],[-81,-6],[-80,2]],
    [[-10,36],[-9,43],[-1,48],[3,52],[8,56],[5,61],[14,68],[28,71],[32,64],[40,60],[30,46],[28,41],[22,37],[12,38],[3,40]],
    [[-17,21],[-10,30],[-5,36],[10,37],[25,32],[33,31],[43,12],[51,12],[40,-5],[40,-15],[33,-26],[20,-35],[14,-30],[12,-12],[9,4],[-8,5],[-17,14]],
    [[28,41],[40,60],[60,70],[80,73],[110,76],[140,72],[170,68],[180,65],[160,55],[142,48],[130,35],[122,30],[120,22],[108,10],[100,2],[98,15],[92,22],[80,8],[72,20],[58,25],[50,30],[36,36]],
    [[113,-22],[130,-12],[142,-11],[153,-27],[147,-39],[135,-35],[115,-34]],
    [[130,33],[141,38],[142,44],[136,36]], [[-8,50],[2,52],[-3,58],[-6,55]], [[44,-13],[50,-16],[47,-25],[43,-22]], [[166,-46],[174,-37],[178,-39],[170,-46]],
    [[95,5],[106,-6],[120,-9],[135,-5],[120,2],[105,3]], [[-180,-72],[180,-72],[180,-60],[-180,-60]],
  ];
  const tint = ['#cdb78a', '#e8e0cc', '#a9bb94', '#d8ae93', '#dcb98b', '#b9c593', '#dd9f8c', '#c9c39a', '#d8c9a4', '#cdb78a', '#a9bb94', '#c9d3bd', '#f2f0ea'];
  land.forEach((pts, k) => {
    g.beginPath(); pts.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), py(la)) : g.moveTo(px(lo), py(la)))); g.closePath();
    g.fillStyle = tint[k % tint.length]; g.fill(); g.lineJoin = 'round'; g.strokeStyle = 'rgba(70,60,40,.55)'; g.lineWidth = 3.5; g.stroke();
  });
  g.fillStyle = '#8c2f39'; [[-74,40],[-0.1,51.5],[139.7,35.7],[77.2,28.6],[151.2,-33.9],[-46.6,-23.5],[31.2,30],[18.4,-33.9]].forEach(([lo, la]) => { g.beginPath(); g.arc(px(lo), py(la), 9, 0, Math.PI * 2); g.fill(); });
  g.strokeStyle = '#2b2522'; g.lineWidth = 5; g.strokeRect(M, M, mw, mh);
  g.fillStyle = '#2b2522'; g.textAlign = 'left'; g.font = '700 84px sans-serif'; g.fillText('THE WORLD', M, H - 70);
  g.font = '400 34px sans-serif'; g.fillStyle = '#6b6257'; g.fillText('Mercator style · 1 : 40 000 000', M + 4, H - 28);
  // a compass rose, bottom right
  const cx = W - M - 90, cy = H - 92; g.fillStyle = '#2b2522'; g.beginPath(); g.moveTo(cx, cy - 62); g.lineTo(cx + 16, cy); g.lineTo(cx, cy + 62); g.lineTo(cx - 16, cy); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(cx - 62, cy); g.lineTo(cx, cy - 16); g.lineTo(cx + 62, cy); g.lineTo(cx, cy + 16); g.closePath(); g.fillStyle = '#8c2f39'; g.fill();
  g.fillStyle = '#2b2522'; g.textAlign = 'center'; g.font = '700 34px sans-serif'; g.fillText('N', cx, cy - 72);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function build3DSquareRoom(
  _initialMode: RoomModeId,
  initialLighting: LightingSetting
): Room3DScene {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Procedural3DSquareRoom';

  const interactiveMeshes: THREE.Object3D[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  // Accurate Room Dimensions (3.40m x 3.40m x 2.75m)
  const ROOM_W = 3.4;
  const ROOM_L = 3.4;
  const ROOM_H = 2.75;
  const HALF_W = ROOM_W / 2; // 1.70
  const HALF_L = ROOM_L / 2; // 1.70

  // --- 1. PROCEDURAL ARCHITECTURAL MATERIALS ---
  const floorTex = createPolishedCeramicFloorTexture();
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(3, 3);
  disposables.push(floorTex);

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.18,
    metalness: 0.12
  });
  disposables.push(floorMaterial);

  const wallTex = createOffWhitePlasterWallTexture();
  wallTex.wrapS = THREE.RepeatWrapping;
  wallTex.wrapT = THREE.RepeatWrapping;
  wallTex.repeat.set(3, 2);
  disposables.push(wallTex);

  const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallTex,
    color: 0xfbf9f5,
    roughness: 0.88,
    metalness: 0.02
  });
  disposables.push(wallMaterial);

  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0xfdfdfd,
    roughness: 0.95,
    metalness: 0.01
  });
  disposables.push(ceilingMaterial);

  const baseboardMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0ece5,
    roughness: 0.45,
    metalness: 0.05
  });
  disposables.push(baseboardMaterial);

  const darkWalnutTex = createDarkWalnutDoorTexture();
  disposables.push(darkWalnutTex);
  const darkWalnutMaterial = new THREE.MeshStandardMaterial({
    map: darkWalnutTex,
    roughness: 0.42,
    metalness: 0.08
  });
  disposables.push(darkWalnutMaterial);

  // Natural Wood Grain Materials (for Desk, Wardrobe, Side Table, Bed Frame)
  const naturalWoodTex = createNaturalWoodGrainTexture('walnut');
  naturalWoodTex.wrapS = THREE.RepeatWrapping;
  naturalWoodTex.wrapT = THREE.RepeatWrapping;
  disposables.push(naturalWoodTex);
  const naturalWoodMaterial = new THREE.MeshStandardMaterial({
    map: naturalWoodTex,
    roughness: 0.45,
    metalness: 0.08
  });
  disposables.push(naturalWoodMaterial);

  const teakWoodTex = createNaturalWoodGrainTexture('teak');
  teakWoodTex.wrapS = THREE.RepeatWrapping;
  teakWoodTex.wrapT = THREE.RepeatWrapping;
  disposables.push(teakWoodTex);
  const teakWoodMaterial = new THREE.MeshStandardMaterial({
    map: teakWoodTex,
    roughness: 0.46,
    metalness: 0.06
  });
  disposables.push(teakWoodMaterial);

  // Woven Rattan Basket Material for Laundry Bucket
  const rattanTex = createWovenRattanHamperTexture();
  disposables.push(rattanTex);
  const hamperMaterial = new THREE.MeshStandardMaterial({
    map: rattanTex,
    roughness: 0.82,
    metalness: 0.04
  });
  disposables.push(hamperMaterial);

  // Brushed Metal Material for Pedestal Fan and Window Grill
  const brushedMetalTex = createBrushedMetalTexture();
  disposables.push(brushedMetalTex);
  const brushedMetalMaterial = new THREE.MeshStandardMaterial({
    map: brushedMetalTex,
    roughness: 0.35,
    metalness: 0.82
  });
  disposables.push(brushedMetalMaterial);

  // Fabric Linen Material for Laundry Liner and Cushions
  const linenTex = createFabricLinenTexture();
  disposables.push(linenTex);
  const linenMaterial = new THREE.MeshStandardMaterial({
    map: linenTex,
    roughness: 0.85,
    metalness: 0.02
  });
  disposables.push(linenMaterial);

  const doorFrameMat = new THREE.MeshStandardMaterial({
    color: 0x24160c,
    roughness: 0.55
  });
  disposables.push(doorFrameMat);

  const aluminiumMaterial = new THREE.MeshStandardMaterial({
    color: 0xd6d8dc,
    roughness: 0.28,
    metalness: 0.75
  });
  disposables.push(aluminiumMaterial);

  const safetyGrillMaterial = new THREE.MeshStandardMaterial({
    color: 0x374151,
    roughness: 0.45,
    metalness: 0.65
  });
  disposables.push(safetyGrillMaterial);

  const windowSillMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.22,
    metalness: 0.08
  });
  disposables.push(windowSillMaterial);

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    roughness: 0.12,
    metalness: 0.92
  });
  disposables.push(chromeMaterial);

  const brassMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.85
  });
  disposables.push(brassMaterial);

  const applianceWhite = new THREE.MeshStandardMaterial({
    color: 0xfcfcfc,
    roughness: 0.2,
    metalness: 0.03
  });
  disposables.push(applianceWhite);

  const plugPlateMat = new THREE.MeshStandardMaterial({
    color: 0xfcfcfc,
    roughness: 0.22,
    metalness: 0.02
  });
  disposables.push(plugPlateMat);

  const switchRockerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.02
  });
  disposables.push(switchRockerMat);

  const switchCavityMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    roughness: 0.6
  });
  disposables.push(switchCavityMat);

  const socketHoleMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
  disposables.push(socketHoleMat);

  const indicatorRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  disposables.push(indicatorRedMat);

  // --- 2. ARCHITECTURAL ROOM SHELL ---
  const wallsGroup = new THREE.Group();
  wallsGroup.name = 'BaseRoomShell';
  rootGroup.add(wallsGroup);

  // Floor (Polished ceramic tiles covering square room 3.4m x 3.4m)
  const mainFloorGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_L);
  const mainFloorMesh = new THREE.Mesh(mainFloorGeo, floorMaterial);
  mainFloorMesh.rotation.x = -Math.PI / 2;
  mainFloorMesh.position.set(0, 0, 0);
  mainFloorMesh.receiveShadow = true;
  mainFloorMesh.name = 'obj_ceramic_tiles';
  mainFloorMesh.userData = { id: 'obj_ceramic_tiles', name: 'Polished Ceramic Tile Flooring' };
  interactiveMeshes.push(mainFloorMesh);
  wallsGroup.add(mainFloorMesh);

  // Ceiling (3.4m x 3.4m)
  const ceilingGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_L);
  const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMaterial);
  ceilingMesh.rotation.x = Math.PI / 2;
  ceilingMesh.position.set(0, ROOM_H, 0);
  ceilingMesh.name = 'Ceiling';
  wallsGroup.add(ceilingMesh);

  // --- REUSABLE BUILDER: PHYSICAL 3D MODULAR WALL PLUG & SWITCHBOARD ---
  function buildPhysicalWallPlugUnit({
    width = 0.22,
    height = 0.11,
    numSwitches = 3,
    hasSocket = true,
    socketPosition = 'left' as 'left' | 'right',
    id = 'obj_wall_plug_points',
    name = 'Modular Wall Plug Point'
  }: {
    width?: number;
    height?: number;
    numSwitches?: number;
    hasSocket?: boolean;
    socketPosition?: 'left' | 'right';
    id?: string;
    name?: string;
  }): THREE.Group {
    const plugGroup = new THREE.Group();
    plugGroup.name = id;
    plugGroup.userData = { id, name };

    const PLATE_THICK = 0.012;

    // 1. Base Mounting Gang Plate
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, PLATE_THICK),
      plugPlateMat
    );
    basePlate.castShadow = true;
    basePlate.position.z = PLATE_THICK / 2;
    plugGroup.add(basePlate);

    // Beveled inner rim
    const innerRim = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.016, height - 0.016, 0.003),
      plugPlateMat
    );
    innerRim.position.z = PLATE_THICK + 0.0015;
    plugGroup.add(innerRim);

    // 2. Physical 3-Pin Socket Receptacle
    if (hasSocket) {
      const socketCenterX = socketPosition === 'left' ? -width / 2 + 0.055 : width / 2 - 0.055;
      const socketGroup = new THREE.Group();
      socketGroup.position.set(socketCenterX, 0, PLATE_THICK + 0.002);

      const socketFace = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 0.004, 24),
        switchCavityMat
      );
      socketFace.rotation.x = Math.PI / 2;
      socketGroup.add(socketFace);

      const earthHole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.0045, 0.008, 16),
        socketHoleMat
      );
      earthHole.rotation.x = Math.PI / 2;
      earthHole.position.set(0, 0.012, 0.003);
      socketGroup.add(earthHole);

      const liveHole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0035, 0.0035, 0.008, 16),
        socketHoleMat
      );
      liveHole.rotation.x = Math.PI / 2;
      liveHole.position.set(-0.011, -0.007, 0.003);
      socketGroup.add(liveHole);

      const neutralHole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0035, 0.0035, 0.008, 16),
        socketHoleMat
      );
      neutralHole.rotation.x = Math.PI / 2;
      neutralHole.position.set(0.011, -0.007, 0.003);
      socketGroup.add(neutralHole);

      plugGroup.add(socketGroup);
    }

    // 3. Physical Rocker Switches
    const switchZoneWidth = hasSocket ? width - 0.1 : width - 0.04;
    const switchStartX = hasSocket
      ? socketPosition === 'left'
        ? 0.02
        : -width / 2 + 0.04
      : -switchZoneWidth / 2 + 0.02;

    const switchSpacing = switchZoneWidth / Math.max(numSwitches, 1);
    const switchW = Math.min(0.028, switchSpacing * 0.7);
    const switchH = height * 0.58;

    for (let i = 0; i < numSwitches; i++) {
      const swX = switchStartX + i * switchSpacing + switchSpacing / 2;
      const swCavity = new THREE.Mesh(
        new THREE.BoxGeometry(switchW + 0.006, switchH + 0.006, 0.004),
        switchCavityMat
      );
      swCavity.position.set(swX, 0, PLATE_THICK + 0.002);
      plugGroup.add(swCavity);

      const rocker = new THREE.Mesh(
        new THREE.BoxGeometry(switchW, switchH, 0.006),
        switchRockerMat
      );
      rocker.position.set(swX, 0, PLATE_THICK + 0.005);
      rocker.rotation.x = 0.08;
      plugGroup.add(rocker);
    }

    const hitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.05),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitMesh.position.z = 0.025;
    hitMesh.userData = { id, name };
    interactiveMeshes.push(hitMesh);
    plugGroup.add(hitMesh);

    return plugGroup;
  }

  // --- REUSABLE BUILDER: SLIDING WINDOW WITH SAFETY GRILL, SILL & CURTAINS ---
  function buildWindowWithCurtains(
    posX: number,
    posY: number,
    posZ: number,
    rotY: number,
    windowId: string,
    windowName: string
  ): THREE.Group {
    const winGroup = new THREE.Group();
    winGroup.position.set(posX, posY, posZ);
    winGroup.rotation.y = rotY;
    winGroup.name = windowId;
    winGroup.userData = { id: windowId, name: windowName };

    const WIN_W = 1.05;
    const WIN_H = 1.15;

    // Outdoor Daylight Backdrop
    const skyTex = createOutdoorGardenWindowTexture(initialLighting);
    const skyGeo = new THREE.PlaneGeometry(WIN_W, WIN_H);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.position.z = -0.04;
    winGroup.add(skyMesh);

    // Aluminium Outer Casing Frame
    const outFrame = new THREE.Mesh(
      new THREE.BoxGeometry(WIN_W + 0.08, WIN_H + 0.08, 0.03),
      aluminiumMaterial
    );
    outFrame.position.z = -0.015;
    winGroup.add(outFrame);

    // Marble Windowsill Slab (protruding into the room)
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(WIN_W + 0.2, 0.05, 0.04),
      windowSillMaterial
    );
    sill.position.set(0, -WIN_H / 2 - 0.025, -0.02); // a flush ledge: it no longer sticks out into the room
    winGroup.add(sill);

    // Safety Grill (Square mesh grid bars matching photo)
    const grillGroup = new THREE.Group();
    for (let gv = -0.55; gv <= 0.55; gv += 0.14) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0025, 0.0025, WIN_H - 0.04),
        safetyGrillMaterial
      );
      bar.position.set(gv, 0, 0.003);
      grillGroup.add(bar);
    }
    for (let gh = -0.48; gh <= 0.48; gh += 0.14) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0025, 0.0025, WIN_W - 0.04),
        safetyGrillMaterial
      );
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, gh, 0.003);
      grillGroup.add(bar);
    }
    winGroup.add(grillGroup);

    // Sliding Glass Panes
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      roughness: 0.08,
      transparent: true,
      opacity: 0.35
    });
    const glassLeft = new THREE.Mesh(new THREE.PlaneGeometry(WIN_W * 0.52, WIN_H - 0.04), glassMat);
    glassLeft.position.set(-WIN_W * 0.24, 0, 0.007);
    winGroup.add(glassLeft);

    const glassRight = new THREE.Mesh(new THREE.PlaneGeometry(WIN_W * 0.52, WIN_H - 0.04), glassMat);
    glassRight.position.set(WIN_W * 0.24, 0, 0.008);
    winGroup.add(glassRight);

    // Window raycast hit target
    const winTarget = new THREE.Mesh(
      new THREE.BoxGeometry(WIN_W, WIN_H, 0.1),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    winTarget.userData = { id: windowId, name: windowName };
    interactiveMeshes.push(winTarget);
    winGroup.add(winTarget);

    // Curtain Rod with Rings & Finials
    const curtainRodGroup = new THREE.Group();
    curtainRodGroup.position.set(0, WIN_H / 2 + 0.14, 0.03);

    const rodGeo = new THREE.CylinderGeometry(0.014, 0.014, WIN_W + 0.4);
    const rodMesh = new THREE.Mesh(rodGeo, aluminiumMaterial);
    rodMesh.rotation.z = Math.PI / 2;
    curtainRodGroup.add(rodMesh);

    const finialLeft = new THREE.Mesh(new THREE.SphereGeometry(0.028), aluminiumMaterial);
    finialLeft.position.set(-(WIN_W + 0.4) / 2, 0, 0);
    curtainRodGroup.add(finialLeft);

    const finialRight = new THREE.Mesh(new THREE.SphereGeometry(0.028), aluminiumMaterial);
    finialRight.position.set((WIN_W + 0.4) / 2, 0, 0);
    curtainRodGroup.add(finialRight);

    winGroup.add(curtainRodGroup);

    // Inner Botanical Floral Curtain
    const floralTex = createFloralCurtainTexture();
    const floralMat = new THREE.MeshStandardMaterial({
      map: floralTex,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const floralCurtain = new THREE.Mesh(new THREE.PlaneGeometry(0.55, WIN_H + 0.22), floralMat);
    floralCurtain.name = 'curtain_inner_sheer';
    floralCurtain.position.set(WIN_W * 0.2, -0.05, 0.01);
    winGroup.add(floralCurtain);

    // Outer Velvet / Linen Drapes
    const burgundyTex = createBurgundyCurtainTexture();
    const burgundyMat = new THREE.MeshStandardMaterial({
      map: burgundyTex,
      roughness: 0.85,
      side: THREE.DoubleSide
    });

    const leftBurgundy = new THREE.Mesh(new THREE.PlaneGeometry(0.3, WIN_H + 0.35), burgundyMat);
    leftBurgundy.name = 'curtain_outer_left';
    leftBurgundy.position.set(-WIN_W * 0.45, -0.1, 0.012);
    winGroup.add(leftBurgundy);

    const rightBurgundy = new THREE.Mesh(new THREE.PlaneGeometry(0.3, WIN_H + 0.35), burgundyMat);
    rightBurgundy.name = 'curtain_outer_right';
    rightBurgundy.position.set(WIN_W * 0.45, -0.1, 0.012);
    winGroup.add(rightBurgundy);

    return winGroup;
  }

  // =========================================================================
  // --- 3. NORTH WALL (Z = -HALF_L): DOOR IN DEAD CENTER, WARDROBE ON LEFT ---
  // =========================================================================
  const doorW = 0.88;
  const doorH = 2.05;
  const northLeftWallW = HALF_W - doorW / 2; // 1.70 - 0.44 = 1.26m
  const northRightWallW = HALF_W - doorW / 2; // 1.26m

  // Left segment of North wall (from X = -1.70 to X = -0.44)
  const northLeftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(northLeftWallW, ROOM_H),
    wallMaterial
  );
  northLeftWall.position.set(-HALF_W + northLeftWallW / 2, ROOM_H / 2, -HALF_L);
  northLeftWall.receiveShadow = true;
  wallsGroup.add(northLeftWall);

  // Right segment of North wall (from X = +0.44 to X = +1.70)
  const northRightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(northRightWallW, ROOM_H),
    wallMaterial
  );
  northRightWall.position.set(HALF_W - northRightWallW / 2, ROOM_H / 2, -HALF_L);
  northRightWall.receiveShadow = true;
  wallsGroup.add(northRightWall);

  // Wall segment ABOVE the door (from X = -0.44 to +0.44, Y = 2.05 to 2.75)
  const wallAboveDoorH = ROOM_H - doorH;
  const wallAboveDoor = new THREE.Mesh(
    new THREE.PlaneGeometry(doorW, wallAboveDoorH),
    wallMaterial
  );
  wallAboveDoor.position.set(0, doorH + wallAboveDoorH / 2, -HALF_L);
  wallsGroup.add(wallAboveDoor);

  // Overhead beam spanning top of North wall
  const northBeam = new THREE.Mesh(
    new THREE.BoxGeometry(ROOM_W, 0.22, 0.18),
    wallMaterial
  );
  northBeam.position.set(0, ROOM_H - 0.11, -HALF_L + 0.09);
  northBeam.castShadow = true;
  wallsGroup.add(northBeam);

  // Dark Walnut Carved Entry Door (Positioned in DEAD CENTER: X = 0)
  const doorGroup = new THREE.Group();
  doorGroup.position.set(0, doorH / 2, -HALF_L + 0.02);
  doorGroup.name = 'obj_door';
  doorGroup.userData = { id: 'obj_door', name: 'Dark Walnut Carved Entry Door' };

  // Door Frame Trim
  const dFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH + 0.04, 0.05), doorFrameMat);
  dFrameLeft.position.set(-doorW / 2 + 0.03, 0, 0);
  doorGroup.add(dFrameLeft);

  const dFrameRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH + 0.04, 0.05), doorFrameMat);
  dFrameRight.position.set(doorW / 2 - 0.03, 0, 0);
  doorGroup.add(dFrameRight);

  const dFrameTop = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.06, 0.05), doorFrameMat);
  dFrameTop.position.set(0, doorH / 2 - 0.03, 0);
  doorGroup.add(dFrameTop);

  // Carved Door Leaf
  const doorLeafGeo = new THREE.BoxGeometry(doorW - 0.08, doorH - 0.06, 0.04);
  const doorLeaf = new THREE.Mesh(doorLeafGeo, darkWalnutMaterial);
  doorLeaf.castShadow = true;
  doorLeaf.receiveShadow = true;
  doorLeaf.userData = { id: 'obj_door' };
  interactiveMeshes.push(doorLeaf);
  doorGroup.add(doorLeaf);

  // Chrome Lever Handle & Escutcheon Backplate (right side of door leaf)
  const handlePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.18, 0.008),
    chromeMaterial
  );
  handlePlate.position.set(doorW / 2 - 0.14, -0.05, 0.025);
  doorGroup.add(handlePlate);

  const handleLever = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.12, 16),
    chromeMaterial
  );
  handleLever.rotation.z = Math.PI / 2;
  handleLever.position.set(doorW / 2 - 0.18, -0.01, 0.04);
  doorGroup.add(handleLever);

  // Top security sliding bolt
  const topBolt = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.02), brassMaterial);
  topBolt.position.set(doorW / 2 - 0.14, doorH / 2 - 0.25, 0.025);
  doorGroup.add(topBolt);

  wallsGroup.add(doorGroup);

  // Entryway Modular Switchboard ("E") on North wall (to the right of the door)
  const doorSwitchboard = buildPhysicalWallPlugUnit({
    width: 0.20,
    height: 0.11,
    numSwitches: 3,
    hasSocket: true,
    socketPosition: 'left',
    id: 'obj_door_switch',
    name: 'Entryway Modular Switchboard & Socket'
  });
  doorSwitchboard.position.set(0.58, 1.15, -HALF_L + 0.002);
  wallsGroup.add(doorSwitchboard);

  // Wardrobe: Positioned on the left of the door on the North wall - FLUSH IN THE WALL
  const wardrobeW = 0.95; // matches the wardrobe footprint the room rules use (x -1.70 to -0.75)
  const wardrobeH = 2.30;
  const wardrobeGroup = new THREE.Group();
  wardrobeGroup.position.set(-HALF_W + wardrobeW / 2 + 0.025, wardrobeH / 2, -HALF_L + 0.01); // flush with the west wall
  wardrobeGroup.name = 'obj_wardrobe';
  wardrobeGroup.userData = { id: 'obj_wardrobe', name: 'Flush Built-in Wall Wardrobe' };

  const wardrobeMat = naturalWoodMaterial;

  // Flush Door Panel Left
  const panelGeo = new THREE.BoxGeometry(wardrobeW / 2 - 0.01, wardrobeH, 0.02);
  const doorPanelL = new THREE.Mesh(panelGeo, wardrobeMat);
  doorPanelL.position.set(-wardrobeW / 4, 0, 0);
  doorPanelL.castShadow = true;
  doorPanelL.receiveShadow = true;
  doorPanelL.userData = { id: 'obj_wardrobe' };
  interactiveMeshes.push(doorPanelL);
  wardrobeGroup.add(doorPanelL);

  // Flush Door Panel Right
  const doorPanelR = new THREE.Mesh(panelGeo, wardrobeMat);
  doorPanelR.position.set(wardrobeW / 4, 0, 0);
  doorPanelR.castShadow = true;
  doorPanelR.receiveShadow = true;
  doorPanelR.userData = { id: 'obj_wardrobe' };
  interactiveMeshes.push(doorPanelR);
  wardrobeGroup.add(doorPanelR);

  // Subtle frame trim around flush opening
  const frameMat = doorFrameMat;
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(wardrobeW + 0.04, 0.03, 0.025), frameMat);
  frameTop.position.set(0, wardrobeH / 2 + 0.015, 0);
  wardrobeGroup.add(frameTop);

  const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.025, wardrobeH + 0.03, 0.025), frameMat);
  frameLeft.position.set(-wardrobeW / 2 - 0.012, 0, 0);
  wardrobeGroup.add(frameLeft);

  const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.025, wardrobeH + 0.03, 0.025), frameMat);
  frameRight.position.set(wardrobeW / 2 + 0.012, 0, 0);
  wardrobeGroup.add(frameRight);

  // Vertical split reveal seam between doors
  const splitSeam = new THREE.Mesh(new THREE.BoxGeometry(0.006, wardrobeH, 0.022), frameMat);
  splitSeam.position.set(0, 0, 0);
  wardrobeGroup.add(splitSeam);

  // Modern flush recessed edge pulls
  const pullMat = chromeMaterial;
  const pullL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.35, 0.015), pullMat);
  pullL.position.set(-0.02, 0, 0.012);
  wardrobeGroup.add(pullL);

  const pullR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.35, 0.015), pullMat);
  pullR.position.set(0.02, 0, 0.012);
  wardrobeGroup.add(pullR);

  wallsGroup.add(wardrobeGroup);

  // =========================================================================
  // --- 4. SOUTH WALL (Z = +HALF_L): 2 WINDOWS, AC UNIT & SWITCHBOARD ("E") ---
  // =========================================================================
  const southWallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_W, ROOM_H),
    wallMaterial
  );
  southWallMesh.rotation.y = Math.PI;
  southWallMesh.position.set(0, ROOM_H / 2, HALF_L);
  southWallMesh.receiveShadow = true;
  wallsGroup.add(southWallMesh);

  // Overhead beam drop along South Wall
  const southBeam = new THREE.Mesh(
    new THREE.BoxGeometry(ROOM_W, 0.24, 0.2),
    wallMaterial
  );
  southBeam.position.set(0, ROOM_H - 0.12, HALF_L - 0.1);
  wallsGroup.add(southBeam);

  // Window 1 on South Wall (South-West Window, below the AC unit)
  const windowSouth1 = buildWindowWithCurtains(
    -0.92,
    1.25,
    HALF_L - 0.02,
    Math.PI,
    'obj_window_south_1',
    'South-West Sliding Window with Safety Grill'
  );
  wallsGroup.add(windowSouth1);

  // Window 2 on South Wall (South-East Window)
  const windowSouth2 = buildWindowWithCurtains(
    0.92,
    1.25,
    HALF_L - 0.02,
    Math.PI,
    'obj_window_south_2',
    'South-East Sliding Window with Safety Grill'
  );
  wallsGroup.add(windowSouth2);

  // High-Wall Split Air Conditioner (Mounted high directly above Window 1 on South Wall)
  const acGroup = new THREE.Group();
  acGroup.position.set(-0.92, 2.38, HALF_L - 0.14);
  acGroup.rotation.y = Math.PI;
  acGroup.name = 'obj_split_ac';
  acGroup.userData = { id: 'obj_split_ac', name: 'High-Wall Split Air Conditioner' };

  const acBodyGeo = new THREE.BoxGeometry(0.85, 0.28, 0.20);
  const acTex = createACFrontPanelTexture();
  const acFaceMat = new THREE.MeshStandardMaterial({
    map: acTex,
    roughness: 0.3,
    metalness: 0.05
  });
  const acMaterials = [
    applianceWhite,
    applianceWhite,
    applianceWhite,
    applianceWhite,
    applianceWhite,
    acFaceMat
  ];
  const acBodyMesh = new THREE.Mesh(acBodyGeo, acMaterials);
  acBodyMesh.castShadow = true;
  acBodyMesh.userData = { id: 'obj_split_ac' };
  interactiveMeshes.push(acBodyMesh);
  acGroup.add(acBodyMesh);
  wallsGroup.add(acGroup);

  // Dedicated Physical 3D AC Starter Switch Box & Conduit on South Wall
  const acStarterGroup = new THREE.Group();
  acStarterGroup.position.set(-0.40, 2.38, HALF_L - 0.02);
  acStarterGroup.rotation.y = Math.PI;
  acStarterGroup.name = 'obj_ac_starter';
  acStarterGroup.userData = { id: 'obj_ac_starter', name: 'AC Power Starter Box & Conduit' };

  const starterBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.15, 0.05),
    plugPlateMat
  );
  starterBox.userData = { id: 'obj_ac_starter' };
  interactiveMeshes.push(starterBox);
  acStarterGroup.add(starterBox);

  // Red MCB Rocker Switch
  const starterLever = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 0.05, 0.02),
    indicatorRedMat
  );
  starterLever.position.set(-0.025, 0.01, 0.03);
  acStarterGroup.add(starterLever);

  // Green LED Power Jewel
  const powerLed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.004, 16),
    new THREE.MeshBasicMaterial({ color: 0x22c55e })
  );
  powerLed.rotation.x = Math.PI / 2;
  powerLed.position.set(0.03, 0.035, 0.026);
  acStarterGroup.add(powerLed);

  // Conduit running from AC to starter and up to ceiling
  const conduitMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.45 });
  const acConduitUp = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35), conduitMat);
  acConduitUp.position.set(0, 0.22, 0.01);
  acStarterGroup.add(acConduitUp);

  const acConduitHoriz = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35), conduitMat);
  acConduitHoriz.rotation.z = Math.PI / 2;
  acConduitHoriz.position.set(-0.2, 0.0, 0.01);
  acStarterGroup.add(acConduitHoriz);

  wallsGroup.add(acStarterGroup);

  // Switchboard & Modular Wall Plug Point ("E"): Dead center between Window 1 and Window 2 on South Wall
  const southCenterSwitchboard = buildPhysicalWallPlugUnit({
    width: 0.24,
    height: 0.11,
    numSwitches: 3,
    hasSocket: true,
    socketPosition: 'left',
    id: 'obj_wall_plug_points',
    name: 'South Wall Center Modular Switchboard & Plugs'
  });
  southCenterSwitchboard.rotation.y = Math.PI;
  southCenterSwitchboard.position.set(0.0, 0.95, HALF_L - 0.002);
  wallsGroup.add(southCenterSwitchboard);

  // Overhead Electrical Conduit Pipe & Junction Box along top South Beam leading to center switchboard
  const southConduitGroup = new THREE.Group();
  southConduitGroup.position.set(0.0, ROOM_H - 0.14, HALF_L - 0.03);
  southConduitGroup.rotation.y = Math.PI;

  const southPipeGeo = new THREE.CylinderGeometry(0.009, 0.009, 1.6);
  const southPipeMesh = new THREE.Mesh(southPipeGeo, conduitMat);
  southPipeMesh.rotation.z = Math.PI / 2;
  southConduitGroup.add(southPipeMesh);

  const southJuncBox = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.025), applianceWhite);
  southJuncBox.rotation.x = Math.PI / 2;
  southJuncBox.position.set(0, 0, 0);
  southConduitGroup.add(southJuncBox);

  // Vertical drop conduit from ceiling junction to center switchboard
  const dropPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 1.4), conduitMat);
  dropPipe.position.set(0, -0.7, 0);
  southConduitGroup.add(dropPipe);

  wallsGroup.add(southConduitGroup);

  // =========================================================================
  // --- 5. WEST WALL (X = -HALF_W): FLAT WALL, NO WINDOW, NO SWITCHBOARDS ---
  // =========================================================================
  const westWallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_L, ROOM_H),
    wallMaterial
  );
  westWallMesh.rotation.y = Math.PI / 2;
  westWallMesh.position.set(-HALF_W, ROOM_H / 2, 0);
  westWallMesh.receiveShadow = true;
  wallsGroup.add(westWallMesh);

  // West wall is completely clean and clear (bed removed)

  // =========================================================================
  // --- 6. EAST WALL (X = +HALF_W): FLAT WALL, NO ALCOVE, NO SWITCHBOARDS ---
  // =========================================================================
  const eastWallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_L, ROOM_H),
    wallMaterial
  );
  eastWallMesh.rotation.y = -Math.PI / 2;
  eastWallMesh.position.set(HALF_W, ROOM_H / 2, 0);
  eastWallMesh.receiveShadow = true;
  wallsGroup.add(eastWallMesh);

  // LED Batten Tube Light Fixture (Mounted high on flat East wall for ambient glow)
  const tubeLightGroup = new THREE.Group();
  tubeLightGroup.position.set(HALF_W - 0.03, 2.45, 0);
  tubeLightGroup.name = 'obj_tube_light';
  tubeLightGroup.userData = { id: 'obj_tube_light', name: 'LED Batten Tube Light Fixture' };

  const battenHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.04, 1.25),
    applianceWhite
  );
  tubeLightGroup.add(battenHousing);

  const tubeGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.2, 16);
  const tubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const tubeLightMesh = new THREE.Mesh(tubeGeo, tubeMat);
  tubeLightMesh.rotation.x = Math.PI / 2;
  tubeLightMesh.position.x = -0.02;
  tubeLightMesh.userData = { id: 'obj_tube_light' };
  interactiveMeshes.push(tubeLightMesh);
  tubeLightGroup.add(tubeLightMesh);

  const tubeLightGlow = new THREE.PointLight(0xfff5e6, 1.4, 5.5, 1.5);
  tubeLightGlow.position.set(-0.25, 0, 0);
  tubeLightGroup.add(tubeLightGlow);

  wallsGroup.add(tubeLightGroup);

  // East side furniture removed (table, chair removed)

  // =========================================================================
  // --- 7. CONTINUOUS BASEBOARD SKIRTING MOLDINGS ---
  // =========================================================================
  // North Left Skirting
  const bbNorthLeft = new THREE.Mesh(new THREE.BoxGeometry(northLeftWallW, 0.1, 0.02), baseboardMaterial);
  bbNorthLeft.position.set(-HALF_W + northLeftWallW / 2, 0.05, -HALF_L + 0.01);
  wallsGroup.add(bbNorthLeft);

  // North Right Skirting
  const bbNorthRight = new THREE.Mesh(new THREE.BoxGeometry(northRightWallW, 0.1, 0.02), baseboardMaterial);
  bbNorthRight.position.set(HALF_W - northRightWallW / 2, 0.05, -HALF_L + 0.01);
  wallsGroup.add(bbNorthRight);

  // South Wall Skirting
  const bbSouth = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W, 0.1, 0.02), baseboardMaterial);
  bbSouth.position.set(0, 0.05, HALF_L - 0.01);
  wallsGroup.add(bbSouth);

  // West Wall Skirting (Clean continuous)
  const bbWest = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, ROOM_L), baseboardMaterial);
  bbWest.position.set(-HALF_W + 0.01, 0.05, 0);
  wallsGroup.add(bbWest);

  // East Wall Skirting (Clean continuous, no alcove!)
  const bbEast = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, ROOM_L), baseboardMaterial);
  bbEast.position.set(HALF_W - 0.01, 0.05, 0);
  wallsGroup.add(bbEast);

  // =========================================================================
  // --- 8. CENTRAL CEILING FAN (3-Blade Aerodynamic Design) ---
  // =========================================================================
  const ceilingFanGroup = new THREE.Group();
  ceilingFanGroup.position.set(0, ROOM_H, 0);
  ceilingFanGroup.name = 'obj_ceiling_fan';
  ceilingFanGroup.userData = { id: 'obj_ceiling_fan', name: 'Center 3-Blade Ceiling Fan' };

  // Canopy Cap
  const fanCanopy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.08, 24),
    applianceWhite
  );
  fanCanopy.position.y = -0.04;
  ceilingFanGroup.add(fanCanopy);

  // Downrod
  const downrod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.28, 16),
    applianceWhite
  );
  downrod.position.y = -0.18;
  ceilingFanGroup.add(downrod);

  // Motor Housing Dome
  const motorDome = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.12, 32),
    applianceWhite
  );
  motorDome.position.y = -0.32;
  motorDome.castShadow = true;
  ceilingFanGroup.add(motorDome);

  // Rotating Blade Rotor
  const rotorGroup = new THREE.Group();
  rotorGroup.position.y = -0.34;
  ceilingFanGroup.add(rotorGroup);

  // 3 Aerodynamic Curved Blades
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3;
    const bladeArm = new THREE.Group();
    bladeArm.rotation.y = angle;

    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.015, 0.08),
      aluminiumMaterial
    );
    bracket.position.set(0, 0, 0.16);
    bladeArm.add(bracket);

    const bladeGeo = new THREE.BoxGeometry(0.12, 0.008, 0.44);
    const bladeMesh = new THREE.Mesh(bladeGeo, applianceWhite);
    bladeMesh.position.set(0, 0, 0.35);
    bladeMesh.rotation.z = 0.12;
    bladeArm.add(bladeMesh);

    rotorGroup.add(bladeArm);
  }

  const fanTarget = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.52, 0.35, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  fanTarget.position.y = -0.28;
  fanTarget.userData = { id: 'obj_ceiling_fan', name: 'Center 3-Blade Ceiling Fan' };
  interactiveMeshes.push(fanTarget);
  ceilingFanGroup.add(fanTarget);

  wallsGroup.add(ceilingFanGroup);

  // =========================================================================
  // --- 9. REALISTIC ROOM LIGHTING SETUP ---
  // =========================================================================
  const lightingGroup = new THREE.Group();
  lightingGroup.name = 'RoomLighting';
  rootGroup.add(lightingGroup);

  // Ambient Fill Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  lightingGroup.add(ambientLight);

  // Central Room Point Light
  const centerLight = new THREE.PointLight(0xfff6ea, 1.2, 7.5, 1.6);
  centerLight.position.set(0, ROOM_H - 0.45, 0);
  centerLight.castShadow = true;
  centerLight.shadow.mapSize.width = 1024;
  centerLight.shadow.mapSize.height = 1024;
  centerLight.shadow.bias = -0.001;
  lightingGroup.add(centerLight);

  // South Window 1 Influx Light
  const southSun1 = new THREE.DirectionalLight(0xfff5e4, 0.75);
  southSun1.position.set(-0.92, 2.3, HALF_L + 1.5);
  southSun1.target.position.set(-0.92, 0.8, 0);
  lightingGroup.add(southSun1);
  lightingGroup.add(southSun1.target);

  // South Window 2 Influx Light
  const southSun2 = new THREE.DirectionalLight(0xfff5e4, 0.75);
  southSun2.position.set(0.92, 2.3, HALF_L + 1.5);
  southSun2.target.position.set(0.92, 0.8, 0);
  lightingGroup.add(southSun2);
  lightingGroup.add(southSun2.target);

  // --- LIGHTING DYNAMIC UPDATE METHOD ---
  const updateLighting = (setting: LightingSetting) => {
    let colorHex = 0xffffff;
    let pointColor = 0xfff6ea;

    if (setting.preset === 'warm_evening') {
      colorHex = 0xffe0b2;
      pointColor = 0xffab40;
      ambientLight.intensity = 0.5 * setting.intensity;
      centerLight.intensity = 1.35 * setting.intensity;
      tubeLightGlow.intensity = 1.8 * setting.intensity;
      southSun1.intensity = 0.2;
      southSun2.intensity = 0.2;
    } else if (setting.preset === 'focus_day') {
      colorHex = 0xf0f9ff;
      pointColor = 0xe0f2fe;
      ambientLight.intensity = 0.75 * setting.intensity;
      centerLight.intensity = 1.3 * setting.intensity;
      tubeLightGlow.intensity = 1.2 * setting.intensity;
      southSun1.intensity = 1.0;
      southSun2.intensity = 1.0;
    } else {
      // Natural Daylight
      colorHex = 0xffffff;
      pointColor = 0xfff8f0;
      ambientLight.intensity = 0.65 * setting.intensity;
      centerLight.intensity = 1.2 * setting.intensity;
      tubeLightGlow.intensity = 1.4 * setting.intensity;
      southSun1.intensity = 0.85;
      southSun2.intensity = 0.85;
    }

    ambientLight.color.setHex(colorHex);
    centerLight.color.setHex(pointColor);
  };

  updateLighting(initialLighting);

  // =========================================================================
  // --- 10. DYNAMIC SCENARIO OBJECTS & GHOST STATES ---
  // =========================================================================
  const scenarioGroup = new THREE.Group();
  scenarioGroup.name = 'ScenarioDynamicGroup';
  rootGroup.add(scenarioGroup);

  let standingFanRotor: THREE.Group | null = null;

  // Ghost Material: Translucent frosted glass with soft cyan luminescence
  const ghostMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.88,
    opacity: 0.45,
    transparent: true,
    roughness: 0.2,
    metalness: 0.1,
    ior: 1.45,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.18
  });

  // Corner bracket helper for ghost states
  // Brackets sit on the piece's real extents, measured from its meshes in the group's own space.
  // (The sizes passed by callers were hand-typed and centred on the group origin, so the fan's box
  // sat half under the floor and the dressing table's ignored where the mirror is.)
  const addCornerBrackets = (group: THREE.Group, _w?: number, _h?: number, _d?: number, pad = 0.025) => {
    const bracketMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    group.updateMatrixWorld(true);
    const toLocal = group.matrixWorld.clone().invert();
    const box = new THREE.Box3();
    const part = new THREE.Box3();
    group.traverse((c) => {
      const mesh = c as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry || !mesh.visible) return;
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      part.copy(mesh.geometry.boundingBox!).applyMatrix4(toLocal.clone().multiply(mesh.matrixWorld));
      box.union(part);
    });
    if (box.isEmpty()) return;
    box.expandByScalar(pad);
    const size = box.getSize(new THREE.Vector3());
    const mid = box.getCenter(new THREE.Vector3());
    const bracketLen = THREE.MathUtils.clamp(Math.min(size.x, size.y, size.z) * 0.18, 0.05, 0.12);
    const halfW = size.x / 2;
    const halfH = size.y / 2;
    const halfD = size.z / 2;

    const corners = [
      [halfW, halfH, halfD],
      [-halfW, halfH, halfD],
      [halfW, -halfH, halfD],
      [-halfW, -halfH, halfD],
      [halfW, halfH, -halfD],
      [-halfW, halfH, -halfD],
      [halfW, -halfH, -halfD],
      [-halfW, -halfH, -halfD],
    ].map(([x, y, z]) => [x + mid.x, y + mid.y, z + mid.z]);

    corners.forEach(([cx, cy, cz]) => {
      // Each arm points inward, toward the box centre
      const sx = cx > mid.x ? -1 : 1;
      const sy = cy > mid.y ? -1 : 1;
      const sz = cz > mid.z ? -1 : 1;

      const points = [
        new THREE.Vector3(cx + sx * bracketLen, cy, cz),
        new THREE.Vector3(cx, cy, cz),
        new THREE.Vector3(cx, cy + sy * bracketLen, cz),
        new THREE.Vector3(cx, cy, cz),
        new THREE.Vector3(cx, cy, cz + sz * bracketLen),
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, bracketMat);
      group.add(line);
    });
  };

  // Detection phase ghost material & state
  const detectionGhostMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x0ea5e9),
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 2.2,
    roughness: 0.18,
    metalness: 0.12,
    transparent: true,
    opacity: 0.8,
    depthWrite: true
  });
  disposables.push(detectionGhostMaterial);

  let isDetectionPhaseActive = false;

  const applyGhostModeToGroup = (group: THREE.Object3D, isGhost: boolean) => {
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (isGhost) {
          if (!mesh.userData._origMaterial) {
            mesh.userData._origMaterial = mesh.material;
          }
          mesh.material = detectionGhostMaterial;
        } else {
          if (mesh.userData._origMaterial) {
            mesh.material = mesh.userData._origMaterial;
            delete mesh.userData._origMaterial;
          }
        }
      }
    });
  };

  const updateScenarioState = (
    state: ScenarioState,
    stagedObjects?: StagedObject[],
    showDetectedOutlines: boolean = true,
    customPositions?: Record<string, [number, number, number]>,
    isRoomCleared: boolean = false,
    customRotations?: Record<string, number>,
    isDetectionPhase: boolean = false,
    identificationStep?: IdentificationStep
  ) => {
    const currentStep: IdentificationStep = identificationStep && identificationStep !== 'completed'
      ? identificationStep
      : (isDetectionPhase ? 'constraints' : 'completed');

    isDetectionPhaseActive = (currentStep === 'constraints' || currentStep === 'assets');

    // Clear previous dynamic items
    while (scenarioGroup.children.length > 0) {
      const child = scenarioGroup.children[0];
      scenarioGroup.remove(child);
    }
    standingFanRotor = null;

    // Dynamically position constraints if custom positions were set (e.g. plug point moved)
    if (customPositions?.['obj_wall_plug_points']) {
      const p = customPositions['obj_wall_plug_points'];
      southCenterSwitchboard.position.set(p[0], p[1], p[2]);
    } else {
      southCenterSwitchboard.position.set(0.0, 0.95, HALF_L - 0.002);
    }

    if (customPositions?.['obj_door_switch']) {
      const p = customPositions['obj_door_switch'];
      doorSwitchboard.position.set(p[0], p[1], p[2]);
    } else {
      doorSwitchboard.position.set(0.85, 1.15, -HALF_L + 0.002);
    }

    if (customPositions?.['obj_split_ac']) {
      const p = customPositions['obj_split_ac'];
      acGroup.position.set(p[0], p[1], p[2]);
    } else {
      acGroup.position.set(-0.92, 2.38, HALF_L - 0.14);
    }

    // Step 1: Constraints Glow (Fixed architectural elements: Windows, Door, Wardrobe, AC, Plug points)
    // Detections are shown as frames over the image, never by lighting the room's own objects
    const isConstraintGlow = false;
    applyGhostModeToGroup(wardrobeGroup, isConstraintGlow);
    applyGhostModeToGroup(doorGroup, isConstraintGlow);
    applyGhostModeToGroup(acGroup, isConstraintGlow);
    applyGhostModeToGroup(tubeLightGroup, isConstraintGlow);
    applyGhostModeToGroup(ceilingFanGroup, isConstraintGlow);
    applyGhostModeToGroup(windowSouth1, isConstraintGlow);
    applyGhostModeToGroup(windowSouth2, isConstraintGlow);
    applyGhostModeToGroup(southCenterSwitchboard, isConstraintGlow);
    applyGhostModeToGroup(doorSwitchboard, isConstraintGlow);

    // Update outer window drapes dynamically based on room color palette
    const curtainTex = state.palette === 'cool_pastel'
      ? createCoolPastelCurtainTexture()
      : (state.palette === 'warm_studio' ? createTerracottaCurtainTexture() : createBurgundyCurtainTexture());
    disposables.push(curtainTex);
    const dynamicCurtainMat = new THREE.MeshStandardMaterial({
      map: curtainTex,
      roughness: 0.85,
      side: THREE.DoubleSide
    });
    disposables.push(dynamicCurtainMat);

    [windowSouth1, windowSouth2].forEach((win) => {
      win.traverse((child) => {
        if (child instanceof THREE.Mesh && (child.name === 'curtain_outer_left' || child.name === 'curtain_outer_right')) {
          child.material = dynamicCurtainMat;
        }
      });
    });

    // --- MOVABLE SCENARIO OBJECTS (Hidden if room is cleared OR during constraint verification step) ---
    const showMovableObjects = !isRoomCleared && currentStep !== 'constraints';
    if (showMovableObjects) {
      const isRemoved = (id: string) => state.removedAssetIds?.includes(id);

      // --- SCENARIO STEP GUARDS ---
      const isStep4OnlyBedTable = state.currentStep === '4_option2_selected';
      const isGhostStep = state.currentStep === '5_ghost_state' || (state.ghostStateActive && !state.ghostStateCommitted);

      // --- 1. BED (Along West Wall, Headboard at South Wall under Window 1 and AC) ---
      if (state.bedPlaced && !isRemoved('obj_bed')) {
        const bedGroup = new THREE.Group();
        bedGroup.name = 'obj_bed';
        bedGroup.userData = { id: 'obj_bed', name: 'Teak Wooden Bed', isFixed: false };

        // Bed dimensions: reduced width to 1.02m (standard compact bed) so it fits to the right side of the entry door
        const bedW = 1.02;
        const bedL = 1.95;
        const bedH = 0.48;
        // Positioned along West Wall (left edge against wall), headboard against South Wall
        const defaultBedPos: [number, number, number] = [-HALF_W + bedW / 2 + 0.04, bedH / 2, 0.685];
        const bPos = customPositions?.['obj_bed'] || customPositions?.['det_bed'] || defaultBedPos;
        bedGroup.position.set(bPos[0], bedH / 2, bPos[2]); // Always snapped to floor!
        // Headboard against South Wall when rotated by Math.PI (180 deg)
        bedGroup.rotation.y = customRotations?.['obj_bed'] ?? customRotations?.['det_bed'] ?? Math.PI;

        // Bed Frame (Natural Teak Wood Grain)
        const bedFrame = new THREE.Mesh(
          new THREE.BoxGeometry(bedW, bedH - 0.18, bedL),
          teakWoodMaterial
        );
        bedFrame.position.y = -(0.18 / 2);
        bedFrame.userData = { id: 'obj_bed' };
        bedGroup.add(bedFrame);

        // Headboard
        const headboard = new THREE.Mesh(
          new THREE.BoxGeometry(bedW, 0.85, 0.08),
          teakWoodMaterial
        );
        headboard.position.set(0, 0.35, -bedL / 2 + 0.04);
        headboard.userData = { id: 'obj_bed' };
        bedGroup.add(headboard);

        // Mattress with sheet
        const bedsheetTex = state.palette === 'cool_pastel'
          ? createCoolPastelBedsheetTexture()
          : createPaisleyBedsheetTexture();
        disposables.push(bedsheetTex);

        const sheetMat = new THREE.MeshStandardMaterial({
          map: bedsheetTex,
          roughness: 0.72,
          metalness: 0.02
        });
        disposables.push(sheetMat);

        const mattress = new THREE.Mesh(
          new THREE.BoxGeometry(bedW - 0.06, 0.22, bedL - 0.08),
          sheetMat
        );
        mattress.position.y = bedH / 2 - 0.1;
        mattress.userData = { id: 'obj_bed' };
        bedGroup.add(mattress);

        // Pillows
        const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
        const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(bedW - 0.22, 0.13, 0.38), pillowMat);
        pillow1.position.set(0, bedH / 2 + 0.065, -bedL / 2 + 0.30);
        pillow1.rotation.x = -0.15;
        bedGroup.add(pillow1);

        // Bounding box overlay if bed is target
        if (state.activeOverlayBox === 'bed') {
          const wireBox = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(bedW + 0.1, bedH + 0.4, bedL + 0.1)),
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
          );
          wireBox.position.set(0, 0.15, 0);
          bedGroup.add(wireBox);
        }

        scenarioGroup.add(bedGroup);
      }

      // --- 2. TABLE / STUDY DESK (Along East Wall, or South Window 2) ---
      if (state.tablePosition !== null && !isRemoved('obj_study_table')) {
        const tableGroup = new THREE.Group();
        tableGroup.name = 'obj_study_table';
        tableGroup.userData = { id: 'obj_study_table', name: 'Solid Wood Workstation Desk', isFixed: false };

        const tW = 1.05;
        const tD = 0.60;
        const tH = 0.75;

        // Position matches user walkthrough: Option 1 (Top-Left) vs Option 2 (In front of AC window)
        let defaultTablePos: [number, number, number] = [HALF_W - tD / 2 - 0.02, tH / 2, -0.95];
        let defaultTableRot = -Math.PI / 2;

        if (state.currentStep === '3_two_options') {
          if (state.activeOption === 2) {
            defaultTablePos = [-1.25, tH / 2, -0.65]; // in front of window below AC (Diagram 5)
            defaultTableRot = 0;
          } else {
            defaultTablePos = [-1.15, tH / 2, -1.85]; // top-left corner (Diagram 4)
            defaultTableRot = 0;
          }
        } else if (state.tablePosition === 'top_left' || ['4_option2_selected', '5_ghost_state', '6_side_table_moved', '7_fan_added', '8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep)) {
          defaultTablePos = [-1.15, tH / 2, -1.85]; // top-left corner per Diagram 4 & 6
          defaultTableRot = 0;
        } else if (state.tablePosition === 'window_ac' || state.tablePosition === 'window' || state.currentStep === '2_table_privacy_concern') {
          defaultTablePos = [-1.25, tH / 2, -0.65]; // in front of window below AC (Diagram 3)
          defaultTableRot = 0;
        }

        const tPos = customPositions?.['obj_study_table'] || customPositions?.['obj_table'] || customPositions?.['det_table'] || defaultTablePos;
        tableGroup.position.set(tPos[0], tH / 2, tPos[2]); // Always snapped to floor!
        tableGroup.rotation.y = customRotations?.['obj_study_table'] ?? customRotations?.['obj_table'] ?? customRotations?.['det_table'] ?? defaultTableRot;

        // Tabletop (Natural Wood Grain Desktop)
        const tabletop = new THREE.Mesh(
          new THREE.BoxGeometry(tW, 0.045, tD),
          naturalWoodMaterial
        );
        tabletop.position.y = tH / 2 - 0.0225;
        tabletop.userData = { id: 'obj_study_table' };
        tableGroup.add(tabletop);

        // 4 Table Legs (Brushed Dark Metal)
        const legGeo = new THREE.BoxGeometry(0.045, tH - 0.045, 0.045);
        const legMat = brushedMetalMaterial;
        const legPositions = [
          [tW / 2 - 0.06, -(0.045 / 2), tD / 2 - 0.06],
          [-tW / 2 + 0.06, -(0.045 / 2), tD / 2 - 0.06],
          [tW / 2 - 0.06, -(0.045 / 2), -tD / 2 + 0.06],
          [-tW / 2 + 0.06, -(0.045 / 2), -tD / 2 + 0.06],
        ];
        legPositions.forEach(([lx, ly, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(lx, ly, lz);
          leg.userData = { id: 'obj_study_table' };
          tableGroup.add(leg);
        });

        // Lower shelf for PC tower / accessories
        const lowerShelf = new THREE.Mesh(
          new THREE.BoxGeometry(tW - 0.1, 0.025, tD - 0.12),
          darkWalnutMaterial
        );
        lowerShelf.position.y = -tH / 2 + 0.15;
        tableGroup.add(lowerShelf);

        // PC Tower box on lower shelf
        const pcTower = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.38, 0.38),
          new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 })
        );
        pcTower.position.set(-tW / 2 + 0.22, -tH / 2 + 0.35, 0);
        tableGroup.add(pcTower);

        // Workstation Gear on Tabletop (Switches between standard laptop and AI-populated Dual Monitor Studio)
        const isAiFilledDesk = state.tableFilledWithAi || ['8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep);

        if (isAiFilledDesk) {
          // --- AI-FILLED CUSTOM WORK STUDIO WORKSTATION SETUP ---
          // 1. Dual Monitor Stand (Heavy metal mount on back edge)
          const mountBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.012, 0.12),
            brushedMetalMaterial
          );
          mountBase.position.set(0.02, tH / 2 + 0.006, -tD / 2 + 0.08);
          tableGroup.add(mountBase);

          const mountPole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.016, 0.016, 0.36, 16),
            brushedMetalMaterial
          );
          mountPole.position.set(0.02, tH / 2 + 0.18, -tD / 2 + 0.08);
          tableGroup.add(mountPole);

          // 2. Primary 27" Ultrafine Horizon Display (Center)
          const priScreenGroup = new THREE.Group();
          priScreenGroup.position.set(0.04, tH / 2 + 0.26, -tD / 2 + 0.16);

          const priBezel = new THREE.Mesh(
            new THREE.BoxGeometry(0.56, 0.32, 0.016),
            new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.8 })
          );
          priScreenGroup.add(priBezel);

          const priGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(0.54, 0.30),
            new THREE.MeshStandardMaterial({
              color: 0x1e293b,
              emissive: 0x38bdf8,
              emissiveIntensity: 0.12,
              roughness: 0.1
            })
          );
          priGlass.position.set(0, 0, 0.009);
          priScreenGroup.add(priGlass);

          // Screenbar light on top of primary monitor
          const screenBar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.44, 12),
            brushedMetalMaterial
          );
          screenBar.rotation.z = Math.PI / 2;
          screenBar.position.set(0, 0.17, 0.02);
          priScreenGroup.add(screenBar);

          tableGroup.add(priScreenGroup);

          // 3. Secondary 24" Portrait / Vertical Coding Display (Angled Left)
          const secScreenGroup = new THREE.Group();
          secScreenGroup.position.set(-0.34, tH / 2 + 0.28, -tD / 2 + 0.20);
          secScreenGroup.rotation.y = 0.38; // Angled inward towards Aarav

          const secBezel = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 0.40, 0.016),
            new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.8 })
          );
          secScreenGroup.add(secBezel);

          const secGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(0.22, 0.38),
            new THREE.MeshStandardMaterial({
              color: 0x0f172a,
              emissive: 0xa855f7,
              emissiveIntensity: 0.14,
              roughness: 0.1
            })
          );
          secGlass.position.set(0, 0, 0.009);
          secScreenGroup.add(secGlass);

          tableGroup.add(secScreenGroup);

          // 4. Saddle-Brown Leather Artisan Desk Pad
          const leatherPad = new THREE.Mesh(
            new THREE.BoxGeometry(0.78, 0.005, 0.36),
            new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 })
          );
          leatherPad.position.set(0.04, tH / 2 + 0.0025, 0.06);
          tableGroup.add(leatherPad);

          // 5. Backlit Mechanical Keyboard
          const keyboard = new THREE.Mesh(
            new THREE.BoxGeometry(0.34, 0.016, 0.13),
            new THREE.MeshStandardMaterial({
              color: 0x27272a,
              roughness: 0.4,
              emissive: 0xf59e0b,
              emissiveIntensity: 0.08
            })
          );
          keyboard.position.set(0.0, tH / 2 + 0.013, 0.08);
          tableGroup.add(keyboard);

          // 6. Wireless Precision Mouse
          const mouse = new THREE.Mesh(
            new THREE.BoxGeometry(0.065, 0.022, 0.10),
            new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 })
          );
          mouse.position.set(0.28, tH / 2 + 0.015, 0.08);
          tableGroup.add(mouse);

          // 7. Ceramic Artisan Coffee Mug
          const mug = new THREE.Mesh(
            new THREE.CylinderGeometry(0.038, 0.034, 0.085, 16),
            new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.25 })
          );
          mug.position.set(0.42, tH / 2 + 0.045, -0.04);
          tableGroup.add(mug);

          // 8. Work Journal / Hardbound Notebook & Brass Stylus
          const journal = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, 0.012, 0.22),
            new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.85 })
          );
          journal.position.set(-0.38, tH / 2 + 0.008, 0.10);
          journal.rotation.y = 0.12;
          tableGroup.add(journal);

        } else {
          // Standard Baseline Laptop Setup
          const laptopBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.012, 0.22),
            aluminiumMaterial
          );
          laptopBase.position.set(0.08, tH / 2 + 0.006, 0.05);
          tableGroup.add(laptopBase);

          const laptopScreen = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.2, 0.008),
            aluminiumMaterial
          );
          laptopScreen.position.set(0.08, tH / 2 + 0.1, -0.05);
          laptopScreen.rotation.x = 0.25;
          tableGroup.add(laptopScreen);

          // Desk mat & mouse
          const mat = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.003, 0.35),
            new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 })
          );
          mat.position.set(0.08, tH / 2 + 0.002, 0.05);
          tableGroup.add(mat);
        }

        // Bounding box overlay if table is target
        if (state.activeOverlayBox === 'table') {
          const wireBox = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(tW + 0.1, tH + 0.3, tD + 0.1)),
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
          );
          wireBox.position.set(0, 0.1, 0);
          tableGroup.add(wireBox);

          const innerGlass = new THREE.Mesh(
            new THREE.BoxGeometry(tW + 0.1, tH + 0.3, tD + 0.1),
            ghostMaterial
          );
          innerGlass.position.set(0, 0.1, 0);
          tableGroup.add(innerGlass);
        }

        scenarioGroup.add(tableGroup);

        // --- 2b. STUDY DESK CHAIR (Chair pulled up in front of desk) ---
        if (!isRemoved('obj_chair')) {
          const chairGroup = new THREE.Group();
          chairGroup.name = 'obj_chair';
          chairGroup.userData = { id: 'obj_chair', name: 'Study Desk Chair', isFixed: false };
          
          let defaultChairPos: [number, number, number] = [0.88, 0.40, -0.95];
          let defaultChairRot = Math.PI / 2;

          if (state.tablePosition === 'top_left' || ['4_option2_selected', '5_ghost_state', '6_side_table_moved', '7_fan_added', '8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep)) {
            // Right in front of desk in top-left (Diagram 6)
            defaultChairPos = [-0.65, 0.40, -1.85];
            defaultChairRot = -Math.PI / 2;
          } else if (state.tablePosition === 'window_ac' || state.tablePosition === 'window' || state.currentStep === '2_table_privacy_concern' || (state.currentStep === '3_two_options' && state.activeOption === 2)) {
            defaultChairPos = [-0.75, 0.40, -0.65];
            defaultChairRot = -Math.PI / 2;
          }

          const chPos = customPositions?.['obj_chair'] || customPositions?.['det_chair'] || defaultChairPos;
          chairGroup.position.set(chPos[0], 0.40, chPos[2]); // Snapped to floor!
          chairGroup.rotation.y = customRotations?.['obj_chair'] ?? customRotations?.['det_chair'] ?? defaultChairRot;

          const chairMat = isGhostStep ? ghostMaterial : new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.55 });
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.46), chairMat);
          seat.userData = { id: 'obj_chair' };
          chairGroup.add(seat);

          // Ergonomic curved woven backrest
          const backGeo = new THREE.BoxGeometry(0.46, 0.48, 0.03);
          const back = new THREE.Mesh(backGeo, chairMat);
          back.position.set(0, 0.26, -0.22);
          chairGroup.add(back);

          // Armrests
          [-0.23, 0.23].forEach((ax) => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.32), chairMat);
            arm.position.set(ax, 0.12, 0);
            chairGroup.add(arm);
          });

          // 4 Sturdy Legs
          const legGeoCh = new THREE.CylinderGeometry(0.016, 0.016, 0.42, 12);
          [-0.19, 0.19].forEach((lx) => {
            [-0.18, 0.18].forEach((lz) => {
              const leg = new THREE.Mesh(legGeoCh, chairMat);
              leg.position.set(lx, -0.21, lz);
              chairGroup.add(leg);
            });
          });

          scenarioGroup.add(chairGroup);
        }
      }

      // --- 3. ROOM SEPARATOR (Option 2: Shielding Workstation from North Entrance Door) ---
      if (state.hasSeparator) {
        const sepGroup = new THREE.Group();
        sepGroup.name = 'obj_separator';
        sepGroup.userData = { id: 'obj_separator', name: 'Slatted Wood Privacy Screen', isFixed: false };

        const sW = 1.45;
        const sH = 1.75;
        // Placed directly behind the study desk chair at X = 0.55, Z = 0.55, blocking line of sight from North door (Z = -1.70)
        const defaultSepPos: [number, number, number] = [0.55, sH / 2, 0.55];
        const sPos = customPositions?.['obj_separator'] || defaultSepPos;
        sepGroup.position.set(sPos[0], sH / 2, sPos[2]); // Always snapped to floor!

        const slatTex = createWoodSlatsTexture();
        disposables.push(slatTex);
        const slatMat = new THREE.MeshStandardMaterial({
          map: slatTex,
          roughness: 0.6,
          metalness: 0.05
        });
        disposables.push(slatMat);

        // 3 zig-zag panels
        const panelW = sW / 3;
        for (let p = 0; p < 3; p++) {
          const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW, sH, 0.04), slatMat);
          const px = (p - 1) * panelW;
          panel.position.set(px, 0, (p % 2 === 0 ? 0.04 : -0.04));
          panel.rotation.y = (p % 2 === 0 ? 0.08 : -0.08);
          panel.userData = { id: 'obj_separator' };
          sepGroup.add(panel);
        }

        scenarioGroup.add(sepGroup);
      }

      // --- 4. SIDE TABLE / CABINET ---
      // In Step 4 (Option 2 applied): only Table & Bed are shown; side table is not planned yet.
      if (!isStep4OnlyBedTable && !isRemoved('obj_side_table')) {
        const stGroup = new THREE.Group();
        stGroup.name = 'obj_side_table';
        stGroup.userData = { id: 'obj_side_table', name: 'Side Cabinet / Bookshelf', isFixed: false };

        const stW = 0.45;
        const stH = 0.56;
        const stD = 0.45;

        // Side Table positioning: initial in corner, shifts to plug point (E) per walkthrough
        let defaultSideTableX = HALF_W - stD / 2 - 0.02;
        let defaultSideTableZ = -0.15;
        let defaultSideTableRot = -Math.PI / 2;

        if (state.ghostStateActive || ['5_ghost_state', '6_side_table_moved', '7_fan_added', '8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep)) {
          if (state.sideTableHidingPlug || ['6_side_table_moved', '7_fan_added', '8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep)) {
            // Shifted near electric plug point beside table (Diagram 6)
            defaultSideTableX = -1.45;
            defaultSideTableZ = 0.0;
            defaultSideTableRot = 0;
          } else {
            // Top-left on north wall beside work table (Diagram 6 initial)
            defaultSideTableX = -1.45;
            defaultSideTableZ = -1.20;
            defaultSideTableRot = 0;
          }
        }
        const defaultStPos: [number, number, number] = [defaultSideTableX, stH / 2, defaultSideTableZ];
        const stPos = customPositions?.['obj_side_table'] || customPositions?.['det_sidetable'] || defaultStPos;
        stGroup.position.set(stPos[0], stH / 2, stPos[2]); // Always snapped to floor!
        stGroup.rotation.y = customRotations?.['obj_side_table'] ?? customRotations?.['det_sidetable'] ?? defaultSideTableRot;

        // Apply Ghost Material during Step 5 (Proposal state) or Natural Wood Grain
        const activeStMat = isGhostStep ? ghostMaterial : naturalWoodMaterial;
        const stMesh = new THREE.Mesh(new THREE.BoxGeometry(stW, stH, stD), activeStMat);
        stMesh.userData = { id: 'obj_side_table' };
        stGroup.add(stMesh);

        if (!isGhostStep) {
          // Drawer seam & brass knob
          const knob = new THREE.Mesh(
            new THREE.SphereGeometry(0.015, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 })
          );
          knob.position.set(0, 0.08, -stD / 2 - 0.01);
          stGroup.add(knob);

          // Stack of reference books / binders on top
          const bookMat1 = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 });
          const bookMat2 = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
          const bookMat3 = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.8 });
          const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.3), bookMat1);
          book1.position.set(-0.06, stH / 2 + 0.018, 0);
          stGroup.add(book1);
          const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.28), bookMat2);
          book2.position.set(-0.05, stH / 2 + 0.05, 0.01);
          stGroup.add(book2);
          const book3 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.25), bookMat3);
          book3.position.set(-0.04, stH / 2 + 0.08, -0.01);
          stGroup.add(book3);
        }

        if (isGhostStep || state.activeOverlayBox === 'sidetable') {
          addCornerBrackets(stGroup, stW + 0.05, stH + 0.05, stD + 0.05);
        }

        scenarioGroup.add(stGroup);
      }

      // --- 5. DRESSING TABLE & MIRROR (along East Wall beside Wardrobe) ---
      // In Step 4 (Option 2 applied): only Table & Bed are shown; dressing table is not planned yet.
      const dtW = 0.76;
      const dtH = 0.72; // Calibrated ergonomic vanity table height (0.72m)
      const dtD = 0.40;

      if (!isStep4OnlyBedTable && state.dressingTablePlaced && !isRemoved('obj_dressing_table')) {
        const dtGroup = new THREE.Group();
        dtGroup.name = 'obj_dressing_table';
        dtGroup.userData = { id: 'obj_dressing_table', name: 'Dressing Table & Mirror', isFixed: false };
        // Positioned along East Wall, or along center of North wall per Diagram 6
        let defaultDtPos: [number, number, number] = [HALF_W - dtD / 2 - 0.02, dtH / 2, 0.50];
        let defaultDtRot = -Math.PI / 2;

        if (state.ghostStateActive || ['5_ghost_state', '6_side_table_moved', '7_fan_added', '8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep)) {
          defaultDtPos = [0.0, dtH / 2, -HALF_L + dtD / 2 + 0.04];
          defaultDtRot = 0;
        }

        const dtPos = customPositions?.['obj_dressing_table'] || customPositions?.['det_dressing_table'] || defaultDtPos;
        dtGroup.position.set(dtPos[0], dtH / 2, dtPos[2]); // Always snapped to floor!
        dtGroup.rotation.y = customRotations?.['obj_dressing_table'] ?? customRotations?.['det_dressing_table'] ?? defaultDtRot;

        const activeDtMat = isGhostStep ? ghostMaterial : naturalWoodMaterial;

        // Solid Vanity Table Top with Natural Wood Grain
        const dtTop = new THREE.Mesh(new THREE.BoxGeometry(dtW, 0.04, dtD), activeDtMat);
        dtTop.position.y = dtH / 2 - 0.02;
        dtTop.userData = { id: 'obj_dressing_table' };
        dtGroup.add(dtTop);

        // Vanity Mirror (Calibrated height: 0.68m, Total height: 0.72 + 0.68 = 1.40m)
        const mirrorH = 0.68;
        const mirrorFrame = new THREE.Mesh(
          new THREE.BoxGeometry(0.56, mirrorH, 0.025),
          activeDtMat
        );
        mirrorFrame.position.set(0, dtH / 2 + mirrorH / 2, -dtD / 2 + 0.02);
        dtGroup.add(mirrorFrame);

        const mirrorGlass = new THREE.Mesh(
          new THREE.BoxGeometry(0.50, mirrorH - 0.08, 0.005),
          isGhostStep ? ghostMaterial : new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0.95 })
        );
        mirrorGlass.position.set(0, dtH / 2 + mirrorH / 2, -dtD / 2 + 0.035);
        dtGroup.add(mirrorGlass);

        // 4 Vanity Table Legs
        const legGeoDt = new THREE.BoxGeometry(0.04, dtH - 0.04, 0.04);
        const legMatDt = isGhostStep ? ghostMaterial : brushedMetalMaterial;
        [-dtW / 2 + 0.05, dtW / 2 - 0.05].forEach((lx) => {
          [-dtD / 2 + 0.05, dtD / 2 - 0.05].forEach((lz) => {
            const leg = new THREE.Mesh(legGeoDt, legMatDt);
            leg.position.set(lx, -(0.04 / 2), lz);
            dtGroup.add(leg);
          });
        });

        if (!isGhostStep) {
          // Cosmetics Bottles on dressing table
          const bottleMat1 = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.2 });
          const bottle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 16), bottleMat1);
          bottle1.position.set(dtW / 2 - 0.12, dtH / 2 + 0.06, 0.05);
          dtGroup.add(bottle1);

          const bottleMat2 = new THREE.MeshStandardMaterial({ color: 0xe0e7ff, roughness: 0.1, transparent: true, opacity: 0.85 });
          const bottle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 16), bottleMat2);
          bottle2.position.set(dtW / 2 - 0.2, dtH / 2 + 0.075, 0.08);
          dtGroup.add(bottle2);
        } else {
          addCornerBrackets(dtGroup, dtW + 0.05, dtH + mirrorH + 0.05, dtD + 0.05);
        }

        scenarioGroup.add(dtGroup);
      }

      // --- 5b. VANITY STOOL (in front of Dressing Table) ---
      if (!isStep4OnlyBedTable && !isRemoved('obj_dressing_stool')) {
        const stoolGroup = new THREE.Group();
        stoolGroup.name = 'obj_dressing_stool';
        stoolGroup.userData = { id: 'obj_dressing_stool', name: 'Vanity Stool', isFixed: false };
        let defaultStoolPos: [number, number, number] = [1.02, 0.20, 0.50];
        if (state.ghostStateActive || ['5_ghost_state', '6_side_table_moved', '7_fan_added', '8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep)) {
          defaultStoolPos = [0.0, 0.20, -HALF_L + dtD + 0.24];
        }
        const stoolPos = customPositions?.['obj_dressing_stool'] || customPositions?.['det_dressing_stool'] || defaultStoolPos;
        stoolGroup.position.set(stoolPos[0], 0.20, stoolPos[2]); // Snapped to floor!

        const stoolMat = isGhostStep ? ghostMaterial : new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.6 });
        const stoolSeat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.32), stoolMat);
        stoolSeat.userData = { id: 'obj_dressing_stool' };
        stoolGroup.add(stoolSeat);

        const stoolLegGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.20, 12);
        [-0.13, 0.13].forEach((lx) => {
          [-0.13, 0.13].forEach((lz) => {
            const sLeg = new THREE.Mesh(stoolLegGeo, stoolMat);
            sLeg.position.set(lx, -0.10, lz);
            stoolGroup.add(sLeg);
          });
        });
        scenarioGroup.add(stoolGroup);
      }

      // --- 6. LAUNDRY HAMPER (Remade: authentic tapered round woven rattan basket with handles, rim, & liner) ---
      if (!isStep4OnlyBedTable && !isRemoved('obj_laundry')) {
        const laundryGroup = new THREE.Group();
        laundryGroup.name = 'obj_laundry';
        laundryGroup.userData = { id: 'obj_laundry', name: 'Laundry Basket', isFixed: false };
        let defaultLaundryPos: [number, number, number] = [HALF_W - 0.24, 0, 1.25];
        if (state.ghostStateActive || ['5_ghost_state', '6_side_table_moved', '7_fan_added', '8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep)) {
          defaultLaundryPos = [-1.40, 0, 1.80];
        }
        const lndPos = customPositions?.['obj_laundry'] || customPositions?.['det_laundry'] || defaultLaundryPos;
        laundryGroup.position.set(lndPos[0], 0, lndPos[2]); // Snapped to floor (y = 0)!

        const activeHamperMat = isGhostStep ? ghostMaterial : hamperMaterial;
        const basketH = 0.58;
        const radiusTop = 0.20;
        const radiusBottom = 0.16;

        // Tapered cylindrical woven rattan basket body
        const basketBody = new THREE.Mesh(
          new THREE.CylinderGeometry(radiusTop, radiusBottom, basketH, 32, 1, false),
          activeHamperMat
        );
        basketBody.position.y = basketH / 2;
        basketBody.userData = { id: 'obj_laundry' };
        laundryGroup.add(basketBody);

        if (!isGhostStep) {
          // Top rolled wooden rim
          const rim = new THREE.Mesh(
            new THREE.TorusGeometry(radiusTop, 0.016, 16, 32),
            naturalWoodMaterial
          );
          rim.rotation.x = Math.PI / 2;
          rim.position.y = basketH;
          laundryGroup.add(rim);

          // Off-white canvas/linen fabric liner folded over rim
          const liner = new THREE.Mesh(
            new THREE.CylinderGeometry(radiusTop + 0.005, radiusTop + 0.008, 0.09, 32, 1, true),
            linenMaterial
          );
          liner.position.y = basketH - 0.04;
          laundryGroup.add(liner);

          // Dual loop handles on left and right
          const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a321e, roughness: 0.7 });
          [-radiusTop, radiusTop].forEach((hx, idx) => {
            const handle = new THREE.Mesh(
              new THREE.TorusGeometry(0.042, 0.008, 12, 24, Math.PI),
              handleMat
            );
            handle.rotation.z = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
            handle.position.set(hx + (idx === 0 ? -0.004 : 0.004), basketH - 0.05, 0);
            laundryGroup.add(handle);
          });

          // Soft folded laundry fabric peeking out of basket
          const cloth1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 16, 12),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.85 })
          );
          cloth1.position.set(-0.03, basketH + 0.02, 0.02);
          cloth1.scale.set(1.1, 0.55, 0.9);
          laundryGroup.add(cloth1);

          const cloth2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 16, 12),
            new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.9 })
          );
          cloth2.position.set(0.04, basketH + 0.025, -0.02);
          cloth2.scale.set(0.95, 0.65, 1.05);
          laundryGroup.add(cloth2);
        }

        scenarioGroup.add(laundryGroup);
      }

      // --- 7. STORAGE BOXES & CLUTTER (Decluttered & Removed when Vertical Storage added in Step 8) ---
      const hasClutterRemoved = isStep4OnlyBedTable || state.hasVerticalStorage || ['8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep);
      if (!hasClutterRemoved && !isRemoved('obj_clutter')) {
        const clutterGroup = new THREE.Group();
        clutterGroup.name = 'obj_clutter';
        clutterGroup.userData = { id: 'obj_clutter', name: 'Storage Boxes & Clutter', isFixed: false };
        const defaultClutterPos: [number, number, number] = [0.85, 0.24, 1.28];
        const clPos = customPositions?.['obj_clutter'] || customPositions?.['det_clutter'] || defaultClutterPos;
        clutterGroup.position.set(clPos[0], 0.24, clPos[2]); // Snapped to floor!
        clutterGroup.rotation.y = 0.1;

        const stoolMat = new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.6 });

        // Cardboard Boxes (Kraft corrugated paper)
        const boxKraftMat = new THREE.MeshStandardMaterial({ color: 0xb48a60, roughness: 0.88 });
        const cBox1 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.30, 0.35), boxKraftMat);
        cBox1.position.set(0, -0.10, 0);
        cBox1.userData = { id: 'obj_clutter' };
        clutterGroup.add(cBox1);

        const cBox2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.30), boxKraftMat);
        cBox2.position.set(0.04, 0.15, -0.02);
        cBox2.rotation.y = 0.08;
        cBox2.userData = { id: 'obj_clutter' };
        clutterGroup.add(cBox2);

        // Plastic Stool next to boxes
        const clStool = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.28), stoolMat);
        clStool.position.set(-0.34, -0.12, -0.05);
        clStool.userData = { id: 'obj_clutter' };
        clutterGroup.add(clStool);

        // Power Strip & Cables
        const stripMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
        const pStrip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.08), stripMat);
        pStrip.position.set(0.18, -0.23, 0.20);
        pStrip.rotation.y = -0.4;
        clutterGroup.add(pStrip);

        scenarioGroup.add(clutterGroup);
      }

      // --- 8. STANDING PEDESTAL FAN (Added in Step 7 near window/side table) ---
      const isFanStepActive = !isStep4OnlyBedTable && !isGhostStep && state.currentStep !== '6_side_table_moved' && (state.fanPlaced || ['7_fan_added', '8_personalization', '9_color_palette', '10_final_space'].includes(state.currentStep));
      if (isFanStepActive && !isRemoved('obj_pedestal_fan')) {
        const fanGroup = new THREE.Group();
        fanGroup.name = 'obj_pedestal_fan';
        fanGroup.userData = { id: 'obj_pedestal_fan', name: 'Pedestal Floor Fan', isFixed: false };

        const defaultFanPos: [number, number, number] = [-0.22, 0, 1.42];
        const fPos = customPositions?.['obj_pedestal_fan'] || customPositions?.['det_fan'] || defaultFanPos;
        fanGroup.position.set(fPos[0], 0, fPos[2]); // Snapped to floor (y = 0)!
        fanGroup.rotation.y = customRotations?.['obj_pedestal_fan'] ?? customRotations?.['det_fan'] ?? (Math.PI * 0.85);

        const fanMetal = isGhostStep ? ghostMaterial : brushedMetalMaterial;

        // Weighted Beveled Base Disc
        const fanBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.035, 32), fanMetal);
        fanBase.position.y = 0.0175;
        fanBase.userData = { id: 'obj_pedestal_fan' };
        fanGroup.add(fanBase);

        // Lower Telescopic Pole
        const fanPoleLower = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.65, 16), fanMetal);
        fanPoleLower.position.y = 0.35;
        fanPoleLower.userData = { id: 'obj_pedestal_fan' };
        fanGroup.add(fanPoleLower);

        // Adjustment Collar / Knob
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.04, 16), fanMetal);
        collar.position.y = 0.68;
        fanGroup.add(collar);

        // Upper Extension Pole
        const fanPoleUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.58, 16), fanMetal);
        fanPoleUpper.position.y = 0.95;
        fanGroup.add(fanPoleUpper);

        // Fan Head Group at y = 1.25
        const fanHead = new THREE.Group();
        fanHead.position.set(0, 1.25, 0);

        // Streamlined Motor Housing
        const motorHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.16, 24), fanMetal);
        motorHousing.rotation.x = Math.PI / 2;
        fanHead.add(motorHousing);

        // Back Grill Guard
        const backCage = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.007, 12, 32), fanMetal);
        backCage.position.z = -0.01;
        fanHead.add(backCage);

        // Front Circular Grill Frame & Wire Spokes
        const frontCage = new THREE.Group();
        frontCage.position.z = 0.07;

        // Outer rim
        const outerRim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.008, 16, 32), fanMetal);
        frontCage.add(outerRim);

        // Inner concentric guard ring
        const innerRim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.005, 12, 28), fanMetal);
        frontCage.add(innerRim);

        // Center badge plate
        const centerBadge = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 24), fanMetal);
        centerBadge.rotation.x = Math.PI / 2;
        frontCage.add(centerBadge);

        // Radial wire spokes
        for (let s = 0; s < 8; s++) {
          const spoke = new THREE.Mesh(
            new THREE.CylinderGeometry(0.002, 0.002, 0.52, 8),
            fanMetal
          );
          spoke.rotation.z = (s * Math.PI) / 8;
          frontCage.add(spoke);
        }
        fanHead.add(frontCage);

        // Spinning Internal Rotor with 3 Symmetrical Radiating Aerodynamic Blades
        const pRotor = new THREE.Group();
        pRotor.position.z = 0.035;

        // Center hub nosecone
        const rotorHub = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.03, 20), fanMetal);
        rotorHub.rotation.x = Math.PI / 2;
        pRotor.add(rotorHub);

        const bladeMat = isGhostStep ? ghostMaterial : new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.35,
          metalness: 0.4
        });

        // 3 Radiating curved fan blades
        for (let b = 0; b < 3; b++) {
          const arm = new THREE.Group();
          arm.rotation.z = (b * Math.PI * 2) / 3;

          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.075, 0.17, 0.006),
            bladeMat
          );
          blade.position.y = 0.11; // Radiate outward from center hub!
          blade.rotation.y = 0.28; // Aerodynamic pitch angle
          arm.add(blade);

          pRotor.add(arm);
        }

        fanHead.add(pRotor);
        standingFanRotor = pRotor;

        fanGroup.add(fanHead);

        if (state.activeOverlayBox === 'fan') {
          addCornerBrackets(fanGroup, 0.6, 1.5, 0.6);
        }

        scenarioGroup.add(fanGroup);
      }

      // --- 9. PERSONALIZATION: VERTICAL STORAGE ABOVE DESK (Mounted on South Wall) ---
      if (state.hasVerticalStorage) {
        const vsGroup = new THREE.Group();
        vsGroup.name = 'obj_vertical_storage';
        vsGroup.userData = { id: 'obj_vertical_storage', name: 'Wall Vertical Storage Shelves', isFixed: false };
        // Mounted on South wall directly above the study table (X = 0.55, Y = 1.70, Z = HALF_L - 0.15)
        const defaultVsPos: [number, number, number] = [0.55, 1.70, HALF_L - 0.15];
        const vsPos = customPositions?.['obj_vertical_storage'] || defaultVsPos;
        vsGroup.position.set(vsPos[0], vsPos[1], vsPos[2]);

        const shelfMat = darkWalnutMaterial;
        for (let s = 0; s < 2; s++) {
          const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.025, 0.22), shelfMat);
          shelf.position.y = s * 0.40;
          shelf.userData = { id: 'obj_vertical_storage' };
          vsGroup.add(shelf);

          const bin = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.18, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 })
          );
          bin.position.set(-0.35, s * 0.40 + 0.1, 0);
          vsGroup.add(bin);

          const plantMini = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.04, 0.09, 16),
            new THREE.MeshStandardMaterial({ color: 0xc2410c })
          );
          plantMini.position.set(0.35, s * 0.40 + 0.05, 0);
          vsGroup.add(plantMini);
        }

        scenarioGroup.add(vsGroup);
      }

      // --- 8. PERSONALIZATION: STORAGE LAMP ---
      if (state.hasStorageLamp) {
        const lampGroup = new THREE.Group();
        lampGroup.name = 'obj_storage_lamp';
        lampGroup.userData = { id: 'obj_storage_lamp', name: 'Multi-Tier Storage Floor Lamp', isFixed: false };
        const defaultLampPos: [number, number, number] = [HALF_W - 0.45, 0, HALF_L - 0.45];
        const lPos = customPositions?.['obj_storage_lamp'] || defaultLampPos;
        lampGroup.position.set(lPos[0], 0, lPos[2]); // Snapped to floor (y = 0)!

        const lampLegs = new THREE.BoxGeometry(0.025, 1.45, 0.025);
        const woodMat = darkWalnutMaterial;
        [-0.15, 0.15].forEach((lx) => {
          [-0.15, 0.15].forEach((lz) => {
            const l = new THREE.Mesh(lampLegs, woodMat);
            l.position.set(lx, 0.725, lz);
            l.userData = { id: 'obj_storage_lamp' };
            lampGroup.add(l);
          });
        });

        [0.45, 0.9].forEach((sy) => {
          const sh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.32), woodMat);
          sh.position.y = sy;
          lampGroup.add(sh);
        });

        const shade = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.35, 24),
          new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9, transparent: true, opacity: 0.92 })
        );
        shade.position.y = 1.35;
        lampGroup.add(shade);

        const lampGlow = new THREE.PointLight(0xf59e0b, 0.9, 3.5);
        lampGlow.position.set(0, 1.35, 0);
        lampGroup.add(lampGlow);

        scenarioGroup.add(lampGroup);
      }

      // --- 9. PERSONALIZATION: POTTED PLANT ---
      if (state.hasPlant) {
        const plantGroup = new THREE.Group();
        plantGroup.name = 'obj_plant';
        plantGroup.userData = { id: 'obj_plant', name: 'Indoor Potted Monstera Plant', isFixed: false };
        const defaultPlantPos: [number, number, number] = [HALF_W - 0.45, 0, -HALF_L + 0.45];
        const plPos = customPositions?.['obj_plant'] || defaultPlantPos;
        plantGroup.position.set(plPos[0], 0, plPos[2]); // Snapped to floor (y = 0)!

        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.13, 0.38, 24),
          new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 })
        );
        pot.position.y = 0.19;
        pot.userData = { id: 'obj_plant' };
        plantGroup.add(pot);

        const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 });
        for (let l = 0; l < 7; l++) {
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), leafMat);
          leaf.scale.set(0.6, 0.1, 1.4);
          leaf.position.set(
            Math.sin(l * 0.9) * 0.18,
            0.38 + l * 0.08,
            Math.cos(l * 0.9) * 0.18
          );
          leaf.rotation.set(0.4, l * 0.9, 0.3);
          plantGroup.add(leaf);
        }

        scenarioGroup.add(plantGroup);
      }

      // --- 10. PERSONALIZATION: AREA RUG / CARPET ---
      if (state.hasCarpet) {
        const rugTex = createBohoRugTexture();
        disposables.push(rugTex);
        const rugMat = new THREE.MeshStandardMaterial({
          map: rugTex,
          roughness: 0.95,
          metalness: 0.01
        });
        disposables.push(rugMat);

        const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), rugMat);
        rug.rotation.x = -Math.PI / 2;
        const defaultCarpetPos: [number, number, number] = [0.2, 0.005, 0.1];
        const cPos = customPositions?.['obj_carpet'] || defaultCarpetPos;
        rug.position.set(cPos[0], 0.005, cPos[2]); // Flat on floor!
        rug.name = 'obj_carpet';
        rug.userData = { id: 'obj_carpet', name: 'Woven Bohemian Area Rug', isFixed: false };
        scenarioGroup.add(rug);
      }

      // --- 12. PERSONALIZATION: FOLDING CHAIR ---
      if (state.hasFoldingChair) {
        const chairGroup = new THREE.Group();
        chairGroup.name = 'obj_folding_chair';
        chairGroup.userData = { id: 'obj_folding_chair', name: 'Accent Folding Chair', isFixed: false };
        const defaultChairPos: [number, number, number] = [0.45, 0.42, -0.2];
        const chPos = customPositions?.['obj_folding_chair'] || defaultChairPos;
        chairGroup.position.set(chPos[0], 0.42, chPos[2]); // Always floor-snapped!
        chairGroup.rotation.y = -Math.PI / 4;

        const chairMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.45 });
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.44), chairMat);
        seat.userData = { id: 'obj_folding_chair' };
        chairGroup.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.025), chairMat);
        back.position.set(0, 0.24, -0.21);
        chairGroup.add(back);

        const legGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.45, 12);
        [-0.2, 0.2].forEach((lx) => {
          [-0.18, 0.18].forEach((lz) => {
            const leg = new THREE.Mesh(legGeo, chairMat);
            leg.position.set(lx, -0.21, lz);
            chairGroup.add(leg);
          });
        });

        scenarioGroup.add(chairGroup);
      }
    }

    // --- 13. USER STAGED OBJECTS (GHOST WIREFRAME & FULL 3D SOLID REVEAL) ---
    if (stagedObjects && stagedObjects.length > 0) {
      stagedObjects.forEach((sObj) => {
        const objGroup = new THREE.Group();
        objGroup.name = `staged_${sObj.id}`;
        objGroup.userData = { id: sObj.id, name: sObj.name, isFixed: false };

        const [w, h, d] = sObj.dimensions || [1.2, 0.75, 0.8];
        const pos = customPositions?.[sObj.id] || sObj.position;
        // Floor items are strictly snapped to floor level: y = h / 2
        const isWallMounted = ['vertical_storage', 'clock', 'poster'].includes(sObj.type);
        const finalY = isWallMounted ? pos[1] : h / 2;
        objGroup.position.set(pos[0], finalY, pos[2]);
        objGroup.rotation.y = customRotations?.[sObj.id] ?? (sObj as any).rotationY ?? 0;

        if (sObj.isWireframe) {
          // --- GHOST WIREFRAME STATE ---
          // The same low-fidelity proxy used while repositioning: shape, facing and a soft shadow
          const proxy = buildStagingProxy(proxyKindFor(sObj.type, sObj.name), w, h, d);
          const proxyBox = proxy.getObjectByName('active_directional_cuboid') as THREE.Group;
          setBoxLook(proxyBox, sObj.isGlowing ? 0xc084fc : BOX_FREE, sObj.isGlowing ? 0.38 : 0.14);
          const proxyFill = proxyBox.getObjectByName('box_fill');
          if (proxyFill) proxyFill.userData = { id: sObj.id, name: sObj.name };
          objGroup.add(proxyBox);

          // Point light when glowing
          if (sObj.isGlowing) {
            const glowLight = new THREE.PointLight(0xc084fc, 1.8, 3.5);
            glowLight.position.set(0, h / 2, 0);
            objGroup.add(glowLight);
          }
        } else {
          // --- REALISTIC SOLID 3D MODELS WITH PROPER REAL-WORLD SCALES ---
          if (sObj.type === 'bed') {
            const bFrame = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.16, d), darkWalnutMaterial);
            bFrame.position.y = -(0.16 / 2);
            bFrame.userData = { id: sObj.id };
            objGroup.add(bFrame);

            const headboard = new THREE.Mesh(new THREE.BoxGeometry(w, 0.85, 0.08), darkWalnutMaterial);
            headboard.position.set(0, 0.35, -d / 2 + 0.04);
            objGroup.add(headboard);

            const bMat = new THREE.Mesh(
              new THREE.BoxGeometry(w - 0.06, 0.22, d - 0.08),
              new THREE.MeshStandardMaterial({ map: createPaisleyBedsheetTexture(), roughness: 0.72 })
            );
            bMat.position.y = h / 2 - 0.1;
            bMat.userData = { id: sObj.id };
            objGroup.add(bMat);

            const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
            // Two pillows sized from the bed width, so a narrower bed never has pillows hanging over its edges
            const pillowW = Math.min(0.55, (w - 0.18) / 2);
            const p1 = new THREE.Mesh(new THREE.BoxGeometry(pillowW, 0.12, 0.4), pillowMat);
            p1.position.set(-(pillowW / 2 + 0.03), h / 2 + 0.06, -d / 2 + 0.32);
            p1.rotation.x = -0.15;
            objGroup.add(p1);

            const p2 = new THREE.Mesh(new THREE.BoxGeometry(pillowW, 0.12, 0.4), pillowMat);
            p2.position.set(pillowW / 2 + 0.03, h / 2 + 0.06, -d / 2 + 0.32);
            p2.rotation.x = -0.15;
            objGroup.add(p2);
          } else if (sObj.type === 'table') {
            const tTop = new THREE.Mesh(new THREE.BoxGeometry(w, 0.045, d), darkWalnutMaterial);
            tTop.position.y = h / 2 - 0.0225;
            tTop.userData = { id: sObj.id };
            objGroup.add(tTop);

            const legGeo = new THREE.BoxGeometry(0.045, h - 0.045, 0.045);
            const legMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
            [-w / 2 + 0.06, w / 2 - 0.06].forEach((lx) => {
              [-d / 2 + 0.06, d / 2 - 0.06].forEach((lz) => {
                const l = new THREE.Mesh(legGeo, legMat);
                l.position.set(lx, -(0.045 / 2), lz);
                l.userData = { id: sObj.id };
                objGroup.add(l);
              });
            });

            const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.012, 0.22), aluminiumMaterial);
            laptopBase.position.set(0, h / 2 + 0.006, 0.05);
            objGroup.add(laptopBase);

            const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.008), aluminiumMaterial);
            laptopScreen.position.set(0, h / 2 + 0.1, -0.05);
            laptopScreen.rotation.x = 0.25;
            objGroup.add(laptopScreen);
          } else if (sObj.type === 'chair') {
            const chairMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.45 });
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.44), chairMat);
            seat.userData = { id: sObj.id };
            objGroup.add(seat);

            const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.025), chairMat);
            back.position.set(0, 0.24, -0.21);
            objGroup.add(back);

            const legGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.45, 12);
            [-0.2, 0.2].forEach((lx) => {
              [-0.18, 0.18].forEach((lz) => {
                const leg = new THREE.Mesh(legGeo, chairMat);
                leg.position.set(lx, -0.21, lz);
                objGroup.add(leg);
              });
            });
          } else if (sObj.type === 'side_table') {
            const stMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), darkWalnutMaterial);
            stMesh.userData = { id: sObj.id };
            objGroup.add(stMesh);

            const knob = new THREE.Mesh(
              new THREE.SphereGeometry(0.015, 12, 12),
              new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 })
            );
            knob.position.set(0, 0.08, -d / 2 - 0.01);
            objGroup.add(knob);
          } else if (sObj.type === 'fan') {
            const fanMetal = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.35, metalness: 0.75 });
            const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.03, 24), fanMetal);
            fBase.position.y = -h / 2 + 0.015;
            fBase.userData = { id: sObj.id };
            objGroup.add(fBase);

            const fPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, h - 0.2, 16), fanMetal);
            fPole.position.y = 0;
            objGroup.add(fPole);

            const fHead = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.01, 16, 32), fanMetal);
            fHead.position.set(0, h / 2 - 0.15, 0.05);
            objGroup.add(fHead);
          } else if (sObj.type === 'separator') {
            const sepTex = createWoodSlatsTexture();
            const sepMat = new THREE.MeshStandardMaterial({ map: sepTex, roughness: 0.6 });
            const panelW = w / 3;
            for (let p = 0; p < 3; p++) {
              const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW, h, 0.04), sepMat);
              const px = (p - 1) * panelW;
              panel.position.set(px, 0, (p % 2 === 0 ? 0.04 : -0.04));
              panel.rotation.y = (p % 2 === 0 ? 0.08 : -0.08);
              panel.userData = { id: sObj.id };
              objGroup.add(panel);
            }
          } else if (sObj.type === 'plant') {
            const pot = new THREE.Mesh(
              new THREE.CylinderGeometry(0.18, 0.13, 0.38, 24),
              new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 })
            );
            pot.position.y = -h / 2 + 0.19;
            pot.userData = { id: sObj.id };
            objGroup.add(pot);

            const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 });
            for (let l = 0; l < 7; l++) {
              const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), leafMat);
              leaf.scale.set(0.6, 0.1, 1.4);
              leaf.position.set(
                Math.sin(l * 0.9) * 0.18,
                -h / 2 + 0.38 + l * 0.08,
                Math.cos(l * 0.9) * 0.18
              );
              leaf.rotation.set(0.4, l * 0.9, 0.3);
              objGroup.add(leaf);
            }
          } else if (sObj.type === 'storage_lamp') {
            const lampLegs = new THREE.BoxGeometry(0.025, h, 0.025);
            [-0.15, 0.15].forEach((lx) => {
              [-0.15, 0.15].forEach((lz) => {
                const l = new THREE.Mesh(lampLegs, darkWalnutMaterial);
                l.position.set(lx, 0, lz);
                l.userData = { id: sObj.id };
                objGroup.add(l);
              });
            });

            [-h / 4, 0].forEach((sy) => {
              const sh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.32), darkWalnutMaterial);
              sh.position.y = sy;
              objGroup.add(sh);
            });

            const shade = new THREE.Mesh(
              new THREE.CylinderGeometry(0.18, 0.18, 0.35, 24),
              new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9, transparent: true, opacity: 0.92 })
            );
            shade.position.y = h / 2 - 0.2;
            objGroup.add(shade);

            const lampGlow = new THREE.PointLight(0xf59e0b, 0.9, 3.5);
            lampGlow.position.set(0, h / 2 - 0.2, 0);
            objGroup.add(lampGlow);
          } else if (sObj.type === 'lounge') {
            // A low armchair: thick seat, tall back, two arms, short legs
            const fabric = new THREE.MeshStandardMaterial({ color: 0xd8cdb8, roughness: 0.92 });
            const bottom = -h / 2 + 0.12;
            const seat = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d - 0.06), fabric);
            seat.position.set(0, bottom + 0.1, 0.03); seat.userData = { id: sObj.id }; objGroup.add(seat);
            const backH = h - 0.12;
            const back = new THREE.Mesh(new THREE.BoxGeometry(w, backH, 0.16), fabric);
            back.position.set(0, bottom + backH / 2, -d / 2 + 0.1); back.rotation.x = -0.1; back.userData = { id: sObj.id }; objGroup.add(back);
            [-1, 1].forEach((sx) => {
              const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, d - 0.12), fabric);
              arm.position.set(sx * (w / 2 - 0.06), bottom + 0.25, 0.04); objGroup.add(arm);
              [-1, 1].forEach((sz) => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.12, 12), darkWalnutMaterial);
                leg.position.set(sx * (w / 2 - 0.08), -h / 2 + 0.06, sz * (d / 2 - 0.1)); objGroup.add(leg);
              });
            });
          } else if (sObj.type === 'beanbag') {
            const bag = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 22), new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.95 }));
            bag.scale.set(w / 2, h / 2, d / 2); bag.userData = { id: sObj.id }; objGroup.add(bag);
          } else if (sObj.type === 'floor_lamp') {
            const base = new THREE.Mesh(new THREE.CylinderGeometry(Math.min(w / 2, 0.16), Math.min(w / 2, 0.16), 0.03, 28), darkWalnutMaterial);
            base.position.y = -h / 2 + 0.015; base.userData = { id: sObj.id }; objGroup.add(base);
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, h - 0.3, 12), new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.6, roughness: 0.35 }));
            pole.position.y = -h / 2 + 0.03 + (h - 0.3) / 2; objGroup.add(pole);
            const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.38, w / 2, 0.3, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9, side: THREE.DoubleSide, emissive: 0xf5c46b, emissiveIntensity: 0.25 }));
            lampShade.position.y = h / 2 - 0.15; objGroup.add(lampShade);
            const glow = new THREE.PointLight(0xf59e0b, 0.7, 3.2); glow.position.set(0, h / 2 - 0.15, 0); objGroup.add(glow);
          } else if (sObj.type === 'mat') {
            const mat = new THREE.Mesh(new THREE.BoxGeometry(w, Math.max(h, 0.01), d), new THREE.MeshStandardMaterial({ color: 0x9db79a, roughness: 0.85 }));
            mat.userData = { id: sObj.id }; objGroup.add(mat);
          } else if (sObj.type === 'poster') {
            // A framed world map: a thin dark frame and the print in front of it
            const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), new THREE.MeshStandardMaterial({ color: 0x2b2522, roughness: 0.5 }));
            frame.position.z = -0.0; frame.userData = { id: sObj.id }; objGroup.add(frame);
            const print = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.05, h - 0.05), new THREE.MeshStandardMaterial({ map: createWorldMapTexture(), roughness: 0.85 }));
            print.position.z = 0.0105; print.userData = { id: sObj.id }; objGroup.add(print);
          } else if (sObj.type === 'bookcase') {
            // An open bookshelf: two sides and five boards, with books, a plant, a vase, a globe and a photo on it
            const std = (color: number, rough = 0.8) => new THREE.MeshStandardMaterial({ color, roughness: rough });
            const sideGeo = new THREE.BoxGeometry(0.03, h, d);
            [-1, 1].forEach((sx) => { const sd = new THREE.Mesh(sideGeo, darkWalnutMaterial); sd.position.x = sx * (w / 2 - 0.015); sd.userData = { id: sObj.id }; objGroup.add(sd); });
            const gap = (h - 0.03) / 4, topOf = (k: number) => -h / 2 + 0.03 + k * gap;
            for (let k = 0; k < 5; k++) { const board = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, 0.03, d), darkWalnutMaterial); board.position.y = -h / 2 + 0.015 + k * gap; objGroup.add(board); }
            const colours = [0x8b2e2e, 0x2e5b8b, 0xc9a24a, 0x3f6b4f, 0x5c4a7a, 0xb5651d, 0x2b2522, 0xd8cdb8];
            const book = (x: number, k: number, bw: number, bh: number, col: number, lean = 0) => {
              const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, d * 0.62), std(col)); b.position.set(x, topOf(k) + bh / 2, 0.01); b.rotation.z = lean; objGroup.add(b); return b;
            };
            const row = (k: number, from: number, count: number, seed: number) => { let x = from; for (let i = 0; i < count; i++) { const bw = 0.028 + ((i * 7 + seed) % 3) * 0.008, bh = gap * (0.58 + ((i * 13 + seed * 5) % 28) / 100); book(x + bw / 2, k, bw, bh, colours[(i + seed) % colours.length]); x += bw + 0.004; } return x; };
            // shelf 1: a row of books leaning on a last one, and a small plant
            const endX = row(1, -w / 2 + 0.06, 9, 0); book(endX + 0.075, 1, 0.03, gap * 0.72, colours[3], -0.38);
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.038, 0.09, 18), std(0xb5651d)); pot.position.set(w / 2 - 0.11, topOf(1) + 0.045, 0.01); objGroup.add(pot);
            [[0, 0.13, 0, 0.065], [-0.035, 0.1, 0.01, 0.045], [0.04, 0.11, -0.01, 0.045]].forEach(([dx, dy, dz, r]) => { const lf = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), std(0x3f7d4f, 0.6)); lf.position.set(w / 2 - 0.11 + dx, topOf(1) + dy, 0.01 + dz); lf.scale.set(1, 1.2, 1); objGroup.add(lf); });
            // shelf 2: books lying in a stack, and a vase
            [0, 1, 2, 3].forEach((i) => { const st2 = new THREE.Mesh(new THREE.BoxGeometry(0.22 - i * 0.012, 0.035, d * 0.55), std(colours[(i + 2) % colours.length])); st2.position.set(-w / 2 + 0.17 + (i % 2) * 0.008, topOf(2) + 0.0175 + i * 0.035, 0.01); objGroup.add(st2); });
            const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.22, 20), std(0xe8dfc9, 0.35)); vase.position.set(w / 2 - 0.13, topOf(2) + 0.11, 0.01); objGroup.add(vase);
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.04, 0.07, 16), std(0xe8dfc9, 0.35)); neck.position.set(w / 2 - 0.13, topOf(2) + 0.255, 0.01); objGroup.add(neck);
            // shelf 3: books, a small globe and a framed photo
            row(3, -w / 2 + 0.06, 6, 3);
            const gb = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.02, 18), darkWalnutMaterial); gb.position.set(w / 2 - 0.2, topOf(3) + 0.01, 0.01); objGroup.add(gb);
            const globe = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), std(0x4f86a6, 0.5)); globe.position.set(w / 2 - 0.2, topOf(3) + 0.115, 0.01); objGroup.add(globe);
            const photo = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.17, 0.014), std(0xf1e7d3)); photo.position.set(w / 2 - 0.075, topOf(3) + 0.085, 0.07); photo.rotation.x = -0.12; objGroup.add(photo);
            // the top: a basket and a candle
            const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.1, 22), std(0xb08d57, 0.9)); basket.position.set(-w / 4, topOf(4) + 0.05, 0.01); objGroup.add(basket);
            const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 16), std(0xfaf3e3, 0.6)); candle.position.set(w / 4, topOf(4) + 0.06, 0.01); objGroup.add(candle);

            const rugTex = createBohoRugTexture();
            const rugMat = new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95 });
            const rug = new THREE.Mesh(new THREE.PlaneGeometry(w, d), rugMat);
            rug.rotation.x = -Math.PI / 2;
            rug.userData = { id: sObj.id };
            objGroup.add(rug);
          } else if (sObj.type === 'dressing_table') {
            const dtTop = new THREE.Mesh(new THREE.BoxGeometry(w, 0.035, d), darkWalnutMaterial);
            dtTop.position.y = -0.15;
            dtTop.userData = { id: sObj.id };
            objGroup.add(dtTop);

            const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.95, 0.03), darkWalnutMaterial);
            mirrorFrame.position.set(0, 0.35, -d / 2 + 0.02);
            objGroup.add(mirrorFrame);

            const mirrorGlass = new THREE.Mesh(
              new THREE.BoxGeometry(0.55, 0.85, 0.005),
              new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.95 })
            );
            mirrorGlass.position.set(0, 0.35, -d / 2 + 0.04);
            objGroup.add(mirrorGlass);

            const legGeo = new THREE.BoxGeometry(0.04, h * 0.5, 0.04);
            const legMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
            [-w / 2 + 0.05, w / 2 - 0.05].forEach((lx) => {
              [-d / 2 + 0.05, d / 2 - 0.05].forEach((lz) => {
                const leg = new THREE.Mesh(legGeo, legMat);
                leg.position.set(lx, -h / 4 - 0.15, lz);
                objGroup.add(leg);
              });
            });
          } else if (sObj.type === 'vertical_storage') {
            for (let s = 0; s < 2; s++) {
              const shelf = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, d), darkWalnutMaterial);
              shelf.position.y = (s - 0.5) * 0.45;
              shelf.userData = { id: sObj.id };
              objGroup.add(shelf);
            }
          } else if (sObj.type === 'clock') {
            const clockFrame = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), darkWalnutMaterial);
            clockFrame.userData = { id: sObj.id };
            objGroup.add(clockFrame);

            const clockFace = new THREE.Mesh(
              new THREE.CylinderGeometry(w * 0.4, w * 0.4, 0.01, 32),
              new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.3 })
            );
            clockFace.rotation.x = Math.PI / 2;
            clockFace.position.z = d / 2 + 0.006;
            objGroup.add(clockFace);
          } else if (sObj.type === 'storage_boxes') {
            const boxMat = new THREE.MeshStandardMaterial({ color: 0xd4c5b9, roughness: 0.85 });
            const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), boxMat);
            box.userData = { id: sObj.id };
            objGroup.add(box);
          } else {
            const solidBlock = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), darkWalnutMaterial);
            solidBlock.userData = { id: sObj.id };
            objGroup.add(solidBlock);
          }
        }

        scenarioGroup.add(objGroup);
      });
    }

    // Step 2: Movable Assets Glow (Bed, Desk, Chair, Side Table, Dressing Table, Stool, Laundry, Clutter, Floor Fan)
    // Only glow when currentStep === 'assets'. When 'constraints' or 'completed', movable items render normally!
    const isAssetGlow = false;
    const detectedScenarioNames = [
      'obj_bed',
      'obj_study_table',
      'obj_chair',
      'obj_side_table',
      'obj_dressing_table',
      'obj_dressing_stool',
      'obj_laundry',
      'obj_clutter',
      'obj_pedestal_fan'
    ];
    detectedScenarioNames.forEach((name) => {
      const grp = scenarioGroup.getObjectByName(name);
      if (grp) {
        applyGhostModeToGroup(grp, isAssetGlow);
      }
    });
  };

  // --- TICK ANIMATION METHOD ---
  let glowTimeAccum = 0;
  const tickAnimation = (delta: number) => {
    if (rotorGroup) {
      rotorGroup.rotation.y += delta * 4.2; // Smooth continuous fan rotation
    }
    if (standingFanRotor) {
      standingFanRotor.rotation.z += delta * 12.0; // Pedestal fan rotation
    }
    // Pulse detection phase ghost material
    if (isDetectionPhaseActive) {
      glowTimeAccum += delta;
      const pulseIntensity = Math.sin(glowTimeAccum * 2.8) * 0.7 + 2.1;
      detectionGhostMaterial.emissiveIntensity = pulseIntensity;
    }
  };

  // --- DISPOSAL CLEANUP METHOD ---
  const dispose = () => {
    disposables.forEach((item) => {
      try {
        item.dispose();
      } catch {
        // Ignore cleanup warnings
      }
    });
  };

  return {
    group: rootGroup,
    interactiveMeshes,
    updateLighting,
    updateScenarioState,
    tickAnimation,
    fanMeshGroup: ceilingFanGroup,
    dispose
  };
}
