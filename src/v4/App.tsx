/* Layo V4 prototype. Wizard of Oz: one scanned room, scripted AI, no backend.
   Home -> Scan -> Preferences -> Room edit -> Editor. */
import React, { useEffect, useState } from 'react';
import './kith-v4.css';
import './app.css';
import { DEFAULT_PREFS, type Prefs } from './room';
import { Home, Scan, PrefsFlow } from './Setup';
import { Editor } from './Editor';
import { brain } from './llm';

// ?llm=off runs on the scripted answers only
if (new URLSearchParams(location.search).get('llm') === 'off') brain.on = false;
// The published app has no model behind it: it runs on the scripted answers (add ?llm=on to look for one)
if (import.meta.env.PROD && new URLSearchParams(location.search).get('llm') !== 'on') brain.on = false;

const SAMPLE: Prefs = { ...DEFAULT_PREFS, name: "Aarav's room", given: true, refs: ['warm'], main: ['Working or studying', 'Resting'], some: ['Exercising'], priorities: ['Privacy', 'Natural light'] };

export default function App() {
  const q = new URLSearchParams(location.search), direct = q.get('screen') === 'editor', sample = q.has('sample') || direct; // starts empty. ?sample: the sample room and its preferences. ?screen=editor: straight in (with them)
  const [screen, setScreen] = useState<'home' | 'scan' | 'prefs' | 'editor'>(direct ? 'editor' : 'home');
  const [project, setProject] = useState<{ key: number; setup: boolean } | null>(sample ? { key: 0, setup: false } : null);
  const [opened, setOpened] = useState(direct);
  const [prefs, setPrefs] = useState<Prefs>(sample ? SAMPLE : DEFAULT_PREFS);
  const [layouts, setLayouts] = useState(1);
  const [progress, setProgress] = useState(100);
  // Processing carries on behind the preferences (DEC-006)
  useEffect(() => { if (progress >= 100) return; const t = setTimeout(() => setProgress((p) => Math.min(100, p + 4)), 500); return () => clearTimeout(t); }, [progress]);

  return (
    <div className="k4">
      {project && opened ? (
        <div style={{ display: screen === 'editor' ? 'block' : 'none' }}>
          <Editor key={project.key} prefs={prefs} setPrefs={setPrefs} setup={project.setup} onExit={() => setScreen('home')} onLayouts={setLayouts} />
        </div>
      ) : null}
      {screen === 'home' ? <Home projects={project && (opened || !project.setup) ? [{ name: prefs.name.trim() || 'Your room', layouts }] : []} onScan={() => setScreen('scan')} onOpen={() => { setOpened(true); setScreen('editor'); }} /> : null}
      {screen === 'scan' ? <Scan onCancel={() => setScreen('home')} onDone={() => { setPrefs(DEFAULT_PREFS); setProgress(8); setOpened(false); setLayouts(1); setProject({ key: Date.now(), setup: true }); setScreen('prefs'); }} /> : null}
      {screen === 'prefs' ? <PrefsFlow prefs={prefs} set={setPrefs} progress={progress} onDone={() => { setOpened(true); setScreen('editor'); }} /> : null}
    </div>
  );
}
