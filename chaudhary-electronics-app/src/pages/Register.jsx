import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { useToast } from '../context/ToastContext';
import { useAuth, ApiRequestError, redirectPathForRole } from '../context/AuthContext';
import AuthShell from '../components/auth/AuthShell';
import Bi from '../components/ui/Bi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS_REDIRECT_DELAY_MS = 650;
const TOTAL_STEPS = 3;

const STEPS = [
  { n: 1, en: 'Account type', ur: 'اکاؤنٹ کی قسم' },
  { n: 2, en: 'Your details', ur: 'آپ کی تفصیلات' },
  { n: 3, en: 'Security', ur: 'سیکیورٹی' },
];

function fieldError(name, values) {
  switch (name) {
    case 'name': {
      const v = values.name.trim();
      if (!v) return 'Enter your full name.';
      return v.length > 80 ? 'Name must be 80 characters or fewer.' : '';
    }
    case 'email': {
      const v = values.email.trim();
      if (!v) return 'Enter your email address.';
      return EMAIL_RE.test(v) ? '' : "That email address doesn't look right.";
    }
    case 'phone': {
      const v = values.phone.trim();
      if (!v) return '';
      return v.replace(/\D/g, '').length < 7 ? 'Enter a valid phone number.' : '';
    }
    case 'businessName': {
      if (values.role !== 'seller') return '';
      return values.businessName.trim() ? '' : 'Business name is required for seller accounts.';
    }
    case 'password': {
      if (!values.password) return 'Create a password.';
      return values.password.length < 6 ? 'Password must be at least 6 characters.' : '';
    }
    case 'confirmPassword': {
      if (!values.confirmPassword) return 'Confirm your password.';
      return values.confirmPassword === values.password ? '' : 'Passwords do not match.';
    }
    default:
      return '';
  }
}

function StepIndicator({ step }) {
  return (
    <div className="mb-7 flex items-center" aria-hidden="true">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-[13px] font-semibold transition-colors duration-300 ${
                step > s.n
                  ? 'bg-acc text-ink'
                  : step === s.n
                    ? 'border-2 border-acc text-acc'
                    : 'border border-line text-mut dark:border-[rgba(245,242,236,0.16)] dark:text-[rgba(245,242,236,0.4)]'
              }`}
            >
              {step > s.n ? <Check className="h-4 w-4" strokeWidth={3} /> : s.n}
            </span>
            <Bi
              en={s.en}
              ur={s.ur}
              className="hidden text-[11px] font-medium text-mut sm:block dark:text-[rgba(245,242,236,0.5)]"
            />
          </div>
          {i < STEPS.length - 1 && (
            <span
              className={`mx-2 h-px flex-1 transition-colors duration-300 ${
                step > s.n ? 'bg-acc' : 'bg-line dark:bg-[rgba(245,242,236,0.14)]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Real, backend-integrated sign-up route (server/src/controllers/auth.controller.js
 * `register` — accepts name/email/phone/password and an optional customer|seller
 * role + businessName). Three steps — account type, details, security — so the
 * seller-only business name field only appears once it's actually relevant.
 */
export default function Register() {
  const { lang } = useLang();
  const showToast = useToast();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    role: 'customer',
    name: '',
    email: '',
    phone: '',
    businessName: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const redirectTimer = useRef(null);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const busy = submitting || success;

  function handleChange(name, value) {
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: fieldError(name, next) }));
    }
    if (name === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: fieldError('confirmPassword', next) }));
    }
    if (formError) setFormError('');
  }

  function handleBlur(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: fieldError(name, form) }));
  }

  function validateFields(fields) {
    const next = {};
    fields.forEach((f) => {
      next[f] = fieldError(f, form);
    });
    setErrors((prev) => ({ ...prev, ...next }));
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }));
    return fields.every((f) => !next[f]);
  }

  function goBack() {
    setFormError('');
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (busy) return;

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      const fields = form.role === 'seller' ? ['name', 'email', 'phone', 'businessName'] : ['name', 'email', 'phone'];
      if (!validateFields(fields)) {
        showToast(lang === 'ur' ? 'براہ کرم درج شدہ خانوں کو درست کریں' : 'Please fix the highlighted fields');
        return;
      }
      setStep(3);
      return;
    }

    // Step 3 — final submit
    const passwordsValid = validateFields(['password', 'confirmPassword']);
    const termsOk = form.agreeTerms;
    if (!termsOk) {
      setErrors((prev) => ({ ...prev, agreeTerms: 'Please accept the Terms & Privacy Policy to continue.' }));
    }
    if (!passwordsValid || !termsOk) {
      showToast(lang === 'ur' ? 'براہ کرم درج شدہ خانوں کو درست کریں' : 'Please fix the highlighted fields');
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.role === 'seller') payload.businessName = form.businessName.trim();

      const user = await register(payload);
      setSuccess(true);
      showToast(lang === 'ur' ? 'اکاؤنٹ کامیابی سے بن گیا!' : 'Account created successfully!');
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

  return (
    <AuthShell variant="split">
      <div className="mb-6">
        <Bi
          as="h1"
          en="Create your account"
          ur="اپنا اکاؤنٹ بنائیں"
          className="text-[26px] font-[680] tracking-[-0.03em] text-ink dark:text-paper"
        />
        <Bi
          as="p"
          en="Join Chaudhary Electronics in a few quick steps."
          ur="چند آسان مراحل میں چوہدری الیکٹرانکس میں شامل ہوں۔"
          className="mt-1.5 text-[14.5px] leading-[1.5] text-mut dark:text-[rgba(245,242,236,0.55)]"
        />
      </div>

      <StepIndicator step={step} />

      <form onSubmit={handleFormSubmit} noValidate className="flex flex-col gap-4">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                value: 'customer',
                Icon: ShoppingBag,
                en: 'Buyer',
                ur: 'خریدار',
                descEn: 'Shop products for your home or business',
                descUr: 'گھر یا کاروبار کے لیے پروڈکٹس خریدیں',
              },
              {
                value: 'seller',
                Icon: Store,
                en: 'Seller',
                ur: 'فروخت کنندہ',
                descEn: 'List and sell your own products',
                descUr: 'اپنی پروڈکٹس کی فہرست بنائیں اور فروخت کریں',
              },
            ].map(({ value, Icon, en, ur, descEn, descUr }) => {
              const active = form.role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange('role', value)}
                  aria-pressed={active}
                  className={`flex flex-col items-start gap-3 rounded-[16px] border p-5 text-left transition-[border-color,background,box-shadow] duration-200 ${
                    active
                      ? 'border-acc bg-acc/10 shadow-[0_0_0_4px_rgba(226,163,71,0.12)]'
                      : 'border-line hover:border-ink/25 dark:border-[rgba(245,242,236,0.14)] dark:hover:border-paper/25'
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-[12px] ${
                      active
                        ? 'bg-acc text-ink'
                        : 'bg-[#F8F7F3] text-mut dark:bg-[rgba(245,242,236,0.06)] dark:text-[rgba(245,242,236,0.5)]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <Bi as="span" en={en} ur={ur} className="block text-[15px] font-semibold text-ink dark:text-paper" />
                    <Bi
                      as="span"
                      en={descEn}
                      ur={descUr}
                      className="mt-0.5 block text-[12.5px] leading-[1.4] text-mut dark:text-[rgba(245,242,236,0.5)]"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-name">
                <Bi en="Full name" ur="پورا نام" />
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-mut dark:text-[rgba(245,242,236,0.4)]" />
                <Input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Your full name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'reg-name-error' : undefined}
                  className="pl-11"
                />
              </div>
              {errors.name && (
                <span id="reg-name-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-email">
                <Bi en="Email address" ur="ای میل ایڈریس" />
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-mut dark:text-[rgba(245,242,236,0.4)]" />
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'reg-email-error' : undefined}
                  className="pl-11"
                />
              </div>
              {errors.email && (
                <span id="reg-email-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-phone">
                <Bi en="Phone number (optional)" ur="فون نمبر (اختیاری)" />
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-mut dark:text-[rgba(245,242,236,0.4)]" />
                <Input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="03XX-XXXXXXX"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
                  className="pl-11"
                />
              </div>
              {errors.phone && (
                <span id="reg-phone-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
                  {errors.phone}
                </span>
              )}
            </div>

            {form.role === 'seller' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-business">
                  <Bi en="Business name" ur="کاروبار کا نام" />
                </Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-mut dark:text-[rgba(245,242,236,0.4)]" />
                  <Input
                    id="reg-business"
                    type="text"
                    autoComplete="organization"
                    value={form.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    onBlur={() => handleBlur('businessName')}
                    placeholder="Your store or business name"
                    aria-invalid={!!errors.businessName}
                    aria-describedby={errors.businessName ? 'reg-business-error' : undefined}
                    className="pl-11"
                  />
                </div>
                {errors.businessName && (
                  <span id="reg-business-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
                    {errors.businessName}
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-password">
                <Bi en="Password" ur="پاس ورڈ" />
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-mut dark:text-[rgba(245,242,236,0.4)]" />
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="At least 6 characters"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'reg-password-error' : undefined}
                  className="pr-12 pl-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-1.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-mut transition-colors duration-200 hover:text-ink dark:text-[rgba(245,242,236,0.5)] dark:hover:text-paper"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {errors.password && (
                <span id="reg-password-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-confirm-password">
                <Bi en="Confirm password" ur="پاس ورڈ کی تصدیق کریں" />
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-mut dark:text-[rgba(245,242,236,0.4)]" />
                <Input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Re-enter your password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'reg-confirm-password-error' : undefined}
                  className="pr-12 pl-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showConfirmPassword}
                  className="absolute top-1/2 right-1.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-mut transition-colors duration-200 hover:text-ink dark:text-[rgba(245,242,236,0.5)] dark:hover:text-paper"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span id="reg-confirm-password-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex cursor-pointer items-start gap-2.5 select-none">
                <Checkbox
                  checked={form.agreeTerms}
                  onCheckedChange={(v) => {
                    setForm((f) => ({ ...f, agreeTerms: !!v }));
                    setErrors((prev) => ({ ...prev, agreeTerms: '' }));
                  }}
                  className="mt-0.5"
                  aria-invalid={!!errors.agreeTerms}
                />
                <span className="text-[13.5px] leading-[1.5] font-medium text-ink dark:text-paper">
                  <Bi en="I agree to the " ur="میں " />
                  <Link to="/terms" target="_blank" className="text-acc hover:underline">
                    <Bi en="Terms of Service" ur="سروس کی شرائط" />
                  </Link>
                  <Bi en=" and " ur=" اور " />
                  <Link to="/privacy" target="_blank" className="text-acc hover:underline">
                    <Bi en="Privacy Policy" ur="پرائیویسی پالیسی" />
                  </Link>
                  <Bi en="" ur=" سے اتفاق کرتا ہوں۔" />
                </span>
              </label>
              {errors.agreeTerms && (
                <span role="alert" className="text-[13px] font-medium text-[#C0392B]">
                  {errors.agreeTerms}
                </span>
              )}
            </div>
          </>
        )}

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-[14px] border border-[rgba(192,57,43,0.25)] bg-[rgba(192,57,43,0.08)] px-4 py-3 text-[13.5px] leading-[1.5] font-medium text-[#C0392B]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="mt-1 flex items-center gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" size="lg" onClick={goBack} disabled={busy}>
              <ChevronLeft className="h-[18px] w-[18px]" />
              <Bi en="Back" ur="واپس" />
            </Button>
          )}
          <Button type="submit" size="lg" disabled={busy} className="flex-1">
            {submitting ? (
              <>
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
                <Bi en="Creating account…" ur="اکاؤنٹ بنایا جا رہا ہے…" />
              </>
            ) : success ? (
              <>
                <Check className="h-[18px] w-[18px]" />
                <Bi en="Account created" ur="اکاؤنٹ بن گیا" />
              </>
            ) : step < TOTAL_STEPS ? (
              <Bi en="Continue" ur="جاری رکھیں" />
            ) : (
              <Bi en="Create account" ur="اکاؤنٹ بنائیں" />
            )}
          </Button>
        </div>
      </form>

      <p className="mt-7 text-center text-[14px] text-mut dark:text-[rgba(245,242,236,0.55)]">
        <Bi en="Already have an account? " ur="پہلے سے اکاؤنٹ ہے؟ " />
        <Link to="/login" className="font-semibold text-acc hover:underline">
          <Bi en="Sign in" ur="سائن ان" />
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
              en="Account created successfully"
              ur="اکاؤنٹ کامیابی سے بن گیا"
              className="text-[15px] font-semibold text-ink dark:text-paper"
            />
          </div>
        </div>
      )}
    </AuthShell>
  );
}
