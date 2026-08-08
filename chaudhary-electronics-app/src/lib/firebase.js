import { initializeApp, getApps } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from 'firebase/auth';

// Firebase's web config (apiKey/authDomain/etc.) is not a secret — it's meant to ship inside
// the client bundle, the same way VITE_API_URL already does. Real access
// control lives in Firebase's own console settings (which providers are enabled, authorized
// domains) and, downstream, in the backend's own verification — see signInWithGooglePopup().
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** Whether Firebase is actually set up — GoogleSignInButton.jsx uses this to fall back to a
 * "coming soon" placeholder instead of crashing when these env vars are left blank (the
 * default, since it requires the operator's own Firebase project). */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

let auth = null;
let googleProvider = null;
if (isFirebaseConfigured) {
  const app = getApps()[0] || initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

/**
 * Opens the Google account picker via Firebase Authentication and returns the Google-issued
 * ID token — NOT a Firebase ID token. The backend's POST /auth/google (see
 * server/src/controllers/auth.controller.js) already verifies a real Google ID token with
 * google-auth-library and issues this app's own session (JWT + httpOnly refresh cookie, same
 * as email/password login); Firebase here is purely the popup/consent-screen mechanism for
 * getting that token, not a second identity or session system.
 *
 * Firebase's own local session is intentionally discarded right after — the app's real
 * session is the backend-issued one (see AuthContext.jsx), so leaving Firebase "signed in"
 * too would just be a second, unused, easily-out-of-sync copy of "logged in" sitting in the
 * browser for no reason.
 */
export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  await signOut(auth).catch(() => {});
  if (!credential?.idToken) {
    throw new Error('missing-id-token');
  }
  return credential.idToken;
}
