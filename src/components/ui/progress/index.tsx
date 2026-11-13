import React, { createContext, useContext } from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';
import { tv, type VariantProps } from '../utils/tv';

const progress = tv({
  slots: {
    root: 'bg-primary/20 relative overflow-hidden rounded-full',
    filled: 'bg-primary transition-all',
  },
  variants: {
    orientation: {
      horizontal: { root: 'w-full h-2', filled: 'h-full' },
      vertical: { root: 'h-full w-2 flex justify-end', filled: 'w-full' },
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

type ProgressVariants = VariantProps<typeof progress>;
const ProgressContext = createContext<{ value: number; orientation: ProgressVariants['orientation'] }>({
  value: 0,
  orientation: 'horizontal',
});

type IProgressProps = Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'value'> &
  ProgressVariants & { value?: number };

/** Radix gives the progressbar role and aria values; the filled track reads the value from context. */
const Progress = React.forwardRef<React.ComponentRef<typeof ProgressPrimitive.Root>, IProgressProps>(function Progress(
  { className, orientation = 'horizontal', value = 0, ...props },
  ref
) {
  const { root } = progress({ orientation });
  return (
    <ProgressContext.Provider value={{ value, orientation }}>
      <ProgressPrimitive.Root ref={ref} value={value} className={root({ className })} {...props} />
    </ProgressContext.Provider>
  );
});

const ProgressFilledTrack = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Indicator>
>(function ProgressFilledTrack({ className, style, ...props }, ref) {
  const { value, orientation } = useContext(ProgressContext);
  const { filled } = progress({ orientation });
  const size = `${Math.max(0, Math.min(100, value))}%`;
  return (
    <ProgressPrimitive.Indicator
      ref={ref}
      className={filled({ className })}
      style={{ ...(orientation === 'vertical' ? { height: size } : { width: size }), ...style }}
      {...props}
    />
  );
});

Progress.displayName = 'Progress';
ProgressFilledTrack.displayName = 'ProgressFilledTrack';

export { Progress, ProgressFilledTrack };
