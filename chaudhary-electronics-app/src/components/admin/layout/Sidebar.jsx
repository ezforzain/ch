import { NavLink } from 'react-router-dom';
import { navDefs as adminNavDefs } from '../../../data/admin/navDefs';

/** Collapsible sidebar — transcribed from source's `<aside style="{{ sidebarStyle }}">`
 * block (dark background, 244px / 72px collapsed width, active-item accent tint).
 * Generalized via `navDefs`/`basePath`/`brandLabel` props (all defaulted to the admin
 * panel's original values, so AdminLayout needs no changes) so the Seller Dashboard's
 * layout can reuse this exact component instead of a near-duplicate sibling. */
export default function Sidebar({ collapsed, onToggleCollapsed, navDefs = adminNavDefs, basePath = '/admin', brandLabel = 'Chaudhary Admin' }) {
  return (
    <aside
      className="sticky top-0 flex h-screen flex-shrink-0 flex-col bg-[var(--a-dark)] transition-[width] duration-150"
      style={{ width: collapsed ? '72px' : '244px' }}
    >
      <div
        className="flex items-center gap-2.5 border-b px-4 py-5"
        style={{ borderColor: 'rgba(245,242,236,0.08)' }}
      >
        <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-[9px] bg-[var(--a-acc)] text-[13px] font-bold text-[#17150F]">
          CE
        </span>
        {!collapsed && (
          <span className="text-[15px] font-[650] tracking-[-0.01em] text-[#F5F2EC]">{brandLabel}</span>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          title="Collapse sidebar"
          className="ml-auto h-[22px] w-[22px] rounded-[6px] border-none bg-transparent text-[12px] cursor-pointer"
          style={{ color: 'rgba(245,242,236,0.6)' }}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-3.5">
        {navDefs.map(([key, label, icon]) => {
          const to = key === 'dashboard' ? basePath : `${basePath}/${key}`;
          return (
            <NavLink
              key={key}
              to={to}
              end={key === 'dashboard'}
              title={label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[10px] border-none px-3 py-[11px] text-left cursor-pointer no-underline ${
                  collapsed ? 'justify-center' : 'justify-start'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(226,163,71,0.16)' : 'transparent',
                color: isActive ? '#F0C888' : 'rgba(245,242,236,0.78)',
              })}
            >
              <span className="grid h-[18px] w-[18px] flex-shrink-0 place-items-center text-sm" aria-hidden="true">
                {icon}
              </span>
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
