import React, { useState, useRef, useEffect } from 'react';
import {
  RoomObject,
  LightingSetting,
  ScenarioState,
  ScenarioStepId,
  StagedObject,
  UserPreferences,
  IdentificationStep,
  CaptureKind,
  DetectionEdit,
  UserDetection
} from './types';
import { INITIAL_ROOM_OBJECTS } from './data/mockData';
import { SAMPLE_ROOM, DETECTED_ROOM_TYPE, DEFAULT_DESCRIPTION, DEFAULT_PRIORITIES } from './data/onboardingData';
import { LibraryItem, loadLibrary, saveLibrary, loadCaptureKind, saveCaptureKind } from './data/library';
import {
  IdentifiedConstraint,
  IdentifiedAsset,
  IDENTIFIED_CONSTRAINTS,
  IDENTIFIED_MOVABLE_ASSETS
} from './data/identificationData';

import { HomeScreen } from './screens/HomeScreen';
import { ScanScreen } from './screens/ScanScreen';
import { PreferencesFlow } from './screens/PreferencesFlow';
import { MobileTopBar } from './editor/MobileTopBar';
import { MobileBottomNav, MainNavTab } from './editor/MobileBottomNav';
import { AiPromptForm, AiPromptContext, PromptInputHandle } from './editor/AiPromptBar';
import { PanoramicViewer, getCleanObjectName, FIXED_OBJECT_IDS, PendingMove, ViewerApi } from './editor/PanoramicViewer';
import { Placement } from './utils/stagingProxy';
import { askRoomAi, AiStep, MoveIntent, RoomContext } from './utils/askGemini';
import { planMoves } from './utils/aiMoves';
import { matchStepByKeywords } from './data/keywordFallback';
import {
  INITIAL_SCENARIO_STATE,
  SCENARIO_STEP_TOASTS,
  applyScenarioStep,
  applyScenarioChain,
  stepsToReach,
  summarizeScene,
  roomSuggestions
} from './data/scenarioSteps';
import { ScenarioFloatingControls } from './editor/ScenarioFloatingControls';
import { AssetsDrawer, AssetItem } from './editor/AssetsDrawer';
import { AIScenarioSheet } from './editor/AIScenarioSheet';

import {
  CheckCircle2,
  Sparkles,
  Sun,
  Rotate3d,
  ListRestart,
  Layers,
  RotateCcw,
  X,
  Eraser,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  type LucideIcon
} from 'lucide-react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Pressable } from '@/components/ui/pressable';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalHeader } from '@/components/ui/modal';
import { glass, floatingPill } from '@/components/glass';

export type AppScreen = 'home' | 'scan' | 'preferences' | 'editor';

export default function App() {
  // Screen Flow: 'home' -> 'scan' -> 'preferences' -> 'editor'
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');

  // Room Project Info
  const [currentRoomName, setCurrentRoomName] = useState<string>("Aarav's Room");

  // What the person told us about this room in onboarding; the AI weighs it when it answers.
  // Projects made before this existed, and the sample room, use the sample room's own answers.
  const sampleRoomContext = (name: string): RoomContext => ({
    name,
    roomType: DETECTED_ROOM_TYPE,
    description: DEFAULT_DESCRIPTION,
    priorities: DEFAULT_PRIORITIES
  });
  const [roomContext, setRoomContext] = useState<RoomContext>(() => sampleRoomContext(SAMPLE_ROOM.name));

  // Whole room (360° project) or one corner (single photo), chosen in the camera; reopens on the last one used
  const [captureKind, setCaptureKind] = useState<CaptureKind>(loadCaptureKind);

  // Everything captured so far, newest first on Home
  const [library, setLibrary] = useState<LibraryItem[]>(loadLibrary);
  useEffect(() => { saveLibrary(library); }, [library]);
  // Stored for later; the Refine editor is not designed yet, so the editor is the same
  const [vision, setVision] = useState<UserPreferences['vision']>('redesign');

  // Active Bottom Nav Tab (Default: Edit mode as requested)
  const [activeTab, setActiveTab] = useState<MainNavTab>('edit');

  // Initial Room Objects Highlighting (Default: True, subtle glowing outlines)
  const [showDetectedOutlines, setShowDetectedOutlines] = useState<boolean>(true);

  // Snackbar for 8 Detected Objects & Clear Room option
  const [showDetectedSnackbar, setShowDetectedSnackbar] = useState<boolean>(true);
  const [identificationStep, setIdentificationStep] = useState<IdentificationStep>('constraints');
  const isDetectionPhase = identificationStep !== 'completed';
  const [showStartFreshPopup, setShowStartFreshPopup] = useState<boolean>(false);

  // Corrections to what the AI detected, kept as positions on the image (no 3D object involved)
  const [detectionEdits, setDetectionEdits] = useState<Record<string, DetectionEdit>>({});
  const [userDetections, setUserDetections] = useState<UserDetection[]>([]);
  const [removedTags, setRemovedTags] = useState<{ id: string; name: string }[]>([]);
  const [removedTagsNotice, setRemovedTagsNotice] = useState(false);
  const [isAiWorkingOverlay, setIsAiWorkingOverlay] = useState<boolean>(false);

  // Bottom prompt bar state for "Edit with AI" on movable assets
  const [aiPromptTargetAsset, setAiPromptTargetAsset] = useState<IdentifiedAsset | null>(null);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [aiPromptTargetSelection, setAiPromptTargetSelection] = useState<{
    ids: string[];
    names: string[];
  } | null>(null);
  const [aiPromptInput, setAiPromptInput] = useState<string>('');
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [showRestorePill, setShowRestorePill] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState<number>(0);
  const promptInputRef = useRef<PromptInputHandle>(null);

  // Mobile virtual keyboard height listener via window.visualViewport
  // Ensures the prompt bar floats directly on top of the keyboard when typing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleViewportChange = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const kbHeight = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
      setKeyboardOffset(kbHeight > 70 ? kbHeight : 0);
    };

    window.visualViewport?.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  const [isRoomCleared, setIsRoomCleared] = useState<boolean>(false);
  const [customPositions, setCustomPositions] = useState<Record<string, [number, number, number]>>({});
  const [customRotations, setCustomRotations] = useState<Record<string, number>>({});

  // Scenario State & Undo/Redo Stack
  const [scenarioState, setScenarioState] = useState<ScenarioState>(INITIAL_SCENARIO_STATE);
  const [history, setHistory] = useState<ScenarioState[]>([]);
  const [redoStack, setRedoStack] = useState<ScenarioState[]>([]);

  // User Staged Objects (Ghost Wireframe -> Glow -> Model Revealed)
  const [stagedObjects, setStagedObjects] = useState<StagedObject[]>([]);
  const [isConfirmingGlow, setIsConfirmingGlow] = useState<boolean>(false);

  // Moved furniture waiting for Confirm: shown only as bounding boxes until then
  const [pendingMoves, setPendingMoves] = useState<Record<string, PendingMove>>({});
  const pendingMoveCount = Object.keys(pendingMoves).length;

  // UI Drawers & Sheets (Default: AI Walkthrough Open in editor mode)
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(true);
  // After a question about specific pieces the sheet shows only the conversation: the guided steps
  // are about the whole room and would sit under an answer they have nothing to do with
  const [aiRepliesOnly, setAiRepliesOnly] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showLayersModal, setShowLayersModal] = useState(false);
  const [isUiHidden, setIsUiHidden] = useState(false);

  // Dragging Asset Feedback
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);
  const [dragTargetName, setDragTargetName] = useState<string>('');
  const [dragAsset, setDragAsset] = useState<{ id: string; name: string; dims: [number, number, number] } | null>(null);
  const viewerApiRef = useRef<ViewerApi | null>(null);

  // AI Generation State
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Lighting & Atmosphere
  const [lighting, setLighting] = useState<LightingSetting>({
    preset: 'natural_daylight',
    colorTempK: 4500,
    intensity: 1.0
  });

  // Architectural Objects & Selection
  const [objects, setObjects] = useState<RoomObject[]>(INITIAL_ROOM_OBJECTS);
  const [selectedObject, setSelectedObject] = useState<RoomObject | null>(null);

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, ms = 2800) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, ms);
  };

  // The conversation with the AI: replies stay readable in the AI sheet instead of vanishing as toasts
  const [aiMessages, setAiMessages] = useState<{ id: number; role: 'user' | 'assistant'; text: string }[]>([]);
  const aiMessageId = useRef(0);
  const aiRequestRef = useRef<AbortController | null>(null);

  // Status bar follows the screen: white paper on Home and onboarding, black over the camera and the room
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', currentScreen === 'scan' || currentScreen === 'editor' ? '#000000' : '#FFFFFF');
  }, [currentScreen]);

  // Leaving the editor cancels whatever the AI is still working on
  useEffect(() => {
    if (currentScreen === 'editor') return;
    aiRequestRef.current?.abort();
    aiRequestRef.current = null;
    setIsAiGenerating(false);
    clearToast();
  }, [currentScreen]);
  useEffect(() => () => aiRequestRef.current?.abort(), []);

  // A new scan starts with the constraints check; reopening a project goes straight to the canvas
  const openEditor = (fromNewScan: boolean) => {
    setIdentificationStep(fromNewScan ? 'constraints' : 'completed');
    if (fromNewScan) {
      setDetectionEdits({});
      setUserDetections([]);
      setRemovedTags([]);
      setAiMessages([]);
    }
    // The "hold a piece to move it" hint shows once the canvas is live (after identification and the start-fresh question)
    setShowDetectedSnackbar(true);
    setIsAiSheetOpen(false);
    setShowStartFreshPopup(false);
    setActiveTab('edit');
    setCurrentScreen('editor');
  };

  // Two-step Identification Flow Progression:
  // Step 1 ('constraints') -> Step 2 ('assets') -> Step 3 ('completed')
  const handleSkipIdentification = () => {
    setIdentificationStep('completed');
    setShowStartFreshPopup(true);
    showToast('Skipped to canvas');
  };

  const handleAdvanceIdentification = () => {
    if (identificationStep === 'constraints') {
      setIdentificationStep('assets');
    } else if (identificationStep === 'assets') {
      setIdentificationStep('completed');
      setShowStartFreshPopup(true);
    }
  };

  const handleConfirmIdentification = () => {
    setIdentificationStep('completed');
    setShowStartFreshPopup(true);
    showToast('Confirmed · Canvas active');
  };

  // Constraint Edit & Reposition Handler (e.g. wall plug points, AC, door switch)
  const handleSaveConstraint = (id: string, updatedPos?: [number, number, number], updatedConfig?: string) => {
    if (updatedPos) {
      setCustomPositions((prev) => ({
        ...prev,
        [id]: updatedPos
      }));
    }
    const cleanName = id.replace('obj_', '').replace(/_/g, ' ');
    showToast(`Specifications updated for ${cleanName}`);
  };

  // Edit canvas: the minus on a selected piece takes it out of the room. Undo brings it back.
  const REMOVABLE_IDS: Record<string, string> = {
    det_table: 'obj_study_table',
    obj_table: 'obj_study_table',
    det_sidetable: 'obj_side_table',
    det_fan: 'obj_pedestal_fan',
  };
  const handleRemoveSceneObject = (rawId: string) => {
    const id = REMOVABLE_IDS[rawId] ?? rawId.replace('det_', 'obj_');
    const name = getCleanObjectName(id);
    pushScenarioState((prev) => {
      const next = { ...prev };
      if (id === 'obj_bed') next.bedPlaced = false;
      if (id === 'obj_study_table') next.tablePosition = null;
      if (id === 'obj_pedestal_fan') next.fanPlaced = false;
      if (id === 'obj_dressing_table') next.dressingTablePlaced = false;
      next.removedAssetIds = [...(prev.removedAssetIds || []), id];
      return next;
    });
    setSelectedObjectIds([]);
    setSelectedObject(null);
    setAiPromptTargetSelection(null);
    showToast(`${name} removed`);
  };

  // Detection corrections (steps 1 and 2): move or resize a frame, or drop a tag that is wrong.
  // Removing a tag only forgets the detection; the room itself is left as it is.
  const handleEditDetection = (id: string, patch: DetectionEdit) =>
    setDetectionEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleResetDetection = (id: string) => {
    setDetectionEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleAddDetection = (detection: UserDetection) => {
    setUserDetections((prev) => [...prev, detection]);
  };

  const handleRemoveTag = (id: string, name: string) => {
    setRemovedTags((prev) => [...prev.filter((t) => t.id !== id), { id, name }]);
  };

  const handleUndoRemoveTag = () => setRemovedTags((prev) => prev.slice(0, -1));

  // The undo pill is for the last removal only; it fades after a few seconds
  useEffect(() => {
    if (removedTags.length === 0) return;
    const t = setTimeout(() => setRemovedTagsNotice(false), 6000);
    setRemovedTagsNotice(true);
    return () => clearTimeout(t);
  }, [removedTags]);

  // Asset AI Refinement Handler (Step 2)
  const handleAiRefineAsset = (asset: IdentifiedAsset, prompt: string) => {
    setIsAiGenerating(true);
    showToast(`AI refining ${asset.name}…`);
    setTimeout(() => {
      setIsAiGenerating(false);
      if (asset.id === 'obj_study_table') {
        handleAdvanceScenario('2_table_privacy_concern');
      } else if (asset.id === 'obj_bed') {
        handleAdvanceScenario('5_ghost_state');
      } else if (asset.id === 'obj_pedestal_fan') {
        handleAdvanceScenario('7_fan_added');
      } else if (asset.id === 'obj_side_table') {
        handleAdvanceScenario('6_side_table_moved');
      }
      showToast(`AI updated ${asset.name} placement`);
    }, 800);
  };

  // Handler when user taps "Edit with AI" on single or multiple selected objects
  const handleEditSelectedWithAi = (ids: string[]) => {
    const names = ids.map((id) => getCleanObjectName(id));
    setAiPromptTargetSelection({ ids, names });
    setSelectedObjectIds(ids);
    setAiPromptTargetAsset(null);
    setAiPromptInput('');
    openAiPrompt();
  };

  // Handler when user taps "Suggest arrangement" (? with sparkle) for two selected objects
  const handleSuggestArrangement = (ids: string[]) => {
    const names = ids.map((id) => {
      const found = objects.find((o) => o.id === id);
      return found?.name || id.replace('obj_', '').replace(/_/g, ' ');
    });

    setIsAiGenerating(true);
    showToast(`Arranging ${names.join(' & ')}…`);

    setTimeout(() => {
      setIsAiGenerating(false);
      if (ids.some((i) => i.includes('table')) && ids.some((i) => i.includes('bed'))) {
        handleAdvanceScenario('2_table_privacy_concern');
        showToast('Table turned toward the window');
      } else if (ids.some((i) => i.includes('table')) && ids.some((i) => i.includes('fan'))) {
        handleAdvanceScenario('7_fan_added');
        showToast('Fan moved to cool the desk');
      } else if (ids.some((i) => i.includes('bed')) && ids.some((i) => i.includes('side'))) {
        handleAdvanceScenario('6_side_table_moved');
        showToast('Side table now hides the plug');
      } else {
        showToast(`Adjusted ${names.join(' & ')}`);
      }
    }, 900);
  };

  // Clear Room: removes movable items while strictly keeping fixed architectural items (Wardrobe, Windows, Plugs, AC, Door)
  const handleClearRoom = () => {
    setIsRoomCleared(true);
    setShowRestorePill(true);
    setStagedObjects([]);
    setShowDetectedSnackbar(false);
    setShowStartFreshPopup(false);
    showToast('Room cleared · Fixed items kept');
  };

  // Restore baseline detected layout
  const handleRestoreRoom = () => {
    setIsRoomCleared(false);
    setShowRestorePill(false);
    setScenarioState(INITIAL_SCENARIO_STATE);
    setCustomPositions({});
    showToast('Room restored to your scan');
  };

  // Update object position from touch gestures (snapped to floor)
  const handleUpdateObjectPosition = (id: string, pos: [number, number, number]) => {
    setCustomPositions((prev) => ({
      ...prev,
      [id]: pos
    }));
    setStagedObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, position: pos } : obj))
    );
  };

  // Update object rotation around vertical axis (from two-finger rotate or staging controls)
  const handleUpdateObjectRotation = (id: string, rotY: number) => {
    setCustomRotations((prev) => ({
      ...prev,
      [id]: rotY
    }));
    setStagedObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, rotationY: rotY } : obj))
    );
  };

  // Push new state with Undo/Redo support
  const pushScenarioState = (updater: (prev: ScenarioState) => ScenarioState) => {
    setScenarioState((prev) => {
      const next = updater(prev);
      setHistory((h) => [...h, prev]);
      setRedoStack([]);
      return next;
    });
  };

  // Undo Handler
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((r) => [scenarioState, ...r]);
    setHistory((h) => h.slice(0, h.length - 1));
    setScenarioState(previous);
    showToast('Undid last action');
  };

  // Redo Handler
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((r) => r.slice(1));
    setHistory((h) => [...h, scenarioState]);
    setScenarioState(next);
    showToast('Redid action');
  };

  // Step-by-Step Scenario Transitions matching user's exact story
  const handleAdvanceScenario = (nextStep: ScenarioStepId) => {
    setIsAiSheetOpen(true);
    setActiveTab('ai');
    const toast = SCENARIO_STEP_TOASTS[nextStep];
    if (toast) showToast(toast);
    pushScenarioState((prev) => applyScenarioStep(prev, nextStep));
  };

  // Toggle individual mood board items in Step 8
  const handleToggleMoodItem = (key: keyof ScenarioState) => {
    pushScenarioState((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
    showToast('Updated mood board element');
  };

  // Palette Selection
  const handleSelectPalette = (palette: 'warm_studio' | 'cool_pastel') => {
    pushScenarioState((prev) => ({
      ...prev,
      palette
    }));
    if (palette === 'warm_studio') {
      setLighting({
        preset: 'warm_evening',
        colorTempK: 2800,
        intensity: 1.15
      });
      showToast('Warm Studio palette applied');
    } else {
      setLighting({
        preset: 'focus_day',
        colorTempK: 5200,
        intensity: 1.05
      });
      showToast('Applied Cool Pastel Nordic palette');
    }
  };

  // Commit Ghost State
  const handleCommitGhostState = () => {
    handleAdvanceScenario('6_side_table_moved');
  };

  // Shift Side Table to Hide Plug Point
  const handleShiftSideTable = () => {
    pushScenarioState((prev) => ({
      ...prev,
      sideTableHidingPlug: !prev.sideTableHidingPlug
    }));
    showToast(
      scenarioState.sideTableHidingPlug
        ? 'Side table returned to corner'
        : 'Side table shifted over South wall plug point'
    );
  };

  // Real-world size [w, h, d] of each catalogue piece, in metres
  const assetDims = (item: AssetItem): [number, number, number] => {
    switch (item.id) {
      case 'table': return [1.05, 0.75, 0.60]; // workstation cuboid per walkthrough specs
      // 1.20m (4ft): fits between the entry door (0.88m, centred) and the east wall, a 1.26m gap. Was 1.52m, which ran into the door frame.
      case 'bed': return [1.2, 0.48, 1.95];
      case 'separator': return [1.60, 1.80, 0.08];
      case 'fan': return [0.45, 1.30, 0.45];
      case 'dressing_table': return [0.95, 1.50, 0.48];
      case 'side_table': return [0.52, 0.58, 0.45];
      case 'chair': return [0.52, 0.82, 0.52];
      case 'carpet': return [2.20, 0.01, 1.60];
      default: return [1.2, 0.75, 0.8];
    }
  };

  // Where a piece goes when it is tapped rather than dropped: its scripted spot in the walkthrough
  const assetDefaultSpot = (item: AssetItem, dims: [number, number, number]): [number, number, number] => {
    switch (item.id) {
      case 'table': return [-1.25, dims[1] / 2, -0.65]; // under the window, below the AC (Diagram 3)
      case 'bed': return [1.15, dims[1] / 2, 1.30]; // bottom-right corner (Diagram 2)
      case 'separator': return [-0.60, dims[1] / 2, -0.65];
      case 'fan': return [1.40, dims[1] / 2, 1.55];
      case 'dressing_table': return [0.0, dims[1] / 2, -2.15];
      case 'side_table': return [-1.45, dims[1] / 2, -1.20];
      case 'chair': return [-0.65, dims[1] / 2, -1.85];
      case 'carpet': return [-0.10, 0.005, -0.20];
      default: return [0, dims[1] / 2, 0];
    }
  };

  // Puts a catalogue piece into the room as a staged box, at a dropped point or its scripted spot
  const stageAsset = (item: AssetItem, at?: Placement | null) => {
    const dims = assetDims(item);
    const pos: [number, number, number] = at ? [at.x, dims[1] / 2, at.z] : assetDefaultSpot(item, dims);
    const newStaged: StagedObject = {
      id: `staged_${item.id}_${Date.now()}`,
      name: item.name,
      type: item.id,
      position: pos,
      dimensions: dims,
      isWireframe: true,
      isGlowing: false
    };
    setStagedObjects((prev) => [...prev.filter((o) => o.type !== item.id), newStaged]);
  };

  // Dragging a piece out of the drawer: the room shows a staging box under the finger until it is dropped
  const handleStartDragAsset = (item: AssetItem) => {
    setIsDraggingAsset(true);
    setDragTargetName(item.name);
    setDragAsset({ id: item.id, name: item.name, dims: assetDims(item) });
    setIsAssetsOpen(false);
  };

  // Dropped: the box lands where the finger is (snapped to a wall if close), not at a preset spot
  const handleDropAsset = (item: AssetItem, clientX: number, clientY: number) => {
    const at = viewerApiRef.current?.floorPointAt(clientX, clientY, assetDims(item), item.id) ?? null;
    stageAsset(item, at);
    setIsDraggingAsset(false);
    setDragAsset(null);
  };

  // Stage an Asset from the Drawer into Ghost Wireframe State
  const handleSelectAsset = (item: AssetItem) => {
    setIsAssetsOpen(false);
    stageAsset(item);
  };

  // Hold-and-drag released: the object stays a bounding box until Confirm
  const handleStageMove = (id: string, move: PendingMove) => {
    setPendingMoves((prev) => ({ ...prev, [id]: move }));
  };

  const handleDiscardStaged = () => {
    setPendingMoves({});
    setStagedObjects((prev) => prev.filter((o) => !o.isWireframe));
    showToast('Moves discarded');
  };

  // Confirm: boxes glow while the "new image layers" are made, then the furniture reappears in place
  const handleConfirmStaged = () => {
    if (pendingMoveCount > 0) {
      setIsConfirmingGlow(true);
      setTimeout(() => {
        setCustomPositions((prev) => {
          const next = { ...prev };
          Object.entries(pendingMoves).forEach(([id, m]) => { next[id] = m.position; });
          return next;
        });
        setCustomRotations((prev) => {
          const next = { ...prev };
          Object.entries(pendingMoves).forEach(([id, m]) => { next[id] = m.rotationY; });
          return next;
        });
        setPendingMoves({});
        if (!stagedObjects.some((o) => o.isWireframe)) setIsConfirmingGlow(false);
        showToast(`${pendingMoveCount === 1 ? '1 piece' : `${pendingMoveCount} pieces`} placed`);
      }, 1500);
    }
    handleConfirmStagedWireframes();
  };

  // Top-Right Confirm Staged Objects -> Glow for 1.5s -> Reveal Real 3D Model
  const handleConfirmStagedWireframes = () => {
    if (!stagedObjects.some((o) => o.isWireframe)) return;
    setIsConfirmingGlow(true);
    showToast('Placements confirmed: wireframes glowing');

    // 1. All wireframes start to glow
    setStagedObjects((prev) =>
      prev.map((obj) => ({
        ...obj,
        isGlowing: true
      }))
    );

    // 2. Glow for 1.5 seconds, then reveal 3D solid models
    setTimeout(() => {
      setIsConfirmingGlow(false);
      setStagedObjects((prev) =>
        prev.map((obj) => ({
          ...obj,
          isWireframe: false,
          isGlowing: false
        }))
      );
      showToast('3D spatial models revealed');

      // Synchronize scenario state if staged objects match scenario items
      setScenarioState((prev) => {
        const next = { ...prev };
        stagedObjects.forEach((s) => {
          if (s.type === 'bed') next.bedPlaced = true;
          if (s.type === 'table') next.tablePosition = 'window_ac';
          if (s.type === 'separator') next.hasSeparator = true;
          if (s.type === 'dressing_table') next.dressingTablePlaced = true;
          if (s.type === 'fan') next.fanPlaced = true;
        });
        return next;
      });
    }, 1500);
  };

  // Nudge / Move Staged Object
  const handleNudgeStagedObject = (id: string, dx: number, dz: number) => {
    setStagedObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj;
        const nx = Math.max(-2.2, Math.min(2.2, obj.position[0] + dx));
        const nz = Math.max(-2.2, Math.min(2.2, obj.position[2] + dz));
        return {
          ...obj,
          position: [parseFloat(nx.toFixed(2)), obj.position[1], parseFloat(nz.toFixed(2))]
        };
      })
    );
  };

  // Generate AI Suggestion for an Object
  const handleGenerateAiSuggestion = (obj: StagedObject) => {
    setActiveTab('ai');
    setIsAiSheetOpen(true);
    setIsAiGenerating(true);
    showToast(`Checking ${obj.name}…`);

    setTimeout(() => {
      setIsAiGenerating(false);
      if (obj.type === 'bed') {
        handleAdvanceScenario('1_bed_fixed');
        showToast('Good spot for the bed');
      } else if (obj.type === 'table') {
        handleAdvanceScenario('2_table_privacy_concern');
        showToast('Desk is in view of the door');
      } else if (obj.type === 'separator') {
        handleAdvanceScenario('4_option2_selected');
      } else if (obj.type === 'fan') {
        handleAdvanceScenario('7_fan_added');
      } else if (obj.type === 'side_table') {
        handleAdvanceScenario('6_side_table_moved');
      } else if (['plant', 'carpet', 'vertical_storage', 'storage_lamp'].includes(obj.type)) {
        handleAdvanceScenario('8_personalization');
      } else {
        showToast(`${obj.name} placement looks good`);
      }
    }, 600);
  };

  // Select Option 1 vs Option 2 in Step 3
  const handleSelectOption = (opt: 1 | 2) => {
    // Clear custom drag position for table so it snaps to the exact option position
    setCustomPositions((prev) => {
      const next = { ...prev };
      delete next['obj_study_table'];
      delete next['obj_table'];
      delete next['det_table'];
      return next;
    });
    pushScenarioState((prev) => ({
      ...prev,
      currentStep: '3_two_options',
      activeOption: opt,
      tablePosition: opt === 1 ? 'top_left' : 'window_ac'
    }));
    showToast(`Option ${opt}: ${opt === 1 ? 'More privacy' : 'Near the AC'}`);
  };

  // 2-Second AI Working Overlay -> Full Ghost State (Diagram 6)
  const handleProceedToFullGhost = () => {
    setIsAiWorkingOverlay(true);
    setIsAiSheetOpen(false);

    setTimeout(() => {
      setIsAiWorkingOverlay(false);
      handleAdvanceScenario('5_ghost_state');
      setIsAiSheetOpen(true);
      showToast('Layout ready to review');
    }, 2000);
  };

  // Remove Staged Object
  const handleRemoveStagedObject = (id: string) => {
    const target = stagedObjects.find((o) => o.id === id);
    setStagedObjects((prev) => prev.filter((o) => o.id !== id));
    showToast(`Removed ${target?.name || 'object'}`);
  };

  // Handle Preferences Flow Completion
  const handleCompletePreferences = (prefs: UserPreferences) => {
    const name = prefs.roomName.trim() || (prefs.captureKind === 'zone' ? SAMPLE_ROOM.zoneName : SAMPLE_ROOM.name);
    setCurrentRoomName(name);
    setVision(prefs.vision);
    const context: RoomContext = {
      name,
      roomType: prefs.roomType,
      description: prefs.description,
      activities: prefs.activities,
      priorities: prefs.priorities
    };
    setRoomContext(context);
    // A whole-room scan becomes a project, a single photo a quick space; either way it lands on Home
    setLibrary((prev) => [
      {
        id: `space_${Date.now()}`,
        name,
        context,
        kind: prefs.captureKind,
        coverUrl: SAMPLE_ROOM.panoramaUrl,
        coverPosition: prefs.captureKind === 'zone' ? SAMPLE_ROOM.zonePhotoPosition : '30% 50%',
        updatedAt: Date.now(),
        objectCount: SAMPLE_ROOM.objectCount,
      },
      ...prev,
    ]);
    openEditor(true);
  };

  const handleOpenSpace = (id: string) => {
    const item = library.find((i) => i.id === id);
    if (item) {
      setCurrentRoomName(item.name);
      setRoomContext(item.context ?? sampleRoomContext(item.name));
      setLibrary((prev) => prev.map((i) => (i.id === id ? { ...i, updatedAt: Date.now() } : i)));
    }
    openEditor(false);
  };

  // Fill Study Table with User Description via AI
  const handleFillTableWithAi = (desc: string) => {
    pushScenarioState((prev) => ({
      ...prev,
      tableFilledWithAi: true,
      tableDescription: desc
    }));
    showToast('Desk filled in');
  };

  // Jump ahead in the story by playing every step in between as ONE change (one Undo takes it back).
  // Computed from the latest state, so a reply that arrives late still lands coherently.
  const advanceScenarioTo = (target: ScenarioStepId, quiet = false) => {
    openGuide();
    const toast = SCENARIO_STEP_TOASTS[target];
    if (toast && !quiet) showToast(toast);
    pushScenarioState((prev) => applyScenarioChain(prev, target));
  };

  const applyAiStep = (step: AiStep, msg: string, quiet = false) => {
    if (step === 'restart') handleAdvanceScenario('1_bed_fixed');
    else if (step === 'fill_table') handleFillTableWithAi(msg);
    else if (step !== 'none') advanceScenarioTo(step, quiet);
  };

  // One AI request at a time: a new one cancels the old, and a cancelled or stale answer is dropped
  const startAiRequest = () => {
    aiRequestRef.current?.abort();
    const controller = new AbortController();
    aiRequestRef.current = controller;
    return controller;
  };

  const clearToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(null);
  };

  // The AI sheet with the guided steps under the conversation
  const openGuide = () => {
    setIsAiSheetOpen(true);
    setAiRepliesOnly(false);
    setActiveTab('ai');
  };

  const pushAiMessage = (role: 'user' | 'assistant', text: string) => {
    const id = ++aiMessageId.current;
    setAiMessages((prev) => [...prev.slice(-5), { id, role, text }]);
  };

  // The pieces an AI request is about: raw selection ids, and their names
  const aiTargetIds = aiPromptTargetSelection?.ids ?? selectedObjectIds;

  // The canvas names pieces two ways (det_ from detection, obj_ in the scene); the scene name is what moves
  const sceneIdFor = (raw: string) => REMOVABLE_IDS[raw] ?? raw.replace('det_', 'obj_');

  // Stage the AI's proposed move as the same boxes a dragged piece leaves behind, so the person
  // still taps Confirm (or Discard): the AI proposes, it never places anything by itself
  const stageAiMove = (rawIds: string[], intent: MoveIntent): { staged: number; fixed: number } => {
    const ids = [...new Set(rawIds.map(sceneIdFor))];
    const movable = ids.filter((id) => !FIXED_OBJECT_IDS.has(id));
    const pieces = movable.flatMap((id) => {
      const state = viewerApiRef.current?.getPiece(id);
      return state ? [{ id, state }] : [];
    });
    const moves = planMoves(pieces, intent);
    Object.entries(moves).forEach(([id, m]) => handleStageMove(id, m));
    return { staged: Object.keys(moves).length, fixed: ids.length - movable.length };
  };

  // Ask the AI. With pieces selected it may propose moving them; with none it writes a reply and may
  // play the next part of the scripted story. With no connection it falls back to keyword matching.
  const handleCustomUserMessage = async (msg: string) => {
    const names = aiTargetNames;
    const ids = aiTargetIds;
    const controller = startAiRequest();
    pushAiMessage('user', names.length > 0 ? `${names.join(' & ')}: ${msg}` : msg);
    setIsAiGenerating(true);
    // An answer can take up to 15 s: keep the notice up until it arrives instead of letting it fade
    showToast(names.length > 0 ? `Working on ${names.join(' & ')}…` : 'Thinking…', 20_000);

    const answer = await askRoomAi(msg, { targets: names, scene: summarizeScene(scenarioState), room: roomContext, signal: controller.signal });
    if (answer === 'cancelled' || aiRequestRef.current !== controller) return;
    aiRequestRef.current = null;
    setIsAiGenerating(false);
    clearToast();
    setIsAiSheetOpen(true);
    setAiRepliesOnly(names.length > 0);
    setActiveTab('ai');

    // Asking too fast is not an outage: say so, and change nothing
    if (answer === 'busy') {
      pushAiMessage('assistant', 'You’re asking quickly. Give it a few seconds, then try again.');
      return;
    }

    const offline = 'I can’t reach the AI right now';

    if (names.length > 0) {
      // About selected pieces
      if (!answer) {
        pushAiMessage('assistant', `${offline}, so I can’t move ${names.join(' & ')} for you. Hold it and drag it instead.`);
        return;
      }
      let reply = answer.reply;
      if (answer.move) {
        const { staged, fixed } = stageAiMove(ids, answer.move);
        if (staged > 0) reply += staged === 1 ? ' Tap Confirm to place it.' : ' Tap Confirm to place them.';
        else if (fixed === 0) reply += ' It is already there.';
      }
      pushAiMessage('assistant', reply);
      setAiPromptTargetSelection(null);
      setSelectedObjectIds([]);
      return;
    }

    if (answer) {
      pushAiMessage('assistant', answer.reply);
      // For desk gear, use what the AI pulled out of the request rather than the whole sentence
      applyAiStep(answer.step, answer.deskGear || msg, true);
      return;
    }

    // The AI could not be reached: match whole keywords instead, which only ever moves the story
    // forward, and say so plainly so a plain-looking answer is not mistaken for the AI's.
    const step = matchStepByKeywords(msg);
    const isStoryStep = step !== 'none' && step !== 'restart' && step !== 'fill_table';
    if (step === 'none') {
      pushAiMessage('assistant', `${offline}, and I didn’t recognise that. Try again shortly, or follow the steps below.`);
    } else if (isStoryStep && stepsToReach(scenarioState.currentStep, step).length === 0) {
      pushAiMessage('assistant', `${offline}, but that is already in the room.`);
    } else {
      pushAiMessage('assistant', `${offline}, so I made the closest change I know.`);
      applyAiStep(step, msg, true);
    }
  };

  // --- AI prompt ---
  // The AI button grows into the prompt bar. What it applies to is always shown: the piece being
  // edited, or the whole room. Suggestions change with that scope.
  const aiTargetNames = aiPromptTargetSelection?.names ?? selectedObjectIds.map((id) => getCleanObjectName(id));
  const aiSuggestions = aiTargetNames.length > 0
    ? ['Move it near the window', 'Face it toward the door', 'Move it to the middle']
    : roomSuggestions(scenarioState.currentStep);

  const openAiPrompt = () => {
    setIsAiPromptOpen(true);
    setIsAiSheetOpen(false);
    setIsAssetsOpen(false);
    setActiveTab('edit');
    setTimeout(() => promptInputRef.current?.focus(), 360);
  };

  const closeAiPrompt = () => {
    setIsAiPromptOpen(false);
    setAiPromptTargetSelection(null);
    promptInputRef.current?.blur();
  };

  const submitAiPrompt = (override?: string) => {
    const text = (override ?? aiPromptInput).trim();
    if (!text || isAiGenerating) return;
    setAiPromptInput('');
    if (aiPromptTargetAsset) {
      handleAiRefineAsset(aiPromptTargetAsset, text);
      setAiPromptTargetAsset(null);
    } else {
      handleCustomUserMessage(text);
    }
    setIsAiPromptOpen(false);
  };

  // The Restore Canvas pill only lingers for a moment; after that, restoring lives in the More menu
  useEffect(() => {
    if (!showRestorePill) return;
    const t = setTimeout(() => setShowRestorePill(false), 5000);
    return () => clearTimeout(t);
  }, [showRestorePill]);

  // The move hint fades on its own once the user has had time to read it
  const hintVisible = showDetectedSnackbar && currentScreen === 'editor' && !isDetectionPhase && !showStartFreshPopup;
  useEffect(() => {
    if (!hintVisible) return;
    const t = setTimeout(() => setShowDetectedSnackbar(false), 7000);
    return () => clearTimeout(t);
  }, [hintVisible]);

  const hasWireframes = stagedObjects.some((o) => o.isWireframe);

  return (
    <Box className="w-full h-[100dvh] min-h-[100dvh] bg-background text-foreground overflow-hidden relative font-sans">
      {/* 1. SCREEN: HOME */}
      {currentScreen === 'home' && (
        <HomeScreen
          items={library}
          onCreate={() => setCurrentScreen('scan')}
          onOpenSpace={handleOpenSpace}
        />
      )}

      {/* 2. SCREEN: SCAN */}
      {currentScreen === 'scan' && (
        <ScanScreen
          kind={captureKind}
          onChangeKind={(kind) => {
            setCaptureKind(kind);
            saveCaptureKind(kind);
          }}
          onBack={() => setCurrentScreen('home')}
          onScanCompleted={() => setCurrentScreen('preferences')}
        />
      )}

      {/* 3. SCREEN: PREFERENCES FLOW */}
      {currentScreen === 'preferences' && (
        <PreferencesFlow
          captureKind={captureKind}
          existingNames={library.map((i) => i.name)}
          onClose={() => setCurrentScreen('home')}
          onComplete={handleCompletePreferences}
        />
      )}

      {/* 4. SCREEN: 3D/2D SPATIAL EDITOR */}
      {currentScreen === 'editor' && (
        <Box className="h-full w-full relative overflow-hidden">
          {/* Top Bar with Home navigation, Confirm button, Layers list and More Options */}
          {!isUiHidden ? (
            <MobileTopBar
              roomName={currentRoomName}
              isGhostStateActive={scenarioState.ghostStateActive && !scenarioState.ghostStateCommitted}
              hasStagedWireframes={hasWireframes || pendingMoveCount > 0}
              stagedCount={stagedObjects.filter((o) => o.isWireframe).length + pendingMoveCount}
              onDiscardStaged={handleDiscardStaged}
              isConfirmingGlow={isConfirmingGlow}
              isDetectionPhase={isDetectionPhase}
              identificationStep={identificationStep}
              onCommitGhostState={handleCommitGhostState}
              onConfirmStagedWireframes={handleConfirmStaged}
              onGoHome={() => setCurrentScreen('home')}
              onOpenLayersList={() => setShowLayersModal(true)}
              onOpenOptionsMenu={() => setShowOptionsMenu(true)}
            />
          ) : (
            /* Floating Unhide UI Button in Top Right */
            <Box className="absolute top-top right-edge z-50 pointer-events-auto animate-in fade-in zoom-in-95">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsUiHidden(false);
                  showToast('UI restored');
                }}
                className={floatingPill}
                aria-label="Unhide UI"
              >
                <ButtonIcon as={Eye} />
                <ButtonText>Unhide UI</ButtonText>
              </Button>
            </Box>
          )}

          {/* Disappearing 8 Objects Detected Notification Snackbar */}
          {showDetectedSnackbar && !isDetectionPhase && !isUiHidden && !showStartFreshPopup && !isAssetsOpen && !isAiSheetOpen && !isAiPromptOpen && (
            <Box className="absolute bottom-[calc(var(--k-bottom)+var(--k-dock)+var(--k-row)+48px)] left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 w-[calc(100%-2*var(--k-edge))] max-w-sm">
              <HStack className={`px-3.5 py-2.5 rounded-2xl items-center justify-between gap-2.5 ${glass.panel}`}>
                <HStack className="items-center gap-2 min-w-0">
                  <Box className="w-2 h-2 rounded-full bg-primary/70 shrink-0" />
                  <Box className="min-w-0">
                    <Text size="xs" bold className="truncate">
                      {isRoomCleared ? 'Empty room · fixed items kept' : `${IDENTIFIED_MOVABLE_ASSETS.length} pieces you can move`}
                    </Text>
                    <Text size="2xs" className="text-muted-foreground truncate">
                      {isRoomCleared ? 'Add pieces from Assets' : 'Hold a piece and drag it. Confirm to place.'}
                    </Text>
                  </Box>
                </HStack>
                <Button variant="ghost" size="icon" onClick={() => setShowDetectedSnackbar(false)} className="rounded-full h-8 w-8 min-h-8 min-w-8 p-0 -mr-1" aria-label="Dismiss hint">
                  <ButtonIcon as={X} className="h-3.5 w-3.5" />
                </Button>
              </HStack>
            </Box>
          )}

          {/* Floating Controls (Undo/Redo pill, ghost brackets, side table shifter) */}
          {!isDetectionPhase && !isUiHidden && (
            <ScenarioFloatingControls
              canUndo={history.length > 0}
              canRedo={redoStack.length > 0}
              onUndo={handleUndo}
              onRedo={handleRedo}
              scenarioState={scenarioState}
              onConfirmBox={() => {
                if (scenarioState.currentStep === '3_two_options') {
                  handleAdvanceScenario('4_option2_selected');
                } else if (scenarioState.activeOverlayBox === 'bed') {
                  handleAdvanceScenario('2_table_privacy_concern');
                }
              }}
              onToggleTooltipAction={() => {
                if (scenarioState.currentStep === '2_table_privacy_concern') {
                  handleAdvanceScenario('3_two_options');
                }
              }}
              onShiftSideTable={handleShiftSideTable}
              isDraggingAsset={isDraggingAsset}
              dragTargetName={dragTargetName}
              objectCount={IDENTIFIED_CONSTRAINTS.length + IDENTIFIED_MOVABLE_ASSETS.length + stagedObjects.length}
            />
          )}

          {/* 3D Canvas Viewport */}
          <Box className="flex-1 h-full relative overflow-hidden min-h-0">
            <PanoramicViewer
              mode="baseline"
              lighting={lighting}
              objects={objects}
              selectedObject={selectedObject}
              onSelectObject={setSelectedObject}
              selectedObjectIds={selectedObjectIds}
              onSelectObjectIds={setSelectedObjectIds}
              onEditSelectedWithAi={handleEditSelectedWithAi}
              onSuggestArrangement={handleSuggestArrangement}
              pendingMoves={pendingMoves}
              onStageMove={handleStageMove}
              isConfirmingMoves={isConfirmingGlow}
              scenarioState={scenarioState}
              stagedObjects={stagedObjects}
              showDetectedOutlines={showDetectedOutlines}
              customPositions={customPositions}
              customRotations={customRotations}
              onUpdateObjectPosition={handleUpdateObjectPosition}
              onUpdateObjectRotation={handleUpdateObjectRotation}
              isRoomCleared={isRoomCleared}
              onFixedObjectSelected={(name) =>
                showToast(`${name} is fixed and can't be moved`)
              }
              onGenerateAiSuggestion={handleGenerateAiSuggestion}
              onRemoveStagedObject={handleRemoveStagedObject}
              onRemoveSceneObject={handleRemoveSceneObject}
              draggingAsset={dragAsset}
              apiRef={viewerApiRef}
              onNudgeStagedObject={handleNudgeStagedObject}
              isDetectionPhase={isDetectionPhase}
              identificationStep={identificationStep}
              onOpenAiEditAsset={(a) => {
                setAiPromptTargetAsset(a);
                setAiPromptInput('');
                setTimeout(() => {
                  promptInputRef.current?.focus();
                }, 80);
              }}
              detectionEdits={detectionEdits}
              userDetections={userDetections}
              removedTagIds={removedTags.map((t) => t.id)}
              onEditDetection={handleEditDetection}
              onResetDetection={handleResetDetection}
              onAddDetection={handleAddDetection}
              onRemoveTag={handleRemoveTag}
              onShiftSideTable={handleShiftSideTable}
              isUiHidden={isUiHidden}
              hideObjectTags={isAiSheetOpen || isAssetsOpen || isAiPromptOpen}
            />
          </Box>

          {/* AI Scenario Pop-Up Drawer (matching Assets Drawer) */}
          {isAiSheetOpen && !isUiHidden && (
            <AIScenarioSheet
              scenarioState={scenarioState}
              onAdvanceScenario={handleAdvanceScenario}
              onSelectOption={handleSelectOption}
              onProceedToFullGhost={handleProceedToFullGhost}
              onSelectPalette={handleSelectPalette}
              onCustomUserMessage={handleCustomUserMessage}
              messages={aiMessages}
              repliesOnly={aiRepliesOnly}
              onToggleMoodItem={handleToggleMoodItem}
              onFillTableWithAi={handleFillTableWithAi}
              onShiftSideTable={handleShiftSideTable}
              onOpenAssetsDrawer={() => {
                setIsAiSheetOpen(false);
                setIsAssetsOpen(true);
                setActiveTab('assets');
              }}
              isAiGenerating={isAiGenerating}
              onClose={() => {
                setIsAiSheetOpen(false);
                if (activeTab === 'ai') setActiveTab('edit');
              }}
            />
          )}

          {/* Assets Drawer */}
          <AssetsDrawer
            isOpen={isAssetsOpen && !isUiHidden}
            onClose={() => {
              setIsAssetsOpen(false);
              if (activeTab === 'assets') setActiveTab('edit');
            }}
            onSelectAsset={handleSelectAsset}
            onStartDragAsset={handleStartDragAsset}
            onDropAsset={handleDropAsset}
            onOpenAiAssistant={() => {
              setIsAssetsOpen(false);
              openGuide();
            }}
          />

          {/* Identification Flow Bottom Navigation & Step Indicator */}
          {isDetectionPhase && !aiPromptTargetAsset && !isUiHidden && (
            <VStack className="fixed inset-x-0 bottom-bottom z-40 px-edge pointer-events-none items-center gap-gap animate-in fade-in slide-in-from-bottom-2">
              {/* What this step is asking, always on screen (was a 2-dot indicator plus a passing toast) */}
              <VStack
                key={identificationStep}
                className={`w-full max-w-[19rem] px-4 py-3 rounded-2xl gap-1 animate-in fade-in slide-in-from-bottom-2 ${glass.clear}`}
                role="status"
              >
                <HStack className="items-center justify-between gap-3">
                  <Text size="sm" bold>
                    {identificationStep === 'constraints' ? 'What stays put' : 'What can move'}
                  </Text>
                  <HStack className="items-center gap-1.5" aria-label={`Step ${identificationStep === 'constraints' ? 1 : 2} of 2`}>
                    <Box className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${identificationStep === 'constraints' ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
                    <Box className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${identificationStep === 'assets' ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
                  </HStack>
                </HStack>
                <Text size="xs" className="text-white/80">
                  {identificationStep === 'constraints'
                    ? `We found ${IDENTIFIED_CONSTRAINTS.length} fixed items: doors, windows, plugs, built-ins. Fix any tag that's wrong.`
                    : `We found ${IDENTIFIED_MOVABLE_ASSETS.length} pieces you can rearrange. Fix any tag that's wrong.`}
                </Text>
              </VStack>

              {/* Actions: Step 1 (Skip on left, Next on right) vs Step 2 (Back on left, Next on right) */}
              <HStack className="pointer-events-auto items-center gap-2.5">
                {identificationStep === 'constraints' ? (
                  <>
                    <Button variant="ghost" onClick={handleSkipIdentification} className={`${floatingPill} w-36`}>
                      <ButtonText>Skip</ButtonText>
                    </Button>
                    <Button onClick={handleAdvanceIdentification} className="rounded-full h-[var(--k-ctl)] w-36">
                      <ButtonText>Next</ButtonText>
                      <ButtonIcon as={ChevronRight} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => setIdentificationStep('constraints')} className={`${floatingPill} w-36`}>
                      <ButtonIcon as={ChevronLeft} />
                      <ButtonText>Back</ButtonText>
                    </Button>
                    <Button onClick={handleAdvanceIdentification} className="rounded-full h-[var(--k-ctl)] w-36">
                      <ButtonText>Next</ButtonText>
                      <ButtonIcon as={ChevronRight} />
                    </Button>
                  </>
                )}
              </HStack>
            </VStack>
          )}

          {/* Start Fresh / Clear Room Pop-Up */}
          {showStartFreshPopup && (
            <HStack className="fixed inset-x-0 bottom-bottom z-50 px-edge pointer-events-none justify-center animate-in slide-in-from-bottom">
              <VStack className={`pointer-events-auto w-full max-w-sm p-edge rounded-3xl gap-4 ${glass.dialog}`}>
                <HStack className="items-center justify-between">
                  <HStack className="items-center gap-2.5">
                    <Center className="w-8 h-8 rounded-full bg-secondary">
                      <Icon as={RotateCcw} size="sm" />
                    </Center>
                    <Heading size="sm">Start from an empty room?</Heading>
                  </HStack>
                  <Button variant="ghost" size="icon" onClick={() => setShowStartFreshPopup(false)} className="rounded-full h-9 w-9 min-h-9 min-w-9 p-0" aria-label="Close">
                    <ButtonIcon as={X} className="h-4 w-4" />
                  </Button>
                </HStack>

                <Text size="xs" className="text-muted-foreground leading-relaxed">
                  Clearing hides your movable furniture so you can plan freely. The door, windows, wardrobe, AC and plugs stay. You can restore the room any time.
                </Text>

                {/* Safe choice is the filled one: the test is about moving what's already there */}
                <HStack className="items-center gap-2 pt-1">
                  <Button variant="outline" onClick={handleClearRoom} className="flex-1 rounded-full h-[var(--k-ctl)]">
                    <ButtonIcon as={Eraser} />
                    <ButtonText>Clear room</ButtonText>
                  </Button>
                  <Button onClick={() => setShowStartFreshPopup(false)} className="flex-1 rounded-full h-[var(--k-ctl)]">
                    <ButtonText>Keep furniture</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          )}

          {/* 2-Second AI Working Overlay */}
          {isAiWorkingOverlay && (
            <Center className={`fixed inset-0 z-50 p-6 animate-in fade-in select-none dark ${glass.scrim}`}>
              <VStack className="w-full max-w-sm items-center gap-4">
                <Center className={`w-16 h-16 rounded-full shadow-hard-2 ${glass.clear}`}>
                  <Icon as={Sparkles} className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
                </Center>
                <VStack className="items-center gap-1">
                  <Heading size="md">Arranging your room…</Heading>
                  <Text size="xs" className="text-muted-foreground max-w-xs text-center">
                    Balancing daylight flow, wardrobe accessibility & social gathering clearances
                  </Text>
                </VStack>
                <Progress value={100} className="w-48 h-1.5 mt-1">
                  <ProgressFilledTrack className="animate-pulse" />
                </Progress>
              </VStack>
            </Center>
          )}

          {/* Refining a detected piece during identification: the same prompt, above the step buttons */}
          {aiPromptTargetAsset && !isUiHidden && (
            <Box
              style={{
                bottom: keyboardOffset > 0 ? keyboardOffset + 12 : 'calc(var(--k-bottom) + var(--k-ctl) + 76px)',
                transition: 'bottom 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="fixed inset-x-0 z-40 px-edge pointer-events-none animate-in fade-in slide-in-from-bottom-2"
            >
              <VStack className="w-full max-w-[430px] mx-auto gap-3">
                <Box className="pointer-events-auto">
                  <AiPromptContext
                    targets={[aiPromptTargetAsset.name]}
                    onRemoveTarget={() => setAiPromptTargetAsset(null)}
                    suggestions={[]}
                    onSuggest={() => {}}
                    onClose={() => setAiPromptTargetAsset(null)}
                  />
                </Box>
                <Box className={`pointer-events-auto h-16 rounded-full ${glass.clear}`}>
                  <AiPromptForm
                    value={aiPromptInput}
                    onChange={setAiPromptInput}
                    onSubmit={() => submitAiPrompt()}
                    placeholder={`Ask AI to edit ${aiPromptTargetAsset.name}…`}
                    busy={isAiGenerating}
                    inputRef={promptInputRef}
                    onClose={() => setAiPromptTargetAsset(null)}
                  />
                </Box>
              </VStack>
            </Box>
          )}

          {/* Clear Canvas: sits just above the nav while editing */}
          {!isDetectionPhase && activeTab === 'edit' && !isDraggingAsset && !isUiHidden && (!isRoomCleared || showRestorePill) && !isAiPromptOpen && !aiPromptTargetAsset && keyboardOffset === 0 && !showStartFreshPopup && (
            <HStack
              className="fixed inset-x-0 z-30 justify-center pointer-events-none"
              style={{ bottom: 'calc(var(--k-bottom) + var(--k-dock) + var(--k-row))' }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={isRoomCleared ? handleRestoreRoom : () => setShowStartFreshPopup(true)}
                className={`pointer-events-auto h-9 rounded-full animate-in fade-in ${glass.clear}`}
              >
                <ButtonIcon as={isRoomCleared ? RotateCcw : Eraser} />
                <ButtonText>{isRoomCleared ? 'Restore room' : 'Clear room'}</ButtonText>
              </Button>
            </HStack>
          )}

          {/* Bottom dock: modes on the left, AI on the right (which grows into the prompt bar) */}
          {!isDetectionPhase && !isDraggingAsset && !isUiHidden && (
            <Box
              style={{
                opacity: keyboardOffset > 0 && !isAiPromptOpen ? 0 : 1,
                pointerEvents: keyboardOffset > 0 && !isAiPromptOpen ? 'none' : 'auto',
                transition: 'opacity 0.15s ease'
              }}
            >
              <MobileBottomNav
                activeTab={activeTab}
                keyboardOffset={keyboardOffset}
                onSelectTab={(tab) => {
                  setIsAiPromptOpen(false);
                  setActiveTab(tab);
                  if (tab === 'assets') {
                    setIsAssetsOpen(true);
                    setIsAiSheetOpen(false);
                  } else if (tab === 'ai') {
                    openGuide();
                    setIsAssetsOpen(false);
                  } else {
                    setIsAssetsOpen(false);
                    setIsAiSheetOpen(false);
                  }
                }}
                ai={{
                  open: isAiPromptOpen,
                  busy: isAiGenerating,
                  onOpen: openAiPrompt,
                  context: (
                    <AiPromptContext
                      targets={aiTargetNames}
                      onRemoveTarget={(i) => {
                        const ids = (aiPromptTargetSelection?.ids ?? selectedObjectIds).filter((_, idx) => idx !== i);
                        setSelectedObjectIds(ids);
                        setAiPromptTargetSelection(ids.length ? { ids, names: ids.map((id) => getCleanObjectName(id)) } : null);
                      }}
                      suggestions={aiSuggestions}
                      onSuggest={(text) => submitAiPrompt(text)}
                      onOpenWalkthrough={() => {
                        closeAiPrompt();
                        openGuide();
                      }}
                      onClose={closeAiPrompt}
                      active={isAiPromptOpen}
                    />
                  ),
                  form: (
                    <AiPromptForm
                      value={aiPromptInput}
                      onChange={setAiPromptInput}
                      onSubmit={() => submitAiPrompt()}
                      placeholder={aiTargetNames.length > 0 ? `Ask AI to edit ${aiTargetNames.join(' & ')}…` : 'Ask AI to change the room…'}
                      busy={isAiGenerating}
                      inputRef={promptInputRef}
                      onClose={closeAiPrompt}
                      active={isAiPromptOpen}
                    />
                  ),
                }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* One slot for every transient notice, so none can sit on top of another */}
      <VStack className="absolute inset-x-0 top-[calc(var(--k-top)+var(--k-ctl)+var(--k-gap))] z-50 px-edge items-center gap-2 pointer-events-none">
        {toast && (
          <HStack className={`max-w-[calc(100vw-2*(var(--k-edge)+var(--k-ctl)+8px))] min-h-10 py-2 pl-3.5 pr-4 rounded-[20px] items-center gap-2 animate-in fade-in slide-in-from-top-2 ${glass.clear}`}>
            <Icon as={CheckCircle2} size="xs" className="shrink-0" />
            <Text size="xs" className="leading-snug">{toast}</Text>
          </HStack>
        )}
        {removedTagsNotice && removedTags.length > 0 && currentScreen === 'editor' && isDetectionPhase && !isUiHidden && (
          <Button variant="ghost" size="sm" onClick={handleUndoRemoveTag} className={`pointer-events-auto max-w-full h-10 rounded-full animate-in fade-in slide-in-from-top-2 ${glass.clear}`}>
            <ButtonIcon as={RotateCcw} />
            <ButtonText className="truncate">{removedTags[removedTags.length - 1].name} tag removed · Undo</ButtonText>
          </Button>
        )}
      </VStack>

      {/* Options Menu Modal */}
      <Modal isOpen={showOptionsMenu} onClose={() => setShowOptionsMenu(false)} size="sm" title="Room options">
        <ModalBackdrop className={glass.scrim} />
        <ModalContent className={`rounded-3xl ${glass.dialog}`}>
          <ModalHeader className="pb-2 border-b border-border">
            <Heading size="sm">Room options</Heading>
            <ModalCloseButton>
              <Icon as={X} size="sm" />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack space="sm">
              <OptionRow
                icon={isUiHidden ? Eye : EyeOff}
                title={isUiHidden ? 'Show controls' : 'Hide controls'}
                detail={isUiHidden ? 'Bring back the bars and buttons' : 'See just the room'}
                onPress={() => {
                  setIsUiHidden(!isUiHidden);
                  setShowOptionsMenu(false);
                  showToast(!isUiHidden ? 'Controls hidden' : 'Controls back');
                }}
              />

              <OptionRow
                icon={Sun}
                title="Change lighting"
                detail={LIGHTING_LABEL[lighting.preset]}
                onPress={() => {
                  const presets: Array<LightingSetting['preset']> = [
                    'natural_daylight',
                    'warm_evening',
                    'focus_day'
                  ];
                  const nextP = presets[(presets.indexOf(lighting.preset) + 1) % presets.length];
                  setLighting({
                    preset: nextP,
                    colorTempK: nextP === 'warm_evening' ? 2700 : nextP === 'focus_day' ? 5200 : 4500,
                    intensity: 1.0
                  });
                  showToast(`Lighting: ${LIGHTING_LABEL[nextP]}`);
                }}
              />

              <OptionRow
                icon={Layers}
                title="Objects and fixed items"
                onPress={() => {
                  setShowOptionsMenu(false);
                  setShowLayersModal(true);
                }}
              />

              {/* Clearing goes through the same question as everywhere else; restoring is safe, so it's direct */}
              <OptionRow
                icon={isRoomCleared ? RotateCcw : Eraser}
                title={isRoomCleared ? 'Restore room' : 'Clear room'}
                detail={isRoomCleared ? 'Bring back the furniture from your scan' : 'Hide movable furniture, keep fixed items'}
                onPress={() => {
                  setShowOptionsMenu(false);
                  if (isRoomCleared) handleRestoreRoom();
                  else setShowStartFreshPopup(true);
                }}
              />

              <OptionRow
                icon={Rotate3d}
                title="Scan a new room"
                onPress={() => {
                  setCurrentScreen('scan');
                  setShowOptionsMenu(false);
                }}
              />

              <OptionRow
                icon={ListRestart}
                title="Start the scenario over"
                detail="Back to the room as scanned. Undo brings your changes back."
                onPress={() => {
                  setShowOptionsMenu(false);
                  // Kept on the undo stack, so this is recoverable instead of needing a confirm dialog
                  setHistory((h) => [...h, scenarioState]);
                  setRedoStack([]);
                  setScenarioState(INITIAL_SCENARIO_STATE);
                  setStagedObjects([]);
                  setPendingMoves({});
                  showToast('Started over · Undo to go back');
                }}
              />
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Objects & Layers Modal */}
      <Modal isOpen={showLayersModal} onClose={() => setShowLayersModal(false)} size="sm" title="Objects and fixed items">
        <ModalBackdrop className={glass.scrim} />
        <ModalContent className={`rounded-3xl max-h-[80vh] ${glass.dialog}`}>
          <ModalHeader className="pb-2 border-b border-border">
            <HStack className="items-center gap-2">
              <Icon as={Layers} size="sm" />
              <Heading size="sm">Objects and fixed items ({objects.length + stagedObjects.length})</Heading>
            </HStack>
            <ModalCloseButton>
              <Icon as={X} size="sm" />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack space="sm">
              {stagedObjects.map((sObj) => (
                <HStack key={sObj.id} className="p-2.5 rounded-xl border border-border bg-secondary items-center justify-between">
                  <HStack className="items-center gap-2">
                    <Box className={`w-2 h-2 rounded-full ${sObj.isWireframe ? 'bg-sky-400 animate-ping' : 'bg-emerald-400'}`} />
                    <Text size="xs" bold>{sObj.name}</Text>
                  </HStack>
                  <Text size="2xs" className="text-muted-foreground">{sObj.isWireframe ? 'Waiting to place' : 'Placed'}</Text>
                </HStack>
              ))}

              {objects.map((obj) => (
                <Pressable
                  key={obj.id}
                  onClick={() => {
                    setSelectedObject(obj);
                    setShowLayersModal(false);
                    showToast(`Inspecting ${obj.name}`);
                  }}
                  className={`p-2.5 rounded-xl flex-row items-center justify-between ${selectedObject?.id === obj.id ? 'bg-primary' : 'bg-secondary'}`}
                >
                  <Text size="xs" className={`font-medium truncate max-w-[200px] ${selectedObject?.id === obj.id ? 'text-primary-foreground' : ''}`}>{obj.name}</Text>
                  <Text size="2xs" className={`capitalize ${selectedObject?.id === obj.id ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{obj.category}</Text>
                </Pressable>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

const LIGHTING_LABEL: Record<LightingSetting['preset'], string> = {
  natural_daylight: 'Daylight',
  warm_evening: 'Warm evening',
  focus_day: 'Bright focus',
  twilight_ambient: 'Twilight',
  golden_hour: 'Golden hour',
};

/** A row in the options menu */
const OptionRow: React.FC<{
  icon: LucideIcon;
  title: string;
  detail?: string;
  badge?: string;
  destructive?: boolean;
  onPress: () => void;
}> = ({ icon, title, detail, badge, destructive, onPress }) => (
  <Button
    variant={destructive ? 'destructive' : 'secondary'}
    onClick={onPress}
    className="w-full min-h-[var(--k-ctl)] h-auto px-5 py-2 rounded-full justify-between"
  >
    <HStack className="items-center gap-3 flex-1 min-w-0">
      <ButtonIcon as={icon} />
      <Box className="min-w-0">
        <ButtonText>{title}</ButtonText>
        {detail && <Text size="2xs" className="text-muted-foreground whitespace-normal">{detail}</Text>}
      </Box>
    </HStack>
    {badge && (
      <Badge variant="outline">
        <BadgeText>{badge}</BadgeText>
      </Badge>
    )}
  </Button>
);
