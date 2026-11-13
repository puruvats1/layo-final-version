import React from 'react';
import { tv } from '../utils/tv';

const pressableStyle = tv({
  base: [
    'flex flex-col relative items-stretch min-w-0 min-h-0 text-start cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
});

type IPressableProps = React.ComponentPropsWithoutRef<'button'>;

/** Anything tappable that is not a styled Button. A real <button>, so keyboard and screen readers just work. */
const Pressable = React.forwardRef<HTMLButtonElement, IPressableProps>(function Pressable(
  { className, type = 'button', ...props },
  ref
) {
  return <button ref={ref} type={type} className={pressableStyle({ className })} {...props} />;
});

Pressable.displayName = 'Pressable';
export { Pressable };
