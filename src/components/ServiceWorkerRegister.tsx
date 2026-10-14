'use client';

import { useEffect } from 'react';

/**
 * Automatically registers the PWA Service Worker on page load
 * enabling offline support, caching, and standalone application installation.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            // Periodically check for service worker updates
            reg.onupdatefound = () => {
              const installing = reg.installing;
              if (installing) {
                installing.onstatechange = () => {
                  if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New version installed and ready for next reload.');
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW, { once: true });
      }
    }
  }, []);

  return null;
}
