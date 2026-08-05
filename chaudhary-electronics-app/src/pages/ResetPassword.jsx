import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { useToast } from '../context/ToastContext';
import { useAuth, ApiRequestError } from '../context/AuthContext';
import { api, setAccessToken } from '../lib/api';
import AuthShell from '../components/auth/AuthShell';
import Bi from '../components/ui/Bi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function ResetPassword() {
  const { lang } = useLang();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const showToast = useToast();
  const { refreshMe } = useAuth();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!token) {
      setError('This reset link is missing its token — please request a new one.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setAccessToken(res.data.accessToken);
      await refreshMe();
      showToast(lang === 'ur' ? 'پاس ورڈ کامیابی سے تبدیل ہو گیا۔' : 'Password reset — you are now signed in.');
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell title={{ en: 'Invalid link', ur: 'غلط لنک' }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[14.5px] leading-[1.6] text-ink dark:text-paper">
            <Bi
              en="This password reset link is invalid or missing its token."
              ur="یہ پاس ورڈ ری سیٹ لنک غلط ہے یا اس میں ٹوکن موجود نہیں۔"
            />
          </p>
          <Link to="/forgot-password" className="text-[13.5px] font-semibold text-acc hover:underline">
            <Bi en="Request a new link" ur="نیا لنک حاصل کریں" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={{ en: 'Set a new password', ur: 'نیا پاس ورڈ مقرر کریں' }}
      subtitle={{ en: 'Choose a new password for your account.', ur: 'اپنے اکاؤنٹ کے لیے نیا پاس ورڈ منتخب کریں۔' }}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="rp-password">
            <Bi en="New password" ur="نیا پاس ورڈ" />
          </Label>
          <div className="relative">
            <Input
              id="rp-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-invalid={!!error}
              aria-describedby={error ? 'rp-error' : undefined}
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
          {error && (
            <span id="rp-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
              {error}
            </span>
          )}
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
              <Bi en="Resetting…" ur="ری سیٹ ہو رہا ہے…" />
            </>
          ) : (
            <Bi en="Reset password" ur="پاس ورڈ ری سیٹ کریں" />
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
