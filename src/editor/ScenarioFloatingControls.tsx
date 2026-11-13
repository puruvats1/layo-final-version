import React from 'react';
import { Undo2, Redo2, Check } from 'lucide-react';
import { ScenarioState } from '../types';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { glass } from '@/components/glass';

interface ScenarioFloatingControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  scenarioState: ScenarioState;
  onConfirmBox?: () => void;
  onToggleTooltipAction?: () => void;
  onShiftSideTable?: () => void;
  isDraggingAsset?: boolean;
  dragTargetName?: string;
  objectCount?: number;
}

export const ScenarioFloatingControls: React.FC<ScenarioFloatingControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  scenarioState,
  onConfirmBox,
  onToggleTooltipAction,
  onShiftSideTable,
  isDraggingAsset,
  dragTargetName,
}) => {
  return (
    <Box className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 1. LEFT FLOATING VERTICAL PILL: UNDO / REDO */}
      {/* Sits 30px under the top bar (54px tall), on the same 26px side margin */}
      <VStack className={`absolute top-[calc(var(--k-top)+var(--k-ctl)+var(--k-row))] left-edge w-[var(--k-ctl)] pointer-events-auto items-center p-0.5 rounded-full ${glass.clear}`}>
        <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} className="w-full h-[46px] rounded-full" aria-label="Undo">
          <ButtonIcon as={Undo2} className="h-[18px] w-[18px]" />
        </Button>
        <Divider className="w-6" />
        <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} className="w-full h-[46px] rounded-full" aria-label="Redo">
          <ButtonIcon as={Redo2} className="h-[18px] w-[18px]" />
        </Button>
      </VStack>

      {/* 3. IN-CANVAS FLOATING TOOLTIP ABOVE BOUNDING BOX */}
      {scenarioState.activeOverlayBox && (
        <VStack className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto items-center animate-in fade-in zoom-in-95">
          {scenarioState.boxTooltipMode === 'confirm' ? (
            // [Confirm] Pill
            <Button variant="ghost" size="sm" onClick={onConfirmBox} className={`rounded-full ${glass.clear}`}>
              <Center className="w-4 h-4 rounded-sm bg-primary">
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              </Center>
              <ButtonText>Confirm</ButtonText>
            </Button>
          ) : (
            // [?+ | -] Pill
            <HStack className={`relative px-3.5 py-1.5 rounded-full items-center gap-2 ${glass.clear}`}>
              <Button variant="ghost" size="sm" onClick={onToggleTooltipAction} className="rounded-full px-1 min-h-6" aria-label="Object Details / AI Suggestions">
                <ButtonText>?+</ButtonText>
              </Button>
              <Text size="xs" className="text-muted-foreground">|</Text>
              <Button variant="ghost" size="sm" onClick={onToggleTooltipAction} className="rounded-full px-1 min-h-6" aria-label="Remove Item">
                <Box className="w-2.5 h-0.5 bg-foreground rounded-full" />
              </Button>
            </HStack>
          )}
        </VStack>
      )}

      {/* 4. GHOST STATE INTERACTIVE SIDE TABLE RELOCATE */}
      {scenarioState.ghostStateActive && !scenarioState.ghostStateCommitted && (
        <VStack className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto items-center">
          <Button
            variant={scenarioState.sideTableHidingPlug ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onShiftSideTable}
            className={`rounded-full ${scenarioState.sideTableHidingPlug ? '' : `${glass.clear} animate-pulse`}`}
          >
            <ButtonIcon as={Check} />
            <ButtonText>
              {scenarioState.sideTableHidingPlug ? 'Side Table Shifted (Plug Hidden)' : 'Tap to move Side Table & hide plug'}
            </ButtonText>
          </Button>
        </VStack>
      )}

      {/* 5. DRAG INDICATOR */}
      {isDraggingAsset && (
        <Badge variant="outline" className={`absolute top-[34%] left-1/2 -translate-x-1/2 ${glass.clear}`}>
          <BadgeText>Placing {dragTargetName || 'Item'}…</BadgeText>
        </Badge>
      )}
    </Box>
  );
};
