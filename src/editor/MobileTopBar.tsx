import React from 'react';
import { Home, List, Check, MoreHorizontal, Sparkles, X } from 'lucide-react';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { glass, floatingIconButton } from '@/components/glass';

interface MobileTopBarProps {
  roomName?: string;
  isGhostStateActive?: boolean;
  /** Anything waiting for Confirm: moved furniture boxes or new wireframes */
  hasStagedWireframes?: boolean;
  stagedCount?: number;
  isConfirmingGlow?: boolean;
  isDetectionPhase?: boolean;
  identificationStep?: string;
  onCommitGhostState?: () => void;
  onConfirmStagedWireframes?: () => void;
  onDiscardStaged?: () => void;
  onGoHome?: () => void;
  onOpenLayersList?: () => void;
  onOpenOptionsMenu?: () => void;
}

/**
 * Home + room name on the left; the object list and more on the right. All clear glass, so the
 * room stays visible behind every control. While something waits for Confirm, the name steps
 * aside to make room for Discard and Confirm.
 */
export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  roomName = "Aarav's Room",
  isGhostStateActive = false,
  hasStagedWireframes = false,
  stagedCount = 0,
  isConfirmingGlow = false,
  isDetectionPhase = false,
  identificationStep = 'completed',
  onCommitGhostState,
  onConfirmStagedWireframes,
  onDiscardStaged,
  onGoHome,
  onOpenLayersList,
  onOpenOptionsMenu,
}) => {
  const isDetecting = isDetectionPhase || identificationStep !== 'completed';
  const hasPending = !isDetecting && (hasStagedWireframes || isGhostStateActive);

  return (
    <HStack className="absolute top-0 left-0 right-0 z-40 px-edge pt-top items-center justify-between gap-4 pointer-events-none">
      <HStack className={`pointer-events-auto h-[var(--k-ctl)] p-1 rounded-full items-center gap-2.5 min-w-0 ${glass.clear} ${hasPending ? '' : 'flex-1 max-w-[180px] pr-5'}`}>
        <Button
          variant="secondary"
          size="icon"
          onClick={onGoHome}
          className="rounded-full h-[46px] w-[46px] shrink-0"
          aria-label={`Back to Home from ${roomName}`}
        >
          <ButtonIcon as={Home} className="h-5 w-5" />
        </Button>
        {!hasPending && <Text size="sm" bold className="truncate">{roomName}</Text>}
      </HStack>

      <HStack className={`items-center pointer-events-auto shrink-0 ${hasPending ? 'gap-3' : 'gap-gap'}`}>
        {hasPending ? (
          <>
            {hasStagedWireframes && onDiscardStaged && !isConfirmingGlow && (
              <Button variant="ghost" size="icon" onClick={onDiscardStaged} className={floatingIconButton} aria-label="Discard moves">
                <ButtonIcon as={X} className="h-5 w-5" />
              </Button>
            )}
            <Button
              onClick={() => {
                if (hasStagedWireframes) onConfirmStagedWireframes?.();
                else onCommitGhostState?.();
              }}
              disabled={isConfirmingGlow}
              className={`rounded-full h-[var(--k-ctl)] px-5 ${isConfirmingGlow ? 'animate-pulse' : ''}`}
              aria-label={
                isConfirmingGlow
                  ? 'Placing'
                  : hasStagedWireframes
                    ? `Confirm${stagedCount > 0 ? ` ${stagedCount}` : ''}, place moved pieces`
                    : 'Confirm, keep the suggested layout'
              }
            >
              {isConfirmingGlow ? (
                <>
                  <ButtonIcon as={Sparkles} className="animate-spin" />
                  <ButtonText>Placing…</ButtonText>
                </>
              ) : (
                <>
                  <ButtonIcon as={Check} />
                  <ButtonText className="tabular-nums">Confirm{stagedCount > 0 ? ` ${stagedCount}` : ''}</ButtonText>
                </>
              )}
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={onOpenLayersList} className={floatingIconButton} aria-label="Objects and fixed items">
            <ButtonIcon as={List} className="h-5 w-5" />
          </Button>
        )}

        {/* While moves wait, the only decision is Confirm or Discard. Dropping More keeps the bar
            inside 320px (it overlapped Home there) and keeps the choice focused. */}
        {!hasPending && (
          <Button variant="ghost" size="icon" onClick={onOpenOptionsMenu} className={floatingIconButton} aria-label="More options">
            <ButtonIcon as={MoreHorizontal} className="h-5 w-5" />
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

