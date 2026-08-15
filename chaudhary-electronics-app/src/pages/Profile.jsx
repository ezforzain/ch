import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLang } from '../i18n/LangContext';
import { resolveImageUrl, ApiRequestError } from '../lib/api';
import { validateAvatarFile, AVATAR_ACCEPT } from '../lib/avatarValidation';
import Bi from '../components/ui/Bi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

/**
 * /profile — self-service account page for any signed-in role (customers land here from
 * the Navbar's account menu; admins/sellers have their own richer settings screens at
 * /admin/profile and /seller/settings but can reach this one too). Uses the same
 * PATCH /users/me endpoint (name/phone/avatar) as those two — see AuthContext.updateProfile —
 * so there's exactly one upload/persistence path for every role, not a parallel one.
 */
export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { lang } = useLang();
  const showToast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(resolveImageUrl(user?.avatar?.url));
  const [saving, setSaving] = useState(false);
  // Tracks the local blob: URL from onAvatarChange so it can be revoked once no longer shown —
  // createObjectURL leaks memory if left un-revoked for the life of the tab.
  const objectUrlRef = useRef(null);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const initials = (user?.name || '?')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function onAvatarChange(e) {
    const file = e.target.files[0];
    e.target.value = ''; // let the same file be re-picked after a rejection
    if (!file) return;

    const error = validateAvatarFile(file);
    if (error) {
      showToast(error);
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setAvatarFile(file);
    setAvatarPreview(localUrl);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return; // belt-and-suspenders against double-submit alongside the disabled button
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('phone', phone);
      if (avatarFile) fd.append('avatar', avatarFile);
      // Applies straight from this request's response into AuthContext — every other avatar
      // in the app (navbar, admin panel) reads off the same auth state, so this is the one
      // place the "new" picture needs to land for the whole app to pick it up.
      const updated = await updateProfile(fd);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setAvatarPreview(resolveImageUrl(updated.avatar?.url));
      setAvatarFile(null);
      showToast(lang === 'ur' ? 'پروفائل کامیابی سے محفوظ ہو گئی۔' : 'Profile updated successfully.');
    } catch (err) {
      // Upload/save failed — revert to whatever the server still has, never leave the
      // rejected local preview showing as if it had been saved.
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setAvatarFile(null);
      setAvatarPreview(resolveImageUrl(user?.avatar?.url));
      showToast(
        err instanceof ApiRequestError
          ? err.message
          : lang === 'ur'
            ? 'پروفائل محفوظ نہیں ہو سکی۔ دوبارہ کوشش کریں۔'
            : 'Could not update your profile. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper pt-[110px] text-ink">
      <div className="mx-auto flex max-w-[640px] flex-col gap-8 px-5 pb-[clamp(56px,8vw,96px)]">
        <div className="flex flex-col gap-2">
          <span className="text-[11.5px] font-semibold tracking-[0.1em] text-acc uppercase">
            <Bi en="Account" ur="اکاؤنٹ" />
          </span>
          <Bi
            as="h1"
            en="My Profile"
            ur="میری پروفائل"
            className="text-[clamp(28px,4vw,40px)] font-[680] tracking-[-0.03em]"
          />
        </div>

        <form
          onSubmit={handleSave}
          className="flex flex-col gap-5 rounded-[20px] border border-line bg-[#F8F7F3] p-6 dark:border-[rgba(245,242,236,0.14)] dark:bg-[rgba(245,242,236,0.04)]"
        >
          <div className="flex items-center gap-4">
            <span className="relative grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-ink text-xl font-bold text-paper">
              {avatarPreview ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" /> : initials}
              {saving && (
                <span className="absolute inset-0 grid place-items-center bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-paper" />
                </span>
              )}
            </span>
            <label
              className={`inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-black/5 dark:border-[rgba(245,242,236,0.16)] dark:bg-transparent dark:text-paper dark:hover:bg-white/5 ${
                saving ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              <Camera className="h-4 w-4" />
              {saving ? <Bi en="Uploading…" ur="اپ لوڈ ہو رہا ہے…" /> : <Bi en="Change photo" ur="تصویر تبدیل کریں" />}
              <input
                type="file"
                accept={AVATAR_ACCEPT}
                onChange={onAvatarChange}
                disabled={saving}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">
              <Bi en="Full name" ur="پورا نام" />
            </Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} disabled={saving} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-phone">
              <Bi en="Phone" ur="فون" />
            </Label>
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={saving}
              placeholder="03XX-XXXXXXX"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">
              <Bi en="Email" ur="ای میل" />
            </Label>
            <Input id="profile-email" value={user?.email || ''} disabled className="opacity-60" />
          </div>

          <Button type="submit" size="lg" disabled={saving} className="self-start">
            {saving ? (
              <>
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
                <Bi en="Saving…" ur="محفوظ ہو رہا ہے…" />
              </>
            ) : (
              <Bi en="Save changes" ur="تبدیلیاں محفوظ کریں" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
