import Bi from '../ui/Bi';
import Modal from '../ui/Modal';
import { fmtPKR } from '../../lib/format';
import { imgUrl } from '../../data/catalogue';

/**
 * Unified cart + wishlist drawer — source: `data-sheet="drawer"`, switching
 * between the two via `drawerKind`. Row text ("Remove", per-row "Add to
 * cart" action, empty-state copy, drawer title) is plain JS-composed text in
 * the source (no data-lang spans) and so stays English-only here too — only
 * "Subtotal", the installation note and the checkout button are bilingual,
 * matching the source exactly.
 */
export default function CartDrawer({
  open,
  onClose,
  kind, // 'cart' | 'wish'
  cartLines, // [{ id, qty, product }]
  wishItems, // [product]
  onIncQty,
  onDecQty,
  onRemoveCartLine,
  onRemoveWish,
  onAddToCartFromWish,
  onCheckout,
}) {
  const isCart = kind === 'cart';
  const cartTotal = cartLines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const rows = isCart
    ? cartLines.map((l) => ({
        key: l.id,
        img: l.product.img,
        name: l.product.name,
        line: `${fmtPKR(l.product.price * l.qty)}  (${fmtPKR(l.product.price)} each)`,
        showQty: true,
        qty: l.qty,
        inc: () => onIncQty(l.id),
        dec: () => onDecQty(l.id),
        remove: () => onRemoveCartLine(l.id),
        removeLabel: `Remove ${l.product.name}`,
        showAction: false,
      }))
    : wishItems.map((p) => ({
        key: p.id,
        img: p.img,
        name: p.name,
        line: `${fmtPKR(p.price)}${p.unit ? ` ${p.unit}` : ''}`,
        showQty: false,
        qty: 1,
        inc: () => {},
        dec: () => {},
        remove: () => onRemoveWish(p.id),
        removeLabel: `Remove ${p.name}`,
        showAction: true,
        action: () => onAddToCartFromWish(p.id),
      }));

  const drawerTitle = isCart ? 'Your cart' : 'Saved items';
  const emptyIcon = isCart ? '□' : '♥';
  const emptyTitle = isCart ? 'Your cart is empty' : 'Nothing saved yet';
  const emptyBody = isCart
    ? 'Add panels, inverters or batteries and send the whole list to us on WhatsApp.'
    : 'Tap the heart on any product to keep it here while you decide.';

  return (
    <Modal open={open} onClose={onClose} align="right" labelledBy="drawer-title">
      <aside
        onMouseDown={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[430px] flex-col bg-paper shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-[22px]">
          <span id="drawer-title" className="text-[19.5px] font-[680] tracking-[-0.024em]">
            {drawerTitle}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-[38px] w-[38px] place-items-center rounded-full border border-line bg-transparent text-base text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center gap-3.5 border-b border-line px-6 py-[15px]">
              <img
                loading="lazy"
                decoding="async"
                src={imgUrl(r.img, 160)}
                alt=""
                className="h-[58px] w-[58px] flex-shrink-0 rounded-2xl bg-[#EAE5DB] object-cover"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[14.5px] font-[650] leading-[1.3]">{r.name}</span>
                <span className="text-[13px] text-mut" data-tnum>{r.line}</span>
                {r.showQty && (
                  <span className="mt-[3px] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={r.dec}
                      aria-label="Reduce quantity"
                      className="grid h-[30px] w-[30px] place-items-center rounded-full border border-line bg-transparent text-[15px] text-ink"
                    >
                      −
                    </button>
                    <span className="min-w-[20px] text-center text-sm font-[650]" data-tnum>{r.qty}</span>
                    <button
                      type="button"
                      onClick={r.inc}
                      aria-label="Increase quantity"
                      className="grid h-[30px] w-[30px] place-items-center rounded-full border border-line bg-transparent text-[15px] text-ink"
                    >
                      +
                    </button>
                  </span>
                )}
              </span>
              <span className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={r.remove}
                  aria-label={r.removeLabel}
                  className="border-none bg-transparent text-[13px] text-mut underline hover:text-[#8A2B1B]"
                >
                  Remove
                </button>
                {r.showAction && (
                  <button
                    type="button"
                    onClick={r.action}
                    className="whitespace-nowrap rounded-full border border-line bg-transparent px-3 py-2 text-[12.5px] font-semibold text-ink"
                  >
                    Add to cart
                  </button>
                )}
              </span>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-[26px] py-[70px] text-center">
              <span aria-hidden="true" className="text-2xl opacity-35">{emptyIcon}</span>
              <span className="text-[17px] font-[650]">{emptyTitle}</span>
              <span className="max-w-[280px] text-[14.5px] leading-[1.6] text-mut">{emptyBody}</span>
              <button
                type="button"
                onClick={onClose}
                className="mt-1 rounded-full border border-line bg-transparent px-5 py-3 text-sm font-semibold text-ink"
              >
                Browse products
              </button>
            </div>
          )}
        </div>

        {isCart && cartLines.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line bg-[#FBFAF7] px-6 py-[22px]">
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-mut">
                <Bi en="Subtotal" ur="کل رقم" />
              </span>
              <span className="text-[22px] font-bold tracking-[-0.025em]" data-tnum>{fmtPKR(cartTotal)}</span>
            </span>
            <span className="text-[12.5px] leading-[1.5] text-mut">
              <Bi
                en="Installation quoted separately after a free site survey."
                ur="تنصیب کی قیمت مفت سروے کے بعد الگ بتائی جائے گی۔"
              />
            </span>
            <button
              type="button"
              onClick={onCheckout}
              className="flex items-center justify-center gap-2.5 rounded-full border-none bg-ink px-[22px] py-[17px] text-[15.5px] font-[680] text-paper transition-transform hover:-translate-y-0.5"
            >
              <span className="h-[9px] w-[9px] rounded-full bg-[#4ADE80] shadow-[0_0_10px_#4ADE80]" />
              <Bi en="Send order on WhatsApp" ur="واٹس ایپ پر آرڈر بھیجیں" />
            </button>
          </div>
        )}
      </aside>
    </Modal>
  );
}
