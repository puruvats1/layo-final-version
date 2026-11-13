import { createTV, type VariantProps } from 'tailwind-variants/config';
import { twMerge } from 'tailwind-merge';

/**
 * Variant helper for every UI component. tailwind-merge needs to know Layo's custom font sizes
 * (text-2xs, text-xs … are sizes, not colours) or it would drop one of `text-xs text-foreground`.
 */
export const tv = createTV({
  twMergeConfig: {
    extend: { theme: { text: ['2xs'], radius: ['field', 'card', 'sheet'], spacing: ['pad-sheet', 'pad-card'] } },
  },
});

export type { VariantProps };

/** Merge class names, later ones win. For one-off className composition. */
export const cn = (...classes: Array<string | false | null | undefined>) => twMerge(classes.filter(Boolean).join(' '));
