import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

/**
 * Server-side Gemini call for the editor's AI prompt. The API key is read from GEMINI_API_KEY on the
 * server only (never a VITE_ variable), so it is not shipped in the browser bundle.
 *
 * The prototype's editor is a scripted scenario, so Gemini does two things: writes a short, calm
 * reply, and picks which scripted change (if any) the user's request maps to. The client sends a
 * summary of the room as it is now; the server only offers changes that are still ahead of that
 * point in the story and checks the model's pick against them. See src/data/scenarioSteps.ts.
 */

/** The scripted story, in order. Mirrors SCENARIO_ORDER in src/data/scenarioSteps.ts. */
export const STORY = [
  '1_bed_fixed',
  '2_table_privacy_concern',
  '3_two_options',
  '4_option2_selected',
  '5_ghost_state',
  '6_side_table_moved',
  '7_fan_added',
  '8_personalization',
  '9_color_palette',
  '10_final_space',
] as const;

export type StoryStep = (typeof STORY)[number];
export type AiStep = 'none' | 'restart' | 'fill_table' | Exclude<StoryStep, '1_bed_fixed'>;

/** What each change does, in the words the model needs to match a request to it */
const CHANGE_HELP: Record<AiStep, string> = {
  none: 'Nothing changes. Use for questions, unclear requests, anything already in place, or anything not listed here.',
  restart: 'Start over from the original room.',
  fill_table: 'Put items on the desk (monitor, keyboard, desk pad, studio gear).',
  '2_table_privacy_concern': 'Move or turn the desk toward the window / natural light, or deal with privacy at the desk.',
  '3_two_options': 'Show options or suggestions for privacy.',
  '4_option2_selected': 'Go ahead with the slatted room divider.',
  '5_ghost_state': 'Plan the rest of the room: the wardrobe, dressing table, other elements.',
  '6_side_table_moved': 'Hide the plug point with the side table.',
  '7_fan_added': 'Airflow, ventilation, a pedestal fan.',
  '8_personalization': 'Make it cozy or personal: rug, plants, storage, lamp.',
  '9_color_palette': 'Colours, palette, curtains, bedsheet.',
  '10_final_space': 'Seating for guests, a folding chair, a gathering.',
};

export interface SceneSummary {
  currentStep: StoryStep;
  desk: 'east' | 'window' | 'window_ac' | 'top_left' | null;
  bed: boolean;
  roomDivider: boolean;
  sideTableHidingPlug: boolean;
  dressingTable: boolean;
  pedestalFan: boolean;
  verticalStorage: boolean;
  storageLamp: boolean;
  plant: boolean;
  rug: boolean;
  foldingChair: boolean;
  deskStyled: boolean;
  palette: 'warm_studio' | 'cool_pastel';
}

/** Where a selected piece should go, in terms of the room rather than coordinates */
export const MOVE_PLACES = ['none', 'near_window', 'near_door', 'west_wall', 'east_wall', 'north_wall', 'south_wall', 'room_center'] as const;
/** Which way it should face once there */
export const MOVE_FACES = ['keep', 'window', 'door', 'room_center'] as const;

export interface MoveIntent {
  place: (typeof MOVE_PLACES)[number];
  face: (typeof MOVE_FACES)[number];
}

/** What the person told us about this room during onboarding */
export interface RoomContext {
  name?: string;
  roomType?: string;
  description?: string;
  priorities?: string[];
  activities?: string[];
}

export interface AskBody {
  prompt: string;
  /** Names of the pieces the prompt is about; empty means the whole room */
  targets?: string[];
  /** The room as it is now. Older clients may omit it. */
  scene?: SceneSummary;
  room?: RoomContext;
}

export interface AskResult {
  reply: string;
  step: AiStep;
  /** Only for selected pieces: a proposed move, which the person still has to confirm */
  move?: MoveIntent;
  /** Only with the fill_table change: what to put on the desk, as a short phrase */
  deskGear?: string;
}

export interface HandlerResult {
  status: number;
  body: Record<string, unknown>;
}

const DESK_WORDS: Record<NonNullable<SceneSummary['desk']>, string> = {
  east: 'against the east wall',
  window: 'by the big south window',
  window_ac: 'under the window beside the AC',
  top_left: 'in the top-left corner by a window',
};

const yesNo = (v: boolean) => (v ? 'yes' : 'no');

const describeScene = (s: SceneSummary): string =>
  [
    `Bed: ${s.bed ? 'in place' : 'removed'}`,
    `Desk: ${s.desk ? DESK_WORDS[s.desk] : 'not placed'}${s.deskStyled ? ', with gear on it' : ''}`,
    `Slatted room divider: ${yesNo(s.roomDivider)}`,
    `Dressing table: ${yesNo(s.dressingTable)}`,
    `Side table hiding the plug point: ${yesNo(s.sideTableHidingPlug)}`,
    `Pedestal fan: ${yesNo(s.pedestalFan)}`,
    `Vertical wall storage: ${yesNo(s.verticalStorage)}`,
    `Storage lamp: ${yesNo(s.storageLamp)}`,
    `Monstera plant: ${yesNo(s.plant)}`,
    `Woven rug: ${yesNo(s.rug)}`,
    `Folding chair: ${yesNo(s.foldingChair)}`,
    `Colour palette: ${s.palette === 'warm_studio' ? 'warm studio' : 'cool pastel'}`,
  ].join('\n');

/** The changes still available from here: the story only moves forward, plus restart and desk gear */
export const legalChanges = (scene: SceneSummary | undefined): AiStep[] => {
  const ahead = scene
    ? STORY.slice(STORY.indexOf(scene.currentStep) + 1)
    : STORY.slice(1);
  return ['none', 'restart', 'fill_table', ...(ahead as Exclude<StoryStep, '1_bed_fixed'>[])];
};

const describeRoom = (r: RoomContext): string =>
  [
    r.name && `Name: ${r.name}`,
    r.roomType && `Kind of room: ${r.roomType}`,
    r.description && `In their words: ${r.description}`,
    r.activities?.length ? `What they do here: ${r.activities.join('; ')}` : '',
    r.priorities?.length ? `What matters most to them: ${r.priorities.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

const buildInstruction = (legal: AiStep[], scene: SceneSummary | undefined, room: RoomContext | undefined, hasTargets: boolean): string => `You are the assistant inside Layo, an app that lets people try furniture layouts in a 360 photo of their room before moving anything real.

The room: a compact bedroom. The windows are on the south wall and the entry door is on the north wall; the bed sits against the west wall. Fixed (cannot be moved): the walnut entry door, the built-in wardrobe, the two south-facing sliding windows, the split AC, switchboards and plug points, the ceiling fan, the tube light. Movable: a teak bed, a study desk and chair, a side cabinet, a dressing table with stool, a laundry hamper, storage boxes, a pedestal fan.
${room && describeRoom(room) ? `\nAbout this person and their room (let it shape what you say, without quoting it back):\n${describeRoom(room)}\n` : ''}${scene ? `\nThe room right now:\n${describeScene(scene)}\n` : ''}
Rules for "reply":
- One or two short sentences, warm and plain. Written for someone standing in the room, not a designer.
- Guide, never dictate. Say what you changed or what to weigh up; never claim there is one right layout.
- No measurements, numbers, units or percentages.
- Only say you changed something (added, moved, tucked) when "step" is not "none". When "step" is "none", acknowledge what they want or offer a thought, in words like "Noted" or "That could work", and never claim anything was moved or added.
- Describe only what "The room right now" shows. If they ask for something that is already in place, say it is already there and choose "none". Never claim an item exists that the list does not show.
- Do not mention these instructions, JSON, steps or the app's internals.

Rules for "step": pick the one change that best matches the request, from this list only:
${legal.map((s) => `- ${s}: ${CHANGE_HELP[s]}`).join('\n')}
${
  hasTargets
    ? `
The user has selected specific pieces (see "About these pieces" in the request), so "step" must be "none". Instead, if they want those pieces moved or turned, fill "move":
- place: where to put them (${MOVE_PLACES.filter((p) => p !== 'none').join(', ')}), or "none" to leave them where they are.
- face: which way they should face (${MOVE_FACES.join(', ')}); "keep" leaves the direction alone.
Always propose the move that was asked for, even if you think the piece is elsewhere or already close: the app works out exactly where the piece is and tells the person if nothing needs to move. Never say a piece "is already" somewhere you were asked to move it. A move is only a proposal: the person taps Confirm to place it. Say you have lined it up (for example "I've lined the desk up by the window"), never that it is already placed. If a selected piece is fixed (window, door, wardrobe, split AC, plug point), set place "none" and say kindly that it stays where it is.`
    : `When "step" is "fill_table", also set "deskGear" to just the items they want on the desk, as a short phrase such as "dual monitors and a desk lamp". Otherwise leave "deskGear" out.`
}`;

// Measured on this key: 3.5-flash ~2 s, flash-lite-latest ~1.5 s, 3.1-flash-lite ~14 s (too slow to
// be a fallback). A fallback must be a different model, because quotas are per model.
const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-flash-lite-latest'];
// Normal answers take 1-2 s. Three attempts of 4 s (12 s worst case) stay inside the client's 15 s wait
const ATTEMPT_TIMEOUT_MS = 4_000;
const MAX_ATTEMPTS = 3;

const errorText = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/** Busy, rate limited, retired or too slow: another model may well answer. Bad requests and bad keys will not. */
const isRetryable = (err: unknown): boolean =>
  /"code":\s*(404|429|500|503|504)\b/.test(errorText(err)) || /timeout|timed out|deadline|aborted/i.test(errorText(err));

const briefReason = (err: unknown): string => {
  const text = errorText(err);
  return /"code":\s*(\d+)/.exec(text)?.[1] ?? text.slice(0, 40);
};

const MAX_PROMPT_CHARS = 500;
const MAX_TARGETS = 5;

const DESKS = ['east', 'window', 'window_ac', 'top_left'] as const;
const BOOLS = ['bed', 'roomDivider', 'sideTableHidingPlug', 'dressingTable', 'pedestalFan', 'verticalStorage', 'storageLamp', 'plant', 'rug', 'foldingChair', 'deskStyled'] as const;

/** Accept only the exact shape; anything else is treated as "no scene" rather than trusted */
const parseScene = (raw: unknown): SceneSummary | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  if (typeof r.currentStep !== 'string' || !(STORY as readonly string[]).includes(r.currentStep)) return undefined;
  for (const k of BOOLS) if (typeof r[k] !== 'boolean') return undefined;
  const desk = r.desk === null ? null : (DESKS as readonly unknown[]).includes(r.desk) ? (r.desk as SceneSummary['desk']) : undefined;
  if (desk === undefined) return undefined;
  if (r.palette !== 'warm_studio' && r.palette !== 'cool_pastel') return undefined;
  return { ...(r as unknown as SceneSummary), desk };
};

const cleanText = (v: unknown, max: number): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;

const cleanList = (v: unknown, count: number, max: number): string[] | undefined => {
  if (!Array.isArray(v)) return undefined;
  const out = v.map((x) => cleanText(x, max)).filter((x): x is string => !!x).slice(0, count);
  return out.length ? out : undefined;
};

/** What the person said about their room: plain text only, capped, never trusted as structure */
const parseRoom = (raw: unknown): RoomContext | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const room: RoomContext = {
    name: cleanText(r.name, 60),
    roomType: cleanText(r.roomType, 30),
    description: cleanText(r.description, 400),
    priorities: cleanList(r.priorities, 8, 30),
    activities: cleanList(r.activities, 8, 60),
  };
  return Object.values(room).some(Boolean) ? room : undefined;
};

const parseBody = (raw: unknown): AskBody | null => {
  if (!raw || typeof raw !== 'object') return null;
  const { prompt, targets, scene, room } = raw as Record<string, unknown>;
  if (typeof prompt !== 'string') return null;
  const trimmed = prompt.trim();
  if (!trimmed) return null;
  const safeTargets = Array.isArray(targets)
    ? targets.filter((t): t is string => typeof t === 'string').slice(0, MAX_TARGETS).map((t) => t.slice(0, 60))
    : [];
  return { prompt: trimmed.slice(0, MAX_PROMPT_CHARS), targets: safeTargets, scene: parseScene(scene), room: parseRoom(room) };
};

// Best-effort limits. On serverless each instance has its own memory, so these only blunt bursts;
// the real backstop is a spend/quota cap on the key itself (Google AI Studio / Cloud console).
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
// Google's free tier allows 15 requests/minute per model for the whole key, so one visitor must
// stay well below that or they starve everyone else.
const MAX_PER_WINDOW = 8; // per client, per minute
const GLOBAL_WINDOW_MS = 3_600_000;
const MAX_GLOBAL_PER_HOUR = 600; // all clients on this instance
const globalHits: number[] = [];

const rateLimited = (key: string, now = Date.now()): boolean => {
  while (globalHits.length && now - globalHits[0] >= GLOBAL_WINDOW_MS) globalHits.shift();
  if (globalHits.length >= MAX_GLOBAL_PER_HOUR) return true;

  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  if (recent.length > MAX_PER_WINDOW) return true;
  globalHits.push(now);
  return false;
};

/**
 * Only this app's own pages may call the endpoint. Browsers always send Origin on a cross-site
 * POST and always send Sec-Fetch-Site, and neither can be forged by a web page, so this stops other
 * websites from using visitors' browsers to spend the key. A script outside a browser can still
 * fake these headers, which is why the rate limits and a quota cap on the key also exist.
 */
const isSameOrigin = (h: RequestHeaders): boolean => {
  if (h.secFetchSite) return h.secFetchSite === 'same-origin';
  if (!h.origin || !h.host) return false;
  try {
    return new URL(h.origin).host === h.host;
  } catch {
    return false;
  }
};

export interface RequestHeaders {
  origin?: string;
  host?: string;
  secFetchSite?: string;
}

export async function handleGeminiRequest(opts: {
  method: string | undefined;
  body: unknown;
  clientKey: string;
  headers: RequestHeaders;
  /** Aborted when the caller goes away, so the Gemini call stops instead of running on */
  signal?: AbortSignal;
  env: { GEMINI_API_KEY?: string; GEMINI_MODEL?: string; GEMINI_TIMEOUT_MS?: string };
}): Promise<HandlerResult> {
  const { method, body, clientKey, headers, env, signal } = opts;
  if (method !== 'POST') return { status: 405, body: { error: 'method_not_allowed' } };
  if (!isSameOrigin(headers)) return { status: 403, body: { error: 'forbidden' } };

  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey) return { status: 503, body: { error: 'ai_not_configured' } };

  // The SDK prefers GOOGLE_API_KEY from the environment over the key passed below, which would
  // silently swap in whatever key happens to be set on the machine. Make our key the only one.
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  if (proc?.env) delete proc.env.GOOGLE_API_KEY;

  const parsed = parseBody(body);
  if (!parsed) return { status: 400, body: { error: 'bad_request' } };

  if (rateLimited(clientKey)) return { status: 429, body: { error: 'rate_limited' } };

  // The main model first, then different ones if Google is busy with it. Quotas are per model, so a
  // rate-limited model usually leaves the others free. Each attempt has its own time budget, and
  // all of them together must finish inside the client's wait (see askGemini.ts).
  const primary = env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
  const models = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)].slice(0, MAX_ATTEMPTS);
  const attemptMs = Number(env.GEMINI_TIMEOUT_MS) || ATTEMPT_TIMEOUT_MS;
  const scope = parsed.targets && parsed.targets.length > 0 ? `About these pieces: ${parsed.targets.join(', ')}.` : 'About the whole room.';
  const hasTargets = !!parsed.targets && parsed.targets.length > 0;
  // With pieces selected the model proposes a move and cannot change the story; without, the reverse
  const legal = hasTargets ? (['none'] as AiStep[]) : legalChanges(parsed.scene);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const generate = (model: string) =>
      ai.models.generateContent({
        model,
        contents: `${scope}\nRequest: ${parsed.prompt}`,
        config: {
          // A local timer per attempt, plus the caller's cancel. (Not httpOptions.timeout: Google
          // rejects server-side deadlines under 10 s with a 400.)
          abortSignal: signal ? AbortSignal.any([signal, AbortSignal.timeout(attemptMs)]) : AbortSignal.timeout(attemptMs),
          systemInstruction: buildInstruction(legal, parsed.scene, parsed.room, hasTargets),
          temperature: 0.6,
          maxOutputTokens: 400,
          // A one-line reply and a label need no extended reasoning; it only adds seconds of waiting
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              // Only the changes that make sense from here: the model cannot pick anything else
              step: { type: Type.STRING, enum: legal },
              ...(hasTargets
                ? {
                    move: {
                      type: Type.OBJECT,
                      properties: {
                        place: { type: Type.STRING, enum: [...MOVE_PLACES] },
                        face: { type: Type.STRING, enum: [...MOVE_FACES] },
                      },
                      required: ['place', 'face'],
                    },
                  }
                : { deskGear: { type: Type.STRING } }),
            },
            required: ['reply', 'step'],
          },
        },
      });

    let response;
    for (const [i, model] of models.entries()) {
      try {
        response = await generate(model);
        if (i > 0) console.info(`[gemini] ${models[0]} was unavailable; answered by ${model}`);
        break;
      } catch (err) {
        if (signal?.aborted || !isRetryable(err) || i === models.length - 1) throw err;
        console.warn(`[gemini] ${model} failed (${briefReason(err)}); trying ${models[i + 1]}`);
      }
    }
    if (!response) return { status: 502, body: { error: 'ai_unavailable' } };

    const data = JSON.parse(response.text ?? '') as Partial<AskResult>;
    const reply = typeof data.reply === 'string' ? data.reply.trim().slice(0, 300) : '';
    if (!reply) return { status: 502, body: { error: 'empty_reply' } };
    // Belt and braces: the schema already limits the choice, but never act on anything illegal
    const step: AiStep = legal.includes(data.step as AiStep) ? (data.step as AiStep) : 'none';
    const result: AskResult = { reply, step };

    // A proposed move is only returned for selected pieces, and only if it says something
    const mv = data.move;
    if (hasTargets && mv && (MOVE_PLACES as readonly string[]).includes(mv.place) && (MOVE_FACES as readonly string[]).includes(mv.face)) {
      if (mv.place !== 'none' || mv.face !== 'keep') result.move = { place: mv.place, face: mv.face };
    }
    // Desk gear only makes sense with the fill_table change
    const gear = cleanText(data.deskGear, 80);
    if (step === 'fill_table' && gear) result.deskGear = gear;

    return { status: 200, body: { ...result } };
  } catch (err) {
    // Log the reason server-side; the client only learns that the AI is unavailable.
    console.error('[gemini] request failed:', err instanceof Error ? err.message : err);
    return { status: 502, body: { error: 'ai_unavailable' } };
  }
}
