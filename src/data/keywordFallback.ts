import type { AiStep } from '../utils/askGemini';

/*
 * Offline fallback for the AI prompt: used only when Gemini cannot be reached. It matches whole
 * words (so "plant" is not "plan", "chair" is not "air", "comfortable" is not "table") and checks
 * the specific things before the general ones (so "side table" is the plug point, not the desk).
 * First matching rule wins; no match means "none".
 */
const RULES: { step: AiStep; words: RegExp }[] = [
  { step: 'restart', words: /\b(start (over|again)|restart|replay|reset|begin again)\b/ },
  { step: 'fill_table', words: /\b(monitors?|keyboards?|desk pads?|studio gear|fill (the )?(table|desk))\b/ },
  { step: '4_option2_selected', words: /\b(separators?|room dividers?|dividers?|option (2|two))\b/ },
  { step: '3_two_options', words: /\b(options?|suggest(ions?)?|privacy|private)\b/ },
  { step: '6_side_table_moved', words: /\b(plugs?( points?)?|sockets?|outlets?|side tables?|hide the plug)\b/ },
  { step: '7_fan_added', words: /\b(fans?|air|airflow|ventilation|circulation|stuffy|breeze)\b/ },
  { step: '8_personalization', words: /\b(cozy|cosy|vibe|personal(i[sz]e)?|carpets?|rugs?|storage|plants?|lamps?|studio)\b/ },
  { step: '9_color_palette', words: /\b(colou?rs?|palette|warm|pastel|curtains?|bedsheets?)\b/ },
  { step: '10_final_space', words: /\b(chairs?|gathering|social|folding|party|guests?|seating)\b/ },
  { step: '2_table_privacy_concern', words: /\b(tables?|desks?|windows?|natural light|daylight)\b/ },
  { step: '5_ghost_state', words: /\b(plan|other elements|ghost|wardrobe|yes)\b/ },
];

export const matchStepByKeywords = (text: string): AiStep => {
  const lower = text.toLowerCase();
  return RULES.find((r) => r.words.test(lower))?.step ?? 'none';
};
