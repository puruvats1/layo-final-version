/* The editor and everything that opens from it (ED-*, AI-*, AS-*, EO-01, RC-*, SE-*, RE-*, LY-01, FN-*). */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Stage, type Ghost, type Pin, type Signal, type StageApi } from './Stage';
import {
  START, PREPARED, overlapOf, multiIntent, multiProposal, praise as praiseFor, wallSnap, wallRot, TYPES, FINISHES, FIXED, FIXED_TYPES, PRESETS, PLUGS, runChecks, signalFor, optionsFor, moveList, where, place, settle, sig, chipsFor, reply,
  type Obj, type Prefs, type Fixed, type Check, type Option, type Proposal, type AiMsg, type Dims,
} from './room';
import { AiCard, AiIcon, Marquee, Panel, AiTag, Dialog, Ic, Petal, PetMark, Primary, Sheet } from './ui';
import { ActivityPicker, PriorityPicker, RefPicker, WordsList } from './Setup';
import { brain, wake, triage, chooseOptions, chat, MODEL, type Voice } from './llm';

interface Snap { objs: Obj[]; committed: Obj[]; palette: string; cpal: string; kept: string[]; fixed: Fixed[] }
interface Layout { id: string; name: string; objs: Obj[]; palette: string; edited: boolean }
const PAIRS: Record<string, string> = { obj_study_table: 'obj_chair', obj_chair: 'obj_study_table' };
/** The short name shown in a menu tab: the last word (Study desk becomes Desk). Full names stay in the prompt bar. */
const short = (n: string) => { const w = n.trim().split(/\s+/), l = w[w.length - 1] || n; return l[0].toUpperCase() + l.slice(1); };
const ONE_ROW = 150; // the drawer's smallest height: one row of assets, names included
/** The short name on a marker: what it is, without where it is. */
const tag = (f: Fixed) => (f.user ? f.name : /plug/i.test(f.name) ? 'Plug' : /wardrobe/i.test(f.name) ? 'Wardrobe' : /\bAC\b/.test(f.name) ? 'AC' : /light/i.test(f.name) ? 'Light' : f.name);
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const ORIGIN = { room: 'From your room', added: 'Added', suggested: 'Suggested' } as const;
const SRC = { room: ['From your room', ''], page: ['From product page', ''], photo: ['Estimated from photo', 'est'], you: ['You edited', 'you'] } as const;
const PANO = import.meta.env.BASE_URL + 'assets/reference_room_panorama.jpg';

export const Editor: React.FC<{ prefs: Prefs; setPrefs: (p: Prefs) => void; setup: boolean; onExit: () => void; onLayouts: (n: number) => void }> = ({ prefs, setPrefs, setup, onExit, onLayouts }) => {
  const [hist, setHist] = useState<{ list: Snap[]; i: number }>(() => ({ list: [{ objs: clone(START), committed: clone(START), palette: 'warm_studio', cpal: 'warm_studio', kept: [], fixed: clone(FIXED) }], i: 0 }));
  const cur = hist.list[hist.i];
  const push = (next: Partial<Snap>) => setHist((h) => ({ list: [...h.list.slice(0, h.i + 1), { ...h.list[h.i], ...next }], i: h.i + 1 }));
  const [mode, setMode] = useState<'edit' | 'roomsetup' | 'roomedit'>(setup ? 'roomsetup' : 'edit');
  const [lifted, setLifted] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [, setLook] = useState(0); // re-checks what is in view while two things are selected
  const selRef = useRef<string[]>([]); selRef.current = selected;
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [rotateId, setRotateId] = useState<string | null>(null);
  const [ctx, setCtx] = useState<string[]>([]);
  const [card, setCard] = useState<{ obj: string; i: number; fresh: boolean } | null>(null);
  const [opts, setOpts] = useState<{ id: string; list: Option[]; pick: number; from: 'card' | 'ai'; loading?: boolean; note?: string } | null>(null);
  const [proposal, setProposal] = useState<{ p: Proposal; ticks: Record<string, boolean> } | null>(null);
  const [side, setSide] = useState<'ai' | 'assets'>('ai');
  const [tab, setTab] = useState<'all' | 'suggested' | 'added'>('all');
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  // The assets drawer keeps the height the user dragged it to
  const [drawerH, setDrawerH] = useState(() => { try { return Math.max(ONE_ROW, Number(localStorage.getItem('kith.drawerH')) || ONE_ROW); } catch { return ONE_ROW; } });
  const drag = useRef<{ y: number; h: number } | null>(null);
  const maxH = () => Math.round(window.innerHeight * 0.72);
  // Drag and drop from the drawer: hold a tile a moment (so scrolling the library never starts a drag), then carry it into the room
  const [dnd, setDnd] = useState<{ id: string; phase: 'drag' | 'draft' | 'drop' | 'back'; fx: number; fy: number } | null>(null);
  const dndRef = useRef(dnd); dndRef.current = dnd;
  const dndPos = useRef({ x: 0, y: 0 });
  const hold = useRef<{ id: string; x: number; y: number; fx: number; fy: number; t: number } | null>(null);
  const justDragged = useRef(false);
  const drawerEl = useRef<HTMLDivElement>(null);
  const dropRef = useRef<(id: string, at: [number, number], y?: number, rot?: number) => boolean>(() => true);
  // The tile turns into the object in the room as it leaves the drawer, without lifting the finger; back over the drawer, it turns back
  const draftRef = useRef<{ start: (id: string, pt: { at: [number, number]; y?: number }) => void; cancel: () => void; pointAt: (id: string, cx: number, cy: number) => { at: [number, number]; y?: number } | null }>({ start: () => {}, cancel: () => {}, pointAt: () => null });
  const press = useRef<{ x: number; y: number } | null>(null);
  const editT = useRef<number | undefined>(undefined);
  const openEdit = (id: string) => { clearTimeout(hold.current?.t); hold.current = null; setDnd(null); dndRef.current = null; justDragged.current = true; setTimeout(() => { justDragged.current = false; }, 500); setEoId(id); setSheet('eo'); };
  const startHold = (e: React.PointerEvent, o: Obj) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dndPos.current = { x: e.clientX, y: e.clientY }; press.current = { x: e.clientX, y: e.clientY };
    // Held still, it opens the object's edit panel; held a moment and then moved, it is carried into the room
    window.clearTimeout(editT.current); editT.current = window.setTimeout(() => { if (press.current) openEdit(o.id); }, 550);
    if (o.inRoom) return;
    const h = { id: o.id, x: e.clientX, y: e.clientY, fx: r.left + r.width / 2, fy: r.top + r.height / 2, t: 0 };
    h.t = window.setTimeout(() => { hold.current = null; try { navigator.vibrate?.(10); } catch { /* no haptics */ } setDnd({ id: h.id, phase: 'drag', fx: h.fx, fy: h.fy }); }, 220);
    hold.current = h;
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (press.current && Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 8) { window.clearTimeout(editT.current); press.current = null; }
      const h = hold.current;
      if (h && Math.hypot(e.clientX - h.x, e.clientY - h.y) > 8) { clearTimeout(h.t); hold.current = null; } // it is a scroll
      const d = dndRef.current;
      if (d && (d.phase === 'drag' || d.phase === 'draft')) {
        dndPos.current = { x: e.clientX, y: e.clientY };
        const r = drawerEl.current?.getBoundingClientRect(), inDrawer = !!r && e.clientY > r.top - 4;
        if (d.phase === 'drag' && !inDrawer) { const f = draftRef.current.pointAt(d.id, e.clientX, e.clientY); if (f) { const nd = { ...d, phase: 'draft' as const }; dndRef.current = nd; setDnd(nd); draftRef.current.start(d.id, f); } }
        else if (d.phase === 'draft') {
          if (inDrawer) { draftRef.current.cancel(); const nd = { ...d, phase: 'drag' as const }; dndRef.current = nd; setDnd(nd); }
          else api.current?.carryPoint(d.id, e.clientX, e.clientY);
        }
      }
    };
    const end = (e: PointerEvent) => {
      window.clearTimeout(editT.current); press.current = null;
      const h = hold.current; if (h) { clearTimeout(h.t); hold.current = null; }
      const d = dndRef.current;
      if (d?.phase === 'draft') { // let go in the room: it lands where it is, at the nearest free spot
        justDragged.current = true; setTimeout(() => { justDragged.current = false; }, 80);
        const at = e.type === 'pointerup' ? api.current?.liveAt(d.id) : null, liveY = api.current?.liveY(d.id); api.current?.carryPoint(null);
        const ok = at ? dropRef.current(d.id, at, liveY) : false;
        if (!ok) { draftRef.current.cancel(); setDnd({ ...d, phase: 'back' }); setTimeout(() => setDnd(null), 280); } else setDnd(null);
        return;
      }
      if (!d || d.phase !== 'drag') return;
      justDragged.current = true; setTimeout(() => { justDragged.current = false; }, 80);
      const r = drawerEl.current?.getBoundingClientRect();
      const floor = e.type === 'pointerup' && !(r && e.clientY > r.top) ? api.current?.floorAt(e.clientX, e.clientY) : null;
      if (floor) { const ok = dropRef.current(d.id, floor); setDnd({ ...d, phase: ok ? 'drop' : 'back' }); setTimeout(() => setDnd(null), ok ? 240 : 280); }
      else { setDnd({ ...d, phase: 'back' }); setTimeout(() => setDnd(null), 280); }
    };
    const block = (e: TouchEvent) => { const ph = dndRef.current?.phase; if ((ph === 'drag' || ph === 'draft') && e.cancelable) e.preventDefault(); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    window.addEventListener('touchmove', block, { passive: false });
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); window.removeEventListener('touchmove', block); };
  }, []);
  const [msgs, setMsgs] = useState<AiMsg[]>([]);
  const [input, setInput] = useState('');
  const [sheet, setSheet] = useState<string | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);
  const [eoId, setEoId] = useState<string | null>(null);
  const [fixId, setFixId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [toast, setToast] = useState<{ text: string; undo?: boolean; ms?: number } | null>(null);
  const [held, setHeld] = useState(false);
  const [placing, setPlacing] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [cleared, setCleared] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [nudge, setNudge] = useState<'clear' | 'save' | 'list' | 'prefs' | null>(null);
  const [nudged, setNudged] = useState<string[]>([]); // suggestions already shown or dismissed: each comes once
  const [signal, setSignal] = useState<Signal | null>(null);
  // The local model: what it decided per check, what it is working on, and whether it is there
  const [voice, setVoice] = useState<Record<string, Voice>>({});
  const [thinking, setThinking] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [brainOn, setBrainOn] = useState(brain.on);
  const [brainReady, setBrainReady] = useState(brain.ready);
  const [askOpen, setAskOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (askOpen) inputRef.current?.focus(); }, [askOpen]);
  // Tapping anywhere outside the bottom area collapses the prompt bar
  useEffect(() => {
    if (!askOpen) return;
    const h = (e: PointerEvent) => { if (!bottomRef.current?.contains(e.target as Node)) setAskOpen(false); };
    document.addEventListener('pointerdown', h); return () => document.removeEventListener('pointerdown', h);
  }, [askOpen]);
  const [mapping, setMapping] = useState(false);
  const [mapStep, setMapStep] = useState(0);
  const finishSetup = () => {
    if (mode !== 'roomsetup') return setMode('edit');
    setMapStep(0); setMapping(true);
    [900, 1800, 2700].forEach((t, i) => setTimeout(() => setMapStep(i + 1), t));
    setTimeout(() => { setMode('edit'); setMapping(false); }, 3500);
  };
  // A proposal for several things: which row is in focus (it follows what the view is turned towards)
  const [pfocus, setPfocus] = useState<string | null>(null);
  const [praiseNote, setPraiseNote] = useState<{ id: string; text: string } | null>(null); // a word on a spot with nothing against it
  const [removeRun, setRemoveRun] = useState(0); // things taken out one after another
  const rotBase = useRef<{ id: string; objs: Obj[] } | null>(null);
  const [rendering, setRendering] = useState(false); // Confirm was pressed: the boxes carry a sheen while they become furniture
  const [pLoading, setPLoading] = useState(false); // Layo is finding the spots: a short wait, shown as a sheen on the ghosts
  const propRef = useRef(proposal); propRef.current = proposal;
  const pfocusRef = useRef(pfocus); pfocusRef.current = pfocus;
  const lockUntil = useRef(0);
  // Markers in Room edit can be held and moved along the walls, floor and ceiling
  const [pinLive, setPinLive] = useState<{ id: string; pos: [number, number, number] } | null>(null);
  const pinHold = useRef<{ id: string; x: number; y: number; t: number } | null>(null);
  const pinDrag = useRef<string | null>(null);
  const pinLast = useRef<[number, number, number] | null>(null);
  const pinMoved = useRef(false);
  const holdPin = (e: React.PointerEvent, id: string) => {
    window.clearTimeout(pinHold.current?.t);
    pinHold.current = { id, x: e.clientX, y: e.clientY, t: window.setTimeout(() => { pinDrag.current = id; pinLast.current = null; try { navigator.vibrate?.(10); } catch { /* no haptics */ } setPinLive({ id, pos: fixedRef.current.find((f) => f.id === id)!.pos }); }, 350) };
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const h = pinHold.current;
      if (h && !pinDrag.current && Math.hypot(e.clientX - h.x, e.clientY - h.y) > 8) { window.clearTimeout(h.t); pinHold.current = null; }
      if (pinDrag.current) { const w = api.current?.wallAt(e.clientX, e.clientY); if (w) { pinLast.current = w; setPinLive({ id: pinDrag.current, pos: w }); } }
    };
    const end = () => {
      window.clearTimeout(pinHold.current?.t); pinHold.current = null;
      const id = pinDrag.current; if (!id) return;
      pinDrag.current = null; pinMoved.current = true; setTimeout(() => { pinMoved.current = false; }, 250);
      const pos = pinLast.current; setPinLive(null);
      if (pos) setHist((h) => ({ list: [...h.list.slice(0, h.i + 1), { ...h.list[h.i], fixed: h.list[h.i].fixed.map((f) => (f.id === id ? { ...f, pos } : f)) }], i: h.i + 1 }));
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); };
  }, []);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return setToast({ text: "Voice input isn't available in this browser.", ms: 2600 });
    if (listening) { recRef.current?.stop(); return; }
    const r = new SR(); r.lang = navigator.language || 'en-US'; r.interimResults = true; r.continuous = false;
    r.onresult = (e: any) => setInput(Array.from(e.results as ArrayLike<any>).map((x: any) => x[0].transcript).join(''));
    r.onerror = (e: any) => { setListening(false); if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setToast({ text: 'Allow the microphone to speak to Layo.', ms: 2600 }); };
    r.onend = () => setListening(false);
    recRef.current = r; setAskOpen(true); setListening(true);
    try { r.start(); } catch { setListening(false); }
  };
  const [gyro, setGyro] = useState(false);
  const toggleGyro = async () => {
    if (gyro) return setGyro(false);
    const D = (window as any).DeviceOrientationEvent;
    if (!D) return setToast({ text: 'No motion sensor on this device. Drag to look around.' });
    try { if (typeof D.requestPermission === 'function' && (await D.requestPermission()) !== 'granted') return setToast({ text: 'Motion access was not allowed. Drag to look around.' }); } catch { return setToast({ text: 'Motion access was not allowed. Drag to look around.' }); }
    setGyro(true); setToast({ text: 'Move your phone to look around.' });
  };
  const seq = useRef(0);
  useEffect(() => { wake().then(setBrainReady); }, []);
  const [layouts, setLayouts] = useState<Layout[]>([{ id: 'l1', name: 'Room as scanned', objs: clone(START), palette: 'warm_studio', edited: false }]);
  const [layoutId, setLayoutId] = useState('l1');
  const [saveName, setSaveName] = useState('');
  const pending = useRef<(() => void) | null>(null);
  const api = useRef<StageApi | null>(null);
  const layout = layouts.find((l) => l.id === layoutId)!;
  useEffect(() => onLayouts(layouts.length), [layouts.length]);
  // Room edit opens facing the thing Layo was least sure about
  useEffect(() => { if (mode === 'edit') return; const u = cur.fixed.find((f) => f.state === 'unsure'); const t = setTimeout(() => u && api.current?.lookAt(u.pos[0], u.pos[2]), 350); return () => clearTimeout(t); }, [mode]);
  useEffect(() => { if (!praiseNote) return; const t = setTimeout(() => setPraiseNote(null), 3800); return () => clearTimeout(t); }, [praiseNote]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), toast.ms ?? 4200); return () => clearTimeout(t); }, [toast]);

  const { objs, committed, fixed } = cur;
  const fixedRef = useRef(fixed); fixedRef.current = fixed;
  const find = (id: string | null) => objs.find((o) => o.id === id);
  // A linked partner that is in the room too: the two are one thing to tap, select and ask about
  const pairOf = (id: string | null) => { const o = find(id), p = o?.link ? find(o.link) : null; return o?.inRoom && p?.inRoom ? p : null; };
  const menuIds = menuFor && find(menuFor)?.inRoom ? [menuFor, ...(pairOf(menuFor) ? [pairOf(menuFor)!.id] : [])] : [];
  const com = (id: string) => committed.find((c) => c.id === id);
  const posDiff = (o: Obj) => { const c = com(o.id); return !c || !c.inRoom || c.at[0] !== o.at[0] || c.at[1] !== o.at[1] || c.rot !== o.rot || c.dims.join() !== o.dims.join(); };
  const changed = (o: Obj) => { const c = com(o.id); return !c ? o.inRoom : c.inRoom !== o.inRoom || (o.inRoom && (posDiff(o) || c.finish !== o.finish)); };
  const stagedIds = objs.filter(changed).map((o) => o.id);
  const boxIds = objs.filter((o) => o.inRoom && (lifted.includes(o.id) || o.id === rotateId || (!!rotateId && find(rotateId)?.link === o.id) || (changed(o) && posDiff(o)))).map((o) => o.id);
  const was: Ghost[] = []; // no previous-position markers
  const live = (list: Check[], os: Obj[] = objs) => list.filter((c) => { const k = `${c.key}@${sig(os.find((o) => o.id === c.obj)!)}`; return !cur.kept.includes(k) && !cleared.includes(k); });
  const checks = useMemo<Check[]>(() => live(runChecks(objs, prefs, fixed)).map((c, i) => {
    const v = voice[`${c.key}@${sig(objs.find((o) => o.id === c.obj)!)}`];
    return v ? { ...c, text: v.line, why: /you (chose|said|work|study|take|exercise|relax)/i.test(v.line) ? undefined : c.why, quiet: v.show === 'marker', acts: v.actions, rank: v.rank } : { ...c, rank: 50 + i };
  }).sort((a, b) => a.rank! - b.rank!), [objs, prefs, fixed, cur.kept, cleared, voice]);
  const checksOf = (id: string) => checks.filter((c) => c.obj === id);
  // Confirming only looks at what is being confirmed: checks on things already in the room were settled before
  const stagedChecks = checks.filter((c) => stagedIds.includes(c.obj));
  const cardList = card ? checksOf(card.obj) : [];
  const cardCheck = cardList[Math.min(card?.i ?? 0, cardList.length - 1)];
  const busy = !!(opts || proposal || rotateId);
  const activeCtx = proposal?.p.multi && pfocus ? [pfocus] : selected.length ? selected : menuIds.length ? menuIds : ctx;

  /* ---------- changes ---------- */
  const apply = (given: Record<string, Partial<Obj>>, extra: Partial<Snap> = {}) => {
    // Taking something out of the room ends its link, and its partner's
    if (!Object.values(given).some((m) => m.inRoom === false)) setRemoveRun(0);
    const map: Record<string, Partial<Obj>> = { ...given };
    for (const id of Object.keys(given)) if (given[id].inRoom === false) { const l = objs.find((x) => x.id === id)?.link; map[id] = { ...map[id], link: undefined }; if (l) map[l] = { ...(map[l] ?? {}), link: undefined }; }
    const next = objs.map((o) => (map[o.id] ? { ...o, ...map[o.id] } : o));
    // Only a change that leaves a staging box to look at waits for Confirm. Taking something out, or a new finish, leaves nothing staged and is committed at once.
    const settled = committed.map((c) => { const m = map[c.id], n = next.find((x) => x.id === c.id); return m && n ? { ...c, ...(m.inRoom === false ? { inRoom: false } : {}), ...(m.finish !== undefined ? { finish: n.finish, history: n.history } : {}) } : c; });
    push({ objs: next, committed: settled, ...extra }); markEdited(); return next;
  };
  const rotPushed = useRef(false);
  const applyRot = (id: string, rot: number) => {
    // A linked pair turns together, about the middle between them
    const base = rotBase.current?.id === id ? rotBase.current.objs : objs, o0 = base.find((x) => x.id === id)!, pl = o0.link ? base.find((x) => x.id === o0.link) : null, part = pl?.inRoom && o0.inRoom ? pl : null;
    const delta = rot - o0.rot, cs = Math.cos(delta), sn = Math.sin(delta);
    const spin = (x: Obj, cx: number, cz: number): [number, number] => { const dx = x.at[0] - cx, dz = x.at[1] - cz; return [cx + dx * cs + dz * sn, cz - dx * sn + dz * cs]; };
    const mx = part ? (o0.at[0] + part.at[0]) / 2 : 0, mz = part ? (o0.at[1] + part.at[1]) / 2 : 0;
    const next = objs.map((o) => {
      if (o.id === id) return part ? { ...o, rot, at: place(...spin(o0, mx, mz), { dims: o.dims, rot }) } : { ...o, rot, at: place(o.at[0], o.at[1], { dims: o.dims, rot }) };
      if (part && o.id === part.id) return { ...o, rot: part.rot + delta, at: place(...spin(part, mx, mz), { dims: o.dims, rot: part.rot + delta }) };
      return o;
    });
    if (rotPushed.current) setHist((h) => ({ ...h, list: h.list.map((sn, i) => (i === h.i ? { ...sn, objs: next } : sn)) }));
    else { push({ objs: next }); markEdited(); rotPushed.current = true; }
  };
  const cancelRot = () => { if (rotPushed.current) setHist((h) => ({ list: h.list.slice(0, h.i), i: Math.max(0, h.i - 1) })); rotPushed.current = false; rotBase.current = null; setRotateId(null); };
  const markEdited = () => setLayouts((ls) => ls.map((l) => (l.id === layoutId ? { ...l, edited: true } : l)));
  // After a change: the rules find the checks, then the model decides card or marker, the order, the wording and the actions.
  // Until it answers the object carries a turning petal. If it is off, late or wrong, the scripted levels apply.
  const speak = (id: string, next: Obj[]) => {
    const mine = live(runChecks(next, prefs, fixed), next).filter((c) => c.obj === id);
    const scripted = () => setCard(mine.some((c) => !c.quiet) ? { obj: id, i: 0, fresh: true } : null);
    const token = ++seq.current; setThinking(null);
    if (!mine.length) return setCard(null);
    if (!brain.on || !brain.ready) return scripted();
    setCard(null); setThinking(id);
    triage(id, next, fixed, prefs, mine).then((v) => {
      if (token !== seq.current) return;
      setThinking(null);
      if (!v) return scripted();
      const k = sig(next.find((o) => o.id === id)!);
      setVoice((old) => ({ ...old, ...Object.fromEntries(Object.entries(v).map(([key, val]) => [`${key}@${k}`, val])) }));
      setCard(Object.values(v).some((x) => x.show === 'card') ? { obj: id, i: 0, fresh: true } : null);
    });
  };
  // A linked partner keeps its place relative to the one being moved; both are held inside the room
  const moveWithPartner = (id: string, at: [number, number], rot?: number): Record<string, Partial<Obj>> => {
    const o = find(id)!, map: Record<string, Partial<Obj>> = { [id]: { at, inRoom: true, ...(rot !== undefined ? { rot } : {}) } };
    const p = o.link ? find(o.link) : null;
    if (p?.inRoom && o.inRoom) {
      let d: [number, number] = [at[0] - o.at[0], at[1] - o.at[1]], pt = p.at;
      for (let i = 0; i < 3; i++) {
        pt = place(p.at[0] + d[0], p.at[1] + d[1], p); d = [pt[0] - p.at[0], pt[1] - p.at[1]];
        const a = place(o.at[0] + d[0], o.at[1] + d[1], { dims: o.dims, rot: rot ?? o.rot }); d = [a[0] - o.at[0], a[1] - o.at[1]];
      }
      map[id].at = place(o.at[0] + d[0], o.at[1] + d[1], { dims: o.dims, rot: rot ?? o.rot }); map[p.id] = { at: pt };
    }
    return map;
  };
  // Dropped on an overlap, it goes to the nearest free spot around where it was let go (a linked partner keeps its place beside it)
  const findSpot = (id: string, at: [number, number]): [number, number] | null => {
    const o = find(id)!;
    for (let r = 0; r <= 1.5; r += 0.05) {
      const n = r === 0 ? 1 : 16;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2, cand = place(at[0] + r * Math.cos(a), at[1] + r * Math.sin(a), o);
        const map = moveWithPartner(id, cand), trial = objs.map((x) => (map[x.id] ? ({ ...x, ...map[x.id] } as Obj) : x));
        if (Object.keys(map).every((q) => !overlapOf(trial.find((x) => x.id === q)!, trial))) return cand;
      }
    }
    return null;
  };
  const onDrop = (id: string, at: [number, number], y?: number, turned?: number): boolean => {
    const o0 = find(id)!, o = turned !== undefined && !o0.wall ? { ...o0, rot: turned } : o0, dropped = o.wall ? wallSnap(at, o.dims) : place(at[0], at[1], o), spot = o.wall ? dropped : findSpot(id, dropped);
    setLifted([]); setPlacing(null); setSignal(null);
    if (!spot) { setToast({ text: `There is no free spot near there for the ${o.name.toLowerCase()}.` }); return false; }
    const dropMap = moveWithPartner(id, spot, o.wall ? wallRot(spot) : turned !== undefined && Math.abs(turned - o0.rot) > 1e-4 ? turned : undefined); if (o.wall && y !== undefined) dropMap[id] = { ...dropMap[id], y };
    const next = apply(dropMap);
    if (Math.hypot(spot[0] - dropped[0], spot[1] - dropped[1]) > 0.02) { const bl = overlapOf({ ...o, at: dropped, inRoom: true }, objs); setToast({ text: bl ? `Moved clear of the ${short(bl.name).toLowerCase()}` : 'Moved clear', ms: 1800 }); }
    setMenuFor(id); speak(id, next); return true;
  };
  dropRef.current = onDrop;
  draftRef.current = {
    pointAt: (id, cx, cy) => { if (find(id)?.wall) { const w = api.current?.wallAt(cx, cy); return w ? { at: [w[0], w[2]], y: w[1] } : null; } const f = api.current?.floorAt(cx, cy); return f ? { at: f } : null; },
    start: (id, pt) => { const o = find(id); if (!o) return; const at = o.wall ? wallSnap(pt.at, o.dims) : place(pt.at[0], pt.at[1], o); apply({ [id]: { inRoom: true, at, ...(o.wall ? { rot: wallRot(at), y: Math.max(o.dims[1] / 2 + 0.4, Math.min(2.3 - o.dims[1] / 2, pt.y ?? 1.45)) } : {}) } }); setLifted([id]); setHeld(true); setMenuFor(null); setCard(null); },
    cancel: () => { api.current?.carryPoint(null); setHist((h) => ({ list: h.list.slice(0, h.i), i: Math.max(0, h.i - 1) })); setLifted([]); setSignal(null); },
  };
  const remove = (ids: string[]) => { apply(Object.fromEntries(ids.map((id) => [id, { inRoom: false }]))); setRemoveRun((r) => r + 1); setMenuFor(null); setSelected([]); setCard(null); setToast({ text: ids.length > 1 ? `${ids.length} things moved to Assets` : `${find(ids[0])?.name} moved to Assets`, undo: true }); };
  // Where something new goes: in front of the view; a poster, on the wall in front of it, at a good height
  const newSpot = (o: Obj): Partial<Obj> => {
    const c = api.current?.centre() ?? [0, 0];
    if (o.wall) { const w = api.current?.wallAt(window.innerWidth / 2, window.innerHeight * 0.38) ?? [c[0] * 2, 1.45, c[1] * 2], at = wallSnap([w[0], w[2]], o.dims); return { at, rot: wallRot(at), y: Math.round(Math.max(0.9, Math.min(1.9, w[1])) * 100) / 100 }; }
    return { at: settle({ ...o, at: place(c[0], c[1], o) }, objs) };
  };
  const bringIn = (id: string) => {
    const o = find(id)!;
    apply({ [id]: { inRoom: true, ...newSpot(o) } });
    setPlacing(id); setSheet(null); setSide('ai'); setMenuFor(null);
  };
  const undo = () => { if (hist.i > 0) { setHist((h) => ({ ...h, i: h.i - 1 })); reset(); } };
  const redo = () => { if (hist.i < hist.list.length - 1) { setHist((h) => ({ ...h, i: h.i + 1 })); reset(); } };
  // Undo on a card opened later: put that object (and its linked partner) back to how it was last confirmed (DEC-073)
  const undoObject = (id: string) => { const back = (x: string) => { const c = com(x); return c ? { at: c.at, rot: c.rot, dims: c.dims, finish: c.finish, inRoom: c.inRoom } : { inRoom: false }; }; const o = find(id)!; apply({ [id]: back(id), ...(o.link ? { [o.link]: back(o.link) } : {}) }); setCard(null); };
  const reset = () => { seq.current++; setThinking(null); setCard(null); setMenuFor(null); setSelected([]); setLifted([]); setOpts(null); setProposal(null); setRotateId(null); setPlacing(null); };
  const confirm = () => {
    const done = objs.map((o) => ({ ...o, isNew: false }));
    push({ objs: done, committed: clone(done), cpal: cur.palette });
    setLayouts((ls) => ls.map((l) => (l.id === layoutId ? { ...l, objs: clone(done), palette: cur.palette } : l)));
    setSheet(null); setDialog(null); reset(); setConfirmed(true); setToast({ text: 'Done. Your room is updated.' });
    const p = pending.current; pending.current = null; p?.();
  };
  const confirmWithRender = () => {
    if (rendering) return;
    setRendering(true); setSheet(null); setDialog(null);
    setTimeout(() => { confirm(); setRendering(false); }, 1500);
  };
  const discard = () => { push({ objs: clone(committed), palette: cur.cpal }); setSheet(null); setDialog(null); reset(); const p = pending.current; pending.current = null; p?.(); };
  const guard = (fn: () => void, kind: string) => { if (stagedIds.length) { pending.current = fn; setDialog(kind); } else fn(); };
  const openLayout = (l: Layout) => { setHist({ list: [{ ...cur, objs: clone(l.objs), committed: clone(l.objs), palette: l.palette, cpal: l.palette }], i: 0 }); setLayoutId(l.id); reset(); setConfirmed(false); setSheet(null); };
  const addLayout = (name: string, from: Obj[], palette: string, open = true) => { const l = { id: 'l' + Date.now(), name, objs: clone(from), palette, edited: from !== START }; setLayouts((ls) => [...ls, l]); if (open) openLayout(l); return l; };
  const keep = (c: Check) => push({ kept: [...cur.kept, `${c.key}@${sig(find(c.obj)!)}`] });
  const openOptions = (id: string, from: 'card' | 'ai') => {
    // The rules find every free spot and what each costs; the model picks which two or three to show and words the cost
    setOpts({ id, list: [], pick: 0, from, loading: true }); if (from !== 'card') setCard(null);
    Promise.all([chooseOptions(id, objs, fixed, prefs), new Promise((r) => setTimeout(r, 1200))]).then(([{ list, note }]) => { setOpts((o) => (o && o.id === id && o.loading ? { ...o, list, note, loading: false } : o)); if (list[0]) api.current?.lookAt(list[0].at[0], list[0].at[1]); });
  };
  const go = (to: string, id?: string) => {
    setSheet(null);
    if (to === 'eo' && id) { setEoId(id); setSheet('eo'); } else if (to === 're') setMode('roomedit'); else if (to === 'save') setDialog('save'); else if (to === 'add') setSheet('addsrc'); else setSheet(to);
  };

  /* ---------- the AI ---------- */
  const send = async (text: string) => {
    if (aiBusy) return;
    if (!text.trim()) return;
    const named = objs.find((o) => o.name === text); const c = named ? [named.id] : activeCtx; if (named) setCtx(c);
    setMsgs((m) => [...m, { me: true, text }]); setInput(''); setAiBusy(true);
    // The model decides what the message becomes; the scripted router is the fallback
    const mp = named ? null : (() => { const ids = multiIntent(text, objs); return ids ? multiProposal(ids, objs, prefs, fixed) : null; })();
    if (mp) await new Promise((res) => setTimeout(res, 1300)); // Layo is working it out: always a moment, so the wait is visible
    const r: AiMsg = mp ? { text: mp.text, proposal: mp.proposal } : named ? reply('where else could it go', c, objs, checks, prefs) : brain.on && brain.ready ? await chat(text, c, objs, fixed, prefs, checks, msgs) : reply(text, c, objs, checks, prefs);
    setAiBusy(false); setMsgs((m) => [...m, r]); setAskOpen(false);
    if (!r.proposal && !r.optionsFor) setSheet('ai'); // a plain answer is read in the conversation
    if (r.rule === 'privacy' && !prefs.words.includes('privacy')) setPrefs({ ...prefs, words: [...prefs.words, 'privacy'] });
    if (r.rule === 'keep') { const ch = checksOf(c[0])[0]; if (ch) keep(ch); }
    if (r.proposal) {
      const cur = propRef.current, np = r.proposal;
      // A follow-up about one of several proposed spots changes that spot and leaves the rest
      const merge = !!cur?.p.multi && !np.multi && np.changes.every((c) => cur.p.changes.some((x) => x.id === c.id));
      setProposal(merge ? { p: { ...cur!.p, changes: cur!.p.changes.map((x) => { const n = np.changes.find((c) => c.id === x.id); return n ? { ...x, ...n } : x; }) }, ticks: cur!.ticks } : { p: np, ticks: Object.fromEntries(np.changes.map((x) => [x.id, true])) });
      if (np.multi) { setPLoading(true); setTimeout(() => setPLoading(false), 1700); setPfocus(np.changes[0]?.id ?? null); lockUntil.current = Date.now() + 300; } setSheet(null); setCard(null); setMenuFor(null); const first = r.proposal.changes.find((x) => x.at); const f = first?.at || find(r.proposal.changes[0].id)?.at; if (f) { if (r.proposal.multi && first) lookAtSpot(first.id, f); else api.current?.lookAt(f[0], f[1]); } }
    if (r.optionsFor) { openOptions(r.optionsFor, 'ai'); setSheet(null); setMenuFor(null); }
  };
  // Turn to a proposed spot and tilt so it sits in the upper part of the screen, above the card
  const lookAtSpot = (id: string, at: [number, number]) => { const h = find(id)?.dims[1] ?? 0.5, el = (Math.atan2(1.35 - h / 2, Math.hypot(at[0], at[1])) * 180) / Math.PI; api.current?.lookAt(at[0], at[1], Math.max(-68, -el - 16)); };
  const focusRow = (id: string) => {
    const ch = propRef.current?.p.changes.find((x) => x.id === id); setPfocus(id); lockUntil.current = Date.now() + 300;
    if (ch?.at) lookAtSpot(id, ch.at);
  };
  // Let go on an overlap, a proposed spot goes to the nearest free spot (against the room and the other proposed spots)
  const ghostSpot = (id: string, at: [number, number]): [number, number] => {
    const pr = propRef.current, ch = pr?.p.changes.find((c) => c.id === id), o = find(id); if (!pr || !ch || !o) return at;
    const rot = ch.rot ?? o.rot;
    const world = (spot: [number, number]) => objs.map((x) => { const c = pr.p.changes.find((q) => q.id === x.id && q.at && pr.ticks[q.id]); return x.id === id ? { ...x, at: spot, rot, inRoom: true } : c ? { ...x, at: c.at!, rot: c.rot ?? x.rot, inRoom: true } : x; });
    for (let r = 0; r <= 1.5; r += 0.05) {
      const n = r === 0 ? 1 : 16;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2, cand = place(at[0] + r * Math.cos(a), at[1] + r * Math.sin(a), { dims: o.dims, rot }), w = world(cand);
        if (!overlapOf(w.find((x) => x.id === id)!, w)) return cand;
      }
    }
    return at;
  };
  const onAim = (lon: number) => {
    const pr = propRef.current; if (!pr?.p.multi || Date.now() < lockUntil.current || api.current?.moving()) return; // not while the view is gliding to a row
    let best: string | null = null, bd = 181;
    for (const ch of pr.p.changes) { if (!ch.at || !pr.ticks[ch.id]) continue; const d = Math.abs(((lon - (Math.atan2(ch.at[1], ch.at[0]) * 180) / Math.PI + 540) % 360) - 180); if (d < bd) { bd = d; best = ch.id; } }
    if (best && best !== pfocusRef.current) { pfocusRef.current = best; setPfocus(best); }
  };
  // Applying a proposal or an option is the person choosing it, trade-offs and all: what it listed is not raised again
  const acceptChecks = (next: Obj[], ids: string[]) => {
    const keys = runChecks(next, prefs, fixed).filter((c) => ids.includes(c.obj)).map((c) => `${c.key}@${sig(next.find((o) => o.id === c.obj)!)}`);
    if (keys.length) setHist((h) => ({ ...h, list: h.list.map((sn, i) => (i === h.i ? { ...sn, kept: [...new Set([...sn.kept, ...keys])] } : sn)) }));
  };
  const applyProposal = () => {
    if (!proposal) return; const { p, ticks } = proposal; const map: Record<string, Partial<Obj>> = {};
    for (const ch of p.changes) {
      if (!ticks[ch.id]) continue; const o = find(ch.id)!; const n: Partial<Obj> = {};
      if (ch.remove) n.inRoom = false; if (ch.add) n.inRoom = true; if (ch.at) n.at = ch.at; if (ch.rot !== undefined) n.rot = ch.rot;
      if (ch.finish) { n.history = [o.finish, ...o.history]; n.finish = ch.finish; }
      map[ch.id] = n;
    }
    const any = Object.keys(map).length > 0;
    const next = apply(map, p.palette && any ? { palette: p.palette } : {});
    setProposal(null); acceptChecks(next, Object.keys(map));
    setToast({ text: any ? 'Applied. Confirm when you are happy.' : 'Nothing changed.' });
  };
  const applyOption = () => {
    if (!opts) return; const op = opts.list[opts.pick]; if (!op) return;
    const map = moveWithPartner(opts.id, op.at, op.rot); if (op.also) map[op.also] = { inRoom: false };
    const next = apply(map); setOpts(null); acceptChecks(next, [opts.id]);
  };

  /* ---------- pins ---------- */
  // Several things selected: one bar over the group (how many, Remove, Link or Unlink, close)
  const selBar = (() => {
    if (selected.length < 2) return null;
    const [sa, sb] = selected.map((id) => find(id)), pair = selected.length === 2 && sa && sb;
    const linked = !!pair && sa.link === sb.id && sb.link === sa.id;
    const together = !!pair && (linked || !!api.current?.inView([[sa.at[0], sa.dims[1] / 2, sa.at[1]], [sb.at[0], sb.dims[1] / 2, sb.at[1]]])); // objects out of one view are not offered a link
    const link = () => {
      if (!pair) return;
      const patch: Record<string, Partial<Obj>> = { [sa.id]: { link: linked ? undefined : sb.id }, [sb.id]: { link: linked ? undefined : sa.id } };
      if (!linked) for (const x of [sa, sb]) if (x.link && x.link !== sa.id && x.link !== sb.id) patch[x.link] = { link: undefined }; // a thing has one partner
      apply(patch); setSelected([]); setMenuFor(null); setToast({ text: linked ? 'Unlinked. They move on their own now.' : `Linked. The ${sa.name.toLowerCase()} and the ${sb.name.toLowerCase()} move together now.` });
    };
    return <div className="glass pop rowx g2" role="group" aria-label={`${selected.length} selected`} style={{ padding: '4px 4px 4px 6px' }}>
      <span className="selcount" title={`${selected.length} selected`}>{selected.length}</span>
      <button className="chip chip-sm" onClick={() => remove(selected)}><Ic n="minus" s="sm" />Remove</button>
      {pair && together ? <button className="chip chip-sm" onClick={link}><Ic n={linked ? 'unlink' : 'link'} s="sm" />{linked ? 'Unlink' : 'Link'}</button> : null}
      <button className="btn-icon" onClick={() => setSelected([])} aria-label="Clear selection"><Ic n="close" s="sm" /></button>
    </div>;
  })();
  const pins: Pin[] = [];
  const ghosts: Ghost[] = [];
  if (mode !== 'edit') {
    for (const f of fixed) {
      if (f.state === 'gone') continue;
      if (mode === 'roomsetup' && !f.unsure && !['door', 'win2', 'wardrobe', 'plugA'].includes(f.id) && !f.user) continue;
      pins.push({ id: 'fx' + f.id, pos: pinLive?.id === f.id ? pinLive.pos : f.pos, shift: 'translate(-50%, -50%)', node: (
        <button className="glass rowx g2" onPointerDown={(e) => holdPin(e, f.id)} onClick={() => { if (pinMoved.current) return; setFixId(f.id); setSheet('fix'); }} style={{ border: 0, height: 40, padding: '0 14px 0 8px', cursor: pinLive?.id === f.id ? 'grabbing' : 'pointer', touchAction: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', background: f.state === 'unsure' ? 'var(--butter-100)' : undefined, transform: pinLive?.id === f.id ? 'scale(1.08)' : undefined, transition: 'transform .15s' }}>
          <Petal size={18} strong={f.state === 'unsure'} />{f.state === 'unsure' ? f.unsure : f.label || tag(f)}
        </button>) });
    }
    if (mode === 'roomedit') for (const o of objs) if (o.inRoom) pins.push({ id: 'ob' + o.id, follow: o.id, node: (
      <button className="glass rowx g2" onClick={() => { setFixId(o.id); setSheet('fix'); }} style={{ border: 0, height: 36, padding: '0 12px 0 8px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{o.origin === 'added' ? null : <Petal size={16} />}{o.name}</button>) });
  } else if (!preview) {
    if (proposal) {
      for (const ch of proposal.p.changes) {
        const o = find(ch.id)!;
        if (ch.at && proposal.ticks[ch.id]) ghosts.push({ id: ch.id, dims: o.dims, at: ch.at, rot: ch.rot ?? o.rot, kind: o.kind, focus: !!proposal.p.multi && pfocus === ch.id, loading: !!proposal.p.multi && pLoading });
        if (proposal.p.multi && !pLoading && ch.at && proposal.ticks[ch.id]) pins.push({ id: 'pn' + ch.id, pos: [ch.at[0], Math.min(o.dims[1], 1) + 0.15, ch.at[1]], node: <button className={`ghostnum ${pfocus === ch.id ? 'is-on' : ''}`} aria-label={`${o.name}, proposed spot`} onClick={() => focusRow(ch.id)}>{proposal.p.changes.indexOf(ch) + 1}</button> });
        if (proposal.p.restyle) pins.push({ id: 'tk' + ch.id, follow: ch.id, node: <button className={`tick ${proposal.ticks[ch.id] ? '' : 'off'}`} aria-label={`${o.name}: ${proposal.ticks[ch.id] ? 'included' : 'left as it is'}`} onClick={() => setProposal({ ...proposal, ticks: { ...proposal.ticks, [ch.id]: !proposal.ticks[ch.id] } })}><Ic n="check" s="sm" /></button> });
      }
    } else if (opts) {
      const o = find(opts.id)!;
      opts.list.forEach((op, i) => { if (i === opts.pick) ghosts.push({ id: 'op' + op.n, dims: o.dims, at: op.at, rot: op.rot, kind: o.kind }); pins.push({ id: 'on' + op.n, pos: [op.at[0], Math.min(o.dims[1], 1) + 0.15, op.at[1]], node: <button className={`ghostnum ${i === opts.pick ? 'is-on' : ''}`} onClick={() => setOpts({ ...opts, pick: i })}>{op.n}</button> }); });
    } else {
      for (const o of objs) {
        const pp0 = pairOf(o.id), second = !!pp0 && objs.indexOf(pp0) < objs.indexOf(o); // a linked pair shares one marker, on the first of the two
        const cs = o.inRoom && !second ? [...checksOf(o.id), ...(pp0 ? checksOf(pp0.id) : [])] : [];
        if (thinking === o.id) pins.push({ id: 'th' + o.id, follow: o.id, node: <span className="mk" role="status" aria-label="Layo is checking"><Petal size={30} style={{ animation: 'sweep 1.4s linear infinite' }} /></span> });
        else if (cs.length && !rotateId && !lifted.includes(o.id) && !menuIds.includes(o.id) && !cs.some((c) => c.obj === card?.obj)) pins.push({ id: 'mk' + o.id, follow: o.id, with: pp0?.id, node: <button className="mk" aria-label={`${cs.length} check${cs.length > 1 ? 's' : ''} on ${pp0 ? o.name + ' and ' + pp0.name : o.name}`} onClick={() => { setCard({ obj: cs[0].obj, i: checksOf(cs[0].obj).indexOf(cs[0]), fresh: false }); setMenuFor(null); }}><PetMark n={cs.length} fact={cs.some((c) => c.kind === 'fact')} /></button> });
      }
      if (selBar) pins.push({ id: 'selbar', follow: selected[0], with: selected[1], clamp: true, node: selBar });
      // The tap menu floats on the object it belongs to: its name, then one row of icons
      const mo = find(menuFor);
      if (mo?.inRoom && !rotateId && selected.length < 2) {
        const pp = pairOf(mo.id), pair = PAIRS[mo.id];
        const [na, nb] = pp && objs.indexOf(pp) < objs.indexOf(mo) ? [pp, mo] : [mo, pp];
        const cs = [mo, ...(pp ? [pp] : [])].flatMap((g) => checksOf(g.id)), n = cs.length;
        const unlink = () => { apply({ [mo.id]: { link: undefined }, [mo.link!]: { link: undefined } }); setToast({ text: 'Unlinked. They move on their own now.' }); };
        pins.push({ id: 'nm', follow: na.id, with: pp ? nb!.id : undefined, clamp: true, node: (
          <div className="omenwrap pop">
            {/* Linked objects share one menu: both names, the link between them unlinks */}
            <div className="omenu-name">{pp ? <><Marquee>{short(na.name)}</Marquee><span className="omenu-link" aria-hidden="true"><Ic n="link" s="sm" /></span><Marquee>{short(nb!.name)}</Marquee></> : <>{mo.origin !== 'added' ? <Petal size={11} strong /> : null}<Marquee>{short(mo.name)}</Marquee></>}</div>
            <div className="glass bar omenu" role="menu" aria-label={pp ? `${mo.name} and ${pp.name}` : mo.name}>
            {/* The check marker flies into the menu: it is the way to the checks. Asking Layo happens in the prompt bar, which already holds the selection */}
            <button className="btn-icon mkfly" role="menuitem" aria-label={n ? `${n} check${n > 1 ? 's' : ''}` : 'Layo'} title={n ? 'Checks' : 'Layo'} onClick={() => { if (n) { const first = cs[0]; setCard({ obj: first.obj, i: checksOf(first.obj).indexOf(first), fresh: false }); } else setPraiseNote({ id: mo.id, text: praiseFor(mo, objs, prefs) }); }}><PetMark n={n > 1 ? n : undefined} size={28} /></button>
            {pp ? null : <button className="btn-icon" role="menuitem" aria-label="Edit" title="Edit" onClick={() => { setEoId(mo.id); setSheet('eo'); }}><Ic n="edit" /></button>}
            {mo.wall ? null : <button className={`btn-icon ${rotateId === mo.id ? 'is-on' : ''}`} role="menuitem" aria-pressed={rotateId === mo.id} aria-label={rotateId === mo.id ? 'Done rotating' : 'Rotate'} title="Rotate" onClick={() => { if (rotateId === mo.id) { setRotateId(null); speak(mo.id, objs); } else { rotPushed.current = false; rotBase.current = { id: mo.id, objs }; setRotateId(mo.id); setHeld(true); } }}><Ic n={rotateId === mo.id ? 'check' : 'rotate'} /></button>}
            <button className="btn-icon" role="menuitem" aria-label={pp ? `Remove ${mo.name} and ${pp.name}` : 'Remove'} title="Remove" onClick={() => remove(pp ? [mo.id, pp.id] : [mo.id])}><Ic n="minus" /></button>
            {pp ? <button className="btn-icon" role="menuitem" aria-label={`Unlink ${mo.name} and ${pp.name}`} title="Unlink" onClick={unlink}><Ic n="unlink" /></button>
              : null}
          </div></div>) });
      }
      if (rotateId && find(rotateId)?.inRoom) pins.push({ id: 'rt', follow: rotateId, clamp: true, node: (
        <div className="glass bar rotact pop">
          <button className="btn-icon" aria-label="Cancel turning" onClick={cancelRot}><Ic n="close" /></button>
          <button className="btn-icon rotok" aria-label="Confirm turning" onClick={() => { const id = rotateId; rotPushed.current = false; rotBase.current = null; setRotateId(null); speak(id, objs); }}><Ic n="check" /></button>
        </div>) });
      if (signal && lifted[0]) pins.push({ id: 'sg', follow: lifted[0], fit: true, node: <SigPin text={signal.text + (signal.zone && signal.hot ? ', in the way' : '')} /> });
      if (placing && find(placing)?.inRoom && !lifted.length) pins.push({ id: 'pl', follow: placing, node: <span className="glass hint"><span><Ic n="hand" s="sm" /></span>Hold and drag to place</span> });
      if (!layout.edited && hist.i === 0 && !held && !menuFor && !selected.length && !card && !placing && find('obj_study_table')?.inRoom) pins.push({ id: 'hint', follow: 'obj_study_table', shift: 'translate(-24px, -100%)', node: <span className="glass hint"><span><Ic n="hand" s="sm" /></span>Hold to pick it up</span> });
    }
  }

  /* ---------- canvas gestures ---------- */
  const onTap = (id: string | null) => {
    if (proposal?.p.multi) { if (id && proposal.p.changes.some((c) => c.id === id)) focusRow(id); return; }
    if (busy) return;
    if (!id) { setMenuFor(null); setSelected([]); setCard(null); setCtx([]); return; }
    if (selected.length) { setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]); return; }
    setCard(null); setMenuFor(id);
  };
  const onHold = (id: string) => { const o = find(id)!; seq.current++; setThinking(null); setHeld(true); setMenuFor(id); setCard(null); setSelected([]); setLifted(o.link && find(o.link)?.inRoom ? [id, o.link] : [id]); };
  const onHoldRelease = (id: string) => { setLifted([]); setSelected([id]); };

  const chips = chipsFor(activeCtx, checks, confirmed && !stagedIds.length);
  // The prompt bar takes the full width when tapped, when any AI card is up, or when an object is selected
  const cardUp = !!(card && cardCheck) || !!praiseNote;
  const wide = askOpen || cardUp || !!opts || !!proposal || selected.length > 0 || !!menuFor;
  const ctxLabel = activeCtx.length === 2 ? activeCtx.map((id) => find(id)?.name).join(' + ') : activeCtx.length > 1 ? `${activeCtx.length} objects` : activeCtx.length ? find(activeCtx[0])?.name : 'Whole room';
  const assetItems = (tab === 'all' ? [...objs] : objs.filter((o) => o.origin === tab)).sort((a, b) => Number(a.inRoom) - Number(b.inRoom));
  const neverEdited = !layout.edited && hist.i === 0;
  const roomEdit = mode !== 'edit';
  // Suggestions on the canvas are timed to where the user is, appear for a few seconds, end in a question and can be dismissed
  const inRoomCount = objs.filter((o) => o.inRoom).length;
  const want: { kind: 'clear' | 'save' | 'list' | 'prefs'; key: string; delay: number } | null =
    savedAt && Date.now() - savedAt < 90000 ? { kind: 'list', key: 'list' + savedAt, delay: 1800 }   // just saved: the checklist
    : removeRun >= 1 && removeRun <= 2 && inRoomCount >= 3 ? { kind: 'clear', key: 'clear-r' + removeRun + '-' + hist.i, delay: 900 } // taking things out one by one: offer to clear the lot
    : neverEdited ? { kind: 'clear', key: 'clear', delay: 2500 }                                       // just starting: a clean canvas
    : confirmed && !stagedIds.length && hist.i >= 3 && inRoomCount >= 5 ? { kind: 'save', key: 'save' + layoutId, delay: 3500 } // midway, a good number of objects: save it
    : !prefs.given ? { kind: 'prefs', key: 'prefs', delay: 6000 } : null;
  const quiet = !busy && !lifted.length && !cardUp && !selected.length && !menuFor && !askOpen && !sheet && !dialog && mode === 'edit' && !preview;
  useEffect(() => {
    if (!want || !quiet || nudged.includes(want.key)) { setNudge(null); return; }
    const show = setTimeout(() => setNudge(want.kind), want.delay);
    const hide = setTimeout(() => { setNudge(null); setNudged((d) => [...d, want.key]); }, want.delay + 9000);
    return () => { clearTimeout(show); clearTimeout(hide); setNudge(null); };
  }, [want?.key, quiet, nudged.length]);
  const endNudge = () => { if (want) setNudged((d) => [...d, want.key]); setNudge(null); };
  const clearRoom = () => { apply(Object.fromEntries(objs.filter((o) => o.inRoom).map((o) => [o.id, { inRoom: false }]))); setTab('all'); setSide('assets'); setDrawerH(ONE_ROW); setToast({ text: 'Room cleared. Everything is in Assets.', undo: true }); };
  const menuObj = find(menuFor);
  const rotDeg = rotateId && find(rotateId) ? Math.round((((find(rotateId)!.rot * 180) / Math.PI) % 360 + 360) % 360) % 360 : 0;
  const selObj = find(eoId);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Stage objs={objs} boxIds={roomEdit ? [] : boxIds} liftedIds={lifted} selected={roomEdit ? [] : selected.length ? selected : menuIds} was={was} ghosts={ghosts} pins={pins}
        palette={cur.palette} mode={roomEdit || preview || opts || proposal ? 'look' : rotateId ? 'rotate' : 'edit'} rotateId={rotateId} soft={sheet === 'eo' || sheet === 'ai'}
        signal={(id, at) => { const o = find(id); return o ? signalFor({ ...o, at }, objs, fixed, prefs) : null; }} onSignal={setSignal} rendering={rendering} onAim={onAim} onGhostDrop={proposal?.p.multi ? (id, at) => { const spot = ghostSpot(id, at); setProposal({ ...proposal, p: { ...proposal.p, changes: proposal.p.changes.map((c) => (c.id === id ? { ...c, at: spot, note: 'Moved by you' } : c)) } }); setPfocus(id); } : undefined} onTouch={() => setDrawerH((h) => (h > ONE_ROW + 20 ? ONE_ROW : h))} onLook={() => { if (selRef.current.length === 2) setLook((n) => n + 1); }} onThumbs={setThumbs} gyro={gyro} onGyroFail={() => { setGyro(false); setToast({ text: 'No motion sensor found. Drag to look around.' }); }}
        onTap={onTap} onHold={onHold} onHoldRelease={onHoldRelease} onDrop={onDrop}
        onRotated={(id, rot) => applyRot(id, rot)} apiRef={api} />

      {preview ? <div className="topbar" style={{ justifyContent: 'flex-end' }}><button className="glass btn-icon" onClick={() => setPreview(false)} aria-label="Show controls"><Ic n="eye" /></button></div> : roomEdit ? (<>
        <div className="over card pop" style={{ top: 14, padding: 16 }}>
          <AiTag>{mode === 'roomsetup' ? 'Found by Layo' : 'Room edit'}</AiTag>
          <h1 className="t-head" style={{ marginTop: 4 }}>{mode === 'roomsetup' ? "Here's what we found" : 'Fix what Layo got wrong'}</h1>
          <p className="t-cap">{mode === 'roomsetup' ? 'Look around. Tap anything that looks wrong. One thing we were not sure about is marked.' : 'Tap any label to correct it. This fixes the scan; it does not rebuild the room.'}</p>
        </div>
        <div className="bottom">
          <button className="btn btn-secondary glass" style={{ alignSelf: 'center' }} onClick={() => { const c = api.current?.centre() ?? [1, 0]; const id = 'user' + Date.now(); push({ fixed: [...fixed, { id, name: 'Something we missed', pos: [c[0] * 2.05, 1.1, c[1] * 2.05], state: 'ok', user: true }] }); setFixId(id); setSheet('fix'); }}><Ic n="plus" />Mark something we missed</button>
          <div className="rowx g2">{mode === 'roomsetup' ? <button className="btn glass" onClick={finishSetup}>Skip</button> : null}<Primary knob="check" style={{ flex: 1 }} onClick={finishSetup}>{mode === 'roomsetup' ? 'Looks right' : 'Done'}</Primary></div>
        </div>
      </>) : (<>
        {/* ---- top bar (DEC-049) ---- */}
        <div className="topbar">
          <div className="glass bar"><button className="btn-icon" aria-label="Back to Home" onClick={() => (side === 'assets' && !wide && drawerH > ONE_ROW + 20 ? setDrawerH(ONE_ROW) : guard(onExit, 'leave'))}><Ic n="back" /></button>
            <button className="btn btn-ghost" style={{ padding: '0 10px 0 0', fontSize: 14, maxWidth: 170, gap: 2, minWidth: 0 }} onClick={() => setSheet('layouts')}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{layout.name}</span><Ic n="down" s="sm" /></button></div>
          {/* With changes staged this bar becomes Confirm: Room Check, Save and More are not needed mid-confirmation (the review sheet lists open checks) */}
          {rotateId ? null
            : stagedIds.length && !busy && !lifted.length
            ? <Primary className="pop" style={{ minHeight: 48 }} onClick={() => (stagedChecks.length ? setSheet('review') : confirmWithRender())}>Confirm <span className="mono" style={{ opacity: 0.7 }}>{stagedIds.length}</span></Primary>
            : <div className="glass bar">
                <button className="btn-icon" aria-label={`Room Check${checks.length ? `, ${checks.length} open` : ''}`} onClick={() => setSheet('rc')}><Ic n="clip" />{checks.length ? <span className="badge"><PetMark n={checks.length > 1 ? checks.length : undefined} size={24} /></span> : null}</button>
                <button className="btn-icon" aria-label="Save layout" onClick={() => setDialog('save')}><Ic n="floppy" /></button>
                <button className="btn-icon" aria-label="More options" onClick={() => setSheet('more')}><Ic n="more" /></button>
              </div>}
        </div>
        {/* under the top bar: Undo and Redo on the left, Preview and gyro look-around on the right. Out of the way while something is being carried */}
        {lifted.length || rotateId ? null : <>
          <div className="side side-l"><div className="glass bar vbar"><button className="btn-icon" disabled={hist.i === 0} onClick={undo} aria-label="Undo"><Ic n="undo" /></button><button className="btn-icon" disabled={hist.i >= hist.list.length - 1} onClick={redo} aria-label="Redo"><Ic n="redo" /></button></div></div>
          <div className="side side-r"><div className="glass bar vbar"><button className="btn-icon" onClick={() => { reset(); setPreview(true); }} aria-label="Preview"><Ic n="eye" /></button><button className={`btn-icon ${gyro ? 'is-on' : ''}`} onClick={toggleGyro} aria-pressed={gyro} aria-label="Look around by moving your phone"><Ic n="gyro" /></button></div></div>
        </>}

        {/* ---- just above the bottom bar ---- */}
        <div className="bottom" ref={bottomRef}>
          {toast ? <div className="toast pop" role="status" style={{ alignSelf: 'center' }}><span className="grow">{toast.text}</span>{toast.undo ? <button className="btn-link" style={{ padding: '0 12px' }} onClick={() => { undo(); setToast(null); }}>Undo</button> : <span style={{ width: 10 }} />}</div> : null}

          {/* Every card of the AI is one AiCard: who and what (header), the claim (title), the reason (body), then actions (foot) */}
          {rotateId ? <RotateGuide deg={rotDeg} />

          : aiBusy ? <div className="glass nudge pop" role="status" aria-live="polite"><span className="nudge-go" style={{ cursor: 'default' }}><Petal size={16} strong style={{ animation: 'sweep 1.4s linear infinite' }} />Layo is thinking</span></div>

          : proposal?.p.multi ? <AiCard tag="Layo proposes" title={proposal.p.title}
              foot={<><button className="btn btn-secondary btn-sm" onClick={() => setProposal(null)}>Not now</button><span className="grow" /><Primary className="btn-sm" disabled={pLoading || !proposal.p.changes.some((c) => proposal.ticks[c.id])} onClick={applyProposal}>Apply {proposal.p.changes.filter((c) => proposal.ticks[c.id]).length}</Primary></>}>
              {pLoading ? <div className="rowx g2 t-label c2" role="status" style={{ padding: '6px 2px' }}><Petal size={18} style={{ animation: 'sweep 1.4s linear infinite' }} />Layo is weighing the free spots.</div> : proposal.p.changes.map((ch, i) => { const o = find(ch.id)!, on = !!proposal.ticks[ch.id]; return (
                <div key={ch.id} className={`aic-opt ${pfocus === ch.id ? 'is-on' : ''}`} role="button" tabIndex={0} style={{ opacity: on ? 1 : 0.5 }} onClick={() => on && focusRow(ch.id)} onKeyDown={(e) => e.key === 'Enter' && on && focusRow(ch.id)}>
                  <span className={`ghostnum ${pfocus === ch.id ? 'is-on' : ''}`} style={{ boxShadow: 'none', width: 26, height: 26, fontSize: 13 }}>{i + 1}</span>
                  <span className="col grow"><span className="t-label" style={{ fontWeight: 600 }}>{o.name}</span><span className="t-cap">{on ? ch.note || where({ at: ch.at! }) : 'Left out'}</span></span>
                  <button className="btn-icon aic-nav" aria-label={on ? `Take out the ${o.name.toLowerCase()}` : `Put the ${o.name.toLowerCase()} back`} onClick={(e) => { e.stopPropagation(); setProposal({ ...proposal, ticks: { ...proposal.ticks, [ch.id]: !on } }); if (!on) focusRow(ch.id); }}><Ic n={on ? 'minus' : 'plus'} s="sm" /></button>
                </div>); })}
            </AiCard>

          : proposal ? <AiCard tag="Layo proposes" title={proposal.p.title}
              body={proposal.p.restyle ? 'Untick anything you want to leave as it is. Walls and floor stay.' : proposal.p.changes.map((ch) => `${find(ch.id)?.name}: ${ch.remove ? 'goes to Assets' : ch.finish ? ch.finish : ch.add ? 'comes in ' + where({ at: ch.at! }) : 'moves ' + where({ at: ch.at! })}`).join(' · ')}
              foot={<><button className="btn btn-secondary btn-sm" onClick={() => setProposal(null)}>Not now</button><span className="grow" /><Primary className="btn-sm" onClick={applyProposal}>Apply</Primary></>} />

          : opts ? <AiCard tag="Layo suggests" title={`Where the ${find(opts.id)?.name.toLowerCase()} could go`}
              body={opts.loading ? null : opts.note || (!opts.list.length ? "There's no other free spot for it right now. Clearing something first would open one." : null)}
              foot={<><button className="btn btn-secondary btn-sm" onClick={() => setOpts(null)}>Back</button><span className="grow" /><Primary className="btn-sm" disabled={!opts.list.length} onClick={applyOption}>Apply</Primary></>}>
              {opts.loading ? <div className="rowx g2 t-cap" role="status"><Petal size={16} style={{ animation: 'sweep 1.4s linear infinite' }} />Layo is weighing the free spots.</div> : null}
              {opts.list.map((op, i) => <button key={op.n} className={`aic-opt ${i === opts.pick ? 'is-on' : ''}`} onClick={() => { setOpts({ ...opts, pick: i }); api.current?.lookAt(op.at[0], op.at[1]); }}><span className={`ghostnum ${i === opts.pick ? 'is-on' : ''}`} style={{ boxShadow: 'none', width: 26, height: 26, fontSize: 13 }}>{op.n}</span><span className="t-label grow" style={{ fontWeight: 500 }}>{op.cost}</span></button>)}
            </AiCard>

          : praiseNote ? <AiCard tag="Layo noticed" obj={find(praiseNote.id)?.name} title={praiseNote.text} end={<button className="btn-icon aic-nav" aria-label="Close" onClick={() => setPraiseNote(null)}><Ic n="close" s="sm" /></button>} />

          : card && cardCheck ? <AiCard key={`${card.obj}${card.i}`} tag="Layo noticed" obj={find(card.obj)?.name}
              end={<>
                <span className={`kind ${cardCheck.kind}`}>{cardCheck.kind === 'fact' ? 'Room fact' : 'Your priority'}</span>
                {cardList.length > 1 ? <span className="rowx"><button className="btn-icon aic-nav" aria-label="Previous" onClick={() => setCard({ ...card, i: (card.i + cardList.length - 1) % cardList.length })}><Ic n="back" s="sm" /></button><span className="mono t-cap">{Math.min(card.i, cardList.length - 1) + 1}/{cardList.length}</span><button className="btn-icon aic-nav" aria-label="Next" onClick={() => setCard({ ...card, i: (card.i + 1) % cardList.length })}><Ic n="back" s="sm" style={{ transform: 'scaleX(-1)' }} /></button></span> : null}
              </>}
              title={cardCheck.text}
              body={cardCheck.why || cardCheck.before ? <>{cardCheck.before ? <span className="tag-before">Before you started</span> : null}{cardCheck.before && cardCheck.why ? ' ' : ''}{cardCheck.why}</> : null}
              foot={<>
                {/* The model orders the actions and can promote "Not right?"; Keep it and the quiet "Not right?" link are always there */}
                {[...(cardCheck.acts || ['options', 'keep']), ...((cardCheck.acts || []).includes('undo') ? [] : ['undo'])].filter((a) => a !== 'fix').map((a) => a === 'options' ? <button key={a} className="chip chip-sm is-ai" onClick={() => openOptions(card.obj, 'card')}><Petal size={14} strong />Show options</button>
                  : a === 'keep' ? <button key={a} className="chip chip-sm" onClick={() => { keep(cardCheck); if (cardList.length <= 1) setCard(null); }}>Keep it</button>
                  : a === 'undo' ? (card.fresh || changed(find(card.obj)!) ? <button key={a} className="chip chip-sm" onClick={() => (card.fresh ? undo() : undoObject(card.obj))}>Undo</button> : null)
                  : null)}
              </>} />

          : menuObj ? null

          : nudge ? <div className={`glass nudge pop ${nudge === 'prefs' ? 'is-ai' : ''}`} role="status">
              <button className="nudge-go" onClick={() => { endNudge(); if (nudge === 'clear') clearRoom(); else if (nudge === 'save') setDialog('save'); else if (nudge === 'list') setSheet('fn'); else setSheet('prefs'); }}>
                {nudge === 'clear' ? <Ic n="broom" s="sm" /> : nudge === 'save' ? <Ic n="floppy" s="sm" /> : nudge === 'list' ? <Ic n="list" s="sm" /> : <Petal size={14} strong />}
                {nudge === 'clear' ? 'Clear the room?' : nudge === 'save' ? 'Save this layout?' : nudge === 'list' ? 'Get the move checklist?' : 'Tell us what matters?'}
              </button>
              <button className="btn-icon nudge-x" aria-label="Dismiss" onClick={endNudge}><Ic n="close" s="sm" /></button>
            </div> : null}

          {/* The assets drawer: drag the handle to make it as tall as you like. No AI suggestions here. */}
          {busy || (lifted.length && !dnd) || wide || side === 'ai' ? null
            : <div ref={drawerEl} className="drawer-wrap pop" style={{ opacity: dnd ? 0.35 : 1, transition: 'opacity .2s' }}>
                <div className="drawer-grip" role="slider" aria-label="Drawer height" aria-valuemin={ONE_ROW} aria-valuemax={maxH()} aria-valuenow={Math.min(drawerH, maxH())} tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') setDrawerH((h) => Math.max(ONE_ROW, Math.min(maxH(), h + (e.key === 'ArrowUp' ? 40 : -40)))); }}
                  onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { y: e.clientY, h: Math.min(drawerH, maxH()) }; }}
                  onPointerMove={(e) => { const d = drag.current; if (d) setDrawerH(Math.max(ONE_ROW, Math.min(maxH(), d.h + d.y - e.clientY))); }}
                  onPointerUp={() => { drag.current = null; try { localStorage.setItem('kith.drawerH', String(drawerH)); } catch { /* not saved */ } }}
                  onPointerCancel={() => { drag.current = null; }}><span className="handle" /></div>
                <div className="drawer-h">
                  <button className={`chip chip-sm glass ${tab === 'all' ? 'is-on' : ''}`} onClick={() => setTab('all')}>All</button>
                  <button className={`chip chip-sm glass ${tab === 'suggested' ? 'is-on' : ''}`} onClick={() => setTab('suggested')}><Petal size={14} />Suggested</button>
                  <button className={`chip chip-sm glass ${tab === 'added' ? 'is-on' : ''}`} onClick={() => setTab('added')}>Added</button>
                </div>
                <div className="glass drawer" style={{ height: Math.min(Math.max(drawerH, ONE_ROW), maxH()) }}>
                  <div className="drawer-grid">
                    {assetItems.map((o) => <AssetTile key={o.id} o={o} thumb={thumbs[o.id]} lifting={dnd?.id === o.id} onDown={(e) => startHold(e, o)} onClick={() => !o.inRoom && !justDragged.current && bringIn(o.id)} />)}
                    {!assetItems.length ? <p className="t-cap" style={{ gridColumn: '1 / -1', padding: 8 }}>{tab === 'added' ? 'Nothing added yet. Use Add object, below.' : 'No suggestions right now.'}</p> : null}
                  </div>
                </div>
              </div>}

          {/* The dock. Tap the prompt bar, or have a card or an object up, and it takes the full width: the AI/Assets toggle steps aside.
              The context ("Whole room", an object) sits on the bar's top edge so typed text has the room. */}
          {busy || lifted.length || cardUp || (!wide && side !== 'ai') ? null : <div className="hscroll fade-r" style={{ gap: 6 }}>{chips.map((c) => <button key={c} className="chip chip-sm is-ai" onClick={() => send(c)}>{c}</button>)}</div>}
          {rotateId ? null : <div className="dock" style={{ opacity: dnd ? 0.35 : 1, transition: 'opacity .2s' }}>
            {wide ? null : <div className="seg seg-ic"><button className={side === 'ai' ? 'is-on' : ''} aria-label="AI" aria-pressed={side === 'ai'} title="AI" onClick={() => setSide('ai')}><AiIcon /></button><button className={side === 'assets' ? 'is-on' : ''} aria-label="Assets" aria-pressed={side === 'assets'} title="Assets" onClick={() => setSide('assets')}><Ic n="grid" /></button></div>}
            {!wide && side !== 'ai' ? null : <div className="col grow" style={{ gap: 16 }}>
              {wide ? <div className="glass ask askbar">
                  
                  <input ref={inputRef} className="kbd" placeholder={aiBusy ? 'Thinking' : 'Ask Layo'} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)} />
                  <button className={`btn-icon ${listening ? 'is-on mic-live' : ''}`} aria-label={listening ? 'Stop listening' : 'Speak to Layo'} aria-pressed={listening} onClick={toggleMic}><Ic n="mic" /></button>
                  <button className="send" aria-label="Send" onClick={() => send(input)}><Ic n="send" /></button>
                </div>
                : side === 'ai' ? <div className="glass ask askbar" role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => setAskOpen(true)} onKeyDown={(e) => e.key === 'Enter' && setAskOpen(true)}><span className="ph" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }} role="status">{aiBusy ? 'Thinking' : 'Ask Layo'}</span><button className={`btn-icon ${listening ? 'is-on mic-live' : ''}`} aria-label={listening ? 'Stop listening' : 'Speak to Layo'} aria-pressed={listening} onClick={(e) => { e.stopPropagation(); toggleMic(); }}><Ic n="mic" /></button><span className="send" aria-hidden="true"><Ic n="send" /></span></div>
                : null}
            </div>}
            {!wide && side !== 'ai' ? <button className="btn glass" style={{ marginLeft: 'auto', minHeight: 56 }} onClick={() => setSheet('addsrc')}><Ic n="plus" />Add object</button> : null}
          </div>}
        </div>
      </>)}

      {mapping ? (
        <div className="mapping" role="status" aria-live="polite">
          <Petal size={64} style={{ animation: 'sweep 1.6s linear infinite' }} />
          <div className="t-head">Mapping your room</div>
          <p className="t-label c2">{['Placing your furniture', 'Measuring the door and windows', 'Locating the plugs', 'Getting your room ready'][mapStep]}</p>
          <div className="mapbar"><i style={{ width: `${(mapStep + 1) * 25}%` }} /></div>
        </div>) : null}

      {dnd ? <DragGhost thumb={thumbs[dnd.id]} letter={find(dnd.id)?.name[0] ?? ''} pos={dndPos} phase={dnd.phase === 'draft' ? 'drop' : dnd.phase} from={{ x: dnd.fx, y: dnd.fy }} /> : null}

      {/* ================= sheets ================= */}
      {sheet === 'ai' ? (
        <Sheet title="Layo" onClose={() => setSheet(null)} tall>
          <div className="col g3 grow" style={{ justifyContent: 'flex-end', minHeight: 120 }}>
            {!msgs.length ? <p className="t-cap" style={{ textAlign: 'center' }}>Ask about the {ctxLabel === 'Whole room' ? 'room' : ctxLabel?.toLowerCase()}, or pick one below.</p> : null}
            {msgs.map((m, i) => m.me ? <div key={i} className="msg-me t-body">{m.text}</div> : (
              <div key={i} className="msg-ai"><Petal size={24} style={{ marginTop: 10 }} /><div className="col g2"><p className="t-body">{m.text}</p>
                {m.ask ? <div className="wrap">{m.ask.map((a) => <button key={a} className="chip chip-sm" onClick={() => send(a)}>{a}</button>)}</div> : null}
                {m.link ? <button className="chip chip-sm" style={{ alignSelf: 'flex-start' }} onClick={() => go(m.link!.to, m.link!.id)}>{m.link.label}<Ic n="right" s="sm" /></button> : null}
                {m.rule === 'privacy' ? <span className="chip chip-sm is-ai" style={{ alignSelf: 'flex-start' }}><Petal size={14} strong />Added: keep the desk out of view from the door</span> : null}
              </div></div>))}
            {aiBusy ? <div className="msg-ai" role="status"><Petal size={24} style={{ marginTop: 10, animation: 'sweep 1.4s linear infinite' }} /><p className="t-body c2">Thinking</p></div> : null}
          </div>
          <div className="hscroll" style={{ flex: 'none' }}>{chips.map((c) => <button key={c} className="chip chip-sm is-ai" onClick={() => send(c)}><Petal size={14} strong />{c}</button>)}</div>
          <div className="well ask" style={{ borderRadius: 28, flex: 'none' }}>{activeCtx.length ? <span className="ctx"><Petal size={12} strong /><Marquee>{ctxLabel ?? ''}</Marquee></span> : null}<input className="kbd" placeholder="Ask Layo" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)} /><button className="send" onClick={() => send(input)} aria-label="Send"><Ic n="send" /></button></div>
        </Sheet>) : null}

      {sheet === 'review' ? (
        <Sheet title={stagedChecks.length ? `${stagedChecks.length} check${stagedChecks.length > 1 ? 's' : ''} still open` : 'Confirm these changes?'} onClose={() => setSheet(null)}
          foot={<><button className="btn btn-ghost" onClick={discard}>Discard changes</button><Primary className="grow" onClick={confirmWithRender}>{stagedChecks.length ? 'Confirm anyway' : 'Confirm'}</Primary></>}>
          <p className="t-label c2">{stagedIds.length} change{stagedIds.length > 1 ? 's' : ''}: {stagedIds.map((id) => find(id)?.name).join(', ')}. The boxes become furniture.</p>
          {stagedChecks.length ? <CheckList checks={stagedChecks} find={find} onPick={(c) => { setSheet(null); api.current?.lookAt(find(c.obj)!.at[0], find(c.obj)!.at[1]); setCard({ obj: c.obj, i: checksOf(c.obj).indexOf(c), fresh: false }); }} /> : <div className="rowx g2 t-label"><Ic n="check" />Nothing open. This layout works with what you told us.</div>}
        </Sheet>) : null}

      {sheet === 'rc' ? (
        <Sheet title="Room Check" onClose={() => setSheet(null)} foot={checks.length ? <button className="btn btn-ghost" onClick={() => setDialog('clear')}>Clear checks</button> : undefined}>
          {stagedChecks.length ? <CheckList checks={stagedChecks} find={find} onPick={(c) => { setSheet(null); api.current?.lookAt(find(c.obj)!.at[0], find(c.obj)!.at[1]); setCard({ obj: c.obj, i: checksOf(c.obj).indexOf(c), fresh: false }); }} /> : <div className="col g2" style={{ alignItems: 'center', padding: '24px 0' }}><Petal size={40} /><div className="t-head">Nothing to check</div></div>}
          {!prefs.given ? <button className="chip is-ai" style={{ alignSelf: 'flex-start' }} onClick={() => setSheet('prefs')}><Petal size={14} strong />Tell us what matters</button> : null}
        </Sheet>) : null}

      {sheet === 'more' ? (
        <Dialog title="More options" onClose={() => setSheet(null)}>
          <div className="col">
            <button className="row btn-ghost" style={{ border: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setSheet(null); apply(Object.fromEntries(objs.filter((o) => o.inRoom).map((o) => [o.id, { inRoom: false }]))); setTab('all'); setSide('assets'); setDrawerH(ONE_ROW); setToast({ text: 'Room cleared. Everything is in Assets.', undo: true }); }}><span className="well-ic"><Ic n="broom" /></span><span className="col grow"><span className="t-label" style={{ fontWeight: 600 }}>Clear the room</span><span className="t-cap">Everything movable goes to Assets. You can undo it.</span></span></button>
            <button className="row" style={{ border: 0, borderTop: '1px solid var(--border-1)', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setSheet(null); reset(); setMode('roomedit'); }}><span className="well-ic"><Ic n="room" /></span><span className="col grow"><span className="t-label" style={{ fontWeight: 600 }}>Room edit</span><span className="t-cap">Fix what the scan got wrong.</span></span></button>
            <button className="row" style={{ border: 0, borderTop: '1px solid var(--border-1)', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => setSheet('prefs')}><span className="well-ic"><Ic n="sliders" /></span><span className="col grow"><span className="t-label" style={{ fontWeight: 600 }}>Preferences</span><span className="t-cap">References, activities and priorities.</span></span></button>
            <button className="row" style={{ border: 0, borderTop: '1px solid var(--border-1)', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { brain.on = !brainOn; setBrainOn(!brainOn); if (!brainOn) wake().then(setBrainReady); }}><span className="well-ic"><Petal size={22} /></span><span className="col grow"><span className="t-label" style={{ fontWeight: 600 }}>Layo's thinking</span><span className="t-cap">{!brainOn ? 'Scripted answers. Tap to use the model on this device.' : brainReady ? `The model on this device (${MODEL}). Tap for scripted answers.` : 'No local model found, so answers are scripted.'}</span></span><span className={`check ${brainOn && brainReady ? 'is-on' : ''}`}>{brainOn && brainReady ? <Ic n="check" s="sm" /> : null}</span></button>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => setSheet(null)}>Close</button>
        </Dialog>) : null}

      {sheet === 'prefs' ? (
        <Sheet title="Preferences" onClose={() => { setPrefs({ ...prefs, given: prefs.priorities.length + prefs.main.length + prefs.some.length > 0 }); setSheet(null); }} tall>
          <WordsList prefs={prefs} set={setPrefs} />
          <div className="t-label" style={{ fontWeight: 600 }}>Priorities</div><PriorityPicker prefs={prefs} set={setPrefs} />
          <div className="t-label" style={{ fontWeight: 600 }}>Activities</div><ActivityPicker prefs={prefs} set={setPrefs} />
          <div className="t-label" style={{ fontWeight: 600 }}>References</div><RefPicker prefs={prefs} set={setPrefs} />
        </Sheet>) : null}

      {sheet === 'layouts' ? (
        <Sheet title="Layouts" onClose={() => setSheet(null)}>
          <div className="col">{layouts.map((l) => <button key={l.id} className="row" style={{ border: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => (l.id === layoutId ? setSheet(null) : guard(() => openLayout(l), 'switch'))}><span className="well-ic"><Ic n="layers" /></span><span className="t-label grow" style={{ fontWeight: 600 }}>{l.name}</span>{l.id === layoutId ? <span className="t-cap">Open</span> : <Ic n="right" s="sm" />}</button>)}</div>
          <div className="wrap">
            <button className="chip" onClick={() => guard(() => addLayout(layout.name + ' copy', committed, cur.cpal), 'switch')}>Duplicate</button>
            <button className="chip" onClick={() => guard(() => addLayout('New layout', START, 'warm_studio'), 'switch')}>New from the original room</button>
          </div>
        </Sheet>) : null}

      {sheet === 'fn' ? (() => { const steps = moveList(committed); const txt = steps.map((s, i) => `${i + 1}. ${s}`).join('\n'); return (
        <Sheet title="What to move" onClose={() => setSheet(null)} foot={steps.length ? <Primary knob="share" className="grow" onClick={async () => { try { if (navigator.share) await navigator.share({ title: layout.name, text: txt }); else { await navigator.clipboard.writeText(txt); setToast({ text: 'Copied the list.' }); } } catch { /* cancelled */ } }}>Share the list</Primary> : undefined}>
          {steps.length ? <><p className="t-cap">From your room as it is today to "{layout.name}", in an order that works.{stagedIds.length ? ' Staged changes are not in this list until you confirm.' : ''}</p><ol className="col">{steps.map((s, i) => <li key={i} className="row"><span className="rank">{i + 1}</span><span className="t-body grow">{s}</span></li>)}</ol></>
            : <div className="col g2" style={{ alignItems: 'center', padding: '24px 0', textAlign: 'center' }}><Ic n="check" s="lg" /><div className="t-head">Nothing to move</div><p className="t-cap">This layout is your room as it is.{stagedIds.length ? ' Confirm your changes to see them here.' : ''}</p></div>}
        </Sheet>); })() : null}

      {sheet === 'addsrc' || sheet === 'gallery' || sheet === 'link' ? <AddFlow step={sheet} setStep={setSheet} photos={thumbs} onAdd={(k) => { const o = clone(PREPARED[k]); if (!find(o.id)) push({ objs: [...objs, o], committed: [...committed, o] }); setEoId(o.id); setSheet('eo'); }} /> : null}
      {sheet === 'camera' ? <Camera onCancel={() => setSheet('addsrc')} onUse={() => { const o = clone(PREPARED.camera); if (!find(o.id)) push({ objs: [...objs, o], committed: [...committed, o] }); setEoId(o.id); setSheet('eo'); }} /> : null}

      {sheet === 'eo' && selObj ? <EditObject key={selObj.id} o={selObj} partner={find(PAIRS[selObj.id])?.name}
        onCancel={() => setSheet(null)} onFix={() => { setFixId(selObj.id); setSheet('fix'); }}
        onDone={(patch) => {
          const adding = selObj.isNew && !selObj.inRoom; const n = { ...selObj, ...patch };
          apply({ [selObj.id]: { ...patch, isNew: false, ...(!adding && patch.dims && selObj.inRoom && !selObj.wall ? { at: place(selObj.at[0], selObj.at[1], { dims: patch.dims, rot: selObj.rot }) } : {}), ...(adding ? { inRoom: true, ...newSpot(n as Obj) } : {}) } });
          setSheet(null); setMenuFor(null); if (adding) { setPlacing(selObj.id); setSide('ai'); }
        }} /> : null}

      {sheet === 'fix' && fixId ? <FixSheet fx={fixed.find((f) => f.id === fixId)} o={find(fixId)} onClose={() => setSheet(null)}
        onFixed={(patch) => { push({ fixed: fixed.map((f) => (f.id === fixId ? { ...f, ...patch } : f)) }); setSheet(null); setToast({ text: patch.state === 'gone' ? 'Removed from the room.' : 'Corrected. Layo checked the room again.', undo: true }); }}
        onObj={(patch) => { apply({ [fixId]: patch }); setSheet(null); setToast({ text: 'Corrected.', undo: true }); }} onSize={() => { setEoId(fixId); setSheet('eo'); }} /> : null}

      {/* ================= dialogs ================= */}
      {dialog === 'leave' || dialog === 'switch' ? (
        <Dialog title="Confirm or discard your changes first?" text={`You have ${stagedIds.length} staged change${stagedIds.length > 1 ? 's' : ''}. A ${dialog === 'leave' ? 'project' : 'layout'} is always left with nothing staged.`} onClose={() => { pending.current = null; setDialog(null); }}>
          <Primary onClick={confirmWithRender}>{stagedChecks.length ? 'Confirm anyway' : 'Confirm'}</Primary><button className="btn btn-secondary" onClick={discard}>Discard</button><button className="btn btn-ghost" onClick={() => { pending.current = null; setDialog(null); }}>Cancel</button>
        </Dialog>) : null}
      {dialog === 'clear' ? (
        <Dialog title="Clear every check?" text="This clears every check. You can't bring them back." onClose={() => setDialog(null)}>
          <button className="btn btn-danger" onClick={() => { setCleared([...cleared, ...checks.map((c) => `${c.key}@${sig(find(c.obj)!)}`)]); setDialog(null); setSheet(null); setCard(null); }}>Clear checks</button><button className="btn btn-ghost" onClick={() => setDialog(null)}>Cancel</button>
        </Dialog>) : null}
      {dialog === 'save' ? (
        <Dialog title="Save layout" text={stagedIds.length ? 'This saves the room as last confirmed. Staged changes are not included.' : 'Name the room as it is now.'} onClose={() => setDialog(null)}>
          <div className="input is-focus"><input className="kbd" autoFocus placeholder="Name this layout" value={saveName} onChange={(e) => setSaveName(e.target.value)} /></div>
          <Primary disabled={!saveName.trim()} onClick={() => { addLayout(saveName.trim(), committed, cur.cpal, !stagedIds.length); setSavedAt(Date.now()); setDialog(null); setToast({ text: `Saved "${saveName.trim()}".` }); setSaveName(''); }}>Save</Primary><button className="btn btn-ghost" onClick={() => setDialog(null)}>Cancel</button>
        </Dialog>) : null}
    </div>
  );
};
const AssetTile: React.FC<{ o: Obj; thumb?: string; lifting?: boolean; onDown: (e: React.PointerEvent) => void; onClick: () => void }> = ({ o, thumb, lifting, onDown, onClick }) => (
  <button className="tile" onClick={onClick} onPointerDown={onDown} onContextMenu={(e) => e.preventDefault()} style={{ opacity: lifting ? 0.3 : o.inRoom ? 0.5 : 1, transition: 'opacity .15s' }} aria-label={`${o.name}${o.inRoom ? ', in the room' : '. Hold and drag to place it'}`}>
    <div className="pic" style={{ height: 'auto', aspectRatio: '1' }}>{thumb ? <img src={thumb} alt="" draggable={false} /> : <span className="t-title" style={{ color: 'var(--text-3)' }}>{o.name[0]}</span>}{o.origin === 'suggested' ? <span style={{ position: 'absolute', top: 6, right: 6 }}><Petal size={14} /></span> : null}</div>
    <span className="t-cap" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{o.inRoom ? 'In room' : o.name}</span>
  </button>
);

/** The tile being carried: it follows the finger with a little lag and tilt, pops up on pickup and settles into the room on drop. */
const DragGhost: React.FC<{ thumb?: string; letter: string; pos: React.MutableRefObject<{ x: number; y: number }>; phase: 'drag' | 'drop' | 'back'; from: { x: number; y: number } }> = ({ thumb, letter, pos, phase, from }) => {
  const el = useRef<HTMLDivElement>(null); const cur = useRef({ x: from.x, y: from.y }); const tilt = useRef(0); const ph = useRef(phase); ph.current = phase;
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = ph.current === 'back' ? from : pos.current, dx = t.x - cur.current.x;
      cur.current.x += dx * 0.32; cur.current.y += (t.y - cur.current.y) * 0.32;
      tilt.current += (Math.max(-12, Math.min(12, dx * 0.5)) - tilt.current) * 0.25;
      if (el.current) el.current.style.transform = `translate3d(${cur.current.x - 44}px, ${cur.current.y - 44 - (ph.current === 'drag' ? 34 : 0)}px, 0) rotate(${tilt.current}deg)`;
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, []);
  return <div ref={el} className="dnd" aria-hidden="true"><div className={`dnd-in ${phase}`}>{thumb ? <img src={thumb} alt="" /> : <span className="t-head">{letter}</span>}</div></div>;
};

/** A marker on the moved object: the AI's petal turns while Layo checks, then opens into what it found. */
const SigPin: React.FC<{ text: string }> = ({ text }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); const t = setTimeout(() => setOpen(true), 450); return () => clearTimeout(t); }, [text]);
  return <span className={`glass sigpin ${open ? 'is-open' : ''}`} role="status"><Petal size={22} strong style={open ? undefined : { animation: 'sweep 1.1s linear infinite' }} /><span className="sigtext">{text}</span></span>;
};

/** Rotation: a guide to the gesture, not a control. The turn is made by dragging sideways anywhere on the room; Confirm sits on the object. */
const RotateGuide: React.FC<{ deg: number }> = ({ deg }) => (
  <div className="glass rotguide pop" role="status" aria-label={`Drag sideways to turn. ${deg} degrees`}>
    <span className="rotg-track" aria-hidden="true"><Ic n="back" s="sm" /><span className="rotg-hand"><Ic n="hand" s="sm" /></span><Ic n="back" s="sm" style={{ transform: 'scaleX(-1)' }} /></span>
    <span className="t-label grow" style={{ fontWeight: 600 }}>Drag sideways to turn</span>
    <span className="mono t-label rotdeg">{deg}°</span>
  </div>
);

const CheckList: React.FC<{ checks: Check[]; find: (id: string) => Obj | undefined; onPick: (c: Check) => void }> = ({ checks, find, onPick }) => {
  const ids = [...new Set(checks.map((c) => c.obj))];
  return <div className="col g3">{ids.map((id) => (
    <div key={id} className="well" style={{ padding: '10px 14px' }}>
      <div className="t-cap" style={{ fontWeight: 600 }}>{find(id)?.name}</div>
      {checks.filter((c) => c.obj === id).map((c) => <button key={c.key} className="row" onClick={() => onPick(c)} style={{ border: 0, background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', minHeight: 48 }}><PetMark size={22} fact={c.kind === 'fact'} /><span className="t-label grow">{c.text}</span>{c.before ? <span className="tag-before">Before you started</span> : null}</button>)}
    </div>))}</div>;
};

const AddFlow: React.FC<{ step: string; setStep: (s: string | null) => void; onAdd: (k: 'gallery' | 'link' | 'poster') => void; photos: Record<string, string> }> = ({ step, setStep, onAdd, photos }) => {
  const [url, setUrl] = useState(''); const [state, setState] = useState<'paste' | 'reading' | 'failed'>('paste');
  const read = () => { setState('reading'); setTimeout(() => (/^https?:\/\/\S+\.\S+/.test(url.trim()) ? onAdd('link') : setState('failed')), 1400); };
  if (step === 'gallery') return (
    <Sheet title="Pick a photo" onClose={() => setStep(null)} back={() => setStep('addsrc')}>
      <p className="t-cap">Layo reads the object from the photo and estimates its size.</p>
      <div className="t-label" style={{ fontWeight: 600 }}>Recents</div>
      <div className="wrap" style={{ gap: 10 }}>{([['gallery', 'photo:added_shelf', 'Bookshelf'], ['poster', 'photo:added_poster', 'World map poster']] as const).map(([k, key, label]) => (
        <button key={k} onClick={() => onAdd(k)} aria-label={`Photo: ${label}`} style={{ width: 104, border: 0, background: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ display: 'block', width: 104, height: 104, borderRadius: 20, background: photos[key] ? `url(${photos[key]}) center / cover` : `url(${PANO}) 55% 55% / 520px` }} />
          <span className="t-cap" style={{ display: 'block', marginTop: 4 }}>{label}</span>
        </button>))}</div>
    </Sheet>);
  if (step === 'link') return (
    <Sheet title="Product link" onClose={() => setStep(null)} back={() => setStep('addsrc')} foot={<Primary className="grow" disabled={!url.trim() || state === 'reading'} onClick={read}>{state === 'reading' ? 'Reading the page' : 'Read the page'}</Primary>}>
      <div className={`input ${state === 'paste' ? 'is-focus' : ''}`}><Ic n="link" /><input className="kbd" autoFocus placeholder="Paste a link to the product" value={url} onChange={(e) => { setUrl(e.target.value); setState('paste'); }} /></div>
      {state === 'reading' ? <div className="rowx g2 t-label c2"><Petal size={18} style={{ animation: 'sweep 2s linear infinite' }} />Layo is reading the size and finish from the page.</div> : null}
      {state === 'failed' ? <p className="t-label" role="alert" style={{ color: 'var(--red-700)' }}>We couldn't open that page. Check the link, or add a photo instead.</p> : <p className="t-cap">Layo takes the size from the product page, so it's more exact than a photo.</p>}
    </Sheet>);
  return (
    <Sheet title="Add something" onClose={() => setStep(null)}>
      <div className="col">{([['camera', 'camera', 'Camera', 'Take a picture of it'], ['gallery', 'image', 'Gallery', 'Use a photo you have'], ['link', 'link', 'Product link', 'Paste a link from a shop']] as const).map(([k, ic, t, s]) => (
        <button key={k} className="row" style={{ border: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => setStep(k)}><span className="well-ic"><Ic n={ic} /></span><span className="col grow"><span className="t-label" style={{ fontWeight: 600 }}>{t}</span><span className="t-cap">{s}</span></span><Ic n="right" s="sm" /></button>))}</div>
    </Sheet>);
};
const Camera: React.FC<{ onCancel: () => void; onUse: () => void }> = ({ onCancel, onUse }) => {
  const [shot, setShot] = useState(false);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: `#000 url(${PANO}) 62% 50% / auto 130%` }}>
      <div style={{ position: 'absolute', inset: '22% 12% 30%', border: '2px solid var(--paper-50)', borderRadius: 28, boxShadow: shot ? '0 0 0 2000px rgba(0,0,0,.5)' : 'none' }} />
      <div className="topbar"><button className="glass btn-icon" onClick={onCancel} aria-label="Cancel"><Ic n="close" /></button></div>
      <div className="bottom" style={{ alignItems: 'center' }}>
        <span className="glass edge" style={{ pointerEvents: 'none' }}>{shot ? 'Captured' : 'Fit the whole object in the frame'}</span>
        {shot ? <div className="rowx g2"><button className="btn glass" onClick={() => setShot(false)}>Retake</button><Primary onClick={onUse}>Use photo</Primary></div> : <button onClick={() => setShot(true)} aria-label="Capture" style={{ width: 72, height: 72, borderRadius: 72, border: '4px solid var(--paper-50)', background: 'rgba(251,247,241,.35)', cursor: 'pointer' }} />}
      </div>
    </div>);
};

const EditObject: React.FC<{ o: Obj; partner?: string; onDone: (p: Partial<Obj>) => void; onCancel: () => void; onFix: () => void }> = ({ o, partner, onDone, onCancel, onFix }) => {
  const [d, setD] = useState<Dims>(o.dims); const [lock, setLock] = useState(true);
  const [type, setType] = useState(o.type); const [typeOk, setTypeOk] = useState(!o.isNew);
  const [finish, setFinish] = useState(o.finish); const [powered, setPowered] = useState(!!o.powered); const [name, setName] = useState(o.name);
  const edited = d.join() !== o.det.join();
  const step = (i: number, by: number) => {
    const lim = (v: number, k: number) => Math.min(o.det[k] * 1.5, Math.max(o.det[k] * 0.5, v));
    const v = lim(Math.round((d[i] + by) * 100) / 100, i); if (v === d[i]) return;
    const f = v / d[i]; setD(d.map((x, k) => (k === i ? v : lock ? Math.round(lim(x * f, k) * 100) / 100 : x)) as Dims);
  };
  const src = edited ? SRC.you : SRC[o.src];
  const hist = [...new Set([o.finish, ...o.history])].filter((f) => f !== finish);
  return (
    <Panel title={o.isNew ? 'Is this right?' : 'Edit object'} onClose={onCancel}
      foot={<><button className="btn btn-ghost" onClick={onCancel}>Cancel</button><Primary className="grow" disabled={!typeOk} onClick={() => onDone({ dims: d, type, name, finish, powered, history: finish !== o.finish ? [o.finish, ...o.history] : o.history, src: edited ? 'you' : o.src })}>{o.isNew ? 'Done, place it' : 'Done'}</Primary></>}>
      <div className="rowx g3"><div className="well-ic" style={{ width: 56, height: 56 }}><span className="t-title c3">{name[0]}</span></div>
        <div className="col grow"><input className="kbd t-head" value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" /><span className="t-cap rowx g1">{o.origin !== 'added' ? <Petal size={12} strong /> : null}{ORIGIN[o.origin]}</span></div></div>
      <div className="col g2"><div className="t-label rowx g2" style={{ fontWeight: 600 }}>What is this?{!typeOk ? <AiTag>Layo thinks: {o.type}. Tap to confirm</AiTag> : null}</div>
        <div className="hscroll">{[o.type, ...TYPES.filter((t) => t !== o.type)].map((t) => <button key={t} className={`chip chip-sm ${type === t && typeOk ? 'is-on' : ''}`} onClick={() => { setType(t); setTypeOk(true); }}>{t}</button>)}</div></div>
      <div className="col g2">
        <div className="rowx g2"><span className="t-label grow" style={{ fontWeight: 600 }}>Size, in cm</span><span className={`src ${src[1]}`}>{src[0]}</span></div>
        {(['Width', 'Height', 'Depth'] as const).map((lab, i) => (
          <div key={lab} className="rowx g3"><span className="t-label" style={{ width: 56 }}>{lab}</span>
            <div className="stepper grow"><button onClick={() => step(i, -0.05)} aria-label={`${lab} smaller`}>−</button><b>{Math.round(d[i] * 100)}</b><button onClick={() => step(i, 0.05)} aria-label={`${lab} bigger`}>+</button></div>
            <span className="t-cap mono" style={{ width: 64 }}>{o.src === 'room' ? 'found' : 'est.'} {Math.round(o.det[i] * 100)}</span></div>))}
        <div className="rowx g3"><button className="rowx g2" style={{ border: 0, background: 'none', cursor: 'pointer' }} onClick={() => setLock(!lock)}><span className={`check ${lock ? 'is-on' : ''}`}>{lock ? <Ic n="check" s="sm" /> : null}</span><span className="t-label">Keep proportions</span></button><span className="grow" />{edited ? <button className="btn-link" onClick={() => setD(o.det)}>Reset</button> : null}</div>
      </div>
      <div className="col g2"><AiTag>Change the finish with AI</AiTag>
        <div className="wrap">{FINISHES.map((f) => <button key={f} className={`chip chip-sm ${finish === f ? 'is-on' : 'is-ai'}`} onClick={() => setFinish(f)}>{f}</button>)}</div>
        <p className="t-cap">Now: {finish}</p>
        {hist.length ? <div className="col g1"><span className="t-cap" style={{ fontWeight: 600 }}>Earlier finishes</span><div className="wrap">{hist.map((f) => <button key={f} className="chip chip-sm" onClick={() => setFinish(f)}><Ic n="undo" s="sm" />{f}</button>)}</div></div> : null}</div>
      <details><summary className="t-label" style={{ cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}>Needs</summary>
        <button className="rowx g2" style={{ border: 0, background: 'none', cursor: 'pointer', minHeight: 44 }} onClick={() => setPowered(!powered)}><span className={`check ${powered ? 'is-on' : ''}`}>{powered ? <Ic n="check" s="sm" /> : null}</span><span className="t-label">Needs a plug</span></button>
        {partner ? <p className="t-cap">{o.link ? `Moves with the ${partner.toLowerCase()}.` : `Not linked to the ${partner.toLowerCase()}.`} Change it from the tap menu.</p> : null}</details>
      <button className="btn-link" style={{ alignSelf: 'flex-start' }} onClick={onFix}>Not right? This isn't a {o.type.toLowerCase()}</button>
    </Panel>);
};

const FixSheet: React.FC<{ fx?: Fixed; o?: Obj; onClose: () => void; onFixed: (p: Partial<Fixed>) => void; onObj: (p: Partial<Obj>) => void; onSize: () => void }> = ({ fx, o, onClose, onFixed, onObj, onSize }) => {
  const [type, setType] = useState(fx ? (fx.user ? '' : fx.name.includes('lug') ? 'Plug' : fx.name.includes('indow') ? 'Window' : fx.name.includes('oor') ? 'Door' : 'Light') : o?.type || '');
  const [label, setLabel] = useState(fx?.label || ''); const [movable, setMovable] = useState(!fx);
  if (!fx && !o) return null;
  return (
    <Sheet title={fx ? (fx.state === 'unsure' ? fx.unsure! : fx.user ? 'What did we miss?' : fx.name) : `${o!.name}: not right?`} onClose={onClose}
      foot={<Primary className="grow" disabled={!type} onClick={() => (fx ? onFixed({ state: 'ok', notPlug: type !== 'Plug', name: fx.user || (fx.id.startsWith('plug') && type !== 'Plug') ? type : fx.name, label: label || undefined }) : onObj({ type, kind: o!.kind }))}>{fx?.state === 'unsure' ? `Yes, it's a ${type.toLowerCase() || 'plug'}` : 'Done'}</Primary>}>
      {fx && !fx.user ? <AiTag>{fx.state === 'unsure' ? "Layo wasn't sure about this one" : 'Found by Layo in your scan'}</AiTag> : null}
      <div className="col g2"><div className="t-label" style={{ fontWeight: 600 }}>What is it?</div><div className="wrap">{(fx ? FIXED_TYPES : TYPES).map((t) => <button key={t} className={`chip chip-sm ${type === t ? 'is-on' : ''}`} onClick={() => setType(t)}>{t}</button>)}</div></div>
      {fx ? <div className="field"><label htmlFor="lab">Label (optional)</label><div className="input"><input id="lab" className="kbd" placeholder="Like 'Desk socket'" value={label} onChange={(e) => setLabel(e.target.value)} /></div></div>
        : <button className="rowx g2" style={{ border: 0, background: 'none', cursor: 'pointer', minHeight: 44 }} onClick={() => setMovable(!movable)}><span className={`check ${movable ? 'is-on' : ''}`}>{movable ? <Ic n="check" s="sm" /> : null}</span><span className="t-label">It can be moved</span></button>}
      <div className="wrap">
        <button className="chip" onClick={() => (fx ? onFixed({ state: 'gone' }) : onObj({ inRoom: false }))}><Ic n="trash" s="sm" />It isn't there</button>
        {o ? <button className="chip" onClick={onSize}>Wrong size</button> : null}
      </div>
      {fx?.id.startsWith('plug') ? <p className="t-cap">Plugs matter for anything that needs power. {PLUGS[fx.id] ? 'Layo checks the room again when you change this.' : ''}</p> : null}
    </Sheet>);
};
