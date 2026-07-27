import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// ── Splash Screen Logic ──────────────────────────────────────────────────────
// Rules:
//  • First launch in a browser session  → show for at least 2000ms, then fade out
//  • Any subsequent reload/navigation   → hide instantly (no visible flash)
//
// "First launch" is tracked via sessionStorage so it resets when the tab closes
// but persists across in-app SPA navigations and soft refreshes within the same tab.

const SPLASH_KEY   = 'hm_splash_shown';
const MIN_DURATION = 2000; // ms — minimum splash display time on first load
const FADE_DURATION = 500;  // ms — CSS transition duration in index.html

const splash      = document.getElementById('hm-splash');
const isFirstLoad = !sessionStorage.getItem(SPLASH_KEY);

function hideSplash() {
  if (!splash) return;
  splash.classList.add('hm-hidden');
  setTimeout(() => splash.remove(), FADE_DURATION + 20);
}

if (!isFirstLoad) {
  // Not the first launch this session — remove the splash before React even mounts
  // so the user never sees any green flash on internal reloads.
  if (splash) splash.remove();
} else {
  // Mark as shown for the rest of this browser session
  sessionStorage.setItem(SPLASH_KEY, '1');
}

// ── Mount React ───────────────────────────────────────────────────────────────
const startTime = performance.now();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ── Dismiss Splash (first load only) ─────────────────────────────────────────
// After React's first paint (double-rAF), calculate how much of the 2s minimum
// has already elapsed and wait only the remaining time before fading out.
if (isFirstLoad && splash) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const elapsed   = performance.now() - startTime;
      const remaining = Math.max(0, MIN_DURATION - elapsed);
      setTimeout(hideSplash, remaining);
    });
  });
}
