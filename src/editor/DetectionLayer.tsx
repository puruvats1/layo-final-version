import React from 'react';
import { Pencil, X, Sparkles, Move, RotateCcw, Check, Trash2, Plus, ChevronDown, Hand, PenLine } from 'lucide-react';
import { DetectionLabel } from '../data/detectionLabels';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { glass } from '@/components/glass';

/** Small round icon button inside a glass tag */
const TAG_ICON_BTN = 'rounded-full h-7 w-7 min-h-7 min-w-7 p-0';
/** Floating bar under the top bar while a detection is edited or drawn */
const EDIT_BAR = 'absolute top-[calc(var(--k-top)+var(--k-ctl)+var(--k-gap)+56px)] left-1/2 -translate-x-1/2 z-50 w-[min(94%,23rem)] rounded-2xl pl-3 pr-1.5 py-1.5 items-center gap-2 animate-in fade-in slide-in-from-top-2 select-none';

export interface DetectionItem {
  id: string;
  name: string;
  vertexCount: number;
}

export type AddState = null | 'pick' | { label: string };

interface DetectionLayerProps {
  /** Step 1 shows fixed fixtures with inline actions; step 2 shows furniture that opens a menu. */
  step: 'constraints' | 'assets';
  items: DetectionItem[];
  activeId: string | null;
  editingId: string | null;
  hasOverride: boolean;
  labels: DetectionLabel[];
  adding: AddState;
  /** While drawing, lets the camera move instead of drawing */
  lookAround: boolean;
  relabelOpen: boolean;
  /** The viewer moves every piece each frame to follow the camera, so it needs the elements. */
  register: (key: string, el: Element | null) => void;
  onActivate: (id: string | null) => void;
  onAdjust: (id: string) => void;
  onRemove: (id: string) => void;
  onEditWithAi?: (id: string) => void;
  onDragStart: (id: string, kind: 'move' | number, e: React.PointerEvent) => void;
  onReset: (id: string) => void;
  onDone: () => void;
  onStartAdd: () => void;
  onPickLabel: (label: string) => void;
  onCancelAdd: () => void;
  onSetLookAround: (on: boolean) => void;
  onOpenRelabel: () => void;
  onRelabel: (label: string) => void;
  onCloseRelabel: () => void;
}

/**
 * Detections drawn over the image: an outline pinned to the object's corners, and a tag to correct
 * it. Nothing here lights up the room itself, so a wrong guess can be fixed, relabelled or dropped.
 */
export const DetectionLayer: React.FC<DetectionLayerProps> = ({
  step, items, activeId, editingId, hasOverride, labels, adding, lookAround, relabelOpen,
  register, onActivate, onAdjust, onRemove, onEditWithAi, onDragStart, onReset, onDone,
  onStartAdd, onPickLabel, onCancelAdd, onSetLookAround, onOpenRelabel, onRelabel, onCloseRelabel,
}) => {
  const editing = editingId ? items.find((i) => i.id === editingId) : undefined;
  // While one is being adjusted, or a new one drawn, it is the only thing on screen
  const shown = editing ? [editing] : adding ? [] : items;
  const drawing = adding && adding !== 'pick' ? adding : null;

  const closeSheet = adding === 'pick' ? onCancelAdd : onCloseRelabel;

  return (
    <>
      {shown.map((item) => {
        const isEditing = item.id === editingId;
        const isActive = item.id === activeId;
        const stroke = isEditing ? 'rgb(var(--k-accent))' : '#fff';
        const fill = isEditing ? 'rgb(var(--k-accent) / 0.16)' : isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)';

        return (
          <Box
            key={item.id}
            ref={(el) => register(`wrap_${item.id}`, el)}
            data-top={isEditing || isActive ? '1' : '0'}
            style={{ display: 'none' }}
            className="absolute inset-0 pointer-events-none select-none"
          >
            <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ touchAction: 'none' }} aria-hidden>
              <polygon ref={(el) => register(`halo_${item.id}`, el)} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={4} strokeLinejoin="round" />
              <polygon
                ref={(el) => register(`poly_${item.id}`, el)}
                strokeWidth={isEditing ? 2.25 : 1.5}
                strokeDasharray={isEditing || isActive ? undefined : '6 5'}
                strokeLinejoin="round"
                // fill/stroke via style so the --k-accent token resolves (SVG attributes don't read CSS vars)
                style={{ fill, stroke, pointerEvents: isEditing ? 'all' : 'none', cursor: 'move', touchAction: 'none' }}
                onPointerDown={isEditing ? (e) => onDragStart(item.id, 'move', e) : undefined}
              />
            </svg>

            {isEditing && Array.from({ length: item.vertexCount }, (_, i) => (
              <Center
                key={i}
                ref={(el) => register(`h${i}_${item.id}`, el)}
                className="absolute left-0 top-0 w-11 h-11 -ml-[22px] -mt-[22px] pointer-events-auto cursor-grab"
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => onDragStart(item.id, i, e)}
                role="slider"
                aria-label={`Corner ${i + 1} of ${item.name}`}
                aria-valuenow={i + 1}
              >
                <Box className="w-4 h-4 rounded-full bg-white border-2 border-primary shadow-hard-2" />
              </Center>
            ))}

            {/* Tag: above the shape, or below it when the shape is near the top of the screen */}
            <Box ref={(el) => register(`tag_${item.id}`, el)} className="group absolute left-0 top-0 w-0 h-0">
              <Box className="absolute left-0 -translate-x-1/2 bottom-0 mb-1.5 group-data-[flip=1]:bottom-auto group-data-[flip=1]:top-0 group-data-[flip=1]:mb-0 group-data-[flip=1]:mt-1.5 pointer-events-auto">
                {isEditing ? (
                  <Badge variant="outline" className={glass.clear}>
                    <BadgeText>{item.name}</BadgeText>
                  </Badge>
                ) : step === 'constraints' ? (
                  <HStack className={`h-8 pl-3 pr-1 rounded-full items-center gap-1 ${glass.clear}`}>
                    <Text size="xs" className="font-medium max-w-[120px] truncate">{item.name}</Text>
                    <Button variant="secondary" size="icon" onClick={() => onAdjust(item.id)} className={TAG_ICON_BTN} aria-label={`Adjust ${item.name}`}>
                      <ButtonIcon as={Pencil} className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className={TAG_ICON_BTN} aria-label={`Remove ${item.name} tag`}>
                      <ButtonIcon as={X} className="h-3.5 w-3.5" />
                    </Button>
                  </HStack>
                ) : isActive ? (
                  <VStack className={`gap-1.5 p-2.5 min-w-[196px] rounded-2xl animate-in zoom-in-95 ${glass.panel}`}>
                    <HStack className="items-center justify-between px-1">
                      <Text size="xs" bold className="truncate">{item.name}</Text>
                      <Button variant="outline" size="icon" onClick={() => onActivate(null)} className="rounded-full h-6 w-6 min-h-6 min-w-6 p-0" aria-label="Close menu">
                        <ButtonIcon as={X} className="h-3 w-3" />
                      </Button>
                    </HStack>
                    <Button size="sm" onClick={() => onEditWithAi?.(item.id)} className="rounded-full">
                      <ButtonIcon as={Sparkles} />
                      <ButtonText>Edit with AI</ButtonText>
                    </Button>
                    <HStack className="gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => onAdjust(item.id)} className="flex-1 rounded-full">
                        <ButtonIcon as={Move} />
                        <ButtonText>Adjust</ButtonText>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onRemove(item.id)} className="flex-1 rounded-full">
                        <ButtonIcon as={Trash2} />
                        <ButtonText>Remove tag</ButtonText>
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => onActivate(item.id)} className={`rounded-full ${glass.clear}`} aria-label={`Open ${item.name} options`}>
                    <Box className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <ButtonText className="max-w-[120px] truncate">{item.name}</ButtonText>
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}

      {/* Idle: how many were found, and a way to add one that was missed */}
      {!editing && !adding && (
        <HStack className={`absolute top-[calc(var(--k-top)+var(--k-ctl)+var(--k-gap)+56px)] left-1/2 -translate-x-1/2 z-40 h-10 pl-4 pr-1 rounded-full items-center gap-2 select-none ${glass.clear}`}>
          <Text size="xs" bold>{items.length} detected</Text>
          <Button variant="secondary" size="sm" onClick={onStartAdd} className="rounded-full" aria-label="Add a detection">
            <ButtonIcon as={Plus} />
            <ButtonText>Add</ButtonText>
          </Button>
        </HStack>
      )}

      {editing && (
        <HStack className={`${EDIT_BAR} ${glass.panel}`}>
          <Pressable
            onClick={onOpenRelabel}
            className="flex-1 min-w-0 rounded-xl px-1.5 py-0.5"
            aria-label={`Change label, currently ${editing.name}`}
          >
            <HStack className="items-center gap-1">
              <Text size="sm" bold className="truncate">{editing.name}</Text>
              <Icon as={ChevronDown} size="xs" className="text-muted-foreground" />
            </HStack>
            <Text size="2xs" className="text-muted-foreground">Drag the corners to fit.</Text>
          </Pressable>
          {hasOverride && (
            <Button variant="secondary" size="sm" onClick={() => onReset(editing.id)} className="rounded-full">
              <ButtonIcon as={RotateCcw} />
              <ButtonText>Reset</ButtonText>
            </Button>
          )}
          <Button size="sm" onClick={onDone} className="rounded-full">
            <ButtonIcon as={Check} />
            <ButtonText>Done</ButtonText>
          </Button>
        </HStack>
      )}

      {drawing && (
        <HStack className={`${EDIT_BAR} ${glass.panel}`}>
          <Box className="flex-1 min-w-0 pl-1">
            <Text size="sm" bold className="truncate">Draw a {drawing.label}</Text>
            <Text size="2xs" className="text-muted-foreground">{lookAround ? 'Look around, then switch back.' : 'Drag across it, or tap to place.'}</Text>
          </Box>
          <HStack className="p-0.5 rounded-full bg-muted" role="tablist" aria-label="Draw mode">
            <Button variant={!lookAround ? 'default' : 'ghost'} size="icon" onClick={() => onSetLookAround(false)} className="rounded-full" role="tab" aria-selected={!lookAround} aria-label="Draw">
              <ButtonIcon as={PenLine} />
            </Button>
            <Button variant={lookAround ? 'default' : 'ghost'} size="icon" onClick={() => onSetLookAround(true)} className="rounded-full" role="tab" aria-selected={lookAround} aria-label="Look around">
              <ButtonIcon as={Hand} />
            </Button>
          </HStack>
          <Button variant="secondary" size="icon" onClick={onCancelAdd} className="rounded-full" aria-label="Cancel">
            <ButtonIcon as={X} />
          </Button>
        </HStack>
      )}

      <Actionsheet isOpen={adding === 'pick' || relabelOpen} onClose={closeSheet} title={adding === 'pick' ? 'What is it?' : 'Change label'}>
        <ActionsheetBackdrop className={glass.scrim} />
        <ActionsheetContent className={`mt-auto w-full max-w-md self-center items-stretch p-5 pb-8 ${glass.dialog}`}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <HStack className="items-start justify-between gap-3 mb-4">
            <Box>
              <Heading size="lg">{adding === 'pick' ? 'What is it?' : 'Change label'}</Heading>
              <Text size="sm" className="text-muted-foreground mt-0.5">{adding === 'pick' ? 'Pick one, then draw it on the room.' : 'Pick what this really is.'}</Text>
            </Box>
            <Button variant="secondary" size="icon" onClick={closeSheet} className="rounded-full" aria-label="Close">
              <ButtonIcon as={X} />
            </Button>
          </HStack>
          <HStack className="flex-wrap gap-2">
            {labels.map((l) => (
              <Button
                key={l.name}
                variant={relabelOpen && editing?.name === l.name ? 'default' : 'outline'}
                onClick={() => (adding === 'pick' ? onPickLabel(l.name) : onRelabel(l.name))}
                className="rounded-full"
              >
                <ButtonText>{l.name}</ButtonText>
              </Button>
            ))}
          </HStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};
