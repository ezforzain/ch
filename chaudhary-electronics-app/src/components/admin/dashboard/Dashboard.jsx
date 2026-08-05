import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { cardClass } from '../adminStyles';
import StatCard from './StatCard';
import { chartConfigs } from '../../../data/admin/dashboardData';
import { useProducts } from '../../../context/ProductsContext';
import { useDashboardData } from '../../../hooks/admin/useDashboardData';
import { fmtPKR } from '../../../lib/format';
import { titleCase } from '../../../lib/adminMappers';

const CHART_BY_TYPE = { line: Line, bar: Bar, doughnut: Doughnut };

function StaticChart({ cfgKey, height }) {
  const cfg = chartConfigs[cfgKey];
  const C = CHART_BY_TYPE[cfg.type];
  return (
    <div className="relative w-full" style={{ height }}>
      <C data={cfg.data} options={cfg.options} />
    </div>
  );
}

const ACC_PALETTE = ['#E2A347', '#2A4E7A', '#3E7C4A', '#C1442A', '#8A6D3B', '#6E675C'];

function LiveDoughnut({ labels, values, height }) {
  const data = {
    labels,
    datasets: [{ data: values, backgroundColor: labels.map((_, i) => ACC_PALETTE[i % ACC_PALETTE.length]) }],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
  };
  return (
    <div className="relative w-full" style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

function LiveBar({ labels, values, height, color = '#2A4E7A' }) {
  const data = { labels, datasets: [{ label: 'Value', data: values, backgroundColor: color, borderRadius: 6 }] };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };
  return (
    <div className="relative w-full" style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}

const quickActions = [
  { label: '+ Add Lead', page: 'leads' },
  { label: '+ Add Product', page: 'products' },
  { label: '+ Add Project', page: 'projects' },
  { label: '+ Add Blog', page: 'blog' },
  { label: '+ Add Team Member', page: 'team' },
];

/** Dashboard index route — stat cards, recent-activity cards and lead-source/top-product
 * charts are real (backend-derived via useDashboardData); the remaining charts (monthly
 * leads trend, WhatsApp analytics, callback requests, top cities, customer growth,
 * service-request mix) stay as clearly-scoped illustrative placeholders — the backend has
 * no dedicated trend-over-time endpoint for those yet (see server/README.md's "known
 * simplifications"), and fabricating numbers for them would be worse than a demo chart. */
export default function Dashboard() {
  const productsStore = useProducts();
  const { products } = productsStore;
  const {
    statCards,
    loading,
    leadSources,
    topProducts,
    recentLeads,
    recentOrders,
    recentAppointments,
    recentMessages,
    recentActivity,
  } = useDashboardData();

  const marketplaceStats = [
    { label: 'Products added', value: String(products.length) },
    { label: 'Active products', value: String(products.filter((p) => p.status === 'Active').length) },
    { label: 'Out of stock', value: String(products.filter((p) => p.stock === 0).length) },
    { label: 'Draft products', value: String(products.filter((p) => p.status === 'Draft').length) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
        {loading
          ? Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={cardClass} aria-hidden="true">
                <span className="block h-4 w-2/3 animate-pulse rounded-full bg-[var(--a-line)]" />
                <span className="mt-2 block h-7 w-1/2 animate-pulse rounded-full bg-[var(--a-line)]" />
              </div>
            ))
          : statCards.map(([label, value, icon, iconBg]) => (
              <StatCard key={label} label={label} value={value} icon={icon} iconBg={iconBg} />
            ))}
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-3.5 max-[900px]:!grid-cols-1">
        <div className={cardClass}>
          <div className="mb-2.5 text-[14.5px] font-bold">Monthly leads (illustrative)</div>
          <StaticChart cfgKey="monthlyLeads" height={240} />
        </div>
        <div className={cardClass}>
          <div className="mb-2.5 text-[14.5px] font-bold">Lead sources</div>
          {leadSources.length > 0 ? (
            <LiveDoughnut
              labels={leadSources.map((s) => titleCase(s.source))}
              values={leadSources.map((s) => s.count)}
              height={240}
            />
          ) : (
            <StaticChart cfgKey="leadSources" height={240} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[900px]:!grid-cols-1">
        <div className={cardClass}>
          <div className="mb-2.5 text-[14.5px] font-bold">Service requests (illustrative)</div>
          <StaticChart cfgKey="serviceRequests" height={240} />
        </div>
        <div className={cardClass}>
          <div className="mb-2.5 text-[14.5px] font-bold">Project status (illustrative)</div>
          <StaticChart cfgKey="projectStatus" height={240} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[900px]:!grid-cols-1">
        <div className={cardClass}>
          <div className="mb-2.5 text-[14.5px] font-bold">WhatsApp analytics (illustrative)</div>
          <StaticChart cfgKey="whatsapp" height={220} />
        </div>
        <div className={cardClass}>
          <div className="mb-2.5 text-[14.5px] font-bold">Callback requests (illustrative)</div>
          <StaticChart cfgKey="callback" height={220} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[900px]:!grid-cols-1">
        <div className={cardClass}>
          <div className="mb-2.5 text-[14.5px] font-bold">Top cities (illustrative)</div>
          <StaticChart cfgKey="topCitiesChart" height={240} />
        </div>
        <div className={cardClass}>
          <div className="mb-2.5 text-[14.5px] font-bold">Top selling products</div>
          {topProducts.length > 0 ? (
            <LiveBar labels={topProducts.map((p) => p.name)} values={topProducts.map((p) => p.popularity)} height={240} />
          ) : (
            <StaticChart cfgKey="topProducts" height={240} />
          )}
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-2.5 text-[14.5px] font-bold">Marketplace analytics</div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
          {marketplaceStats.map((m) => (
            <div key={m.label} className="rounded-[14px] border border-[var(--a-line)] bg-[var(--a-paper)] p-3.5">
              <div className="text-xs text-[var(--a-mut)]">{m.label}</div>
              <div className="text-xl font-[750]">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-2.5 text-[14.5px] font-bold">Customer growth (illustrative)</div>
        <StaticChart cfgKey="customerGrowth" height={220} />
      </div>

      <div className="grid grid-cols-3 gap-3.5 max-[900px]:!grid-cols-1">
        <div className={cardClass}>
          <div className="mb-2.5 text-sm font-bold">Recent leads</div>
          {recentLeads.length === 0 && <div className="py-2 text-[13px] text-[var(--a-mut)]">No leads yet.</div>}
          {recentLeads.map((l) => (
            <div key={l._id} className="border-t border-[var(--a-line)] py-2 text-[13px]">
              <span className="font-semibold">{l.name}</span> — {l.city || '—'}
            </div>
          ))}
        </div>
        <div className={cardClass}>
          <div className="mb-2.5 text-sm font-bold">Recent orders</div>
          {recentOrders.length === 0 && <div className="py-2 text-[13px] text-[var(--a-mut)]">No orders yet.</div>}
          {recentOrders.map((o) => (
            <div key={o._id} className="border-t border-[var(--a-line)] py-2 text-[13px]">
              <span className="font-semibold">{o.orderNumber}</span> — {fmtPKR(o.total)}
            </div>
          ))}
        </div>
        <div className={cardClass}>
          <div className="mb-2.5 text-sm font-bold">Recent appointments</div>
          {recentAppointments.length === 0 && <div className="py-2 text-[13px] text-[var(--a-mut)]">No appointments yet.</div>}
          {recentAppointments.map((a) => (
            <div key={a._id} className="border-t border-[var(--a-line)] py-2 text-[13px]">
              <span className="font-semibold">{a.name}</span> — {a.serviceType}
            </div>
          ))}
        </div>
        <div className={cardClass}>
          <div className="mb-2.5 text-sm font-bold">Recent messages</div>
          {recentMessages.length === 0 && <div className="py-2 text-[13px] text-[var(--a-mut)]">No messages yet.</div>}
          {recentMessages.map((m) => (
            <div key={m._id} className="border-t border-[var(--a-line)] py-2 text-[13px]">
              <span className="font-semibold">{m.name}</span>: {(m.body || '').slice(0, 40)}
            </div>
          ))}
        </div>
        <div className={cardClass}>
          <div className="mb-2.5 text-sm font-bold">Latest marketplace products</div>
          {products.length === 0 && <div className="py-2 text-[13px] text-[var(--a-mut)]">No products yet.</div>}
          {products.slice(0, 3).map((p) => (
            <div key={p.id} className="border-t border-[var(--a-line)] py-2 text-[13px]">
              <span className="font-semibold">{p.name}</span> — {fmtPKR(p.price)}
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-3 text-[14.5px] font-bold">Recent activity</div>
        {recentActivity.length === 0 && <div className="py-2 text-[13px] text-[var(--a-mut)]">No activity recorded yet.</div>}
        {recentActivity.map((a) => (
          <div key={a._id} className="flex gap-2.5 py-2">
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--a-acc)]" />
            <div>
              <div className="text-[13px]">
                <strong>{a.userName}</strong> {a.action} {a.module}
              </div>
              <div className="text-[11.5px] text-[var(--a-mut)]">{new Date(a.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={cardClass}>
        <div className="mb-3 text-[14.5px] font-bold">Quick actions</div>
        <div className="flex flex-wrap gap-2.5">
          {quickActions.map((q) => (
            <Link
              key={q.page}
              to={`/admin/${q.page}`}
              className="flex h-10 cursor-pointer items-center rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-4 text-[13px] font-semibold text-[var(--a-ink)] no-underline"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
