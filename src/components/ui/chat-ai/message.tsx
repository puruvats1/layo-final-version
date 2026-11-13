/*
 * Chat message: a role (user or assistant) shapes how its content sits and what the toolbar shows.
 */
import React, { createContext, memo, useContext, useMemo } from 'react';
import { cn } from '../utils/tv';

export type MessageRole = 'user' | 'assistant' | 'system';

type MessageContextType = { role: MessageRole };

const MessageContext = createContext<MessageContextType | null>(null);

const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) throw new Error('MessageContent and other children must be used inside <Message>');
  return context;
};

export type MessageProps = {
  role: MessageRole;
  children: React.ReactNode;
  className?: string;
};

export const Message = memo(({ role, children, className }: MessageProps) => {
  const contextValue = useMemo(() => ({ role }), [role]);
  return (
    <MessageContext.Provider value={contextValue}>
      <div className={cn('group flex w-full max-w-[95%] flex-col gap-2', role === 'user' && 'mt-4', className)}>{children}</div>
    </MessageContext.Provider>
  );
});

export type MessageContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const MessageContent = memo(({ children, className }: MessageContentProps) => {
  const { role } = useMessageContext();
  const roleStyles = role === 'user' ? 'self-end bg-muted max-w-[90%] px-4' : 'self-start';
  return (
    <div className={cn('flex w-fit min-w-0 flex-col justify-center gap-2 overflow-hidden text-base py-3 rounded-3xl', roleStyles, className)}>
      {children}
    </div>
  );
});

/** Plain-text response */
export const MessageResponse = memo(({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn('text-lg text-foreground m-0', className)}>{children}</p>
));

export type MessageToolbarProps = {
  children: React.ReactNode;
  className?: string;
};

export const MessageToolbar = memo(({ children, className }: MessageToolbarProps) => {
  const { role } = useMessageContext();
  if (role === 'user') return null;
  return <div className={cn('-mt-4 ml-2 flex flex-row items-center gap-3 self-start', className)}>{children}</div>;
});
