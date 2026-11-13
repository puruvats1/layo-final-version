/*
 * THROWAWAY stress harness for HomeScreen (break skill). Open /break/home.
 * Remove by deleting src/states/ and the guard in src/main.tsx.
 */
import React from 'react';
import { HomeScreen } from '../../screens/HomeScreen';
import { LibraryItem } from '../../data/library';
import { SAMPLE_ROOM, HOME_ZONES } from '../../data/onboardingData';

const HOUR = 3_600_000;
const now = Date.now();

/** n items shaped like the real library; `name` replaces the first project's and first zone's names */
const items = (n: number, name?: string): LibraryItem[] =>
  Array.from({ length: n }, (_, i) => {
    const zone = HOME_ZONES[(i - 1 + HOME_ZONES.length) % HOME_ZONES.length];
    const isProject = i === 0;
    return {
      id: `fx_${i}`,
      name: name !== undefined && i <= 1 ? name : isProject ? SAMPLE_ROOM.name : zone.name,
      kind: isProject ? 'project' : 'zone',
      coverUrl: isProject ? SAMPLE_ROOM.panoramaUrl : zone.imageUrl,
      coverPosition: isProject ? '30% 50%' : zone.position,
      updatedAt: now - (2 + i * 20) * HOUR,
      objectCount: isProject ? SAMPLE_ROOM.objectCount : 4 + (i % 5),
    } as LibraryItem;
  });

const SCENARIOS: { label: string; width: number; data: LibraryItem[]; note?: string }[] = [
  { label: 'Content length · empty name', width: 375, data: items(5, '') },
  { label: 'Content length · one word', width: 375, data: items(5, 'Den') },
  { label: 'Content length · typical', width: 375, data: items(5) },
  { label: 'Content length · several sentences', width: 375, data: items(5, 'The small bedroom at the back of the Koramangala flat, the one with the window that faces the neem tree'), note: 'FIXED (global.css truncate rule / HomeScreen shrink-0). Was: Recent title wraps upward out of the card, clipped at the top and over the Whole room badge (truncate loses to whitespace-pre-wrap) · better-typography' },
  { label: 'Content length · one unbreakable string', width: 375, data: items(5, 'KoramangalaFlatBackBedroomNumberTwoNeemTreeSide') },
  { label: 'Content shape · emoji', width: 375, data: items(5, '🛏️ Bed nook ✨') },
  { label: 'Content shape · tall script (Devanagari)', width: 375, data: items(5, 'आरव का कमरा') },
  { label: 'Content shape · RTL (Arabic)', width: 375, data: items(5, 'غرفة آراف') },
  { label: 'Quantity · zero items', width: 375, data: [] },
  { label: 'Quantity · one item', width: 375, data: items(1) },
  { label: 'Quantity · realistic (5)', width: 375, data: items(5) },
  { label: 'Quantity · ten times (50)', width: 375, data: items(50), note: 'FIXED (global.css truncate rule / HomeScreen shrink-0). Was: space cards collapse to thin lines and the list never scrolls (flex children shrink below content) · better-layout' },
  { label: 'Container · 320px, typical', width: 320, data: items(5) },
  { label: 'Container · 320px, long name', width: 320, data: items(5, 'The small bedroom at the back of the Koramangala flat'), note: 'FIXED (global.css truncate rule / HomeScreen shrink-0). Was: same wrap-out-of-card as the several-sentences scenario · better-typography' },
];

const noop = () => {};

export default function BreakPage() {
  return (
    <div style={{ height: '100dvh', overflowY: 'auto', padding: 24, background: '#f4f4f4' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center' }}>
        {SCENARIOS.map((s) => (
          <section key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ font: '600 12px system-ui, sans-serif', color: '#444' }}>{s.label}</div>
            {s.note && <div className="break-note" style={{ font: '12px system-ui, sans-serif', color: '#0a6b2b', maxWidth: s.width }}>{s.note}</div>}
            <div style={{ position: 'relative', width: s.width, height: 600, overflow: 'hidden', outline: '1px solid #ccc' }}>
              <HomeScreen items={s.data} onCreate={noop} onOpenSpace={noop} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
