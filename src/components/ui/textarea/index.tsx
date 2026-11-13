import React, { createContext, useContext } from 'react';
import { tv, type VariantProps } from '../utils/tv';

const textarea = tv({
  slots: {
    root: [
      'flex flex-col w-full h-[100px] border border-border dark:bg-input/30 rounded-lg',
      'hover:border-border/80 focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-inset focus-within:ring-ring',
      'has-[textarea[aria-invalid=true]]:border-destructive has-[textarea:disabled]:opacity-40',
    ],
    // field-sizing grows the box with its text where supported; `rows` is the starting height elsewhere
    input: 'p-2 flex-1 w-full resize-none [field-sizing:content] bg-transparent outline-none text-foreground placeholder:text-foreground/60 cursor-text disabled:cursor-not-allowed',
  },
  variants: {
    size: {
      sm: { input: 'text-sm' },
      md: { input: 'text-base' },
      lg: { input: 'text-lg' },
      xl: { input: 'text-xl' },
    },
  },
  defaultVariants: { size: 'md' },
});

type TextareaVariants = VariantProps<typeof textarea>;
const TextareaContext = createContext<TextareaVariants>({});

type ITextareaProps = React.ComponentPropsWithoutRef<'div'> & TextareaVariants;

const Textarea = React.forwardRef<HTMLDivElement, ITextareaProps>(function Textarea(
  { className, size = 'md', ...props },
  ref
) {
  const { root } = textarea({ size });
  return (
    <TextareaContext.Provider value={{ size }}>
      <div ref={ref} className={root({ className })} {...props} />
    </TextareaContext.Provider>
  );
});

type ITextareaInputProps = Omit<React.ComponentPropsWithoutRef<'textarea'>, 'onChange'> & {
  /** Gives the new text directly, so callers do not unwrap the event */
  onChangeText?: (text: string) => void;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
};

const TextareaInput = React.forwardRef<HTMLTextAreaElement, ITextareaInputProps>(function TextareaInput(
  { className, onChangeText, onChange, ...props },
  ref
) {
  const { input } = textarea({ size: useContext(TextareaContext).size });
  return (
    <textarea
      ref={ref}
      className={input({ className })}
      onChange={(e) => {
        onChange?.(e);
        onChangeText?.(e.target.value);
      }}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
TextareaInput.displayName = 'TextareaInput';

export { Textarea, TextareaInput };
