import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  RotateCcw,
  Shield,
  Wind,
  Armchair,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { ScenarioState, ScenarioStepId } from '../types';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Divider } from '@/components/ui/divider';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import {
  Message,
  MessageContent,
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputSubmit,
} from '@/components/ui/chat-ai';
import { glass } from '@/components/glass';
import { MAX_PROMPT_CHARS } from '../utils/askGemini';

interface AIScenarioSheetProps {
  scenarioState: ScenarioState;
  onAdvanceScenario: (nextStep: ScenarioStepId) => void;
  onSelectOption?: (opt: 1 | 2) => void;
  onProceedToFullGhost?: () => void;
  onSelectPalette: (palette: 'warm_studio' | 'cool_pastel') => void;
  onCustomUserMessage: (msg: string) => void;
  /** The conversation so far, oldest first; the AI's replies stay readable here */
  messages?: { id: number; role: 'user' | 'assistant'; text: string }[];
  /** Show only the conversation, without the guided steps (for questions about specific pieces) */
  repliesOnly?: boolean;
  onToggleMoodItem?: (key: keyof ScenarioState) => void;
  onFillTableWithAi?: (desc: string) => void;
  onShiftSideTable?: () => void;
  onOpenAssetsDrawer?: () => void;
  isAiGenerating?: boolean;
  onClose?: () => void;
}

/** The step's main action */
const Primary: React.FC<{ onPress: () => void; icon?: LucideIcon; iconRight?: LucideIcon; children: string; className?: string }> = ({ onPress, icon, iconRight, children, className = '' }) => (
  <Button size="sm" onClick={onPress} className={`rounded-full ${className}`}>
    {icon && <ButtonIcon as={icon} />}
    <ButtonText>{children}</ButtonText>
    {iconRight && <ButtonIcon as={iconRight} />}
  </Button>
);

/** A secondary choice next to the main action */
const Secondary: React.FC<{ onPress: () => void; children: string }> = ({ onPress, children }) => (
  <Button variant="outline" size="sm" onClick={onPress} className="rounded-full">
    <ButtonText>{children}</ButtonText>
  </Button>
);

/** On/off item (mood board, outlet) */
const Toggle: React.FC<{ on: boolean; onPress: () => void; label: string; className?: string }> = ({ on, onPress, label, className = '' }) => (
  <Button variant={on ? 'default' : 'secondary'} size="sm" onClick={onPress} className={`justify-start ${className}`} aria-pressed={on}>
    <ButtonIcon as={Check} className={on ? '' : 'opacity-30'} />
    <ButtonText className="truncate">{label}</ButtonText>
  </Button>
);

const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text size="xs" className="leading-relaxed text-muted-foreground">{children}</Text>
);

export const AIScenarioSheet: React.FC<AIScenarioSheetProps> = ({
  scenarioState,
  onAdvanceScenario,
  onSelectOption,
  onProceedToFullGhost,
  onSelectPalette,
  onCustomUserMessage,
  messages = [],
  repliesOnly = false,
  onToggleMoodItem,
  onFillTableWithAi,
  onShiftSideTable,
  isAiGenerating = false,
  onClose
}) => {
  const [deskDescription, setDeskDescription] = useState('Dual monitors, mechanical keyboard, leather desk pad');

  // The scenario is scripted, but the user never sees it as steps: no numbering, no step names.
  const step = scenarioState.currentStep;

  const handleTriggerFillDesk = () => {
    if (onFillTableWithAi) {
      onFillTableWithAi(deskDescription);
    } else {
      onCustomUserMessage(`Fill table with description: ${deskDescription}`);
    }
  };

  const proceedToGhost = () => {
    if (onProceedToFullGhost) onProceedToFullGhost();
    else onAdvanceScenario('5_ghost_state');
  };

  const activeOption = scenarioState.activeOption || 2;

  return (
    <HStack className="fixed bottom-[calc(var(--k-bottom)+var(--k-dock)+var(--k-gap))] inset-x-0 z-40 px-edge pointer-events-none justify-center animate-in slide-in-from-bottom-2">
      {/* Header, conversation and input stay put; only the guided steps scroll, so a new reply is never scrolled out of view */}
      <VStack className={`pointer-events-auto w-full max-w-md max-h-[60vh] rounded-3xl p-4 gap-2.5 ${glass.panel}`}>
        {/* Top Header Bar */}
        <HStack className="items-center justify-between shrink-0">
          <HStack className="items-center gap-2">
            <Center className="w-6 h-6 rounded-full bg-secondary">
              <Icon as={Sparkles} size="xs" />
            </Center>
            <Text size="xs" bold>AI</Text>
          </HStack>

          {onClose && (
            <Button variant="outline" size="icon" onClick={onClose} className="rounded-full h-6 w-6 min-h-6 min-w-6 p-0" aria-label="Close AI">
              <ButtonIcon as={X} className="h-3 w-3" />
            </Button>
          )}
        </HStack>

        {/* What was asked and what the AI said (last exchange), so the newest reply can be read again
            after the toast is gone. It scrolls on its own if a long reply needs it. */}
        {(messages.length > 0 || isAiGenerating) && (
          <VStack className="gap-1 shrink-0 max-h-[30vh] overflow-y-auto" aria-live="polite">
            {messages.slice(-2).map((m) => (
              <Message key={m.id} role={m.role} className="max-w-full">
                <MessageContent className="py-1.5 px-3">
                  <Text size="xs" className={m.role === 'user' ? '' : 'leading-relaxed'}>{m.text}</Text>
                </MessageContent>
              </Message>
            ))}
            {isAiGenerating && <Text size="xs" className="text-muted-foreground px-3">Thinking…</Text>}
          </VStack>
        )}

        {/* Guided steps: the assistant's turn. Hidden when the sheet only answers a question about pieces. */}
        {!repliesOnly && (
        <Box className="min-h-0 overflow-y-auto">
        <Message role="assistant" className="max-w-full">
          <MessageContent className="w-full py-0 gap-2.5">
            {/* STEP 1: Bed Temporarily Fixed */}
            {step === '1_bed_fixed' && (
              <VStack className="gap-2.5 animate-in fade-in">
                <Note>The bed catches the AC airflow, keeps the wardrobe and window clear, and has an outlet within reach.</Note>
                <Primary onPress={() => onAdvanceScenario('2_table_privacy_concern')} iconRight={ArrowRight}>Place the desk by the window</Primary>
              </VStack>
            )}

            {/* STEP 2: Table Privacy Concern */}
            {step === '2_table_privacy_concern' && (
              <VStack className="gap-2.5 animate-in fade-in">
                <HStack className="items-center gap-2 p-2.5 rounded-2xl bg-destructive/15 border border-destructive/30">
                  <Icon as={Shield} size="sm" className="text-destructive" />
                  <Text size="xs" className="text-destructive">Low privacy: the desk is in direct view of the entry door.</Text>
                </HStack>
                <Box className="grid grid-cols-2 gap-2">
                  <Primary
                    icon={Sparkles}
                    onPress={() => {
                      onAdvanceScenario('3_two_options');
                      onSelectOption?.(2);
                    }}
                  >
                    See options
                  </Primary>
                  <Secondary onPress={() => onAdvanceScenario('4_option2_selected')}>Keep it</Secondary>
                </Box>
              </VStack>
            )}

            {/* STEP 3: Two Options with Live Segmented Toggle */}
            {step === '3_two_options' && (
              <VStack className="gap-2.5 animate-in fade-in">
                <HStack className="p-1 rounded-2xl bg-muted gap-1">
                  {([1, 2] as const).map((opt) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={activeOption === opt ? 'default' : 'ghost'}
                      onClick={() => onSelectOption?.(opt)}
                      className="flex-1 rounded-full"
                    >
                      <ButtonText>{opt === 1 ? 'Privacy' : 'Near power'}</ButtonText>
                    </Button>
                  ))}
                </HStack>

                <Box className="p-2.5 rounded-2xl bg-muted">
                  <Note>
                    {activeOption === 1
                      ? 'The top-left window gives more privacy and daylight. Power needs an extension cord, and the entry stays open.'
                      : 'Under the AC window, power stays close. A slatted divider behind the desk brings the privacy back.'}
                  </Note>
                </Box>

                <Primary onPress={proceedToGhost} iconRight={ArrowRight}>{activeOption === 1 ? 'Use privacy option' : 'Use near-power option'}</Primary>
              </VStack>
            )}

            {/* STEP 4: Option 2 Applied */}
            {step === '4_option2_selected' && (
              <VStack className="gap-2.5 animate-in fade-in">
                <Note>The desk and divider are in place. Plan the rest of the furniture?</Note>
                <Box className="grid grid-cols-2 gap-2">
                  <Primary icon={Sparkles} onPress={proceedToGhost}>Plan the rest</Primary>
                  <Secondary onPress={() => onAdvanceScenario('7_fan_added')}>Later</Secondary>
                </Box>
              </VStack>
            )}

            {/* STEP 5: Ghost State Proposal */}
            {step === '5_ghost_state' && (
              <VStack className="gap-2.5 animate-in fade-in">
                <VStack className="gap-1">
                  <Note>• <Text size="xs" bold>Wardrobe:</Text> stays in its alcove</Note>
                  <Note>• <Text size="xs" bold>Dressing table:</Text> beside the wardrobe, for getting ready</Note>
                  <Note>• <Text size="xs" bold>Side table:</Text> in the corner, so the floor is easy to clean</Note>
                </VStack>
                <HStack className="gap-2">
                  <Toggle
                    className="flex-1 justify-center rounded-full"
                    on={!!scenarioState.sideTableHidingPlug}
                    onPress={() => onShiftSideTable?.()}
                    label={scenarioState.sideTableHidingPlug ? 'Plug hidden' : 'Hide the plug'}
                  />
                  <Primary className="flex-1" icon={Check} onPress={() => onAdvanceScenario('6_side_table_moved')}>Confirm layout</Primary>
                </HStack>
              </VStack>
            )}

            {/* STEP 6: Side Table Moved & Missing Fan */}
            {step === '6_side_table_moved' && (
              <VStack className="gap-2.5 animate-in fade-in">
                <Note>The plug is hidden. Add a pedestal fan by the window for airflow?</Note>
                <Primary icon={Wind} onPress={() => onAdvanceScenario('7_fan_added')}>Add pedestal fan</Primary>
              </VStack>
            )}

            {/* STEP 7: Fan Added & Discrepancy Check */}
            {step === '7_fan_added' && (
              <VStack className="gap-2.5 animate-in fade-in">
                <Note>No conflicts. The fan gives a cross-breeze, and the middle of the floor stays open for workouts or seating.</Note>
                <Primary icon={Sparkles} onPress={() => onAdvanceScenario('8_personalization')}>Personalize</Primary>
              </VStack>
            )}

            {/* STEP 8: Personalization (Work Studio) */}
            {step === '8_personalization' && (
              <VStack className="gap-2 animate-in fade-in">
                <Box className="grid grid-cols-2 gap-1.5">
                  <Toggle on={!!scenarioState.hasVerticalStorage} onPress={() => onToggleMoodItem?.('hasVerticalStorage')} label="Vertical storage" />
                  <Toggle on={!!scenarioState.hasStorageLamp} onPress={() => onToggleMoodItem?.('hasStorageLamp')} label="Storage lamp" />
                  <Toggle on={!!scenarioState.hasPlant} onPress={() => onToggleMoodItem?.('hasPlant')} label="Monstera plant" />
                  <Toggle on={!!scenarioState.hasCarpet} onPress={() => onToggleMoodItem?.('hasCarpet')} label="Woven carpet" />
                </Box>

                <HStack className="items-center gap-1.5 pt-0.5">
                  <Input className="flex-1 h-8 rounded-xl">
                    <InputField
                      value={deskDescription}
                      onChangeText={setDeskDescription}
                      placeholder="What goes on the desk?"
                      maxLength={80}
                      className="text-xs"
                    />
                  </Input>
                  <Secondary onPress={handleTriggerFillDesk}>Fill desk</Secondary>
                </HStack>

                <Primary className="mt-1" iconRight={ArrowRight} onPress={() => onAdvanceScenario('9_color_palette')}>Choose colors</Primary>
              </VStack>
            )}

            {/* STEP 9: Color Palette & Social Seating */}
            {step === '9_color_palette' && (
              <VStack className="gap-2.5 animate-in fade-in">
                <Box className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'warm_studio', label: 'Warm Studio', colors: ['#b85d43', '#d47355', '#fef3c7'] },
                    { id: 'cool_pastel', label: 'Cool Pastel', colors: ['#94b8c7', '#d0e8f2', '#93c5fd'] },
                  ] as const).map((p) => (
                    <Pressable
                      key={p.id}
                      onClick={() => onSelectPalette(p.id)}
                      className={`p-2.5 rounded-2xl items-center gap-1.5 bg-muted ${scenarioState.palette === p.id ? 'ring-2 ring-primary' : ''}`}
                      aria-pressed={scenarioState.palette === p.id}
                    >
                      <HStack className="w-full h-5 rounded-lg overflow-hidden">
                        {p.colors.map((c) => <Box key={c} className="flex-1" style={{ background: c }} />)}
                      </HStack>
                      <Text size="2xs" bold>{p.label}</Text>
                    </Pressable>
                  ))}
                </Box>

                <HStack className="p-2 rounded-2xl bg-muted items-center gap-2">
                  <Icon as={Armchair} size="sm" />
                  <Note>Tip: a folding chair tucks away, or opens up for guests.</Note>
                </HStack>

                <Primary icon={Check} onPress={() => onAdvanceScenario('10_final_space')}>Finish</Primary>
              </VStack>
            )}

            {/* STEP 10: Space Completed */}
            {step === '10_final_space' && (
              <VStack className="gap-2.5 animate-in fade-in">
                <VStack className="gap-1">
                  {[
                    'Bed: AC airflow, charging within reach',
                    'Desk: daylight, with a divider for privacy',
                    'Plug: hidden behind the side table',
                    'Middle: open for workouts and guests',
                  ].map((line) => (
                    <HStack key={line} className="items-center gap-1.5">
                      <Icon as={Check} size="2xs" className="text-muted-foreground" />
                      <Note>{line}</Note>
                    </HStack>
                  ))}
                </VStack>
                <Button variant="outline" size="sm" onClick={() => onAdvanceScenario('1_bed_fixed')} className="rounded-full">
                  <ButtonIcon as={RotateCcw} />
                  <ButtonText>Start over</ButtonText>
                </Button>
              </VStack>
            )}
          </MessageContent>
        </Message>
        </Box>
        )}

        {/* Minimal Chat Prompt Bar: the user's turn */}
        <Divider />
        <PromptInput onSubmit={({ text }) => onCustomUserMessage(text)} isBusy={isAiGenerating} className="py-1 px-1.5 rounded-full shrink-0">
          <PromptInputBody className="pt-0">
            <PromptInputTextarea placeholder="Ask AI…" aria-label="Ask AI" maxLength={MAX_PROMPT_CHARS} className="text-xs px-2" />
            <PromptInputSubmit aria-label="Send message" className="mx-0 h-8 w-8" />
          </PromptInputBody>
        </PromptInput>
      </VStack>
    </HStack>
  );
};
