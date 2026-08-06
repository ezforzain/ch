import { useRef, useState } from 'react';
import Modal from '../../ui/Modal';
import Breadcrumbs from '../../ui/Breadcrumbs';
import { imgUrl } from '../../../data/catalogue';
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
    gallery: [],
    note: '',
    status: 'Active',
    featured: false,
  };
}

function inputCls(hasError) {
  return `h-11 w-full rounded-xl border bg-[var(--a-paper)] px-3.5 text-[13.5px] text-[var(--a-ink)] outline-none transition focus:ring-4 ${
    hasError ? 'border-[var(--a-danger)] focus:ring-[rgba(193,68,42,0.12)]' : 'border-[var(--a-line)] focus:border-emerald-500 focus:ring-emerald-500/10'
  }`;
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

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-[var(--a-line)] bg-[var(--a-white)] p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-emerald-50 text-[16px] text-emerald-600">{icon}</span>
        <div>
          <h3 className="text-[14.5px] font-bold text-[var(--a-ink)]">{title}</h3>
          {subtitle && <p className="text-[12px] text-[var(--a-mut)]">{subtitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, required, error, full, children }) {
  return (
    <label className={`flex flex-col gap-1.5 text-[13px] font-semibold text-[var(--a-ink)] ${full ? 'sm:col-span-2' : ''}`}>
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
 * `onSubmit` is CollectionTable's handleSubmitModal — it does the real add/edit call and
 * resolves to whether it actually succeeded; the drawer only closes on true success, and the
 * parent already toasts on success, so this component doesn't duplicate that.
 */
export default function ProductFormDrawer({ mode, row, categories, onClose, onSubmit }) {
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
      const priceNum = parseFloat(String(draft.price || '').replace(/,/g, ''));
      if (!draft.price || Number.isNaN(priceNum) || priceNum <= 0) next.price = 'Enter a valid price greater than 0.';
      const stockNum = parseFloat(String(draft.stock || '').replace(/,/g, ''));
      if (String(draft.stock) === '' || Number.isNaN(stockNum) || stockNum < 0) next.stock = 'Enter a valid stock quantity.';
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
    const payload = { ...draft, status: action === 'draft' ? 'Draft' : draft.status };
    const ok = await onSubmit(payload);
    setSaving(false);
    setSavingAction(null);
    if (ok) {
      onClose();
    } else {
      setBanner('Could not save the product — please check the details below and try again.');
    }
  }

  return (
    <Modal open onClose={onClose} align="right" labelledBy="product-drawer-title" overlayClassName="bg-[rgba(15,14,11,0.18)] backdrop-blur-md">
      <div className="animate-admin-drawer-in flex h-full w-full max-w-full flex-col bg-[var(--a-white)] shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.45)] sm:max-w-[640px] lg:max-w-[860px] xl:max-w-[960px]">
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-[var(--a-line)] px-6 py-5 sm:px-9">
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
            className="grid h-9 w-9 flex-shrink-0 cursor-pointer place-items-center rounded-xl border border-[var(--a-line)] bg-[var(--a-white)] text-[15px] text-[var(--a-ink)] transition hover:bg-[var(--a-paper)]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-9">
          <div className="mx-auto flex max-w-[800px] flex-col gap-5">
            {banner && (
              <div role="alert" className="rounded-xl border border-[var(--a-danger-soft)] bg-[var(--a-danger-soft)] px-4 py-3 text-[13px] font-medium text-[var(--a-danger)]">
                {banner}
              </div>
            )}

            <SectionCard icon="🏷️" title="Basic Information" subtitle="Name, category and brand for this product.">
              <Field label="Product Name" required error={errors.name}>
                <input
                  className={inputCls(errors.name)}
                  value={draft.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. LED Panel Light 24W"
                />
              </Field>
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
              <Field label="Brand" full>
                <input
                  className={inputCls()}
                  value={draft.seller || ''}
                  onChange={(e) => setField('seller', e.target.value)}
                  placeholder="e.g. Chaudhary Electronics"
                />
              </Field>
            </SectionCard>

            <SectionCard icon="💰" title="Pricing & Inventory" subtitle="Set the price and how many units are in stock.">
              <Field label="Price (PKR)" required error={errors.price}>
                <input
                  inputMode="decimal"
                  className={inputCls(errors.price)}
                  value={draft.price}
                  onChange={(e) => setField('price', e.target.value)}
                  placeholder="0.00"
                />
              </Field>
              <Field label="Stock Quantity" required error={errors.stock}>
                <input
                  inputMode="numeric"
                  className={inputCls(errors.stock)}
                  value={draft.stock}
                  onChange={(e) => setField('stock', e.target.value)}
                  placeholder="0"
                />
              </Field>
            </SectionCard>

            <SectionCard icon="🖼️" title="Images" subtitle="The first image is used as the cover photo — drag thumbnails to reorder.">
              <div className="flex flex-col gap-3 sm:col-span-2">
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
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50'
                      : errors.gallery
                        ? 'border-[var(--a-danger)] bg-[var(--a-danger-soft)]'
                        : 'border-[var(--a-line)] bg-[var(--a-paper)] hover:border-emerald-400 hover:bg-emerald-50/60'
                  }`}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-[18px] text-emerald-600">⬆</span>
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
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
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
                        className="group relative aspect-square cursor-grab overflow-hidden rounded-xl border border-[var(--a-line)] bg-[var(--a-paper)] active:cursor-grabbing"
                      >
                        <img src={imgUrl(url, 200)} alt="" className="h-full w-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[9.5px] font-bold text-white">Cover</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          aria-label="Remove image"
                          className="absolute -right-1 -top-1 grid h-5 w-5 cursor-pointer place-items-center rounded-full border-none bg-[var(--a-danger)] text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard icon="📝" title="Description" subtitle="A short summary shown to customers on the product page.">
              <Field label="Short Description" required error={errors.note} full>
                <textarea
                  rows={4}
                  className={`${inputCls(errors.note)} h-auto resize-y py-3`}
                  value={draft.note}
                  onChange={(e) => setField('note', e.target.value)}
                  placeholder="Describe the product in a sentence or two…"
                />
              </Field>
            </SectionCard>

            <SectionCard icon="⚙️" title="Product Status" subtitle="Control visibility and whether it's featured.">
              <Field label="Status">
                <select className={inputCls()} value={draft.status} onChange={(e) => setField('status', e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--a-line)] bg-[var(--a-paper)] px-4">
                <span className="text-[13px] font-semibold text-[var(--a-ink)]">Featured Product</span>
                <span
                  className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition"
                  style={{ background: draft.featured ? '#059669' : 'var(--a-line)' }}
                >
                  <input
                    type="checkbox"
                    className="peer absolute h-full w-full cursor-pointer opacity-0"
                    checked={!!draft.featured}
                    onChange={(e) => setField('featured', e.target.checked)}
                  />
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${draft.featured ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </span>
              </label>
            </SectionCard>
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--a-line)] bg-[var(--a-white)] px-6 py-4 sm:px-9">
          <button type="button" className={ghostBtnClass} disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--a-line)] bg-[var(--a-white)] px-5 text-[13px] font-bold text-[var(--a-ink)] transition hover:bg-[var(--a-paper)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && savingAction === 'draft' && <Spinner />}
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('publish')}
              className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-emerald-600 px-6 text-[13px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(5,150,105,0.55)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
