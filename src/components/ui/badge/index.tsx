import React, { createContext, useContext } from 'react';
import { Icon, type IconProps } from '@/components/ui/icon';
import { tv, type VariantProps } from '../utils/tv';

// Badges are pills like every other chip, with a fixed icon-to-text gap, and sentence case.
const badge = tv({
  slots: {
    root: 'flex flex-row items-center justify-center gap-1 rounded-full px-2.5 py-1',
    text: 'text-xs font-medium tracking-normal',
    icon: 'fill-none h-3 w-3 pointer-events-none',
  },
  variants: {
    variant: {
      default: { root: 'bg-primary', text: 'text-primary-foreground', icon: 'text-primary-foreground' },
      secondary: { root: 'bg-secondary', text: 'text-secondary-foreground', icon: 'text-secondary-foreground' },
      destructive: { root: 'bg-destructive dark:bg-destructive/60', text: 'text-white', icon: 'text-white' },
      outline: { root: 'border border-border dark:border-border/90 bg-transparent', text: 'text-foreground', icon: 'text-foreground' },
    },
  },
  defaultVariants: { variant: 'default' },
});

type BadgeVariants = VariantProps<typeof badge>;
const BadgeContext = createContext<BadgeVariants>({});

type IBadgeProps = React.ComponentPropsWithoutRef<'div'> & BadgeVariants;

function Badge({ children, variant = 'default', className, ...props }: IBadgeProps) {
  const { root } = badge({ variant });
  return (
    <BadgeContext.Provider value={{ variant }}>
      <div className={root({ className })} {...props}>
        {children}
      </div>
    </BadgeContext.Provider>
  );
}

const BadgeText = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(function BadgeText(
  { children, className, ...props },
  ref
) {
  const { text } = badge({ variant: useContext(BadgeContext).variant });
  return (
    <span ref={ref} className={text({ className })} {...props}>
      {children}
    </span>
  );
});

const BadgeIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'size'>>(function BadgeIcon({ className, ...props }, ref) {
  const { icon } = badge({ variant: useContext(BadgeContext).variant });
  return <Icon ref={ref} size="none" {...props} className={icon({ className })} />;
});

Badge.displayName = 'Badge';
BadgeText.displayName = 'BadgeText';
BadgeIcon.displayName = 'BadgeIcon';

export { Badge, BadgeIcon, BadgeText };
