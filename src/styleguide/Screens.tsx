import React, { useEffect, useState } from 'react';
import {
  Add01Icon, AiMagicIcon, ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, Chair01Icon, Edit02Icon, FolderLibraryIcon,
  Home01Icon, Image01Icon, Lamp01Icon, Layers01Icon, MoreHorizontalIcon, PencilEdit01Icon, AddSquareIcon, PinterestIcon, ScanIcon, Search01Icon,
  Sofa01Icon, Table01Icon, Tick02Icon, UserIcon, ViewIcon,
} from '@hugeicons/core-free-icons';
import { HOME_ZONES, MOOD_PRESETS } from '../data/onboardingData';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon, type AnyIcon } from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import {
  Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { glassLt, glassDk } from '@/components/glass';

/*
 * /styleguide/screens: sample Home, Onboarding and Editor in the proposed system, built from the real components.
 * References: soft white pages with a dark pill dock (cards with diffused shadow, round icon buttons, dark active chip),
 * and muted glass with very large radii and pill actions that end in a small round icon.
 * Nothing here is wired to the app. The data is fake.
 */

const ROOM_IMG = '/assets/reference_room_panorama.jpg';
type ScreenId = 'home' | 'onboarding' | 'editor';

/** A crop of the room panorama, used as a stand-in thumbnail */
const photo = (pos: string): React.CSSProperties => ({ backgroundImage: `url(${ROOM_IMG})`, backgroundSize: 'cover', backgroundPosition: pos });

/* ---------- Pieces shared by the three screens ---------- */

/** Round icon button: white with a hairline on paper, frosted over the room */
const RoundButton: React.FC<{ icon: AnyIcon; label: string; glass?: boolean; onClick?: () => void; size?: number }> = ({ icon, label, glass, onClick, size = 48 }) => (
  <Pressable
    aria-label={label}
    onClick={onClick}
    style={{ width: size, height: size }}
    className={`rounded-full items-center justify-center shrink-0 transition-[transform,box-shadow] duration-150 ease-out enabled:hover:shadow-k-md enabled:active:scale-[0.94] ${glass ? glassDk.clear : 'bg-card shadow-k-sm border border-foreground/5'}`}
  >
    <Icon as={icon} size="lg" />
  </Pressable>
);

/**
 * Pill action that ends in a small round icon, after the second reference. The round icon is concentric with the
 * pill (inner radius = outer radius minus the gap), so it sits 6px in from the end. `centered` is for full-width
 * buttons: the label centres and the icon floats right, so the label stays optically centred.
 */
const PillAction: React.FC<{ label: string; icon?: AnyIcon; variant?: 'smoke' | 'default' | 'glass'; onClick?: () => void; className?: string; centered?: boolean; compact?: boolean }> = ({ label, icon = ArrowRight01Icon, variant = 'default', onClick, className = '', centered, compact }) => {
  const h = compact ? 'h-12' : 'h-[var(--k-ctl)]';
  // Round icon is concentric with the pill: the inset is the same on top, bottom and end (8px, or 6px when compact)
  const dot = compact ? 'h-9 w-9' : 'h-10 w-10';
  return (
    <Button variant={variant} onClick={onClick} className={`rounded-full ${h} gap-3 ${centered ? 'relative justify-center px-14' : `pl-6 ${compact ? 'pr-1.5' : 'pr-2'} justify-between`} ${className}`}>
      <ButtonText>{label}</ButtonText>
      <Box className={`${dot} rounded-full items-center justify-center ${centered ? (compact ? 'absolute right-1.5' : 'absolute right-2') : ''} ${variant === 'glass' ? 'bg-foreground/10' : 'bg-onglow/15'}`}>
        <Icon as={icon} size="lg" className={variant === 'glass' ? 'text-foreground' : 'text-onglow'} />
      </Box>
    </Button>
  );
};

type DockItem = { id: string; label: string; icon: AnyIcon };

/** The floating dock: dark smoked glass, the active item is a light pill that carries its label */
const Dock: React.FC<{ items: DockItem[]; active: string; onSelect: (id: string) => void; className?: string }> = ({ items, active, onSelect, className = '' }) => (
  <nav className={`k-dock isolate rounded-full p-2 flex flex-row items-center gap-1 h-[4.25rem] ${className}`} aria-label="Main">
    {items.map((it) => {
      const on = it.id === active;
      return (
        <Pressable
          key={it.id}
          onClick={() => onSelect(it.id)}
          aria-label={it.label}
          aria-current={on ? 'page' : undefined}
          // Only colour moves (R12): the width change is instant, so nothing animates layout
          className={`h-[3.25rem] rounded-full flex-row items-center justify-center gap-2 transition-[background-color,color] duration-150 ease-out ${
            on ? 'bg-onglow/20 text-onglow flex-1 px-5' : 'w-14 text-onglow/80 enabled:hover:bg-onglow/10 enabled:hover:text-onglow'
          }`}
        >
          <Icon as={it.icon} size="lg" className="text-current" />
          {on && <span className="text-sm font-semibold select-none">{it.label}</span>}
        </Pressable>
      );
    })}
  </nav>
);

const SectionRow: React.FC<{ title: string; action?: string }> = ({ title, action }) => (
  <HStack className="items-baseline justify-between">
    <Heading size="lg">{title}</Heading>
    {action && <Text size="sm" className="text-muted-foreground">{action}</Text>}
  </HStack>
);

/* ---------- Home ---------- */

// The app's own zones, each a different slice of the panorama, so the cards do not read as repeats
const SPACES = HOME_ZONES.map((z, i) => ({ name: z.name, meta: `${[6, 4, 5, 3][i % 4]} objects`, pos: z.position }));

const HomeScreen: React.FC = () => {
  const [tab, setTab] = useState('home');
  const [kind, setKind] = useState('Spaces');
  return (
    <Box className="relative h-full bg-secondary">
      <Box className="block h-full overflow-y-auto px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-36">
        <HStack className="items-center justify-between">
          <Box>
            <Text size="sm" className="text-muted-foreground">Good evening</Text>
            <Heading size="3xl">Aarav</Heading>
          </Box>
          <RoundButton icon={UserIcon} label="Profile" />
        </HStack>

        <Input className="mt-5 h-12 rounded-full bg-card border-transparent shadow-k-sm px-4">
          <Icon as={Search01Icon} size="lg" className="text-muted-foreground" />
          <InputField placeholder="Find a room or a piece" aria-label="Search" />
        </Input>

        <HStack className="mt-4 gap-2 overflow-x-auto -mx-5 px-5 pb-1">
          {['Spaces', 'Zones', 'Recent'].map((k) => (
            <Chip key={k} selected={kind === k} onClick={() => setKind(k)} className="h-9 px-4">{k}</Chip>
          ))}
        </HStack>

        {/* Continue: the latest room, large */}
        <Box className="mt-7 gap-3">
          <SectionRow title="Continue designing" />
          <Card className="rounded-sheet p-pad-sheet gap-4 shadow-k-md">
            <Box className="h-44 rounded-card bg-cover" style={photo('40% 55%')} role="img" aria-label="Aarav’s room" />
            <HStack className="items-center justify-between gap-3">
              <Box className="min-w-0">
                <Heading size="md">Aarav’s room</Heading>
                <Text size="sm" className="text-muted-foreground">16 objects · edited 2h ago</Text>
              </Box>
              <PillAction label="Open" variant="default" className="shrink-0" />
            </HStack>
          </Card>
        </Box>

        {/* Spaces: a snapping row of cards */}
        <Box className="mt-8 gap-3">
          <SectionRow title="Your spaces" action="See all" />
          {/* pb/-mb: a scroller clips its own children, so it needs room below for the card shadow to finish */}
          <HStack className="gap-4 overflow-x-auto snap-x snap-mandatory scroll-pl-5 -mx-5 px-5 pb-14 -mb-6">
            {SPACES.map((s) => (
              <Card key={s.name} className="snap-start shrink-0 w-[58%] rounded-sheet p-pad-sheet gap-3 shadow-k-md">
                <Box className="h-32 rounded-card bg-cover" style={photo(s.pos)} role="img" aria-label={s.name} />
                <HStack className="items-center justify-between gap-2">
                  <Box className="min-w-0">
                    <Text size="md" bold isTruncated>{s.name}</Text>
                    <Text size="xs" className="text-muted-foreground">{s.meta}</Text>
                  </Box>
                  <RoundButton icon={ArrowRight01Icon} label={`Open ${s.name}`} size={40} />
                </HStack>
              </Card>
            ))}
          </HStack>
        </Box>
      </Box>

      <Box className="absolute inset-x-5 bottom-5">
        <Dock
          active={tab}
          onSelect={setTab}
          items={[
            { id: 'home', label: 'Home', icon: Home01Icon },
            { id: 'scan', label: 'Scan', icon: ScanIcon },
            { id: 'library', label: 'Library', icon: FolderLibraryIcon },
          ]}
        />
      </Box>
    </Box>
  );
};

/* ---------- Onboarding step 1 ---------- */

// The app's own style presets: four material swatches each
const STYLES = MOOD_PRESETS.slice(0, 4).map((p) => ({ name: p.title, tiles: p.tiles }));

const OnboardingScreen: React.FC = () => {
  const [name, setName] = useState('Aarav’s room');
  const [style, setStyle] = useState(STYLES[0].name);
  return (
    <Box className="relative h-full bg-secondary">
      <Box className="block h-full overflow-y-auto px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-40">
        <HStack className="items-center gap-4">
          <RoundButton icon={ArrowLeft01Icon} label="Back" />
          <HStack className="flex-1 gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={1} aria-label="Step 1 of 5">
            {[0, 1, 2, 3, 4].map((i) => <Box key={i} className={`h-1.5 flex-1 rounded-full ${i === 0 ? 'bg-primary' : 'bg-foreground/15'}`} />)}
          </HStack>
          <Text size="sm" className="text-muted-foreground tabular-nums">01/05</Text>
          <RoundButton icon={Cancel01Icon} label="Close" size={40} />
        </HStack>

        <Box className="mt-7">
          <Heading size="3xl">Name it and add inspiration</Heading>
          <Text size="sm" className="text-muted-foreground mt-2">Optional. It shapes the colours and pieces we suggest.</Text>
        </Box>

        <Card className="mt-6 rounded-sheet p-pad-sheet gap-2 shadow-k-md">
          <Text size="sm" bold>Room name</Text>
          <Input className="h-12 rounded-card px-4">
            <InputField value={name} onChangeText={setName} aria-label="Room name" />
          </Input>
        </Card>

        <Box className="mt-6 gap-3">
          <SectionRow title="Add inspiration" />
          <Box className="grid grid-cols-2 gap-3">
            {[
              { t: 'Photos', s: 'From your phone', icon: Image01Icon },
              { t: 'Pinterest', s: 'Paste a board link', icon: PinterestIcon },
            ].map((o) => (
              <Pressable key={o.t} className="text-start">
                <Card className="rounded-sheet p-pad-sheet gap-3 shadow-k-md w-full">
                  <Box className="h-11 w-11 rounded-full bg-primary items-center justify-center"><Icon as={o.icon} size="lg" className="text-primary-foreground" /></Box>
                  <Box>
                    <Text size="md" bold>{o.t}</Text>
                    <Text size="xs" className="text-muted-foreground">{o.s}</Text>
                  </Box>
                </Card>
              </Pressable>
            ))}
          </Box>
        </Box>

        <Box className="mt-6 gap-3">
          <SectionRow title="Or start from a style" />
          {/* pb/-mb: a scroller clips its own children, so it needs room below for the card shadow to finish */}
          <HStack className="gap-3 overflow-x-auto snap-x scroll-pl-5 -mx-5 px-5 pb-14 -mb-6">
            {STYLES.map((s) => {
              const on = style === s.name;
              return (
                <Pressable key={s.name} onClick={() => setStyle(s.name)} aria-pressed={on} className="snap-start shrink-0 w-[44%] text-start">
                  <Card className={`rounded-sheet p-pad-sheet gap-2.5 shadow-k-md w-full ${on ? 'ring-2 ring-primary' : ''}`}>
                    {/* 2x2 swatches; the gap is the nesting padding, so each corner is concentric with the card */}
                    <Box className="relative grid grid-cols-2 gap-1 h-24 rounded-card overflow-hidden">
                      {s.tiles.map((t, i) => <Box key={i} className="rounded-field" style={{ background: t }} />)}
                      {on && <Box className="absolute right-1.5 top-1.5 h-7 w-7 rounded-full bg-primary items-center justify-center"><Icon as={Tick02Icon} size="sm" className="text-primary-foreground" /></Box>}
                    </Box>
                    <Text size="sm" bold>{s.name}</Text>
                  </Card>
                </Pressable>
              );
            })}
          </HStack>
        </Box>
      </Box>

      {/* The fade keeps the buttons readable over whatever scrolls beneath them */}
      <Box className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-12 gap-2 bg-gradient-to-t from-secondary from-55% to-transparent">
        <PillAction label="Continue" variant="default" className="w-full" centered />
        <Button variant="ghost" className="rounded-full h-11"><ButtonText>Skip for now</ButtonText></Button>
      </Box>
    </Box>
  );
};

/* ---------- Editor ---------- */

const ASSETS = [
  { name: 'Chair', icon: Chair01Icon },
  { name: 'Sofa', icon: Sofa01Icon },
  { name: 'Side table', icon: Table01Icon },
  { name: 'Floor lamp', icon: Lamp01Icon },
];

const EditorScreen: React.FC = () => {
  const [mode, setMode] = useState('edit');
  const [sheet, setSheet] = useState(false);
  const select = (id: string) => { setMode(id); setSheet(id === 'assets'); };
  return (
    <Box className="relative h-full overflow-hidden bg-cover" style={photo('10% 52%')}>
      {/* Top bar */}
      <HStack className="absolute inset-x-5 top-[max(1.5rem,env(safe-area-inset-top))] items-center gap-3">
        <RoundButton icon={Home01Icon} label="Home" glass />
        <Box className={`flex-1 h-12 rounded-full px-5 justify-center ${glassDk.clear}`}>
          <Text size="sm" bold isTruncated>Aarav’s room</Text>
        </Box>
        <RoundButton icon={Layers01Icon} label="Objects and fixed items" glass />
        <RoundButton icon={MoreHorizontalIcon} label="More options" glass />
      </HStack>

      {/* An object tag floating on the room */}
      <Box className="absolute left-[14%] top-[46%]">
        <HStack className={`items-center gap-2 h-10 pl-4 pr-1.5 rounded-full ${glassDk.clear}`}>
          <Text size="sm" bold>Teak bed</Text>
          <Box className="h-7 w-7 rounded-full bg-foreground/15 items-center justify-center"><Icon as={Edit02Icon} size="sm" className="text-foreground" /></Box>
        </HStack>
      </Box>

      {/* Bottom: the move panel, then the dock */}
      <Box className="absolute inset-x-5 bottom-5 gap-3">
        {/* One compact row, so the room stays the hero: discard, what is happening, confirm */}
        <HStack className={`${glassDk.panel} rounded-full p-2 items-center gap-3`}>
          <RoundButton icon={Cancel01Icon} label="Discard the move" glass size={48} />
          <Box className="flex-1 min-w-0">
            <Text size="sm" bold isTruncated>Teak bed</Text>
            <Text size="xs" className="text-muted-foreground" isTruncated>Snaps to the wall</Text>
          </Box>
          <PillAction label="Confirm" icon={Tick02Icon} variant="smoke" compact className="shrink-0 !bg-[rgb(var(--k-rose))]" />
        </HStack>

        <HStack className="items-center gap-2">
          <Dock
            className="flex-1"
            active={mode}
            onSelect={select}
            items={[
              { id: 'view', label: 'View', icon: ViewIcon },
              { id: 'edit', label: 'Edit', icon: PencilEdit01Icon },
              { id: 'assets', label: 'Assets', icon: AddSquareIcon },
            ]}
          />
          <Button variant="smoke" size="icon" aria-label="Ask AI" className="rounded-full h-[4.25rem] w-[4.25rem]"><ButtonIcon as={AiMagicIcon} /></Button>
        </HStack>
      </Box>

      <Actionsheet isOpen={sheet} onClose={() => { setSheet(false); setMode('edit'); }} title="Add furniture">
        <ActionsheetBackdrop className={glassDk.scrim} />
        <ActionsheetContent className={`max-w-md items-stretch p-pad-sheet pb-8 rounded-t-sheet border-t-0 ${glassDk.panel}`}>
          <ActionsheetDragIndicatorWrapper><ActionsheetDragIndicator className="bg-foreground/25" /></ActionsheetDragIndicatorWrapper>
          <HStack className="items-start justify-between gap-3 mb-4">
            <Box>
              <Heading size="lg">Add furniture</Heading>
              <Text size="sm" className="text-muted-foreground mt-0.5">Drop it into the room, then move it.</Text>
            </Box>
            <Button variant="ghost" size="icon" onClick={() => { setSheet(false); setMode('edit'); }} className="rounded-full bg-foreground/10" aria-label="Close"><ButtonIcon as={Cancel01Icon} /></Button>
          </HStack>
          <Box className="grid grid-cols-2 gap-3">
            {ASSETS.map((a) => (
              <Pressable key={a.name} onClick={() => { setSheet(false); setMode('edit'); }} className="text-start">
                <Box className="w-full rounded-card bg-secondary p-pad-card gap-2 shadow-k-sm">
                  <Box className="h-20 rounded-field bg-foreground/10 items-center justify-center"><Icon as={a.icon} size="xl" /></Box>
                  <HStack className="items-center justify-between">
                    <Text size="sm" bold>{a.name}</Text>
                    <Icon as={Add01Icon} size="sm" />
                  </HStack>
                </Box>
              </Pressable>
            ))}
          </Box>
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
};

/* ---------- Page ---------- */

export default function Screens() {
  const [screen, setScreen] = useState<ScreenId>('home');

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.kx = '';
    root.dataset.radius = 'soft';
    return () => { delete root.dataset.kx; delete root.dataset.radius; };
  }, []);

  return (
    <Box className="h-full w-full bg-neutral-200 text-foreground">
      <HStack className="shrink-0 items-center justify-between gap-3 px-4 py-2.5">
        <HStack className="gap-2" role="group" aria-label="Screen">
          {([['home', 'Home'], ['onboarding', 'Onboarding'], ['editor', 'Editor']] as const).map(([id, label]) => (
            <Chip key={id} selected={screen === id} onClick={() => setScreen(id)}>{label}</Chip>
          ))}
        </HStack>
        <a href="/styleguide" className="text-xs underline text-muted-foreground shrink-0">Style guide</a>
      </HStack>
      <Box className="flex-1 min-h-0 mx-auto w-full max-w-[430px] relative overflow-hidden sm:rounded-sheet sm:mb-3 sm:shadow-k-lg">
        {screen === 'home' && <HomeScreen />}
        {screen === 'onboarding' && <OnboardingScreen />}
        {screen === 'editor' && <EditorScreen />}
      </Box>
    </Box>
  );
}
