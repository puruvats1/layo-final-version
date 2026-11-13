import { IDENTIFIED_CONSTRAINTS, IDENTIFIED_MOVABLE_ASSETS } from './identificationData';

/** One kind of object the user can label a detection as, with its real-world size. */
export interface DetectionLabel {
  name: string;
  /** [x, y, z] in metres, as catalogued */
  dims: [number, number, number];
}

const unique = (items: { name: string; dimensions: [number, number, number] }[]): DetectionLabel[] => {
  const seen = new Map<string, DetectionLabel>();
  items.forEach((i) => {
    if (!seen.has(i.name)) seen.set(i.name, { name: i.name, dims: i.dimensions });
  });
  return [...seen.values()];
};

/** Step 1 labels fixed fixtures; step 2 labels furniture. A wrong label is fixed within its step. */
export const DETECTION_LABELS: Record<'constraints' | 'assets', DetectionLabel[]> = {
  constraints: unique(IDENTIFIED_CONSTRAINTS),
  assets: unique(IDENTIFIED_MOVABLE_ASSETS),
};
