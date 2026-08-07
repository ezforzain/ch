import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../ui/Modal';
import Breadcrumbs from '../../ui/Breadcrumbs';
import { imgUrl } from '../../../data/catalogue';
import { cleanNumericInput } from '../../../lib/format';
import { ghostBtnClass } from '../adminStyles';

const STATUS_OPTIONS = ['Active', 'Draft', 'Out of Stock'];

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function buildInitialDraft(mode, row, categories) {
  if (mode === 'edit' && row) return { ...row, gallery: Array.isArray(row.gallery) ? [...row.gallery] : [] };
  return {
    name: '',
    cat: categories[0]?.name || '',
    seller: '',
    price: '',
    stock: '',
    moq: '',
    gallery: [],
    note: '',
    status: 'Active',
    featured: false,
  };
}

// Flat, borderless field style — a filled surface at rest, a crisp emerald ring on focus.
// No box lives around groups of these; the section label + spacing alone does that job.
function inputCls(hasError, extra = '') {
  return `h-11 w-full rounded-lg border bg-[var(--a-paper)] px-3.5 text-[14px] text-[var(--a-ink)] outline-none transition-[border-color,box-shadow] duration-150 focus:bg-[var(--a-white)] focus:ring-4 ${
    hasError
      ? 'border-[var(--a-danger)] focus:ring-[rgba(193,68,42,0.1)]'
      : 'border-transparent focus:border-emerald-500 focus:ring-emerald-500/10'
  } ${extra}`;
}

function Spinner({ light }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${
        light ? 'border-white/35 border-t-white' : 'border-emerald-600/25 border-t-emerald-600'
      }`}
    />
  );
}

/** Section label — small, uppercase, muted. Groups fields by rhythm/typography instead of
 * a bordered card, matching the flatter "no unnecessary outlines" look of Stripe/Linear/
 * Vercel dashboards rather than the boxed-card look this drawer used before. */
function SectionLabel({ children, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-[11px] font-bold tracking-[0.08em] text-[var(--a-mut)] uppercase">{children}</h3>
      {subtitle && <p className="mt-1 text-[12.5px] text-[var(--a-mut)]">{subtitle}</p>}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[var(--a-ink)]">
      <span>
        {label}
        {required && <span className="text-emerald-600"> *</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="text-[11.5px] font-medium text-[var(--a-danger)]">
          {error}
        </span>
      )}
    </label>
  );
}

/**
 * Products-only Add/Edit experience — a large right-hand slide-over drawer, rendered by
 * CollectionTable via its `renderModal` override (see Products.jsx) instead of the generic
 * RecordModal every other collection (leads, blog, services, …) still uses. Kept as a
 * separate component so this redesign can't affect those other 13 schema-driven pages.
 *
 * Layout: a two-column "content + sidebar" page (name/description/images on the left,
 * pricing/inventory/organization/status on the right) — no bordered card wraps any of it;
 * sections are separated by typographic rhythm (uppercase labels + spacing) the way a
 * Stripe/Shopify Admin/Linear settings page is, not a stack of outlined boxes.
 *
 * `onSubmit` is CollectionTable's handleSubmitModal — it does the real add/edit call and
 * resolves to `{ ok, message, status }`; the drawer only closes on true success, and the
 * parent already toasts on success, so this component doesn't duplicate that. On failure it
 * shows the *actual* reason (a specific validation message, "session expired", "permission
 * denied", a network/CORS failure, …) instead of one generic banner regardless of cause.
 */
export default function ProductFormDrawer({ mode, row, categories, onClose, onSubmit }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => buildInitialDraft(mode, row, categories || []));
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState(null); // 'draft' | 'publish'
  const [isDragging, setIsDragging] = useState(false);
  const dragIndex = useRef(null);
  const fileInputRef = useRef(null);

  const isEdit = mode === 'edit';

  function setField(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const urls = await Promise.all(files.map(readFileAsDataURL));
    setDraft((d) => ({ ...d, gallery: [...(d.gallery || []), ...urls] }));
    setErrors((e) => (e.gallery ? { ...e, gallery: undefined } : e));
  }

  function removeImage(idx) {
    setDraft((d) => ({ ...d, gallery: d.gallery.filter((_, i) => i !== idx) }));
  }

  function moveImage(from, to) {
    if (from === to) return;
    setDraft((d) => {
      const next = [...d.gallery];
      if (to < 0 || to >= next.length) return d;
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...d, gallery: next };
    });
  }

  function validate(requireFull) {
    const next = {};
    if (!String(draft.name || '').trim()) next.name = 'Product name is required.';
    if (requireFull) {
      if (!String(draft.cat || '').trim()) next.cat = 'Please choose a category.';
      const priceNum = parseFloat(cleanNumericInput(draft.price));
      if (!draft.price || Number.isNaN(priceNum) || priceNum <= 0) next.price = 'Enter a valid price greater than 0.';
      const stockNum = parseFloat(cleanNumericInput(draft.stock));
      if (String(draft.stock) === '' || Number.isNaN(stockNum) || stockNum < 0) next.stock = 'Enter a valid stock quantity.';
      if (draft.moq) {
        const moqNum = parseFloat(cleanNumericInput(draft.moq));
        if (Number.isNaN(moqNum) || moqNum < 1) next.moq = 'Minimum order quantity must be 1 or more.';
        else if (!Number.isNaN(stockNum) && moqNum > stockNum) next.moq = 'Minimum order quantity cannot exceed stock.';
      }
      if (!draft.gallery || draft.gallery.length === 0) next.gallery = 'Add at least one product image.';
      if (!String(draft.note || '').trim()) next.note = 'Add a short description.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave(action) {
    if (saving) return;
    const requireFull = action !== 'draft';
    if (!validate(requireFull)) {
      setBanner('Please fix the highlighted fields before continuing.');
      return;
    }
    setBanner('');
    setSaving(true);
    setSavingAction(action);
    const payload = {
      ...draft,
      status: action === 'draft' ? 'Draft' : draft.status,
      // Send exactly what was just validated above, not the raw (possibly
      // whitespace/comma/currency-prefix-containing) text the admin typed.
      price: draft.price !== undefined && draft.price !== '' ? cleanNumericInput(draft.price) : draft.price,
      stock: draft.stock !== undefined && draft.stock !== '' ? cleanNumericInput(draft.stock) : draft.stock,
      moq: draft.moq ? cleanNumericInput(draft.moq) : '',
    };
    const result = await onSubmit(payload);
    setSaving(false);
    setSavingAction(null);
    if (result.ok) {
      onClose();
      return;
    }
    setBanner(result.message || 'Could not save the product — please check the details below and try again.');
    // A 401 here means lib/api.js already tried a silent refresh and it still failed — the
    // session is genuinely gone, so send the admin back to sign in instead of leaving them
    // stuck on a form that can never save.
    if (result.status === 401) {
      setTimeout(() => navigate('/login'), 1200);
    }
  }

  return (
    <Modal open onClose={onClose} align="right" labelledBy="product-drawer-title" overlayClassName="bg-transparent">
      <div className="animate-admin-drawer-in flex h-full w-full max-w-full flex-col bg-[var(--a-white)] shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.35)] sm:max-w-[680px] lg:max-w-[920px] xl:max-w-[1040px]">
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-[var(--a-line)] px-6 py-5 sm:px-10">
          <div>
            <Breadcrumbs
              items={[
                { label: 'Dashboard', to: '/admin' },
                { label: 'Products', to: '/admin/products' },
                { label: isEdit ? 'Edit Product' : 'Add Product' },
              ]}
              className="mb-1.5"
              linkClassName="text-[var(--a-mut)] transition-colors hover:text-[var(--a-ink)]"
              currentClassName="font-semibold text-emerald-600"
              separatorClassName="text-[var(--a-line)]"
            />
            <h2 id="product-drawer-title" className="text-xl font-extrabold text-[var(--a-ink)] sm:text-[22px]">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="mt-1 text-[13px] text-[var(--a-mut)]">
              {isEdit ? 'Update the details below — your changes save straight to the catalogue.' : 'Fill in the details below to list a new product in your catalogue.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 flex-shrink-0 cursor-pointer place-items-center rounded-full text-[15px] text-[var(--a-mut)] transition-colors hover:bg-[var(--a-paper)] hover:text-[var(--a-ink)]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
          {banner && (
            <div role="alert" className="mb-7 rounded-xl border border-[var(--a-danger-soft)] bg-[var(--a-danger-soft)] px-4 py-3 text-[13px] font-medium text-[var(--a-danger)]">
              {banner}
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-[1fr_300px]">
            {/* Main column — name, description, images */}
            <div className="flex flex-col gap-10">
              <div>
                <SectionLabel>Product details</SectionLabel>
                <div className="flex flex-col gap-5">
                  <Field label="Product name" required error={errors.name}>
                    <input
                      className={inputCls(errors.name, 'text-[15px] font-medium')}
                      value={draft.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="e.g. LED Panel Light 24W"
                    />
                  </Field>
                  <Field label="Short description" required error={errors.note}>
                    <textarea
                      rows={4}
                      className={`${inputCls(errors.note)} h-auto resize-y py-3`}
                      value={draft.note}
                      onChange={(e) => setField('note', e.target.value)}
                      placeholder="Describe the product in a sentence or two…"
                    />
                  </Field>
                </div>
              </div>

              <div>
                <SectionLabel subtitle="The first image is the cover photo — drag thumbnails to reorder.">Images</SectionLabel>
                <div className="flex flex-col gap-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      addFiles(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-9 text-center transition-colors ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50'
                        : errors.gallery
                          ? 'border-[var(--a-danger)] bg-[var(--a-danger-soft)]'
                          : 'border-[var(--a-line)] bg-[var(--a-paper)] hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-[16px] text-emerald-600">⬆</span>
                    <p className="text-[13.5px] font-semibold text-[var(--a-ink)]">Drag & drop images here, or click to browse</p>
                    <p className="text-[11.5px] text-[var(--a-mut)]">PNG or JPG, multiple files supported</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </div>
                  {errors.gallery && (
                    <span role="alert" className="text-[11.5px] font-medium text-[var(--a-danger)]">
                      {errors.gallery}
                    </span>
                  )}

                  {draft.gallery?.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                      {draft.gallery.map((url, idx) => (
                        <div
                          key={`${url}-${idx}`}
                          draggable
                          onDragStart={() => {
                            dragIndex.current = idx;
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (dragIndex.current !== null) moveImage(dragIndex.current, idx);
                            dragIndex.current = null;
                          }}
                          className="group relative aspect-square cursor-grab overflow-hidden rounded-lg bg-[var(--a-paper)] active:cursor-grabbing"
                        >
                          <img src={imgUrl(url, 200)} alt="" className="h-full w-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[9.5px] font-bold text-white">Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            aria-label="Remove image"
                            className="absolute -right-1 -top-1 grid h-5 w-5 cursor-pointer place-items-center rounded-full border-none bg-[var(--a-danger)] text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar — pricing, inventory, organization, status */}
            <div className="flex flex-col gap-8">
              <div>
                <SectionLabel>Pricing</SectionLabel>
                <Field label="Price (PKR)" required error={errors.price}>
                  <input
                    inputMode="decimal"
                    className={inputCls(errors.price)}
                    value={draft.price}
                    onChange={(e) => setField('price', e.target.value)}
                    placeholder="0.00"
                  />
                </Field>
              </div>

              <div>
                <SectionLabel>Inventory</SectionLabel>
                <div className="flex flex-col gap-5">
                  <Field label="Stock quantity" required error={errors.stock}>
                    <input
                      inputMode="numeric"
                      className={inputCls(errors.stock)}
                      value={draft.stock}
                      onChange={(e) => setField('stock', e.target.value)}
                      placeholder="0"
                    />
                  </Field>
                  <Field label="Minimum order quantity" error={errors.moq}>
                    <input
                      inputMode="numeric"
                      className={inputCls(errors.moq)}
                      value={draft.moq}
                      onChange={(e) => setField('moq', e.target.value)}
                      placeholder="1"
                    />
                  </Field>
                </div>
              </div>

              <div>
                <SectionLabel>Organization</SectionLabel>
                <div className="flex flex-col gap-5">
                  <Field label="Category" required error={errors.cat}>
                    <select className={inputCls(errors.cat)} value={draft.cat} onChange={(e) => setField('cat', e.target.value)}>
                      <option value="" disabled>
                        Select a category
                      </option>
                      {(categories || []).map((c) => (
                        <option key={c.id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Brand">
                    <input
                      className={inputCls()}
                      value={draft.seller || ''}
                      onChange={(e) => setField('seller', e.target.value)}
                      placeholder="e.g. Chaudhary Electronics"
                    />
                  </Field>
                </div>
              </div>

              <div>
                <SectionLabel>Status</SectionLabel>
                <div className="flex flex-col gap-3">
                  <Field label="Visibility">
                    <select className={inputCls()} value={draft.status} onChange={(e) => setField('status', e.target.value)}>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <label className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-lg bg-[var(--a-paper)] px-3.5">
                    <span className="text-[13px] font-semibold text-[var(--a-ink)]">Featured product</span>
                    <span
                      className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors"
                      style={{ background: draft.featured ? '#10B981' : 'var(--a-line)' }}
                    >
                      <input
                        type="checkbox"
                        className="peer absolute h-full w-full cursor-pointer opacity-0"
                        checked={!!draft.featured}
                        onChange={(e) => setField('featured', e.target.checked)}
                      />
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${draft.featured ? 'translate-x-5' : 'translate-x-0.5'}`}
                      />
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--a-line)] bg-[var(--a-white)] px-6 py-4 sm:px-10">
          <button type="button" className={ghostBtnClass} disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--a-line)] bg-[var(--a-white)] px-5 text-[13px] font-bold text-[var(--a-ink)] transition-colors hover:bg-[var(--a-paper)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && savingAction === 'draft' && <Spinner />}
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('publish')}
              className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-emerald-500 px-6 text-[13px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(16,185,129,0.55)] transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && savingAction === 'publish' && <Spinner light />}
              {saving && savingAction === 'publish' ? 'Saving…' : isEdit ? 'Save Product' : 'Publish Product'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
