import Bi from '../ui/Bi';
import Modal from '../ui/Modal';
import { fmtPKR } from '../../lib/format';
import { imgUrl } from '../../data/catalogue';

const EMPTY = '—';

// Fixed comparison rows that always appear before the union of spec keys —
// source: overlayVals() -> compareRows base array.
const BASE_ROWS = [
  { k: 'Category', get: (p) => p.cat },
  { k: 'Rating', get: (p) => `${p.rating.toFixed(1)} ★ (${p.reviews})` },
  { k: 'Stock', get: (p) => `${p.stock} available` },
  { k: 'Warranty', get: (p) => p.warranty },
  { k: 'Seller', get: (p) => p.seller },
];

/**
 * Comparison table for up to 3 selected products — source: `data-sheet="compare"`.
 * Builds the union of every spec key across the selected products, same as
 * the source's `specKeys` accumulation.
 */
export default function CompareModal({ open, onClose, products, onRemove }) {
  const specKeys = [];
  products.forEach((p) => {
    Object.keys(p.specs || {}).forEach((k) => {
      if (specKeys.indexOf(k) < 0) specKeys.push(k);
    });
  });
  const rows = BASE_ROWS.concat(specKeys.map((k) => ({ k, get: (p) => (p.specs || {})[k] || EMPTY })));

  return (
    <Modal open={open} onClose={onClose} align="center" labelledBy="compare-title">
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[86vh] w-full max-w-[960px] overflow-auto rounded-[28px] bg-paper shadow-[0_50px_110px_-30px_rgba(0,0,0,0.7)]"
      >
        <div className="sticky top-0 z-[2] flex items-center justify-between gap-3 border-b border-line bg-paper px-6 py-[22px]">
          <span id="compare-title" className="text-[19.5px] font-[680] tracking-[-0.024em]">
            <Bi en="Compare products" ur="موازنہ" />
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

        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-[26px] py-[70px] text-center">
            <span aria-hidden="true" className="text-2xl opacity-35">⇄</span>
            <span className="text-[17px] font-[650]">Nothing to compare yet</span>
            <span className="max-w-[300px] text-[14.5px] leading-[1.6] text-mut">
              Tap the ⇄ button on any two or three products to line up their specifications.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto py-1 pb-5">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">
                    Spec
                  </th>
                  {products.map((p) => (
                    <th key={p.id} scope="col" className="min-w-[190px] px-5 py-4 text-left align-top">
                      <span className="flex flex-col gap-2.5">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={imgUrl(p.img, 400)}
                          alt=""
                          className="aspect-[16/10] w-full rounded-2xl bg-[#EAE5DB] object-cover"
                        />
                        <span className="text-[14.5px] font-[650] leading-[1.3]">{p.name}</span>
                        <span className="text-[15px] font-[680]" data-tnum>{fmtPKR(p.price)}</span>
                        <button
                          type="button"
                          onClick={() => onRemove(p.id)}
                          className="self-start border-none bg-transparent p-0 text-[12.5px] text-mut underline hover:text-[#8A2B1B]"
                        >
                          Remove
                        </button>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.k} className="border-t border-line">
                    <th scope="row" className="whitespace-nowrap px-5 py-[13px] text-left text-[13px] font-semibold text-mut">
                      {row.k}
                    </th>
                    {products.map((p) => {
                      const v = row.get(p);
                      return (
                        <td
                          key={p.id}
                          style={{ color: v === EMPTY ? 'var(--color-mut)' : 'var(--color-ink)' }}
                          className={`px-5 py-[13px] text-[13.5px] ${v === EMPTY ? 'font-normal' : 'font-semibold'}`}
                        >
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
