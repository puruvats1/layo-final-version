# Kith design system (source of truth)

> Rewritten 2026-11-10 from the shipping code. The previous file was generator output for a different product
> (Cinzel/Josefin, amber CTA, landing-page storytelling) and did not describe Kith. If code and this file disagree,
> fix whichever is wrong, and keep them in step. Audit that led here: `design-system/AUDIT-2026-11-10.md`.

## Where things live

| What | File |
|---|---|
| Color tokens, glass materials, layout rhythm, motion | `src/global.css` |
| Tailwind mapping of tokens | `tailwind.config.cjs` |
| Glass class presets for components | `src/components/glass.ts` |
| Components (gluestack-ui v5, NativeWind) | `src/components/ui/*` |

Use stock gluestack components and style them through `className`. Don't introduce new hex values in screens; add a token.

## Two contexts

| Context | Where | Theme |
|---|---|---|
| **Paper** | Home, onboarding | Light gluestack tokens (`:root`): white background, near-black primary |
| **Over the room** | Scan, editor | `.dark` subtree plus glass materials, so the photo or room stays the focus |

## Color

Neutral gluestack palette, stored as RGB triplets so opacity modifiers work (`bg-primary/10`).

| Token | Light | Dark (`.dark`) | Use |
|---|---|---|---|
| `primary` | `23 23 23` | `255 245 245` | Filled buttons, selected chips |
| `background` | `255 255 255` | `10 10 10` | Screens |
| `foreground` | `10 10 10` | `250 250 250` | Body text |
| `muted-foreground` | `115 115 115` | `161 161 161` | Secondary text |
| `secondary` | `245 245 245` | `38 38 38` | Quiet surfaces, option rows |
| `border` / `input` | `229 229 229` | `46 46 46` | Dividers, field outlines |
| `destructive` | `231 0 11` | `255 100 103` | Only for actions that lose work with no undo |

Accent colour is the AI orb gradient (`--k-orb`) and **`--k-accent`** (`245 163 199`, Tailwind `kith`): scan progress ring and boxes being edited or staged. Nothing else is coloured; colour in the UI comes from the room and the user's mood boards.

## Type

- **Inter** (300–700) for everything. No display face. Weight 400+ below 18px.
- Root is `93.75%` (15px at the default browser size, follows the reader's setting). All sizes in rem, line-heights unitless, tracking in em per size (`tailwind.config.cjs` → `fontSize`):

| Token | Size | Line-height | Tracking | Use |
|---|---|---|---|---|
| `2xs` | 12px | 1.35 | +0.005em | Meta, captions (floor: nothing smaller) |
| `xs` | 13px | 1.4 | 0 | Hints, chips, toasts |
| `sm` | 14px | 1.45 | −0.004em | Labels, secondary body |
| `base` | 15px | 1.5 | −0.011em | Body |
| `lg` / `xl` | 17 / 19px | 1.4 / 1.3 | −0.012 / −0.014em | Emphasis, card titles |
| `2xl` / `3xl` / `4xl` | 22.5 / 28 / 34px | 1.25 / 1.15 / 1.1 | −0.018 / −0.022 / −0.025em | Titles |

- Screen titles: `Heading size="3xl"`. Sheet and dialog titles: `size="sm"`. Labels: `Text size="sm" bold`. Hints: `size="xs"` muted.
- Headings wrap `balance`, text wraps `pretty`. `truncate` always wins over gluestack's `pre-wrap`. Counts that change use `tabular-nums`. Rendered strings use `…`, never `...`.
- **Sentence case everywhere**: buttons, menu rows, badges, titles. No Title Case, no all caps.

## Glass materials (`glass.ts`)

| Preset | Class | Use |
|---|---|---|
| `glass.clear` | `dark k-glass` | Controls floating over the room: top bar, dock, tags, toasts, badges on photos |
| `glass.panel` | `dark k-panel` | Sheets and drawers with reading text |
| `glass.dialog` | `dark k-panel k-panel-strong` | Dialogs and pop-ups |
| `glass.scrim` | `k-scrim` | Backdrop behind dialogs |

Sheets and dialogs are **dark** frosted glass, not white.

## Layout rhythm (402px phone reference)

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `--k-edge` | 26px | `px-edge` | Screen side gutter |
| `--k-ctl` | 54px | `h-ctl` | Floating control and main button height |
| `--k-dock` | 80px | `h-dock` | Bottom dock, capture FAB |
| `--k-gap` | 16px | `gap-gap` | Between floating groups |
| `--k-row` | 30px | `gap-row` | Between stacked rows of controls |
| `--k-top` / `--k-bottom` | safe-area aware | `pt-top`, `pb-bottom` | Screen insets |

## Shape

| Element | Radius |
|---|---|
| Buttons, chips, badges, pills, floating controls | `rounded-full` |
| Cards, inputs, textareas, tiles | `rounded-lg` / `rounded-xl` |
| Floating cards over the room (hints, step cards) | `rounded-2xl` |
| Sheets and dialogs | `rounded-3xl` |

Nested surfaces: outer radius = inner radius + padding.

## Motion

- `--k-spring: cubic-bezier(0.2, 0, 0, 1)`, 340ms, drives every `.animate-in` entrance (`fade-in`, `zoom-in-95`, `slide-in-from-*`).
- State changes use transitions on named properties, never `transition-all`.
- `prefers-reduced-motion`: entrances become 160ms cross-fades (no slide or scale); loops and transitions stop.
- Buttons scale to 0.96 on press (150ms ease-out), never when disabled.
- The held staging ghost glides to its snapped spot (critically damped, τ 45ms) instead of jumping.
- `prefers-reduced-transparency` makes glass solid; `prefers-contrast: more` gives it a near-solid fill and a clear edge.

## Elevation (paper surfaces)

| Token | Use |
|---|---|
| `shadow-k-sm` | Compact cards, pills, quiet surfaces |
| `shadow-k-md` | Default card (built into `Card`), FAB, callout tiles |
| `shadow-k-lg` | Hero media (the Recent card), modal-like containers |

Neutral only, one per element, never stacked with Tailwind's default shadows. Glass over the room keeps its own inset edge and drop.

## Staging ghosts

Ghosts are built from the piece's own meshes (`buildStagingProxyFromObject`), so their size and silhouette always match the furniture. Step-5 brackets are measured from the meshes, never typed in.

## Words

| Say | Don't say |
|---|---|
| Clear room / Restore room | Clear canvas, Restore original layout, Clear the room |
| Fixed items | Fixtures, architectural elements, constraints (in UI) |
| Pieces / furniture | Assets, objects (in UI) |
| Confirm (only for placing staged moves) | Confirm for "next step" |
| Start the scenario over | Reset walkthrough |

## Safety

- The filled button in a choice is the **safe** option. Destructive options are outline.
- Anything that removes work is either undoable (toast says "Undo") or asks first, in the glass dialog style, never a native `confirm()`.

## Pre-delivery checklist

- [ ] No new hex in screens; tokens only
- [ ] Sentence case on every label
- [ ] Lucide icons only, one meaning per icon (Sparkles = AI only)
- [ ] Interactive elements are real buttons (role, name), with a visible focus state
- [ ] Pinch-zoom not disabled
- [ ] Works at 375px with no horizontal scroll
