import React, { createContext, useContext } from 'react';
import { Drawer } from 'vaul';
import { tv } from '../utils/tv';

/**
 * Bottom sheet on vaul: drag down to dismiss, rubber-band, velocity-aware close, focus trap and a
 * scroll lock. The parts keep the names they had, so call sites read the same.
 */
const sheet = tv({
  slots: {
    backdrop: 'fixed inset-0 z-50 bg-black/50',
    content: [
      'fixed inset-x-0 bottom-0 z-50 mx-auto w-full flex flex-col items-center rounded-t-lg p-4',
      'bg-background border-t border-border dark:border-border/10 max-h-[80vh] outline-none select-none',
    ],
    dragIndicatorWrapper: 'w-full py-1 flex items-center justify-center',
    dragIndicator: 'w-[100px] h-2 bg-muted rounded-full',
  },
});

const SheetContext = createContext<{ title?: string }>({});

type IActionsheetProps = {
  isOpen?: boolean;
  onClose?: () => void;
  /** Read out by screen readers when the sheet opens; not shown */
  title?: string;
  children?: React.ReactNode;
};

const Actionsheet = ({ isOpen = false, onClose, title, children }: IActionsheetProps) => (
  <SheetContext.Provider value={{ title }}>
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <Drawer.Portal>{children}</Drawer.Portal>
    </Drawer.Root>
  </SheetContext.Provider>
);

const ActionsheetBackdrop = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Drawer.Overlay>>(function ActionsheetBackdrop(
  { className, ...props },
  ref
) {
  return <Drawer.Overlay ref={ref} className={sheet().backdrop({ className })} {...props} />;
});

const ActionsheetContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Drawer.Content>>(function ActionsheetContent(
  { className, children, ...props },
  ref
) {
  const { title } = useContext(SheetContext);
  return (
    <Drawer.Content ref={ref} aria-describedby={undefined} className={sheet().content({ className })} {...props}>
      <Drawer.Title className="sr-only">{title ?? 'Options'}</Drawer.Title>
      {children}
    </Drawer.Content>
  );
});

const ActionsheetDragIndicatorWrapper = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  function ActionsheetDragIndicatorWrapper({ className, ...props }, ref) {
    return <div ref={ref} className={sheet().dragIndicatorWrapper({ className })} {...props} />;
  }
);

const ActionsheetDragIndicator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function ActionsheetDragIndicator(
  { className, ...props },
  ref
) {
  return <div ref={ref} aria-hidden className={sheet().dragIndicator({ className })} {...props} />;
});

export { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper };
