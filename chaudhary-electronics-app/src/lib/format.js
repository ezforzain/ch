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

export function waLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
