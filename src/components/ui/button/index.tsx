import React, { createContext, useContext } from 'react';
import { Loader2 } from 'lucide-react';
import { Icon, type IconProps } from '@/components/ui/icon';
import { tv, type VariantProps } from '../utils/tv';

/**
 * One slot per part. Variant and size are chosen on <Button>; the text, icon and spinner inside it
 * read them from context so a ghost button's label and glyph match without repeating the variant.
 */
const button = tv({
  slots: {
    root: [
      'group/btn rounded-md flex flex-row items-center justify-center gap-2 h-fit cursor-pointer text-start',
      'transition-[transform,background-color,opacity] duration-150 ease-out',
      'enabled:active:scale-[0.96]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:opacity-40 disabled:cursor-not-allowed',
    ],
    text: 'select-none font-sans',
    icon: 'fill-none pointer-events-none shrink-0',
    spinner: 'animate-spin',
  },
  variants: {
    variant: {
      default: {
        root: 'bg-primary enabled:hover:bg-primary/90 enabled:active:bg-primary/90',
        text: 'text-primary-foreground',
        icon: 'text-primary-foreground',
      },
      destructive: {
        root: 'bg-destructive enabled:hover:bg-destructive/90 enabled:active:bg-destructive/90 dark:bg-destructive/60',
        text: 'text-white',
        icon: 'text-white',
      },
      outline: {
        root: 'border border-border bg-background shadow-xs enabled:hover:bg-accent enabled:active:bg-accent dark:bg-input/[0.045] dark:border-border/90 dark:enabled:hover:bg-input/[0.075] dark:enabled:active:bg-input/[0.075]',
        text: 'text-foreground group-hover/btn:text-accent-foreground group-active/btn:text-accent-foreground',
        icon: 'text-foreground group-hover/btn:text-accent-foreground group-active/btn:text-accent-foreground',
      },
      secondary: {
        root: 'bg-secondary enabled:hover:bg-secondary/80 enabled:active:bg-secondary/80',
        text: 'text-secondary-foreground',
        icon: 'text-secondary-foreground',
      },
      ghost: {
        root: 'enabled:hover:bg-accent enabled:active:bg-accent dark:enabled:hover:bg-accent/50 dark:enabled:active:bg-accent/50',
        text: 'text-foreground',
        icon: 'text-foreground group-hover/btn:text-accent-foreground group-active/btn:text-accent-foreground',
      },
      // Proposed primary treatments, for comparing on /styleguide. Materials live in global.css.
      smoke: { root: 'k-btn-smoke', text: 'text-onglow', icon: 'text-onglow' },
      // Quiet blurred pill for secondary actions on light glass
      glass: { root: 'k-btn-frost', text: 'text-foreground', icon: 'text-foreground' },
      link: {
        root: 'enabled:hover:underline enabled:active:underline',
        text: 'text-primary',
        icon: 'text-primary',
      },
    },
    size: {
      // Icons are well above the label's cap height so they carry weight next to it: 22.5 / 18.75 / 26 / 26px
      default: { root: 'px-4 py-2', text: 'text-sm', icon: 'h-6 w-6', spinner: 'h-6 w-6' },
      sm: { root: 'min-h-8 rounded-md px-3 text-xs', text: 'text-xs', icon: 'h-5 w-5', spinner: 'h-5 w-5' },
      lg: { root: 'min-h-10 rounded-md px-8', text: 'text-sm', icon: 'h-7 w-7', spinner: 'h-7 w-7' },
      icon: { root: 'min-h-9 min-w-9', text: 'text-sm', icon: 'h-7 w-7', spinner: 'h-7 w-7' },
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

type ButtonVariants = VariantProps<typeof button>;
const ButtonContext = createContext<ButtonVariants>({});
const parts = (ctx: ButtonVariants) => button({ variant: ctx.variant, size: ctx.size });

type IButtonProps = React.ComponentPropsWithoutRef<'button'> & ButtonVariants;

const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(function Button(
  { className, variant = 'default', size = 'default', type = 'button', ...props },
  ref
) {
  const { root } = button({ variant, size });
  return (
    <ButtonContext.Provider value={{ variant, size }}>
      <button ref={ref} type={type} className={root({ className })} {...props} />
    </ButtonContext.Provider>
  );
});

const ButtonText = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'> & { size?: unknown }>(
  // `size` is accepted for source compatibility; the text size always follows the button's size.
  function ButtonText({ className, size: _size, ...props }, ref) {
    const { text } = parts(useContext(ButtonContext));
    return <span ref={ref} className={text({ className })} {...props} />;
  }
);

const ButtonSpinner = React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<'svg'>>(function ButtonSpinner(
  { className, ...props },
  ref
) {
  const { spinner } = parts(useContext(ButtonContext));
  return <Loader2 ref={ref} role="status" aria-label="loading" {...props} className={spinner({ className })} />;
});

type IButtonIconProps = Omit<IconProps, 'size'>;
const ButtonIcon = React.forwardRef<SVGSVGElement, IButtonIconProps>(function ButtonIcon({ className, ...props }, ref) {
  const { icon } = parts(useContext(ButtonContext));
  return <Icon ref={ref} size="none" {...props} className={icon({ className })} />;
});

const buttonGroup = tv({
  base: 'flex',
  variants: {
    space: { xs: 'gap-1', sm: 'gap-2', md: 'gap-3', lg: 'gap-4', xl: 'gap-5', '2xl': 'gap-6', '3xl': 'gap-7', '4xl': 'gap-8' },
    isAttached: { true: 'gap-0' },
    flexDirection: { row: 'flex-row', column: 'flex-col', 'row-reverse': 'flex-row-reverse', 'column-reverse': 'flex-col-reverse' },
  },
});

type IButtonGroupProps = React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof buttonGroup>;
const ButtonGroup = React.forwardRef<HTMLDivElement, IButtonGroupProps>(function ButtonGroup(
  { className, space = 'md', isAttached = false, flexDirection = 'column', ...props },
  ref
) {
  return <div ref={ref} {...props} className={buttonGroup({ space, isAttached, flexDirection, className })} />;
});

Button.displayName = 'Button';
ButtonText.displayName = 'ButtonText';
ButtonSpinner.displayName = 'ButtonSpinner';
ButtonIcon.displayName = 'ButtonIcon';
ButtonGroup.displayName = 'ButtonGroup';

export { Button, ButtonGroup, ButtonIcon, ButtonSpinner, ButtonText };
