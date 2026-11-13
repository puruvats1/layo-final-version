import React, { useMemo } from 'react';
import { Plus, Rotate3d, Focus, ChevronRight, type LucideIcon } from 'lucide-react';
import { LibraryItem, kindLabel, timeAgo } from '../data/library';
import { MOOD_PRESETS } from '../data/onboardingData';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { glass } from '@/components/glass';

interface HomeScreenProps {
  items: LibraryItem[];
  onCreate: () => void;
  onOpenSpace: (id: string) => void;
  onOpenShop?: () => void;
}

const RECENT_H = 'h-[clamp(140px,20dvh,200px)]';
const SHOP_SWATCHES = MOOD_PRESETS[0].tiles.slice(0, 3);

export const HomeScreen: React.FC<HomeScreenProps> = ({ items, onCreate, onOpenSpace, onOpenShop }) => {
  const sorted = useMemo(() => [...items].sort((a, b) => b.updatedAt - a.updatedAt), [items]);
  const [recent, ...rest] = sorted;
  const isEmpty = !recent;

  return (
    <Box className="relative h-full w-full overflow-hidden bg-background">
      {/* RECENT · the latest space, about a fifth of the screen */}
      <Box className="shrink-0 px-edge pt-top">
        <Box className="w-full max-w-xl mx-auto">
          {recent ? <RecentCard item={recent} onOpen={() => onOpenSpace(recent.id)} /> : <RecentPlaceholder />}
        </Box>
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto">
        <VStack className="w-full max-w-xl mx-auto px-edge min-h-full pb-[calc(var(--k-dock)+var(--k-bottom)+var(--k-row))]">
          {isEmpty ? (
            <EmptyState />
          ) : (
            <>
              {rest.length > 0 && (
                <Box aria-label="Your spaces" className="shrink-0">
                  <Text size="sm" className="mt-5 mb-3 px-1 font-semibold text-muted-foreground">Your spaces</Text>
                  <Box className="grid grid-cols-2 gap-4">
                    {rest.map((item) => (
                      <SpaceCard key={item.id} item={item} onOpen={() => onOpenSpace(item.id)} />
                    ))}
                  </Box>
                </Box>
              )}
              {items.length < 4 && <ShopCard onOpen={onOpenShop} />}
            </>
          )}
        </VStack>
      </Box>

      {/* Softly lifts the last row away from the create button */}
      {!isEmpty && (
        <Box className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/80 to-transparent" aria-hidden />
      )}

      <Box className="absolute z-20 right-edge bottom-bottom">
        <Button
          size="lg"
          onClick={onCreate}
          aria-label="Capture a space"
          className={`h-[var(--k-dock)] rounded-full shadow-k-md ${isEmpty ? 'px-9' : 'w-[var(--k-dock)] px-0'}`}
        >
          <ButtonIcon as={Plus} className="h-7 w-7" />
          {isEmpty && <ButtonText>Capture</ButtonText>}
        </Button>
      </Box>
    </Box>
  );
};

const RecentCard: React.FC<{ item: LibraryItem; onOpen: () => void }> = ({ item, onOpen }) => {
  const pans = item.kind === 'project';
  return (
    <Pressable onClick={onOpen} className="w-full" aria-label={`Open ${item.name}, ${kindLabel(item.kind)}`}>
      <Card className={`w-full p-0 overflow-hidden shadow-k-lg ${RECENT_H}`}>
        <Box
          className={`absolute inset-0 ${pans ? 'k-pan' : 'bg-cover'}`}
          style={{ backgroundImage: `url(${item.coverUrl})`, backgroundPosition: pans ? undefined : item.coverPosition }}
          aria-hidden
        />
        <Box className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-40% to-black/65" aria-hidden />
        <Badge variant="outline" className={`absolute top-3 right-3 ${glass.clear}`}>
          <BadgeIcon as={pans ? Rotate3d : Focus} />
          <BadgeText>{kindLabel(item.kind)}</BadgeText>
        </Badge>
        <Box className="absolute inset-x-0 bottom-0 p-4 dark">
          <Heading size="xl" isTruncated>{item.name}</Heading>
          <Text size="sm" className="mt-0.5 text-foreground/85">
            {timeAgo(item.updatedAt)} · {item.objectCount} objects
          </Text>
        </Box>
      </Card>
    </Pressable>
  );
};

const RecentPlaceholder: React.FC = () => (
  <Center className={`${RECENT_H} rounded-xl border border-dashed border-border`}>
    <Text size="sm" className="text-muted-foreground">Recent space</Text>
  </Center>
);

const SpaceCard: React.FC<{ item: LibraryItem; onOpen: () => void }> = ({ item, onOpen }) => (
  <Pressable onClick={onOpen} aria-label={`Open ${item.name}, ${kindLabel(item.kind)}`}>
    <Card className="aspect-square p-0 overflow-hidden">
      <Box className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${item.coverUrl})`, backgroundPosition: item.coverPosition }} aria-hidden />
      <Box className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent via-55% to-black/45" aria-hidden />
      <Badge variant="outline" className={`absolute top-2.5 right-2.5 ${glass.clear}`}>
        <BadgeIcon as={item.kind === 'project' ? Rotate3d : Focus} />
      </Badge>
      <Badge variant="outline" className={`absolute left-2.5 bottom-2.5 max-w-[calc(100%-1.25rem)] ${glass.clear}`}>
        <BadgeText className="truncate">{item.name}</BadgeText>
      </Badge>
    </Card>
  </Pressable>
);

const ShopCard: React.FC<{ onOpen?: () => void }> = ({ onOpen }) => (
  <Pressable onClick={onOpen} className="mt-5 shrink-0">
    <Card>
      <HStack className="items-start justify-between gap-3">
        <Box className="min-w-0">
          <Heading size="md">Shop for your room</Heading>
          <Text size="sm" className="mt-0.5 text-muted-foreground">Furniture and materials from online stores.</Text>
        </Box>
        <Icon as={ChevronRight} size="lg" className="text-muted-foreground mt-0.5" />
      </HStack>
      <Box className="grid grid-cols-3 gap-2" aria-hidden>
        {SHOP_SWATCHES.map((bg, i) => (
          <Box key={i} className="h-16 rounded-lg" style={{ background: bg }} />
        ))}
      </Box>
    </Card>
  </Pressable>
);

const EmptyState: React.FC = () => (
  <VStack className="flex-1 items-center justify-center py-6">
    <Box className="k-orb w-14 h-14" aria-hidden />
    <Heading size="xl" className="mt-5 text-center">Capture your first space</Heading>
    <VStack space="sm" className="mt-6 w-full max-w-xs">
      <Hint icon={Rotate3d} title="Whole room" detail="Turn once" />
      <Hint icon={Focus} title="One corner" detail="Take one photo" />
    </VStack>
  </VStack>
);

const Hint: React.FC<{ icon: LucideIcon; title: string; detail: string }> = ({ icon, title, detail }) => (
  <Card size="sm" className="flex-row items-center gap-3.5 bg-secondary border-0 shadow-none">
    <Center className="w-10 h-10 rounded-full bg-background shrink-0">
      <Icon as={icon} size="lg" />
    </Center>
    <Box className="min-w-0">
      <Text bold>{title}</Text>
      <Text size="sm" className="text-muted-foreground">{detail}</Text>
    </Box>
  </Card>
);
