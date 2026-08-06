import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

const EMPTY = {
  newLeadsCount: 0,
  unreadMessagesCount: 0,
  pendingOrdersCount: 0,
  unreadNotificationsCount: 0,
  recentMessages: [],
  recentNotifications: [],
};

/** Real counts/previews for the Header's notification/messages bells — replaces the old
 * filtering of the mock localStorage store (which had drifted from what the Leads/Orders/
 * Messages pages themselves show, since those moved to the real API). Polls occasionally
 * so badges don't go stale during a long admin session. */
export function useHeaderCounts() {
  const [state, setState] = useState(EMPTY);

  const load = useCallback(async () => {
    const [leadsRes, messagesRes, ordersRes, notifRes] = await Promise.all([
      api.get('/leads?status=New&limit=1').catch(() => null),
      api.get('/messages?limit=5&sort=-createdAt').catch(() => null),
      api.get('/orders?status=Pending&limit=1').catch(() => null),
      api.get('/notifications?limit=5&sort=-createdAt').catch(() => null),
    ]);
    setState({
      newLeadsCount: leadsRes?.meta?.total ?? 0,
      unreadMessagesCount: messagesRes?.data?.filter((m) => m.status === 'unread').length ?? 0,
      pendingOrdersCount: ordersRes?.meta?.total ?? 0,
      unreadNotificationsCount: notifRes?.meta?.unreadCount ?? 0,
      recentMessages: messagesRes?.data || [],
      recentNotifications: notifRes?.data || [],
    });
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  return { ...state, refetch: load };
}
