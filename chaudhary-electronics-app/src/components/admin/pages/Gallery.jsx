import { useState } from 'react';
import Modal from '../../ui/Modal';
import ConfirmDialog from '../table/ConfirmDialog';
import { useToast } from '../../../context/ToastContext';
import { useGalleryData } from '../../../hooks/admin/useGalleryData';

const iconBtnClass =
  'grid h-[26px] w-[26px] cursor-pointer place-items-center rounded-[7px] border-none text-[11px] text-white';

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/**
 * /admin/gallery — drag & drop upload zone + file-picker fallback, tile
 * grid with replace/delete, native HTML5 drag-to-reorder between tiles,
 * click-to-enlarge lightbox. Transcribed from source's `isGallery` /
 * `hasGalleryDetail` blocks (toggleGalleryFiles/replaceGalleryItem/
 * deleteGalleryItem/reorderGallery).
 */
export default function Gallery() {
  const showToast = useToast();
  const admin = useGalleryData();
  const [detailUrl, setDetailUrl] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function handleFiles(fileList) {
    const files = Array.from(fileList);
    if (!files.length) return;
    const dataUrls = await Promise.all(files.map(readFileAsDataURL));
    const count = await admin.addGalleryImages(dataUrls);
    showToast(`${count} image(s) uploaded.`);
  }

  function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function onFileInput(e) {
    if (e.target.files.length) handleFiles(e.target.files);
    e.target.value = '';
  }

  async function onReplace(id, e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const url = await readFileAsDataURL(file);
    admin.replaceGalleryItem(id, url);
    showToast('Image replaced.');
  }

  function onDelete(id) {
    setConfirm({
      message: 'Delete this image?',
      onConfirm: () => {
        admin.deleteGalleryItem(id);
        showToast('Image deleted.');
        setConfirm(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-2xl border-2 border-dashed border-[var(--a-line)] bg-[var(--a-white)] p-[26px] text-center text-[13.5px] text-[var(--a-mut)]"
      >
        Drag &amp; drop images here, or{' '}
        <label className="cursor-pointer font-semibold text-[var(--a-acc)]">
          browse
          <input type="file" multiple accept="image/*" onChange={onFileInput} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
        {admin.data.gallery.map((g) => (
          <div
            key={g.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', g.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              admin.reorderGallery(e.dataTransfer.getData('text/plain'), g.id);
            }}
            className="relative overflow-hidden rounded-2xl"
          >
            <img
              loading="lazy"
              src={g.url}
              alt=""
              onClick={() => setDetailUrl(g.url)}
              className="block aspect-square w-full cursor-pointer object-cover"
            />
            <div className="absolute right-1.5 top-1.5 flex gap-1">
              <label className={iconBtnClass} style={{ background: 'rgba(20,17,12,0.7)' }}>
                ⇄
                <input type="file" accept="image/*" onChange={(e) => onReplace(g.id, e)} className="hidden" />
              </label>
              <button type="button" onClick={() => onDelete(g.id)} className={iconBtnClass} style={{ background: 'rgba(20,17,12,0.7)' }}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {detailUrl && (
        <Modal open onClose={() => setDetailUrl(null)} align="center">
          <div className="w-full max-w-[720px] overflow-hidden rounded-[20px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
            <img src={detailUrl} alt="" className="block max-h-[70vh] w-full object-cover" />
            <div className="flex justify-end px-[18px] py-3.5">
              <button
                type="button"
                onClick={() => setDetailUrl(null)}
                className="cursor-pointer rounded-[10px] border-none bg-[var(--a-dark)] px-[18px] py-[9px] text-[13.5px] font-semibold text-[#F5F2EC]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!confirm} message={confirm?.message} onCancel={() => setConfirm(null)} onConfirm={() => confirm.onConfirm()} />
    </div>
  );
}
