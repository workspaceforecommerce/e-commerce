import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// ── Dismiss splash screen after React has painted ────────────────────────────
function dismissSplash() {
  const splash = document.getElementById('hm-splash');
  if (!splash) return;
  // Small rAF delay ensures the first React paint is flushed before we fade out
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      splash.classList.add('hm-hidden');
      // Remove from DOM after transition completes (500ms)
      setTimeout(() => splash.remove(), 520);
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Dismiss after render
dismissSplash();
