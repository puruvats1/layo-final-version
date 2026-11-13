// The earlier prototype and its workbenches, kept at /old, /states, /break and /styleguide.
import {lazy, Suspense} from 'react';
import App from './App.tsx';
import './global.css';

const StatesPage = lazy(() => import('./states/top-bar/StatesPage'));
const BreakPage = lazy(() => import('./states/break-home/BreakPage'));
const StyleGuide = lazy(() => import('./styleguide/StyleGuide'));
const Screens = lazy(() => import('./styleguide/Screens'));

export default function Legacy() {
  const p = location.pathname;
  const Scratch = p.startsWith('/states/top-bar') ? StatesPage : p.startsWith('/break/home') ? BreakPage
    : p.startsWith('/styleguide/screens') ? Screens : p.startsWith('/styleguide') ? StyleGuide : null;
  return Scratch ? <Suspense fallback={null}><Scratch /></Suspense> : <App />;
}
