import {StrictMode, lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';

// The V4 prototype is the app. The earlier prototype stays reachable at /old.
const legacy = /^\/(old|states|break|styleguide)/.test(location.pathname);
const Root = legacy ? lazy(() => import('./legacy')) : lazy(() => import('./v4/App'));

// Installable: a service worker lets the app open from the home screen and work offline
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => { navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => { /* the app works without it */ }); });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}><Root /></Suspense>
  </StrictMode>,
);
