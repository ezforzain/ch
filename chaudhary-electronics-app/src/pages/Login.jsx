import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Moon,
  PackageCheck,
  ShieldCheck,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { useToast } from '../context/ToastContext';
import { useAuth, ApiRequestError } from '../context/AuthContext';
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

/** Decorative brand-panel graphic — a power/energy glyph orbited by icon chips for
 * security, orders and the marketplace's buyer/seller community. Built from inline
 * SVG + lucide icons (the project ships no image assets) rather than a stock photo. */
function BrandIllustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto grid h-[220px] w-[220px] flex-shrink-0 place-items-center">
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.28),transparent_70%)] blur-2xl" />
      <span className="absolute inset-2 rounded-full border border-dashed border-[rgba(245,242,236,0.16)]" />
      <span className="grid h-24 w-24 place-items-center rounded-full border border-acc/30 bg-acc/15">
        <Zap className="h-9 w-9 text-acc" strokeWidth={1.75} />
      </span>
      <span className="animate-ce-float absolute top-1 left-2 grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(245,242,236,0.14)] bg-[rgba(245,242,236,0.06)] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]">
        <ShieldCheck className="h-5 w-5 text-paper/80" />
      </span>
      <span
        className="animate-ce-float absolute right-0 bottom-8 grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(245,242,236,0.14)] bg-[rgba(245,242,236,0.06)] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]"
        style={{ animationDelay: '1.2s' }}
      >
        <PackageCheck className="h-5 w-5 text-paper/80" />
      </span>
      <span
        className="animate-ce-float absolute bottom-0 left-8 grid h-10 w-10 place-items-center rounded-2xl border border-[rgba(245,242,236,0.14)] bg-[rgba(245,242,236,0.06)] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]"
        style={{ animationDelay: '2.4s' }}
      >
        <Users className="h-4 w-4 text-paper/80" />
      </span>
    </div>
  );
}

function GitHubGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .31.21.67.8.56A10.99 10.99 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function redirectPathForRole(role) {
  return ['admin', 'superadmin'].includes(role) ? '/admin' : '/';
}

/**
 * Standalone, minimal login route — no full site chrome (Navbar/Footer) so the
 * form stays the sole focus, a common pattern for auth pages. Sign-in calls the
 * real backend (server/src/controllers/auth.controller.js); Google/GitHub and
 * "Create account" stay "coming soon" placeholders — there's no OAuth app or
 * signup page wired up yet, so pretending they work would be dishonest.
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

  function comingSoon(en, ur) {
    showToast(lang === 'ur' ? ur : en);
  }

  const busy = submitting || success;

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-paper px-4 py-8 transition-colors duration-500 sm:px-6 lg:py-12 dark:bg-dark ${dark ? 'dark' : ''}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 dark:opacity-100"
      >
        <span className="animate-ce-drift-a absolute -top-[10%] -left-[10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.3),transparent_70%)] blur-3xl" />
        <span className="animate-ce-drift-b absolute top-[30%] -right-[14%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.16),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto mb-6 flex w-full max-w-[1040px] items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-mut transition-colors duration-200 hover:text-ink dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
        >
          <span aria-hidden="true">←</span>
          <Bi en="Back to home" ur="ہوم پیج پر واپس" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label="Switch language"
            className="rounded-full border border-line px-3 py-[7px] text-[12.5px] font-semibold text-mut transition-colors duration-200 hover:text-ink dark:border-[rgba(245,242,236,0.16)] dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
          >
            {lang === 'en' ? 'اردو' : 'EN'}
          </button>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={dark}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-line text-mut transition-colors duration-200 hover:text-ink dark:border-[rgba(245,242,236,0.16)] dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-line bg-[#FBFAF7] shadow-[0_30px_80px_-30px_rgba(23,21,15,0.35)] transition-colors duration-500 lg:grid-cols-[0.95fr_1.05fr] dark:border-[rgba(245,242,236,0.12)] dark:bg-[rgba(23,21,15,0.72)] dark:shadow-[0_30px_90px_-30px_rgba(0,0,0,0.75)] dark:backdrop-blur-xl">
        {/* Branding panel — full illustration on desktop, compact header on mobile */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-paper lg:flex">
          <span
            aria-hidden="true"
            className="animate-ce-drift-c absolute -top-[20%] -left-[20%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.2),transparent_70%)] blur-3xl"
          />
          <div className="relative z-10 flex items-center gap-3">
            <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-[14px] bg-acc text-[16px] font-semibold tracking-[-0.02em] text-ink">
              CE
            </span>
            <Bi
              as="span"
              en={'Chaudhary\nElectronics'}
              ur={'چوہدری\nالیکٹرانکس'}
              className="text-[15px] leading-[1.15] font-semibold whitespace-pre-line tracking-[-0.01em]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 py-6 text-center">
            <BrandIllustration />
            <div>
              <Bi
                as="h2"
                en="Your marketplace for solar, backup power & security."
                ur="سولر، بیک اپ پاور اور سیکیورٹی کی مارکیٹ پلیس۔"
                className="text-[22px] font-[650] tracking-[-0.02em] text-paper text-balance"
              />
              <Bi
                as="p"
                en="Sign in to track orders, manage your account and shop trusted products."
                ur="آرڈرز ٹریک کرنے، اکاؤنٹ منظم کرنے اور قابلِ اعتماد پروڈکٹس خریدنے کے لیے سائن ان کریں۔"
                className="mt-2 text-[14px] leading-[1.6] text-paper/60"
              />
            </div>
          </div>

          <ul className="relative z-10 flex flex-col gap-3">
            {[
              { en: 'Wide range of solar & backup power products', ur: 'سولر اور بیک اپ پاور پروڈکٹس کی وسیع رینج' },
              { en: 'Secure, encrypted account access', ur: 'محفوظ اور خفیہ کردہ اکاؤنٹ رسائی' },
              { en: 'Fast order tracking & real support', ur: 'تیز آرڈر ٹریکنگ اور حقیقی سپورٹ' },
            ].map((item) => (
              <li key={item.en} className="flex items-center gap-2.5 text-[13.5px] text-paper/75">
                <Check className="h-4 w-4 flex-shrink-0 text-acc" strokeWidth={2.75} />
                <Bi en={item.en} ur={item.ur} />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3 bg-ink px-6 py-7 text-paper lg:hidden">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[13px] bg-acc text-[15px] font-semibold tracking-[-0.02em] text-ink">
            CE
          </span>
          <div>
            <Bi as="p" en="Chaudhary Electronics" ur="چوہدری الیکٹرانکس" className="text-[15px] font-semibold" />
            <Bi
              as="p"
              en="Solar, backup power & security marketplace"
              ur="سولر، بیک اپ پاور اور سیکیورٹی مارکیٹ پلیس"
              className="text-[12.5px] text-paper/60"
            />
          </div>
        </div>

        {/* Form panel */}
        <div className="relative flex flex-col justify-center p-6 sm:p-10 lg:p-12">
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
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={busy}
              onClick={() => comingSoon('GitHub sign-in — coming soon', 'گٹ ہب سائن ان جلد آرہا ہے')}
            >
              <span className="text-ink dark:text-paper">
                <GitHubGlyph />
              </span>
              <Bi en="Continue with GitHub" ur="گٹ ہب سے جاری رکھیں" />
            </Button>
          </div>

          <p className="mt-7 text-center text-[14px] text-mut dark:text-[rgba(245,242,236,0.55)]">
            <Bi en="Don't have an account? " ur="اکاؤنٹ نہیں ہے؟ " />
            <button
              type="button"
              onClick={() => comingSoon('Account creation — coming soon', 'اکاؤنٹ بنانا جلد آرہا ہے')}
              className="font-semibold text-acc hover:underline"
            >
              <Bi en="Create account" ur="اکاؤنٹ بنائیں" />
            </button>
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
        </div>
      </div>
    </div>
  );
}
