import React from 'react';
import { tv, type VariantProps } from '../utils/tv';

export const textStyle = tv({
  // pretty: no single word stranded on the last line of a wrapped sentence
  base: 'text-foreground font-body font-sans my-0 bg-transparent border-0 box-border list-none m-0 p-0 text-start no-underline whitespace-pre-wrap [text-wrap:pretty]',
  variants: {
    isTruncated: { true: 'truncate' },
    bold: { true: 'font-bold' },
    underline: { true: 'underline' },
    strikeThrough: { true: 'line-through' },
    size: {
      '2xs': 'text-2xs',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
    sub: { true: 'text-xs' },
    italic: { true: 'italic' },
    highlight: { true: 'bg-yellow-500' },
  },
});

type ITextProps = Omit<React.ComponentProps<'span'>, 'color'> & VariantProps<typeof textStyle>;

const Text = React.forwardRef<HTMLSpanElement, ITextProps>(function Text(
  { className, isTruncated, bold, underline, strikeThrough, size = 'md', sub, italic, highlight, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={textStyle({
        isTruncated: isTruncated as boolean,
        bold: bold as boolean,
        underline: underline as boolean,
        strikeThrough: strikeThrough as boolean,
        size,
        sub: sub as boolean,
        italic: italic as boolean,
        highlight: highlight as boolean,
        className,
      })}
      {...props}
    />
  );
});

Text.displayName = 'Text';
export { Text };
