# Finishing native Google Sign-In on Android

The app builds and runs without this — email/password login works fully, and the "Continue
with Google" button will show a friendly error if tapped before this is done. Do these steps in
the Firebase Console for the **same Firebase project** the web app already uses
(project ID: `chaudhary-electronic`) to make Google Sign-In work on Android too.

## 1. Register the Android app in Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → the
   `chaudhary-electronic` project → **Project settings** (gear icon) → **Your apps** → **Add app** → Android.
2. **Android package name**: `pk.chaudharyelectronics.app` (must match exactly).
3. **App nickname**: `Chaudhary Electronics` (anything you like — cosmetic only).
4. **Debug signing certificate SHA-1**: paste this — it's the SHA-1 of this project's release
   signing key (generated at `android/keystore/chaudhary-electronics-release.keystore`), which
   is what will actually sign the APK you install on your phone:

   ```
   41:C6:0A:3B:5C:88:75:31:CB:C5:52:1D:41:F1:7E:A7:1E:3E:C9:24
   ```

5. Click **Register app**, then **download `google-services.json`**.

## 2. Add the file to the project

Place the downloaded file at:

```
chaudhary-electronics-app/android/app/google-services.json
```

This file is gitignored on purpose (see `android/.gitignore`) — it's tied to this app's specific
signing key, so it isn't committed alongside the rest of the source.

## 3. Enable Google as a sign-in provider (if not already)

In the Firebase Console → **Authentication** → **Sign-in method** → make sure **Google** is
enabled. (It already must be, since Google Sign-In already works on the website — this step is
almost certainly already done.)

## 4. Rebuild

```bash
cd chaudhary-electronics-app
npm run android:sync
```

Then rebuild the APK the same way as before (see the main README). Capacitor's Android build
already conditionally applies the Google Services Gradle plugin whenever it finds
`google-services.json` — no other file needs to change.

## Why this is needed at all

A browser popup (`signInWithPopup`, what the website uses) can't work inside an Android WebView
— there's no separate window for Google's account picker to open in. Android needs Google's
*native* Sign-In sheet instead, which is what `@capacitor-firebase/authentication` (already
installed) drives once it has this config. It still ends by handing the exact same
Google-issued ID token to the exact same backend endpoint (`POST /auth/google`) the website
already uses — nothing about the backend or the account/session model changes.
