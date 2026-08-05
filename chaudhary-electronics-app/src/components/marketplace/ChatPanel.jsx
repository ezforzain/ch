import { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import { fmtPKR } from '../../lib/format';

const REPLY_DELAY_MS = 1100;

// Keyword-matched canned replies — transcribed verbatim from the source's
// `sendChat()`. Chat copy is English-only in the source (no data-lang there).
function buildReply(text, product) {
  const low = text.toLowerCase();
  if (/price|cost|discount|rate|kitna|qeemat/.test(low)) {
    return product
      ? `Listed at ${fmtPKR(product.price)}. On full-system orders we can improve that — share your load details and we will quote.`
      : 'Share the item and quantity and we will quote our best price.';
  }
  if (/stock|available|delivery|deliver|kab/.test(low)) {
    return product
      ? `${product.stock} units are in our Lahore warehouse. Delivery is 1–3 working days in Punjab.`
      : 'Most items ship in 1–3 working days from Lahore.';
  }
  if (/install|fit|labour|survey/.test(low)) {
    return 'Installation is done by our own crew. The site survey is free and the quote is written — no surprises.';
  }
  if (/warrant|guarantee/.test(low)) {
    return product
      ? `Warranty on this item: ${product.warranty}. Terms are handed to you on paper, signed.`
      : 'Every item carries a written warranty.';
  }
  return 'Noted — an engineer will confirm the details. Would you like us to call you today?';
}

/**
 * Fake seller chat — source: `data-sheet="chat"` + `openChat()`/`sendChat()`.
 * Every time it's opened it starts a fresh greeting for the product it was
 * opened for (matches source: `openChat()` always rebuilds `chat` from
 * scratch, it never resumes a prior conversation).
 */
export default function ChatPanel({ open, onClose, product }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setMessages([
      {
        me: false,
        text: `Assalam o Alaikum! Ask us anything about ${product ? product.name : 'this product'} — price, stock or installation.`,
      },
    ]);
    setTyping(false);
    setDraft('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setMessages((prev) => [...prev, { me: true, text }]);
    setTyping(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { me: false, text: buildReply(text, product) }]);
      setTyping(false);
    }, REPLY_DELAY_MS);
  };

  const sellerName = (product && product.seller) || 'Chaudhary Electronics';

  return (
    <Modal open={open} onClose={onClose} align="bottom" labelledBy="chat-title">
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="flex max-h-[82vh] w-full max-w-[480px] flex-col rounded-t-[26px] bg-paper shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-[22px] py-[18px]">
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-ink text-sm font-[650] text-paper">
            CE
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span id="chat-title" className="text-[15px] font-[650] leading-tight">
              {sellerName}
            </span>
            <span className="flex items-center gap-1.5 text-[12.5px] text-mut">
              <span className="h-[7px] w-[7px] rounded-full bg-[#4ADE80]" />
              Usually replies within an hour
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-transparent text-[15px] text-ink"
          >
            ✕
          </button>
        </div>

        <div aria-live="polite" className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-[22px] py-[18px]">
          {messages.map((m, i) => (
            <span
              key={i}
              style={{
                alignSelf: m.me ? 'flex-end' : 'flex-start',
                borderRadius: m.me ? '16px 16px 5px 16px' : '16px 16px 16px 5px',
                background: m.me ? 'var(--color-ink)' : '#FBFAF7',
                color: m.me ? '#F5F2EC' : 'var(--color-ink)',
              }}
              className="max-w-[78%] px-[15px] py-3 text-[14.5px] leading-[1.5]"
            >
              {m.text}
            </span>
          ))}
          {typing && (
            <span className="self-start rounded-[16px_16px_16px_5px] border border-line bg-[#FBFAF7] px-[15px] py-3 text-sm text-mut">
              typing…
            </span>
          )}
        </div>

        <div className="flex gap-2.5 border-t border-line bg-[#FBFAF7] px-[22px] py-4">
          <input
            aria-label="Message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about price, stock or installation…"
            className="min-w-0 flex-1 rounded-full border border-line bg-paper px-[15px] py-3.5 text-[14.5px] outline-none focus:border-acc focus:shadow-[0_0_0_4px_rgba(226,163,71,0.16)]"
          />
          <button
            type="button"
            onClick={send}
            aria-label="Send message"
            className="w-[50px] flex-shrink-0 rounded-full border-none bg-ink text-base text-paper"
          >
            ↑
          </button>
        </div>
      </div>
    </Modal>
  );
}
