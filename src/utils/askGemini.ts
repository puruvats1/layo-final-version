import type { SceneSummary } from '../data/scenarioSteps';

/** Client for the server-side Gemini proxy (`/api/gemini`). The API key never reaches the browser. */

export type AiStep =
  | 'none'
  | 'restart'
  | 'fill_table'
  | '2_table_privacy_concern'
  | '3_two_options'
  | '4_option2_selected'
  | '5_ghost_state'
  | '6_side_table_moved'
  | '7_fan_added'
  | '8_personalization'
  | '9_color_palette'
  | '10_final_space';

/** Where a selected piece should go, in terms of the room (mirrors MOVE_PLACES on the server) */
export type MovePlace = 'none' | 'near_window' | 'near_door' | 'west_wall' | 'east_wall' | 'north_wall' | 'south_wall' | 'room_center';
/** Which way it should face once there */
export type MoveFace = 'keep' | 'window' | 'door' | 'room_center';
export interface MoveIntent {
  place: MovePlace;
  face: MoveFace;
}

/** What the person said about their room during onboarding */
export interface RoomContext {
  name?: string;
  roomType?: string;
  description?: string;
  priorities?: string[];
  activities?: string[];
}

export interface AiAnswer {
  reply: string;
  step: AiStep;
  /** A proposed move for the selected pieces; the person still confirms it */
  move?: MoveIntent;
  /** What to put on the desk, when the change is fill_table */
  deskGear?: string;
}

/** Why there is no answer: the caller cancelled it (a newer request took over), the person is asking
 *  too fast ('busy'), or it failed (null) */
export type AiOutcome = AiAnswer | 'cancelled' | 'busy' | null;

/** The server reads at most this much of a prompt (api/_lib/gemini.ts), so the inputs stop there too */
export const MAX_PROMPT_CHARS = 500;

// The server makes at most three attempts of 4 s each (api/_lib/gemini.ts); wait slightly longer
const TIMEOUT_MS = 15_000;

/**
 * Ask Gemini about the room. Resolves to null on any failure (offline, not configured, rate limited,
 * timeout) so callers can fall back to the scripted behaviour instead of showing an error, and to
 * 'cancelled' when `signal` was aborted, which callers should ignore rather than fall back from.
 */
export async function askRoomAi(
  prompt: string,
  options: { targets?: string[]; scene?: SceneSummary; room?: RoomContext; signal?: AbortSignal } = {}
): Promise<AiOutcome> {
  const { targets = [], scene, room, signal } = options;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, targets, scene, room }),
      signal: controller.signal,
    });
    if (res.status === 429) return 'busy';
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<AiAnswer>;
    if (typeof data.reply !== 'string' || !data.reply) return null;
    return { reply: data.reply, step: data.step ?? 'none', move: data.move, deskGear: data.deskGear };
  } catch {
    return signal?.aborted ? 'cancelled' : null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
