import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { api, resolveImageUrl, ApiRequestError } from '../../../lib/api';
import { validateAvatarFile, AVATAR_ACCEPT } from '../../../lib/avatarValidation';
import { cardClass, primaryBtnClass } from '../adminStyles';

/** /admin/profile — the admin's own account info + avatar, and a change-password form.
 * Reachable from the Header's profile dropdown (previously a "coming soon" toast). */
export default function Profile() {
  const { user, updateProfile } = useAuth();
  const showToast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState(resolveImageUrl(user?.avatar?.url));
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  // Tracks the local blob: URL from onAvatarChange so it can be revoked once it's no longer
  // shown — createObjectURL leaks memory if left un-revoked for the life of the tab.
  const objectUrlRef = useRef(null);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

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

  async function saveProfile(e) {
    e.preventDefault();
    if (savingProfile) return; // belt-and-suspenders against double-submit alongside the disabled button
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('phone', phone);
      if (avatarFile) fd.append('avatar', avatarFile);
      const updated = await updateProfile(fd);
      // Swap the local blob: preview for the real, persisted URL now that the server has it —
      // keeps this preview in sync with what every other avatar in the app (navbar, account
      // menu) is now showing off the same AuthContext user.
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setAvatarPreview(resolveImageUrl(updated.avatar?.url));
      setAvatarFile(null);
      showToast('Profile updated.');
    } catch (err) {
      // Upload/save failed — never leave a broken/half-applied image showing. Revert to
      // whatever the server still has (the old photo), not the rejected local preview.
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setAvatarFile(null);
      setAvatarPreview(resolveImageUrl(user?.avatar?.url));
      showToast(err instanceof ApiRequestError ? err.message : 'Could not update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.patch('/auth/update-password', { currentPassword, newPassword });
      showToast('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err instanceof ApiRequestError ? err.message : 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid max-w-[720px] grid-cols-1 gap-4">
      <form onSubmit={saveProfile} className={cardClass}>
        <div className="mb-1 text-[14.5px] font-bold">Profile</div>
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--a-dark)] text-lg font-bold text-[#F5F2EC]">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              (user?.name || '?').charAt(0).toUpperCase()
            )}
          </span>
          <label
            className={`cursor-pointer rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--a-ink)] ${savingProfile ? 'pointer-events-none opacity-60' : ''}`}
          >
            {savingProfile ? 'Uploading…' : 'Change photo'}
            <input type="file" accept={AVATAR_ACCEPT} onChange={onAvatarChange} disabled={savingProfile} className="hidden" />
          </label>
        </div>

        <label className="mt-2 flex flex-col gap-1.5 text-[13px] font-semibold">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 text-sm text-[var(--a-ink)] outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 text-sm text-[var(--a-ink)] outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Email
          <input
            value={user?.email || ''}
            disabled
            className="h-11 rounded-[10px] border border-[var(--a-line)] bg-[var(--a-line)] px-3 text-sm text-[var(--a-mut)] outline-none"
          />
        </label>
        <button type="submit" disabled={savingProfile} className={`self-start ${primaryBtnClass}`}>
          {savingProfile ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      <form onSubmit={changePassword} className={cardClass}>
        <div className="mb-1 text-[14.5px] font-bold">Change password</div>
        {passwordError && (
          <div className="rounded-[10px] bg-[var(--a-danger-soft)] px-3 py-2.5 text-[13px] text-[var(--a-danger)]">
            {passwordError}
          </div>
        )}
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="h-11 rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 text-sm text-[var(--a-ink)] outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="h-11 rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 text-sm text-[var(--a-ink)] outline-none"
          />
        </label>
        <button type="submit" disabled={savingPassword} className={`self-start ${primaryBtnClass}`}>
          {savingPassword ? 'Updating…' : 'Change password'}
        </button>
      </form>
    </div>
  );
}
