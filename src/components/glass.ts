/*
 * Glassmorphism, layered on the UI components through className.
 * `dark` switches the colour tokens inside the surface, so stock variants
 * (ghost, outline, secondary, text-foreground…) read as light-on-glass.
 */
export const glass = {
  /** Clear glass floating over the room: buttons, bars, tags */
  clear: 'dark k-glass',
  /** Dark frosted glass: sheets, drawers, popovers */
  panel: 'dark k-panel',
  /** Denser frosted glass: dialogs */
  dialog: 'dark k-panel k-panel-strong',
  /** Blurred backdrop behind dialogs */
  scrim: 'k-scrim',
} as const;

/**
 * The proposed light glass (frosted white, dark text). Contrast holds on any backdrop. Shown on /styleguide;
 * not used by the app yet.
 */
export const glassLt = {
  clear: 'k-glass-lt',
  panel: 'k-panel-lt',
  scrim: 'k-scrim-lt',
} as const;

/** Dark smoked glass with light text: everything that floats over the room in the editor. */
export const glassDk = {
  clear: 'k-glass-dk',
  panel: 'k-panel-dk',
  scrim: 'k-scrim-dk',
} as const;

/** Round floating control over the canvas (the editor's floating button concept) */
export const floatingIconButton = `${glass.clear} rounded-full h-[var(--k-ctl)] w-[var(--k-ctl)] px-0`;
/** Pill floating control over the canvas */
export const floatingPill = `${glass.clear} rounded-full h-[var(--k-ctl)] px-5`;
