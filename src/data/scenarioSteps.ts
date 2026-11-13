import { ScenarioState, ScenarioStepId } from '../types';

/*
 * The scripted editing scenario as plain data and pure functions: no React, no toasts.
 * App.tsx applies these; the AI proxy (api/_lib/gemini.ts) mirrors SCENARIO_ORDER to decide which
 * changes are legal from where the room is now.
 */

export const INITIAL_SCENARIO_STATE: ScenarioState = {
  currentStep: '1_bed_fixed',
  bedPlaced: true,
  tablePosition: 'east',
  hasSeparator: false,
  ghostStateActive: false,
  ghostStateCommitted: false,
  sideTableHidingPlug: false,
  dressingTablePlaced: true,
  fanPlaced: true,
  hasVerticalStorage: false,
  hasStorageLamp: false,
  hasPlant: false,
  hasCarpet: false,
  hasStorageBoxes: true,
  hasFoldingChair: false,
  palette: 'warm_studio',
  activeOverlayBox: null,
  boxTooltipMode: null,
  removedAssetIds: []
};

/** The story only moves forward; this is its order. */
export const SCENARIO_ORDER: ScenarioStepId[] = [
  '1_bed_fixed',
  '2_table_privacy_concern',
  '3_two_options',
  '4_option2_selected',
  '5_ghost_state',
  '6_side_table_moved',
  '7_fan_added',
  '8_personalization',
  '9_color_palette',
  '10_final_space'
];

export const stepIndex = (step: ScenarioStepId): number => SCENARIO_ORDER.indexOf(step);

/** Toast shown when a step is applied (steps not listed stay quiet) */
export const SCENARIO_STEP_TOASTS: Partial<Record<ScenarioStepId, string>> = {
  '2_table_privacy_concern': 'Desk placed near the big south window',
  '4_option2_selected': 'Room separator added',
  '5_ghost_state': 'AI added the remaining pieces',
  '6_side_table_moved': 'Side table moved to hide the plug',
  '7_fan_added': 'Fan added near the window',
  '8_personalization': 'Cozy touches added',
  '10_final_space': 'Folding chair added'
};

/**
 * Things worth asking, each only until the room already has it, so a tap never answers
 * "that is already there". Three at most; when everything is done, the one useful thing left.
 */
const ROOM_SUGGESTIONS: { text: string; before: ScenarioStepId }[] = [
  { text: 'Fix my desk', before: '4_option2_selected' },
  { text: 'Hide the plug', before: '6_side_table_moved' },
  { text: 'Add airflow', before: '7_fan_added' },
  { text: 'Make it cozy', before: '8_personalization' },
  { text: 'Seat guests', before: '10_final_space' }
];

export const roomSuggestions = (current: ScenarioStepId): string[] => {
  const left = ROOM_SUGGESTIONS.filter((s) => stepIndex(current) < stepIndex(s.before)).map((s) => s.text);
  return left.length ? left.slice(0, 3) : ['Start over'];
};

/** What the room looks like after `step`, given what it looked like before */
export const applyScenarioStep = (prev: ScenarioState, step: ScenarioStepId): ScenarioState => {
  switch (step) {
    case '1_bed_fixed':
      return { ...INITIAL_SCENARIO_STATE };

    case '2_table_privacy_concern':
      return { ...prev, currentStep: step, tablePosition: 'window', activeOverlayBox: 'table', boxTooltipMode: 'edit_minus' };

    case '3_two_options':
      return { ...prev, currentStep: step, boxTooltipMode: 'confirm' };

    case '4_option2_selected':
      return {
        ...prev,
        currentStep: step,
        tablePosition: 'window',
        hasSeparator: true,
        dressingTablePlaced: false,
        sideTableHidingPlug: false,
        fanPlaced: false,
        activeOverlayBox: null,
        boxTooltipMode: null
      };

    case '5_ghost_state':
      return {
        ...prev,
        currentStep: step,
        ghostStateActive: true,
        ghostStateCommitted: false,
        dressingTablePlaced: true,
        sideTableHidingPlug: false,
        fanPlaced: false,
        activeOverlayBox: 'sidetable'
      };

    case '6_side_table_moved':
      return {
        ...prev,
        currentStep: step,
        ghostStateActive: false,
        ghostStateCommitted: true,
        sideTableHidingPlug: true,
        dressingTablePlaced: true,
        fanPlaced: false,
        activeOverlayBox: null
      };

    case '7_fan_added':
      return { ...prev, currentStep: step, fanPlaced: true, activeOverlayBox: 'fan' };

    case '8_personalization':
      return {
        ...prev,
        currentStep: step,
        hasVerticalStorage: true,
        hasStorageLamp: true,
        hasPlant: true,
        hasCarpet: true,
        hasStorageBoxes: true,
        activeOverlayBox: null
      };

    case '9_color_palette':
      return { ...prev, currentStep: step };

    case '10_final_space':
      return { ...prev, currentStep: step, hasFoldingChair: true, activeOverlayBox: null };

    default:
      return { ...prev, currentStep: step };
  }
};

/**
 * The steps to pass through to reach `target` from `current`, in order, ending with `target`.
 * Empty when `target` is not ahead of `current`: the story does not run backwards, because later
 * steps leave things behind that earlier ones do not clean up.
 */
export const stepsToReach = (current: ScenarioStepId, target: ScenarioStepId): ScenarioStepId[] => {
  const from = stepIndex(current);
  const to = stepIndex(target);
  if (from < 0 || to <= from) return [];
  return SCENARIO_ORDER.slice(from + 1, to + 1);
};

/** Reach `target` by playing every step between, as a single change (so one Undo takes it back) */
export const applyScenarioChain = (prev: ScenarioState, target: ScenarioStepId): ScenarioState =>
  stepsToReach(prev.currentStep, target).reduce(applyScenarioStep, prev);

/** A compact, plain-facts view of the room that is sent to the AI so its replies match reality */
export interface SceneSummary {
  currentStep: ScenarioStepId;
  desk: ScenarioState['tablePosition'];
  bed: boolean;
  roomDivider: boolean;
  sideTableHidingPlug: boolean;
  dressingTable: boolean;
  pedestalFan: boolean;
  verticalStorage: boolean;
  storageLamp: boolean;
  plant: boolean;
  rug: boolean;
  foldingChair: boolean;
  deskStyled: boolean;
  palette: ScenarioState['palette'];
}

export const summarizeScene = (s: ScenarioState): SceneSummary => ({
  currentStep: s.currentStep,
  desk: s.tablePosition,
  bed: s.bedPlaced,
  roomDivider: s.hasSeparator,
  sideTableHidingPlug: s.sideTableHidingPlug,
  dressingTable: s.dressingTablePlaced,
  pedestalFan: s.fanPlaced,
  verticalStorage: s.hasVerticalStorage,
  storageLamp: s.hasStorageLamp,
  plant: s.hasPlant,
  rug: s.hasCarpet,
  foldingChair: s.hasFoldingChair,
  deskStyled: !!s.tableFilledWithAi,
  palette: s.palette
});
