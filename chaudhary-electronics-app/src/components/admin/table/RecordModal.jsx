import { useRef, useState } from 'react';
import Modal from '../../ui/Modal';
import { ghostBtnClass, primaryBtnClass, richBtnClass } from '../adminStyles';
import { imgUrl } from '../../../data/catalogue';

function buildInitialDraft(schema, mode, row) {
  if (mode === 'edit' && row) return { ...row };
  const draft = {};
  schema.fields.forEach((f) => {
    draft[f.key] = f.type === 'select' ? f.options[0] : '';
  });
  return draft;
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/**
 * Add/edit record modal — schema-driven field renderer (text/tel/email/
 * select/textarea/date/richtext/file/multifile), required + Products
 * price/stock validation, and a simulated 500ms save delay. Transcribed
 * from source's openAddModal/openEditModal/saveModal/commitModal.
 */
export default function RecordModal({ schema, mode, row, onClose, onSubmit }) {
  const [draft, setDraft] = useState(() => buildInitialDraft(schema, mode, row));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef(null);

  const modalTitle = `${mode === 'add' ? 'Add' : 'Edit'} ${schema.singular}`;
  const saveLabel = saving ? 'Saving…' : schema.saveLabel || 'Save';

  function setField(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function wrapSelection(before, after) {
    const el = bodyRef.current;
    if (!el) return;
    const s = el.selectionStart || 0;
    const e = el.selectionEnd || 0;
    const val = draft.body || '';
    setField('body', val.slice(0, s) + before + val.slice(s, e) + after + val.slice(e));
  }

  async function onFileChange(key, e) {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const url = await readFileAsDataURL(f);
    setField(key, url);
  }

  async function onMultiFileChange(key, e) {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (!files.length) return;
    const urls = await Promise.all(files.map(readFileAsDataURL));
    setDraft((d) => ({ ...d, [key]: [...(d[key] || []), ...urls] }));
  }

  function removeGalleryImage(key, url) {
    setDraft((d) => ({ ...d, [key]: (d[key] || []).filter((u) => u !== url) }));
  }

  function handleSave() {
    if (saving) return;
    const missing = schema.fields.filter((f) => f.required && !String(draft[f.key] || '').trim());
    if (missing.length) {
      setError(`${missing[0].label} is required.`);
      return;
    }
    if (schema.singular === 'Product') {
      const priceNum = parseFloat(String(draft.price || '').replace(/,/g, ''));
      if (!draft.price || Number.isNaN(priceNum) || priceNum <= 0) {
        setError('Price must be a valid number greater than 0.');
        return;
      }
      if (draft.stock && (Number.isNaN(parseFloat(draft.stock)) || parseFloat(draft.stock) < 0)) {
        setError('Stock quantity must be a valid non-negative number.');
        return;
      }
    }
    setError('');
    setSaving(true);
    setTimeout(() => {
      onSubmit(draft);
      onClose();
    }, 500);
  }

  return (
    <Modal open onClose={onClose} align="center" labelledBy="record-modal-title">
      <div className="flex w-full max-w-[520px] max-h-[88vh] flex-col gap-3.5 overflow-y-auto rounded-[20px] bg-[var(--a-white)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
        <div id="record-modal-title" className="text-base font-bold">
          {modalTitle}
        </div>
        {error && (
          <div className="rounded-[10px] bg-[var(--a-danger-soft)] px-3 py-2.5 text-[13px] text-[var(--a-danger)]">
            {error}
          </div>
        )}

        {schema.fields.map((f) => (
          <label key={f.key} className="flex flex-col gap-1.5 text-[13px] font-semibold">
            {f.label}
            {f.required ? ' *' : ''}

            {f.type !== 'textarea' && f.type !== 'select' && f.type !== 'richtext' && f.type !== 'file' && f.type !== 'multifile' && (
              <input
                type={f.type}
                value={draft[f.key] || ''}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.label}
                className="h-[42px] rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 text-sm text-[var(--a-ink)] outline-none"
              />
            )}

            {f.type === 'textarea' && (
              <textarea
                value={draft[f.key] || ''}
                onChange={(e) => setField(f.key, e.target.value)}
                rows={3}
                className="resize-y rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 py-2.5 text-sm text-[var(--a-ink)] outline-none"
              />
            )}

            {f.type === 'select' && (
              <select
                value={draft[f.key] || f.options[0]}
                onChange={(e) => setField(f.key, e.target.value)}
                className="h-[42px] rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-2.5 text-sm text-[var(--a-ink)]"
              >
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}

            {f.type === 'richtext' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <button type="button" className={richBtnClass} onClick={() => wrapSelection('**', '**')}>
                    <strong>B</strong>
                  </button>
                  <button type="button" className={richBtnClass} onClick={() => wrapSelection('*', '*')}>
                    <em>I</em>
                  </button>
                  <button type="button" className={richBtnClass} onClick={() => wrapSelection('[', '](url)')}>
                    Link
                  </button>
                </div>
                <textarea
                  ref={bodyRef}
                  value={draft[f.key] || ''}
                  onChange={(e) => setField(f.key, e.target.value)}
                  rows={5}
                  className="resize-y rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 py-2.5 font-mono text-[13.5px] text-[var(--a-ink)] outline-none"
                />
                <span className="text-[11px] text-[var(--a-mut)]">Markdown supported</span>
              </div>
            )}

            {f.type === 'file' && (
              <div className="flex items-center gap-2.5">
                {draft[f.key] && (
                  <img
                    src={imgUrl(draft[f.key], 100)}
                    alt=""
                    className="h-14 w-14 rounded-[10px] object-cover"
                  />
                )}
                <label className="grid h-[38px] cursor-pointer place-items-center rounded-[9px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3.5 text-[12.5px] font-semibold text-[var(--a-ink)]">
                  Upload image
                  <input type="file" accept="image/*" onChange={(e) => onFileChange(f.key, e)} className="hidden" />
                </label>
              </div>
            )}

            {f.type === 'multifile' && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {(draft[f.key] || []).map((url) => (
                    <div key={url} className="relative">
                      <img src={imgUrl(url, 100)} alt="" className="h-[52px] w-[52px] rounded-[9px] object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(f.key, url)}
                        className="absolute -right-1.5 -top-1.5 grid h-[18px] w-[18px] cursor-pointer place-items-center rounded-full border-none bg-[var(--a-danger)] text-[10px] text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <label className="grid h-[38px] w-fit cursor-pointer place-items-center rounded-[9px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3.5 text-[12.5px] font-semibold text-[var(--a-ink)]">
                  Add images
                  <input type="file" accept="image/*" multiple onChange={(e) => onMultiFileChange(f.key, e)} className="hidden" />
                </label>
              </div>
            )}
          </label>
        ))}

        <div className="mt-1.5 flex justify-end gap-2.5">
          <button type="button" className={ghostBtnClass} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={primaryBtnClass} disabled={saving} onClick={handleSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
