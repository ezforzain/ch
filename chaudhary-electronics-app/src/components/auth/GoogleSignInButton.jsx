import { useEffect, useRef, useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/** Whether a real Google OAuth Client ID is configured — Login.jsx uses this to decide
 * between rendering the real button below or falling back to a "coming soon" placeholder. */
export const isGoogleSignInConfigured = Boolean(GOOGLE_CLIENT_ID);

let scriptPromise = null;
/** Loads Google Identity Services once and shares the same promise across every mount
 * (e.g. Login and Register both rendering this component) instead of injecting the
 * script tag more than once. */
function loadGoogleScript() {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) return resolve();
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Renders Google's own "Sign in with Google" button (via Google Identity Services) rather
 * than a custom-styled lookalike — GSI only hands back a usable credential through its own
 * rendered button/prompt, and Google's branding terms don't allow a fully custom reskin
 * anyway. Themed (outline/pill/large) to sit as close to the site's own button style as
 * Google allows. Renders nothing if VITE_GOOGLE_CLIENT_ID isn't set.
 *
 * `onCredential(idToken)` receives Google's signed ID token — hand it to
 * `useAuth().loginWithGoogle()`, which POSTs it to the real backend for verification.
 */
export default function GoogleSignInButton({ onCredential, onError, disabled }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        });
        setReady(true);
      })
      .catch(() => onError?.('Could not load Google sign-in. Please check your connection and try again.'));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'left',
      width: containerRef.current.offsetWidth || 320,
    });
  }, [ready]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div
      ref={containerRef}
      aria-disabled={disabled || undefined}
      className={`flex w-full justify-center [&>div]:w-full ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    />
  );
}
