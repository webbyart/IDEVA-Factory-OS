import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global fetch interceptor to support external Express backends (e.g. Netlify -> Render / Cloud Run)
const originalFetch = window.fetch;
try {
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: async function (input: RequestInfo | URL, init?: RequestInit) {
      let url = typeof input === 'string' ? input : (input instanceof URL ? input.href : (input as Request).url);
      
      if (typeof url === 'string' && url.startsWith('/api/')) {
        const customApiBase = localStorage.getItem("FACTORY_API_URL") || ((import.meta as any).env?.VITE_API_URL || '');
        if (customApiBase) {
          const cleanBase = customApiBase.replace(/\/$/, "");
          url = `${cleanBase}${url}`;
        }
      }
      
      if (typeof input === 'string') {
        return originalFetch(url, init);
      } else {
        try {
          const newRequest = new Request(url, init || (input as Request));
          return originalFetch(newRequest);
        } catch (e) {
          return originalFetch(url, init);
        }
      }
    }
  });
} catch (err) {
  console.warn("[FETCH INTERCEPTOR WARNING] Could not modify window.fetch directly:", err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

