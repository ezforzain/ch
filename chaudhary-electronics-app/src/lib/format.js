export function fmtPKR(n) {
  return `PKR ${Math.round(n).toLocaleString('en-US')}`;
}

export function fmtNum(n) {
  return Math.round(n).toLocaleString('en-US');
}

export function imgFallback(terms, seed = 3) {
  return (e) => {
    const img = e.currentTarget;
    if (img.dataset.fbDone) return;
    img.dataset.fbDone = '1';
    img.src = `https://loremflickr.com/1200/800/${terms}?lock=${seed}`;
  };
}

/** Same fallback pool as imgFallback(), but for API-backed images where the field can be
 * blank (no upload yet) — an empty src doesn't reliably fire the <img>'s onerror in every
 * browser, so use this directly as `src` instead of waiting on onError to catch it. */
export function imgOrFallback(url, terms, seed = 3) {
  return url || `https://loremflickr.com/1200/800/${terms}?lock=${seed}`;
}

export function waLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Normalizes a free-text numeric input (price/stock fields aren't `type="number"` — that
 * would block typing thousands-separator commas — so admins can end up with stray
 * whitespace, a pasted "Rs " prefix, or "27,500" style commas in the raw value) into a plain
 * digits[.digits] string. Used to make sure the exact value validated client-side is also the
 * exact value sent to the API — the backend's isFloat/isInt checks reject anything but a bare
 * numeric string, so e.g. a trailing space (invisible, easy to type by accident) would
 * otherwise pass a lenient client parseFloat() check but fail the server's stricter one. */
export function cleanNumericInput(raw) {
  // Keeps '-' (unlike commas/currency symbols/whitespace, it's meaningful here) so a
  // genuinely negative input still reads as negative and gets correctly rejected by the
  // positive-number check downstream, instead of being silently stripped into a positive one.
  return String(raw ?? '').replace(/[^0-9.-]/g, '');
}
