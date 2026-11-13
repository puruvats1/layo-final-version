import React from 'react';
import { Loader2 } from 'lucide-react';
import { tv } from '../utils/tv';

const spinnerStyle = tv({
  base: 'animate-spin',
  variants: { size: { small: 'h-5 w-5', large: 'h-9 w-9' } },
  defaultVariants: { size: 'small' },
});

type ISpinnerProps = Omit<React.ComponentPropsWithoutRef<'svg'>, 'color'> & {
  size?: 'small' | 'large';
  /** Any CSS colour. Defaults to the surrounding text colour. */
  color?: string;
};

const Spinner = React.forwardRef<SVGSVGElement, ISpinnerProps>(function Spinner(
  { className, size = 'small', color, 'aria-label': ariaLabel = 'loading', ...props },
  ref
) {
  return <Loader2 ref={ref} role="status" aria-label={ariaLabel} color={color} {...props} className={spinnerStyle({ size, className })} />;
});

Spinner.displayName = 'Spinner';
export { Spinner };
