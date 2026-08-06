import { useEffect, useState } from 'react';
import { cardClass, dangerBtnSmallClass, ghostBtnClass, ghostBtnSmallClass, primaryBtnClass } from '../adminStyles';
import { settingsFieldDefs, settingsTabs } from '../../../data/admin/navDefs';
import { useToast } from '../../../context/ToastContext';
import { useProducts } from '../../../context/ProductsContext';
import { api, resolveImageUrl } from '../../../lib/api';

// Maps each tab's flat field keys to/from the backend Setting document's nested shape.
// The 'smtp' tab is deliberately excluded — see server/src/models/Setting.js for why.
// 'banners' and 'spotlight' are structured (arrays), so they're handled outside this
// flat key<->value mapping entirely — see bannersDraft/spotlightIds state below.
function fromApi(settings) {
  return {
    companyName: settings.siteName,
    companyPhone: settings.contactPhone,
    companyAddress: settings.address,
    brandColor: settings.branding?.accentColor,
    logoUrl: settings.branding?.logoUrl,
    faviconUrl: settings.branding?.faviconUrl,
    fb: settings.social?.facebook,
    ig: settings.social?.instagram,
    wa: settings.whatsappNumber,
    metaTitle: settings.seo?.metaTitle,
    metaDesc: settings.seo?.metaDescription,
    gaId: settings.analytics?.googleAnalyticsId,
    pixelId: settings.analytics?.facebookPixelId,
    taxRate: settings.tax?.rate,
    shippingFlatRate: settings.shipping?.flatRate,
    freeShippingThreshold: settings.shipping?.freeShippingThreshold,
    announcementText: settings.announcement?.text,
    announcementLink: settings.announcement?.link,
    announcementActive: settings.announcement?.isActive,
  };
}

function toApi(tab, values) {
  switch (tab) {
    case 'company':
      return { siteName: values.companyName, contactPhone: values.companyPhone, address: values.companyAddress };
    case 'branding':
      return { branding: { accentColor: values.brandColor, logoUrl: values.logoUrl, faviconUrl: values.faviconUrl } };
    case 'social':
      return { social: { facebook: values.fb, instagram: values.ig }, whatsappNumber: values.wa };
    case 'seo':
      return { seo: { metaTitle: values.metaTitle, metaDescription: values.metaDesc } };
    case 'analytics':
      return { analytics: { googleAnalyticsId: values.gaId, facebookPixelId: values.pixelId } };
    case 'taxShipping':
      return {
        tax: { rate: Number(values.taxRate) || 0 },
        shipping: {
          flatRate: Number(values.shippingFlatRate) || 0,
          freeShippingThreshold: Number(values.freeShippingThreshold) || 0,
        },
      };
    case 'announcement':
      return {
        announcement: {
          text: values.announcementText || '',
          link: values.announcementLink || '',
          isActive: !!values.announcementActive,
        },
      };
    default:
      return null; // 'smtp', 'banners', 'spotlight' and 'backup' tabs don't persist through this path
  }
}

function emptyBanner() {
  return { title: '', subtitle: '', link: '', isActive: true, sortOrder: 0, image: { url: '', publicId: '' } };
}

/** /admin/settings — tabbed layout, persisting Company/Branding/Social/SEO/Analytics/Tax &
 * Shipping/Announcement to the real backend (GET/PATCH /settings). Banners and Product
 * spotlight are structured (an image-carousel array and a curated product-id list) so they
 * get their own save actions instead of the flat key/value form. SMTP stays local-only
 * (server env vars are the actual source of truth) and Backup is unchanged. */
export default function Settings({ admin }) {
  const showToast = useToast();
  const { products } = useProducts();
  const [tab, setTab] = useState('company');
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bannersDraft, setBannersDraft] = useState([]);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(null); // index currently uploading

  const [spotlightIds, setSpotlightIds] = useState([]);
  const [spotlightSaving, setSpotlightSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/settings');
        setValues((v) => ({ ...fromApi(res.data), ...v }));
        setBannersDraft(res.data.banners?.length ? res.data.banners : []);
        setSpotlightIds((res.data.spotlightProductIds || []).map(String));
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

  // --- Banners ---
  function addBanner() {
    setBannersDraft((b) => [...b, emptyBanner()]);
  }
  function updateBanner(i, patch) {
    setBannersDraft((b) => b.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function removeBanner(i) {
    setBannersDraft((b) => b.filter((_, idx) => idx !== i));
  }
  async function onBannerImage(i, e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setBannerUploading(i);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', 'banners');
      const res = await api.post('/uploads/image', fd, { isForm: true });
      updateBanner(i, { image: { url: res.data.url, publicId: res.data.publicId } });
    } catch (err) {
      showToast(err.message || 'Could not upload image.');
    } finally {
      setBannerUploading(null);
    }
  }
  async function saveBanners() {
    setBannerSaving(true);
    try {
      const payload = {
        banners: bannersDraft.map((b, i) => ({
          title: b.title || '',
          subtitle: b.subtitle || '',
          link: b.link || '',
          isActive: b.isActive !== false,
          sortOrder: Number(b.sortOrder) || i,
          image: b.image || { url: '', publicId: '' },
        })),
      };
      const res = await api.patch('/settings', payload);
      setBannersDraft(res.data.banners || []);
      showToast('Banners saved.');
    } catch (err) {
      showToast(err.message || 'Could not save banners.');
    } finally {
      setBannerSaving(false);
    }
  }

  // --- Product spotlight ---
  function toggleSpotlight(id) {
    setSpotlightIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }
  function moveSpotlight(index, dir) {
    setSpotlightIds((ids) => {
      const next = ids.slice();
      const target = index + dir;
      if (target < 0 || target >= next.length) return ids;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  async function saveSpotlight() {
    setSpotlightSaving(true);
    try {
      await api.patch('/settings', { spotlightProductIds: spotlightIds });
      showToast('Product spotlight saved.');
    } catch (err) {
      showToast(err.message || 'Could not save product spotlight.');
    } finally {
      setSpotlightSaving(false);
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

        {loading && tab !== 'banners' && tab !== 'spotlight' ? (
          <div className="flex flex-col gap-2.5" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span key={i} className="block h-11 animate-pulse rounded-[10px] bg-[var(--a-line)]" />
            ))}
          </div>
        ) : (
          <>
            {tab !== 'banners' && tab !== 'spotlight' && tab !== 'backup' &&
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
              ))}

            {tab === 'announcement' && (
              <label className="flex w-fit cursor-pointer items-center gap-2.5 text-[13px] font-semibold">
                <input
                  type="checkbox"
                  checked={!!values.announcementActive}
                  onChange={(e) => setField('announcementActive', e.target.checked)}
                  className="h-4 w-4"
                />
                Show announcement bar on the site
              </label>
            )}

            {tab === 'banners' && (
              <div className="flex flex-col gap-3.5">
                {bannersDraft.length === 0 && (
                  <div className="text-[13px] text-[var(--a-mut)]">No banners yet — add one below.</div>
                )}
                {bannersDraft.map((b, i) => (
                  <div key={i} className="flex flex-col gap-2.5 rounded-[14px] border border-[var(--a-line)] p-3.5">
                    <div className="flex items-start gap-3">
                      {b.image?.url ? (
                        <img src={resolveImageUrl(b.image.url)} alt="" className="h-16 w-24 flex-shrink-0 rounded-[10px] object-cover" />
                      ) : (
                        <div className="grid h-16 w-24 flex-shrink-0 place-items-center rounded-[10px] bg-[var(--a-paper)] text-[11px] text-[var(--a-mut)]">
                          No image
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-2">
                        <input
                          value={b.title}
                          onChange={(e) => updateBanner(i, { title: e.target.value })}
                          placeholder="Banner title"
                          className="h-9 rounded-[8px] border border-[var(--a-line)] bg-[var(--a-paper)] px-2.5 text-[13px] text-[var(--a-ink)] outline-none"
                        />
                        <input
                          value={b.subtitle}
                          onChange={(e) => updateBanner(i, { subtitle: e.target.value })}
                          placeholder="Subtitle (optional)"
                          className="h-9 rounded-[8px] border border-[var(--a-line)] bg-[var(--a-paper)] px-2.5 text-[13px] text-[var(--a-ink)] outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        value={b.link}
                        onChange={(e) => updateBanner(i, { link: e.target.value })}
                        placeholder="Link (e.g. /#products)"
                        className="h-9 min-w-[160px] flex-1 rounded-[8px] border border-[var(--a-line)] bg-[var(--a-paper)] px-2.5 text-[13px] text-[var(--a-ink)] outline-none"
                      />
                      <label className="grid h-9 cursor-pointer place-items-center rounded-[8px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 text-[12px] font-semibold text-[var(--a-ink)]">
                        {bannerUploading === i ? 'Uploading…' : 'Upload image'}
                        <input type="file" accept="image/*" onChange={(e) => onBannerImage(i, e)} className="hidden" />
                      </label>
                      <label className="flex cursor-pointer items-center gap-1.5 text-[12.5px] text-[var(--a-mut)]">
                        <input
                          type="checkbox"
                          checked={b.isActive !== false}
                          onChange={(e) => updateBanner(i, { isActive: e.target.checked })}
                        />
                        Active
                      </label>
                      <button type="button" className={`ml-auto ${dangerBtnSmallClass}`} onClick={() => removeBanner(i)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2.5">
                  <button type="button" className={ghostBtnClass} onClick={addBanner}>
                    + Add banner
                  </button>
                  <button type="button" disabled={bannerSaving} className={primaryBtnClass} onClick={saveBanners}>
                    {bannerSaving ? 'Saving…' : 'Save banners'}
                  </button>
                </div>
              </div>
            )}

            {tab === 'spotlight' && (
              <div className="flex flex-col gap-3">
                <div className="text-[13px] text-[var(--a-mut)]">
                  Pick which products appear in the homepage spotlight, and their order (use ↑/↓ to reorder).
                </div>
                {spotlightIds.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {spotlightIds.map((id, i) => {
                      const p = products.find((x) => x.id === id);
                      return (
                        <div key={id} className="flex items-center gap-2.5 rounded-[10px] border border-[var(--a-line)] px-3 py-2">
                          <span className="text-[13px] font-semibold text-[var(--a-ink)]">{i + 1}.</span>
                          <span className="flex-1 truncate text-[13px]">{p ? p.name : 'Unknown product'}</span>
                          <button type="button" className={ghostBtnSmallClass} disabled={i === 0} onClick={() => moveSpotlight(i, -1)}>
                            ↑
                          </button>
                          <button
                            type="button"
                            className={ghostBtnSmallClass}
                            disabled={i === spotlightIds.length - 1}
                            onClick={() => moveSpotlight(i, 1)}
                          >
                            ↓
                          </button>
                          <button type="button" className={dangerBtnSmallClass} onClick={() => toggleSpotlight(id)}>
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="max-h-[260px] overflow-y-auto rounded-[10px] border border-[var(--a-line)] p-2">
                  {products
                    .filter((p) => !spotlightIds.includes(p.id))
                    .map((p) => (
                      <label key={p.id} className="flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[13px]">
                        <input type="checkbox" checked={false} onChange={() => toggleSpotlight(p.id)} />
                        {p.name}
                      </label>
                    ))}
                  {products.length === 0 && <div className="p-2 text-[13px] text-[var(--a-mut)]">No products yet.</div>}
                </div>
                <button type="button" disabled={spotlightSaving} className={`self-start ${primaryBtnClass}`} onClick={saveSpotlight}>
                  {spotlightSaving ? 'Saving…' : 'Save spotlight'}
                </button>
              </div>
            )}
          </>
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

        {tab !== 'backup' && tab !== 'smtp' && tab !== 'banners' && tab !== 'spotlight' && (
          <button type="button" disabled={saving} className={`self-start ${primaryBtnClass}`} onClick={saveSettings}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        )}
      </div>
    </div>
  );
}
