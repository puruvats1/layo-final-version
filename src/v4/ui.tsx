/* Small shared pieces for the V4 prototype: icons, the AI's petal, sheets, dialogs. */
import React, { useEffect, useRef, useState } from 'react';

const PATHS: Record<string, string> = {
  back: 'M15 5l-7 7 7 7', down: 'M6 9l6 6 6-6', check: 'm5 12.5 4.5 4.5L19 7.5', close: 'M6 6l12 12M18 6 6 18',
  undo: 'M9 7 4 12l5 5M4 12h10a6 6 0 0 1 0 12h-1', redo: 'm15 7 5 5-5 5M20 12H10a6 6 0 0 0 0 12h1',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', more: 'M5 12h.01M12 12h.01M19 12h.01',
  plus: 'M12 5v14M5 12h14', send: 'M12 19V5M6 11l6-6 6 6', rotate: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', edit: 'M4 20h4L19 9l-4-4L4 16v4ZM13 7l4 4', link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4V8ZM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', image: 'M4 5h16v14H4V5ZM4 16l5-5 4 4 3-3 4 4M15 9h.01',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01', share: 'M12 15V4M8 8l4-4 4 4M5 13v6h14v-6', scan: 'M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M4 12h16',
  right: 'M5 12h14M13 6l6 6-6 6', hand: 'M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4.6 15a1.5 1.5 0 0 1 2.4-1.8L9 15',
  grid: 'M4 4h7v7H4V4ZM13 4h7v7h-7V4ZM4 13h7v7H4v-7ZM13 13h7v7h-7v-7Z', checks: 'M4 6h16M4 12h10M4 18h7M17 16l2 2 3-4', broom: 'M14 4l6 6M4 20l6-2 8-8-4-4-8 8-2 6Z',
  room: 'M4 20V8l8-4 8 4v12H4ZM10 20v-6h4v6', sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 5v4M8 15v4', layers: 'M12 4 3 9l9 5 9-5-9-5ZM3 14l9 5 9-5', unlink: 'M9 15l6-6M7 12l-2 2a3.5 3.5 0 0 0 5 5l2-2M17 12l2-2a3.5 3.5 0 0 0-5-5l-2 2M4 4l16 16',
  minus: 'M5 12h14', mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21', clip: 'M9 4h6v3H9V4ZM9 5.5H6v15h12v-15h-3M9.5 14l2 2 3.5-4', floppy: 'M5 4h11l3 3v13H5V4ZM8 4v5h7V4M8 20v-6h8v6',
  gyro: 'M12 4c2.2 0 3.5 3.6 3.5 8s-1.3 8-3.5 8-3.5-3.6-3.5-8S9.8 4 12 4ZM3 12c0-1.8 4-3 9-3s9 1.2 9 3-4 3-9 3-9-1.2-9-3Z',
  save: 'M6 4h12v16l-6-4.5L6 20V4Z', box: 'M12 3 4 7v10l8 4 8-4V7l-8-4ZM4 7l8 4 8-4M12 11v10',
  chat: 'M5 5h14v10H10l-5 4V5Z', pin: 'M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11ZM12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
};
export const Ic: React.FC<{ n: keyof typeof PATHS | string; s?: 'sm' | 'lg'; style?: React.CSSProperties }> = ({ n, s, style }) => (
  <svg className={`ic ${s ? 'ic-' + s : ''}`} viewBox="0 0 24 24" aria-hidden="true" style={style}><path d={PATHS[n] || PATHS.more} /></svg>
);

/** A label that never overflows its tab: when it does not fit, it is clipped and drifts slowly left and right so all of it can be read. */
export const Marquee: React.FC<{ children: string }> = ({ children }) => {
  const box = useRef<HTMLSpanElement>(null), inner = useRef<HTMLSpanElement>(null);
  const [d, setD] = useState(0);
  useEffect(() => {
    const b = box.current, i = inner.current; if (!b || !i) return;
    const measure = () => setD(b.clientWidth > 0 ? Math.max(0, Math.ceil(i.scrollWidth - b.clientWidth)) : 0);
    measure(); const ro = new ResizeObserver(measure); ro.observe(b); return () => ro.disconnect();
  }, [children]);
  return <span ref={box} className="mq"><span ref={inner} className={`mq-in ${d ? 'is-run' : ''}`} style={d ? ({ '--d': `${d}px`, animationDuration: `${Math.max(5, d / 9)}s` } as React.CSSProperties) : undefined}>{children}</span></span>;
};

/** The AI's mark. Anything the AI found, said or proposed carries it. */
export const Petal: React.FC<{ size?: number; strong?: boolean; style?: React.CSSProperties }> = ({ size = 18, strong, style }) => (
  <span className="pet" aria-hidden="true" style={{ width: size, height: size, background: strong ? 'var(--ai-strong)' : 'var(--ai)', ...style }} />
);
/** The AI's button icon: the petal with a spark cut out of it. Used where the AI is something you press. */
export const AiIcon: React.FC<{ size?: number }> = ({ size = 24 }) => <span className="ai-ic" aria-hidden="true" style={{ width: size, height: size }} />;
/** A check marker on an object: the petal, with a count, and a dot when a room fact is involved. */
export const PetMark: React.FC<{ n?: number; fact?: boolean; size?: number }> = ({ n, fact, size = 30 }) => (
  <span className="pet-wrap" style={{ width: size, height: size }}>
    <Petal size={size} />
    {n && n > 1 ? <b>{n}</b> : null}
    {fact ? <i /> : null}
  </span>
);
export const AiTag: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="ai-tag"><Petal size={14} strong />{children}</span>;

/** Every AI card in the editor: header (who and what), title (the claim), body (the reason), children (options), foot (actions). */
export const AiCard: React.FC<{ tag: string; obj?: string; end?: React.ReactNode; title?: React.ReactNode; body?: React.ReactNode; children?: React.ReactNode; foot?: React.ReactNode }> = ({ tag, obj, end, title, body, children, foot }) => (
  <div className="card aic pop">
    <div className="aic-h"><AiTag>{tag}</AiTag>{obj ? <span className="aic-o"><Marquee>{obj}</Marquee></span> : null}<span className="grow" />{end}</div>
    {title ? <div className="aic-t">{title}</div> : null}
    {body ? <p className="aic-b">{body}</p> : null}
    {children}
    {foot ? <div className="aic-f">{foot}</div> : null}
  </div>
);

export const Sheet: React.FC<{ title?: string; onClose: () => void; children: React.ReactNode; foot?: React.ReactNode; back?: () => void; tall?: boolean }> = ({ title, onClose, children, foot, back, tall }) => (
  <>
    <div className="scrimx" onClick={onClose} />
    <div className="sheet" role="dialog" aria-label={title} style={tall ? { height: '86%' } : undefined}>
      <span className="handle" />
      <div className="rowx g2" style={{ padding: '8px 12px 0 12px', minHeight: 52 }}>
        {back ? <button className="btn-icon" onClick={back} aria-label="Back"><Ic n="back" /></button> : <span style={{ width: 8 }} />}
        <h2 className="t-head grow">{title}</h2>
        <button className="btn-icon" onClick={onClose} aria-label="Close"><Ic n="close" /></button>
      </div>
      <div className="body grow">{children}</div>
      {foot ? <div className="rowx g2" style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--border-1)' }}>{foot}</div> : null}
    </div>
  </>
);
/** A floating panel in the middle of the screen, for things you edit (the object's name, type, size and finish). */
export const Panel: React.FC<{ title?: string; onClose: () => void; children: React.ReactNode; foot?: React.ReactNode }> = ({ title, onClose, children, foot }) => (
  <>
    <div className="scrimx" onClick={onClose} />
    <div className="panel card" role="dialog" aria-label={title}>
      <div className="rowx g2 panel-h"><h2 className="t-head grow">{title}</h2><button className="btn-icon" onClick={onClose} aria-label="Close"><Ic n="close" /></button></div>
      <div className="body grow">{children}</div>
      {foot ? <div className="rowx g2 panel-f">{foot}</div> : null}
    </div>
  </>
);
export const Dialog: React.FC<{ title: string; text?: string; children: React.ReactNode; onClose: () => void }> = ({ title, text, children, onClose }) => (
  <>
    <div className="scrimx" style={{ zIndex: 49 }} onClick={onClose} />
    <div className="dialog card" role="alertdialog" aria-label={title}>
      <h2 className="t-head">{title}</h2>
      {text ? <p className="t-body c2">{text}</p> : null}
      <div className="col g2" style={{ marginTop: 8 }}>{children}</div>
    </div>
  </>
);
/** The main button. It has no round knob on its left: that reads as something to swipe. (`knob` is accepted and ignored.) */
export const Primary: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { knob?: string }> = ({ knob: _knob, children, className, ...p }) => (
  <button className={`btn btn-primary no-knob ${className || ''}`} {...p}>{children}</button>
);
