import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import ConfirmDialog from '../table/ConfirmDialog';
import { cardClass, dangerBtnSmallClass, ghostBtnClass, ghostBtnSmallClass, primaryBtnClass } from '../adminStyles';

const TYPE_ICON = { order: '▤', message: '✉', system: '⚑' };

/**
 * /admin/notifications — real inbox (server's Notification model), addressed either to this
 * admin directly or broadcast to role: 'admin' (new orders, low-stock alerts, new seller
 * signups awaiting approval — see server/src/controllers/{order,auth}.controller.js).
 */
export default function Notifications() {
  const showToast = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=100&sort=-createdAt');
      setItems(res.data);
    } catch (err) {
      showToast(err.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => (filter === 'unread' ? items.filter((n) => !n.isRead) : items), [items, filter]);
  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  async function markRead(notification) {
    if (notification.isRead) return;
    try {
      const res = await api.patch(`/notifications/${notification._id}/read`);
      setItems((prev) => prev.map((n) => (n._id === notification._id ? res.data : n)));
    } catch (err) {
      showToast(err.message || 'Could not update notification.');
    }
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.');
    } catch (err) {
      showToast(err.message || 'Could not update notifications.');
    }
  }

  function openNotification(notification) {
    markRead(notification);
    if (notification.link) navigate(notification.link);
  }

  function confirmDelete(notification) {
    setConfirm({
      message: 'Delete this notification?',
      onConfirm: async () => {
        try {
          await api.delete(`/notifications/${notification._id}`);
          setItems((prev) => prev.filter((n) => n._id !== notification._id));
        } catch (err) {
          showToast(err.message || 'Could not delete notification.');
        } finally {
          setConfirm(null);
        }
      },
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? primaryBtnClass : ghostBtnClass}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? primaryBtnClass : ghostBtnClass}
          >
            Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        </div>
        {unreadCount > 0 && (
          <button type="button" className={`ml-auto ${ghostBtnClass}`} onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {loading &&
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={cardClass} aria-hidden="true">
              <span className="block h-4 w-2/3 animate-pulse rounded-full bg-[var(--a-line)]" />
              <span className="mt-1.5 block h-3 w-1/3 animate-pulse rounded-full bg-[var(--a-line)]" />
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <div className={cardClass}>
            <div className="py-6 text-center text-[13px] text-[var(--a-mut)]">
              {filter === 'unread' ? "You're all caught up." : 'No notifications yet.'}
            </div>
          </div>
        )}

        {!loading &&
          filtered.map((n) => (
            <div
              key={n._id}
              className={cardClass}
              style={{ background: n.isRead ? 'var(--a-white)' : 'var(--a-acc-soft)', flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
            >
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[10px] bg-[var(--a-white)] text-sm">
                {TYPE_ICON[n.type] || '⚑'}
              </span>
              <button
                type="button"
                onClick={() => openNotification(n)}
                className="flex-1 cursor-pointer border-none bg-transparent p-0 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-bold text-[var(--a-ink)]">{n.title}</span>
                  {!n.isRead && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--a-danger)]" />}
                </div>
                <div className="mt-0.5 text-[13px] text-[var(--a-mut)]">{n.message}</div>
                <div className="mt-1 text-[11px] text-[var(--a-mut)]">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </div>
              </button>
              <div className="flex flex-shrink-0 gap-1.5">
                {!n.isRead && (
                  <button type="button" title="Mark as read" className={ghostBtnSmallClass} onClick={() => markRead(n)}>
                    ✓
                  </button>
                )}
                <button type="button" title="Delete" className={dangerBtnSmallClass} onClick={() => confirmDelete(n)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
      </div>

      <ConfirmDialog open={!!confirm} message={confirm?.message} onCancel={() => setConfirm(null)} onConfirm={() => confirm.onConfirm()} />
    </div>
  );
}
