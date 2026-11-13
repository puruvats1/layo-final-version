import React from 'react';
import { Sparkles, X, ListChecks } from 'lucide-react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Center } from '@/components/ui/center';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { PromptInput, PromptInputBody, PromptInputTextarea, PromptInputSubmit } from '@/components/ui/chat-ai';
import { glass } from '@/components/glass';
import { MAX_PROMPT_CHARS } from '../utils/askGemini';

/*
 * The AI prompt, in two pieces so the dock can animate between "AI button" and "prompt bar":
 *  - AiPromptForm: the input row that lives inside the dock.
 *  - AiPromptContext: what the prompt applies to, and a few things worth asking, above the dock.
 */

export type PromptInputHandle = { focus: () => void; blur: () => void };

interface FormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  /** The AI is working: the input locks and the send button shows progress */
  busy: boolean;
  inputRef: React.RefObject<PromptInputHandle | null>;
  onClose?: () => void;
  /** False while the form is tucked away inside the AI button */
  active?: boolean;
}

export const AiPromptForm: React.FC<FormProps> = ({ value, onChange, onSubmit, placeholder, busy, inputRef, onClose, active = true }) => (
  <Box className="w-full h-full" aria-hidden={!active} inert={!active}>
    <PromptInput
      value={value}
      onChangeText={onChange}
      onSubmit={() => onSubmit()}
      isBusy={busy}
      onEscape={onClose}
      className="h-full bg-transparent px-2.5 py-0 justify-center"
    >
      <PromptInputBody className="pt-0">
        <Center className="w-10 h-10 rounded-full bg-secondary shrink-0" aria-hidden>
          <Icon as={Sparkles} size="md" />
        </Center>
        <PromptInputTextarea
          ref={inputRef as React.Ref<never>}
          placeholder={placeholder}
          aria-label="Ask AI"
          maxLength={MAX_PROMPT_CHARS}
          className="text-base px-1"
        />
        <PromptInputSubmit aria-label="Send to AI" className="mx-0 h-11 w-11" />
      </PromptInputBody>
    </PromptInput>
  </Box>
);

interface ContextProps {
  /** What the prompt is about. Empty means the whole room. */
  targets: string[];
  onRemoveTarget: (index: number) => void;
  /** Things worth asking here, one tap to send */
  suggestions: string[];
  onSuggest: (text: string) => void;
  /** Opens the guided, step-by-step plan (not a list of things to ask) */
  onOpenWalkthrough?: () => void;
  onClose: () => void;
  /** Tab order: false while the prompt is closed */
  active?: boolean;
}

export const AiPromptContext: React.FC<ContextProps> = ({ targets, onRemoveTarget, suggestions, onSuggest, onOpenWalkthrough, onClose, active = true }) => (
  <HStack className="items-center gap-2" inert={!active}>
    {/* The row scrolls sideways; the fade on the right edge says there is more */}
    <HStack className="flex-1 min-w-0 items-center gap-2 overflow-x-auto py-0.5 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)]">
      {/* Scope is always visible, so it is clear what a prompt will change */}
      {targets.length === 0 ? (
        <Badge variant="outline" className={`h-9 px-4 shrink-0 ${glass.clear}`}>
          <BadgeText>Whole room</BadgeText>
        </Badge>
      ) : (
        targets.map((name, i) => (
          <HStack key={`${name}-${i}`} className={`h-9 pl-4 pr-1.5 rounded-full items-center gap-1 shrink-0 ${glass.clear}`}>
            <Text size="xs" bold>{name}</Text>
            <Button variant="ghost" size="icon" onClick={() => onRemoveTarget(i)} className="rounded-full h-6 w-6 min-h-6 min-w-6 p-0" aria-label={`Stop editing ${name}`}>
              <ButtonIcon as={X} className="h-3.5 w-3.5" />
            </Button>
          </HStack>
        ))
      )}
      {suggestions.map((text) => (
        <Button key={text} variant="ghost" size="sm" onClick={() => onSuggest(text)} className={`h-9 rounded-full shrink-0 ${glass.clear}`}>
          <ButtonText>{text}</ButtonText>
        </Button>
      ))}
      {onOpenWalkthrough && (
        <Button variant="ghost" size="sm" onClick={onOpenWalkthrough} className={`h-9 rounded-full shrink-0 ${glass.clear}`}>
          <ButtonIcon as={ListChecks} />
          <ButtonText>Guide me</ButtonText>
        </Button>
      )}
    </HStack>
    <Button variant="ghost" size="icon" onClick={onClose} className={`h-9 w-9 rounded-full shrink-0 ${glass.clear}`} aria-label="Close AI">
      <ButtonIcon as={X} />
    </Button>
  </HStack>
);
