import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { glass } from '@/components/glass';

export interface AssetItem {
  id: string;
  name: string;
  category: 'owned' | 'suggested';
  iconType:
    | 'bed'
    | 'side_table'
    | 'fan'
    | 'clock'
    | 'chair'
    | 'table'
    | 'separator'
    | 'dressing_table'
    | 'vertical_storage'
    | 'storage_lamp'
    | 'plant'
    | 'carpet'
    | 'storage_boxes';
  description: string;
  suggestedPlacement?: string;
}

export const ASSET_CATALOG: AssetItem[] = [
  {
    id: 'bed',
    name: 'Teak Wooden Bed',
    category: 'owned',
    iconType: 'bed',
    description: 'Solid teak double bed with carved headboard & mattress',
    suggestedPlacement: 'West Wall'
  },
  {
    id: 'side_table',
    name: 'Bedside Side Table',
    category: 'owned',
    iconType: 'side_table',
    description: 'Wooden side storage unit with drawer and reference books',
    suggestedPlacement: 'Hides Plug'
  },
  {
    id: 'fan',
    name: 'Standing Pedestal Fan',
    category: 'owned',
    iconType: 'fan',
    description: 'Telescoping 3-blade floor fan for targeted airflow',
    suggestedPlacement: 'Near Window'
  },
  {
    id: 'clock',
    name: 'Wooden Wall Clock',
    category: 'owned',
    iconType: 'clock',
    description: 'Minimal square wooden frame analog wall clock'
  },
  {
    id: 'chair',
    name: 'Study Desk Chair',
    category: 'owned',
    iconType: 'chair',
    description: 'Dark molded plastic armchair with woven textured backrest'
  },
  {
    id: 'table',
    name: 'Solid Wood Workstation',
    category: 'owned',
    iconType: 'table',
    description: 'Ergonomic study desk with laptop workspace & PC shelf',
    suggestedPlacement: 'By Window'
  },
  {
    id: 'dressing_table',
    name: 'Dressing Table & Mirror',
    category: 'owned',
    iconType: 'dressing_table',
    description: 'Slender wooden vanity console with tall mirror & stool',
    suggestedPlacement: 'Beside Wardrobe'
  },
  {
    id: 'laundry',
    name: 'Ventilated Laundry Hamper',
    category: 'owned',
    iconType: 'storage_boxes',
    description: 'Tall ventilated plastic mesh laundry hamper basket'
  },
  {
    id: 'separator',
    name: 'Slatted Room Divider',
    category: 'suggested',
    iconType: 'separator',
    description: 'Slatted timber screen providing privacy from entry door',
    suggestedPlacement: 'Behind Table'
  },
  {
    id: 'vertical_storage',
    name: 'Vertical Wall Storage',
    category: 'suggested',
    iconType: 'vertical_storage',
    description: 'Floating wall shelving to declutter cardboard boxes',
    suggestedPlacement: 'Above Table'
  },
  {
    id: 'storage_lamp',
    name: 'Lamp with Storage',
    category: 'suggested',
    iconType: 'storage_lamp',
    description: '2-tier display shelf floor lamp with warm ambient glow',
    suggestedPlacement: 'Beside Desk'
  },
  {
    id: 'plant',
    name: 'Monstera Indoor Plant',
    category: 'suggested',
    iconType: 'plant',
    description: 'Air-purifying botanical in warm terracotta planter',
    suggestedPlacement: 'Beside Desk'
  },
  {
    id: 'carpet',
    name: 'Woven Bohemian Rug',
    category: 'suggested',
    iconType: 'carpet',
    description: 'Warm textured area rug anchoring cozy work studio vibe',
    suggestedPlacement: 'Room Center'
  },
  {
    id: 'storage_boxes',
    name: 'Modular Storage Boxes',
    category: 'suggested',
    iconType: 'storage_boxes',
    description: 'Stackable felt & kraft boxes above flush wardrobe',
    suggestedPlacement: 'Above Wardrobe'
  }
];

interface AssetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (item: AssetItem) => void;
  onStartDragAsset?: (item: AssetItem) => void;
  /** The finger lifted after a drag: where on screen the piece was dropped */
  onDropAsset?: (item: AssetItem, clientX: number, clientY: number) => void;
  onOpenAiAssistant?: () => void;
}

const TABS: { id: 'all' | 'suggested' | 'owned'; label: string; icon?: typeof Sparkles }[] = [
  { id: 'all', label: 'All' },
  { id: 'suggested', label: 'Suggested', icon: Sparkles },
  { id: 'owned', label: 'Owned' },
];

export const AssetsDrawer: React.FC<AssetsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
  onStartDragAsset,
  onDropAsset,
  onOpenAiAssistant
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'suggested' | 'owned'>('all');
  const [drawerMode, setDrawerMode] = useState<'peek' | 'fullscreen'>('peek');
  const [draggingAsset, setDraggingAsset] = useState<AssetItem | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isOverEnvironment, setIsOverEnvironment] = useState(false);

  const sheetRef = React.useRef<HTMLDivElement>(null);
  const handleDragStartY = React.useRef<number | null>(null);
  const itemDragStartPos = React.useRef<{ x: number; y: number } | null>(null);
  const candidateItem = React.useRef<AssetItem | null>(null);

  if (!isOpen) return null;

  const filteredItems =
    activeTab === 'all'
      ? ASSET_CATALOG
      : activeTab === 'suggested'
      ? ASSET_CATALOG.filter((i) => i.category === 'suggested' || i.suggestedPlacement)
      : ASSET_CATALOG.filter(
          (i) => i.category === 'owned' || i.id === 'table' || i.id === 'fan' || i.id === 'side_table'
        );

  // Handle bar pointer interaction: pull down to close, drag up to expand to fullscreen
  const handleHandlePointerDown = (e: React.PointerEvent) => {
    handleDragStartY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleHandlePointerUp = (e: React.PointerEvent) => {
    if (handleDragStartY.current === null) return;
    const deltaY = e.clientY - handleDragStartY.current;
    handleDragStartY.current = null;

    if (deltaY > 50) {
      // Pull down gesture
      if (drawerMode === 'fullscreen') {
        setDrawerMode('peek');
      } else {
        onClose();
      }
    } else if (deltaY < -40) {
      // Pull up gesture
      setDrawerMode('fullscreen');
    } else if (Math.abs(deltaY) < 10) {
      // Tap toggle
      setDrawerMode((prev) => (prev === 'peek' ? 'fullscreen' : 'peek'));
    }
  };

  // Asset card pointer interaction: drag & drop into environment
  const handleItemPointerDown = (e: React.PointerEvent, item: AssetItem) => {
    itemDragStartPos.current = { x: e.clientX, y: e.clientY };
    candidateItem.current = item;
    let hasTriggeredDrag = false;

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      if (!itemDragStartPos.current || !candidateItem.current) return;
      const dx = moveEvent.clientX - itemDragStartPos.current.x;
      const dy = moveEvent.clientY - itemDragStartPos.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 6 && !hasTriggeredDrag) {
        hasTriggeredDrag = true;
        const target = candidateItem.current;
        // Instantly push down Assets Drawer so the user has an unobstructed 3D view
        onStartDragAsset?.(target);
        onClose();
      }
    };

    const handleWindowPointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);

      const target = candidateItem.current;
      const start = itemDragStartPos.current;
      itemDragStartPos.current = null;
      candidateItem.current = null;

      if (!target) return;

      if (hasTriggeredDrag) {
        onDropAsset?.(target, upEvent.clientX, upEvent.clientY);
      } else {
        const dist = start ? Math.hypot(upEvent.clientX - start.x, upEvent.clientY - start.y) : 0;
        if (dist <= 10) {
          // Simple tap: stage variant in room and close drawer
          onSelectAsset(target);
          onClose();
        }
      }

      setDraggingAsset(null);
      setIsOverEnvironment(false);
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
  };

  return (
    <>
      {/* 1. Backdrop layer covering the room view: tapping anywhere dismisses the assets pop-up */}
      <Pressable
        className="fixed inset-0 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-label="Dismiss asset panel"
      />

      {/* 2. Drag & Drop Floating Ghost Avatar */}
      {draggingAsset && (
        <VStack
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 items-center gap-2 select-none"
          style={{ left: pointerPos.x, top: pointerPos.y }}
        >
          <Center
            className={`w-20 h-20 rounded-full border-2 p-2.5 backdrop-blur-2xl shadow-hard-2 transition-all ${
              isOverEnvironment ? 'border-primary bg-primary/35 ring-4 ring-ring scale-110' : 'border-border bg-background/85 scale-100'
            }`}
          >
            <AssetIconRender iconType={draggingAsset.iconType} />
          </Center>
          <Badge variant="outline" className={glass.clear}>
            <BadgeText>{isOverEnvironment ? 'Drop to stage in room' : 'Drag up into room'}</BadgeText>
          </Badge>
        </VStack>
      )}

      {/* 3. Drop Zone Target Indicator in 3D Canvas when dragging */}
      {draggingAsset && isOverEnvironment && (
        <Center className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 w-40 h-40 rounded-full border-2 border-dashed border-primary bg-primary/10 animate-pulse">
          <Badge variant="outline" className={glass.clear}>
            <BadgeText>Staging Drop Zone</BadgeText>
          </Badge>
        </Center>
      )}

      {/* 4. Assets Drawer Sheet: Pull down to close, drag up to go full screen */}
      <HStack className="fixed inset-x-0 bottom-0 z-40 pointer-events-none justify-center animate-in slide-in-from-bottom">
        <VStack
          ref={sheetRef}
          onClick={(e) => e.stopPropagation()}
          className={`pointer-events-auto w-full max-w-lg rounded-t-3xl px-edge pt-3 pb-[calc(var(--k-bottom)+var(--k-dock)+var(--k-gap))] transition-all duration-300 ease-out ${glass.panel} ${
            drawerMode === 'fullscreen' ? 'h-[88vh]' : 'h-[52vh]'
          }`}
        >
          {/* Pull Handle Bar Area (Touch-friendly drag handle) */}
          <Center
            onPointerDown={handleHandlePointerDown}
            onPointerUp={handleHandlePointerUp}
            className="py-2.5 -my-1 cursor-grab active:cursor-grabbing select-none touch-none"
            title={drawerMode === 'fullscreen' ? 'Pull down to shrink/close' : 'Drag up for full screen · Pull down to close'}
          >
            <Box className="w-12 h-1.5 bg-muted rounded-full" />
          </Center>

          {/* Top Filter Tabs Bar */}
          <HStack className="items-center justify-between mt-2 mb-4 shrink-0 gap-2">
            <HStack className="p-1 rounded-full bg-muted gap-1 overflow-x-auto">
              {TABS.map(({ id, label, icon }) => (
                <Button
                  key={id}
                  size="sm"
                  variant={activeTab === id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(id)}
                  className="rounded-full"
                >
                  {icon && <ButtonIcon as={icon} />}
                  <ButtonText>{label}</ButtonText>
                </Button>
              ))}
            </HStack>

            <HStack className="items-center gap-1.5 shrink-0">
              {onOpenAiAssistant && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenAiAssistant();
                  }}
                  className="rounded-full"
                  aria-label="Ask Spatial AI for advice"
                >
                  <ButtonIcon as={Sparkles} />
                  <ButtonText className="hidden sm:flex">Ask AI</ButtonText>
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={onClose} className="rounded-full" aria-label="Close Drawer">
                <ButtonIcon as={X} />
              </Button>
            </HStack>
          </HStack>

          {/* 4-Column Grid of Circular Asset Cards */}
          <Box className="flex-1 overflow-y-auto pr-1 grid grid-cols-4 auto-rows-max gap-3.5 content-start">
            {filteredItems.map((item) => (
              <VStack
                key={item.id}
                onPointerDown={(e) => handleItemPointerDown(e, item)}
                className="items-center min-h-fit group cursor-grab active:cursor-grabbing select-none active:scale-95 transition-transform"
                title={`${item.name}${item.suggestedPlacement ? ` (${item.suggestedPlacement})` : ''}: drag into room or tap to stage`}
              >
                <Center className={`w-16 h-16 shrink-0 rounded-full p-2.5 relative overflow-hidden transition-all group-hover:scale-105 ${glass.clear}`}>
                  <AssetIconRender iconType={item.iconType} />
                </Center>
                <Text size="2xs" className="font-medium text-center mt-1 truncate max-w-[76px]">
                  {item.name.split(' ')[0]}
                </Text>
              </VStack>
            ))}
          </Box>
        </VStack>
      </HStack>
    </>
  );
};

// Procedural SVG Icon Renderers matching the clean asset renders in screenshots
function AssetIconRender({ iconType }: { iconType: AssetItem['iconType'] }) {
  switch (iconType) {
    case 'bed':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          {/* Wooden Bedhead */}
          <path d="M 6 18 Q 24 10 42 18 L 42 28 L 6 28 Z" fill="#8b4513" />
          {/* Mattress with paisley pink/burgundy duvet */}
          <rect x="8" y="24" width="32" height="14" rx="2" fill="#c46270" />
          <path d="M 12 28 Q 24 22 36 28" stroke="#fce7f3" strokeWidth="2" fill="none" />
          {/* Pillows */}
          <rect x="10" y="20" width="12" height="6" rx="2" fill="#ffffff" />
          <rect x="26" y="20" width="12" height="6" rx="2" fill="#ffffff" />
          {/* Wooden Legs */}
          <rect x="8" y="38" width="4" height="6" fill="#5c2e0b" />
          <rect x="36" y="38" width="4" height="6" fill="#5c2e0b" />
        </svg>
      );
    case 'side_table':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          <rect x="12" y="10" width="24" height="30" rx="2" fill="#b45309" />
          {/* Top drawer */}
          <rect x="14" y="14" width="20" height="8" rx="1" fill="#92400e" />
          <circle cx="24" cy="18" r="1.5" fill="#fde047" />
          {/* Books on top */}
          <rect x="16" y="7" width="16" height="3" fill="#f43f5e" />
          <rect x="18" y="5" width="12" height="2" fill="#38bdf8" />
          {/* Lower cabinet door */}
          <rect x="14" y="24" width="20" height="14" rx="1" fill="#78350f" />
          <circle cx="31" cy="31" r="1.5" fill="#fde047" />
        </svg>
      );
    case 'fan':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          {/* Base */}
          <ellipse cx="24" cy="42" rx="10" ry="3" fill="#1f2937" />
          {/* Pole */}
          <rect x="23" y="18" width="2" height="24" fill="#374151" />
          {/* Head & Cage */}
          <circle cx="24" cy="16" r="12" fill="none" stroke="#4b5563" strokeWidth="2" />
          <circle cx="24" cy="16" r="3" fill="#111827" />
          {/* Blades */}
          <ellipse cx="24" cy="11" rx="2.5" ry="5" fill="#374151" />
          <ellipse cx="20" cy="19" rx="5" ry="2.5" fill="#374151" transform="rotate(-30 20 19)" />
          <ellipse cx="28" cy="19" rx="5" ry="2.5" fill="#374151" transform="rotate(30 28 19)" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          <rect x="8" y="8" width="32" height="32" rx="6" fill="#d97706" />
          <rect x="11" y="11" width="26" height="26" rx="4" fill="#fefce8" />
          <circle cx="24" cy="24" r="1.5" fill="#1e293b" />
          <line x1="24" y1="24" x2="24" y2="16" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="24" x2="31" y2="24" stroke="#e11d48" strokeWidth="1" strokeLinecap="round" />
          <circle cx="24" cy="13" r="1" fill="#64748b" />
          <circle cx="24" cy="35" r="1" fill="#64748b" />
          <circle cx="13" cy="24" r="1" fill="#64748b" />
          <circle cx="35" cy="24" r="1" fill="#64748b" />
        </svg>
      );
    case 'chair':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          <rect x="13" y="8" width="22" height="18" rx="2" fill="#451a03" />
          <rect x="12" y="24" width="24" height="6" rx="2" fill="#15803d" />
          <rect x="14" y="30" width="3" height="14" fill="#331402" />
          <rect x="31" y="30" width="3" height="14" fill="#331402" />
          {/* Armrests */}
          <line x1="11" y1="20" x2="11" y2="26" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="37" y1="20" x2="37" y2="26" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'table':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          <rect x="8" y="18" width="32" height="4" rx="1" fill="#854d0e" />
          <rect x="10" y="22" width="3" height="20" fill="#1f2937" />
          <rect x="35" y="22" width="3" height="20" fill="#1f2937" />
          {/* Laptop on desk */}
          <rect x="18" y="16" width="12" height="2" fill="#94a3b8" />
          <rect x="20" y="9" width="8" height="7" rx="1" fill="#cbd5e1" />
        </svg>
      );
    case 'separator':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          <rect x="8" y="8" width="9" height="34" rx="1" fill="#a16207" />
          <rect x="19" y="6" width="9" height="34" rx="1" fill="#b45309" />
          <rect x="30" y="8" width="9" height="34" rx="1" fill="#854d0e" />
          {/* Vertical slats */}
          <line x1="12" y1="10" x2="12" y2="40" stroke="#fef3c7" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="23" y1="8" x2="23" y2="38" stroke="#fef3c7" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="34" y1="10" x2="34" y2="40" stroke="#fef3c7" strokeWidth="1" strokeDasharray="3 2" />
        </svg>
      );
    case 'dressing_table':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          {/* Table */}
          <rect x="10" y="24" width="28" height="4" rx="1" fill="#854d0e" />
          <rect x="12" y="28" width="3" height="16" fill="#1f2937" />
          <rect x="33" y="28" width="3" height="16" fill="#1f2937" />
          {/* Oval Mirror */}
          <ellipse cx="24" cy="14" rx="7" ry="10" fill="#bae6fd" stroke="#78350f" strokeWidth="1.5" />
        </svg>
      );
    case 'vertical_storage':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          <rect x="8" y="14" width="32" height="3" rx="1" fill="#a16207" />
          <rect x="8" y="28" width="32" height="3" rx="1" fill="#a16207" />
          {/* Storage bins / books */}
          <rect x="12" y="8" width="7" height="6" rx="1" fill="#0284c7" />
          <rect x="22" y="7" width="8" height="7" rx="1" fill="#f97316" />
          <rect x="14" y="22" width="10" height="6" rx="1" fill="#10b981" />
        </svg>
      );
    case 'storage_lamp':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          {/* Legs */}
          <line x1="14" y1="18" x2="10" y2="44" stroke="#78350f" strokeWidth="2" />
          <line x1="34" y1="18" x2="38" y2="44" stroke="#78350f" strokeWidth="2" />
          {/* Shelves */}
          <rect x="14" y="28" width="20" height="2" fill="#a16207" />
          <rect x="12" y="38" width="24" height="2" fill="#a16207" />
          {/* Lamp shade */}
          <path d="M 16 18 L 32 18 L 30 8 L 18 8 Z" fill="#fef08a" opacity="0.9" />
        </svg>
      );
    case 'plant':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          {/* Pot */}
          <polygon points="16,28 32,28 29,42 19,42" fill="#c2410c" />
          {/* Leaves */}
          <path d="M 24 28 Q 14 18 12 8 Q 24 14 24 28" fill="#15803d" />
          <path d="M 24 28 Q 34 18 36 8 Q 24 14 24 28" fill="#16a34a" />
          <path d="M 24 28 Q 24 12 28 6 Q 22 14 24 28" fill="#22c55e" />
        </svg>
      );
    case 'carpet':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          <rect x="8" y="12" width="32" height="24" rx="2" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
          <path d="M 12 24 L 24 14 L 36 24 L 24 34 Z" fill="none" stroke="#d97706" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" fill="#ea580c" />
        </svg>
      );
    case 'storage_boxes':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow">
          <rect x="10" y="20" width="12" height="12" rx="1" fill="#d4c5b9" />
          <rect x="26" y="20" width="12" height="12" rx="1" fill="#e7ded4" />
          <rect x="18" y="8" width="12" height="12" rx="1" fill="#b8a89b" />
        </svg>
      );
    default:
      return <Box className="w-6 h-6 rounded bg-muted" />;
  }
}
