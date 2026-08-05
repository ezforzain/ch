import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { api, resolveImageUrl, ApiRequestError } from '../../../lib/api';
import { cardClass, primaryBtnClass } from '../adminStyles';

/** /admin/profile — the admin's own account info + avatar, and a change-password form.
 * Reachable from the Header's profile dropdown (previously a "coming soon" toast). */
export default function Profile() {
  const { user, refreshMe } = useAuth();
  const showToast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState(resolveImageUrl(user?.avatar?.url));
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  function onAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('phone', phone);
      if (avatarFile) fd.append('avatar', avatarFile);
      await api.patch('/users/me', fd, { isForm: true });
      await refreshMe();
      showToast('Profile updated.');
    } catch (err) {
      showToast(err.message || 'Could not update profile.');
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
          <label className="cursor-pointer rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--a-ink)]">
            Change photo
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
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
