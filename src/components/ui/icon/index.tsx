import React from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { tv, type VariantProps } from '../utils/tv';

/*
 * One Icon for the whole app. The target icon set is Hugeicons (@hugeicons/core-free-icons), so
 * pass those: <Icon as={Home01Icon} />. Lucide glyphs still render until each screen is moved over.
 * Either way it inherits text colour unless a text-* class is given.
 */
export const iconStyle = tv({
  base: 'text-foreground fill-none pointer-events-none',
  variants: {
    size: {
      '2xs': 'h-3 w-3',
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
      none: '',
    },
  },
});

export type AnyIcon = LucideIcon | IconSvgElement;

export type IconProps = Omit<LucideProps, 'size' | 'ref'> & VariantProps<typeof iconStyle> & { as: AnyIcon; className?: string };

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon({ as: As, size = 'md', className, strokeWidth, color, ...props }, ref) {
  const cls = iconStyle({ size, className });
  // Hugeicons icons are data (an array of path definitions); Lucide icons are components
  if (Array.isArray(As)) {
    return <HugeiconsIcon icon={As as IconSvgElement} className={cls} strokeWidth={Number(strokeWidth ?? 1.75)} color={color ?? 'currentColor'} aria-hidden />;
  }
  const Glyph = As as LucideIcon;
  return <Glyph ref={ref} aria-hidden {...props} strokeWidth={strokeWidth} color={color} className={cls} />;
});
