import React from 'react';
import ReactDOM from 'react-dom/client';
import { init, viewport } from '@telegram-apps/sdk';
import App from './App';
import './index.css';

// Инициализация моста с Telegram
try {
  init();
  if (viewport.mount.isAvailable()) {
    viewport.mount().then(() => {
      if (viewport.expand.isAvailable()) viewport.expand();
    });
  }
} catch (e) {
  console.error("TMA_INIT_ERROR:", e);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);