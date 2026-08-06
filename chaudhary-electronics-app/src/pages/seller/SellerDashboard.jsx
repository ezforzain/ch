import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { cardClass } from '../../components/admin/adminStyles';
import StatCard from '../../components/admin/dashboard/StatCard';
import { fmtPKR, fmtNum } from '../../lib/format';

const STATUS_LABELS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const ACC_PALETTE = ['#E2A347', '#2A4E7A', '#3E7C4A', '#C1442A', '#8A6D3B', '#6E675C'];

function LiveBar({ labels, values, height, color = '#2A4E7A' }) {
  const data = { labels, datasets: [{ label: 'Orders', data: values, backgroundColor: color, borderRadius: 6 }] };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };
  return (
    <div className="relative w-full" style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/** Seller Dashboard overview — stat cards + an orders-by-status chart, using the same
 * chart.js/react-chartjs-2 wrapper pattern and ACC_PALETTE as the admin Dashboard (see
 * src/components/admin/dashboard/Dashboard.jsx), just scoped to this seller's own data. */
export default function SellerDashboard({ seller }) {
  const { stats, statsLoading, orders, ordersLoading } = seller;

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(STATUS_LABELS.map((s) => [s, 0]));
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status] += 1;
    });
    return counts;
  }, [orders]);

  const statCards = stats
    ? [
        ['Products', fmtNum(stats.productCount), '▥', ACC_PALETTE[0]],
        ['Active products', fmtNum(stats.activeProductCount), '◆', ACC_PALETTE[2]],
        ['Orders', fmtNum(stats.orderCount), '▤', ACC_PALETTE[1]],
        ['Units sold', fmtNum(stats.unitsSold), '⇄', ACC_PALETTE[4]],
        ['Revenue', fmtPKR(stats.revenue), '৳', ACC_PALETTE[3]],
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
        {statsLoading
          ? Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={cardClass} aria-hidden="true">
                <span className="block h-4 w-2/3 animate-pulse rounded-full bg-[var(--a-line)]" />
                <span className="mt-2 block h-7 w-1/2 animate-pulse rounded-full bg-[var(--a-line)]" />
              </div>
            ))
          : statCards.map(([label, value, icon, iconBg]) => (
              <StatCard key={label} label={label} value={value} icon={icon} iconBg={`${iconBg}26`} />
            ))}
      </div>

      <div className={cardClass}>
        <div className="mb-2.5 text-[14.5px] font-bold">Orders by status</div>
        {ordersLoading ? (
          <div className="flex h-[240px] items-center justify-center text-[13px] text-[var(--a-mut)]">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-[13px] text-[var(--a-mut)]">
            No orders yet — once a buyer orders one of your products, it will show up here.
          </div>
        ) : (
          <LiveBar
            labels={STATUS_LABELS.map((s) => s.charAt(0).toUpperCase() + s.slice(1))}
            values={STATUS_LABELS.map((s) => statusCounts[s])}
            height={240}
          />
        )}
      </div>
    </div>
  );
}
