import React from 'react';
import { Icon, type IconProps } from '@/components/ui/icon';
import { tv } from '../utils/tv';

const inputStyle = tv({
  base: [
    'min-h-9 w-full flex flex-row items-center rounded-lg border border-border dark:bg-input/30 bg-transparent shadow-xs',
    'transition-[color,box-shadow] overflow-hidden px-3 gap-2',
    'focus-within:outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
    'has-[input[aria-invalid=true]]:border-destructive/40 has-[input[aria-invalid=true]]:ring-destructive/20',
    'has-[input:disabled]:pointer-events-none has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
  ],
});

const inputIconStyle = tv({ base: 'flex justify-center items-center text-muted-foreground fill-none h-4 w-4' });
const inputSlotStyle = tv({ base: 'flex justify-center items-center disabled:cursor-not-allowed' });
const inputFieldStyle = tv({
  base: 'flex-1 min-w-0 bg-transparent text-foreground text-sm py-1 h-full placeholder:text-muted-foreground outline-none cursor-text disabled:cursor-not-allowed',
});

const Input = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function Input(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={inputStyle({ className })} {...props} />;
});

const InputIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'size'>>(function InputIcon({ className, ...props }, ref) {
  return <Icon ref={ref} size="none" {...props} className={inputIconStyle({ className })} />;
});

/** A button when it has an onClick (a clear or reveal control), otherwise a plain wrapper for an icon. */
const InputSlot = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(function InputSlot(
  { className, onClick, ...props },
  ref
) {
  if (!onClick) {
    return <span className={inputSlotStyle({ className })} {...(props as React.ComponentPropsWithoutRef<'span'>)} />;
  }
  return <button ref={ref} type="button" onClick={onClick} className={inputSlotStyle({ className })} {...props} />;
});

type IInputFieldProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange'> & {
  /** Gives the new text directly, so callers do not unwrap the event */
  onChangeText?: (text: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const InputField = React.forwardRef<HTMLInputElement, IInputFieldProps>(function InputField(
  { className, onChangeText, onChange, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={inputFieldStyle({ className })}
      onChange={(e) => {
        onChange?.(e);
        onChangeText?.(e.target.value);
      }}
      {...props}
    />
  );
});

Input.displayName = 'Input';
InputIcon.displayName = 'InputIcon';
InputSlot.displayName = 'InputSlot';
InputField.displayName = 'InputField';

export { Input, InputField, InputIcon, InputSlot };
