import React, { createContext, useContext } from 'react';
import { Dialog } from 'radix-ui';
import { tv, type VariantProps } from '../utils/tv';

/**
 * Centered dialog on Radix Dialog: focus is trapped and restored, Escape and the backdrop close it,
 * and the page behind stops scrolling. The parts keep the names they had, so call sites read the same.
 */
const modal = tv({
  slots: {
    backdrop: 'fixed inset-0 z-50 bg-black/50 animate-in fade-in',
    content: [
      'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex flex-col',
      'bg-background rounded-md overflow-hidden border border-border/80 shadow-hard-2 p-6 max-h-[85vh]',
      'outline-none animate-in fade-in zoom-in-95',
    ],
    header: 'flex flex-row justify-between items-center',
    body: 'mt-2 mb-6 min-h-0 flex-1 overflow-y-auto',
    footer: 'flex flex-row justify-end items-center gap-2',
    close: 'z-10 rounded cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring',
  },
  variants: {
    size: {
      xs: { content: 'w-[60%] max-w-[360px]' },
      sm: { content: 'w-[70%] max-w-[420px]' },
      md: { content: 'w-[80%] max-w-[510px]' },
      lg: { content: 'w-[90%] max-w-[640px]' },
      full: { content: 'w-full' },
    },
  },
  defaultVariants: { size: 'md' },
});

type ModalVariants = VariantProps<typeof modal>;
const ModalContext = createContext<{ size: ModalVariants['size']; title?: string }>({ size: 'md' });

type IModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  size?: ModalVariants['size'];
  /** Read out by screen readers when the dialog opens; not shown */
  title?: string;
  children?: React.ReactNode;
};

const Modal = ({ isOpen = false, onClose, size = 'md', title, children }: IModalProps) => (
  <ModalContext.Provider value={{ size, title }}>
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal>{children}</Dialog.Portal>
    </Dialog.Root>
  </ModalContext.Provider>
);

const ModalBackdrop = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Dialog.Overlay>>(function ModalBackdrop(
  { className, ...props },
  ref
) {
  return <Dialog.Overlay ref={ref} className={modal().backdrop({ className })} {...props} />;
});

const ModalContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Dialog.Content>>(function ModalContent(
  { className, children, ...props },
  ref
) {
  const { size, title } = useContext(ModalContext);
  return (
    <Dialog.Content ref={ref} aria-describedby={undefined} className={modal({ size }).content({ className })} {...props}>
      <Dialog.Title className="sr-only">{title ?? 'Dialog'}</Dialog.Title>
      {children}
    </Dialog.Content>
  );
});

const ModalHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function ModalHeader({ className, ...props }, ref) {
  return <div ref={ref} className={modal().header({ className })} {...props} />;
});

const ModalBody = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function ModalBody({ className, ...props }, ref) {
  return <div ref={ref} className={modal().body({ className })} {...props} />;
});

const ModalFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function ModalFooter({ className, ...props }, ref) {
  return <div ref={ref} className={modal().footer({ className })} {...props} />;
});

const ModalCloseButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Dialog.Close>>(function ModalCloseButton(
  { className, ...props },
  ref
) {
  return <Dialog.Close ref={ref} aria-label="Close" className={modal().close({ className })} {...props} />;
});

export { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader };
