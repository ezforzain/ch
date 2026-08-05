import { Line } from 'react-chartjs-2';
import { sparkConfig } from '../../../data/admin/dashboardData';
import { cardClass } from '../adminStyles';

/** One dashboard stat tile with an embedded react-chartjs-2 sparkline
 * (no axes/gridlines/tooltip — matches source's tiny `sparkCfg()` look)
 * plus a trend %, colored green/red by direction. `trend` is optional —
 * real backend-derived stats have no historical series to compare against
 * (no month-over-month endpoint yet), so the sparkline/% row is omitted
 * rather than showing a fabricated number. */
export default function StatCard({ label, value, icon, iconBg, trend }) {
  const sparkline = trend ? sparkConfig(trend) : null;

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-[var(--a-mut)]">{label}</span>
        <span
          className="grid h-8 w-8 place-items-center rounded-[9px] text-sm"
          style={{ background: iconBg }}
        >
          {icon}
        </span>
      </div>
      <div className="text-[27px] font-[750] tracking-[-0.02em]">{value}</div>
      {trend && (
        <>
          <div className="flex items-center justify-between gap-2.5">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: trend.up ? 'var(--a-success)' : 'var(--a-danger)' }}
            >
              {trend.pctLabel}
            </span>
            <div style={{ width: 72, height: 28, flexShrink: 0 }}>
              <Line data={sparkline.data} options={sparkline.options} width={72} height={28} />
            </div>
          </div>
          <div className="text-[11px] text-[var(--a-mut)]">vs last month</div>
        </>
      )}
    </div>
  );
}
