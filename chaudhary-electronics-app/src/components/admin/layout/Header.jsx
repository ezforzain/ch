import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useAdminTheme } from '../../../context/admin/AdminThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useHeaderCounts } from '../../../hooks/admin/useHeaderCounts';
import { navDefs } from '../../../data/admin/navDefs';

const iconBtnClass =
  'grid h-9 w-9 flex-shrink-0 cursor-pointer place-items-center rounded-[10px] border border-[var(--a-line)] bg-[var(--a-white)] text-[15px] text-[var(--a-ink)]';
const dropdownClass =
  'animate-admin-drop-in absolute right-0 top-11 z-[250] min-w-[260px] max-w-[300px] rounded-[14px] border border-[var(--a-line)] bg-[var(--a-white)] p-2.5 shadow-[0_20px_48px_-18px_rgba(23,21,15,0.35)]';
const dropdownItemClass =
  'w-full cursor-pointer rounded-[6px] border-none bg-transparent px-1.5 py-2.5 text-left text-[13px] text-[var(--a-ink)]';

function titleFor(pageKey) {
  const found = navDefs.find(([k]) => k === pageKey);
  return found ? found[1] : pageKey;
}

/** Derives the current admin page key from the URL — 'dashboard' for the
 * index route, otherwise the first path segment after /admin. */
function usePageKey() {
  const { pathname } = useLocation();
  return useMemo(() => {
    const rest = pathname.replace(/^\/admin\/?/, '');
    return rest ? rest.split('/')[0] : 'dashboard';
  }, [pathname]);
}

export default function Header() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { theme, toggleTheme } = useAdminTheme();
  const { user, logout } = useAuth();
  const pageKey = usePageKey();
  const {
    newLeadsCount,
    unreadMessagesCount,
    pendingOrdersCount,
    unreadNotificationsCount,
    recentMessages,
    recentNotifications,
  } = useHeaderCounts();

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

  const [dropdown, setDropdown] = useState(null); // null | 'notif' | 'messages' | 'profile'
  const [globalSearch, setGlobalSearch] = useState('');

  const toggleDropdown = (name) => setDropdown((d) => (d === name ? null : name));
  const closeDropdowns = () => setDropdown(null);

  const summaryItems = [
    newLeadsCount > 0 && { text: `${newLeadsCount} new lead(s) today` },
    pendingOrdersCount > 0 && { text: `${pendingOrdersCount} order(s) pending` },
  ].filter(Boolean);

  function globalSearchSubmit(e) {
    if (e.key !== 'Enter') return;
    const q = globalSearch.trim().toLowerCase();
    if (!q) return;
    const match = navDefs.find(([k, l]) => l.toLowerCase().includes(q) || k.includes(q));
    if (match) {
      navigate(match[0] === 'dashboard' ? '/admin' : `/admin/${match[0]}`);
      setGlobalSearch('');
    } else {
      showToast('No matching page found.');
    }
  }

  return (
    <header
      className="sticky top-0 z-[200] flex items-center gap-4 border-b border-[var(--a-line)] px-6 py-3.5 backdrop-blur-[14px]"
      style={{ background: theme === 'dark' ? 'rgba(28,26,21,0.85)' : 'rgba(251,250,247,0.85)' }}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="font-mono text-[11px] tracking-[0.06em] text-[var(--a-mut)]">
          Admin / {titleFor(pageKey)}
        </div>
        <div className="text-[19px] font-bold tracking-[-0.02em]">{titleFor(pageKey)}</div>
      </div>

      <div className="relative ml-6 max-w-[340px] flex-1 max-[900px]:hidden">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--a-mut)]">
          ⌕
        </span>
        <input
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          onKeyDown={globalSearchSubmit}
          placeholder="Search modules… (press Enter)"
          className="h-[38px] w-full rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] pl-8 pr-3 text-[13.5px] text-[var(--a-ink)] outline-none"
        />
      </div>

      <div className="relative ml-auto flex items-center gap-2">
        <button type="button" onClick={toggleTheme} title="Toggle dark mode" className={iconBtnClass}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('notif')}
            title="Notifications"
            aria-haspopup="true"
            aria-expanded={dropdown === 'notif'}
            className={`${iconBtnClass} relative`}
          >
            ◔
            {unreadNotificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-lg bg-[var(--a-danger)] px-[3px] text-[9.5px] font-bold text-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          {dropdown === 'notif' && (
            <div role="menu" aria-label="Notifications" className={dropdownClass}>
              <div className="p-1 pb-2 text-[13px] font-bold">Notifications</div>
              {summaryItems.map((n, i) => (
                <div key={i} className="border-t border-[var(--a-line)] p-[9px] px-1.5 text-[13px]">
                  {n.text}
                </div>
              ))}
              {recentNotifications.length === 0 && summaryItems.length === 0 && (
                <div className="border-t border-[var(--a-line)] p-[9px] px-1.5 text-[13px]">You're all caught up.</div>
              )}
              {recentNotifications.slice(0, 4).map((n) => (
                <div key={n._id} className="border-t border-[var(--a-line)] p-[9px] px-1.5">
                  <div className="text-[13px] font-semibold">{n.title}</div>
                  <div className="text-[12.5px] text-[var(--a-mut)]">{n.message}</div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  navigate('/admin/notifications');
                  closeDropdowns();
                }}
                className="mt-2 h-[34px] w-full cursor-pointer rounded-lg border-none bg-[var(--a-ink)] text-[12.5px] font-semibold text-[var(--a-white)]"
              >
                View all
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('messages')}
            title="Messages"
            aria-haspopup="true"
            aria-expanded={dropdown === 'messages'}
            className={`${iconBtnClass} relative`}
          >
            ✉
            {unreadMessagesCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-lg bg-[var(--a-danger)] px-[3px] text-[9.5px] font-bold text-white">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          {dropdown === 'messages' && (
            <div role="menu" aria-label="Messages" className={dropdownClass}>
              <div className="p-1 pb-2 text-[13px] font-bold">Recent messages</div>
              {recentMessages.length === 0 && (
                <div className="border-t border-[var(--a-line)] p-[9px] px-1.5 text-[13px] text-[var(--a-mut)]">No messages yet.</div>
              )}
              {recentMessages.slice(0, 3).map((m) => (
                <div key={m._id} className="border-t border-[var(--a-line)] p-[9px] px-1.5">
                  <div className="text-[13px] font-semibold">{m.name}</div>
                  <div className="text-[12.5px] text-[var(--a-mut)]">{m.body}</div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  navigate('/admin/messages');
                  closeDropdowns();
                }}
                className="mt-2 h-[34px] w-full cursor-pointer rounded-lg border-none bg-[var(--a-ink)] text-[12.5px] font-semibold text-[var(--a-white)]"
              >
                View all
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('profile')}
            aria-haspopup="true"
            aria-expanded={dropdown === 'profile'}
            aria-label="Profile menu"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-[var(--a-dark)] text-[12px] font-bold text-[#F5F2EC]"
          >
            {initials}
          </button>
          {dropdown === 'profile' && (
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
                  navigate('/admin/profile');
                  closeDropdowns();
                }}
              >
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className={dropdownItemClass}
                onClick={() => {
                  navigate('/admin/settings');
                  closeDropdowns();
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
                  closeDropdowns();
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>

        {dropdown && (
          <div onClick={closeDropdowns} className="fixed inset-0 z-[150]" aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
