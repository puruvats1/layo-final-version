import { CaptureKind } from '../types';
import type { RoomContext } from '../utils/askGemini';
import { SAMPLE_ROOM, HOME_ZONES } from './onboardingData';

/** One thing on Home. A whole-room (360°) scan is a project; a single photo is a quick space. */
export interface LibraryItem {
  id: string;
  name: string;
  kind: CaptureKind;
  coverUrl: string;
  /** CSS background-position for the cover (slice of the 360° strip) */
  coverPosition: string;
  updatedAt: number;
  objectCount: number;
  /** What the person said about this room in onboarding, for the AI. Older items have none. */
  context?: RoomContext;
}

const ITEMS_KEY = 'kith.library.v2';
const KIND_KEY = 'kith.captureKind';

const HOUR = 3_600_000;

const seed = (): LibraryItem[] => {
  const now = Date.now();
  return [
    {
      id: 'aarav_room',
      name: SAMPLE_ROOM.name,
      kind: 'project',
      coverUrl: SAMPLE_ROOM.panoramaUrl,
      coverPosition: '30% 50%',
      updatedAt: now - 2 * HOUR,
      objectCount: SAMPLE_ROOM.objectCount,
    },
    ...HOME_ZONES.map((z, i) => ({
      id: z.id,
      name: z.name,
      kind: 'zone' as const,
      coverUrl: z.imageUrl,
      coverPosition: z.position,
      updatedAt: now - (26 + i * 20) * HOUR,
      objectCount: 4 + i,
    })),
  ];
};

const read = (key: string): string | null => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const write = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable: Home still works for the session */ }
};

/**
 * First run opens on the curated sample spaces. `?empty=1` clears to the empty state
 * (kept for later), `?seed=1` restores the samples.
 */
export const loadLibrary = (): LibraryItem[] => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('empty')) { saveLibrary([]); return []; }
  if (params.has('seed')) { const items = seed(); saveLibrary(items); return items; }
  const raw = read(ITEMS_KEY);
  if (!raw) return seed();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LibraryItem[]) : seed();
  } catch {
    return seed();
  }
};

export const saveLibrary = (items: LibraryItem[]) => write(ITEMS_KEY, JSON.stringify(items));

/** The camera reopens on whatever the user captured last; first time is a whole room. */
export const loadCaptureKind = (): CaptureKind => (read(KIND_KEY) === 'zone' ? 'zone' : 'project');
export const saveCaptureKind = (kind: CaptureKind) => write(KIND_KEY, kind);

export const kindLabel = (kind: CaptureKind) => (kind === 'project' ? 'Whole room' : 'One corner');

export const timeAgo = (ts: number, now = Date.now()): string => {
  const mins = Math.floor((now - ts) / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
};
