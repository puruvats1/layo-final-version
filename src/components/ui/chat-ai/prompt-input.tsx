/*
 * Prompt input: one compound component (PromptInput > Body > Textarea + Submit).
 *  - can be controlled (value + onChangeText) so a screen can prefill or clear it
 *  - Enter submits (Shift+Enter adds a line in multiline mode); Escape calls onEscape
 */
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { cn } from '../utils/tv';

type PromptContextType = {
  text: string;
  setText: (t: string) => void;
  handleSubmit: () => void;
  isDisabled: boolean;
  isBusy: boolean;
  onEscape?: () => void;
};

const PromptContext = createContext<PromptContextType | null>(null);

const usePrompt = () => {
  const context = useContext(PromptContext);
  if (!context) throw new Error('Must be inside PromptInput');
  return context;
};

export type PromptInputProps = {
  children: ReactNode;
  onSubmit?: (message: { text: string }) => void;
  /** Controlled text. Omit to let the input keep its own state. */
  value?: string;
  onChangeText?: (text: string) => void;
  /** Locks submit while the AI is working */
  isBusy?: boolean;
  onEscape?: () => void;
  className?: string;
};

export const PromptInput = ({ children, onSubmit, value, onChangeText, isBusy = false, onEscape, className }: PromptInputProps) => {
  const [ownText, setOwnText] = useState('');
  const text = value ?? ownText;
  const setText = (t: string) => {
    if (value === undefined) setOwnText(t);
    onChangeText?.(t);
  };

  const isDisabled = !text.trim() || isBusy;

  const handleSubmit = () => {
    if (isDisabled) return;
    onSubmit?.({ text: text.trim() });
    setText('');
  };

  return (
    <PromptContext.Provider value={{ text, setText, handleSubmit, isDisabled, isBusy, onEscape }}>
      <form
        className={cn('flex flex-col bg-muted border-border w-full rounded-3xl px-3 py-2', className)}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {children}
      </form>
    </PromptContext.Provider>
  );
};

export const PromptInputBody = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex flex-row pt-2 items-center gap-2', className)}>{children}</div>
);

export type PromptInputTextareaProps = {
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  'aria-label'?: string;
  maxLength?: number;
};

const FIELD =
  'flex-1 min-w-0 text-xl px-4 bg-transparent rounded-3xl text-foreground placeholder:text-muted-foreground outline-none ring-0 border-transparent disabled:opacity-60';

export const PromptInputTextarea = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, PromptInputTextareaProps>(function PromptInputTextarea(
  { placeholder = 'Let’s start building it', className, multiline = false, autoFocus, 'aria-label': ariaLabel, maxLength },
  ref
) {
  const { text, setText, handleSubmit, isBusy, onEscape } = usePrompt();
  const common = {
    value: text,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setText(e.target.value),
    placeholder,
    maxLength,
    autoFocus,
    disabled: isBusy,
    enterKeyHint: 'send' as const,
    'aria-label': ariaLabel ?? placeholder,
    className: cn(FIELD, className),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onEscape?.();
      if (multiline && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
  };
  // A single line is a real <input>, so the form's Enter-to-submit and the mobile "send" key work natively
  return multiline ? (
    <textarea ref={ref} rows={1} {...common} />
  ) : (
    <input ref={ref} type="text" {...common} />
  );
});

export const PromptInputFooter = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex flex-row items-center justify-between mt-6', className)}>{children}</div>
);

export const PromptInputTools = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex flex-row items-center gap-2', className)}>{children}</div>
);

export const PromptInputButton = ({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) => (
  <button type="button" onClick={onClick} className={cn('px-3 py-1 rounded-full bg-muted active:opacity-70', className)}>
    {children}
  </button>
);

export const PromptInputSubmit = ({ className, 'aria-label': ariaLabel = 'Send' }: { className?: string; 'aria-label'?: string }) => {
  const { isDisabled, isBusy } = usePrompt();
  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-label={isBusy ? 'AI is working' : ariaLabel}
      className={cn(
        'flex h-10 w-10 shrink-0 rounded-full items-center justify-center mx-3 bg-primary transition-opacity disabled:opacity-50 enabled:active:opacity-80',
        className
      )}
    >
      <Icon as={isBusy ? Loader2 : ArrowUp} size="lg" className={cn('text-primary-foreground', isBusy && 'animate-spin')} />
    </button>
  );
};
