import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { isFirebaseConfigured, signInWithGooglePopup } from '../../lib/firebase';
import { Button } from '../ui/button';
import Bi from '../ui/Bi';

/** Whether Google sign-in is actually usable — Login.jsx uses this to decide between
 * rendering this button or a "coming soon" placeholder. */
export const isGoogleSignInConfigured = isFirebaseConfigured;

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18A13.86 13.86 0 0 1 10.94 24c0-1.45.25-2.86.7-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.9 2.34 9.88z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

// Firebase's raw error codes ("auth/popup-closed-by-user") are never shown to the user — the
// two codes here fire when the user closes/interrupts the popup themselves, which isn't a
// real error (they didn't do anything wrong), so those produce no message at all rather than
// an alarming one.
const SILENT_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

function friendlyGoogleError(err) {
  if (SILENT_CODES.has(err?.code)) return null;
  if (err?.code === 'auth/popup-blocked') {
    return 'Your browser blocked the Google sign-in popup — please allow popups for this site and try again.';
  }
  if (err?.code === 'auth/network-request-failed') {
    return 'Could not reach Google. Check your connection and try again.';
  }
  return 'Could not sign in with Google. Please try again.';
}

/**
 * "Continue with Google" button backed by Firebase Authentication (see src/lib/firebase.js) —
 * opens the Google account picker in a popup, then hands the resulting Google ID token to
 * `onCredential`, exactly like the old Google-Identity-Services version did. Login.jsx's
 * handling of that token (POST to the real backend, session, redirect) is unchanged.
 *
 * Styled as a plain Button (not Google's own rendered widget, which Firebase's popup flow
 * doesn't require) so it's visually identical to the "coming soon" placeholder Login.jsx
 * falls back to when this isn't configured — configuring Firebase doesn't change how the
 * page looks, only whether the button actually works.
 */
export default function GoogleSignInButton({ onCredential, onError, disabled }) {
  const [signingIn, setSigningIn] = useState(false);

  if (!isFirebaseConfigured) return null;

  async function handleClick() {
    if (signingIn || disabled) return; // belt-and-suspenders against double-clicks/concurrent popups
    setSigningIn(true);
    try {
      const idToken = await signInWithGooglePopup();
      onCredential(idToken);
    } catch (err) {
      const message = friendlyGoogleError(err);
      if (message) onError?.(message);
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="lg" className="w-full" disabled={disabled || signingIn} onClick={handleClick}>
      {signingIn ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <GoogleGlyph />}
      <Bi en={signingIn ? 'Signing in…' : 'Continue with Google'} ur={signingIn ? 'سائن ان ہو رہا ہے…' : 'گوگل سے جاری رکھیں'} />
    </Button>
  );
}
