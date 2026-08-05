import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import ConfirmDialog from '../table/ConfirmDialog';
import {
  cardClass,
  dangerBtnSmallClass,
  ghostBtnSmallClass,
  inputClass,
  primaryBtnClass,
} from '../adminStyles';
import { statusStyleFor } from '../../../data/admin/theme';

const STATUS_LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', suspended: 'Suspended' };

/**
 * /admin/sellers — Marketplace seller management: review pending sellers, approve/reject/
 * suspend accounts. (Product Approval itself is done from the Products page — filter its
 * Status column to "Draft" to see items awaiting review, then edit → set Active to approve;
 * a second dedicated table would just duplicate that same data and action.)
 */
export default function Sellers() {
  const showToast = useToast();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/sellers?limit=200&sort=-createdAt');
      setSellers(res.data);
    } catch (err) {
      showToast(err.message || 'Could not load sellers.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.sellerProfile?.businessName || '').toLowerCase().includes(q),
    );
  }, [sellers, search]);

  async function setStatus(seller, status) {
    try {
      const res = await api.patch(`/sellers/${seller._id}/status`, { status });
      setSellers((prev) => prev.map((s) => (s._id === seller._id ? res.data : s)));
      showToast(`${seller.name} is now ${STATUS_LABEL[status].toLowerCase()}.`);
    } catch (err) {
      showToast(err.message || 'Could not update seller status.');
    }
  }

  function confirmSuspend(seller) {
    setConfirm({
      message: `Suspend ${seller.name}? Their products stay listed but they won't be able to manage them.`,
      onConfirm: () => {
        setStatus(seller, 'suspended');
        setConfirm(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sellers…"
          className={`${inputClass} min-w-[220px]`}
        />
        <span className="text-[12.5px] text-[var(--a-mut)]">{filtered.length} seller(s)</span>
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-[20px] border border-[var(--a-line)] bg-[var(--a-white)]">
        <table className="w-full min-w-[680px] border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-[var(--a-paper)] text-left text-[11.5px] text-[var(--a-mut)]">
              <th className="p-3">Business</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Commission</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }, (_, i) => (
                <tr key={i} className="border-t border-[var(--a-line)]" aria-hidden="true">
                  <td className="p-3" colSpan={5}>
                    <span className="block h-4 w-2/3 animate-pulse rounded-full bg-[var(--a-line)]" />
                  </td>
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-[var(--a-mut)]">
                  No sellers yet — accounts appear here once someone registers as a seller.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((s) => (
                <tr key={s._id} className="border-t border-[var(--a-line)]">
                  <td className="p-3">
                    <div className="font-semibold text-[var(--a-ink)]">{s.sellerProfile?.businessName || s.name}</div>
                    <div className="text-[12px] text-[var(--a-mut)]">{s.name}</div>
                  </td>
                  <td className="p-3">
                    <div>{s.email}</div>
                    <div className="text-[12px] text-[var(--a-mut)]">{s.phone || '—'}</div>
                  </td>
                  <td className="p-3">{s.sellerProfile?.commissionRate ?? 10}%</td>
                  <td className="p-3">
                    <span style={statusStyleFor(STATUS_LABEL[s.sellerProfile?.status] || 'Pending')}>
                      {STATUS_LABEL[s.sellerProfile?.status] || 'Pending'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {s.sellerProfile?.status !== 'approved' && (
                        <button type="button" className={primaryBtnClass} onClick={() => setStatus(s, 'approved')}>
                          Approve
                        </button>
                      )}
                      {s.sellerProfile?.status !== 'rejected' && s.sellerProfile?.status === 'pending' && (
                        <button type="button" className={ghostBtnSmallClass} onClick={() => setStatus(s, 'rejected')}>
                          Reject
                        </button>
                      )}
                      {s.sellerProfile?.status === 'approved' && (
                        <button type="button" className={dangerBtnSmallClass} onClick={() => confirmSuspend(s)}>
                          Suspend
                        </button>
                      )}
                      {s.sellerProfile?.status === 'suspended' && (
                        <button type="button" className={ghostBtnSmallClass} onClick={() => setStatus(s, 'approved')}>
                          Reinstate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className={cardClass}>
        <div className="text-[13px] text-[var(--a-mut)]">
          Product approval: filter the <strong>Products</strong> page's Status column to
          "Draft" to see items awaiting review — edit and set Status to "Active" to approve.
        </div>
      </div>

      <ConfirmDialog open={!!confirm} message={confirm?.message} onCancel={() => setConfirm(null)} onConfirm={() => confirm.onConfirm()} />
    </div>
  );
}
