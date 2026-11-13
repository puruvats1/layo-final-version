import React from 'react';
import { tv, type VariantProps } from '../utils/tv';

const cardStyle = tv({
  // Elevation from layered shadow; the transparent border keeps an edge in forced-colors mode
  base: 'flex flex-col relative z-0 bg-card border border-transparent rounded-xl shadow-k-md',
  variants: {
    size: {
      default: 'p-4 gap-6',
      sm: 'p-3 gap-3',
    },
  },
  defaultVariants: { size: 'default' },
});

type ICardProps = React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof cardStyle>;

const Card = React.forwardRef<HTMLDivElement, ICardProps>(function Card({ className, size = 'default', ...props }, ref) {
  return <div ref={ref} className={cardStyle({ size, className })} {...props} />;
});

Card.displayName = 'Card';
export { Card };
