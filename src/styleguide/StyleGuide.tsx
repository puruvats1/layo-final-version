import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Add01Icon, AiMagicIcon, ArrowRight01Icon, Cancel01Icon, Delete02Icon, Eraser01Icon, Home01Icon, Layers01Icon,
  MoreHorizontalIcon, Move01Icon, ScanIcon, Sun01Icon, Tick02Icon, Undo03Icon,
} from '@hugeicons/core-free-icons';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon, type AnyIcon } from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalHeader } from '@/components/ui/modal';
import {
  Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { glassLt } from '@/components/glass';

/*
 * /styleguide: the proposed Layo UI system in one scrolling page, built from the real components.
 * Nothing here is applied to the app yet. While this page is open it sets <html data-kx>, which switches on
 * the preview-only fonts and shadows from global.css.
 */

const PILL = 'rounded-full';
/**
 * Optical padding for pill buttons. An icon carries its own whitespace, so the side it sits on gets about 5px
 * less than the text side. Without this an icon button looks like it has a hole on the icon side.
 */
const OPT = 'px-6 has-[>svg:first-child]:pl-4 has-[>svg:last-child]:pr-4';
const TALL = 'h-[var(--k-ctl)]'; // 54px, the floating control height
const ROOM_IMG = '/assets/reference_room_panorama.jpg';

type Radius = 'soft' | 'tight';

/* ---------- Contrast maths (WCAG 2.x) ---------- */
type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a: RGB, b: RGB) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const over = (fg: RGB, alpha: number, bg: RGB): RGB => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha)) as RGB;
const token = (v: string): RGB => getComputedStyle(document.documentElement).getPropertyValue(v).trim().split(/\s+/).map(Number) as RGB;

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

type Check = { group: string; label: string; ratio: number; min: number };

const buildChecks = (): Check[] => {
  const fg = token('--foreground'), bg = token('--background'), mut = token('--muted-foreground'), sec = token('--secondary');
  const pri = token('--primary'), priFg = token('--primary-foreground'), des = token('--destructive'), ring = token('--ring');
  const onGlow = token('--on-glow');
  const glassDark: RGB = [30, 26, 38], glassMuted: RGB = [46, 41, 58];
  // Worst cases for a translucent surface: the room behind it is pure black, or pure white
  const glassOnBlack = over(WHITE, 0.58, BLACK), glassOnWhite = over(WHITE, 0.58, WHITE);
  const panelOnBlack = over(WHITE, 0.68, BLACK);
  // Smoked glass under the primary button over the room: 56% mid-tone tint over a backdrop dimmed to 60%, brightest or darkest room
  const smoke: RGB = [74, 64, 86];
  const dimmedWhite: RGB = [153, 153, 153]; // the backdrop is dimmed to 60% under the tint
  const smokeOnWhite = over(smoke, 0.56, dimmedWhite), smokeOnBlack = over(smoke, 0.56, BLACK);
  const text = 4.5, ui = 3;
  return [
    { group: 'Paper', label: 'Body text on white', ratio: ratio(fg, bg), min: text },
    { group: 'Paper', label: 'Muted text on white', ratio: ratio(mut, bg), min: text },
    { group: 'Paper', label: 'Muted text on the grey page and card (#F5F5F5)', ratio: ratio(mut, sec), min: text },
    { group: 'Paper', label: 'Primary button label', ratio: ratio(priFg, pri), min: text },
    { group: 'Paper', label: 'Destructive button label', ratio: ratio(WHITE, des), min: text },
    { group: 'Paper', label: 'Focus ring on white (non-text)', ratio: ratio(ring, bg), min: ui },
    { group: 'Light glass', label: 'Text, backdrop pure black', ratio: ratio(glassDark, glassOnBlack), min: text },
    { group: 'Light glass', label: 'Muted text, backdrop pure black', ratio: ratio(glassMuted, glassOnBlack), min: text },
    { group: 'Light glass', label: 'Text, backdrop pure white', ratio: ratio(glassDark, glassOnWhite), min: text },
    { group: 'Light glass', label: 'Panel text, backdrop pure black', ratio: ratio(glassDark, panelOnBlack), min: text },
    { group: 'Light glass', label: 'Muted panel text, backdrop pure black', ratio: ratio(glassMuted, panelOnBlack), min: text },
    { group: 'Buttons', label: 'Primary label on the flat dark grey', ratio: ratio(priFg, pri), min: text },
    { group: 'Buttons', label: 'Smoked glass label, room behind is white', ratio: ratio(onGlow, smokeOnWhite), min: text },
    { group: 'Buttons', label: 'Smoked glass label, room behind is black', ratio: ratio(onGlow, smokeOnBlack), min: text },
    { group: 'Buttons', label: 'Quiet glass button label, room behind is black', ratio: ratio(glassDark, glassOnBlack), min: text },
  ];
};

/* ---------- Layout helpers ---------- */

/** A surface to put things on: paper, or the room. Stages are sheet-level, so what is inside them is card-level. */
const Stage: React.FC<{ on: 'paper' | 'page' | 'room'; label?: string; children: React.ReactNode; className?: string }> = ({ on, label, children, className = '' }) => (
  <Box className="gap-1.5">
    {label && <Text size="2xs" className="text-muted-foreground uppercase tracking-wide">{label}</Text>}
    {on === 'page' ? (
      // The grey page itself, so white cards sit on it the way they do in the app (no white-on-white)
      <Box className={`bg-secondary rounded-sheet p-pad-sheet border border-foreground/5 ${className}`}>{children}</Box>
    ) : on === 'paper' ? (
      <Box className={`bg-background rounded-sheet p-pad-sheet shadow-k-sm ${className}`}>{children}</Box>
    ) : (
      <Box
        className={`rounded-sheet overflow-hidden p-pad-sheet bg-cover bg-center min-h-48 justify-end ${className}`}
        style={{ backgroundImage: `url(${ROOM_IMG})`, backgroundPosition: '40% 50%' }}
      >
        {children}
      </Box>
    )}
  </Box>
);

// A real <section> named by its heading, so screen-reader users can jump between the ten parts of the guide
const Section: React.FC<{ n: number; title: string; note?: string; children: React.ReactNode }> = ({ n, title, note, children }) => (
  <section aria-labelledby={`sg-${n}`} className="flex flex-col gap-3 pt-9">
    <Box>
      <Text size="2xs" className="text-muted-foreground" aria-hidden>{String(n).padStart(2, '0')}</Text>
      <Heading as="h2" id={`sg-${n}`} size="xl">{title}</Heading>
      {note && <Text size="sm" className="text-muted-foreground mt-1">{note}</Text>}
    </Box>
    {children}
  </section>
);

/** Reads the real rendered corner radius of its own box, so the numbers shown are what the browser draws. */
const Measured: React.FC<{ tick: unknown; className: string; label: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({ tick, className, label, children, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [r, setR] = useState(0);
  useLayoutEffect(() => {
    if (ref.current) setR(Math.round(parseFloat(getComputedStyle(ref.current).borderTopLeftRadius) * 10) / 10);
  }, [tick]);
  return (
    <Box ref={ref} className={className} style={style}>
      <Text size="2xs" bold className="mb-1.5 tabular-nums">{label} · {r}px</Text>
      {children}
    </Box>
  );
};

const TYPE_SCALE: { size: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'; px: number; use: string; title?: boolean }[] = [
  { size: '3xl', px: 28, use: 'Screen titles', title: true },
  { size: 'xl', px: 19, use: 'Card titles', title: true },
  { size: 'lg', px: 17, use: 'Emphasis' },
  { size: 'md', px: 15, use: 'Body' },
  { size: 'sm', px: 14, use: 'Labels, secondary body' },
  { size: 'xs', px: 13, use: 'Hints, chips, toasts' },
  { size: '2xs', px: 12, use: 'Meta, captions (the floor)' },
];

const TOKENS = [
  ['background', '--background'], ['foreground', '--foreground'], ['card', '--card'], ['primary', '--primary'],
  ['secondary', '--secondary'], ['muted', '--muted'], ['muted-foreground', '--muted-foreground'], ['accent', '--accent'],
  ['destructive', '--destructive'], ['border', '--border'], ['kith accent', '--k-accent'],
] as const;

const ICONS: { meaning: string; icon: AnyIcon; was?: string }[] = [
  { meaning: 'Home', icon: Home01Icon, was: 'Smartphone' },
  { meaning: 'Ask AI', icon: AiMagicIcon, was: 'Sparkles' },
  { meaning: 'Scan a room', icon: ScanIcon, was: 'Sparkles' },
  { meaning: 'Lighting', icon: Sun01Icon, was: 'Sparkles' },
  { meaning: 'Clear room', icon: Eraser01Icon },
  { meaning: 'Restore, undo', icon: Undo03Icon },
  { meaning: 'Move a piece', icon: Move01Icon },
  { meaning: 'Add', icon: Add01Icon },
  { meaning: 'Confirm', icon: Tick02Icon },
  { meaning: 'Close', icon: Cancel01Icon },
  { meaning: 'More options', icon: MoreHorizontalIcon },
  { meaning: 'Objects and fixed items', icon: Layers01Icon },
];

const COPY: { was: string[]; now: string }[] = [
  { was: ['Clear Canvas', 'Clear the room', 'Clear Room (Keep Fixtures)'], now: 'Clear room' },
  { was: ['Restore Canvas', 'Restore Original Layout'], now: 'Restore room' },
  { was: ['Reset Walkthrough'], now: 'Start over' },
  { was: ['Cycle Lighting (natural daylight)'], now: 'Change lighting' },
  { was: ['Start New 360° Scan'], now: 'Scan a new room' },
  { was: ['Keep Current'], now: 'Keep furniture' },
  { was: ['Return to Home Screen'], now: 'Home (drop the duplicate)' },
  { was: ['Wireframe Ghost / Solid Model'], now: 'Outline / Solid' },
  { was: ['Layo AI synthesizing layout…'], now: 'Working on it…' },
];

const px = (cssVar: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return v.endsWith('rem') ? Math.round(parseFloat(v) * 15 * 10) / 10 : 0;
};

export default function StyleGuide() {
  const [radius, setRadius] = useState<Radius>('soft');
  const [name, setName] = useState('Aarav’s room');
  const [about, setAbout] = useState('A compact bedroom with a teak bed along the west wall and a study desk.');
  const [picked, setPicked] = useState<string[]>(['Comfort']);
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [pads, setPads] = useState({ sheet: 0, card: 0 });
  const [checks, setChecks] = useState<Check[]>([]);

  // On <html> so the portalled sheet and dialog follow the radius and the preview fonts too
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.kx = '';
    return () => { delete root.dataset.kx; };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.radius = radius;
    setPads({ sheet: px('--pad-sheet'), card: px('--pad-card') });
    return () => { delete document.documentElement.dataset.radius; };
  }, [radius]);
  // Fonts load after first paint; contrast is measured from the live tokens
  useEffect(() => { setChecks(buildChecks()); }, [radius]);

  // Set the attribute before React re-renders, so the measured corners below read the new radius
  const chooseRadius = (r: Radius) => { document.documentElement.dataset.radius = r; setRadius(r); };
  const toggle = (k: string) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const failing = checks.filter((c) => c.ratio < c.min).length;

  return (
    // block, not Box's default flex column: a flex parent would shrink every section to the viewport height
    <Box className="block h-full w-full overflow-y-auto bg-secondary text-foreground">
      <Box className="mx-auto w-full max-w-[430px] px-4 pb-24">
        {/* Controls */}
        <Box className="sticky top-0 z-30 -mx-4 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-secondary/90 backdrop-blur">
          <HStack className="items-center justify-between">
            <Box>
              <Heading as="h1" size="2xl">Style guide</Heading>
              <Text size="xs" className="text-muted-foreground">Proposed, not applied yet</Text>
            </Box>
            <HStack className="gap-2" role="group" aria-label="Corner radius">
              <Chip selected={radius === 'soft'} onClick={() => chooseRadius('soft')}>Soft</Chip>
              <Chip selected={radius === 'tight'} onClick={() => chooseRadius('tight')}>Tight</Chip>
            </HStack>
          </HStack>
        </Box>

        {/* 44px tall (touch), with the same focus ring as Button and Chip */}
        <a
          href="/styleguide/screens"
          className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-card px-4 h-12 text-sm font-semibold shadow-k-sm transition-[box-shadow,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
        >
          See sample screens <Icon as={ArrowRight01Icon} size="sm" className="text-current" />
        </a>

        <Section n={1} title="Type" note="Poppins for screen and card titles. Open Sans for everything else. 12px floor.">
          <Card size="sm" className="gap-2 rounded-card p-pad-card">
            {TYPE_SCALE.map((t) => (
              <HStack key={t.size} className="items-baseline justify-between gap-3 border-b border-border/20 pb-2 last:border-0 last:pb-0">
                {t.title
                  ? <Heading size={t.size === '3xl' ? '2xl' : 'xl'}>Quiet corner</Heading>
                  : <Text size={t.size} className="whitespace-nowrap">Quiet corner</Text>}
                <Text size="2xs" className="text-muted-foreground text-right min-w-0">{t.title ? 'Poppins · ' : ''}{t.px}px · {t.use}</Text>
              </HStack>
            ))}
          </Card>
        </Section>

        <Section n={2} title="Corners that nest" note="A child’s radius is its parent’s radius minus the parent’s padding, so every corner stays concentric. Pills always nest.">
          <Stage on="paper" className="gap-2.5">
            <Measured tick={radius} label="Sheet" className="bg-secondary rounded-sheet p-pad-sheet gap-1" >
              <Text size="2xs" className="text-muted-foreground mb-1">{px('--r-sheet')} − {pads.sheet} padding = card</Text>
              <Measured tick={radius} label="Card" className="bg-card rounded-card p-pad-card shadow-k-md gap-1">
                <Text size="2xs" className="text-muted-foreground mb-1">card − {pads.card} padding = field</Text>
                <Measured tick={radius} label="Field" className="bg-secondary rounded-field px-3 py-3" />
                <HStack className="gap-2 mt-2">
                  <Chip>Pill</Chip>
                  <Chip selected>Pill</Chip>
                </HStack>
              </Measured>
            </Measured>
            <Text size="xs" className="text-muted-foreground">Use rounded-sheet with p-pad-sheet, then rounded-card with p-pad-card, then rounded-field. The 4px floor stops deep nesting going square.</Text>
          </Stage>
        </Section>

        <Section n={3} title="Colours" note="Semantic tokens only. No hex in components. Light first; dark is the old glass.">
          {(['', 'dark'] as const).map((mode) => (
            <Box key={mode || 'light'} className={`${mode} bg-background text-foreground rounded-sheet p-pad-sheet shadow-k-sm`}>
              <Text size="2xs" className="text-muted-foreground uppercase tracking-wide mb-2">{mode ? 'Dark' : 'Light (paper)'}</Text>
              <Box className="grid grid-cols-3 gap-2">
                {TOKENS.map(([label, v]) => (
                  <VStack key={label} className="gap-1">
                    <Box className="h-10 rounded-field border border-border/30" style={{ background: `rgb(var(${v}))` }} />
                    <Text size="2xs" className="text-muted-foreground">{label}</Text>
                  </VStack>
                ))}
              </Box>
            </Box>
          ))}
        </Section>

        <Section n={4} title="Contrast" note={`Measured live from the tokens, against the worst backdrop a surface can sit on. ${failing === 0 && checks.length ? 'All pass.' : `${failing} below target.`}`}>
          <Card size="sm" className="gap-0 rounded-sheet p-pad-sheet">
            {['Paper', 'Light glass', 'Buttons'].map((g) => (
              <Box key={g} className="mb-3 last:mb-0">
                <Text size="2xs" className="text-muted-foreground uppercase tracking-wide mb-1">{g}</Text>
                {checks.filter((c) => c.group === g).map((c) => {
                  const pass = c.ratio >= c.min;
                  return (
                    <HStack key={c.label} className="items-center justify-between gap-3 py-1.5 border-b border-border/20 last:border-0">
                      <Text size="xs" className="flex-1">{c.label}</Text>
                      <Text size="xs" bold className="tabular-nums">{c.ratio.toFixed(1)}:1</Text>
                      {/* Not colour alone: an icon and a word carry the result too */}
                      <HStack className={`items-center justify-center gap-1 shrink-0 min-w-[5.5rem] rounded-full pl-1.5 pr-2 py-0.5${pass ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                        <Icon as={pass ? Tick02Icon : Cancel01Icon} size="xs" className="text-current" />
                        <Text size="2xs" bold className="text-current tabular-nums">
                          {pass ? 'Pass' : 'Fail'} · {pass ? '≥' : '<'} {c.min}
                        </Text>
                      </HStack>
                    </HStack>
                  );
                })}
              </Box>
            ))}
            <Text size="2xs" className="text-muted-foreground">Text needs 4.5:1, interface edges 3:1. Light glass is at least 58% white, so even over a black room the surface stays mid-grey.</Text>
          </Card>
        </Section>

        <Section n={5} title="Buttons" note="Primaries are a flat dark grey with a warm pink-white label, never pure black. Over the room the primary is smoked glass: tinted, blurred, no gradient, no glow.">
          {/* The one big moment on the page (R4): the primary button deserves the most room */}
          <Stage on="room" label="Glass over the room: smoked primary, blurred secondary" className="gap-3 min-h-64">
            <HStack className="flex-wrap items-center gap-3">
              <Button variant="smoke" className={`${PILL} ${TALL} ${OPT}`}><ButtonIcon as={AiMagicIcon} /><ButtonText>Ask AI</ButtonText></Button>
              <Button variant="glass" className={`${PILL} ${TALL} ${OPT}`}><ButtonText>Keep furniture</ButtonText></Button>
            </HStack>
            <HStack className="flex-wrap items-center gap-3">
              <Button variant="glass" size="icon" className={`${PILL} ${TALL} w-[var(--k-ctl)]`} aria-label="More options"><ButtonIcon as={MoreHorizontalIcon} /></Button>
              <Button variant="smoke" size="icon" className={`${PILL} ${TALL} w-[var(--k-ctl)]`} aria-label="Add"><ButtonIcon as={Add01Icon} /></Button>
              <Button variant="smoke" disabled className={`${PILL} ${TALL} ${OPT}`}><ButtonText>Disabled</ButtonText></Button>
            </HStack>
          </Stage>
          <Stage on="paper" label="On paper: flat dark grey" className="gap-3">
            <HStack className="flex-wrap items-center gap-3">
              <Button className={`${PILL} h-12 ${OPT}`}><ButtonText>Continue</ButtonText><ButtonIcon as={ArrowRight01Icon} /></Button>
              <Button variant="secondary" className={`${PILL} h-12 ${OPT}`}><ButtonText>Skip</ButtonText></Button>
              <Button variant="ghost" className={`${PILL} h-12 px-4`}><ButtonText>Not now</ButtonText></Button>
            </HStack>
          </Stage>
          <Text size="xs" className="text-muted-foreground">Icons are 22px next to the label. Destructive appears only inside a confirm dialog.</Text>
        </Section>

        <Section n={6} title="Chips" note="One chip. Glass over the room, paper on white. Selected fills it.">
          <Stage on="paper" label="Paper, choose any">
            <HStack className="flex-wrap gap-2">
              {['Comfort', 'Privacy', 'Natural light', 'Ventilation', 'Storage'].map((k) => (
                <Chip key={k} selected={picked.includes(k)} onClick={() => toggle(k)}>
                  <Icon as={picked.includes(k) ? Tick02Icon : Add01Icon} size="xs" className="text-current" />
                  {k}
                </Chip>
              ))}
            </HStack>
          </Stage>
          <Stage on="room" label="Glass, labels and suggestions">
            <HStack className="flex-wrap gap-2">
              <Chip tone="glass">Whole room</Chip>
              <Chip tone="glass" onClick={() => {}}>Fix my desk</Chip>
              <Chip tone="glass" selected onClick={() => {}}>Hide the plug</Chip>
            </HStack>
          </Stage>
        </Section>

        <Section n={7} title="Fields" note="Field radius when inside a card, 16px text on phones so iOS never zooms.">
          <Stage on="page" className="gap-3">
            <Card size="sm" className="rounded-card p-pad-card gap-3 shadow-k-md">
              <Input className="h-12 rounded-field">
                <InputField value={name} onChangeText={setName} placeholder="Room name" aria-label="Room name" />
                {name && <InputSlot onClick={() => setName('')} aria-label="Clear name"><Icon as={Cancel01Icon} size="sm" /></InputSlot>}
              </Input>
              <Textarea className="h-auto min-h-28 rounded-field">
                <TextareaInput value={about} onChangeText={setAbout} rows={4} aria-label="Description" className="text-sm p-3" />
              </Textarea>
              <Progress value={60} className="h-1.5" aria-label="Scan progress"><ProgressFilledTrack /></Progress>
            </Card>
          </Stage>
        </Section>

        <Section n={8} title="Surfaces and shadows" note="Shadows are wide and faint. Light glass floats; open the real sheet and dialog.">
          <Stage on="page" className="gap-3">
            <Card size="sm" className="rounded-card p-pad-card shadow-k-md">
              <Heading size="md">Bed corner</Heading>
              <Text size="sm" className="text-muted-foreground">Card on paper, diffused shadow.</Text>
            </Card>
          </Stage>
          <Stage on="room" className="gap-3">
            <Box className={`${glassLt.panel} rounded-sheet px-6 py-4`}>
              <Heading size="sm">Floating panel</Heading>
              <Text size="sm" className="text-muted-foreground">Frosted white for text that must be read.</Text>
            </Box>
            <HStack className="gap-3">
              <Button variant="smoke" onClick={() => setSheet(true)} className={`${PILL} flex-1 h-12`}><ButtonText>Open sheet</ButtonText></Button>
              <Button variant="glass" onClick={() => setDialog(true)} className={`${PILL} flex-1 h-12`}><ButtonText>Open dialog</ButtonText></Button>
            </HStack>
          </Stage>
        </Section>

        <Section n={9} title="One icon per meaning" note="Hugeicons only. Home stops being a phone; Sparkles stops meaning three things.">
          <Card size="sm" className="gap-0 rounded-sheet p-pad-sheet">
            {ICONS.map((i) => (
              <HStack key={i.meaning} className="items-center gap-3 py-2.5 border-b border-border/20 last:border-0">
                <Box className="h-9 w-9 rounded-full bg-secondary items-center justify-center shrink-0"><Icon as={i.icon} size="md" /></Box>
                <Text size="sm" className="flex-1">{i.meaning}</Text>
                {i.was && <Text size="2xs" className="text-muted-foreground text-right">was {i.was}</Text>}
              </HStack>
            ))}
          </Card>
        </Section>

        <Section n={10} title="One name per action" note="Sentence case everywhere. Old names crossed out.">
          <Card size="sm" className="gap-0 rounded-sheet p-pad-sheet">
            {COPY.map((c) => (
              <VStack key={c.now} className="gap-1 py-2.5 border-b border-border/20 last:border-0">
                <Text size="sm" bold>{c.now}</Text>
                <Text size="2xs" className="text-muted-foreground line-through">{c.was.join('  ·  ')}</Text>
              </VStack>
            ))}
          </Card>
        </Section>
      </Box>

      <Actionsheet isOpen={sheet} onClose={() => setSheet(false)} title="Sample sheet">
        <ActionsheetBackdrop className={glassLt.scrim} />
        <ActionsheetContent className={`max-w-md items-stretch p-pad-sheet pb-8 rounded-t-sheet border-t-0 ${glassLt.panel}`}>
          <ActionsheetDragIndicatorWrapper><ActionsheetDragIndicator className="bg-foreground/25" /></ActionsheetDragIndicatorWrapper>
          <HStack className="items-start justify-between gap-3 mb-4">
            <Box>
              <Heading size="lg">What is it?</Heading>
              <Text size="sm" className="text-muted-foreground mt-0.5">Drag down to close.</Text>
            </Box>
            <Button variant="glass" size="icon" onClick={() => setSheet(false)} className={PILL} aria-label="Close"><ButtonIcon as={Cancel01Icon} /></Button>
          </HStack>
          <HStack className="flex-wrap gap-2">
            {['Bed', 'Desk', 'Chair', 'Cabinet', 'Fan'].map((k) => <Chip key={k} onClick={() => setSheet(false)} className="bg-card/70">{k}</Chip>)}
          </HStack>
        </ActionsheetContent>
      </Actionsheet>

      <Modal isOpen={dialog} onClose={() => setDialog(false)} size="sm" title="Sample dialog">
        <ModalBackdrop className={glassLt.scrim} />
        <ModalContent className={`rounded-sheet p-pad-sheet border-white/60 shadow-k-lg ${glassLt.panel}`}>
          <ModalHeader className="pb-2 border-b border-foreground/15">
            <Heading size="sm">Clear the room?</Heading>
            <ModalCloseButton><Icon as={Cancel01Icon} size="sm" /></ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text size="sm" className="block text-muted-foreground mb-4">Movable furniture is hidden. Doors, windows and plugs stay. You can restore it any time.</Text>
            <VStack className="gap-2">
              <Button variant="smoke" onClick={() => setDialog(false)} className={`${PILL} h-12 ${OPT}`}><ButtonText>Keep furniture</ButtonText></Button>
              <Button variant="destructive" onClick={() => setDialog(false)} className={`${PILL} h-12 ${OPT}`}><ButtonIcon as={Delete02Icon} /><ButtonText>Clear room</ButtonText></Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
