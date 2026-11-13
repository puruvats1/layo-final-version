/* Home, Scan and the preferences (HM-01, CP-01, CP-02, PR-01 to PR-05). */
import React, { useEffect, useRef, useState } from 'react';
import { ACTIVITIES, PRESETS, PRIORITIES, START, type Prefs } from './room';
import { Stage } from './Stage';
import { AiTag, Dialog, Ic, Petal, Primary } from './ui';

const PANO = import.meta.env.BASE_URL + 'assets/reference_room_panorama.jpg';

export const Home: React.FC<{ projects: { name: string; layouts: number }[]; onScan: () => void; onOpen: () => void }> = ({ projects, onScan, onOpen }) => {
  const [note, setNote] = useState(false);
  return (
    <div className="page">
      <div className="rowx g2"><Petal size={28} /><span className="t-head">Layo</span></div>
      <h1 className="t-display" style={{ marginTop: 8 }}>{projects.length ? 'Your rooms' : 'Try a new layout before you lift anything.'}</h1>
      {!projects.length ? <p className="t-body c2">Scan your room once. Then move things around on your phone and see what works.</p> : null}
      <div className="col g3">
        {projects.map((p) => (
          <button key={p.name} className="card" onClick={onOpen} style={{ border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', overflow: 'hidden' }}>
            <div style={{ height: 150, background: `url(${PANO}) 30% 50% / cover` }} />
            <div className="rowx g3" style={{ padding: '14px 18px' }}>
              <div className="col grow"><span className="t-head">{p.name}</span><span className="t-cap">{p.layouts} layout{p.layouts > 1 ? 's' : ''} · opened today</span></div>
              <Ic n="right" />
            </div>
          </button>
        ))}
      </div>
      <div className="rowx g3">
        <button className="well grow" onClick={() => setNote(true)} style={{ border: 0, padding: 16, textAlign: 'left', cursor: 'pointer', opacity: 0.7 }}>
          <Ic n="image" /><div className="t-label" style={{ marginTop: 8 }}>One corner</div><div className="t-cap">A single photo. Coming later</div>
        </button>
      </div>
      {note ? <p className="t-cap" role="status">Zones aren't part of this version yet. Scan the whole room instead.</p> : null}
      <div className="foot"><Primary knob="scan" onClick={onScan} style={{ flex: 1 }}>Scan my room</Primary></div>
    </div>
  );
};

/* Scan (CP-01): a 360 capture. The viewport is the room, seen through the phone's motion sensor, or the phone's own camera. */
const BINS = 24; // the turn, in 15 degree steps
const NONE: never[] = [];
export const Scan: React.FC<{ onDone: () => void; onCancel: () => void }> = ({ onDone, onCancel }) => {
  const [state, setState] = useState<'tips' | 'ready' | 'sweeping' | 'done' | 'building'>('tips');
  const [source, setSource] = useState<'room' | 'camera'>('room');
  const [gyro, setGyro] = useState(false);
  const [sensor, setSensor] = useState<'unknown' | 'on' | 'off'>('unknown');
  const [grid, setGrid] = useState(false);
  const [tilt, setTilt] = useState(0); // degrees off level: above 0 the phone leans back
  const [heading, setHeading] = useState(0);
  const [covered, setCovered] = useState<boolean[]>(() => Array(BINS).fill(false));
  const [note, setNote] = useState('');
  const stateRef = useRef(state); stateRef.current = state;
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);

  // Where the phone is pointing. In the room it comes from the room view (the sensor or a drag); with the camera, from the sensor.
  const aim = (deg: number) => {
    const h = ((deg % 360) + 360) % 360; setHeading(h);
    if (stateRef.current !== 'sweeping') return;
    const mid = Math.round(h / (360 / BINS)) % BINS;
    setCovered((prev) => { if ([-1, 0, 1].every((o) => prev[(mid + o + BINS) % BINS])) return prev; const next = prev.slice(); [-1, 0, 1].forEach((o) => { next[(mid + o + BINS) % BINS] = true; }); return next; });
  };
  const count = covered.filter(Boolean).length, pct = Math.min(100, Math.round((count / BINS) * 100));
  useEffect(() => { if (state === 'sweeping' && count >= BINS - 1) setState('done'); }, [count, state]);

  // The motion sensor: how level the phone is, and the heading when the camera is the view
  useEffect(() => {
    let got = false;
    const on = (e: DeviceOrientationEvent) => {
      if (e.alpha == null || e.beta == null) return;
      got = true; setSensor('on'); setTilt(e.beta - 90);
      if (source === 'camera') aim(360 - e.alpha);
    };
    window.addEventListener('deviceorientation', on);
    const t = setTimeout(() => { if (!got) setSensor('off'); }, 1800);
    return () => { window.removeEventListener('deviceorientation', on); clearTimeout(t); };
  }, [source]);
  // The camera with no sensor: the turn is timed, as a stand-in
  useEffect(() => {
    if (state !== 'sweeping' || source !== 'camera' || sensor === 'on') return;
    let h = 0; const t = setInterval(() => { h += 6; aim(h); }, 120); return () => clearInterval(t);
  }, [state, source, sensor]);
  useEffect(() => { if (state === 'building') { const t = setTimeout(onDone, 1800); return () => clearTimeout(t); } }, [state]);

  const begin = async () => {
    const D = (window as any).DeviceOrientationEvent;
    try { if (D && typeof D.requestPermission === 'function') { if ((await D.requestPermission()) === 'granted') setGyro(true); } else if (D) setGyro(true); } catch { /* no sensor access */ }
    setState('ready');
  };
  const stopCamera = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; };
  const toggleCamera = async () => {
    if (source === 'camera') { stopCamera(); setSource('room'); setNote(''); return; }
    try { stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); setSource('camera'); setNote(''); }
    catch { setNote("The camera isn't available. Showing the sample room."); }
  };
  useEffect(() => { if (source === 'camera' && video.current && stream.current) video.current.srcObject = stream.current; }, [source]);
  useEffect(() => stopCamera, []);
  const reset = () => { setCovered(Array(BINS).fill(false)); setState('sweeping'); };

  const level = Math.abs(tilt) <= 8;
  return (
    <div className="page scan" style={{ background: '#0a0c10', color: 'var(--paper-50)', padding: 0 }}>
      {source === 'room'
        ? <Stage objs={START} boxIds={NONE} liftedIds={NONE} selected={NONE} was={NONE} ghosts={NONE} pins={NONE} palette="warm_studio" mode="look" start={[0, -4]} gyro={gyro} onGyroFail={() => { setGyro(false); setNote("Your phone's motion sensor isn't available. Drag to look around."); }} onAim={(lon) => aim(lon)} />
        : <video ref={video} className="scan-video" playsInline muted autoPlay aria-label="Your camera" />}
      {grid ? <div className="scan-grid" aria-hidden="true" /> : null}
      {state === 'building' ? <div className="scan-dim" /> : null}

      <div className="topbar">
        <button className="glass btn-icon" onClick={onCancel} aria-label="Cancel"><Ic n="close" /></button>
        {state === 'building' || state === 'tips' ? null : <div className="rowx" style={{ gap: 6 }}>
          <button className={`glass btn-icon ${grid ? 'is-on' : ''}`} onClick={() => setGrid(!grid)} aria-pressed={grid} aria-label="Grid"><Ic n="grid" /></button>
          <button className={`glass btn-icon ${source === 'camera' ? 'is-on' : ''}`} onClick={toggleCamera} aria-pressed={source === 'camera'} aria-label={source === 'camera' ? 'Show the sample room' : 'Use my camera'}><Ic n="camera" /></button>
        </div>}
      </div>

      {state === 'ready' || state === 'sweeping' ? <div className="glass scan-level" role="status" style={{ top: 68 }}><span className={`dot ${level ? 'ok' : ''}`} />{level ? 'Level' : tilt > 0 ? 'Tilt down' : 'Tilt up'}</div> : null}
      {note ? <div className="glass scan-level scan-note" role="status" style={{ top: 112 }}>{note}</div> : null}

      {state === 'tips' ? (
        <div className="card scan-tips pop" role="dialog" aria-label="Before you scan">
          <h1 className="t-head">Before you scan</h1>
          <p className="t-cap">A steady, slow turn gives Layo the best view of your room.</p>
          <ul className="col g3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {([['scan', 'Stand in the middle of your room.'], ['hand', 'Hold your phone steady, with both hands.'], ['rotate', 'Turn slowly, all the way round.'], ['eye', 'Turn the lights on.']] as const).map(([ic, t]) => (
              <li key={t} className="rowx g3"><span className="well-ic"><Ic n={ic} /></span><span className="t-body">{t}</span></li>))}
          </ul>
          <Primary onClick={begin}>Got it</Primary>
        </div>) : null}

      <div className="col g3" style={{ position: 'absolute', left: 20, right: 20, bottom: 36, alignItems: 'center', textAlign: 'center' }}>
        {state === 'building' ? (<><Petal size={56} style={{ animation: 'sweep 2.4s linear infinite' }} /><div className="t-title">Building your room</div><div className="t-body" style={{ opacity: 0.8 }}>Layo is finding the walls, the fixed things and your furniture.</div></>) : state === 'tips' ? null : (<>
          <div className="t-title scan-say">{state === 'ready' ? 'Stand in the middle of your room' : state === 'sweeping' ? 'Turn slowly, all the way round' : 'Got it'}</div>
          {state === 'done' ? <Primary knob="right" onClick={() => setState('building')} style={{ background: 'var(--paper-50)', color: 'var(--ink-900)' }}>Use this scan</Primary>
            : (<>
              <button className="shutter" onClick={state === 'ready' ? reset : undefined} aria-label={state === 'ready' ? 'Start the sweep' : `Sweeping, ${pct} percent`} disabled={state === 'sweeping'}>
                <svg viewBox="0 0 88 88" aria-hidden="true">
                  {covered.map((c, i) => <line key={i} x1="44" y1="4" x2="44" y2="11" transform={`rotate(${(i * 360) / BINS} 44 44)`} stroke={c ? 'var(--paper-50)' : 'rgba(251,247,241,.3)'} strokeWidth="3.5" strokeLinecap="round" />)}
                  {state === 'sweeping' ? <circle cx="44" cy="4" r="3" fill="var(--butter-300)" transform={`rotate(${heading} 44 44)`} /> : null}
                </svg>
                <span className="shutter-core" />
              </button>
              <span className="t-meta" style={{ color: 'var(--paper-50)', minHeight: 18 }}>{state === 'sweeping' ? `${pct}%` : ''}</span>
            </>)}
        </>)}
      </div>
    </div>
  );
};

/* ---------- pickers shared with Preferences in the editor (SE-02) ---------- */
export const ActivityPicker: React.FC<{ prefs: Prefs; set: (p: Prefs) => void }> = ({ prefs, set }) => {
  const [own, setOwn] = useState('');
  const all = [...ACTIVITIES, ...[...prefs.main, ...prefs.some].filter((a) => !ACTIVITIES.includes(a))];
  const cycle = (a: string) => {
    const main = prefs.main.filter((x) => x !== a), some = prefs.some.filter((x) => x !== a);
    if (prefs.main.includes(a)) some.push(a); else if (!prefs.some.includes(a)) (main.length < 3 ? main : some).push(a);
    set({ ...prefs, main, some });
  };
  const addOwn = () => {
    const t = own.trim(); if (!t) return;
    const words = /call|meeting|interview/i.test(t) && !prefs.words.includes('privacy') ? [...prefs.words, 'privacy'] : prefs.words;
    set({ ...prefs, some: [...prefs.some, t], words }); setOwn('');
  };
  return (
    <div className="col g3">
      <div className="wrap">
        {all.map((a) => (
          <button key={a} className={`bubble ${prefs.main.includes(a) ? 'is-main' : prefs.some.includes(a) ? 'is-some' : ''}`} onClick={() => cycle(a)} style={{ cursor: 'pointer', ...(prefs.main.includes(a) ? { background: 'var(--surface-inverse)', color: 'var(--text-inverse)' } : {}) }}>
            {a}{prefs.main.includes(a) ? <span className="t-cap" style={{ color: 'inherit', opacity: 0.7 }}>Main</span> : prefs.some.includes(a) ? <span className="t-cap">Sometimes</span> : null}
          </button>
        ))}
      </div>
      <p className="t-cap">Tap to change: Main, Sometimes, off. {prefs.main.length >= 3 ? 'Main is full at three.' : ''}</p>
      <div className="input"><input className="kbd" placeholder="Add your own, like 'I take calls here'" value={own} onChange={(e) => setOwn(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addOwn()} /><button className="btn-icon" onClick={addOwn} aria-label="Add"><Ic n="plus" /></button></div>
    </div>
  );
};
export const PriorityPicker: React.FC<{ prefs: Prefs; set: (p: Prefs) => void }> = ({ prefs, set }) => (
  <div className="col">
    {PRIORITIES.map(([name, line]) => {
      const rank = prefs.priorities.indexOf(name);
      const tap = () => set({ ...prefs, priorities: rank >= 0 ? prefs.priorities.filter((p) => p !== name) : prefs.priorities.length < 3 ? [...prefs.priorities, name] : prefs.priorities });
      return (
        <button key={name} className="row" onClick={tap} style={{ border: 0, borderTop: '1px solid var(--border-1)', background: 'none', textAlign: 'left', cursor: 'pointer', padding: '8px 0', opacity: rank < 0 && prefs.priorities.length >= 3 ? 0.45 : 1 }}>
          {rank >= 0 ? <span className="rank">{rank + 1}</span> : <span className="rank" style={{ background: 'var(--surface-sunken)' }} />}
          <span className="col grow"><span className="t-label" style={{ fontWeight: 600 }}>{name}</span>{rank >= 0 ? <span className="t-cap">{line}</span> : null}</span>
        </button>
      );
    })}
  </div>
);
export const WordsList: React.FC<{ prefs: Prefs; set: (p: Prefs) => void }> = ({ prefs, set }) => prefs.words.length ? (
  <div className="col g2">
    <AiTag>From what you wrote</AiTag>
    {prefs.words.map((w) => (
      <div key={w} className="chip is-ai" style={{ justifyContent: 'space-between', cursor: 'default' }}>
        <span>Keep the desk out of view from the door</span>
        <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => set({ ...prefs, words: prefs.words.filter((x) => x !== w) })} aria-label="Remove"><Ic n="close" s="sm" /></button>
      </div>
    ))}
  </div>
) : null;
export const RefPicker: React.FC<{ prefs: Prefs; set: (p: Prefs) => void }> = ({ prefs, set }) => {
  const [pin, setPin] = useState<string | null>(null);
  const toggle = (id: string) => set({ ...prefs, refs: prefs.refs.includes(id) ? prefs.refs.filter((r) => r !== id) : [...prefs.refs, id] });
  return (
    <div className="col g3">
      {prefs.refs.length ? (
        <div style={{ height: 120, position: 'relative' }} aria-label="Your references">
          {prefs.refs.map((r, i) => {
            const p = PRESETS.find((x) => x.id === r);
            return <div key={r} className="card" style={{ position: 'absolute', left: 16 + i * 46, top: 8 + (i % 2) * 8, width: 92, height: 100, borderRadius: 16, transform: `rotate(${(i - 1) * 5}deg)`, overflow: 'hidden', padding: 0 }}>
              {p ? <div className="swatch">{p.colors.map((c) => <i key={c} style={{ background: c }} />)}</div> : <div style={{ height: '100%', background: r === 'gallery' ? `url(${PANO}) 70% 50% / cover` : 'var(--rose-200)', display: 'grid', placeItems: 'center' }}>{r === 'gallery' ? null : <Ic n="pin" />}</div>}
            </div>;
          })}
        </div>
      ) : null}
      <div className="t-label c2">Presets: a ready-made look</div>
      <div className="hscroll">
        {PRESETS.map((p) => (
          <button key={p.id} className="tile" onClick={() => toggle(p.id)}>
            <div className={`pic ${prefs.refs.includes(p.id) ? 'sel-ring' : ''}`}><div className="swatch">{p.colors.map((c) => <i key={c} style={{ background: c }} />)}</div></div>{p.name}
          </button>
        ))}
      </div>
      <div className="rowx g2">
        <button className="btn btn-secondary grow" onClick={() => toggle('gallery')}><Ic n="image" />{prefs.refs.includes('gallery') ? 'Photo added' : 'From gallery'}</button>
        <button className="btn btn-secondary grow" onClick={() => setPin(pin === null ? '' : null)}><Ic n="pin" />Pinterest</button>
      </div>
      {pin !== null ? <div className="input"><input className="kbd" autoFocus placeholder="Paste a board link" value={pin} onChange={(e) => setPin(e.target.value)} /><button className="btn btn-secondary" style={{ minHeight: 36 }} disabled={!pin.trim()} onClick={() => { if (!prefs.refs.includes('pinterest')) toggle('pinterest'); setPin(null); }}>Add</button></div> : null}
    </div>
  );
};

export const PrefsFlow: React.FC<{ prefs: Prefs; set: (p: Prefs) => void; progress: number; onDone: () => void }> = ({ prefs, set, progress, onDone }) => {
  const [step, setStep] = useState(0);
  const [skipNote, setSkipNote] = useState(false);
  // The scan suggested two activities; the petal says so
  useEffect(() => { if (!prefs.main.length && !prefs.some.length) set({ ...prefs, main: ['Working or studying', 'Resting'] }); }, []);
  const titles = ['Name it, and show us what you like', 'What happens in this room?', 'What matters most?', 'Here is what we have'];
  const subs = ['References set the colours and materials Layo suggests. Skip and we pick a preset.', 'Layo sorted these from your scan. Change anything.', 'Pick up to three, in order. Layo only watches what you pick.', ''];
  const next = () => (step < 3 ? setStep(step + 1) : (set({ ...prefs, given: prefs.priorities.length + prefs.main.length + prefs.some.length > 0 }), onDone()));
  const preset = PRESETS.find((p) => p.id === prefs.preset)!;
  return (
    <div className="page">
      <div className="progress slim" aria-label="Building your room"><i style={{ width: `${progress}%`, background: 'var(--ai)' }} /></div>
      <div className="rowx g2" style={{ marginTop: -28 }}>
        {step > 0 ? <button className="btn-icon" onClick={() => setStep(step - 1)} aria-label="Back"><Ic n="back" /></button> : <span style={{ height: 44 }} />}
        <span className="grow" /><span className="dots">{[0, 1, 2, 3].map((i) => <i key={i} className={i === step ? 'is-on' : ''} />)}</span>
      </div>
      <h1 className="t-title">{titles[step]}</h1>
      {subs[step] ? <p className="t-body c2">{step === 1 ? <><Petal size={14} strong style={{ marginRight: 6, verticalAlign: -2 }} />{subs[1]}</> : subs[step]}</p> : null}
      {step === 0 ? (<>
        <div className="field"><label htmlFor="pname">Room name</label><div className="input"><input id="pname" className="kbd" value={prefs.name} onChange={(e) => set({ ...prefs, name: e.target.value })} /></div></div>
        <RefPicker prefs={prefs} set={set} />
      </>) : step === 1 ? <ActivityPicker prefs={prefs} set={set} /> : step === 2 ? <PriorityPicker prefs={prefs} set={set} /> : (
        <div className="col g3">
          <div className="well" style={{ padding: 16 }}><div className="t-cap">Look</div><div className="t-label">{prefs.refs.length ? `${prefs.refs.length} reference${prefs.refs.length > 1 ? 's' : ''}` : `${preset.name} preset (default)`}</div></div>
          <div className="well" style={{ padding: 16 }}><div className="t-cap">Activities</div><div className="t-label">{[...prefs.main.map((a) => a + ' (Main)'), ...prefs.some].join(' · ') || 'None picked'}</div></div>
          <div className="well" style={{ padding: 16 }}><div className="t-cap">Priorities</div><div className="t-label">{prefs.priorities.map((p, i) => `${i + 1}. ${p}`).join(' · ') || 'None picked. Layo will only tell you about room facts.'}</div></div>
          <WordsList prefs={prefs} set={set} />
          {progress < 100 ? <div className="rowx g2 t-label c2" role="status"><Petal size={18} style={{ animation: 'sweep 2.4s linear infinite' }} />Still building your room. Almost there.</div> : <div className="rowx g2 t-label" role="status"><Ic n="check" />Your room is ready.</div>}
        </div>
      )}
      <div className="foot">
        {step < 3 ? <button className="btn btn-ghost" onClick={() => (step === 0 && !prefs.refs.length ? setSkipNote(true) : next())}>Skip</button> : null}
        <Primary knob="right" style={{ flex: 1 }} disabled={step === 3 && progress < 100} onClick={next}>{step === 3 ? "See what we found" : 'Continue'}</Primary>
      </div>
      {skipNote ? (
        <Dialog title={`We'll start from ${preset.name}`} text="With no references, Layo takes colours and materials from this preset. You can add references any time in Preferences." onClose={() => setSkipNote(false)}>
          <Primary onClick={() => { setSkipNote(false); setStep(1); }}>Continue</Primary>
          <button className="btn btn-ghost" onClick={() => setSkipNote(false)}>Add references</button>
        </Dialog>
      ) : null}
    </div>
  );
};
