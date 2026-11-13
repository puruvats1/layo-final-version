import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Images,
  Sparkles,
  Move,
  Paintbrush,
  BedDouble,
  Armchair,
  Lamp,
  Sofa,
  LampDesk,
  Fan,
  ClipboardPaste,
  type LucideIcon,
} from 'lucide-react';
import { CaptureKind, MoodItem, UserPreferences } from '../types';
import {
  SAMPLE_ROOM,
  MOOD_PRESETS,
  MATCHED_PRESET_ID,
  MoodPreset,
  GALLERY_PHOTOS,
  PINTEREST_BOARD,
  presetToMoodItem,
  ROOM_TYPES,
  DETECTED_ROOM_TYPE,
  DEFAULT_DESCRIPTION,
  ACTIVITIES,
  PRIORITY_SUGGESTIONS,
  DEFAULT_PRIORITIES,
  PROCESSING_STEPS,
} from '../data/onboardingData';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { glass } from '@/components/glass';

export type { UserPreferences };

interface PreferencesFlowProps {
  captureKind: CaptureKind;
  /** Names already on Home, so the suggested name never duplicates one */
  existingNames?: string[];
  onClose: () => void;
  onComplete: (prefs: UserPreferences) => void;
}

const TOTAL = 5;
const PROCESSING_MS = 5200;
const CTL = 'h-[var(--k-ctl)]';

/** "Aarav's Room", then "Aarav's Room 2", "Aarav's Room 3"… */
const uniqueName = (base: string, taken: string[]) => {
  const used = new Set(taken.map((n) => n.trim().toLowerCase()));
  if (!used.has(base.toLowerCase())) return base;
  let i = 2;
  while (used.has(`${base} ${i}`.toLowerCase())) i++;
  return `${base} ${i}`;
};

export const PreferencesFlow: React.FC<PreferencesFlowProps> = ({ captureKind, existingNames = [], onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [sheet, setSheet] = useState<null | 'skip' | 'gallery' | 'pinterest'>(null);
  const [nudgeSources, setNudgeSources] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [prefs, setPrefs] = useState<UserPreferences>({
    roomName: uniqueName(captureKind === 'zone' ? SAMPLE_ROOM.zoneName : SAMPLE_ROOM.name, existingNames),
    captureKind,
    moodItems: [],
    vision: 'redesign',
    roomType: DETECTED_ROOM_TYPE,
    description: DEFAULT_DESCRIPTION,
    activities: [],
    priorities: DEFAULT_PRIORITIES,
  });

  const scanImage = SAMPLE_ROOM.panoramaUrl;
  const scanPosition = captureKind === 'zone' ? SAMPLE_ROOM.zonePhotoPosition : '30% 50%';

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [step]);

  // Step 3: pretend to read the scan + references, then the fields fill in
  useEffect(() => {
    if (step !== 3 || analyzed) return;
    const t = setTimeout(() => setAnalyzed(true), 1700);
    return () => clearTimeout(t);
  }, [step, analyzed]);

  const addMoodItems = (items: MoodItem[]) =>
    setPrefs((p) => ({ ...p, moodItems: [...p.moodItems.filter((m) => !items.some((i) => i.id === m.id)), ...items] }));
  const removeMoodItem = (id: string) => setPrefs((p) => ({ ...p, moodItems: p.moodItems.filter((m) => m.id !== id) }));
  const togglePreset = (preset: MoodPreset) =>
    prefs.moodItems.some((m) => m.id === preset.id) ? removeMoodItem(preset.id) : addMoodItems([presetToMoodItem(preset)]);

  // Skip with nothing added: offer the matched style first, then move on with whichever style they end on
  const handlePrimary = () => {
    if (step === 1 && prefs.moodItems.length === 0) setSheet('skip');
    else next();
  };
  const finishSkip = (preset: MoodPreset) => {
    addMoodItems([presetToMoodItem(preset)]);
    setSheet(null);
    next();
  };
  const addInstead = () => {
    setSheet(null);
    setNudgeSources(true);
  };
  useEffect(() => {
    if (!nudgeSources) return;
    const t = setTimeout(() => setNudgeSources(false), 2400);
    return () => clearTimeout(t);
  }, [nudgeSources]);

  // Pills write (or remove) their sentence in the description, so the user's own edits survive
  const toggleActivity = (label: string) => {
    const sentence = ACTIVITIES.find((a) => a.label === label)?.sentence || '';
    setPrefs((p) => {
      const on = p.activities.includes(label);
      const description = on
        ? p.description.replace(sentence, '').replace(/\s{2,}/g, ' ').trim()
        : `${p.description.trim()} ${sentence}`.trim();
      return { ...p, description, activities: on ? p.activities.filter((a) => a !== label) : [...p.activities, label] };
    });
  };

  const togglePriority = (prio: string) =>
    setPrefs((p) => ({
      ...p,
      priorities: p.priorities.includes(prio) ? p.priorities.filter((x) => x !== prio) : [...p.priorities, prio],
    }));

  const next = () => setStep((s) => Math.min(TOTAL, s + 1));
  const back = () => (step > 1 ? setStep((s) => s - 1) : onClose());

  const canContinue = step !== 1 || prefs.roomName.trim().length > 0;
  // Nothing added on step 1: the main button says Skip
  const skipping = step === 1 && prefs.moodItems.length === 0;
  const nameLabel = captureKind === 'zone' ? 'Corner name' : 'Room name';

  return (
    <Box className="relative h-full w-full overflow-hidden bg-background">
      {/* The room itself, softly, behind the questions */}
      <Box
        className="absolute inset-x-0 top-0 h-72 bg-cover bg-center opacity-40 blur-2xl scale-110 pointer-events-none"
        style={{ backgroundImage: `url(${scanImage})`, backgroundPosition: scanPosition, maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }}
        aria-hidden
      />

      <Box ref={scrollRef} className="relative h-full overflow-y-auto">
        <VStack className="w-full max-w-lg mx-auto min-h-full px-edge pb-40">
          {/* Header: back · progress · close */}
          <HStack className="sticky top-0 z-20 -mx-edge px-edge pt-top pb-gap items-center gap-gap">
            {step < TOTAL ? (
              <Button variant="outline" size="icon" onClick={back} className={`rounded-full ${CTL} w-[var(--k-ctl)] px-0`} aria-label={step === 1 ? 'Cancel' : 'Back'}>
                <ButtonIcon as={ArrowLeft} className="h-5 w-5" />
              </Button>
            ) : <Box className="w-ctl h-ctl shrink-0" />}
            <HStack className="flex-1 items-center gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <Progress key={i} value={i < step ? 100 : 0} className="flex-1 w-auto h-1.5">
                  <ProgressFilledTrack />
                </Progress>
              ))}
            </HStack>
            <Text size="xs" className="font-medium text-muted-foreground tabular-nums w-10 text-right shrink-0">0{step}/0{TOTAL}</Text>
            {step < TOTAL && (
              <Button variant="ghost" size="icon" onClick={onClose} className={`rounded-full ${CTL} w-[var(--k-ctl)] px-0`} aria-label="Close">
                <ButtonIcon as={X} className="h-5 w-5" />
              </Button>
            )}
          </HStack>

          <Box className="flex-1 pt-4" key={step}>
            {step === 1 && (
              <Step title="Name it and add inspiration" subtitle="Optional. It shapes the colours and pieces we suggest.">
                <VStack space="sm">
                  <Text size="sm" bold>{nameLabel}</Text>
                  <Input className={CTL}>
                    <InputField
                      value={prefs.roomName}
                      onChangeText={(t) => setPrefs((p) => ({ ...p, roomName: t }))}
                      aria-label={nameLabel}
                    />
                    {prefs.roomName ? (
                      <InputSlot onClick={() => setPrefs((p) => ({ ...p, roomName: '' }))} aria-label="Clear name">
                        <InputIcon as={X} />
                      </InputSlot>
                    ) : null}
                  </Input>
                </VStack>

                <VStack space="sm" className="mt-6">
                  <Text size="sm" bold>Add inspiration</Text>
                  <Box className="grid grid-cols-2 gap-3">
                    <SourceTile
                      icon={<Center className="w-10 h-10 rounded-full bg-primary"><Icon as={Images} size="lg" className="text-primary-foreground" /></Center>}
                      title="Photos"
                      detail="From your phone"
                      pulse={nudgeSources}
                      onPress={() => setSheet('gallery')}
                    />
                    <SourceTile
                      icon={<Center className="w-10 h-10 rounded-full bg-[#E60023]"><Text className="text-white text-lg font-bold font-serif">P</Text></Center>}
                      title="Pinterest"
                      detail="Paste a board link"
                      pulse={nudgeSources}
                      onPress={() => setSheet('pinterest')}
                    />
                  </Box>
                  <AddedStrip items={prefs.moodItems.filter((m) => m.source !== 'preset')} onRemove={removeMoodItem} />
                </VStack>

                <VStack space="sm" className="mt-6">
                  <Text size="sm" bold>Or start from a style</Text>
                  <HStack className="-mx-edge px-edge pb-1 gap-3 overflow-x-auto" role="group" aria-label="Styles">
                    {MOOD_PRESETS.map((p) => (
                      <PresetCard key={p.id} preset={p} on={prefs.moodItems.some((m) => m.id === p.id)} onPress={() => togglePreset(p)} />
                    ))}
                  </HStack>
                </VStack>
              </Step>
            )}

            {step === 2 && (
              <Step title="How big a change?" subtitle="Pick one to start with.">
                <VStack space="md" role="radiogroup">
                  <VisionCard
                    on={prefs.vision === 'redesign'}
                    onPress={() => setPrefs((p) => ({ ...p, vision: 'redesign' }))}
                    icon={Move}
                    title="Redesign"
                    body="Move furniture, add new pieces and try big changes to the layout."
                    tags={['Move', 'Add', 'Rearrange']}
                  />
                  <VisionCard
                    on={prefs.vision === 'refine'}
                    onPress={() => setPrefs((p) => ({ ...p, vision: 'refine' }))}
                    icon={Paintbrush}
                    title="Refine"
                    body="Keep the layout. Change surfaces like wall colour, décor and small details."
                    tags={['Paint', 'Décor', 'Details']}
                  />
                </VStack>
              </Step>
            )}

            {step === 3 && (
              <Step title="Tell us about the room" subtitle={analyzed ? 'We filled this in from your scan. Change anything.' : 'Looking at your scan and inspiration…'}>
                {!analyzed ? (
                  <Analyzing scanImage={scanImage} scanPosition={scanPosition} items={prefs.moodItems} />
                ) : (
                  <VStack className="gap-6 animate-in fade-in">
                    <Box className="shrink-0">
                      <HStack className="items-center justify-between">
                        <Text size="sm" bold>Room type</Text>
                        <Badge variant="secondary">
                          <BadgeIcon as={Sparkles} />
                          <BadgeText>Detected from your scan</BadgeText>
                        </Badge>
                      </HStack>
                      <HStack className="mt-2 flex-wrap gap-2">
                        {ROOM_TYPES.map((t) => (
                          <Chip key={t} on={prefs.roomType === t} onPress={() => setPrefs((p) => ({ ...p, roomType: t }))} label={t} />
                        ))}
                      </HStack>
                    </Box>

                    <VStack space="sm" className="shrink-0">
                      <Text size="sm" bold>Description</Text>
                      <Textarea className="h-auto min-h-36 shrink-0">
                        <TextareaInput
                          value={prefs.description}
                          onChangeText={(t) => setPrefs((p) => ({ ...p, description: t }))}
                          rows={Math.max(5, Math.ceil(prefs.description.length / 40))}
                          className="text-sm leading-relaxed p-3"
                          aria-label="Room description"
                        />
                      </Textarea>
                    </VStack>

                    <Box className="shrink-0">
                      <Text size="sm" bold>What do you do here?</Text>
                      <Text size="xs" className="text-muted-foreground mt-0.5">Tap one and we'll add a line to the description for you.</Text>
                      <HStack className="mt-3 flex-wrap gap-2">
                        {ACTIVITIES.map(({ label }) => (
                          <Chip key={label} on={prefs.activities.includes(label)} onPress={() => toggleActivity(label)} label={label} withIcon />
                        ))}
                      </HStack>
                    </Box>
                  </VStack>
                )}
              </Step>
            )}

            {step === 4 && (
              <Step title="What matters most?" subtitle="Pick as many as you like. We'll point out trade-offs against these.">
                <Priorities selected={prefs.priorities} onToggle={togglePriority} />
              </Step>
            )}

            {step === 5 && <Processing roomName={prefs.roomName} onDone={() => onComplete(prefs)} />}
          </Box>
        </VStack>
      </Box>

      {/* Footer */}
      {step < TOTAL && (
        <Box className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-background via-background/95 to-background/0 pt-8 pb-bottom pointer-events-none">
          <HStack className="w-full max-w-lg mx-auto px-edge gap-gap pointer-events-auto">
            <Button
              variant={skipping ? 'outline' : 'default'}
              size="lg"
              onClick={handlePrimary}
              disabled={!canContinue || (step === 3 && !analyzed)}
              className={`flex-1 rounded-full ${CTL}`}
            >
              {skipping ? (
                <ButtonText>Skip</ButtonText>
              ) : step === 4 ? (
                <>
                  <ButtonIcon as={Sparkles} />
                  <ButtonText>Build my room</ButtonText>
                </>
              ) : (
                <>
                  <ButtonText>Continue</ButtonText>
                  <ButtonIcon as={ArrowRight} />
                </>
              )}
            </Button>
          </HStack>
        </Box>
      )}

      {sheet === 'skip' && <SkipSheet isOpen onClose={() => setSheet(null)} onSkip={finishSkip} onAddInstead={addInstead} />}
      {sheet === 'gallery' && <GallerySheet isOpen chosen={prefs.moodItems} onClose={() => setSheet(null)} onAdd={(items) => { addMoodItems(items); setSheet(null); }} />}
      {sheet === 'pinterest' && <PinterestSheet isOpen onClose={() => setSheet(null)} onAdd={(items) => { addMoodItems(items); setSheet(null); }} />}
    </Box>
  );
};

/* ------------------------------------------------------------------------- */

const Step: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <Box className="animate-in fade-in slide-in-from-bottom-2">
    <Heading size="3xl">{title}</Heading>
    {subtitle && <Text size="sm" className="mt-2 text-muted-foreground">{subtitle}</Text>}
    <Box className="mt-7">{children}</Box>
  </Box>
);

/** Select chip: filled when on, outlined when off */
const Chip: React.FC<{ on: boolean; onPress: () => void; label: string; withIcon?: boolean }> = ({ on, onPress, label, withIcon }) => (
  <Button variant={on ? 'default' : 'outline'} onClick={onPress} className="rounded-full" aria-pressed={on}>
    {withIcon && <ButtonIcon as={on ? Check : Plus} />}
    <ButtonText>{label}</ButtonText>
  </Button>
);

const SourceTile: React.FC<{ icon: React.ReactNode; title: string; detail: string; pulse?: boolean; onPress: () => void }> = ({ icon, title, detail, pulse, onPress }) => (
  <Pressable onClick={onPress}>
    <Card size="sm" className={pulse ? 'ring-2 ring-ring animate-pulse' : ''}>
      {icon}
      <Box>
        <Text bold>{title}</Text>
        <Text size="xs" className="text-muted-foreground mt-0.5">{detail}</Text>
      </Box>
    </Card>
  </Pressable>
);

/** Swatch collage or photo, used by stacked cards and sheets. */
const MoodFace: React.FC<{ item: Pick<MoodItem, 'tiles' | 'imageUrl' | 'imagePosition' | 'title'>; className?: string }> = ({ item, className = '' }) =>
  item.imageUrl ? (
    <Box
      className={`w-full h-full bg-cover ${className}`}
      style={{ backgroundImage: `url(${item.imageUrl})`, backgroundPosition: item.imagePosition }}
      role="img"
      aria-label={item.title}
    />
  ) : (
    <Box className={`w-full h-full grid ${item.tiles && item.tiles.length > 2 ? 'grid-cols-2 grid-rows-2' : 'grid-rows-2'} ${className}`}>
      {item.tiles?.map((t, i) => <Box key={i} style={{ background: t }} />)}
    </Box>
  );

const SOURCE_LABEL: Record<MoodItem['source'], string> = { preset: 'Preset', gallery: 'Photo', pinterest: 'Pin' };

/** Photos and pins the user added, as removable chips. Presets show their state in the style row. */
const AddedStrip: React.FC<{ items: MoodItem[]; onRemove: (id: string) => void }> = ({ items, onRemove }) => {
  if (items.length === 0) return null;
  return (
    <HStack className="mt-1 gap-1.5 overflow-x-auto -mx-edge px-edge pb-1 animate-in fade-in">
      {items.map((item) => (
        <HStack key={item.id} className="shrink-0 h-9 pl-1.5 pr-1 rounded-full bg-secondary items-center gap-1.5">
          <Box className="w-6 h-6 rounded-full overflow-hidden"><MoodFace item={item} /></Box>
          <Text size="xs" className="font-medium max-w-[110px] truncate">{item.title}</Text>
          <Text size="2xs" className="text-muted-foreground">{SOURCE_LABEL[item.source]}</Text>
          <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="rounded-full min-h-6 min-w-6 h-6 w-6 p-0" aria-label={`Remove ${item.title}`}>
            <ButtonIcon as={X} className="h-3.5 w-3.5" />
          </Button>
        </HStack>
      ))}
    </HStack>
  );
};

/** One style in a horizontal row. Tap to select; no sheet in between. */
const PresetCard: React.FC<{ preset: MoodPreset; on: boolean; note?: string; onPress: () => void }> = ({ preset, on, note, onPress }) => (
  <Pressable onClick={onPress} aria-pressed={on} className="shrink-0 w-[108px]">
    <Box className={`relative h-[88px] rounded-xl overflow-hidden ${on ? 'ring-2 ring-primary' : 'ring-1 ring-border'}`}>
      <MoodFace item={preset} />
      {on && <Box className="absolute top-1.5 right-1.5"><Tick on /></Box>}
    </Box>
    <Text size="sm" bold isTruncated className="mt-1.5">{preset.title}</Text>
    {note && <Text size="2xs" className="font-medium text-muted-foreground">{note}</Text>}
  </Pressable>
);

const Tick: React.FC<{ on: boolean }> = ({ on }) => (
  <Center className={`w-6 h-6 rounded-full ${on ? 'bg-primary' : 'bg-background/80 border border-border'}`}>
    {on && <Icon as={Check} size="xs" className="text-primary-foreground" />}
  </Center>
);

/* ----- Sheets ------------------------------------------------------------ */

const Sheet: React.FC<{ isOpen: boolean; title: string; subtitle: string; onClose: () => void; footer?: React.ReactNode; children: React.ReactNode }> = ({ isOpen, title, subtitle, onClose, footer, children }) => (
  <Actionsheet isOpen={isOpen} onClose={onClose} title={title}>
    <ActionsheetBackdrop className={glass.scrim} />
    <ActionsheetContent className={`mt-auto w-full max-w-lg self-center max-h-[88dvh] p-0 items-stretch ${glass.dialog}`}>
      <ActionsheetDragIndicatorWrapper>
        <ActionsheetDragIndicator />
      </ActionsheetDragIndicatorWrapper>
      <HStack className="items-start justify-between gap-3 px-edge pt-3 pb-3">
        <Box>
          <Heading size="lg">{title}</Heading>
          <Text size="sm" className="text-muted-foreground mt-0.5">{subtitle}</Text>
        </Box>
        <Button variant="secondary" size="icon" onClick={onClose} className="rounded-full" aria-label="Close">
          <ButtonIcon as={X} />
        </Button>
      </HStack>
      <Box className="flex-1 overflow-y-auto px-edge pb-4">{children}</Box>
      {footer && <Box className="px-edge pt-4 pb-bottom border-t border-border">{footer}</Box>}
    </ActionsheetContent>
  </Actionsheet>
);

const useSelection = (initial: string[] = []) => {
  const [sel, setSel] = useState<string[]>(initial);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return [sel, toggle] as const;
};

const SheetButton: React.FC<{ primary?: boolean; onPress: () => void; disabled?: boolean; children: string }> = ({ primary, onPress, disabled, children }) => (
  <Button variant={primary ? 'default' : 'secondary'} size="lg" onClick={onPress} disabled={disabled} className={`w-full rounded-full ${CTL}`}>
    <ButtonText>{children}</ButtonText>
  </Button>
);

/** Nothing added: offer the matched style up front, so skipping still lands on a good one. */
const SkipSheet: React.FC<{ isOpen: boolean; onClose: () => void; onSkip: (preset: MoodPreset) => void; onAddInstead: () => void }> = ({ isOpen, onClose, onSkip, onAddInstead }) => {
  const [id, setId] = useState(MATCHED_PRESET_ID);
  const chosen = MOOD_PRESETS.find((p) => p.id === id) ?? MOOD_PRESETS[0];
  const changed = id !== MATCHED_PRESET_ID;
  return (
    <Sheet
      isOpen={isOpen}
      title="We'll match a style"
      subtitle="Based on your room. Pick another if you like."
      onClose={onClose}
      footer={
        <VStack space="md">
          {changed ? (
            <>
              <SheetButton primary onPress={() => onSkip(chosen)}>Continue</SheetButton>
              <SheetButton onPress={onAddInstead}>Add photos or a board</SheetButton>
            </>
          ) : (
            <>
              <SheetButton primary onPress={onAddInstead}>Add photos or a board</SheetButton>
              <SheetButton onPress={() => onSkip(chosen)}>Still skip</SheetButton>
            </>
          )}
        </VStack>
      }
    >
      <HStack className="-mx-edge px-edge pb-1 gap-3 overflow-x-auto" role="radiogroup" aria-label="Styles">
        {MOOD_PRESETS.map((p) => (
          <PresetCard key={p.id} preset={p} on={p.id === id} note={p.id === MATCHED_PRESET_ID ? 'Best match' : undefined} onPress={() => setId(p.id)} />
        ))}
      </HStack>
    </Sheet>
  );
};

const GallerySheet: React.FC<{ isOpen: boolean; chosen: MoodItem[]; onClose: () => void; onAdd: (items: MoodItem[]) => void }> = ({ isOpen, chosen, onClose, onAdd }) => {
  const [sel, toggle] = useSelection(chosen.filter((c) => c.source === 'gallery').map((c) => c.id));
  return (
    <Sheet
      isOpen={isOpen}
      title="Gallery"
      subtitle="Choose photos of rooms or details you like."
      onClose={onClose}
      footer={
        <SheetButton
          primary
          disabled={sel.length === 0}
          onPress={() => onAdd(GALLERY_PHOTOS.filter((g) => sel.includes(g.id)).map((g) => ({ id: g.id, source: 'gallery', title: g.title, imageUrl: g.url, imagePosition: g.position })))}
        >
          {sel.length ? `Add ${sel.length} photo${sel.length > 1 ? 's' : ''}` : 'Pick photos'}
        </SheetButton>
      }
    >
      <Box className="grid grid-cols-3 gap-2">
        {GALLERY_PHOTOS.map((g) => {
          const on = sel.includes(g.id);
          return (
            <Pressable key={g.id} onClick={() => toggle(g.id)} className="relative aspect-square rounded-xl overflow-hidden" aria-pressed={on} aria-label={g.title}>
              <Box
                className={`w-full h-full bg-cover transition-transform duration-300 ${on ? 'scale-90 rounded-lg' : ''}`}
                style={{ backgroundImage: `url(${g.url})`, backgroundPosition: g.position }}
                aria-hidden
              />
              <Box className="absolute top-1.5 right-1.5"><Tick on={on} /></Box>
            </Pressable>
          );
        })}
      </Box>
    </Sheet>
  );
};

const PinterestSheet: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (items: MoodItem[]) => void }> = ({ isOpen, onClose, onAdd }) => {
  const [link, setLink] = useState('');
  const [state, setState] = useState<'input' | 'loading' | 'board'>('input');
  const [sel, toggle] = useSelection(PINTEREST_BOARD.pins.map((p) => p.id));

  const find = () => {
    if (!link.trim()) return;
    setState('loading');
    setTimeout(() => setState('board'), 1100);
  };

  return (
    <Sheet
      isOpen={isOpen}
      title="Pinterest"
      subtitle={state === 'board' ? `${PINTEREST_BOARD.title} · ${PINTEREST_BOARD.pins.length} pins` : 'Paste a link to one of your boards.'}
      onClose={onClose}
      footer={
        state === 'board' ? (
          <SheetButton
            primary
            disabled={sel.length === 0}
            onPress={() => onAdd(PINTEREST_BOARD.pins.filter((p) => sel.includes(p.id)).map((p) => ({ id: p.id, source: 'pinterest', title: p.title, tiles: p.tiles })))}
          >
            {sel.length ? `Add ${sel.length} pin${sel.length > 1 ? 's' : ''}` : 'Pick pins'}
          </SheetButton>
        ) : (
          <SheetButton primary disabled={!link.trim() || state === 'loading'} onPress={find}>
            {state === 'loading' ? 'Finding board…' : 'Find board'}
          </SheetButton>
        )
      }
    >
      {state !== 'board' ? (
        <VStack space="md">
          <Input className={CTL}>
            <InputField
              value={link}
              onChangeText={setLink}
              onKeyDown={(e) => { if (e.key === 'Enter') find(); }}
              placeholder="pinterest.com/you/board-name"
              aria-label="Pinterest board link"
              autoFocus
            />
            <InputSlot>
              <Button variant="secondary" size="sm" onClick={() => setLink(`pinterest.com/${PINTEREST_BOARD.owner}/small-room-ideas`)}>
                <ButtonIcon as={ClipboardPaste} />
                <ButtonText>Paste</ButtonText>
              </Button>
            </InputSlot>
          </Input>
          {state === 'loading' && (
            <Box className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => <Box key={i} className={`k-shimmer rounded-xl ${i % 2 ? 'h-32' : 'h-24'}`} />)}
            </Box>
          )}
        </VStack>
      ) : (
        <Box className="block columns-2 gap-2.5 [&>*]:mb-2.5">
          {PINTEREST_BOARD.pins.map((p, i) => {
            const on = sel.includes(p.id);
            return (
              <Pressable key={p.id} onClick={() => toggle(p.id)} className="relative w-full break-inside-avoid animate-in fade-in" aria-pressed={on}>
                <Box className={`rounded-xl overflow-hidden ${i % 3 === 0 ? 'h-44' : 'h-32'}`}><MoodFace item={p} /></Box>
                <Text size="xs" className="font-medium mt-1.5 px-0.5">{p.title}</Text>
                <Box className="absolute top-2 right-2"><Tick on={on} /></Box>
              </Pressable>
            );
          })}
        </Box>
      )}
    </Sheet>
  );
};

/* ----- Step 2 ------------------------------------------------------------ */

const VisionCard: React.FC<{
  on: boolean; onPress: () => void; icon: LucideIcon; title: string; body: string; tags: string[];
}> = ({ on, onPress, icon, title, body, tags }) => (
  <Pressable onClick={onPress} role="radio" aria-checked={on}>
    <Card className={`flex-row gap-4 p-5 ${on ? 'ring-2 ring-primary' : ''}`}>
      <Center className={`w-12 h-12 rounded-full shrink-0 ${on ? 'bg-primary' : 'bg-secondary'}`}>
        <Icon as={icon} size="xl" className={on ? 'text-primary-foreground' : ''} />
      </Center>
      <Box className="flex-1 min-w-0">
        <HStack className="items-center justify-between">
          <Heading size="md">{title}</Heading>
          <Center className={`w-5 h-5 rounded-full ${on ? 'bg-primary' : 'border border-input'}`}>
            {on && <Box className="w-2 h-2 rounded-full bg-primary-foreground" />}
          </Center>
        </HStack>
        <Text size="sm" className="text-muted-foreground mt-1">{body}</Text>
        <HStack className="gap-1.5 mt-3">
          {tags.map((t) => (
            <Badge key={t} variant="secondary"><BadgeText>{t}</BadgeText></Badge>
          ))}
        </HStack>
      </Box>
    </Card>
  </Pressable>
);

/* ----- Step 3 ------------------------------------------------------------ */

const Analyzing: React.FC<{ scanImage: string; scanPosition: string; items: MoodItem[] }> = ({ scanImage, scanPosition, items }) => (
  <VStack className="gap-5">
    <HStack className="items-center gap-2">
      <Box className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
        <Box className="w-full h-full bg-cover" style={{ backgroundImage: `url(${scanImage})`, backgroundPosition: scanPosition }} aria-hidden />
        <Box className="absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-white/70 to-transparent" style={{ animation: 'k-scanline 1.4s ease-in-out infinite' }} />
      </Box>
      {items.slice(0, 3).map((m) => (
        <Box key={m.id} className="w-14 h-14 rounded-lg overflow-hidden opacity-80"><MoodFace item={m} /></Box>
      ))}
    </HStack>
    <Box className="k-shimmer h-10 w-2/3 rounded-full" />
    <Box className="k-shimmer h-32 rounded-xl" />
    <HStack className="gap-2">{[80, 96, 72, 110].map((w) => <Box key={w} className="k-shimmer h-10 rounded-full" style={{ width: w }} />)}</HStack>
  </VStack>
);

/* ----- Step 4 ------------------------------------------------------------ */

const Priorities: React.FC<{ selected: string[]; onToggle: (p: string) => void }> = ({ selected, onToggle }) => {
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const all = [...PRIORITY_SUGGESTIONS, ...custom];

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    const label = v.charAt(0).toUpperCase() + v.slice(1);
    if (!all.some((a) => a.toLowerCase() === label.toLowerCase())) setCustom((c) => [...c, label]);
    if (!selected.includes(label)) onToggle(label);
    setDraft('');
  };

  return (
    <Box>
      <HStack className="items-center justify-between">
        <Text size="sm" bold>{selected.length} selected</Text>
        <Badge variant="secondary">
          <BadgeIcon as={Sparkles} />
          <BadgeText>Suggested from your room</BadgeText>
        </Badge>
      </HStack>
      <HStack className="mt-3 flex-wrap gap-2">
        {all.map((p) => (
          <Chip key={p} on={selected.includes(p)} onPress={() => onToggle(p)} label={p} withIcon />
        ))}
      </HStack>
      <Input className={`mt-5 ${CTL}`}>
        <InputField
          value={draft}
          onChangeText={setDraft}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          placeholder="Add your own, like Quiet"
          aria-label="Add your own"
        />
        <InputSlot>
          <Button variant="secondary" size="sm" onClick={add} disabled={!draft.trim()}>
            <ButtonIcon as={Plus} />
            <ButtonText>Add</ButtonText>
          </Button>
        </InputSlot>
      </Input>
    </Box>
  );
};

/* ----- Step 5 ------------------------------------------------------------ */

const FLIP_ICONS = [BedDouble, LampDesk, Armchair, Lamp, Sofa, Fan];
const FLIP_MS = 1200;

const Processing: React.FC<{ roomName: string; onDone: () => void }> = ({ roomName, onDone }) => {
  const [elapsed, setElapsed] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setElapsed(performance.now() - start), 50);
    const t = setTimeout(() => doneRef.current(), PROCESSING_MS);
    return () => { clearInterval(id); clearTimeout(t); };
  }, []);

  // Swap the icon at 80% of each cycle, when the card is edge-on (see k-flip)
  const FlipIcon = FLIP_ICONS[Math.floor((elapsed + FLIP_MS * 0.2) / FLIP_MS) % FLIP_ICONS.length];
  const progress = Math.min(1, elapsed / (PROCESSING_MS - 400));
  const stepIdx = Math.min(PROCESSING_STEPS.length - 1, Math.floor(progress * PROCESSING_STEPS.length));

  return (
    <VStack className="pt-10 items-center animate-in fade-in">
      <Center className="relative w-40 h-40" style={{ perspective: 600 }}>
        <Box className="absolute bottom-3 w-24 h-3 rounded-full bg-foreground/10 blur-sm" style={{ animation: 'k-float 1.8s ease-in-out infinite' }} aria-hidden />
        <Center
          className="w-28 h-28 rounded-3xl bg-primary shadow-k-md"
          style={{ animation: `k-flip ${FLIP_MS}ms cubic-bezier(.45,0,.55,1) infinite`, transformStyle: 'preserve-3d' }}
        >
          <Icon as={FlipIcon} className="w-12 h-12 text-primary-foreground" strokeWidth={1.5} />
        </Center>
      </Center>

      <Heading size="2xl" className="mt-6 text-center">Setting up {roomName || 'your room'}</Heading>
      <Text size="sm" className="mt-2 text-muted-foreground">This takes a few seconds.</Text>

      <Box className="mt-8 w-full max-w-xs">
        <Progress value={Math.round(progress * 100)}>
          <ProgressFilledTrack />
        </Progress>
        <VStack className="mt-6 gap-3">
          {PROCESSING_STEPS.map((s, i) => {
            const done = i < stepIdx || progress >= 1;
            const active = i === stepIdx && !done;
            return (
              <HStack key={s} className="items-center gap-3">
                <Center className={`w-5 h-5 rounded-full shrink-0 ${done ? 'bg-primary' : active ? 'border-2 border-primary' : 'bg-secondary'}`}>
                  {done && <Icon as={Check} size="2xs" className="text-primary-foreground" />}
                  {active && <Box className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                </Center>
                <Text size="sm" className={done || active ? 'text-foreground' : 'text-muted-foreground'}>{s}</Text>
              </HStack>
            );
          })}
        </VStack>
      </Box>
    </VStack>
  );
};
