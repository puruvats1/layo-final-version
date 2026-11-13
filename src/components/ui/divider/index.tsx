import React from 'react';
import { tv, type VariantProps } from '../utils/tv';

const dividerStyle = tv({
  base: 'bg-border shrink-0',
  variants: {
    orientation: {
      vertical: 'w-px h-full',
      horizontal: 'h-px w-auto',
    },
  },
});

type IDividerProps = React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof dividerStyle>;

const Divider = React.forwardRef<HTMLDivElement, IDividerProps>(function Divider(
  { className, orientation = 'horizontal', ...props },
  ref
) {
  return <div ref={ref} role="separator" aria-orientation={orientation ?? undefined} className={dividerStyle({ orientation, className })} {...props} />;
});

Divider.displayName = 'Divider';
export { Divider };
