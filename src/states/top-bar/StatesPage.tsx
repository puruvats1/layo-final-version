/*
 * THROWAWAY state workbench for MobileTopBar (state-machine skill).
 * Open /states/top-bar. Remove by deleting src/states/ and the guard in src/main.tsx.
 */
import React, { useEffect, useState } from 'react';
import { MobileTopBar } from '../../editor/MobileTopBar';
import { SAMPLE_ROOM } from '../../data/onboardingData';

type Props = React.ComponentProps<typeof MobileTopBar>;

const noop = () => {};
const base: Props = {
  roomName: "Aarav's Room",
  isGhostStateActive: false,
  hasStagedWireframes: false,
  stagedCount: 0,
  isConfirmingGlow: false,
  isDetectionPhase: false,
  identificationStep: 'completed',
  onDiscardStaged: noop,
  onCommitGhostState: noop,
  onConfirmStagedWireframes: noop,
  onGoHome: noop,
  onOpenLayersList: noop,
  onOpenOptionsMenu: noop,
};

const GROUPS: { heading: string; states: { key: string; label: string; props: Partial<Props> }[] }[] = [
  {
    heading: 'Phase',
    states: [
      { key: 'detecting', label: 'Detecting (setup steps)', props: { isDetectionPhase: true, identificationStep: 'constraints' } },
      { key: 'idle', label: 'Idle', props: {} },
      { key: 'idle-long-name', label: 'Idle, long room name', props: { roomName: 'Aarav’s Room in the Koramangala flat 2' } },
    ],
  },
  {
    heading: 'Moves',
    states: [
      { key: 'one-move', label: 'One move waiting', props: { hasStagedWireframes: true, stagedCount: 1 } },
      { key: 'several-moves', label: 'Four moves waiting', props: { hasStagedWireframes: true, stagedCount: 4 } },
      { key: 'placing', label: 'Placing (after Confirm)', props: { hasStagedWireframes: true, stagedCount: 2, isConfirmingGlow: true } },
      { key: 'ghost-proposal', label: 'AI ghost proposal', props: { isGhostStateActive: true } },
    ],
  },
];
const ALL = GROUPS.flatMap((g) => g.states);

const readState = () => new URLSearchParams(location.search).get('__state') ?? ALL[0].key;

export default function StatesPage() {
  const [active, setActive] = useState(readState);
  const [hidden, setHidden] = useState(false);

  const go = (key: string) => {
    const url = new URL(location.href);
    url.searchParams.set('__state', key);
    history.replaceState(null, '', url);
    setActive(key);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable]')) return;
      const i = ALL.findIndex((s) => s.key === readState());
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(ALL[(i + 1) % ALL.length].key); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(ALL[(i - 1 + ALL.length) % ALL.length].key); }
      else if (e.key.toLowerCase() === 'h') setHidden((h) => !h);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.querySelector(`.state-switcher [data-state="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const state = ALL.find((s) => s.key === active) ?? ALL[0];
  const arrow = (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v4a3 3 0 0 0 3 3h7" /><path d="m10 7 3 3-3 3" /></svg>
  );

  return (
    <div style={{ height: '100dvh', width: '100%', overflowY: 'auto', background: '#e7e7e7' }}>
      <style>{CSS}</style>
      <div className="state-page">
        <div className="state-layout">
          <nav className="state-switcher" aria-label="States" style={hidden ? { display: 'none' } : undefined}>
            {GROUPS.map((g) => (
              <div key={g.heading} className="state-switcher-group" role="group" aria-labelledby={`states-${g.heading}`}>
                <span className="state-switcher-heading" id={`states-${g.heading}`}>{arrow}{g.heading}</span>
                {g.states.map((s) => (
                  <button key={s.key} type="button" data-state={s.key} aria-pressed={s.key === active} onClick={() => go(s.key)}>{s.label}</button>
                ))}
              </div>
            ))}
          </nav>

          <div className="state-switcher-select" style={hidden ? { display: 'none' } : undefined}>
            <select aria-label="State" value={active} onChange={(e) => go(e.target.value)}>
              {GROUPS.map((g) => (
                <optgroup key={g.heading} label={g.heading}>
                  {g.states.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </optgroup>
              ))}
            </select>
            <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
          </div>

          {/* Production width (375px phone), over the room the bar floats on */}
          <div className="state-stage">
            <div
              style={{
                position: 'relative', width: 375, height: 220, overflow: 'hidden', borderRadius: 12,
                backgroundImage: `url(${SAMPLE_ROOM.panoramaUrl})`, backgroundSize: 'auto 100%', backgroundPosition: '30% 50%',
              }}
            >
              <MobileTopBar {...base} {...state.props} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Switcher styles: deliberately outside the design system (see state-machine/switcher.md)
const CSS = `
.state-page { container: state-page / inline-size; padding: 24px; }
.state-layout { display: flex; flex-direction: column; gap: 16px; max-width: 375px; margin-inline: auto; }
.state-switcher { all: unset; display: none; flex-direction: column; gap: 16px; max-height: calc(100dvh - 48px); overflow-y: auto; scrollbar-width: none; padding: 6px; border-radius: 14px; background: rgb(20 20 20 / 0.92); box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1); font: 13px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; user-select: none; }
.state-switcher-group { display: flex; flex-direction: column; gap: 2px; }
.state-switcher-heading { display: flex; align-items: center; gap: 6px; padding: 4px 10px 6px; font-size: 11px; font-weight: 500; color: rgb(255 255 255 / 0.45); }
.state-switcher button { all: unset; flex: none; padding: 8px 10px; border-radius: 8px; font: inherit; color: rgb(255 255 255 / 0.6); cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 200ms ease-out; }
@media (hover: hover) and (pointer: fine) { .state-switcher button:hover { color: rgb(255 255 255 / 0.85); } }
.state-switcher button[aria-pressed="true"] { background: rgb(255 255 255 / 0.14); color: rgb(255 255 255); }
.state-switcher button:focus-visible { outline: 2px solid rgb(255 255 255 / 0.7); outline-offset: 2px; }
.state-switcher-select { position: relative; align-self: flex-start; max-width: 100%; color: rgb(255 255 255); }
.state-switcher-select select { all: unset; box-sizing: border-box; max-width: 100%; padding: 10px 36px 10px 16px; border-radius: 999px; background: rgb(20 20 20 / 0.92); box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1); font: 500 13px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; cursor: pointer; }
.state-switcher-select select:focus-visible { outline: 2px solid rgb(255 255 255 / 0.7); outline-offset: 2px; }
.state-switcher-select svg { position: absolute; top: 50%; right: 14px; translate: 0 -50%; pointer-events: none; color: rgb(255 255 255 / 0.6); }
/* 208px list + 24px gap + 375px component */
@container state-page (min-width: 607px) {
  .state-layout { display: grid; grid-template-columns: 208px 375px; justify-content: center; gap: 24px; align-items: start; max-width: none; }
  .state-switcher { display: flex; position: sticky; top: 24px; }
  .state-switcher-select { display: none; }
}
`;
