import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { I18nProvider } from './i18n';
import App from './App';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/offline-shell.js').catch(() => {});
  }, { once: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
