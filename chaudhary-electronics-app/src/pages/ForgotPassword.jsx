import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { api, ApiRequestError } from '../lib/api';
import AuthShell from '../components/auth/AuthShell';
import Bi from '../components/ui/Bi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { lang } = useLang();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!EMAIL_RE.test(email.trim())) {
      setError("That email address doesn't look right.");
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      setError('');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={{ en: 'Forgot password?', ur: 'پاس ورڈ بھول گئے؟' }}
      subtitle={{
        en: 'Enter your email and we will send you a reset link.',
        ur: 'اپنا ای میل درج کریں، ہم آپ کو ری سیٹ لنک بھیجیں گے۔',
      }}
    >
      {sent ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[rgba(226,163,71,0.16)] text-acc">
            <Mail className="h-5 w-5" />
          </span>
          <p className="text-[14.5px] leading-[1.6] text-ink dark:text-paper">
            <Bi
              en="If an account exists for that email, a password reset link has been sent. Check your inbox (and spam folder)."
              ur="اگر اس ای میل پر کوئی اکاؤنٹ موجود ہے تو ری سیٹ لنک بھیج دیا گیا ہے۔ اپنا ان باکس (اور اسپیم فولڈر) چیک کریں۔"
            />
          </p>
          <Link to="/login" className="text-[13.5px] font-semibold text-acc hover:underline">
            <Bi en="Back to sign in" ur="سائن ان پر واپس جائیں" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fp-email">
              <Bi en="Email address" ur="ای میل ایڈریس" />
            </Label>
            <Input
              id="fp-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-invalid={!!error}
              aria-describedby={error ? 'fp-error' : undefined}
            />
            {error && (
              <span id="fp-error" role="alert" className="text-[13px] font-medium text-[#C0392B]">
                {error}
              </span>
            )}
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
                <Bi en="Sending…" ur="بھیجا جا رہا ہے…" />
              </>
            ) : (
              <Bi en="Send reset link" ur="ری سیٹ لنک بھیجیں" />
            )}
          </Button>

          <Link
            to="/login"
            className="text-center text-[13.5px] font-semibold text-mut hover:text-ink dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
          >
            <Bi en="Back to sign in" ur="سائن ان پر واپس جائیں" />
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
