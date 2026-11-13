import React, { useState } from 'react';
import { Sparkles, Trash2, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';
import { StagedObject } from '../types';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Divider } from '@/components/ui/divider';
import { Button, ButtonIcon } from '@/components/ui/button';
import { glass } from '@/components/glass';

interface ContextualObjectTagProps {
  object: StagedObject;
  onGenerateAiSuggestion: (obj: StagedObject) => void;
  onRemoveObject: (id: string) => void;
  onNudgeObject?: (id: string, dx: number, dz: number) => void;
  onMoveObject?: (obj: StagedObject) => void;
}

const SMALL_ROUND = 'rounded-full h-7 w-7 min-h-7 min-w-7 p-0';

const Nudge: React.FC<{ icon: LucideIcon; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <Button variant="outline" size="icon" onClick={onPress} className={SMALL_ROUND} aria-label={label}>
    <ButtonIcon as={icon} className="h-3.5 w-3.5" />
  </Button>
);

export const ContextualObjectTag: React.FC<ContextualObjectTagProps> = ({
  object,
  onGenerateAiSuggestion,
  onRemoveObject,
  onNudgeObject,
}) => {
  const [showMoveControls, setShowMoveControls] = useState(false);

  return (
    <VStack className="items-center pointer-events-auto animate-in fade-in zoom-in-95">
      {/* Optional Expanded Directional Nudge Pad */}
      {showMoveControls && onNudgeObject && (
        <VStack className={`mb-2 p-1.5 rounded-2xl items-center gap-1 animate-in slide-in-from-bottom-2 ${glass.panel}`}>
          <Nudge icon={ArrowUp} label="Move North" onPress={() => onNudgeObject(object.id, 0, -0.2)} />
          <HStack className="items-center gap-1">
            <Nudge icon={ArrowLeft} label="Move West" onPress={() => onNudgeObject(object.id, -0.2, 0)} />
            <Center className="w-6 h-6 rounded-md bg-secondary">
              <Icon as={Move} size="2xs" />
            </Center>
            <Nudge icon={ArrowRight} label="Move East" onPress={() => onNudgeObject(object.id, 0.2, 0)} />
          </HStack>
          <Nudge icon={ArrowDown} label="Move South" onPress={() => onNudgeObject(object.id, 0, 0.2)} />
        </VStack>
      )}

      {/* Main Contextual Tag Bubble (Attached directly above object wireframe) */}
      <HStack className={`relative px-3.5 py-2 rounded-full items-center gap-2.5 ${glass.panel}`}>
        <Text size="xs" bold className="truncate max-w-[130px]">{object.name}</Text>

        <Divider orientation="vertical" className="h-3.5" />

        <Button
          variant={showMoveControls ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setShowMoveControls((prev) => !prev)}
          className={SMALL_ROUND}
          aria-label="Move object"
        >
          <ButtonIcon as={Move} className="h-3.5 w-3.5" />
        </Button>

        <Button size="icon" onClick={() => onGenerateAiSuggestion(object)} className={SMALL_ROUND} aria-label="Generate AI suggestion">
          <ButtonIcon as={Sparkles} className="h-3.5 w-3.5" />
        </Button>

        <Button variant="destructive" size="icon" onClick={() => onRemoveObject(object.id)} className={SMALL_ROUND} aria-label="Remove object">
          <ButtonIcon as={Trash2} className="h-3.5 w-3.5" />
        </Button>

        {/* Downward triangle pointer attaching tag to wireframe top */}
        <Box className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-black/80" />
      </HStack>
    </VStack>
  );
};
