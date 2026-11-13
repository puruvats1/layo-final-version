import React from 'react';
import { tv } from '../utils/tv';

/** Column container with the box model reset the layouts here assume (flex, relative, stretch, min-size 0). */
const boxStyle = tv({
  base: 'flex flex-col relative z-0 box-border border-0 list-none min-w-0 min-h-0 bg-transparent items-stretch m-0 p-0',
});

type IBoxProps = React.ComponentPropsWithoutRef<'div'>;

const Box = React.forwardRef<HTMLDivElement, IBoxProps>(function Box({ className, ...props }, ref) {
  return <div ref={ref} className={boxStyle({ className })} {...props} />;
});

Box.displayName = 'Box';
export { Box };
