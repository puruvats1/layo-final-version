import React, { useEffect, useRef, useState } from 'react';
import { X, Image as ImageIcon, Check } from 'lucide-react';
import { CaptureKind } from '../types';
import { SAMPLE_ROOM, GALLERY_PHOTOS } from '../data/onboardingData';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { glass, floatingIconButton } from '@/components/glass';

interface ScanScreenProps {
  kind: CaptureKind;
  onChangeKind: (kind: CaptureKind) => void;
  onBack: () => void;
  onScanCompleted: () => void;
}

const SWEEP_MS = 3600;

/**
 * Simulated capture. 360° = hold the shutter while "turning" (the photo pans),
 * a ring fills, then we pretend to process. Photo = one tap with a flash.
 * Either way the prototype continues with the sample room.
 */
export const ScanScreen: React.FC<ScanScreenProps> = ({ kind, onChangeKind, onBack, onScanCompleted }) => {
  const [phase, setPhase] = useState<'idle' | 'sweeping' | 'flash' | 'processing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    timers.current.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  const finish = () => {
    setPhase('processing');
    later(() => setPhase('done'), 1500);
    later(onScanCompleted, 2200);
  };

  const handleShutter = () => {
    if (phase !== 'idle') return;
    if (kind === 'zone') {
      setPhase('flash');
      later(finish, 260);
      return;
    }
    setPhase('sweeping');
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / SWEEP_MS);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else finish();
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const busy = phase !== 'idle';
  const isProject = kind === 'project';
  const ring = 2 * Math.PI * 36;

  return (
    <Box className="dark relative h-full w-full overflow-hidden bg-black select-none">
      {/* Viewfinder */}
      {isProject ? (
        <Box
          className={`absolute inset-0 bg-repeat-x ${phase === 'idle' ? 'k-pan' : ''}`}
          style={{
            backgroundImage: `url(${SAMPLE_ROOM.panoramaUrl})`,
            backgroundSize: 'auto 100%',
            backgroundPosition: phase === 'idle' ? undefined : `${progress * 100}% 50%`,
          }}
          aria-hidden
        />
      ) : (
        <Box
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${SAMPLE_ROOM.panoramaUrl})`, backgroundPosition: SAMPLE_ROOM.zonePhotoPosition }}
          aria-hidden
        />
      )}
      <Box className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/55 pointer-events-none" aria-hidden />
      {phase === 'flash' && <Box className="absolute inset-0 bg-white" style={{ animation: 'k-flash .3s ease-out both' }} />}

      {/* Top bar */}
      <HStack className="absolute top-0 inset-x-0 z-20 items-center justify-between px-edge pt-top">
        <Button variant="ghost" size="icon" onClick={onBack} className={floatingIconButton} aria-label="Close">
          <ButtonIcon as={X} className="h-5 w-5" />
        </Button>
        <Badge variant="outline" className={glass.clear}>
          <BadgeText>{isProject ? 'Whole room · 360°' : 'One corner · Photo'}</BadgeText>
        </Badge>
        <Box className="w-ctl" />
      </HStack>

      {/* Guidance */}
      {!busy && (
        <VStack className="absolute inset-0 z-10 items-center justify-center pointer-events-none px-8 animate-in fade-in" key={kind}>
          {isProject ? (
            <>
              <Box className="w-full max-w-xs h-px bg-white/70 relative">
                <Box className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.25)]" />
              </Box>
              <Box className={`mt-6 px-4 py-2 rounded-xl ${glass.clear}`}>
                <Text size="sm" className="text-center">
                  Stand in the middle of the room.{'\n'}Tap the button and turn slowly.
                </Text>
              </Box>
            </>
          ) : (
            <>
              <Box className="relative w-64 h-80 max-h-[50dvh]">
                {['top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl', 'top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl', 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl', 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl'].map((c) => (
                  <Box key={c} className={`absolute w-8 h-8 border-white ${c}`} />
                ))}
              </Box>
              <Box className={`mt-6 px-4 py-2 rounded-xl ${glass.clear}`}>
                <Text size="sm" className="text-center">Frame one area, like the desk or the bed corner.</Text>
              </Box>
            </>
          )}
        </VStack>
      )}

      {phase === 'sweeping' && (
        <HStack className="absolute top-[calc(var(--k-top)+var(--k-ctl)+var(--k-gap))] inset-x-0 z-10 justify-center pointer-events-none">
          <Badge variant="outline" className={glass.clear}>
            <BadgeText className="tabular-nums">Keep turning · {Math.round(progress * 100)}%</BadgeText>
          </Badge>
        </HStack>
      )}

      {/* Processing */}
      {(phase === 'processing' || phase === 'done') && (
        <Center className="absolute inset-0 z-30 p-8 animate-in fade-in">
          <VStack space="md" className={`rounded-3xl px-7 py-6 items-center max-w-xs ${glass.clear}`}>
            {phase === 'done' ? (
              <Center className="w-12 h-12 rounded-full bg-primary animate-in zoom-in-95">
                <Icon as={Check} size="xl" className="text-primary-foreground" />
              </Center>
            ) : (
              <Spinner size="large" color="white" />
            )}
            <Box className="items-center">
              <Heading size="sm">{phase === 'done' ? 'Captured' : 'Reading your room'}</Heading>
              <Text size="xs" className="text-muted-foreground mt-1 text-center">
                {phase === 'done' ? 'A few questions next.' : 'Finding walls, floor and furniture…'}
              </Text>
            </Box>
          </VStack>
        </Center>
      )}

      {/* Bottom controls */}
      <VStack className="absolute bottom-0 inset-x-0 z-20 pb-bottom items-center gap-row">
        <HStack
          className={`p-1 rounded-full transition-opacity ${glass.clear} ${busy ? 'opacity-0 pointer-events-none' : ''}`}
          role="tablist"
          aria-label="Capture type"
        >
          <Button
            variant={isProject ? 'default' : 'ghost'}
            onClick={() => onChangeKind('project')}
            className="rounded-full h-[46px] px-5"
            role="tab"
            aria-selected={isProject}
          >
            <ButtonText>Whole room</ButtonText>
          </Button>
          <Button
            variant={!isProject ? 'default' : 'ghost'}
            onClick={() => onChangeKind('zone')}
            className="rounded-full h-[46px] px-5"
            role="tab"
            aria-selected={!isProject}
          >
            <ButtonText>One corner</ButtonText>
          </Button>
        </HStack>

        <HStack className="w-full max-w-[430px] items-center justify-between px-edge">
          <Pressable
            onClick={() => setShowGallery(true)}
            disabled={busy}
            className={`${floatingIconButton} p-0.5 overflow-hidden`}
            role="button"
            aria-label="Pick from photos"
          >
            <Box
              className="w-full h-full rounded-full bg-cover"
              style={{ backgroundImage: `url(${GALLERY_PHOTOS[0].url})`, backgroundPosition: GALLERY_PHOTOS[0].position }}
              aria-hidden
            />
          </Pressable>

          <Pressable
            onClick={handleShutter}
            disabled={busy}
            className="relative w-20 h-20 rounded-full items-center justify-center"
            role="button"
            aria-label={isProject ? 'Start 360° scan' : 'Take photo'}
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80" aria-hidden>
              <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="4" />
              {phase === 'sweeping' && (
                <circle cx="40" cy="40" r="36" fill="none" style={{ stroke: 'rgb(var(--k-accent))' }} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={ring} strokeDashoffset={ring * (1 - progress)} />
              )}
            </svg>
            <Box className={`bg-white transition-all duration-200 ${phase === 'sweeping' ? 'w-7 h-7 rounded-lg' : 'w-[62px] h-[62px] rounded-full'}`} />
          </Pressable>

          <Box className="w-ctl" />
        </HStack>
      </VStack>

      {/* Pick an existing photo instead */}
      <Actionsheet isOpen={showGallery} onClose={() => setShowGallery(false)} title="Use a photo you have">
        <ActionsheetBackdrop className={glass.scrim} />
        <ActionsheetContent className={`mt-auto ${glass.dialog} pb-bottom`}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <HStack className="w-full items-center justify-between mb-4">
            <HStack space="sm" className="items-center">
              <Icon as={ImageIcon} size="sm" />
              <Heading size="sm">Use a photo you have</Heading>
            </HStack>
            <Button variant="ghost" size="icon" onClick={() => setShowGallery(false)} className="rounded-full" aria-label="Close">
              <ButtonIcon as={X} />
            </Button>
          </HStack>
          <Box className="w-full grid grid-cols-3 gap-2">
            {GALLERY_PHOTOS.slice(0, 6).map((p) => (
              <Pressable
                key={p.id}
                onClick={() => { setShowGallery(false); finish(); }}
                className="aspect-square rounded-xl overflow-hidden"
              >
                <Box
                  className="w-full h-full bg-cover"
                  style={{ backgroundImage: `url(${p.url})`, backgroundPosition: p.position }}
                  role="img"
                  aria-label={p.title}
                />
              </Pressable>
            ))}
          </Box>
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
};
