import { useEffect, useState } from 'react';
import { cardClass, ghostBtnClass, primaryBtnClass } from '../adminStyles';
import { settingsFieldDefs, settingsTabs } from '../../../data/admin/navDefs';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../lib/api';

// Maps each tab's flat field keys to/from the backend Setting document's nested shape.
// The 'smtp' tab is deliberately excluded — see server/src/models/Setting.js for why.
function fromApi(settings) {
  return {
    companyName: settings.siteName,
    companyPhone: settings.contactPhone,
    companyAddress: settings.address,
    brandColor: settings.branding?.accentColor,
    logoUrl: settings.branding?.logoUrl,
    fb: settings.social?.facebook,
    ig: settings.social?.instagram,
    wa: settings.whatsappNumber,
    metaTitle: settings.seo?.metaTitle,
    metaDesc: settings.seo?.metaDescription,
    gaId: settings.analytics?.googleAnalyticsId,
    pixelId: settings.analytics?.facebookPixelId,
  };
}

function toApi(tab, values) {
  switch (tab) {
    case 'company':
      return { siteName: values.companyName, contactPhone: values.companyPhone, address: values.companyAddress };
    case 'branding':
      return { branding: { accentColor: values.brandColor, logoUrl: values.logoUrl } };
    case 'social':
      return { social: { facebook: values.fb, instagram: values.ig }, whatsappNumber: values.wa };
    case 'seo':
      return { seo: { metaTitle: values.metaTitle, metaDescription: values.metaDesc } };
    case 'analytics':
      return { analytics: { googleAnalyticsId: values.gaId, facebookPixelId: values.pixelId } };
    default:
      return null; // 'smtp' and 'backup' tabs don't persist through this path
  }
}

/** /admin/settings — tabbed layout, now persisting Company/Branding/Social/SEO/Analytics to
 * the real backend (GET/PATCH /settings). SMTP stays local-only (server env vars are the
 * actual source of truth — see server/src/config/env.js) and Backup is unchanged. */
export default function Settings({ admin }) {
  const showToast = useToast();
  const [tab, setTab] = useState('company');
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/settings');
        setValues((v) => ({ ...fromApi(res.data), ...v }));
      } catch (err) {
        showToast(err.message || 'Could not load settings.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields = (settingsFieldDefs[tab] || []).map(([key, label, placeholder]) => ({
    key,
    label,
    placeholder,
    value: values[key] || '',
  }));

  function setField(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function saveSettings() {
    const payload = toApi(tab, values);
    if (!payload) {
      showToast(tab === 'smtp' ? 'SMTP is configured via the server environment, not here.' : 'Nothing to save on this tab.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch('/settings', payload);
      setValues((v) => ({ ...fromApi(res.data), ...v }));
      showToast('Settings saved.');
    } catch (err) {
      showToast(err.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(admin.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chaudhary-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Backup downloaded.');
  }

  function restoreBackup(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        admin.restoreAll(data);
        showToast('Backup restored.');
      } catch {
        showToast('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 max-[900px]:!grid-cols-1">
      <div className="flex flex-col gap-0.5">
        {settingsTabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="cursor-pointer rounded-[10px] border-none px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--a-ink)]"
            style={{ background: tab === key ? 'var(--a-acc-soft)' : 'transparent' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={cardClass} style={{ padding: 26, gap: 14 }}>
        {tab === 'smtp' && (
          <div className="rounded-[10px] bg-[var(--a-acc-soft)] px-3.5 py-2.5 text-[12.5px] text-[var(--a-ink)]">
            SMTP is configured via the server's environment variables (SMTP_HOST, SMTP_USER,
            SMTP_PASS in server/.env), not stored here — keeping mail credentials out of the
            database.
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-2.5" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span key={i} className="block h-11 animate-pulse rounded-[10px] bg-[var(--a-line)]" />
            ))}
          </div>
        ) : (
          fields.map((f) => (
            <label key={f.key} className="flex flex-col gap-1.5 text-[13px] font-semibold">
              {f.label}
              <input
                value={f.value}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
                disabled={tab === 'smtp'}
                className="h-11 rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 text-sm text-[var(--a-ink)] outline-none disabled:opacity-60"
              />
            </label>
          ))
        )}

        {tab === 'backup' && (
          <div className="flex gap-2.5">
            <button type="button" className={primaryBtnClass} onClick={downloadBackup}>
              Download backup (JSON)
            </button>
            <label className={`cursor-pointer ${ghostBtnClass} grid place-items-center`}>
              Restore backup
              <input type="file" accept="application/json" onChange={restoreBackup} className="hidden" />
            </label>
          </div>
        )}

        {tab !== 'backup' && tab !== 'smtp' && (
          <button type="button" disabled={saving} className={`self-start ${primaryBtnClass}`} onClick={saveSettings}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        )}
      </div>
    </div>
  );
}
