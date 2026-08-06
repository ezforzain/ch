import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../ui/Modal';
import ConfirmDialog from '../table/ConfirmDialog';
import { cardClass, dangerBtnSmallClass, ghostBtnClass, ghostBtnSmallClass, inputClass } from '../adminStyles';
import { statusStyleFor } from '../../../data/admin/theme';

/**
 * /admin/customers — real buyer accounts (server's User model, role: 'customer'). Bespoke
 * page rather than the generic CollectionTable: buyers are self-registered (nothing to
 * add/edit/duplicate here), the only real action is blocking/unblocking access, which the
 * generic table's Archive button doesn't label correctly for this use case.
 */
export default function Customers() {
  const showToast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [viewRow, setViewRow] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers?limit=200&sort=-createdAt');
      setCustomers(res.data);
    } catch (err) {
      showToast(err.message || 'Could not load customers.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q),
    );
  }, [customers, search]);

  async function setActive(customer, isActive) {
    try {
      const res = await api.patch(`/users/${customer._id}`, { isActive });
      setCustomers((prev) => prev.map((c) => (c._id === customer._id ? res.data : c)));
      showToast(`${customer.name} is now ${isActive ? 'unblocked' : 'blocked'}.`);
      setConfirm(null);
    } catch (err) {
      showToast(err.message || 'Could not update this customer.');
    }
  }

  function confirmBlock(customer) {
    setConfirm({
      message: `Block ${customer.name}? They won't be able to sign in or place orders until unblocked.`,
      onConfirm: () => setActive(customer, false),
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buyers…"
          className={`${inputClass} min-w-[220px]`}
        />
        <span className="text-[12.5px] text-[var(--a-mut)]">{filtered.length} buyer(s)</span>
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-[20px] border border-[var(--a-line)] bg-[var(--a-white)]">
        <table className="w-full min-w-[640px] border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-[var(--a-paper)] text-left text-[11.5px] text-[var(--a-mut)]">
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">City</th>
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
                  No buyers yet — accounts appear here once someone registers.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((c) => (
                <tr key={c._id} className="border-t border-[var(--a-line)]" style={{ opacity: c.isActive === false ? 0.5 : 1 }}>
                  <td className="p-3 font-semibold text-[var(--a-ink)]">{c.name}</td>
                  <td className="p-3">
                    <div>{c.email}</div>
                    <div className="text-[12px] text-[var(--a-mut)]">{c.phone || '—'}</div>
                  </td>
                  <td className="p-3">{c.addresses?.[0]?.city || '—'}</td>
                  <td className="p-3">
                    <span style={statusStyleFor(c.isActive === false ? 'Suspended' : 'Active')}>
                      {c.isActive === false ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" className={ghostBtnSmallClass} onClick={() => setViewRow(c)}>
                        View
                      </button>
                      {c.isActive === false ? (
                        <button type="button" className={ghostBtnSmallClass} onClick={() => setActive(c, true)}>
                          Unblock
                        </button>
                      ) : (
                        <button type="button" className={dangerBtnSmallClass} onClick={() => confirmBlock(c)}>
                          Block
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {viewRow && (
        <Modal open onClose={() => setViewRow(null)} align="center">
          <div className="flex w-full max-w-[420px] flex-col gap-3 rounded-[20px] bg-[var(--a-white)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
            <div className="text-base font-bold">{viewRow.name}</div>
            {[
              ['Email', viewRow.email],
              ['Phone', viewRow.phone || '—'],
              ['City', viewRow.addresses?.[0]?.city || '—'],
              ['Address', viewRow.addresses?.[0]?.line1 || '—'],
              ['Status', viewRow.isActive === false ? 'Blocked' : 'Active'],
              ['Joined', viewRow.createdAt ? new Date(viewRow.createdAt).toLocaleDateString() : '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-t border-[var(--a-line)] py-1.5 text-[13px]">
                <span className="text-[var(--a-mut)]">{label}</span>
                <span className="font-semibold">{val}</span>
              </div>
            ))}
            <button type="button" className={`self-end ${ghostBtnClass}`} onClick={() => setViewRow(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      <div className={cardClass}>
        <div className="text-[13px] text-[var(--a-mut)]">
          Buyers self-register through the storefront — this page reviews real accounts and
          can block/unblock sign-in access; it can't fabricate a buyer account from here.
        </div>
      </div>

      <ConfirmDialog open={!!confirm} message={confirm?.message} onCancel={() => setConfirm(null)} onConfirm={() => confirm.onConfirm()} />
    </div>
  );
}
