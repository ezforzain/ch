import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, resolveImageUrl } from '../../lib/api';
import { cardClass, inputClass, primaryBtnClass } from '../../components/admin/adminStyles';

const STATUS_LABELS = { pending: 'Pending review', approved: 'Approved', rejected: 'Rejected', suspended: 'Suspended' };

/**
 * Seller profile/settings — name/phone/avatar are editable via the existing
 * PATCH /users/me (self-service, works for any role). sellerProfile fields
 * (business name, status, commission rate) are shown READ-ONLY: the backend's
 * updateMe only accepts name/phone/avatar today — editing sellerProfile.* is
 * admin-only (PATCH /users/:id) — so this deliberately doesn't build a form
 * against an endpoint that doesn't exist yet.
 */
export default function SellerSettings() {
  const { user, refreshMe } = useAuth();
  const showToast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(resolveImageUrl(user?.avatar?.url));
  const [saving, setSaving] = useState(false);

  const sellerProfile = user?.sellerProfile || {};

  function onAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('phone', phone);
      if (avatarFile) fd.append('avatar', avatarFile);
      await api.patch('/users/me', fd, { isForm: true });
      await refreshMe();
      showToast('Profile updated.');
    } catch (err) {
      showToast(err.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      <form onSubmit={handleSave} className={`${cardClass} gap-4`}>
        <div className="text-[14.5px] font-bold">Profile</div>

        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--a-dark)] text-[15px] font-bold text-[#F5F2EC]">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              (name || '?')
                .split(' ')
                .map((w) => w.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase()
            )}
          </span>
          <label className="grid h-10 w-fit cursor-pointer place-items-center rounded-[10px] border border-[var(--a-line)] bg-[var(--a-white)] px-4 text-[12.5px] font-semibold text-[var(--a-ink)]">
            Change photo
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Email
          <input value={user?.email || ''} disabled className={`${inputClass} opacity-60`} />
        </label>

        <button type="submit" disabled={saving} className={`${primaryBtnClass} self-start`}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className={`${cardClass} gap-3`}>
        <div className="text-[14.5px] font-bold">Business profile</div>
        <p className="text-[12.5px] text-[var(--a-mut)]">
          These details are managed by our admin team — message support to request a change.
        </p>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <div className="text-[11px] text-[var(--a-mut)]">Business name</div>
            <div className="text-[13.5px] font-semibold">{sellerProfile.businessName || '—'}</div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--a-mut)]">Account status</div>
            <div className="text-[13.5px] font-semibold">{STATUS_LABELS[sellerProfile.status] || sellerProfile.status || '—'}</div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--a-mut)]">Commission rate</div>
            <div className="text-[13.5px] font-semibold">
              {sellerProfile.commissionRate != null ? `${sellerProfile.commissionRate}%` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--a-mut)]">Rating</div>
            <div className="text-[13.5px] font-semibold">{sellerProfile.rating ? sellerProfile.rating.toFixed(1) : 'No ratings yet'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
