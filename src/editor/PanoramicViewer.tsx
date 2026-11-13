import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomModeId, RoomObject, LightingSetting, ScenarioState, StagedObject, IdentificationStep, DetectionShape, DetectionEdit, UserDetection } from '../types';
import { DETECTED_BASELINE_OBJECTS } from '../data/mockData';
import {
  IdentifiedConstraint,
  IdentifiedAsset,
  IDENTIFIED_CONSTRAINTS,
  IDENTIFIED_MOVABLE_ASSETS
} from '../data/identificationData';
import { build3DSquareRoom, Room3DScene } from '../utils/proceduralRoom3D';
import { ContextualObjectTag } from './ContextualObjectTag';
import { DetectionLayer, AddState } from './DetectionLayer';
import { DETECTION_LABELS } from '../data/detectionLabels';
import {
  buildStagingProxy, buildStagingProxyFromObject, proxyKindFor, ProxyKind, computePlacement, snappedFaceNames, flashFaces, tickFlashes, setBoxLook, Flash, Placement,
  BOX_FREE, BOX_SNAPPED,
} from '../utils/stagingProxy';
import { outlineFromBox, defaultQuad, isValidShape, dragShape, directionFromScreen } from '../utils/detectionFrames';
import {
  RotateCw,
  RotateCcw,
  Check,
  Sparkles,
  Smartphone,
  Move,
  SlidersHorizontal,
  Trash2,
  Pencil,
  Minus,
  HelpCircle,
  X
} from 'lucide-react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Divider } from '@/components/ui/divider';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { glass, floatingIconButton } from '@/components/glass';

/** A moved piece of furniture waiting for Confirm. Shown only as a bounding box until then. */
export interface PendingMove {
  position: [number, number, number];
  rotationY: number;
}

/** Opening view (degrees): window, hamper and storage boxes in frame, slightly looking down. */
const START_LON = 45;
const START_LAT = -12;

export const FIXED_OBJECT_IDS = new Set([
  'obj_wardrobe',
  'obj_door',
  'obj_door_switch',
  'obj_window_south_1',
  'obj_window_south_2',
  'obj_split_ac',
  'obj_ac_starter',
  'obj_wall_plug_points',
  'obj_tube_light',
  'obj_ceiling_fan',
  'obj_ceramic_tiles',
  'det_wardrobe',
  'det_ac',
  'det_door',
  'det_tubelight'
]);

/**
 * Retrieve real-world physical scale dimensions [W, H, D] for room objects
 */
export const getObjectDimensions = (id: string, name: string = ''): [number, number, number] => {
  const lower = (id + ' ' + name).toLowerCase();
  if (lower.includes('bed')) return [1.02, 0.85, 1.95]; // Calibrated compact bed (fits right of door)
  if (lower.includes('dressing') && !lower.includes('stool')) return [0.76, 1.40, 0.40]; // Vanity table (0.72m) + mirror (0.68m) = 1.40m
  if (lower.includes('side') || lower.includes('sidetable')) return [0.45, 0.56, 0.45];
  if (lower.includes('table') || lower.includes('desk')) return [1.05, 0.75, 0.60];
  if (lower.includes('fan')) return [0.48, 1.30, 0.48]; // Pedestal fan with 3 aerodynamic blades
  if (lower.includes('laundry') || lower.includes('hamper') || lower.includes('basket')) return [0.42, 0.58, 0.42]; // Tapered cylindrical rattan hamper
  if (lower.includes('stool')) return [0.32, 0.40, 0.32];
  if (lower.includes('chair')) return [0.48, 0.82, 0.48];
  if (lower.includes('clutter') || lower.includes('box')) return [0.85, 0.55, 0.75];
  if (lower.includes('separator')) return [0.08, 1.60, 1.40];
  if (lower.includes('wardrobe')) return [1.15, 2.30, 0.55];
  return [1.0, 0.75, 0.6];
};

/** A piece measured from what is actually drawn: its size, and where the centre of that box sits. */
export interface Measured {
  dims: [number, number, number];
  /** Box centre relative to the piece's origin, unrotated. y is the absolute height of the centre. */
  offset: [number, number, number];
}
const measuredCache = new Map<string, Measured>();

/** Where an offset measured on the unrotated piece lands once the piece is turned about its origin. */
export const rotateOffset = (off: [number, number, number], rotY: number) => ({
  x: off[0] * Math.cos(rotY) + off[2] * Math.sin(rotY),
  z: -off[0] * Math.sin(rotY) + off[2] * Math.cos(rotY),
});

/**
 * The real extents of a piece, from its meshes, so staging and selection boxes match the model that is
 * drawn instead of a catalogue guess. Measured once with the piece unrotated; falls back to the
 * catalogue size if the meshes give nothing sensible.
 */
export const measureObject = (obj: THREE.Object3D, id: string, name = ''): Measured => {
  const cached = measuredCache.get(id);
  if (cached) return cached;
  const fallback = getObjectDimensions(id, name);
  const savedRot = obj.rotation.y;
  obj.rotation.y = 0;
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const part = new THREE.Box3();
  obj.traverse((c) => {
    const mesh = c as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry || mesh.userData?.isDetectorGlow || mesh.name === 'detected_glow') return;
    for (let cur: THREE.Object3D | null = mesh; cur && cur !== obj; cur = cur.parent) if (!cur.visible) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    part.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);
    box.union(part);
  });
  obj.rotation.y = savedRot;
  obj.updateMatrixWorld(true);

  const size = box.getSize(new THREE.Vector3());
  let measured: Measured;
  if (box.isEmpty() || size.x < 0.05 || size.z < 0.05 || size.x > 4 || size.z > 4 || size.y > 3.5) {
    measured = { dims: fallback, offset: [0, fallback[1] / 2, 0] };
  } else {
    const centre = box.getCenter(new THREE.Vector3());
    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos);
    measured = { dims: [size.x, size.y, size.z], offset: [centre.x - pos.x, centre.y, centre.z - pos.z] };
  }
  measuredCache.set(id, measured);
  return measured;
};

/** Top centre of a piece as drawn, for pinning a tag just above it. */
const topAnchor = (obj: THREE.Object3D, id: string, out: THREE.Vector3) => {
  const m = measureObject(obj, id, obj.userData?.name || obj.name);
  const ro = rotateOffset(m.offset, obj.rotation.y);
  obj.getWorldPosition(out);
  out.x += ro.x;
  out.z += ro.z;
  out.y = m.offset[1] + m.dims[1] / 2 + 0.12;
};

/**
 * Concise display name for contextual tags and action modals
 */
export const getCleanObjectName = (id: string, name: string = ''): string => {
  const lower = (id + ' ' + name).toLowerCase();
  if (lower.includes('bed')) return 'Bed';
  if (lower.includes('side')) return 'Side Table';
  if (lower.includes('dressing') && !lower.includes('stool')) return 'Dressing Table';
  if (lower.includes('table') || lower.includes('desk')) return 'Study Table';
  if (lower.includes('fan')) return 'Pedestal Fan';
  if (lower.includes('laundry') || lower.includes('hamper') || lower.includes('basket')) return 'Laundry Hamper';
  if (lower.includes('stool')) return 'Vanity Stool';
  if (lower.includes('side')) return 'Side Table';
  if (lower.includes('dressing')) return 'Dressing Table';
  if (lower.includes('separator')) return 'Room Separator';
  if (lower.includes('clutter') || lower.includes('box')) return 'Storage Boxes';
  if (lower.includes('chair')) return 'Chair';
  if (lower.includes('wardrobe')) return 'Wardrobe';
  if (lower.includes('plug')) return 'Plug Point';
  if (lower.includes('window')) return 'Window';
  if (lower.includes('ac')) return 'Split AC';
  if (lower.includes('door')) return 'Door';
  return name || 'Object';
};

/**
 * Builds a faint white wireframe bounding box outline for selected objects.
 * NO color fill, NO emissive tint - leaves procedural materials/textures untouched.
 */
export const buildFaintOutline = (w: number, h: number, d: number): THREE.LineSegments => {
  const halfW = w / 2;
  const halfH = h / 2;
  const halfD = d / 2;

  const edgePoints: THREE.Vector3[] = [
    // Bottom
    new THREE.Vector3(-halfW, -halfH, -halfD), new THREE.Vector3( halfW, -halfH, -halfD),
    new THREE.Vector3( halfW, -halfH, -halfD), new THREE.Vector3( halfW, -halfH,  halfD),
    new THREE.Vector3( halfW, -halfH,  halfD), new THREE.Vector3(-halfW, -halfH,  halfD),
    new THREE.Vector3(-halfW, -halfH,  halfD), new THREE.Vector3(-halfW, -halfH, -halfD),
    // Top
    new THREE.Vector3(-halfW,  halfH, -halfD), new THREE.Vector3( halfW,  halfH, -halfD),
    new THREE.Vector3( halfW,  halfH, -halfD), new THREE.Vector3( halfW,  halfH,  halfD),
    new THREE.Vector3( halfW,  halfH,  halfD), new THREE.Vector3(-halfW,  halfH,  halfD),
    new THREE.Vector3(-halfW,  halfH,  halfD), new THREE.Vector3(-halfW,  halfH, -halfD),
    // Verticals
    new THREE.Vector3(-halfW, -halfH, -halfD), new THREE.Vector3(-halfW,  halfH, -halfD),
    new THREE.Vector3( halfW, -halfH, -halfD), new THREE.Vector3( halfW,  halfH, -halfD),
    new THREE.Vector3( halfW, -halfH,  halfD), new THREE.Vector3( halfW,  halfH,  halfD),
    new THREE.Vector3(-halfW, -halfH,  halfD), new THREE.Vector3(-halfW,  halfH,  halfD),
  ];

  const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePoints);
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.32,
    depthWrite: false
  });
  return new THREE.LineSegments(edgeGeo, edgeMat);
};

/**
 * Staging box for one object while it is repositioned. A low-fidelity proxy: rough shape, which way
 * it faces, and a soft shadow on the floor. See utils/stagingProxy.
 */
export const buildDirectionalStagingGroup = (
  w: number,
  h: number,
  d: number,
  _originPos: [number, number, number],
  kind: ProxyKind = 'generic'
): THREE.Group => buildStagingProxy(kind, w, h, d);

/** What the viewer offers the app: where a screen point lands on the floor, with wall snapping. */
export interface ViewerApi {
  floorPointAt: (clientX: number, clientY: number, dims: [number, number, number], id?: string) => Placement | null;
  /** Where a piece is now (including a move still waiting for Confirm), from the model that is drawn */
  getPiece: (id: string) => import('../utils/aiMoves').PieceState | null;
}

interface PanoramicViewerProps {
  mode: RoomModeId;
  lighting: LightingSetting;
  customPanoramaUrl?: string | null;
  objects: RoomObject[];
  selectedObject: RoomObject | null;
  onSelectObject: (obj: RoomObject | null) => void;
  selectedObjectIds?: string[];
  onSelectObjectIds?: (ids: string[]) => void;
  onEditSelectedWithAi?: (ids: string[]) => void;
  onSuggestArrangement?: (ids: string[]) => void;
  pendingMoves?: Record<string, PendingMove>;
  onStageMove?: (id: string, move: PendingMove) => void;
  isConfirmingMoves?: boolean;
  scenarioState?: ScenarioState;
  stagedObjects?: StagedObject[];
  showDetectedOutlines?: boolean;
  onGenerateAiSuggestion?: (obj: StagedObject) => void;
  onRemoveStagedObject?: (id: string) => void;
  /** Takes a piece of furniture out of the room (the minus on a selected object) */
  onRemoveSceneObject?: (id: string) => void;
  /** A catalogue piece being dragged in from the Assets drawer: shown as a staging box under the finger */
  draggingAsset?: { id: string; name: string; dims: [number, number, number] } | null;
  apiRef?: React.MutableRefObject<ViewerApi | null>;
  onNudgeStagedObject?: (id: string, dx: number, dz: number) => void;
  customPositions?: Record<string, [number, number, number]>;
  customRotations?: Record<string, number>;
  onUpdateObjectPosition?: (id: string, position: [number, number, number]) => void;
  onUpdateObjectRotation?: (id: string, rotationY: number) => void;
  isRoomCleared?: boolean;
  onFixedObjectSelected?: (name: string) => void;
  isDetectionPhase?: boolean;
  identificationStep?: IdentificationStep;
  onOpenEditConstraint?: (constraint: IdentifiedConstraint) => void;
  onOpenAiEditAsset?: (asset: IdentifiedAsset) => void;
  /** What the user changed about each detection (corners, label), by item id */
  detectionEdits?: Record<string, DetectionEdit>;
  /** Detections the user drew because the AI missed them */
  userDetections?: UserDetection[];
  /** Tags the user dismissed as wrong */
  removedTagIds?: string[];
  onEditDetection?: (id: string, patch: DetectionEdit) => void;
  onResetDetection?: (id: string) => void;
  onAddDetection?: (detection: UserDetection) => void;
  onRemoveTag?: (id: string, name: string) => void;
  onShiftSideTable?: () => void;
  isUiHidden?: boolean;
  /** A sheet or drawer covers the room: tags would show through its glass, so they step out */
  hideObjectTags?: boolean;
}

export const PanoramicViewer: React.FC<PanoramicViewerProps> = ({
  mode,
  lighting,
  objects,
  selectedObject,
  onSelectObject,
  selectedObjectIds: propSelectedObjectIds,
  onSelectObjectIds,
  onEditSelectedWithAi,
  onSuggestArrangement,
  pendingMoves = {},
  onStageMove,
  isConfirmingMoves = false,
  scenarioState,
  stagedObjects = [],
  showDetectedOutlines = true,
  onGenerateAiSuggestion,
  onRemoveStagedObject,
  onRemoveSceneObject,
  draggingAsset,
  apiRef,
  onNudgeStagedObject,
  customPositions,
  customRotations,
  onUpdateObjectPosition,
  onUpdateObjectRotation,
  isRoomCleared = false,
  onFixedObjectSelected,
  isDetectionPhase = false,
  identificationStep = 'completed',
  onOpenEditConstraint,
  onOpenAiEditAsset,
  detectionEdits,
  userDetections,
  removedTagIds,
  onEditDetection,
  onResetDetection,
  onAddDetection,
  onRemoveTag,
  onShiftSideTable,
  isUiHidden = false,
  hideObjectTags = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const room3DRef = useRef<Room3DScene | null>(null);
  const photoSphereRef = useRef<THREE.Mesh | null>(null);
  const selectionBoxRef = useRef<THREE.BoxHelper | null>(null);

  // Multi-Object Selection State & Sync
  const [internalSelectedObjectIds, setInternalSelectedObjectIds] = useState<string[]>([]);
  const effectiveSelectedIds = propSelectedObjectIds !== undefined ? propSelectedObjectIds : internalSelectedObjectIds;

  const onSelectObjectIdsRef = useRef(onSelectObjectIds);
  onSelectObjectIdsRef.current = onSelectObjectIds;

  const setSelectedObjectIds = useCallback((valOrUpdater: string[] | ((prev: string[]) => string[])) => {
    // Tell the app outside the state updater: calling its setter from inside one updates the app mid-render
    const next = typeof valOrUpdater === 'function' ? valOrUpdater(effectiveSelectedIdsRef.current) : valOrUpdater;
    setInternalSelectedObjectIds(next);
    onSelectObjectIdsRef.current?.(next);
  }, []);

  const [selectedScreenCoords, setSelectedScreenCoords] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});

  // Interaction State
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [isGyroActive, setIsGyroActive] = useState(false);

  // Active single-targeted asset in Step 2 of identification flow
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const overlayElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Detections: outlines are directions from the eye, so they stay attached to the image.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState<AddState>(null);
  const [lookAround, setLookAround] = useState(false);
  const [relabelOpen, setRelabelOpen] = useState(false);
  const [drawBox, setDrawBox] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const detElsRef = useRef<Map<string, Element>>(new Map());
  /** Shape while a finger is still dragging it; committed to the app on release */
  const liveShapesRef = useRef<Map<string, DetectionShape>>(new Map());
  const baseShapesRef = useRef<Map<string, DetectionShape>>(new Map());
  const editsRef = useRef(detectionEdits);
  editsRef.current = detectionEdits;
  const userDetectionsRef = useRef(userDetections);
  userDetectionsRef.current = userDetections;
  const onEditDetectionRef = useRef(onEditDetection);
  onEditDetectionRef.current = onEditDetection;
  const dragRef = useRef<{ id: string; kind: 'move' | number; start: DetectionShape; last: DetectionShape; p0: THREE.Vector3; x: number; y: number; pointerId: number } | null>(null);
  const applyDragRef = useRef<() => void>(() => {});
  const detPanRef = useRef({ lon: 0, lat: 0 });
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);

  // Outline a detection starts from: the corners of the catalogued object, or what the user drew
  const getBaseShape = (id: string): DetectionShape | undefined => {
    const cached = baseShapesRef.current.get(id);
    if (cached) return cached;
    let shape: DetectionShape | undefined;
    const c = IDENTIFIED_CONSTRAINTS.find((x) => x.id === id);
    const a = IDENTIFIED_MOVABLE_ASSETS.find((x) => x.id === id);
    const u = userDetectionsRef.current?.find((x) => x.id === id);
    if (c) shape = outlineFromBox(c.position, c.dimensions, 'face');
    else if (a) shape = outlineFromBox(a.position, a.dimensions, 'silhouette');
    else if (u) shape = u.points;
    if (shape) baseShapesRef.current.set(id, shape);
    return shape;
  };

  // Committed edits replace whatever was being dragged
  useEffect(() => {
    liveShapesRef.current.clear();
  }, [detectionEdits]);

  // Reset active asset target when identification step switches
  useEffect(() => {
    setActiveAssetId(null);
    setEditingId(null);
    setAdding(null);
    setRelabelOpen(false);
    setLookAround(false);
    setDrawBox(null);
  }, [identificationStep]);

  const stagedObjectsRef = useRef(stagedObjects);
  stagedObjectsRef.current = stagedObjects;
  const showDetectedOutlinesRef = useRef(showDetectedOutlines);
  showDetectedOutlinesRef.current = showDetectedOutlines;
  const isDetectionPhaseRef = useRef(isDetectionPhase);
  isDetectionPhaseRef.current = isDetectionPhase;
  const identificationStepRef = useRef(identificationStep);
  identificationStepRef.current = identificationStep;
  const onOpenEditConstraintRef = useRef(onOpenEditConstraint);
  onOpenEditConstraintRef.current = onOpenEditConstraint;
  const onOpenAiEditAssetRef = useRef(onOpenAiEditAsset);
  onOpenAiEditAssetRef.current = onOpenAiEditAsset;
  const frameCountRef = useRef(0);

  // Movable Object Touch Drag State & Edge-Panning Refs
  const isDraggingObject = useRef<boolean>(false);
  const [isDraggingState, setIsDraggingState] = useState<boolean>(false);
  const draggedObjectId = useRef<string | null>(null);
  const draggedObjectRef = useRef<THREE.Object3D | null>(null);
  const [draggedObjectName, setDraggedObjectName] = useState<string>('');
  const dragOffset = useRef<THREE.Vector3>(new THREE.Vector3());
  const floorPlane = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const edgePanDelta = useRef<{ lon: number; lat: number }>({ lon: 0, lat: 0 });
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Gyroscope tracking refs (Calibrated relative orientation & smooth lerping)
  const gyroBaseline = useRef<{
    alpha: number;
    beta: number;
    baseLon: number;
    baseLat: number;
  } | null>(null);
  const gyroTarget = useRef<{ lon: number; lat: number }>({ lon: 0, lat: 0 });

  // Pointer & Gesture Interaction Refs (Tap, Hold-to-select, Hold-and-drag staging)
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerDownTime = useRef<number>(0);
  const pointerTargetObj = useRef<{ id: string; name: string; object: THREE.Object3D; isFixed: boolean } | null>(null);
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingObject = useRef<boolean>(false);
  const hasMovedSignificantly = useRef<boolean>(false);
  const effectiveSelectedIdsRef = useRef<string[]>(effectiveSelectedIds);
  effectiveSelectedIdsRef.current = effectiveSelectedIds;

  const customPositionsRef = useRef(customPositions);
  customPositionsRef.current = customPositions;
  const isRoomClearedRef = useRef(isRoomCleared);
  isRoomClearedRef.current = isRoomCleared;
  const onUpdateObjectPositionRef = useRef(onUpdateObjectPosition);
  onUpdateObjectPositionRef.current = onUpdateObjectPosition;
  const onFixedObjectSelectedRef = useRef(onFixedObjectSelected);
  onFixedObjectSelectedRef.current = onFixedObjectSelected;
  const customRotationsRef = useRef(customRotations);
  customRotationsRef.current = customRotations;
  const onUpdateObjectRotationRef = useRef(onUpdateObjectRotation);
  onUpdateObjectRotationRef.current = onUpdateObjectRotation;
  identificationStepRef.current = identificationStep;
  onOpenEditConstraintRef.current = onOpenEditConstraint;
  onOpenAiEditAssetRef.current = onOpenAiEditAsset;

  // Staging Wireframe Variant & Two-Finger Rotation State (Concepts 1 & 4)
  const stagingGroupRef = useRef<THREE.Group>(new THREE.Group());
  const pendingBoxesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const pendingMovesRef = useRef(pendingMoves);
  pendingMovesRef.current = pendingMoves;
  const isConfirmingMovesRef = useRef(isConfirmingMoves);
  isConfirmingMovesRef.current = isConfirmingMoves;
  const onStageMoveRef = useRef(onStageMove);
  onStageMoveRef.current = onStageMove;
  const hiddenPendingIds = useRef<Set<string>>(new Set());
  const isSnappedRef = useRef(false);
  const snappedWallsRef = useRef('0,0');
  const flashesRef = useRef<Flash[]>([]);
  const assetPreviewRef = useRef<THREE.Group>(new THREE.Group());
  const assetFrameRef = useRef<(() => void) | null>(null);
  const placeStagingBoxRef = useRef<(hit: THREE.Vector3) => void>(() => {});
  /** Where the held ghost is heading; the render loop glides it there (see animate) */
  const stagingTargetRef = useRef<{ x: number; z: number } | null>(null);
  const faintOutlineGroupRef = useRef<THREE.Group>(new THREE.Group());
  const activeStagingCuboidRef = useRef<THREE.Group | null>(null);
  const [stagedInfo, setStagedInfo] = useState<{
    id: string;
    name: string;
    dimensions: [number, number, number];
    originPos: [number, number, number];
    currentPos: [number, number, number];
    rotationY: number;
  } | null>(null);

  const HOLD_MS = 420;
  const isTwoFingerRotating = useRef<boolean>(false);
  const initialTwoFingerAngle = useRef<number>(0);
  const initialStagedRotation = useRef<number>(0);
  const currentStagedRotation = useRef<number>(0);
  const stagedObjectDimensions = useRef<[number, number, number]>([1.2, 0.75, 0.6]);
  const stagedCenterOffset = useRef<[number, number, number]>([0, 0.375, 0]);
  const stagedOriginPos = useRef<[number, number, number]>([0, 0, 0]);
  const stagedCurrentPos = useRef<[number, number, number]>([0, 0, 0]);

  // Inside View Angles (Spherical rotation around interior eye point)
  const isUserInteracting = useRef(false);
  const onPointerDownPointerX = useRef(0);
  const onPointerDownPointerY = useRef(0);
  const onPointerDownLon = useRef(0);
  const onPointerDownLat = useRef(0);
  const lon = useRef(START_LON);
  const lat = useRef(START_LAT);
  const phi = useRef(0);
  const theta = useRef(0);

  // Touch pinch-to-zoom refs
  const isPinching = useRef<boolean>(false);
  const initialPinchDist = useRef<number | null>(null);
  const initialPinchZoom = useRef<number>(1.0);
  const initialFovOnPinch = useRef<number>(70);

  // Raycasting for interactive 3D fixture clicks
  const raycaster = useRef(new THREE.Raycaster());
  const mouseVec = useRef(new THREE.Vector2());

  // Initialize Three.js 3D Square Room Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Build 3D Square Room directly from reference geometry
    const room3D = build3DSquareRoom(mode, lighting);
    room3DRef.current = room3D;
    if (scenarioState) {
      room3D.updateScenarioState?.(
        scenarioState,
        stagedObjectsRef.current,
        showDetectedOutlinesRef.current,
        customPositionsRef.current,
        isRoomClearedRef.current,
        customRotationsRef.current,
        isDetectionPhaseRef.current,
        identificationStepRef.current
      );
    }
    scene.add(room3D.group);
    scene.add(stagingGroupRef.current);
    scene.add(pendingBoxesGroupRef.current);
    scene.add(assetPreviewRef.current);
    scene.add(faintOutlineGroupRef.current);

    const selectionBox = new THREE.BoxHelper(new THREE.Mesh(), 0xdc5365);
    selectionBox.visible = false;
    scene.add(selectionBox);
    selectionBoxRef.current = selectionBox;

    // Equirectangular Photo Reference Sphere (Uploaded user room panorama)
    const texLoader = new THREE.TextureLoader();
    texLoader.load(
      '/assets/reference_room_panorama.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const sphereGeo = new THREE.SphereGeometry(30, 48, 32);
        sphereGeo.scale(-1, 1, 1);
        const sphereMat = new THREE.MeshBasicMaterial({ map: texture });
        const photoSphere = new THREE.Mesh(sphereGeo, sphereMat);
        photoSphere.rotation.y = -Math.PI / 2;
        photoSphere.visible = false;
        photoSphereRef.current = photoSphere;
        scene.add(photoSphere);
      },
      undefined,
      () => {
        // Fallback to bundled asset if reference file missing
        texLoader.load('/assets/aistudio/image_8_3eb7f66c.png', (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          const sphereGeo = new THREE.SphereGeometry(30, 48, 32);
          sphereGeo.scale(-1, 1, 1);
          const sphereMat = new THREE.MeshBasicMaterial({ map: texture });
          const photoSphere = new THREE.Mesh(sphereGeo, sphereMat);
          photoSphere.rotation.y = -Math.PI / 2;
          photoSphere.visible = false;
          photoSphereRef.current = photoSphere;
          scene.add(photoSphere);
        });
      }
    );

    // Position camera inside room by default
    camera.position.set(0, 1.35, 0);

    // Look target vector
    const lookTarget = new THREE.Vector3();

    // Render loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // Animate ceiling fan blades
      room3D.tickAnimation(delta);
      tickFlashes(flashesRef.current, now);

      // The held ghost follows its target with a critically damped glide (τ = 45ms): ordinary
      // tracking stays effectively 1:1, but a wall snap no longer teleports the ghost 20cm.
      const held = activeStagingCuboidRef.current;
      const target = stagingTargetRef.current;
      if (held && target) {
        const k = 1 - Math.exp(-delta / 0.045);
        held.position.x += (target.x - held.position.x) * k;
        held.position.z += (target.z - held.position.z) * k;
      }

      // Pending boxes breathe while Confirm "generates" their new image layers
      if (isConfirmingMovesRef.current && pendingBoxesGroupRef.current.children.length > 0) {
        const pulse = 0.18 + 0.14 * Math.sin(now / 160);
        pendingBoxesGroupRef.current.traverse((o) => {
          if (o.name === 'box_fill') ((o as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = pulse;
        });
      }

      if (isAutoRotate) {
        lon.current += 0.12;
      }

      // Smooth gyroscope orientation tracking (jitter-free exponential moving average)
      if (isGyroActive && gyroBaseline.current && !isUserInteracting.current) {
        lon.current += (gyroTarget.current.lon - lon.current) * 0.14;
        lat.current += (gyroTarget.current.lat - lat.current) * 0.14;
      }

      // Continuous Edge Panning when dragging an object near canvas boundary
      if (isDraggingObject.current && (edgePanDelta.current.lon !== 0 || edgePanDelta.current.lat !== 0)) {
        lon.current += edgePanDelta.current.lon;
        lat.current = Math.max(-80, Math.min(80, lat.current + edgePanDelta.current.lat));

        // Re-intersect the floor as the camera turns so the box keeps tracking the finger
        if (activeStagingCuboidRef.current && container) {
          const rect = container.getBoundingClientRect();
          mouseVec.current.x = ((lastPointerPos.current.x - rect.left) / rect.width) * 2 - 1;
          mouseVec.current.y = -((lastPointerPos.current.y - rect.top) / rect.height) * 2 + 1;
          raycaster.current.setFromCamera(mouseVec.current, camera);
          const fHit = new THREE.Vector3();
          if (raycaster.current.ray.intersectPlane(floorPlane.current, fHit)) {
            placeStagingBoxRef.current(fHit);
          }
        }
      }

      // A piece dragged in from the drawer: near an edge the view turns and the box keeps following the finger
      assetFrameRef.current?.();

      // A detection corner dragged to the screen edge turns the view, and keeps following the finger
      if (dragRef.current) {
        const pan = detPanRef.current;
        if (pan.lon !== 0 || pan.lat !== 0) {
          lon.current += pan.lon;
          lat.current = Math.max(-80, Math.min(80, lat.current + pan.lat));
        }
        applyDragRef.current();
      }

      {
        // --- 360° VIEW FROM THE ROOM CENTRE (the only view) ---
        if (photoSphereRef.current) photoSphereRef.current.visible = false;
        room3D.group.visible = true;

        // Inside eye position
        camera.position.set(0, 1.35, 0);

        lat.current = Math.max(-80, Math.min(80, lat.current));
        phi.current = THREE.MathUtils.degToRad(90 - lat.current);
        theta.current = THREE.MathUtils.degToRad(lon.current);

        const ceilingObj = room3D.group.getObjectByName('Ceiling');
        if (ceilingObj) ceilingObj.visible = true;

        lookTarget.x = camera.position.x + 50 * Math.sin(phi.current) * Math.cos(theta.current);
        lookTarget.y = camera.position.y + 50 * Math.cos(phi.current);
        lookTarget.z = camera.position.z + 50 * Math.sin(phi.current) * Math.sin(theta.current);
        camera.lookAt(lookTarget);
      }

      {
        renderer.render(scene, camera);

        // Instantaneous hardware-synchronized projection for floating 3D tags (Zero delay / zero rubber-banding)
        if (container) {
          const wHalf = container.clientWidth / 2;
          const hHalf = container.clientHeight / 2;

          const updateOverlayPos = (key: string, worldPos: THREE.Vector3) => {
            const el = overlayElementsRef.current.get(key);
            if (!el) return;
            const v = worldPos.clone().project(camera);
            const isFront = v.z < 1.0 && v.x >= -1.4 && v.x <= 1.4 && v.y >= -1.4 && v.y <= 1.4;
            if (isFront) {
              const sx = v.x * wHalf + wHalf;
              const sy = -v.y * hHalf + hHalf;
              el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
              if (el.style.display !== 'block') el.style.display = 'block';
            } else {
              if (el.style.display !== 'none') el.style.display = 'none';
            }
          };

          // 1. Staged objects tags (visible when wireframe OR when selected as solid model)
          if (stagedObjectsRef.current.length > 0) {
            stagedObjectsRef.current.forEach((s) => {
              const isSelected = effectiveSelectedIdsRef.current.includes(s.id) ||
                effectiveSelectedIdsRef.current.includes(s.type) ||
                effectiveSelectedIdsRef.current.includes(`obj_${s.type}`) ||
                effectiveSelectedIdsRef.current.includes(`staged_${s.id}`);
              if (!s.isWireframe && !isSelected) return;
              const [x, y, z] = customPositionsRef.current?.[s.id] || s.position;
              const h = s.dimensions ? s.dimensions[1] : 0.75;
              updateOverlayPos(`staged_${s.id}`, new THREE.Vector3(x, y + h / 2 + 0.22, z));
            });
          }

          // 1a. Moved pieces waiting for Confirm
          Object.entries(pendingMovesRef.current).forEach(([id, m]) => {
            const dims = getObjectDimensions(id);
            updateOverlayPos(`pending_${id}`, new THREE.Vector3(m.position[0], dims[1] + 0.12, m.position[2]));
          });

          // 1b. Option 1 vs Option 2 Table Reasoning Tag (Step 3: '3_two_options')
          if (scenarioState?.currentStep === '3_two_options') {
            const isOpt2 = scenarioState.activeOption === 2;
            const tx = isOpt2 ? -1.25 : -1.15;
            const tz = isOpt2 ? -0.65 : -1.85;
            updateOverlayPos('table_option_reasoning', new THREE.Vector3(tx, 0.95, tz));
          }

          // 1c. Ghost State Elements Tags (Step 5: '5_ghost_state')
          if (scenarioState?.currentStep === '5_ghost_state' || (scenarioState?.ghostStateActive && !scenarioState?.ghostStateCommitted)) {
            updateOverlayPos('ghost_dressing_table', new THREE.Vector3(0.0, 1.35, -2.15));
            const sideTablePos = scenarioState?.sideTableHidingPlug ? new THREE.Vector3(-1.45, 0.65, 0.0) : new THREE.Vector3(-1.45, 0.65, -1.20);
            updateOverlayPos('ghost_side_table', sideTablePos);
            updateOverlayPos('ghost_chair', new THREE.Vector3(-0.65, 0.75, -1.85));
            updateOverlayPos('ghost_laundry', new THREE.Vector3(-1.40, 0.65, 1.80));
          }

          // 2/3. Detection outlines (step 1 fixtures, step 2 furniture): each corner is a direction
          // from the eye, so projecting the corners pins the outline to the object in any view.
          const fwd = camera.getWorldDirection(new THREE.Vector3());
          const dirV = new THREE.Vector3();
          const pt = new THREE.Vector3();
          const placeDetection = (id: string) => {
            const wrap = detElsRef.current.get(`wrap_${id}`) as HTMLElement | undefined;
            if (!wrap) return;
            const shape = liveShapesRef.current.get(id) ?? editsRef.current?.[id]?.points ?? getBaseShape(id);
            if (!shape) return;
            const sp: [number, number][] = [];
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            for (const q of shape) {
              dirV.set(q[0], q[1], q[2]);
              if (dirV.dot(fwd) < 0.08) { sp.length = 0; break; }
              pt.copy(camera.position).addScaledVector(dirV, 10).project(camera);
              const px = pt.x * wHalf + wHalf;
              const py = -pt.y * hHalf + hHalf;
              sp.push([px, py]);
              minX = Math.min(minX, px); maxX = Math.max(maxX, px);
              minY = Math.min(minY, py); maxY = Math.max(maxY, py);
            }
            const offscreen = sp.length < shape.length || maxX < -80 || minX > wHalf * 2 + 80 || maxY < -80 || minY > hHalf * 2 + 80;
            if (offscreen) {
              if (wrap.style.display !== 'none') wrap.style.display = 'none';
              return;
            }
            const pointsAttr = sp.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
            detElsRef.current.get(`poly_${id}`)?.setAttribute('points', pointsAttr);
            detElsRef.current.get(`halo_${id}`)?.setAttribute('points', pointsAttr);
            sp.forEach((q, i) => {
              const h = detElsRef.current.get(`h${i}_${id}`) as HTMLElement | undefined;
              if (h) h.style.transform = `translate3d(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px, 0)`;
            });

            // Tag above the outline (below it near the top of the screen), over the part that is visible
            const flip = minY < 76;
            const visMid = (Math.max(minX, 12) + Math.min(maxX, wHalf * 2 - 12)) / 2;
            const ax = Math.min(Math.max(visMid, 76), wHalf * 2 - 76);
            const tag = detElsRef.current.get(`tag_${id}`) as HTMLElement | undefined;
            if (tag) {
              tag.style.transform = `translate3d(${ax.toFixed(1)}px, ${(flip ? maxY : minY).toFixed(1)}px, 0)`;
              tag.dataset.flip = flip ? '1' : '0';
            }

            // Smaller outlines sit on top, so a hamper in front of a pile of boxes stays tappable
            let area = 0;
            for (let i = 0; i < sp.length; i++) {
              const [x1, y1] = sp[i];
              const [x2, y2] = sp[(i + 1) % sp.length];
              area += x1 * y2 - x2 * y1;
            }
            area = Math.abs(area) / 2;
            wrap.style.zIndex = wrap.dataset.top === '1' ? '55' : String(30 + Math.round(20 * (1 - Math.min(1, area / (wHalf * hHalf * 2 * 0.5)))));
            if (wrap.style.display !== 'block') wrap.style.display = 'block';
          };

          if (!isRoomClearedRef.current && (identificationStepRef.current === 'constraints' || identificationStepRef.current === 'assets')) {
            const list = identificationStepRef.current === 'constraints' ? IDENTIFIED_CONSTRAINTS : IDENTIFIED_MOVABLE_ASSETS;
            list.forEach((it) => placeDetection(it.id));
            userDetectionsRef.current?.forEach((u) => {
              if (u.step === identificationStepRef.current) placeDetection(u.id);
            });
          }

          // 4. Edit mode selected object
          if (identificationStepRef.current === 'completed' && effectiveSelectedIdsRef.current.length > 0 && !isRoomClearedRef.current) {
            effectiveSelectedIdsRef.current.forEach((selId) => {
              const targetObj = room3D.group.getObjectByName(selId) ||
                room3D.interactiveMeshes.find((m) => m.userData?.id === selId);
              if (targetObj) {
                const v = new THREE.Vector3();
                topAnchor(targetObj, selId, v);
                updateOverlayPos(`selected_${selId}`, v);
              }
            });

            if (effectiveSelectedIdsRef.current.length === 2) {
              const newSelCoords: Record<string, { x: number; y: number; visible: boolean }> = {};
              effectiveSelectedIdsRef.current.forEach((id) => {
                const targetObj = room3D.group.getObjectByName(id) ||
                  room3D.interactiveMeshes.find((m) => m.userData?.id === id);
                if (targetObj) {
                  const v = new THREE.Vector3();
                  topAnchor(targetObj, id, v);
                  v.project(camera);
                  const isFront = v.z < 1 && v.x >= -1.2 && v.x <= 1.2 && v.y >= -1.2 && v.y <= 1.2;
                  newSelCoords[id] = {
                    x: Math.round(v.x * wHalf + wHalf),
                    y: Math.round(-(v.y * hHalf) + hHalf),
                    visible: isFront
                  };
                }
              });
              setSelectedScreenCoords(newSelCoords);
            }
          }
        }
      }
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      room3D.dispose();
      renderer.dispose();
    };
  }, []);

  // Update room lighting when prop changes
  useEffect(() => {
    if (room3DRef.current) {
      room3DRef.current.updateLighting(lighting);
    }
  }, [lighting]);

  // Update dynamic scenario state & staged objects in 3D room
  useEffect(() => {
    if (room3DRef.current?.updateScenarioState && scenarioState) {
      room3DRef.current.updateScenarioState(
        scenarioState,
        stagedObjects,
        showDetectedOutlines,
        customPositions,
        isRoomCleared,
        customRotations,
        isDetectionPhase,
        identificationStep
      );
    }
  }, [scenarioState, stagedObjects, showDetectedOutlines, customPositions, isRoomCleared, customRotations, isDetectionPhase, identificationStep]);

  // Moved pieces: draw their staged boxes and keep the real furniture hidden until Confirm
  useEffect(() => {
    const room = room3DRef.current;
    if (!room) return;
    const group = pendingBoxesGroupRef.current;
    group.clear();

    Object.entries(pendingMoves).forEach(([id, m]) => {
      const meas = measuredCache.get(id);
      const dims = meas?.dims ?? getObjectDimensions(id);
      const off: [number, number, number] = meas?.offset ?? [0, dims[1] / 2, 0];
      const ro = rotateOffset(off, m.rotationY);
      // Ghost in the piece's own shape when the model is available, else the primitive stand-in
      const realObj = room.group.getObjectByName(id);
      const tree = realObj && meas
        ? buildStagingProxyFromObject(id, realObj, meas, proxyKindFor(id))
        : buildDirectionalStagingGroup(dims[0], dims[1], dims[2], m.position, proxyKindFor(id));
      const cuboid = tree.getObjectByName('active_directional_cuboid');
      if (cuboid) {
        cuboid.position.set(m.position[0] + ro.x, off[1], m.position[2] + ro.z);
        cuboid.rotation.y = m.rotationY;
        cuboid.traverse((o) => { o.userData.pendingId = id; });
        setBoxLook(cuboid, isConfirmingMoves ? BOX_SNAPPED : BOX_FREE, isConfirmingMoves ? 0.22 : 0.1);
      }
      group.add(tree);
    });

    const ids = new Set(Object.keys(pendingMoves));
    hiddenPendingIds.current.forEach((id) => {
      if (!ids.has(id)) {
        const obj = room.group.getObjectByName(id);
        if (obj) obj.visible = true;
      }
    });
    ids.forEach((id) => {
      const obj = room.group.getObjectByName(id);
      if (obj) obj.visible = false;
    });
    hiddenPendingIds.current = ids;

    // The box that was just dropped is now drawn as a pending box
    if (!isDraggingObject.current) {
      stagingGroupRef.current.clear();
      activeStagingCuboidRef.current = null;
      stagingTargetRef.current = null;
    }
  }, [pendingMoves, isConfirmingMoves, scenarioState, stagedObjects, customPositions, isRoomCleared, customRotations, isDetectionPhase, identificationStep]);

  // Synchronize faint white outline for single and multi-selected objects
  // (Preserves realistic procedural wood/fabric/metal textures, NO color fill, NO emissive tint)
  useEffect(() => {
    if (!room3DRef.current) return;
    const group = room3DRef.current.group;
    faintOutlineGroupRef.current.clear();

    if (effectiveSelectedIds.length === 0 || isDraggingState) {
      return;
    }

    effectiveSelectedIds.forEach((selId) => {
      // Don't show faint outline if this object is actively being dragged (it has the staging cuboid)
      if (draggedObjectId.current === selId) return;

      const targetObj = group.getObjectByName(selId) ||
        room3DRef.current?.interactiveMeshes.find((m) => m.userData?.id === selId);

      if (targetObj) {
        const rot = customRotationsRef.current?.[selId] ?? targetObj.rotation.y ?? 0;
        const meas = measureObject(targetObj, selId, targetObj.userData?.name || targetObj.name);
        const outline = buildFaintOutline(meas.dims[0], meas.dims[1], meas.dims[2]);
        const objPos = new THREE.Vector3();
        targetObj.getWorldPosition(objPos);
        const ro = rotateOffset(meas.offset, rot);
        outline.position.set(objPos.x + ro.x, meas.offset[1], objPos.z + ro.z);
        outline.rotation.y = rot;
        faintOutlineGroupRef.current.add(outline);
      }
    });
  }, [effectiveSelectedIds, isDraggingState]);

  // Device orientation (Smooth, Calibrated Relative Gyroscope with 0/360 wrap-around)
  useEffect(() => {
    if (!isGyroActive) {
      gyroBaseline.current = null;
      return;
    }

    gyroBaseline.current = null;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha === null || e.beta === null) return;

      if (!gyroBaseline.current) {
        // Calibrate baseline orientation on first event to eliminate sudden snap/glitch
        gyroBaseline.current = {
          alpha: e.alpha,
          beta: e.beta,
          baseLon: lon.current,
          baseLat: lat.current
        };
        gyroTarget.current = { lon: lon.current, lat: lat.current };
        return;
      }

      // Delta alpha with 0 / 360 wrap-around
      let deltaAlpha = e.alpha - gyroBaseline.current.alpha;
      while (deltaAlpha > 180) deltaAlpha -= 360;
      while (deltaAlpha < -180) deltaAlpha -= 360;

      // Delta beta
      let deltaBeta = e.beta - gyroBaseline.current.beta;
      while (deltaBeta > 180) deltaBeta -= 360;
      while (deltaBeta < -180) deltaBeta -= 360;

      gyroTarget.current.lon = gyroBaseline.current.baseLon - deltaAlpha;
      gyroTarget.current.lat = Math.max(-80, Math.min(80, gyroBaseline.current.baseLat + deltaBeta * 1.05));
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      gyroBaseline.current = null;
    };
  }, [isGyroActive]);

  const handleToggleGyro = async () => {
    if (isGyroActive) {
      setIsGyroActive(false);
      return;
    }
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') setIsGyroActive(true);
      } catch (err) {
        console.warn('Gyro permission error:', err);
      }
    } else if ('DeviceOrientationEvent' in window) {
      setIsGyroActive(true);
    }
  };

  // Set and update Zoom level
  const handleSetZoom = (newZoom: number) => {
    const clamped = Math.max(0.65, Math.min(2.8, newZoom));
    setCurrentZoom(clamped);
    if (cameraRef.current) {
      cameraRef.current.zoom = clamped;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  // Keep a box inside the room box, flush against a wall when it gets close. The face that meets a wall flashes.
  placeStagingBoxRef.current = (hit: THREE.Vector3) => {
    const cuboid = activeStagingCuboidRef.current;
    if (!cuboid) return;
    const rot = currentStagedRotation.current;
    const ro = rotateOffset(stagedCenterOffset.current, rot);
    const p = computePlacement(hit.x + dragOffset.current.x + ro.x, hit.z + dragOffset.current.z + ro.z, stagedObjectDimensions.current, rot, draggedObjectId.current || '');

    if (p.snapped !== isSnappedRef.current) {
      isSnappedRef.current = p.snapped;
      setBoxLook(cuboid, p.snapped ? BOX_SNAPPED : BOX_FREE);
      if (p.snapped && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10);
    }
    const wallsKey = `${p.walls.x},${p.walls.z}`;
    if (wallsKey !== snappedWallsRef.current) {
      snappedWallsRef.current = wallsKey;
      if (p.walls.x !== 0 || p.walls.z !== 0) flashFaces(cuboid, snappedFaceNames(rot, p.walls), performance.now(), flashesRef.current);
    }

    // The render loop glides the ghost here; the logical position (what Confirm uses) is exact now
    stagingTargetRef.current = { x: p.x, z: p.z };
    stagedCurrentPos.current = [p.x - ro.x, stagedObjectDimensions.current[1] / 2, p.z - ro.z];
  };

  // Where a screen point lands on the floor, snapped like a dragged box. Used to drop pieces from the Assets drawer.
  const floorPointAt: ViewerApi['floorPointAt'] = (clientX, clientY, dims, id = '') => {
    const cam = cameraRef.current;
    const mount = mountRef.current;
    if (!cam || !mount) return null;
    const rect = mount.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const rc = new THREE.Raycaster();
    rc.setFromCamera(ndc, cam);
    const hit = new THREE.Vector3();
    if (!rc.ray.intersectPlane(floorPlane.current, hit)) return null;
    return computePlacement(hit.x, hit.z, dims, 0, id);
  };
  // Where a piece stands, read from the drawn model, so the AI can plan a move from the real position
  const getPiece: ViewerApi['getPiece'] = (id) => {
    const room = room3DRef.current;
    if (!room) return null;
    const obj = room.group.getObjectByName(id) || room.interactiveMeshes.find((m) => m.userData?.id === id);
    if (!obj) return null;
    const measured = measureObject(obj, id, obj.userData?.name || obj.name);
    const pending = pendingMovesRef.current[id];
    return {
      origin: pending ? [...pending.position] : [obj.position.x, obj.position.y, obj.position.z],
      rotationY: pending ? pending.rotationY : (customRotationsRef.current?.[id] ?? obj.rotation.y ?? 0),
      dims: measured.dims,
      offset: measured.offset,
    };
  };
  if (apiRef) apiRef.current = { floorPointAt, getPiece };

  // Hold: the furniture lifts out of the photo and only its bounding box remains
  const beginObjectDrag = (targetObj: THREE.Object3D, targetId: string, targetName: string) => {
    if (isDraggingObject.current) return;
    isDraggingObject.current = true;
    draggedObjectId.current = targetId;
    draggedObjectRef.current = targetObj;
    setIsDraggingState(true);
    setDraggedObjectName(getCleanObjectName(targetId, targetName));
    setSelectedObjectIds([]);

    const measured = measureObject(targetObj, targetId, targetName);
    const dims = measured.dims;
    stagedObjectDimensions.current = dims;
    stagedCenterOffset.current = measured.offset;
    const pending = pendingMovesRef.current[targetId];
    const origPos: [number, number, number] = pending
      ? [...pending.position]
      : [targetObj.position.x, targetObj.position.y, targetObj.position.z];
    stagedOriginPos.current = origPos;
    stagedCurrentPos.current = [...origPos];
    currentStagedRotation.current = pending ? pending.rotationY : (customRotationsRef.current?.[targetId] ?? targetObj.rotation.y ?? 0);

    targetObj.visible = false;

    // Lift the pending box (if any) into the active one
    pendingBoxesGroupRef.current.children
      .filter((c) => c.getObjectByName('active_directional_cuboid')?.userData.pendingId === targetId)
      .forEach((c) => pendingBoxesGroupRef.current.remove(c));

    stagingGroupRef.current.clear();
    // The ghost is the piece's own shape and size (its meshes in the staging material)
    const stagingTree = buildStagingProxyFromObject(targetId, targetObj, measured, proxyKindFor(targetId, targetName));
    const cuboid = stagingTree.getObjectByName('active_directional_cuboid') as THREE.Group;
    if (cuboid) {
      const ro = rotateOffset(measured.offset, currentStagedRotation.current);
      cuboid.position.set(origPos[0] + ro.x, measured.offset[1], origPos[2] + ro.z);
      cuboid.rotation.y = currentStagedRotation.current;
      activeStagingCuboidRef.current = cuboid;
      stagingTargetRef.current = null; // first move places it directly from here
    }
    isSnappedRef.current = false;
    snappedWallsRef.current = '0,0';
    stagingGroupRef.current.add(stagingTree);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(20);
  };

  // A catalogue piece dragged in from the Assets drawer follows the finger as a staging box
  useEffect(() => {
    const group = assetPreviewRef.current;
    group.clear();
    if (!draggingAsset) return;
    const [w, h, d] = draggingAsset.dims;
    const tree = buildStagingProxy(proxyKindFor(draggingAsset.id, draggingAsset.name), w, h, d);
    const cuboid = tree.getObjectByName('active_directional_cuboid') as THREE.Group;
    cuboid.position.set(0, h / 2, 0);
    cuboid.visible = false;
    group.add(tree);
    let wallsKey = '0,0';
    let snapped = false;
    let last: { x: number; y: number } | null = null;
    const pan = { lon: 0, lat: 0 };

    const place = () => {
      if (!last) return;
      const p = floorPointAt(last.x, last.y, draggingAsset.dims, draggingAsset.id);
      if (!p) return; // pointing above the floor (past the horizon): the box stays where it was
      cuboid.visible = true;
      cuboid.position.x = p.x;
      cuboid.position.z = p.z;
      if (p.snapped !== snapped) {
        snapped = p.snapped;
        setBoxLook(cuboid, snapped ? BOX_SNAPPED : BOX_FREE);
      }
      const key = `${p.walls.x},${p.walls.z}`;
      if (key !== wallsKey) {
        wallsKey = key;
        if (p.walls.x !== 0 || p.walls.z !== 0) flashFaces(cuboid, snappedFaceNames(0, p.walls), performance.now(), flashesRef.current);
      }
    };

    const onMove = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY };
      // Near an edge the view turns, so the piece can be carried past what is on screen
      const rect = mountRef.current?.getBoundingClientRect();
      if (rect) {
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const margin = 75;
        pan.lon = px < margin ? -((margin - px) / margin) * 2.4 : px > rect.width - margin ? ((px - (rect.width - margin)) / margin) * 2.4 : 0;
        pan.lat = py < margin ? ((margin - py) / margin) * 1.6 : py > rect.height - margin ? -((py - (rect.height - margin)) / margin) * 1.6 : 0;
      }
      place();
    };

    // Every frame while an edge is held: turn the view, then re-aim the box at the finger
    assetFrameRef.current = () => {
      if (pan.lon === 0 && pan.lat === 0) return;
      lon.current += pan.lon;
      lat.current = Math.max(-80, Math.min(80, lat.current + pan.lat));
      place();
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      assetFrameRef.current = null;
      group.clear();
    };
  }, [draggingAsset]);

  // Unified Pointer & Touch Interaction
  const initiatePointerInteraction = (clientX: number, clientY: number) => {
    isUserInteracting.current = true;
    onPointerDownPointerX.current = clientX;
    onPointerDownPointerY.current = clientY;
    onPointerDownLon.current = lon.current;
    onPointerDownLat.current = lat.current;
    lastPointerPos.current = { x: clientX, y: clientY };
    pointerDownPos.current = { x: clientX, y: clientY };
    pointerDownTime.current = Date.now();
    hasMovedSignificantly.current = false;
    isHoldingObject.current = false;

    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }

    if (!cameraRef.current || !room3DRef.current || !mountRef.current) {
      return;
    }

    const rect = mountRef.current.getBoundingClientRect();
    mouseVec.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);

    // Raycasting ignores visibility, so drop anything hidden (furniture waiting behind its staged box)
    const isVisibleDeep = (o: THREE.Object3D | null) => {
      for (let cur = o; cur; cur = cur.parent) if (!cur.visible) return false;
      return true;
    };
    const intersects = raycaster.current
      .intersectObjects(room3DRef.current.group.children, true)
      .filter((h) => isVisibleDeep(h.object));

    // A staged box can be picked up again, but only when it is what the finger is actually on.
    // One standing in front of other furniture must not stop that furniture being picked too.
    if (identificationStepRef.current === 'completed') {
      const boxHit = raycaster.current.intersectObjects(pendingBoxesGroupRef.current.children, true)
        .find((h) => h.object.userData?.pendingId);
      const pendingId = boxHit?.object.userData.pendingId as string | undefined;
      const realObj = pendingId ? room3DRef.current.group.getObjectByName(pendingId) : null;
      const boxIsNearest = !!boxHit && (intersects.length === 0 || boxHit.distance <= intersects[0].distance);
      if (pendingId && realObj && boxIsNearest) {
        const move = pendingMovesRef.current[pendingId];
        const name = realObj.userData?.name || pendingId;
        pointerTargetObj.current = { id: pendingId, name, object: realObj, isFixed: false };
        const floorHit = new THREE.Vector3();
        if (move && raycaster.current.ray.intersectPlane(floorPlane.current, floorHit)) {
          dragOffset.current.set(move.position[0] - floorHit.x, 0, move.position[2] - floorHit.z);
        }
        holdTimeout.current = setTimeout(() => {
          if (hasMovedSignificantly.current) return;
          isHoldingObject.current = true;
          beginObjectDrag(realObj, pendingId, name);
        }, HOLD_MS);
        return;
      }
    }

    if (intersects.length > 0) {
      let targetObj: THREE.Object3D | null = null;
      let targetId: string | null = null;
      let targetName = '';
      let isFixed = false;

      for (const hit of intersects) {
        let cur: THREE.Object3D | null = hit.object;

        if (!cur || cur.name === 'detected_glow' || cur.userData?.isDetectorGlow) continue;
        if (cur.userData?.id === 'obj_ceramic_tiles' || cur.userData?.id === 'Ceiling') continue;

        let walk: THREE.Object3D | null = cur;
        let matched: THREE.Object3D | null = null;

        while (walk && walk !== room3DRef.current.group) {
          if (walk.userData?.id && walk.userData.id !== 'obj_ceramic_tiles' && walk.userData.id !== 'Ceiling') {
            matched = walk;
          }
          if (walk.parent === (room3DRef.current as any).scenarioGroup || walk.parent === (room3DRef.current as any).wallsGroup) {
            matched = walk;
            break;
          }
          walk = walk.parent;
        }

        if (matched && matched.userData?.id && pendingMovesRef.current[matched.userData.id]) continue;
        if (matched && matched.userData?.id) {
          targetObj = matched;
          targetId = matched.userData.id;
          targetName = matched.userData.name || matched.name || 'Object';
          isFixed = Boolean(matched.userData.isFixed) || (targetId ? FIXED_OBJECT_IDS.has(targetId) : false);
          break;
        }
      }

      if (targetId && targetObj) {
        pointerTargetObj.current = {
          id: targetId,
          name: targetName,
          object: targetObj,
          isFixed
        };

        if (!isFixed && identificationStepRef.current === 'completed') {
          // Setup drag offset in advance in case user holds and drags
          const floorHit = new THREE.Vector3();
          if (raycaster.current.ray.intersectPlane(floorPlane.current, floorHit)) {
            dragOffset.current.set(
              targetObj.position.x - floorHit.x,
              0,
              targetObj.position.z - floorHit.z
            );
          }

          // Hold still on a piece of furniture: it lifts out and becomes a draggable box
          holdTimeout.current = setTimeout(() => {
            if (hasMovedSignificantly.current) return;
            isHoldingObject.current = true;
            beginObjectDrag(targetObj!, targetId!, targetName);
          }, HOLD_MS);
        }
      } else {
        pointerTargetObj.current = null;
      }
    } else {
      pointerTargetObj.current = null;
    }
  };

  const movePointerInteraction = (clientX: number, clientY: number) => {
    const dist = Math.hypot(
      clientX - pointerDownPos.current.x,
      clientY - pointerDownPos.current.y
    );

    if (dist > 8) {
      hasMovedSignificantly.current = true;
      if (holdTimeout.current) {
        clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
      }
    }

    // 1. If user is holding down on a movable object and moving: Reposition Dragging Phase
    if (isHoldingObject.current && pointerTargetObj.current && !pointerTargetObj.current.isFixed && mountRef.current && cameraRef.current) {
      if (!isDraggingObject.current) {
        beginObjectDrag(pointerTargetObj.current.object, pointerTargetObj.current.id, pointerTargetObj.current.name);
      }

      const rect = mountRef.current.getBoundingClientRect();
      mouseVec.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);

      const intersection = new THREE.Vector3();
      if (raycaster.current.ray.intersectPlane(floorPlane.current, intersection)) {
        placeStagingBoxRef.current(intersection);
      }

      // Edge Panning: Shift room canvas when pointer approaches viewport edge
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const edgeMargin = 75;

      let panLon = 0;
      let panLat = 0;

      if (px < edgeMargin) {
        panLon = -((edgeMargin - px) / edgeMargin) * 2.4;
      } else if (px > rect.width - edgeMargin) {
        panLon = ((px - (rect.width - edgeMargin)) / edgeMargin) * 2.4;
      }

      if (py < edgeMargin) {
        panLat = ((edgeMargin - py) / edgeMargin) * 1.6;
      } else if (py > rect.height - edgeMargin) {
        panLat = -((py - (rect.height - edgeMargin)) / edgeMargin) * 1.6;
      }

      edgePanDelta.current = { lon: panLon, lat: panLat };
      lastPointerPos.current = { x: clientX, y: clientY };
      return;
    }

    // 2. Otherwise: Pan/Rotate Room View on Touch / Drag
    if (!isUserInteracting.current) return;

    const dx = clientX - lastPointerPos.current.x;
    const dy = clientY - lastPointerPos.current.y;
    lastPointerPos.current = { x: clientX, y: clientY };

    {
      lon.current -= dx * 0.18;
      lat.current = Math.max(-80, Math.min(80, lat.current + dy * 0.18));

      // Shift gyro baseline seamlessly so touch-pan does not snap back
      if (isGyroActive && gyroBaseline.current) {
        gyroBaseline.current.baseLon -= dx * 0.18;
        gyroBaseline.current.baseLat = Math.max(-80, Math.min(80, gyroBaseline.current.baseLat + dy * 0.18));
        gyroTarget.current.lon -= dx * 0.18;
        gyroTarget.current.lat = Math.max(-80, Math.min(80, gyroTarget.current.lat + dy * 0.18));
      }
    }
  };

  const endPointerInteraction = () => {
    isUserInteracting.current = false;
    edgePanDelta.current = { lon: 0, lat: 0 };

    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }

    // 1. Drop: the box stays where it is as a staged move. The furniture comes back only on Confirm.
    if (isDraggingObject.current && stagedCurrentPos.current) {
      const id = draggedObjectId.current;
      const cub = activeStagingCuboidRef.current;
      const rotOff = rotateOffset(stagedCenterOffset.current, currentStagedRotation.current);
      const finalPos: [number, number, number] = cub
        ? [cub.position.x - rotOff.x, stagedCurrentPos.current[1], cub.position.z - rotOff.z]
        : [...stagedCurrentPos.current];
      const finalRot = currentStagedRotation.current;
      const wasPending = id ? Boolean(pendingMovesRef.current[id]) : false;
      const barelyMoved = Math.hypot(finalPos[0] - stagedOriginPos.current[0], finalPos[2] - stagedOriginPos.current[2]) < 0.03;

      isDraggingObject.current = false;
      if (id && (wasPending || !barelyMoved) && onStageMoveRef.current) {
        onStageMoveRef.current(id, { position: finalPos, rotationY: finalRot });
      } else {
        // Picked up and put straight back: nothing to stage
        if (draggedObjectRef.current) draggedObjectRef.current.visible = true;
        stagingGroupRef.current.clear();
        activeStagingCuboidRef.current = null;
        stagingTargetRef.current = null;
      }

      draggedObjectRef.current = null;
      draggedObjectId.current = null;
      setStagedInfo(null);
      setIsDraggingState(false);
      isHoldingObject.current = false;
      return;
    }

    // 2. Quick Tap Detection (< 350ms and dist < 8px)
    const duration = Date.now() - pointerDownTime.current;
    const dist = Math.hypot(
      lastPointerPos.current.x - pointerDownPos.current.x,
      lastPointerPos.current.y - pointerDownPos.current.y
    );

    if (dist < 8 && duration < 350 && !isHoldingObject.current) {
      if (identificationStepRef.current === 'assets' || identificationStepRef.current === 'constraints') {
        // Detections are chosen from their own tags and frames. Tapping the room behind them
        // must not pick (or light up) whatever 3D object happens to be there.
        setActiveAssetId(null);
      } else if (pointerTargetObj.current && pendingMovesRef.current[pointerTargetObj.current.id]) {
        // A staged box: hold it to move it again
      } else if (pointerTargetObj.current) {
        if (pointerTargetObj.current.isFixed) {
          onFixedObjectSelectedRef.current?.(pointerTargetObj.current.name);
          const found = objects.find((o) => o.id === pointerTargetObj.current!.id);
          if (found) onSelectObject(found);
        } else {
          // Tap on movable object: Single selection tap with contextual pop-up (NO wireframes)
          const targetId = pointerTargetObj.current.id;
          const targetName = pointerTargetObj.current.name;
          const next = [targetId];
          setSelectedObjectIds(next);
          const found = objects.find((o) => o.id === targetId) || {
            id: targetId,
            name: targetName,
            category: 'furniture',
            surface: 'floor',
            yaw: 0,
            pitch: 0,
            dimensions: `1.2 × 0.8 × 0.75 m`,
            reversibility: 'high'
          };
          onSelectObject(found as RoomObject);
        }
      } else {
        // Tapped away into void / environment / floor: discard selection, dismiss pop-up & remove highlights
        setSelectedObjectIds([]);
        onSelectObject(null);
        setActiveAssetId(null);
      }
    }

    isHoldingObject.current = false;
    isDraggingObject.current = false;
    setIsDraggingState(false);
  };

  const handleConfirmPlacement = () => {
    if (!stagedInfo) return;
    const finalPos: [number, number, number] = [
      stagedCurrentPos.current[0],
      stagedCurrentPos.current[1],
      stagedCurrentPos.current[2]
    ];
    const finalRot = currentStagedRotation.current;

    if (draggedObjectRef.current) {
      draggedObjectRef.current.position.set(finalPos[0], finalPos[1], finalPos[2]);
      draggedObjectRef.current.rotation.y = finalRot;
      draggedObjectRef.current.visible = true;
    }

    onUpdateObjectPositionRef.current?.(stagedInfo.id, finalPos);
    onUpdateObjectRotationRef.current?.(stagedInfo.id, finalRot);

    stagingGroupRef.current.clear();
    activeStagingCuboidRef.current = null;
    stagingTargetRef.current = null;
    draggedObjectRef.current = null;
    draggedObjectId.current = null;
    setStagedInfo(null);
  };

  const handleRotate90 = () => {
    if (!stagedInfo || !activeStagingCuboidRef.current) return;
    const nextRot = currentStagedRotation.current + Math.PI / 2;
    currentStagedRotation.current = nextRot;
    activeStagingCuboidRef.current.rotation.y = nextRot;
    if (draggedObjectRef.current) {
      draggedObjectRef.current.rotation.y = nextRot;
    }
    setStagedInfo((prev) => (prev ? { ...prev, rotationY: nextRot } : null));
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12);
    }
  };

  const handleResetPlacement = () => {
    if (!stagedInfo) return;
    if (draggedObjectRef.current) {
      draggedObjectRef.current.position.set(
        stagedInfo.originPos[0],
        stagedInfo.originPos[1],
        stagedInfo.originPos[2]
      );
      draggedObjectRef.current.rotation.y = customRotationsRef.current?.[stagedInfo.id] ?? 0;
      draggedObjectRef.current.visible = true;
    }

    stagingGroupRef.current.clear();
    activeStagingCuboidRef.current = null;
    stagingTargetRef.current = null;
    draggedObjectRef.current = null;
    draggedObjectId.current = null;
    setStagedInfo(null);
  };

  // Mouse / Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    initiatePointerInteraction(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    movePointerInteraction(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    endPointerInteraction();
  };

  // Touch handlers for mobile/tablets with 2-finger rotate on staged object & pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      if (activeStagingCuboidRef.current) {
        // Two-Finger Gesture on active Staged Object: Rotate cuboid!
        isTwoFingerRotating.current = true;
        isPinching.current = false;
        initialTwoFingerAngle.current = Math.atan2(
          e.touches[1].clientY - e.touches[0].clientY,
          e.touches[1].clientX - e.touches[0].clientX
        );
        initialStagedRotation.current = activeStagingCuboidRef.current.rotation.y;
        return;
      }

      // No object staged: regular 2-finger pinch to zoom
      isUserInteracting.current = false;
      isPinching.current = true;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDist.current = dist;
      initialPinchZoom.current = currentZoom;
      return;
    }

    if (e.touches.length === 1) {
      isPinching.current = false;
      isTwoFingerRotating.current = false;
      const touch = e.touches[0];
      initiatePointerInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.cancelable) e.preventDefault();

    // Two-Finger Rotation while an object is being staged
    if (e.touches.length === 2 && isTwoFingerRotating.current && activeStagingCuboidRef.current) {
      const curAngle = Math.atan2(
        e.touches[1].clientY - e.touches[0].clientY,
        e.touches[1].clientX - e.touches[0].clientX
      );
      const delta = curAngle - initialTwoFingerAngle.current;
      let targetRot = initialStagedRotation.current - delta;

      // Smart magnetic snapping to 45 degree increments
      const snapStep = Math.PI / 4;
      const nearestSnap = Math.round(targetRot / snapStep) * snapStep;
      if (Math.abs(targetRot - nearestSnap) < 0.12) {
        if (Math.abs(currentStagedRotation.current - nearestSnap) > 0.04) {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(12);
          }
        }
        targetRot = nearestSnap;
      }

      currentStagedRotation.current = targetRot;
      activeStagingCuboidRef.current.rotation.y = targetRot;
      if (draggedObjectRef.current) {
        draggedObjectRef.current.rotation.y = targetRot;
      }

      setStagedInfo((prev) => (prev ? { ...prev, rotationY: targetRot } : null));
      return;
    }

    if (e.touches.length === 2 && isPinching.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (initialPinchDist.current && initialPinchDist.current > 0) {
        const factor = dist / initialPinchDist.current;
        handleSetZoom(Math.max(0.65, Math.min(2.8, initialPinchZoom.current * factor)));
      }
      return;
    }

    if (e.touches.length === 1 && !isPinching.current && !isTwoFingerRotating.current) {
      const touch = e.touches[0];
      movePointerInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      isPinching.current = false;
      isTwoFingerRotating.current = false;
      endPointerInteraction();
    } else if (e.touches.length === 1) {
      isPinching.current = false;
      isTwoFingerRotating.current = false;
      const touch = e.touches[0];
      lastPointerPos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleSetZoom(Math.max(0.65, Math.min(2.8, currentZoom + (e.deltaY > 0 ? -0.15 : 0.15))));
  };

  // Detection corners: dragging turns the shape (or one corner) about the eye, so it stays on the image
  const applyDrag = () => {
    const d = dragRef.current;
    const cam = cameraRef.current;
    const mount = mountRef.current;
    if (!d || !cam || !mount) return;
    const to = directionFromScreen(cam, mount.getBoundingClientRect(), d.x, d.y);
    const next = dragShape(d.start, d.kind, d.p0, to);
    // A corner drag that would cross edges or collapse the shape is ignored; the last good shape stays
    if (d.kind === 'move' || isValidShape(next)) {
      d.last = next;
      liveShapesRef.current.set(d.id, next);
    }
  };
  applyDragRef.current = applyDrag;

  const startDetectionDrag = (id: string, kind: 'move' | number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (dragRef.current) return; // one finger at a time
    const cam = cameraRef.current;
    const mount = mountRef.current;
    const start = liveShapesRef.current.get(id) ?? editsRef.current?.[id]?.points ?? getBaseShape(id);
    if (!cam || !mount || !start) return;
    const p0 = directionFromScreen(cam, mount.getBoundingClientRect(), e.clientX, e.clientY);
    dragRef.current = { id, kind, start, last: start, p0, x: e.clientX, y: e.clientY, pointerId: e.pointerId };

    const move = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      d.x = ev.clientX;
      d.y = ev.clientY;
      // Near an edge the view turns, so a corner can be dragged past what is on screen
      const rect = mount.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      const margin = 60;
      detPanRef.current = {
        lon: px < margin ? -((margin - px) / margin) * 2.4 : px > rect.width - margin ? ((px - (rect.width - margin)) / margin) * 2.4 : 0,
        lat: py < margin ? ((margin - py) / margin) * 1.6 : py > rect.height - margin ? -((py - (rect.height - margin)) / margin) * 1.6 : 0,
      };
      applyDrag();
    };
    const end = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      detPanRef.current = { lon: 0, lat: 0 };
      dragRef.current = null;
      if (d.last !== d.start) onEditDetectionRef.current?.(d.id, { points: d.last });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  // Drawing a missed detection: drag across it for an outline, or tap to place one at its usual size
  const finishDraw = (label: string, a: { x: number; y: number }, b: { x: number; y: number }) => {
    const cam = cameraRef.current;
    const mount = mountRef.current;
    if (!cam || !mount || (identificationStep !== 'constraints' && identificationStep !== 'assets')) return;
    const rect = mount.getBoundingClientRect();
    const dims = DETECTION_LABELS[identificationStep].find((l) => l.name === label)?.dims ?? [0.6, 0.6, 0.6];
    const tooSmall = Math.abs(a.x - b.x) < 28 || Math.abs(a.y - b.y) < 28;
    const corner = (x: number, y: number) => {
      const v = directionFromScreen(cam, rect, x, y);
      return [v.x, v.y, v.z] as [number, number, number];
    };
    let points: DetectionShape = tooSmall
      ? defaultQuad(directionFromScreen(cam, rect, (a.x + b.x) / 2, (a.y + b.y) / 2), dims)
      : [corner(Math.min(a.x, b.x), Math.min(a.y, b.y)), corner(Math.max(a.x, b.x), Math.min(a.y, b.y)), corner(Math.max(a.x, b.x), Math.max(a.y, b.y)), corner(Math.min(a.x, b.x), Math.max(a.y, b.y))];
    if (!isValidShape(points)) points = defaultQuad(directionFromScreen(cam, rect, (a.x + b.x) / 2, (a.y + b.y) / 2), dims);
    const id = `user_${Date.now().toString(36)}`;
    onAddDetection?.({ id, step: identificationStep, label, points });
    setAdding(null);
    setLookAround(false);
    setEditingId(id); // straight into fitting the corners
  };

  const handleResetView = () => {
    lon.current = START_LON;
    lat.current = START_LAT;
    handleSetZoom(1.0);
    // Reset camera FOV to fixed default
    if (cameraRef.current) {
      cameraRef.current.fov = 70;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  /** Screen-tracked overlay: the frame loop moves it with translate3d each frame. */
  const trackedStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: 'translate3d(-9999px, -9999px, 0)',
    transformOrigin: '0 0',
    willChange: 'transform',
    // Kept mounted (positions keep updating) but invisible and untappable under an open sheet
    visibility: hideObjectTags ? 'hidden' : undefined,
    transition: 'none'
  };
  const track = (key: string) => (el: HTMLDivElement | null) => {
    if (el) overlayElementsRef.current.set(key, el);
    else overlayElementsRef.current.delete(key);
  };

  return (
    <Box className="relative w-full h-full overflow-hidden select-none bg-background">
      {/* 3D WebGL Canvas Container */}
      <Box
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
        className="block w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Dynamic 3D Contextual Tags & Floating HUDs (hidden when isUiHidden is true) */}
      {!isUiHidden && (
        <>
          {/* Dynamic 3D Contextual Tags attached above staged and confirmed objects */}
          {stagedObjects.map((sObj) => {
            const isSelected = effectiveSelectedIds.includes(sObj.id) ||
              effectiveSelectedIds.includes(sObj.type) ||
              effectiveSelectedIds.includes(`obj_${sObj.type}`) ||
              effectiveSelectedIds.includes(`staged_${sObj.id}`);
            if (!sObj.isWireframe && !isSelected) return null;

            return (
              <Box key={sObj.id} ref={track(`staged_${sObj.id}`)} style={trackedStyle} className="pointer-events-auto z-30 select-none">
                <ContextualObjectTag
                  object={sObj}
                  onGenerateAiSuggestion={onGenerateAiSuggestion || (() => {})}
                  onRemoveObject={onRemoveStagedObject || (() => {})}
                  onNudgeObject={onNudgeStagedObject}
                />
              </Box>
            );
          })}

          {/* Option 1 vs Option 2 Table Reasoning Tag (Step 3: '3_two_options') */}
          {scenarioState?.currentStep === '3_two_options' && (
            <Box ref={track('table_option_reasoning')} style={trackedStyle} className="pointer-events-auto z-40 select-none max-w-[280px]">
              <VStack className={`gap-1.5 p-3 rounded-2xl animate-in zoom-in-95 ${glass.panel}`}>
                <HStack className="items-center gap-1.5">
                  <Icon as={Sparkles} size="xs" />
                  <Text size="xs" bold>AI Reasoning · Option {scenarioState.activeOption || 1}</Text>
                </HStack>
                <Text size="2xs" className="leading-relaxed">
                  {scenarioState.activeOption === 2
                    ? 'Keeps table directly in front of window below AC: plug point is near. If you can compromise on privacy, leaves room for other objects.'
                    : 'Relocating table to top-left gives comparatively more privacy. You will get daylight also, but port distance would be far.'}
                </Text>
              </VStack>
            </Box>
          )}

          {/* Ghost State Elements Contextual Tags (Step 5: '5_ghost_state') */}
          {(scenarioState?.currentStep === '5_ghost_state' || (scenarioState?.ghostStateActive && !scenarioState?.ghostStateCommitted)) && (
            <>
              {/* 1. Dressing Table Ghost Tag */}
              <Box ref={track('ghost_dressing_table')} style={trackedStyle} className="pointer-events-auto z-30 select-none">
                <GhostTag name="Dressing Table" />
              </Box>

              {/* 2. Side Table Ghost Tag with "Shift near Plug Point (E)" action */}
              <Box ref={track('ghost_side_table')} style={trackedStyle} className="pointer-events-auto z-30 select-none">
                <VStack className="items-center gap-1">
                  <GhostTag name="Side Table" />
                  <Button
                    size="sm"
                    variant={scenarioState.sideTableHidingPlug ? 'secondary' : 'default'}
                    onClick={() => onShiftSideTable?.()}
                    className="rounded-full"
                  >
                    <ButtonIcon as={Check} />
                    <ButtonText>{scenarioState.sideTableHidingPlug ? 'Plug Point Hidden' : 'Shift near Plug Point (E)'}</ButtonText>
                  </Button>
                </VStack>
              </Box>

              {/* 3. Chair Ghost Tag */}
              <Box ref={track('ghost_chair')} style={trackedStyle} className="pointer-events-auto z-30 select-none">
                <GhostTag name="Chair" compact />
              </Box>
            </>
          )}

          {/* Drawing a missed detection */}
          {adding && adding !== 'pick' && (
            <Box
              className="absolute inset-0 z-[35] cursor-crosshair"
              style={{ touchAction: 'none', pointerEvents: lookAround ? 'none' : 'auto' }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                const rect = e.currentTarget.getBoundingClientRect();
                drawStartRef.current = { x: e.clientX, y: e.clientY };
                setDrawBox({ x0: e.clientX - rect.left, y0: e.clientY - rect.top, x1: e.clientX - rect.left, y1: e.clientY - rect.top });
              }}
              onPointerMove={(e) => {
                if (!drawStartRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setDrawBox((b) => (b ? { ...b, x1: e.clientX - rect.left, y1: e.clientY - rect.top } : b));
              }}
              onPointerUp={(e) => {
                const start = drawStartRef.current;
                drawStartRef.current = null;
                setDrawBox(null);
                if (start) finishDraw(adding.label, start, { x: e.clientX, y: e.clientY });
              }}
              onPointerCancel={() => { drawStartRef.current = null; setDrawBox(null); }}
            >
              {drawBox && (
                <Box
                  className="absolute rounded-md border-2 border-dashed border-kith bg-kith/15 pointer-events-none"
                  style={{ left: Math.min(drawBox.x0, drawBox.x1), top: Math.min(drawBox.y0, drawBox.y1), width: Math.abs(drawBox.x1 - drawBox.x0), height: Math.abs(drawBox.y1 - drawBox.y0) }}
                />
              )}
            </Box>
          )}

          {/* Detections: outlines pinned to the objects, with tags to adjust, relabel and remove */}
          {(identificationStep === 'constraints' || identificationStep === 'assets') && !isRoomCleared && (() => {
            const removed = removedTagIds || [];
            const edits = detectionEdits || {};
            const catalogue = identificationStep === 'constraints'
              ? IDENTIFIED_CONSTRAINTS.map((c) => ({ id: c.id, name: c.name }))
              : IDENTIFIED_MOVABLE_ASSETS
                  .filter((a) => {
                    if (a.id === 'obj_bed' && scenarioState && !scenarioState.bedPlaced) return false;
                    if (a.id === 'obj_study_table' && scenarioState && !scenarioState.tablePosition) return false;
                    if (a.id === 'obj_pedestal_fan' && scenarioState && !scenarioState.fanPlaced) return false;
                    if (a.id === 'obj_dressing_table' && scenarioState && !scenarioState.dressingTablePlaced) return false;
                    return !scenarioState?.removedAssetIds?.includes(a.id);
                  })
                  .map((a) => ({ id: a.id, name: a.name }));
            const drawn = (userDetections || []).filter((u) => u.step === identificationStep).map((u) => ({ id: u.id, name: u.label }));
            const items = [...catalogue, ...drawn]
              .filter((i) => !removed.includes(i.id))
              .map((i) => ({
                id: i.id,
                name: edits[i.id]?.label ?? i.name,
                vertexCount: (liveShapesRef.current.get(i.id) ?? edits[i.id]?.points ?? getBaseShape(i.id))?.length ?? 4,
              }));
            return (
              <DetectionLayer
                step={identificationStep}
                items={items}
                activeId={activeAssetId}
                editingId={editingId}
                hasOverride={editingId ? !!edits[editingId] : false}
                labels={DETECTION_LABELS[identificationStep]}
                adding={adding}
                lookAround={lookAround}
                relabelOpen={relabelOpen}
                register={(key, el) => {
                  if (el) detElsRef.current.set(key, el);
                  else detElsRef.current.delete(key);
                }}
                onActivate={setActiveAssetId}
                onAdjust={(id) => { setActiveAssetId(null); setEditingId(id); }}
                onRemove={(id) => {
                  const name = items.find((i) => i.id === id)?.name || 'Object';
                  setActiveAssetId(null);
                  onRemoveTag?.(id, name);
                }}
                onEditWithAi={(id) => {
                  const name = items.find((i) => i.id === id)?.name || 'Object';
                  const asset = IDENTIFIED_MOVABLE_ASSETS.find((a) => a.id === id);
                  const dims = DETECTION_LABELS.assets.find((l) => l.name === name)?.dims ?? [0.6, 0.6, 0.6];
                  onOpenAiEditAsset?.(asset ? { ...asset, name } : { id, name, category: 'Added by you', position: [0, 0, 0], dimensions: dims, description: '' });
                }}
                onDragStart={startDetectionDrag}
                onReset={(id) => onResetDetection?.(id)}
                onDone={() => { setEditingId(null); setRelabelOpen(false); }}
                onStartAdd={() => { setActiveAssetId(null); setAdding('pick'); }}
                onPickLabel={(label) => { setAdding({ label }); setLookAround(false); }}
                onCancelAdd={() => { setAdding(null); setLookAround(false); setDrawBox(null); }}
                onSetLookAround={setLookAround}
                onOpenRelabel={() => setRelabelOpen(true)}
                onRelabel={(label) => {
                  if (editingId) onEditDetection?.(editingId, { label });
                  setRelabelOpen(false);
                }}
                onCloseRelabel={() => setRelabelOpen(false)}
              />
            );
          })()}

          {/* Edit Mode: Single Selected Object Contextual Pop-up */}
          {identificationStep === 'completed' && !isRoomCleared && effectiveSelectedIds.length === 1 && !isDraggingState && (() => {
            const selId = effectiveSelectedIds[0];
            const objName = getCleanObjectName(selId);

            return (
              <Box ref={track(`selected_${selId}`)} style={trackedStyle} className="pointer-events-auto z-30 select-none">
                {/* Edit with AI | remove, with a pointer down to the piece */}
                <HStack className={`relative h-10 px-1 rounded-full items-center animate-in zoom-in-95 ${glass.clear}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditSelectedWithAi?.([selId])}
                    className="rounded-full w-10"
                    aria-label={`Edit ${objName} with AI`}
                  >
                    <ButtonIcon as={Pencil} />
                  </Button>
                  <Divider orientation="vertical" className="h-5" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveSceneObject?.(selId)}
                    className="rounded-full w-10"
                    aria-label={`Remove ${objName}`}
                  >
                    <ButtonIcon as={Minus} />
                  </Button>
                  <Box className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[7px] border-t-white/25" aria-hidden />
                </HStack>
              </Box>
            );
          })()}

          {/* Edit Mode: Two Selected Objects Unified Contextual Pop-up */}
          {identificationStep === 'completed' && !isRoomCleared && effectiveSelectedIds.length === 2 && !isDraggingState && (() => {
            const id1 = effectiveSelectedIds[0];
            const id2 = effectiveSelectedIds[1];
            const name1 = getCleanObjectName(id1);
            const name2 = getCleanObjectName(id2);
            const coord1 = selectedScreenCoords[id1];
            const coord2 = selectedScreenCoords[id2];

            let midX = 0;
            let midY = 0;
            let isMidVisible = false;

            if (coord1 && coord2) {
              midX = Math.round((coord1.x + coord2.x) / 2);
              midY = Math.round((coord1.y + coord2.y) / 2);
              isMidVisible = coord1.visible || coord2.visible;
            } else if (coord1 && coord1.visible) {
              midX = coord1.x;
              midY = coord1.y;
              isMidVisible = true;
            } else if (coord2 && coord2.visible) {
              midX = coord2.x;
              midY = coord2.y;
              isMidVisible = true;
            }

            return (
              <Box
                className={`pointer-events-auto z-30 transition-all duration-75 select-none ${
                  isMidVisible ? 'absolute' : 'fixed bottom-[calc(var(--k-bottom)+var(--k-dock)+var(--k-gap))] left-1/2 -translate-x-1/2'
                }`}
                style={isMidVisible ? { left: `${midX}px`, top: `${midY}px`, transform: 'translate(-50%, -100%)' } : undefined}
              >
                <VStack className={`gap-2 p-2.5 rounded-2xl min-w-[210px] animate-in zoom-in-95 ${glass.clear}`}>
                  <HStack className="items-center justify-between px-1">
                    <Text size="xs" bold className="truncate">{name1} & {name2}</Text>
                    <Text size="2xs" className="text-muted-foreground">2 selected</Text>
                  </HStack>
                  <Divider />
                  <HStack className="items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSuggestArrangement?.([id1, id2])}
                      className="flex-1 rounded-full"
                      aria-label="Suggest arrangement using AI"
                    >
                      <ButtonIcon as={HelpCircle} />
                      <ButtonText>Suggest</ButtonText>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditSelectedWithAi?.([id1, id2])}
                      className="flex-1 rounded-full"
                      aria-label="Edit selected objects with AI"
                    >
                      <ButtonIcon as={Sparkles} />
                      <ButtonText>Edit with AI</ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            );
          })()}

          {/* Touch Dragging Object Floor-Snapping & Edge-Pan Active Indicator */}
          {isDraggingState && (
            <HStack className={`absolute top-[calc(var(--k-top)+var(--k-ctl)+var(--k-gap)+56px)] left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 rounded-full items-center gap-2 whitespace-nowrap animate-in fade-in ${glass.clear}`}>
              <Icon as={Move} size="xs" />
              <Text size="xs" bold>Moving {draggedObjectName}</Text>
              <Text size="xs" className="text-muted-foreground">· Snaps to walls</Text>
            </HStack>
          )}

          {!isDraggingState && Object.keys(pendingMoves).length > 0 && !isConfirmingMoves && (
            <Badge variant="outline" className={`absolute top-[calc(var(--k-top)+var(--k-ctl)+var(--k-gap)+56px)] left-1/2 -translate-x-1/2 z-30 pointer-events-none px-4 py-2 animate-in fade-in ${glass.clear}`}>
              <BadgeText>Keep moving, then tap Confirm</BadgeText>
            </Badge>
          )}

          {Object.keys(pendingMoves).map((id) => (
            <Box
              key={`pending_${id}`}
              ref={track(`pending_${id}`)}
              style={{ position: 'absolute', left: 0, top: 0, transform: 'translate3d(-9999px, -9999px, 0)', willChange: 'transform' }}
              className="pointer-events-none z-20 select-none"
            >
              <Badge variant="outline" className={glass.clear}>
                <BadgeText>{getCleanObjectName(id)}</BadgeText>
              </Badge>
            </Box>
          ))}

          {/* Floating Staging HUD Card (Concepts 1 & 4) */}
          {stagedInfo && (
            <Box className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-50 pointer-events-auto animate-in fade-in slide-in-from-bottom-2">
              <VStack className={`p-3.5 gap-2.5 rounded-2xl ${glass.panel}`}>
                {/* Top row: Label + Dimensions + Rotation angle */}
                <HStack className="items-center justify-between">
                  <HStack className="items-center gap-2">
                    <Box className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <Text size="xs" bold>Staging: {stagedInfo.name}</Text>
                  </HStack>
                  <Badge variant="secondary">
                    <BadgeText className="normal-case tabular-nums">
                      {stagedInfo.dimensions[0].toFixed(2)}m × {stagedInfo.dimensions[2].toFixed(2)}m | {Math.round(((stagedInfo.rotationY * 180 / Math.PI) % 360 + 360) % 360)}°
                    </BadgeText>
                  </Badge>
                </HStack>

                {/* Gesture coaching hint */}
                <HStack className="items-center justify-between px-1">
                  <HStack className="items-center gap-1"><Icon as={Move} size="2xs" className="text-muted-foreground" /><Text size="2xs" className="text-muted-foreground">Drag to position</Text></HStack>
                  <HStack className="items-center gap-1"><Icon as={RotateCw} size="2xs" className="text-muted-foreground" /><Text size="2xs" className="text-muted-foreground">Twist to rotate</Text></HStack>
                </HStack>

                {/* Action buttons */}
                <Divider />
                <HStack className="items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleRotate90} className="flex-1 rounded-full" aria-label="Rotate 90 degrees">
                    <ButtonIcon as={RotateCw} />
                    <ButtonText>Rotate 90°</ButtonText>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleResetPlacement} className="rounded-full" aria-label="Reset to original position in image">
                    <ButtonIcon as={RotateCcw} />
                    <ButtonText>Reset</ButtonText>
                  </Button>
                  <Button size="sm" onClick={handleConfirmPlacement} className="rounded-full" aria-label="Confirm placement for inpainting">
                    <ButtonIcon as={Check} />
                    <ButtonText>Confirm</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Spatial 360° Phone Gyroscope Experience Button (floating, under the top bar on the right) */}
          <Box className="absolute right-edge top-[calc(var(--k-top)+var(--k-ctl)+var(--k-row))] z-30 pointer-events-auto">
            <Button
              variant={isGyroActive ? 'default' : 'ghost'}
              size="icon"
              onClick={handleToggleGyro}
              className={floatingIconButton}
              aria-label={isGyroActive ? 'Disable 360° Phone Gyroscope' : 'Experience Space in 360° with Phone Sensor'}
            >
              <ButtonIcon as={Smartphone} className="h-[18px] w-[18px]" />
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

/** Ghost tag over a piece the AI proposes (step 5) */
const GhostTag: React.FC<{ name: string; compact?: boolean }> = ({ name, compact }) => (
  <HStack className={`rounded-full items-center ${compact ? 'px-2.5 py-1 gap-1.5' : 'px-3 py-1.5 gap-2'} ${glass.clear}`}>
    <Box className={`rounded-full bg-sky-400 ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2 animate-pulse'}`} />
    <Text size="xs" bold>{name}</Text>
    {!compact && (
      <Badge variant="secondary">
        <BadgeText>Ghost</BadgeText>
      </Badge>
    )}
  </HStack>
);
