import React from 'react';
import { tv, type VariantProps } from '../utils/tv';

const hstackStyle = tv({
  base: 'flex flex-row relative z-0 box-border border-0 list-none min-w-0 min-h-0 bg-transparent items-stretch m-0 p-0',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-5',
      '2xl': 'gap-6',
      '3xl': 'gap-7',
      '4xl': 'gap-8',
    },
    reversed: { true: 'flex-row-reverse' },
  },
});

type IHStackProps = React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof hstackStyle>;

const HStack = React.forwardRef<HTMLDivElement, IHStackProps>(function HStack(
  { className, space, reversed, ...props },
  ref
) {
  return <div ref={ref} className={hstackStyle({ space, reversed: reversed as boolean, className })} {...props} />;
});

HStack.displayName = 'HStack';
export { HStack };
