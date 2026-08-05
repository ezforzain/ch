import Modal from '../../ui/Modal';
import { dangerBtnClass, ghostBtnClass } from '../adminStyles';

/** Reusable delete-confirmation dialog — transcribed from source's
 * `hasConfirm` block (openConfirm/closeConfirm/runConfirm). */
export default function ConfirmDialog({ open, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <Modal open onClose={onCancel} align="center" labelledBy="confirm-dialog-message">
      <div className="flex w-full max-w-[400px] flex-col gap-4 rounded-[18px] bg-[var(--a-white)] p-[22px] shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
        <div id="confirm-dialog-message" className="text-[14.5px]">
          {message}
        </div>
        <div className="flex justify-end gap-2.5">
          <button type="button" className={ghostBtnClass} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={dangerBtnClass} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}
