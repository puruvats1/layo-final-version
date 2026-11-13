import React from 'react';
import { tv, type VariantProps } from '../utils/tv';

/**
 * The one chip. Use `glass` over the room and `paper` on white screens. `selected` fills it.
 * Renders a button when it has an onClick (a choice), otherwise a plain label.
 */
const chip = tv({
  base: [
    'inline-flex flex-row items-center justify-center gap-1.5 shrink-0 rounded-full h-8 px-3.5 text-sm font-medium select-none',
    // Optical padding: an icon has built-in whitespace, so the side it sits on gets less padding than the text side
    'has-[>svg:first-child]:pl-2.5 has-[>svg:last-child]:pr-2.5',
    'transition-[background-color,color,box-shadow,transform] duration-150 ease-out',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ],
  variants: {
    tone: {
      paper: 'bg-background text-foreground shadow-k-sm enabled:hover:bg-secondary',
      glass: 'k-glass-lt',
    },
    selected: { true: '', false: '' },
    interactive: { true: 'cursor-pointer enabled:active:scale-[0.96]', false: '' },
  },
  compoundVariants: [
    { tone: 'paper', selected: true, class: 'bg-primary text-primary-foreground shadow-none' },
    // `!` because the glass material sets its own background and colour
    { tone: 'glass', selected: true, class: '!bg-none !bg-primary !text-primary-foreground' }, // bg-none: the glass paints a white gradient over any colour
  ],
  defaultVariants: { tone: 'paper', selected: false, interactive: false },
});

type IChipProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> & Pick<VariantProps<typeof chip>, 'tone' | 'selected'>;

const Chip = React.forwardRef<HTMLButtonElement, IChipProps>(function Chip(
  { className, tone, selected = false, onClick, children, ...props },
  ref
) {
  const cls = chip({ tone, selected, interactive: !!onClick, className });
  if (!onClick) {
    return (
      <span className={cls} {...(props as React.ComponentPropsWithoutRef<'span'>)}>
        {children}
      </span>
    );
  }
  return (
    <button ref={ref} type="button" aria-pressed={selected} onClick={onClick} className={cls} {...props}>
      {children}
    </button>
  );
});

Chip.displayName = 'Chip';
export { Chip };
