import React from 'react';
import { Eye, Pencil, Layers, Sparkles, type LucideIcon } from 'lucide-react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { glass } from '@/components/glass';

export type MainNavTab = 'view' | 'edit' | 'ai' | 'assets';

interface MobileBottomNavProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  ai: {
    open: boolean;
    /** A request is running; the button says so while the prompt is closed */
    busy?: boolean;
    onOpen: () => void;
    /** Above the dock while open: scope and suggestions */
    context: React.ReactNode;
    /** The input row that fills the dock while open */
    form: React.ReactNode;
  };
  /** Height of the on-screen keyboard; the dock rides above it */
  keyboardOffset?: number;
}

const TABS: { id: Exclude<MainNavTab, 'ai'>; label: string; icon: LucideIcon; title: string }[] = [
  { id: 'view', label: 'View', icon: Eye, title: 'Look around the room' },
  { id: 'edit', label: 'Edit', icon: Pencil, title: 'Hold and drag furniture' },
  { id: 'assets', label: 'Assets', icon: Layers, title: 'Add furniture' },
];

const MOVE = '0.34s cubic-bezier(.2, .8, .2, 1)';

/**
 * Three modes in one pill, and AI as a round button beside it. Tapping AI grows the button leftward
 * over the modes until it is the prompt bar; closing it shrinks back.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onSelectTab, ai, keyboardOffset = 0 }) => (
  <Box
    className="fixed inset-x-0 z-40 px-edge pointer-events-none"
    style={{
      bottom: keyboardOffset > 0 ? keyboardOffset : 0,
      paddingBottom: keyboardOffset > 0 ? 12 : 'var(--k-bottom)',
      transition: 'bottom 0.2s ease, padding-bottom 0.2s ease',
    }}
  >
    <Box className="w-full max-w-[430px] mx-auto">
      {/* Scope and suggestions slide open above the bar */}
      <Box
        className="grid pointer-events-auto"
        style={{
          gridTemplateRows: ai.open ? '1fr' : '0fr',
          opacity: ai.open ? 1 : 0,
          transition: `grid-template-rows ${MOVE}, opacity 0.2s ease`,
        }}
        aria-hidden={!ai.open}
      >
        <Box className="min-h-0 overflow-hidden">
          <Box className="pb-3">{ai.context}</Box>
        </Box>
      </Box>

      <HStack className="items-center" style={{ columnGap: ai.open ? 0 : 8, transition: `column-gap ${MOVE}` }}>
        <Box
          className={`min-w-0 overflow-hidden grid grid-cols-3 gap-1 rounded-full ${glass.clear}`}
          style={{
            flex: ai.open ? '0 0 0px' : '1 1 0%',
            height: 'var(--k-dock)',
            padding: ai.open ? 0 : 6,
            opacity: ai.open ? 0 : 1,
            pointerEvents: ai.open ? 'none' : 'auto',
            transition: `flex ${MOVE}, padding ${MOVE}, opacity 0.18s ease`,
          }}
          role="navigation"
          aria-label="Editor modes"
          aria-hidden={ai.open}
        >
          {TABS.map(({ id, label, icon, title }) => (
            <Button
              key={id}
              variant={activeTab === id ? 'default' : 'ghost'}
              onClick={() => onSelectTab(id)}
              className="h-full flex-col gap-1 rounded-full px-0"
              aria-label={title}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <ButtonIcon as={icon} className="h-[22px] w-[22px]" />
              <ButtonText size="sm">{label}</ButtonText>
            </Button>
          ))}
        </Box>

        {/* One glass shape that is the AI button closed and the prompt bar open */}
        <Box
          className={`relative overflow-hidden pointer-events-auto rounded-full ${glass.clear}`}
          style={{
            flex: ai.open ? '1 1 0%' : '0 0 var(--k-dock)',
            height: ai.open ? 64 : 'var(--k-dock)',
            transition: `flex ${MOVE}, height ${MOVE}`,
          }}
          role="group"
          aria-label="AI"
        >
          <Box
            className="absolute inset-0"
            style={{ opacity: ai.open ? 0 : 1, pointerEvents: ai.open ? 'none' : 'auto', transition: 'opacity 0.16s ease' }}
          >
            <Button variant="ghost" onClick={ai.onOpen} className="w-full h-full rounded-full" aria-label={ai.busy ? 'AI is thinking' : 'Ask AI'} aria-busy={ai.busy}>
              <ButtonIcon as={Sparkles} className={`h-8 w-8 ${ai.busy ? 'animate-pulse' : ''}`} />
            </Button>
          </Box>
          <Box
            className="absolute inset-0"
            style={{ opacity: ai.open ? 1 : 0, pointerEvents: ai.open ? 'auto' : 'none', transition: `opacity 0.2s ease ${ai.open ? '0.14s' : '0s'}` }}
            aria-hidden={!ai.open}
          >
            {ai.form}
          </Box>
        </Box>
      </HStack>
    </Box>
  </Box>
);
