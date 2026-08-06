import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';
import { useProducts } from './ProductsContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fmtPKR, waLink } from '../lib/format';

const CartContext = createContext(null);
const WHATSAPP_NUMBER = '920000000000';

/** App-wide cart + wishlist, lifted out of MarketplaceSection so /marketplace and
 * /product/:id (now separate routes instead of one component owning a modal) share a
 * single source of truth. Persisted to localStorage exactly like before (`ce_cart_v1`/
 * `ce_wishlist_v1`). Compare state stays local to MarketplaceSection — nothing outside
 * the marketplace grid ever reads/writes it, so lifting it here would be unused scope. */
export function CartProvider({ children }) {
  const showToast = useToast();
  const { findById } = useProducts();

  const onStorageError = useCallback(
    () => showToast('Your browser blocked local storage — cart/wishlist changes won\'t be saved after you leave.'),
    [showToast],
  );
  const [cart, setCart] = useLocalStorage('ce_cart_v1', [], onStorageError); // [{ id, qty }]
  const [wishlist, setWishlist] = useLocalStorage('ce_wishlist_v1', [], onStorageError); // [id]

  // Prune stale ids (e.g. a product that no longer exists) out of the persisted stores once,
  // the same way MarketplaceSection used to on mount.
  useEffect(() => {
    setCart((prev) => prev.filter((l) => l && findById(l.id)));
    setWishlist((prev) => prev.filter((id) => findById(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = useCallback(
    (id, qty = 1) => {
      const p = findById(id);
      if (!p) return;
      if (p.stock <= 0) {
        showToast(`${p.name} is out of stock`);
        return;
      }
      setCart((prev) => {
        const next = prev.slice();
        const line = next.find((l) => l.id === id);
        const want = Math.max(1, qty || 1);
        if (line) line.qty = Math.min(p.stock, line.qty + want);
        else next.push({ id, qty: Math.min(p.stock, want) });
        return next;
      });
      showToast(`${p.name} added to cart`);
    },
    [findById, setCart, showToast],
  );

  const setLineQty = useCallback(
    (id, qty) => {
      const p = findById(id);
      setCart((prev) => {
        if (qty <= 0) return prev.filter((l) => l.id !== id);
        return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(p ? p.stock : qty, qty) } : l));
      });
    },
    [findById, setCart],
  );

  const toggleWish = useCallback(
    (id) => {
      const p = findById(id);
      setWishlist((prev) => {
        const has = prev.indexOf(id) >= 0;
        showToast(p ? (has ? 'Removed from saved' : `${p.name} saved`) : '');
        return has ? prev.filter((x) => x !== id) : prev.concat([id]);
      });
    },
    [findById, setWishlist, showToast],
  );

  const cartLines = useMemo(
    () => cart.map((l) => ({ ...l, product: findById(l.id) })).filter((l) => l.product),
    [cart, findById],
  );
  const wishItems = useMemo(() => wishlist.map((id) => findById(id)).filter(Boolean), [wishlist, findById]);
  const cartUnits = cartLines.reduce((n, l) => n + l.qty, 0);

  const checkout = useCallback(() => {
    if (!cartLines.length) return;

    // Stock can move (e.g. an admin edit) between adding to cart and checkout — reclamp
    // against current stock before sending, rather than trusting whatever was cached at
    // add-to-cart time.
    const adjustedNames = [];
    const validLines = [];
    cartLines.forEach((l) => {
      const stock = l.product.stock;
      if (stock <= 0) {
        adjustedNames.push(l.product.name);
        return;
      }
      const qty = Math.min(l.qty, stock);
      if (qty !== l.qty) adjustedNames.push(l.product.name);
      validLines.push({ id: l.id, qty });
    });
    if (adjustedNames.length) {
      setCart(validLines);
      showToast(`Stock changed for ${adjustedNames.join(', ')} — cart updated, please review and send again.`);
      return;
    }

    const cartTotal = cartLines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
    const lines = cartLines.map((l) => `• ${l.product.name} × ${l.qty} = ${fmtPKR(l.product.price * l.qty)}`);
    const msg =
      'Assalam o Alaikum, I would like to order:\n' +
      lines.join('\n') +
      '\nSubtotal: ' +
      fmtPKR(cartTotal) +
      '\nPlease confirm availability and installation cost.';
    window.open(waLink(WHATSAPP_NUMBER, msg), '_blank');
    showToast('Order sent — we reply within a few hours');
  }, [cartLines, setCart, showToast]);

  const value = useMemo(
    () => ({ cart, wishlist, cartLines, wishItems, cartUnits, addToCart, setLineQty, toggleWish, checkout }),
    [cart, wishlist, cartLines, wishItems, cartUnits, addToCart, setLineQty, toggleWish, checkout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
