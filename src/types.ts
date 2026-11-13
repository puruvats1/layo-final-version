export type RoomModeId = 'baseline' | 'work_mode' | 'reading_evening' | 'creative_adaptive';

export type IdentificationStep = 'constraints' | 'assets' | 'completed';

export type SurfaceType = 'floor' | 'wall' | 'ceiling' | 'shelf' | 'desk' | 'beside_object';

export interface RoomObject {
  id: string;
  name: string;
  category: 'furniture' | 'lighting' | 'storage' | 'decor' | 'architectural';
  surface: SurfaceType;
  yaw: number; // -180 to 180 degrees (longitude)
  pitch: number; // -90 to 90 degrees (latitude)
  distance?: number;
  tags?: string[];
  dimensions?: string;
  reversibility: 'high' | 'medium' | 'low';
  description?: string;
}

export interface TradeOff {
  id: string;
  type: 'gain' | 'compromise' | 'consideration';
  title: string;
  description: string;
  prioritySupported?: string;
  yaw: number;
  pitch: number;
}

export interface FeasibilityCheck {
  id: string;
  label: string;
  status: 'passed' | 'warning' | 'info';
  detail: string;
  measurementGuide?: string;
}

export interface ImplementationStep {
  id: string;
  task: string;
  effortMinutes: number;
  reversible: boolean;
  completed?: boolean;
}

export interface RoomAlternative {
  id: string;
  title: string;
  shortDescription: string;
  roomModeId: RoomModeId;
  highlights: string[];
  whatMoves: string[];
  whatStays: string[];
  whatIsGained: string[];
  whatIsCompromised: string[];
  prioritySupported: string;
  effortLevel: 'Low' | 'Medium' | 'High';
  reversibility: 'Immediate' | 'Moderate' | 'High Effort';
  estimatedMinutes: number;
  tradeOffs: TradeOff[];
  feasibilityChecks: FeasibilityCheck[];
  implementationSteps: ImplementationStep[];
  customTextureId?: string;
}

export interface Scenario {
  id: string;
  title: string;
  persona: string;
  personaQuote: string;
  startingState: string;
  trigger: string;
  problem: string;
  goal: string;
  suggestedPrompt: string;
  alternatives: RoomAlternative[];
}

export interface SpatialAnnotation {
  id: string;
  yaw: number;
  pitch: number;
  author: string;
  text: string;
  category: 'physical_test' | 'lighting_note' | 'activity_fit' | 'question';
  timestamp: string;
}

export interface UserPriorities {
  openFloor: number; // 1 to 5
  workFocus: number;
  visualCalm: number;
  storage: number;
  hosting: number;
  selfExpression: number;
  easyAdaptability: number;
  currentPainPoint: string;
  primaryRoutine: string;
}

export interface LightingSetting {
  preset: 'natural_daylight' | 'warm_evening' | 'focus_day' | 'twilight_ambient' | 'golden_hour';
  colorTempK: number; // 2200 to 6500
  intensity: number; // 0.2 to 1.5
  accentHue?: string;
}

export type ScenarioStepId =
  | '1_bed_fixed'
  | '2_table_privacy_concern'
  | '3_two_options'
  | '4_option2_selected'
  | '5_ghost_state'
  | '6_side_table_moved'
  | '7_fan_added'
  | '8_personalization'
  | '9_color_palette'
  | '10_final_space';

export interface RoomPalette {
  id: 'warm_studio' | 'cool_pastel';
  name: string;
  colors: [string, string, string]; // [primary, secondary, accent]
  bedsheetStyle: 'paisley_terracotta' | 'geometric_pastel';
  curtainColor: string;
  rugStyle: 'warm_boho' | 'cool_nordic';
}

export interface ScenarioState {
  currentStep: ScenarioStepId;
  bedPlaced: boolean;
  tablePosition: 'window' | 'east' | 'window_ac' | 'top_left' | null;
  activeOption?: 1 | 2;
  hasSeparator: boolean;
  ghostStateActive: boolean;
  ghostStateCommitted: boolean;
  sideTableHidingPlug: boolean;
  dressingTablePlaced: boolean;
  fanPlaced: boolean;
  hasVerticalStorage: boolean;
  hasStorageLamp: boolean;
  hasPlant: boolean;
  hasCarpet: boolean;
  hasStorageBoxes: boolean;
  hasFoldingChair: boolean;
  palette: 'warm_studio' | 'cool_pastel';
  activeOverlayBox: 'bed' | 'table' | 'fan' | 'sidetable' | null;
  boxTooltipMode: 'edit_minus' | 'confirm' | null;
  removedAssetIds?: string[];
  tableFilledWithAi?: boolean;
  tableDescription?: string;
}

export interface StagedObject {
  id: string;
  name: string;
  type: string;
  position: [number, number, number]; // [x, y, z]
  isWireframe: boolean;
  isGlowing: boolean;
  dimensions?: [number, number, number];
}

/** A direction from the viewer's eye, as a unit vector [x, y, z]. */
export type Vec3 = [number, number, number];

/**
 * A detected object's outline on the 360° image: directions from the viewer, in order around the
 * shape. Directions (not angles) so shapes stay attached to the image, including across the seam.
 */
export type DetectionShape = Vec3[];

/** What the user changed about an automatic or drawn detection. */
export interface DetectionEdit {
  points?: DetectionShape;
  label?: string;
}

/** A detection the user drew because the AI missed it. */
export interface UserDetection {
  id: string;
  step: 'constraints' | 'assets';
  label: string;
  points: DetectionShape;
}

/** Project = full 360° scan of a room. Zone = a single photo of one area. */
export type CaptureKind = 'project' | 'zone';

/** One piece of inspiration added in onboarding step 1. */
export interface MoodItem {
  id: string;
  source: 'preset' | 'gallery' | 'pinterest';
  title: string;
  /** CSS backgrounds for a swatch collage (presets, pins) */
  tiles?: string[];
  /** Photo (gallery) */
  imageUrl?: string;
  /** CSS object-position for the photo */
  imagePosition?: string;
}

export interface UserPreferences {
  roomName: string;
  captureKind: CaptureKind;
  moodItems: MoodItem[];
  vision: 'redesign' | 'refine';
  roomType: string;
  description: string;
  activities: string[];
  priorities: string[];
}

export interface DetectedBaselineObject {
  id: string;
  name: string;
  position: [number, number, number];
  dimensions: [number, number, number];
  category: 'furniture' | 'fixture' | 'architectural';
  notes?: string;
}

