import React from 'react';
import { tv, type VariantProps } from '../utils/tv';

const vstackStyle = tv({
  base: 'flex flex-col relative z-0 box-border border-0 list-none min-w-0 min-h-0 bg-transparent items-stretch m-0 p-0',
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
    reversed: { true: 'flex-col-reverse' },
  },
});

type IVStackProps = React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof vstackStyle>;

const VStack = React.forwardRef<HTMLDivElement, IVStackProps>(function VStack(
  { className, space, reversed, ...props },
  ref
) {
  return <div ref={ref} className={vstackStyle({ space, reversed: reversed as boolean, className })} {...props} />;
});

VStack.displayName = 'VStack';
export { VStack };
