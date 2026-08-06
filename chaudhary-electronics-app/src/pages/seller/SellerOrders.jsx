import { useEffect, useState } from 'react';
import { cardClass, pagerBtnClass } from '../../components/admin/adminStyles';
import { statusStyleFor } from '../../data/admin/theme';
import { fmtPKR } from '../../lib/format';

function titleCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Read-only, seller-scoped orders table — intentionally NOT the generic admin
 * CollectionTable/useApiCollection combo, since a seller can't edit order status
 * (that's admin/superadmin-only via PATCH /orders/:id/status). Each order returned by
 * GET /orders/seller includes every line item in that order (other sellers' items too,
 * for multi-seller carts), so `myLineItems`/`myOrderTotal` (from useSellerData) narrow
 * each row down to just this seller's own items and their value.
 */
export default function SellerOrders({ seller }) {
  const { orders, ordersLoading, pagination, refetchOrders, myLineItems, myOrderTotal } = seller;
  const [page, setPage] = useState(1);

  useEffect(() => {
    refetchOrders(`?page=${page}&limit=15`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = pagination?.pages || 1;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="overflow-hidden overflow-x-auto rounded-[20px] border border-[var(--a-line)] bg-[var(--a-white)]">
        <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-[var(--a-paper)] text-left text-[11.5px] text-[var(--a-mut)]">
              <th className="p-3">Order</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Your items</th>
              <th className="p-3">Your total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {ordersLoading &&
              Array.from({ length: 5 }, (_, i) => (
                <tr key={`skeleton-${i}`} className="border-t border-[var(--a-line)]" aria-hidden="true">
                  {Array.from({ length: 7 }, (_, j) => (
                    <td key={j} className="p-3">
                      <span className="block h-4 w-4/5 animate-pulse rounded-full bg-[var(--a-line)]" />
                    </td>
                  ))}
                </tr>
              ))}
            {!ordersLoading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-[var(--a-mut)]">
                  No orders yet — once a buyer orders one of your products, it will show up here.
                </td>
              </tr>
            )}
            {!ordersLoading &&
              orders.map((o) => {
                const lines = myLineItems(o);
                return (
                  <tr key={o._id} className="border-t border-[var(--a-line)]">
                    <td className="p-3 font-semibold text-[var(--a-ink)]">{o.orderNumber}</td>
                    <td className="p-3 text-[var(--a-mut)]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">{o.contactName}</td>
                    <td className="max-w-[260px] p-3">
                      {lines.map((l) => (
                        <div key={l.product} className="whitespace-nowrap">
                          {l.name} × {l.qty}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 font-semibold">{fmtPKR(myOrderTotal(o))}</td>
                    <td className="p-3">
                      <span style={statusStyleFor(titleCase(o.status))}>{titleCase(o.status)}</span>
                    </td>
                    <td className="p-3">
                      <span style={statusStyleFor(titleCase(o.paymentStatus))}>{titleCase(o.paymentStatus)}</span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3.5">
          <button type="button" className={pagerBtnClass} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span className="text-[12.5px] text-[var(--a-mut)]">
            Page {page} of {totalPages}
          </span>
          <button type="button" className={pagerBtnClass} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}

      <div className={cardClass}>
        <p className="text-[13px] text-[var(--a-mut)]">
          Order status is managed by our team — message support if something looks wrong on an order.
        </p>
      </div>
    </div>
  );
}
