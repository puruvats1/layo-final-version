import React from 'react';
import { tv, type VariantProps } from '../utils/tv';

const headingStyle = tv({
  // Headings wrap balanced, so a two-line title never ends on one lonely word
  base: 'text-foreground font-bold font-heading my-0 bg-transparent border-0 box-border list-none m-0 p-0 text-start no-underline whitespace-pre-wrap [text-wrap:balance]',
  variants: {
    isTruncated: { true: 'truncate' },
    bold: { true: 'font-bold' },
    underline: { true: 'underline' },
    strikeThrough: { true: 'line-through' },
    sub: { true: 'text-xs' },
    italic: { true: 'italic' },
    highlight: { true: 'bg-yellow-500' },
    size: {
      '5xl': 'text-6xl',
      '4xl': 'text-5xl',
      '3xl': 'text-4xl',
      '2xl': 'text-3xl',
      xl: 'text-2xl',
      lg: 'text-xl',
      md: 'text-lg',
      sm: 'text-base',
      xs: 'text-sm',
    },
  },
});

type Size = NonNullable<VariantProps<typeof headingStyle>['size']>;
type IHeadingProps = Omit<React.ComponentPropsWithoutRef<'h1'>, 'color'> &
  VariantProps<typeof headingStyle> & { as?: React.ElementType };

/** Heading level follows the visual size. */
const TAG: Record<Size, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
  '5xl': 'h1', '4xl': 'h1', '3xl': 'h1', '2xl': 'h2', xl: 'h3', lg: 'h4', md: 'h5', sm: 'h6', xs: 'h6',
};

const Heading = React.forwardRef<HTMLHeadingElement, IHeadingProps>(function Heading(
  { className, size = 'lg', as: As, isTruncated, bold, underline, strikeThrough, sub, italic, highlight, ...props },
  ref
) {
  const Tag: React.ElementType = As ?? TAG[size as Size] ?? 'h4';
  return (
    <Tag
      ref={ref}
      className={headingStyle({
        size,
        isTruncated: isTruncated as boolean,
        bold: bold as boolean,
        underline: underline as boolean,
        strikeThrough: strikeThrough as boolean,
        sub: sub as boolean,
        italic: italic as boolean,
        highlight: highlight as boolean,
        className,
      })}
      {...props}
    />
  );
});

Heading.displayName = 'Heading';
export { Heading };
