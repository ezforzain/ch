import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../ui/Breadcrumbs';
import { useToast } from '../../../context/ToastContext';
import { useAdminTheme } from '../../../context/admin/AdminThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { sellerNavDefs } from '../../../data/seller/sellerNavDefs';
import { resolveImageUrl } from '../../../lib/api';

const iconBtnClass =
  'grid h-9 w-9 flex-shrink-0 cursor-pointer place-items-center rounded-[10px] border border-[var(--a-line)] bg-[var(--a-white)] text-[15px] text-[var(--a-ink)]';
const dropdownClass =
  'animate-admin-drop-in absolute right-0 top-11 z-[250] min-w-[240px] rounded-[14px] border border-[var(--a-line)] bg-[var(--a-white)] p-2.5 shadow-[0_20px_48px_-18px_rgba(23,21,15,0.35)]';
const dropdownItemClass =
  'w-full cursor-pointer rounded-[6px] border-none bg-transparent px-1.5 py-2.5 text-left text-[13px] text-[var(--a-ink)]';

function titleFor(pageKey) {
  const found = sellerNavDefs.find(([k]) => k === pageKey);
  return found ? found[1] : pageKey;
}

/** Derives the current seller page key from the URL — 'dashboard' for the index route,
 * otherwise the first path segment after /seller. Mirrors admin Header's usePageKey(). */
function usePageKey() {
  const { pathname } = useLocation();
  return useMemo(() => {
    const rest = pathname.replace(/^\/seller\/?/, '');
    return rest ? rest.split('/')[0] : 'dashboard';
  }, [pathname]);
}

/**
 * Seller-specific header — breadcrumb + page title, theme toggle, profile menu.
 * Deliberately NOT shared with admin's Header.jsx: that component's useHeaderCounts()
 * hits admin-only endpoints (/leads, /orders, /notifications) a seller account would
 * 403 on, so this is a smaller, purpose-built sibling instead of a shared component
 * with extra role-branching baked in.
 */
export default function SellerHeader() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { theme, toggleTheme } = useAdminTheme();
  const { user, logout } = useAuth();
  const pageKey = usePageKey();
  const [dropdown, setDropdown] = useState(false);

  async function handleLogout() {
    await logout();
    showToast('Logged out.');
    navigate('/login');
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatarUrl = resolveImageUrl(user?.avatar?.url);

  return (
    <header
      className="sticky top-0 z-[200] flex items-center gap-4 border-b border-[var(--a-line)] px-6 py-3.5 backdrop-blur-[14px]"
      style={{ background: theme === 'dark' ? 'rgba(28,26,21,0.85)' : 'rgba(251,250,247,0.85)' }}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <Breadcrumbs
          items={[{ label: 'Seller', to: '/seller' }, { label: titleFor(pageKey) }]}
          className="font-mono text-[11px] tracking-[0.06em]"
          linkClassName="text-[var(--a-mut)] transition-colors hover:text-[var(--a-ink)]"
          currentClassName="text-[var(--a-mut)]"
          separatorClassName="text-[var(--a-line)]"
        />
        <div className="text-[19px] font-bold tracking-[-0.02em]">{titleFor(pageKey)}</div>
      </div>

      <div className="relative ml-auto flex items-center gap-2">
        <button type="button" onClick={toggleTheme} title="Toggle dark mode" className={iconBtnClass}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdown((d) => !d)}
            aria-haspopup="true"
            aria-expanded={dropdown}
            aria-label="Profile menu"
            className="grid h-8 w-8 cursor-pointer place-items-center overflow-hidden rounded-full border-none bg-[var(--a-dark)] text-[12px] font-bold text-[#F5F2EC]"
          >
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
          </button>
          {dropdown && (
            <div role="menu" aria-label="Profile" className={dropdownClass}>
              <div className="border-b border-[var(--a-line)] p-1.5 pb-2.5">
                <div className="text-[13.5px] font-bold">{user?.name || 'Account'}</div>
                <div className="text-xs text-[var(--a-mut)] capitalize">{user?.role}</div>
              </div>
              <button
                type="button"
                role="menuitem"
                className={dropdownItemClass}
                onClick={() => {
                  navigate('/seller/settings');
                  setDropdown(false);
                }}
              >
                Settings
              </button>
              <div className="flex items-center justify-between px-1.5 py-[9px]">
                <span className="text-[13px]">Dark mode</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="relative h-5 w-9 cursor-pointer rounded-full border-none"
                  style={{ background: theme === 'dark' ? 'var(--a-acc)' : 'var(--a-line)' }}
                >
                  <span
                    className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[left]"
                    style={{ left: theme === 'dark' ? '18px' : '2px' }}
                  />
                </button>
              </div>
              <button
                type="button"
                role="menuitem"
                className={`${dropdownItemClass} text-[var(--a-danger)]`}
                onClick={() => {
                  handleLogout();
                  setDropdown(false);
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>

        {dropdown && <div onClick={() => setDropdown(false)} className="fixed inset-0 z-[150]" aria-hidden="true" />}
      </div>
    </header>
  );
}
