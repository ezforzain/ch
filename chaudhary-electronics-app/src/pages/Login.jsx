import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Moon, Sun } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { useToast } from '../context/ToastContext';
import { useAuth, ApiRequestError } from '../context/AuthContext';
import Bi from '../components/ui/Bi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function FacebookGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.07C24 5.66 18.63.4 12 .4S0 5.66 0 12.07c0 5.79 4.39 10.59 10.13 11.46v-8.11H7.08v-3.35h3.05V9.41c0-3 1.83-4.66 4.6-4.66 1.33 0 2.72.24 2.72.24v2.94H15.9c-1.5 0-1.97.92-1.97 1.87v2.24h3.36l-.54 3.35h-2.82v8.11C19.61 22.66 24 17.86 24 12.07z" />
    </svg>
  );
}

/**
 * Standalone, minimal login route — no full site chrome (Navbar/Footer) so the
 * form stays the sole focus, a common pattern for auth pages. Sign-in and
 * "forgot password" call the real backend (server/src/controllers/auth.controller.js).
 * Google/Facebook/Create-account stay as "coming soon" placeholders — there's no
 * OAuth app or signup page wired up yet, so pretending they work would be dishonest.
 */
export default function Login() {
  const { lang, toggleLang } = useLang();
  const showToast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [dark, setDark] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    const id = identifier.trim();
    if (!id) {
      next.identifier = 'Enter your email or phone number.';
    } else if (id.includes('@')) {
      if (!EMAIL_RE.test(id)) next.identifier = "That email address doesn't look right.";
    } else if (id.replace(/\D/g, '').length < 7) {
      next.identifier = 'Enter a valid phone number.';
    }
    if (!password) next.password = 'Enter your password.';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) {
      showToast(lang === 'ur' ? 'براہ کرم درج شدہ خانوں کو درست کریں' : 'Please fix the highlighted fields');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(identifier.trim(), password);
      showToast(lang === 'ur' ? 'خوش آمدید! سائن ان کامیاب رہا۔' : 'Welcome back — signed in successfully.');
      navigate(['admin', 'superadmin'].includes(user.role) ? '/admin' : '/');
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : lang === 'ur'
            ? 'سرور سے رابطہ نہیں ہو سکا۔ دوبارہ کوشش کریں۔'
            : 'Could not reach the server. Please try again.';
      setErrors({ password: message });
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  }

  function comingSoon(en, ur) {
    showToast(lang === 'ur' ? ur : en);
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-5 py-12 transition-colors duration-500 dark:bg-dark ${dark ? 'dark' : ''}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 dark:opacity-100"
      >
        <span className="animate-ce-drift-a absolute -top-[10%] -left-[10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.3),transparent_70%)] blur-3xl" />
        <span className="animate-ce-drift-b absolute top-[30%] -right-[14%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.16),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mb-7 flex w-full max-w-[420px] items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-mut transition-colors hover:text-ink dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
        >
          <span aria-hidden="true">←</span>
          <Bi en="Back to home" ur="ہوم پیج پر واپس" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label="Switch language"
            className="rounded-full border border-line px-3 py-[7px] text-[12.5px] font-semibold text-mut transition-colors hover:text-ink dark:border-[rgba(245,242,236,0.16)] dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
          >
            {lang === 'en' ? 'اردو' : 'EN'}
          </button>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={dark}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-line text-mut transition-colors hover:text-ink dark:border-[rgba(245,242,236,0.16)] dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[420px] rounded-[28px] border border-line bg-[#FBFAF7] p-8 shadow-[0_30px_80px_-30px_rgba(23,21,15,0.35)] transition-colors duration-500 dark:border-[rgba(245,242,236,0.12)] dark:bg-[rgba(23,21,15,0.72)] dark:shadow-[0_30px_90px_-30px_rgba(0,0,0,0.75)] dark:backdrop-blur-xl">
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          <span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-[16px] bg-ink text-[19px] font-semibold tracking-[-0.02em] text-paper dark:bg-acc dark:text-ink">
            CE
          </span>
          <div>
            <Bi
              as="h1"
              en="Welcome back"
              ur="خوش آمدید"
              className="text-[26px] font-[680] tracking-[-0.03em] text-ink dark:text-paper"
            />
            <Bi
              as="p"
              en="Sign in to manage your orders and saved products."
              ur="اپنے آرڈرز اور محفوظ پروڈکٹس دیکھنے کے لیے سائن ان کریں۔"
              className="mt-1.5 text-[14.5px] leading-[1.5] text-mut dark:text-[rgba(245,242,236,0.55)]"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="login-id">
              <Bi en="Email or phone number" ur="ای میل یا فون نمبر" />
            </Label>
            <Input
              id="login-id"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@email.com"
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? 'login-id-error' : undefined}
            />
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
                className="text-[13px] font-semibold text-acc hover:underline"
              >
                <Bi en="Forgot password?" ur="پاس ورڈ بھول گئے؟" />
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute top-1/2 right-1.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-mut transition-colors hover:text-ink dark:text-[rgba(245,242,236,0.5)] dark:hover:text-paper"
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
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
            <span className="text-[13.5px] font-medium text-ink dark:text-paper">
              <Bi en="Remember me" ur="یاد رکھیں" />
            </span>
          </label>

          <Button type="submit" size="lg" disabled={submitting} className="mt-1 w-full">
            {submitting ? (
              <>
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
                <Bi en="Signing in…" ur="سائن ان ہو رہا ہے…" />
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
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => comingSoon('Google sign-in — coming soon', 'گوگل سائن ان جلد آرہا ہے')}
          >
            <GoogleGlyph />
            <Bi en="Continue with Google" ur="گوگل سے جاری رکھیں" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => comingSoon('Facebook sign-in — coming soon', 'فیس بک سائن ان جلد آرہا ہے')}
          >
            <FacebookGlyph />
            <Bi en="Continue with Facebook" ur="فیس بک سے جاری رکھیں" />
          </Button>
        </div>

        <p className="mt-7 text-center text-[14px] text-mut dark:text-[rgba(245,242,236,0.55)]">
          <Bi en="New to Chaudhary Electronics? " ur="نئے صارف ہیں؟ " />
          <button
            type="button"
            onClick={() => comingSoon('Account creation — coming soon', 'اکاؤنٹ بنانا جلد آرہا ہے')}
            className="font-semibold text-acc hover:underline"
          >
            <Bi en="Create account" ur="اکاؤنٹ بنائیں" />
          </button>
        </p>
      </div>
    </div>
  );
}
