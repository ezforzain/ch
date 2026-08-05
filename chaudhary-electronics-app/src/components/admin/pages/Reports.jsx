import { useEffect, useState } from 'react';
import { cardClass, ghostBtnClass } from '../adminStyles';
import { schemas } from '../../../data/admin/schemas';
import { exportCSV } from '../../../lib/adminExport';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../lib/api';
import { fmtPKR } from '../../../lib/format';
import { titleCase } from '../../../lib/adminMappers';

/** /admin/reports — real sales/leads/appointments aggregates from the backend's
 * /api/v1/reports/* endpoints, plus CSV export of the underlying records. */
export default function Reports() {
  const showToast = useToast();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState(null);
  const [leads, setLeads] = useState(null);
  const [appointments, setAppointments] = useState(null);

  useEffect(() => {
    (async () => {
      const [salesRes, leadsRes, apptRes] = await Promise.all([
        api.get('/reports/sales').catch(() => null),
        api.get('/reports/leads').catch(() => null),
        api.get('/reports/appointments').catch(() => null),
      ]);
      setSales(salesRes?.data || null);
      setLeads(leadsRes?.data || null);
      setAppointments(apptRes?.data || null);
      setLoading(false);
    })();
  }, []);

  async function exportCollection(page, schema) {
    try {
      const res = await api.get(`/${page}?limit=500`);
      const rows = res.data.map((doc) => ({ ...doc, id: doc._id, archived: false }));
      exportCSV(page, schema, rows, showToast);
    } catch (err) {
      showToast(err.message || 'Could not export.');
    }
  }

  const summaryCards = sales
    ? [
        { label: 'Orders (last 30 days)', value: String(sales.totals.totalOrders) },
        { label: 'Revenue (last 30 days)', value: fmtPKR(sales.totals.totalRevenue) },
        { label: 'Avg. order value', value: fmtPKR(sales.totals.avgOrderValue || 0) },
        { label: 'Leads (last 30 days)', value: String(leads?.total ?? 0) },
      ]
    : [];

  const maxStatusRevenue = sales?.byStatus.length ? Math.max(...sales.byStatus.map((s) => s.revenue), 1) : 1;
  const maxSourceCount = leads?.bySource.length ? Math.max(...leads.bySource.map((s) => s.count), 1) : 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={cardClass} aria-hidden="true">
                <span className="block h-4 w-2/3 animate-pulse rounded-full bg-[var(--a-line)]" />
                <span className="mt-2 block h-7 w-1/2 animate-pulse rounded-full bg-[var(--a-line)]" />
              </div>
            ))
          : summaryCards.map((r) => (
              <div key={r.label} className={cardClass}>
                <span className="text-[12.5px] text-[var(--a-mut)]">{r.label}</span>
                <div className="text-2xl font-[750]">{r.value}</div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[900px]:!grid-cols-1">
        <div className={cardClass}>
          <div className="mb-3.5 text-[14.5px] font-bold">Revenue by order status (last 30 days)</div>
          {!loading && (sales?.byStatus.length ?? 0) === 0 && (
            <div className="py-4 text-center text-[13px] text-[var(--a-mut)]">No orders in this period yet.</div>
          )}
          {sales?.byStatus.map((s) => (
            <div key={s.status} className="mb-2.5">
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="capitalize">{s.status}</span>
                <span className="text-[var(--a-mut)]" data-tnum>
                  {fmtPKR(s.revenue)} · {s.count} order(s)
                </span>
              </div>
              <div className="h-[7px] rounded-full bg-[var(--a-line)]">
                <div className="h-full rounded-full bg-[var(--a-acc)]" style={{ width: `${Math.round((s.revenue / maxStatusRevenue) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className={cardClass}>
          <div className="mb-3.5 text-[14.5px] font-bold">Leads by source (last 30 days)</div>
          {!loading && (leads?.bySource.length ?? 0) === 0 && (
            <div className="py-4 text-center text-[13px] text-[var(--a-mut)]">No leads in this period yet.</div>
          )}
          {leads?.bySource.map((s) => (
            <div key={s.source} className="mb-2.5">
              <div className="mb-1 flex justify-between text-[13px]">
                <span>{titleCase(s.source)}</span>
                <span className="text-[var(--a-mut)]">{s.count}</span>
              </div>
              <div className="h-[7px] rounded-full bg-[var(--a-line)]">
                <div className="h-full rounded-full bg-[var(--a-acc)]" style={{ width: `${Math.round((s.count / maxSourceCount) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-3.5 text-[14.5px] font-bold">Appointments by status (last 30 days)</div>
        <div className="flex flex-wrap gap-2.5">
          {appointments?.byStatus.length ? (
            appointments.byStatus.map((s) => (
              <span
                key={s.status}
                className="rounded-full border border-[var(--a-line)] bg-[var(--a-paper)] px-3.5 py-2 text-[13px] font-semibold capitalize"
              >
                {s.status}: {s.count}
              </span>
            ))
          ) : (
            <span className="text-[13px] text-[var(--a-mut)]">No appointments in this period yet.</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button type="button" className={ghostBtnClass} onClick={() => exportCollection('leads', schemas.leads)}>
          Export leads CSV
        </button>
        <button type="button" className={ghostBtnClass} onClick={() => exportCollection('orders', schemas.orders)}>
          Export orders CSV
        </button>
        <button type="button" className={ghostBtnClass} onClick={() => exportCollection('projects', schemas.projects)}>
          Export projects CSV
        </button>
      </div>
    </div>
  );
}
