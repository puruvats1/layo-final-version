/* Layo's local model (Ollama, qwen3.5:4b).
   The split: the code measures the room and tests every rule (room.ts). The model never does geometry.
   It is handed the measurements and decides what to present: which checks become a card or a marker and in
   what order, how each is worded, which actions are offered, which candidate spots to show as options,
   and what a chat message becomes. Every answer is schema-constrained, then validated here; anything
   invalid or late falls back to the scripted rules, so the prototype works with the model off. */
import { FINISHES, PLUGS, START, place, settle, rect, optionCandidates, reply, runChecks, type Obj, type Prefs, type Fixed, type Check, type Option, type AiMsg, type Change } from './room';

const BASE = typeof window === 'undefined' ? 'http://localhost:11434' : '/ollama';
export const MODEL = 'qwen3.5:4b';
/** think: chat reasons before it answers. Measured on qwen3.5:4b (2026-11-12): over 85 s a message and no answer inside 4000 tokens, so it stays off. */
export const brain = { on: true, think: false, ready: false, calls: 0, fails: 0, ms: 0, log: [] as string[] };
if (typeof window !== 'undefined') (window as unknown as { __kith: typeof brain }).__kith = brain; // for looking at timings in the console
type Msg = { role: string; content: string };

async function ask<T>(task: string, system: string, user: string, schema: object, o: { ms?: number; predict?: number; history?: Msg[]; think?: boolean } = {}): Promise<T | null> {
  if (!brain.on) return null;
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), o.ms ?? 9000), t0 = Date.now();
  try {
    const r = await fetch(BASE + '/api/chat', {
      method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, stream: false, think: !!o.think, format: schema, keep_alive: '30m', options: { temperature: 0.2, num_ctx: o.think ? 8192 : 4096, num_predict: o.predict ?? 260 }, messages: [{ role: 'system', content: system }, ...(o.history || []), { role: 'user', content: user }] }),
    });
    if (!r.ok) throw new Error(String(r.status));
    const out = JSON.parse((await r.json()).message.content) as T;
    brain.ready = true; brain.calls++; brain.ms = Date.now() - t0; brain.log.push(`${task} ${brain.ms}ms`);
    return out;
  } catch (e) { brain.fails++; brain.log.push(`${task} failed: ${(e as Error).message}`); return null; } finally { clearTimeout(timer); }
}
/** Is the model there? Also loads it into memory so the first real call is quick. */
export const wake = async (): Promise<boolean> => {
  try {
    const j = await (await fetch(BASE + '/api/tags')).json();
    brain.ready = !!j.models?.some((m: { name: string }) => m.name === MODEL);
    if (brain.ready && brain.on) void ask('wake', 'Reply in JSON.', 'ready?', { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'] }, { ms: 90000, predict: 12 });
  } catch { brain.ready = false; }
  return brain.ready;
};

/* ---------------- the room as numbers ---------------- */
const f = (v: number) => v.toFixed(2);
const d2 = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const WIN = [[-0.92, 1.7], [0.92, 1.7]];
const ROOM = `ROOM 3.40 x 3.40 m, ceiling 2.75 m. Metres. x runs east, z runs south, 0,0 is the centre.
North wall (z=-1.70): door x -0.50..0.50 opening inward; built-in wardrobe x -1.70..-0.75, 0.58 deep.
South wall (z=1.70): window 1 x -1.40..-0.50 with the AC above it; window 2 x 0.40..1.45.`;
export const facts = (objs: Obj[], fixed: Fixed[], prefs: Prefs, checks: Check[]): string => {
  const plug = (id: string) => { const fx = fixed.find((x) => x.id === id); return !fx || fx.state === 'gone' || fx.notPlug ? null : `${id === 'plugA' ? 'plug A' : 'plug B'} at ${f(PLUGS[id][0])},${f(PLUGS[id][2])}${fx.state === 'unsure' ? ' (uncertain detection)' : ''}`; };
  const rows = objs.filter((o) => o.inRoom).map((o) => {
    const notes = [o.powered ? `needs a plug, nearest ${f(Math.min(...Object.values(PLUGS).map((p) => d2(o.at, [p[0], p[2]]))))} m` : '', `nearest window ${f(Math.min(...WIN.map((w) => d2(o.at, w))))} m`, o.link ? `moves with ${o.link}` : '', o.origin !== 'room' ? o.origin : '', START.some((s) => s.id === o.id && s.inRoom && (s.at[0] !== o.at[0] || s.at[1] !== o.at[1] || s.rot !== o.rot)) ? 'moved from where it started' : ''].filter(Boolean).join('; ');
    return `${o.id} | ${o.name} | ${f(o.at[0])},${f(o.at[1])} | ${f(o.dims[0])}x${f(o.dims[2])}x${f(o.dims[1])} | ${Math.round((o.rot * 180) / Math.PI)} | ${notes}`;
  });
  const out = objs.filter((o) => !o.inRoom).map((o) => `${o.id} (${o.name}, ${o.origin})`);
  return [ROOM, `Plugs: ${['plugA', 'plugB'].map(plug).filter(Boolean).join('; ') || 'none'}.`,
    'OBJECTS IN THE ROOM (id | name | centre x,z | width x depth x height | turned, degrees | notes)', ...rows,
    `NOT IN THE ROOM, available in Assets: ${out.join(', ') || 'nothing'}.`,
    `WHAT THE PERSON TOLD US. Priorities, ranked: ${prefs.priorities.map((p, i) => `${i + 1} ${p}`).join(', ') || 'none'}. Main activities: ${prefs.main.join(', ') || 'none'}. Sometimes: ${prefs.some.join(', ') || 'none'}.${prefs.words.length ? ' From their own words: they take calls at the desk.' : ''}`,
    checks.length ? 'OPEN CHECKS (id | object | kind | finding | measurement)' : 'OPEN CHECKS: none.', ...checks.map(checkRow)].join('\n');
};
const checkRow = (c: Check) => `${c.key} | ${c.obj} | ${c.kind === 'fact' ? 'room fact' : 'their preference'}${c.why ? ` (${c.why})` : ''} | ${c.text} | ${c.m || ''}${c.hedge ? ' | rests on an uncertain detection' : ''}${c.before ? ' | was already true before they changed anything' : ''}`;

const VOICE = `You are Layo, a calm assistant inside a room-layout app for one small bedroom. The app has already measured everything and tested every rule; trust its numbers and never invent geometry.
How you write: one or two short plain sentences. Describe the effect, never give a verdict or an instruction. Never use the words warning, error, violation, invalid, must or should. Never write numbers or units; say distance in words ("a long way", "a tight squeeze"). When a finding comes from something the person chose, name it ("You chose Privacy.").`;
const okLine = (s: unknown, max = 170): s is string => typeof s === 'string' && s.trim().length >= 12 && s.length <= max && !/\d/.test(s.replace(/window \d/gi, '')) && !/warning|error|violation|invalid|\bmust\b|\bshould\b/i.test(s);

/* ---------------- 1. what to surface after a change ---------------- */
export type Act = 'options' | 'keep' | 'undo' | 'fix';
export interface Voice { show: 'card' | 'marker'; line: string; actions: Act[]; rank: number }
const TRIAGE = `${VOICE}
The person just changed one object. You get the room and the open checks on that object. Decide how each check is presented.
show: "card" speaks up now and interrupts; "marker" is a quiet dot on the object the person can open later. Use a card when the finding blocks something physical (a door, a wardrobe, a window, power the object needs) or touches one of their top ranked priorities or main activities. Use a marker for a "sometimes" activity, a small side effect, or anything resting on an uncertain detection. If nothing is urgent, markers only is a good answer.
Order the items most important first: physical blockers, then their priorities by rank, then activities.
line: your wording of the finding, one sentence, in the app's voice. Do not mention the priority or activity behind it; the app adds that. For an uncertain detection begin with "If".
actions: what the person can do, most useful first. "options" shows other places for the object, "keep" accepts it as it is, "undo" reverts the change, "fix" corrects the scan when the finding may rest on a wrong detection. Always include "options", "keep" and "undo". Offer "fix" only for uncertain detections.`;
export const triage = async (id: string, objs: Obj[], fixed: Fixed[], prefs: Prefs, checks: Check[]): Promise<Record<string, Voice> | null> => {
  const mine = checks.filter((c) => c.obj === id);
  if (!mine.length) return {};
  const o = objs.find((x) => x.id === id)!;
  const schema = { type: 'object', required: ['items'], properties: { items: { type: 'array', minItems: mine.length, maxItems: mine.length, items: { type: 'object', required: ['id', 'show', 'line', 'actions'], properties: { id: { type: 'string', enum: mine.map((c) => c.key) }, show: { type: 'string', enum: ['card', 'marker'] }, line: { type: 'string' }, actions: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string', enum: ['options', 'keep', 'undo', 'fix'] } } } } } } };
  const r = await ask<{ items: { id: string; show: 'card' | 'marker'; line: string; actions: Act[] }[] }>('triage', TRIAGE, `${facts(objs, fixed, prefs, [])}\n\nJUST CHANGED: ${o.name} (${id}).\nOPEN CHECKS ON IT (id | object | kind | finding | measurement)\n${mine.map(checkRow).join('\n')}`, schema, { ms: 8000, predict: 90 + mine.length * 80 });
  if (!r?.items?.length) return null;
  const out: Record<string, Voice> = {};
  r.items.forEach((it, i) => {
    const c = mine.find((x) => x.key === it.id); if (!c || out[it.id]) return;
    const acts = [...new Set(it.actions)].filter((a) => a !== 'fix' || c.hedge || c.rule === 'plug'); for (const a of ['options', 'keep', 'undo'] as Act[]) if (!acts.includes(a)) acts.push(a);
    // Guard rails the model can't override: a physical blocker on a certain detection is never just a dot
    const show = c.kind === 'fact' && !c.hedge ? 'card' : it.show;
    out[it.id] = { show, line: okLine(it.line) ? it.line.trim() : c.text, actions: acts, rank: i };
  });
  return out;
};

/* ---------------- 2. which places to offer ---------------- */
const OPTIONS = `${VOICE}
The person asked where else an object could go. The app found every free spot and measured what each one costs. Choose the two or three spots that give the person the most different, most useful choices given what they told us. Never call one the best. Prefer spots with no findings, but keep a spot with a cost if it serves a top priority.
cost: one short sentence saying honestly what this spot gives up, or what it gains if it gives nothing up. If another object has to leave to make room, say so.
note: one short sentence over the list. If every chosen spot has a finding, say that each of these gives something up.`;
export const chooseOptions = async (id: string, objs: Obj[], fixed: Fixed[], prefs: Prefs): Promise<{ list: Option[]; note: string }> => {
  // Two spots: the one that costs least, and the best different one. The wording comes from the measurements (room.ts), so it is specific and short.
  const list = optionCandidates(id, objs, prefs, fixed).slice(0, 2).map((c, i) => ({ ...c, n: i + 1 }));
  return { list, note: '' };
};

/* ---------------- 3. what a message becomes ---------------- */
export const SPOTS: Record<string, [number, number, number, string]> = {
  under_window_2: [0.745, 1.18, Math.PI, 'under window 2, facing the light'], under_window_1: [-0.9, 1.2, Math.PI, 'under window 1, below the AC'],
  between_windows: [0, 1.35, Math.PI, 'between the two windows, by plug B'], door_corner: [1.25, -1.3, -Math.PI / 2, 'north-east corner, beside the door and plug A'],
  east_wall: [1.4, 0.2, -Math.PI / 2, 'middle of the east wall'], west_wall: [-1.3, -0.25, Math.PI / 2, 'west wall, between wardrobe and bed'], centre: [0.1, -0.1, 0, 'middle of the floor'],
};
const CHAT = `You route one message inside Layo, a room-layout app for one small bedroom. You never change the room yourself: you pick what the message becomes and the app does the rest. The app has measured the room; never invent geometry or consequences.
Fill the fields in order.
request: the person's wish in a few words.
outcome:
- "propose": they want the room changed. Fill "action".
- "suggest": they ask where something could go, want ideas, or want the best layout (there is no best; the app shows options). Set action.object, action.type "none".
- "explain": they ask why something is flagged, or a question about the room.
- "ask": the wish is unclear or names no object when one is needed. Give two or three short tap answers.
- "decline": something Layo cannot do.
action.type: "move" (object + spot), "turn_around" (half turn on the spot; spot "none"), "quarter_turn", "remove" (object leaves to Assets; spot "none"), "add" (an object listed under NOT IN THE ROOM; pick a spot), "restyle" (the whole room's colours from their references; object "none"), "finish" (one object's colour or material; needs finish), "note_rule" (they describe how they use the room), "none".
check: for "explain" about a flag, the id of the open check they mean, or "none" if that object has no open check.
text: used only for "explain" without a check, "ask" and "decline". One or two short plain sentences from the data. A number only if they asked for one. Otherwise leave it empty.
goto: "edit_object" when they want a size, shape or type changed; "room_edit" for walls, plugs, doors, windows; "add" for shopping or products; "room_check" for a list of what is open; "what_to_move" for the order to move real furniture; "save_layout"; "preferences"; else "none".

Examples (message -> fields):
"put the desk by the window" -> outcome propose, action move obj_study_table under_window_2
"move the fan next to the door" -> propose, move obj_pedestal_fan door_corner
"get rid of the fan" / "I don't need the hamper" -> propose, remove, spot none
"turn the bed around" / "flip the bed" -> propose, turn_around obj_bed, spot none
"make the room feel like my references" / "restyle it" / "make it cosier" with nothing selected -> propose, restyle, object none
"make it warmer" with the desk selected -> propose, finish obj_study_table Terracotta
"add a plant by the window" -> propose, add added_plant between_windows
"I take calls at my desk" / "I work late here" -> propose, note_rule, object none
"where could the bed go?" / "where else could it go?" / "what's the best layout?" -> suggest
"why is this flagged?" / "why this check?" -> explain, check = that object's open check id, or none
"how wide is my desk?" -> explain, check none, text with the number
"move it" / "make it better" with nothing selected -> ask
"order me a new chair" / "how much is this?" -> decline, goto add
"make the desk bigger" -> decline, goto edit_object
"move the plug" / "paint the walls" -> decline, goto room_edit
"what's the weather?" -> decline, goto none`;
const rotBy = (v: number[], a: number): [number, number] => [v[0] * Math.cos(a) + v[1] * Math.sin(a), -v[0] * Math.sin(a) + v[1] * Math.cos(a)];
/** Turns "move X to spot" into exact changes: wall snap, the linked partner, and small things that have to leave. */
export const planMove = (o: Obj, spot: string, objs: Obj[]): Change[] => {
  const [x, z, r] = SPOTS[spot]; const rot = o.flat ? 0 : r;
  let at = place(x, z, { dims: o.dims, rot });
  const others = objs.filter((q) => q.inRoom && q.id !== o.id && q.id !== o.link && !q.flat);
  const hits = (p: [number, number]) => { const a = rect({ dims: o.dims, rot, at: p }); return o.flat ? [] : others.filter((q) => { const b = rect(q); return a[0] < b[1] - 0.05 && a[1] > b[0] + 0.05 && a[2] < b[3] - 0.05 && a[3] > b[2] + 0.05; }); };
  let clash = hits(at); const changes: Change[] = [];
  if (clash.length && (clash.length > 2 || clash.some((q) => !q.small))) { at = settle({ ...o, at, rot, inRoom: true }, objs); clash = []; }
  changes.push({ id: o.id, at, rot, ...(o.inRoom ? {} : { add: true }) });
  const p = o.link ? objs.find((q) => q.id === o.link) : null;
  if (p?.inRoom && o.inRoom) { const off = rotBy([p.at[0] - o.at[0], p.at[1] - o.at[1]], rot - o.rot); changes.push({ id: p.id, at: place(at[0] + off[0], at[1] + off[1], { dims: p.dims, rot: p.rot + rot - o.rot }), rot: p.rot + rot - o.rot }); }
  clash.forEach((q) => changes.push({ id: q.id, remove: true }));
  return changes;
};
interface ChatOut { request: string; outcome: 'propose' | 'suggest' | 'explain' | 'ask' | 'decline'; action: { type: string; object: string; spot: string; finish: string }; check: string; text: string; answers: string[]; goto: string }
const names = (xs: string[]) => xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs[0] || '';
/** What a proposal would really do, from the rules: the code states consequences, never the model. */
export const consequence = (changes: Change[], objs: Obj[], prefs: Prefs, fixed: Fixed[]): string => {
  const next = objs.map((o) => { const c = changes.find((x) => x.id === o.id); return c ? { ...o, inRoom: c.remove ? false : c.add ? true : o.inRoom, at: c.at || o.at, rot: c.rot ?? o.rot } : o; });
  const before = new Set(runChecks(objs, prefs, fixed).map((c) => c.key)), after = runChecks(next, prefs, fixed);
  const fresh = after.filter((c) => !before.has(c.key) && changes.some((x) => x.id === c.obj)), gone = [...before].filter((k) => !after.some((c) => c.key === k));
  const out = changes.filter((c) => c.remove && changes[0].id !== c.id).map((c) => objs.find((o) => o.id === c.id)!.name.toLowerCase());
  return [out.length ? `The ${names(out)} would go to Assets to make room.` : '', fresh[0] ? `Then: ${fresh[0].text.charAt(0).toLowerCase() + fresh[0].text.slice(1)}${fresh.length > 1 ? ` (and ${fresh.length - 1} more)` : ''}` : '', gone.length ? `It would settle ${gone.length} open check${gone.length > 1 ? 's' : ''}.` : !fresh.length ? 'Nothing new comes up.' : ''].filter(Boolean).join(' ');
};
export const chat = async (text: string, ctx: string[], objs: Obj[], fixed: Fixed[], prefs: Prefs, checks: Check[], history: AiMsg[]): Promise<AiMsg> => {
  const scripted = () => reply(text, ctx, objs, checks, prefs);
  const ids = objs.map((o) => o.id);
  const schema = { type: 'object', required: ['request', 'outcome', 'action', 'check', 'text', 'answers', 'goto'], properties: {
    request: { type: 'string' }, outcome: { type: 'string', enum: ['propose', 'suggest', 'explain', 'ask', 'decline'] },
    action: { type: 'object', required: ['type', 'object', 'spot', 'finish'], properties: { type: { type: 'string', enum: ['move', 'turn_around', 'quarter_turn', 'remove', 'add', 'restyle', 'finish', 'note_rule', 'none'] }, object: { type: 'string', enum: [...ids, 'none'] }, spot: { type: 'string', enum: [...Object.keys(SPOTS), 'none'] }, finish: { type: 'string', enum: [...FINISHES, 'none'] } } },
    check: { type: 'string', enum: [...checks.map((c) => c.key), 'none'] }, text: { type: 'string' },
    answers: { type: 'array', maxItems: 3, items: { type: 'string' } }, goto: { type: 'string', enum: ['none', 'edit_object', 'room_edit', 'room_check', 'what_to_move', 'save_layout', 'add', 'preferences'] } } };
  const sel = ctx.length ? `SELECTED NOW: ${ctx.join(', ')}. "it", "this" and "these" mean the selection. Open checks on it: ${checks.filter((c) => ctx.includes(c.obj)).map((c) => c.key).join(', ') || 'none'}.` : 'NOTHING IS SELECTED. The message is about the whole room unless it names an object.';
  const user = `${facts(objs, fixed, prefs, checks)}\nNAMED SPOTS for a move or an add: ${Object.entries(SPOTS).map(([k, v]) => `${k} (${v[3]})`).join('; ')}.\n${sel}\n\nMESSAGE: ${text}`;
  const hist = history.slice(-4).map((m) => ({ role: m.me ? 'user' : 'assistant', content: m.me ? `MESSAGE: ${m.text}` : JSON.stringify({ text: m.text }) }));
  const r = await ask<ChatOut>('chat', CHAT, user, schema, { ms: brain.think ? 120000 : 14000, predict: brain.think ? 4000 : 240, history: hist, think: brain.think });
  if (!r?.outcome) return scripted();
  const t = r.action?.type;
  const o = objs.find((x) => x.id === (r.action?.object && r.action.object !== 'none' ? r.action.object : ctx[0]));
  const said = typeof r.text === 'string' ? r.text.trim().slice(0, 260) : '';
  const link = ({ edit_object: o ? { label: `Edit ${o.name.toLowerCase()}`, to: 'eo', id: o.id } : undefined, room_edit: { label: 'Open Room edit', to: 're' }, room_check: { label: 'Open Room Check', to: 'rc' }, what_to_move: { label: 'What to move', to: 'fn' }, save_layout: { label: 'Save layout', to: 'save' }, add: { label: 'Add from a link', to: 'add' }, preferences: { label: 'Open Preferences', to: 'prefs' } } as Record<string, AiMsg['link']>)[r.goto];
  const propose = (title: string, lead: string, changes: Change[]): AiMsg => ({ text: `${lead} ${consequence(changes, objs, prefs, fixed)}`.trim(), proposal: { title, changes } });
  if (t === 'note_rule') return { text: "Noted. I'll watch what can be seen from the door while you're at your desk.", rule: 'privacy' };
  if (r.outcome === 'propose') {
    if (t === 'restyle') return reply('restyle like my references', ctx.length > 1 ? ctx : [], objs, checks, prefs);
    if (!o) return scripted();
    const nm = o.name.toLowerCase(), spot = SPOTS[r.action.spot];
    if (t === 'move' && spot && o.inRoom) return propose(`${o.name}, ${spot[3].split(',')[0]}`, `The ${nm} would go ${spot[3].split(',')[0]}.`, planMove(o, r.action.spot, objs));
    if ((t === 'add' || t === 'move') && !o.inRoom) { const ch = spot ? planMove(o, r.action.spot, objs) : [{ id: o.id, add: true, at: settle({ ...o, at: place(o.at[0], o.at[1], o), inRoom: true }, objs), rot: o.rot }]; return propose(`Add the ${nm}`, `The ${nm} would come in${spot ? ' ' + spot[3].split(',')[0] : ''}.`, ch); }
    if (t === 'remove' && o.inRoom) return propose(`Remove the ${nm}`, `The ${nm} would go to Assets. You can bring it back.`, [{ id: o.id, remove: true }]);
    if ((t === 'turn_around' || t === 'quarter_turn') && o.inRoom) { const rot = o.rot + (t === 'turn_around' ? Math.PI : Math.PI / 2); return propose(`Turn the ${nm}`, `The ${nm} would turn ${t === 'turn_around' ? 'right round' : 'a quarter'} where it stands.`, [{ id: o.id, rot, at: place(o.at[0], o.at[1], { dims: o.dims, rot }) }]); }
    if (t === 'finish' && r.action.finish !== 'none') return { text: `${r.action.finish} for the ${nm}.`, proposal: { title: `${r.action.finish} ${nm}`, changes: [{ id: o.id, finish: r.action.finish }] } };
    return scripted();
  }
  if (r.outcome === 'suggest') return o ? { text: `A few places the ${o.name.toLowerCase()} could go, and what each costs.`, optionsFor: o.id } : { text: 'Which piece are you thinking about?', ask: ['Study desk', 'Bed', 'Pedestal fan'] };
  if (r.outcome === 'ask') { const a = (r.answers || []).filter((x) => typeof x === 'string' && x.length > 1 && x.length < 40).slice(0, 3); return a.length >= 2 && said ? { text: said, ask: a } : scripted(); }
  if (r.outcome === 'explain') {
    const why = /why|flag|check|wrong|problem/i.test(text);
    const c = why || !said ? checks.find((x) => x.key === r.check) || (why && o ? checks.find((x) => x.obj === o.id) : undefined) : undefined;
    if (c) return { text: `${c.text} ${c.why || "That's a fact of the room, not a preference."}`, link: link || { label: 'Open Room Check', to: 'rc' } };
    if (why) return { text: o ? `Nothing is open on the ${o.name.toLowerCase()} right now.` : 'Nothing is open right now.' };
    return said ? { text: said, link: r.goto === 'room_check' ? undefined : link } : scripted();
  }
  return said ? { text: said, link } : scripted();
};
