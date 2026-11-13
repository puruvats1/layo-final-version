import React from 'react';
import { tv } from '../utils/tv';

const centerStyle = tv({ base: 'flex flex-col relative z-0 justify-center items-center' });

const Center = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function Center(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={centerStyle({ className })} {...props} />;
});

Center.displayName = 'Center';
export { Center };
