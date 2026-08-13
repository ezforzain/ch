import Bi from '../ui/Bi';
import Modal from '../ui/Modal';
import { fmtPKR } from '../../lib/format';
import { imgUrl } from '../../data/catalogue';

const EMPTY = '—';
const LOW_STOCK_THRESHOLD = 10;
const DANGER = '#C0392B';
const WARNING = '#9A6B12';
const WARNING_SOFT = '#FCEFD8';

/** Guards every plain-text cell against undefined/null/''/NaN — never let a
 * missing spec render as anything but the em dash placeholder. */
function val(v) {
  if (v === null || v === undefined || v === '') return EMPTY;
  if (typeof v === 'number' && Number.isNaN(v)) return EMPTY;
  return v;
}

function RatingCell({ rating, reviews }) {
  const count = Number(reviews) || 0;
  if (!count) return <span className="text-mut">★ No reviews</span>;
  return (
    <span className="font-semibold text-ink">
      ★ {(Number(rating) || 0).toFixed(1)} <span className="font-normal text-mut">({count})</span>
    </span>
  );
}

function StockCell({ stock }) {
  const n = Number(stock) || 0;
  if (n <= 0) return <span className="font-semibold" style={{ color: DANGER }}>Out of stock</span>;
  if (n <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className="font-semibold text-ink">{n} available</span>
        <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: WARNING_SOFT, color: WARNING }}>
          Low stock
        </span>
      </span>
    );
  }
  return <span className="font-semibold text-ink">{n} available</span>;
}

// Fixed comparison rows that always appear before the union of spec keys —
// source: overlayVals() -> compareRows base array. `render` takes priority over
// the plain `get` value when present (Rating/Stock need their own formatting/color).
const BASE_ROWS = [
  { k: 'Category', get: (p) => p.cat },
  { k: 'Rating', render: (p) => <RatingCell rating={p.rating} reviews={p.reviews} /> },
  { k: 'Stock', render: (p) => <StockCell stock={p.stock} /> },
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
  const rows = BASE_ROWS.concat(specKeys.map((k) => ({ k, get: (p) => (p.specs || {})[k] })));

  return (
    <Modal
      open={open}
      onClose={onClose}
      align="center"
      labelledBy="compare-title"
      overlayClassName="bg-[rgba(15,14,11,0.72)] backdrop-blur-md"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-ce-modal-in flex max-h-[88vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-[24px] border border-line bg-paper shadow-[0_50px_120px_-24px_rgba(23,21,15,0.55)]"
      >
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-7">
          <div className="flex flex-col gap-1">
            <span id="compare-title" className="text-[21px] font-bold tracking-[-0.02em] text-ink">
              <Bi en="Compare products" ur="موازنہ" />
            </span>
            <span className="text-[13px] text-mut">
              <Bi en="Compare features, pricing and availability" ur="خصوصیات، قیمت اور دستیابی کا موازنہ کریں" />
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-line bg-transparent text-base text-ink transition-all duration-150 hover:scale-105 hover:border-ink/20 hover:bg-[rgba(23,21,15,0.05)] active:scale-95"
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
          <div className="flex-1 overflow-auto overscroll-contain">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 left-0 z-[3] w-[128px] min-w-[128px] bg-paper px-5 py-4 text-left align-top text-[11px] font-semibold uppercase tracking-[0.08em] text-mut"
                  >
                    Spec
                  </th>
                  {products.map((p, idx) => (
                    <th
                      key={p.id}
                      scope="col"
                      className={`group sticky top-0 z-[2] min-w-[190px] bg-paper px-5 py-4 text-left align-top ${idx > 0 ? 'border-l border-line' : ''}`}
                    >
                      <span className="flex flex-col gap-2.5">
                        <span className="block h-[160px] w-full overflow-hidden rounded-2xl bg-[#EAE5DB]">
                          <img
                            loading="lazy"
                            decoding="async"
                            src={imgUrl(p.img, 400)}
                            alt=""
                            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
                          />
                        </span>
                        <span className="line-clamp-2 text-[14.5px] font-[650] leading-[1.3] text-ink" title={p.name}>
                          {p.name}
                        </span>
                        <span className="text-[18px] font-extrabold tracking-[-0.01em] text-ink" data-tnum>
                          {fmtPKR(p.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemove(p.id)}
                          className="self-start border-none bg-transparent p-0 text-[12.5px] font-medium text-mut underline decoration-line underline-offset-2 transition-colors duration-150 hover:text-[#8A2B1B] hover:decoration-[#8A2B1B]"
                        >
                          Remove
                        </button>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.k} className={i % 2 === 1 ? 'bg-[rgba(23,21,15,0.025)]' : 'bg-paper'}>
                    <th
                      scope="row"
                      className={`sticky left-0 z-[1] whitespace-nowrap px-5 py-[13px] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-mut ${i % 2 === 1 ? 'bg-[#F1EEE6]' : 'bg-paper'}`}
                    >
                      {row.k}
                    </th>
                    {products.map((p, idx) => {
                      if (row.render) {
                        return (
                          <td key={p.id} className={`px-5 py-[13px] text-[13.5px] ${idx > 0 ? 'border-l border-line' : ''}`}>
                            {row.render(p)}
                          </td>
                        );
                      }
                      const v = val(row.get(p));
                      return (
                        <td
                          key={p.id}
                          className={`px-5 py-[13px] text-[13.5px] ${idx > 0 ? 'border-l border-line' : ''} ${v === EMPTY ? 'font-normal text-mut' : 'font-semibold text-ink'}`}
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
