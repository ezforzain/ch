import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

/** Android hardware back button — web-only builds never mount this (Capacitor.isNativePlatform()
 * is false there), so browser back behavior is untouched. On Android, `canGoBack` comes straight
 * from the WebView's own back/forward history, so this defers to the exact same navigation stack
 * React Router already maintains — no separate back-stack to keep in sync. Only exits the app once
 * that history is genuinely empty (e.g. sitting on the first screen after a fresh launch). */
export default function AndroidBackButton() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    const listenerPromise = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, []);

  return null;
}
