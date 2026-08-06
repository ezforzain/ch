import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { useToast } from '../context/ToastContext';
import { useAuth, ApiRequestError, redirectPathForRole } from '../context/AuthContext';
import AuthShell from '../components/auth/AuthShell';
import GoogleSignInButton, { isGoogleSignInConfigured } from '../components/auth/GoogleSignInButton';
import Bi from '../components/ui/Bi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS_REDIRECT_DELAY_MS = 650;

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

/**
 * Standalone, minimal login route — no full site chrome (Navbar/Footer) so the
 * form stays the sole focus, a common pattern for auth pages. Sign-in calls the
 * real backend (server/src/controllers/auth.controller.js). "Continue with Google" is
 * real too when VITE_GOOGLE_CLIENT_ID is configured (see GoogleSignInButton.jsx) — it
 * falls back to a "coming soon" placeholder when it isn't, rather than pretending to
 * work. "Create account" links to the real /register page.
 */
export default function Login() {
  const { lang } = useLang();
  const showToast = useToast();
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const redirectTimer = useRef(null);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  function fieldError(name, values) {
    if (name === 'identifier') {
      const id = values.identifier.trim();
      if (!id) return 'Enter your email or phone number.';
      if (id.includes('@')) return EMAIL_RE.test(id) ? '' : "That email address doesn't look right.";
      return id.replace(/\D/g, '').length < 7 ? 'Enter a valid phone number.' : '';
    }
    if (name === 'password') {
      if (!values.password) return 'Enter your password.';
      if (values.password.length < 6) return 'Password must be at least 6 characters.';
    }
    return '';
  }

  function validateAll(values) {
    const next = {
      identifier: fieldError('identifier', values),
      password: fieldError('password', values),
    };
    setErrors(next);
    return !next.identifier && !next.password;
  }

  function handleBlur(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: fieldError(name, { identifier, password }) }));
  }

  function handleChange(name, value) {
    if (name === 'identifier') setIdentifier(value);
    else setPassword(value);
    if (touched[name]) {
      const values = { identifier, password, [name]: value };
      setErrors((prev) => ({ ...prev, [name]: fieldError(name, values) }));
    }
    if (formError) setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || success) return;
    setTouched({ identifier: true, password: true });
    if (!validateAll({ identifier, password })) {
      showToast(lang === 'ur' ? 'براہ کرم درج شدہ خانوں کو درست کریں' : 'Please fix the highlighted fields');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const user = await login(identifier.trim(), password);
      setSuccess(true);
      showToast(lang === 'ur' ? 'خوش آمدید! سائن ان کامیاب رہا۔' : 'Welcome back — signed in successfully.');
      redirectTimer.current = setTimeout(() => {
        navigate(redirectPathForRole(user.role));
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch (err) {
      // Never surface raw fetch/CORS/network errors — only the friendly server
      // message (ApiRequestError) or a generic fallback ever reaches the user.
      const message =
        err instanceof ApiRequestError
          ? err.message
          : lang === 'ur'
            ? 'سرور سے رابطہ نہیں ہو سکا۔ دوبارہ کوشش کریں۔'
            : 'Could not reach the server. Please try again.';
      setFormError(message);
      showToast(message);
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(idToken) {
    if (submitting || success) return;
    setFormError('');
    setSubmitting(true);
    try {
      const user = await loginWithGoogle(idToken);
      setSuccess(true);
      showToast(lang === 'ur' ? 'خوش آمدید! سائن ان کامیاب رہا۔' : 'Welcome back — signed in successfully.');
      redirectTimer.current = setTimeout(() => {
        navigate(redirectPathForRole(user.role));
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : lang === 'ur'
            ? 'سرور سے رابطہ نہیں ہو سکا۔ دوبارہ کوشش کریں۔'
            : 'Could not reach the server. Please try again.';
      setFormError(message);
      showToast(message);
      setSubmitting(false);
    }
  }

  function comingSoon(en, ur) {
    showToast(lang === 'ur' ? ur : en);
  }

  const busy = submitting || success;

  return (
    <AuthShell variant="split">
      <div className="mb-6">
        <Bi
          as="h1"
          en="Welcome back"
          ur="خوش آمدید"
          className="text-[26px] font-[680] tracking-[-0.03em] text-ink dark:text-paper"
        />
        <Bi
          as="p"
          en="Sign in to access your account."
          ur="اپنے اکاؤنٹ تک رسائی کے لیے سائن ان کریں۔"
          className="mt-1.5 text-[14.5px] leading-[1.5] text-mut dark:text-[rgba(245,242,236,0.55)]"
        />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-id">
            <Bi en="Email address" ur="ای میل ایڈریس" />
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-mut dark:text-[rgba(245,242,236,0.4)]" />
            <Input
              id="login-id"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => handleChange('identifier', e.target.value)}
              onBlur={() => handleBlur('identifier')}
              placeholder="you@email.com"
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? 'login-id-error' : undefined}
              disabled={busy}
              className="pl-11"
            />
          </div>
          {errors.identifier && (
            <span id="login-id-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
              {errors.identifier}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="login-password">
              <Bi en="Password" ur="پاس ورڈ" />
            </Label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-[13px] font-semibold text-acc transition-opacity duration-200 hover:opacity-80 hover:underline"
            >
              <Bi en="Forgot password?" ur="پاس ورڈ بھول گئے؟" />
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-mut dark:text-[rgba(245,242,236,0.4)]" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              disabled={busy}
              className="pr-12 pl-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              tabIndex={busy ? -1 : 0}
              className="absolute top-1/2 right-1.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-mut transition-colors duration-200 hover:text-ink disabled:pointer-events-none dark:text-[rgba(245,242,236,0.5)] dark:hover:text-paper"
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>
          {errors.password && (
            <span id="login-password-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
              {errors.password}
            </span>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} disabled={busy} />
          <span className="text-[13.5px] font-medium text-ink dark:text-paper">
            <Bi en="Remember me" ur="یاد رکھیں" />
          </span>
        </label>

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-[14px] border border-[rgba(192,57,43,0.25)] bg-[rgba(192,57,43,0.08)] px-4 py-3 text-[13.5px] leading-[1.5] font-medium text-[#C0392B]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <Button type="submit" size="lg" disabled={busy} className="mt-1 w-full">
          {submitting ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
              <Bi en="Signing in…" ur="سائن ان ہو رہا ہے…" />
            </>
          ) : success ? (
            <>
              <Check className="h-[18px] w-[18px]" />
              <Bi en="Signed in" ur="سائن ان ہو گیا" />
            </>
          ) : (
            <Bi en="Sign in" ur="سائن ان" />
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line dark:bg-[rgba(245,242,236,0.14)]" />
        <span className="text-[11.5px] font-semibold tracking-[0.08em] text-mut uppercase dark:text-[rgba(245,242,236,0.4)]">
          <Bi en="or" ur="یا" />
        </span>
        <span className="h-px flex-1 bg-line dark:bg-[rgba(245,242,236,0.14)]" />
      </div>

      <div className="flex flex-col gap-3">
        {isGoogleSignInConfigured ? (
          <GoogleSignInButton onCredential={handleGoogleCredential} onError={setFormError} disabled={busy} />
        ) : (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={busy}
            onClick={() => comingSoon('Google sign-in — coming soon', 'گوگل سائن ان جلد آرہا ہے')}
          >
            <GoogleGlyph />
            <Bi en="Continue with Google" ur="گوگل سے جاری رکھیں" />
          </Button>
        )}
      </div>

      <p className="mt-7 text-center text-[14px] text-mut dark:text-[rgba(245,242,236,0.55)]">
        <Bi en="Don't have an account? " ur="اکاؤنٹ نہیں ہے؟ " />
        <Link to="/register" className="font-semibold text-acc hover:underline">
          <Bi en="Create account" ur="اکاؤنٹ بنائیں" />
        </Link>
      </p>

      {success && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-20 grid place-items-center rounded-[inherit] bg-[#FBFAF7]/95 backdrop-blur-sm dark:bg-[rgba(23,21,15,0.9)]"
        >
          <div className="animate-ce-pop flex flex-col items-center gap-3 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-acc/15 text-acc">
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </span>
            <Bi
              as="p"
              en="Signed in successfully"
              ur="کامیابی سے سائن ان ہو گیا"
              className="text-[15px] font-semibold text-ink dark:text-paper"
            />
          </div>
        </div>
      )}
    </AuthShell>
  );
}
