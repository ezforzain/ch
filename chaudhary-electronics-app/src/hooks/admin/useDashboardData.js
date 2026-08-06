import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { fmtPKR } from '../../lib/format';

const EMPTY = {
  summary: null,
  leadSources: [],
  topProducts: [],
  recentLeads: [],
  recentOrders: [],
  recentAppointments: [],
  recentMessages: [],
  recentActivity: [],
};

/** Pulls the real figures the Dashboard needs from the backend in one place: overall
 * summary (revenue/counts), lead-source breakdown, top products, and a handful of recent
 * records per module — replacing the mock `admin.data` reads for everything that's moved
 * to the real API. */
export function useDashboardData() {
  const [state, setState] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [summaryRes, leadsReportRes, topProductsRes, leadsRes, ordersRes, apptRes, messagesRes, activityRes] =
        await Promise.all([
          api.get('/dashboard/summary').catch(() => null),
          api.get('/reports/leads').catch(() => null),
          api.get('/dashboard/top-products?limit=5').catch(() => null),
          api.get('/leads?limit=3&sort=-createdAt').catch(() => null),
          api.get('/orders?limit=3&sort=-createdAt').catch(() => null),
          api.get('/appointments?limit=3&sort=-createdAt').catch(() => null),
          api.get('/messages?limit=3&sort=-createdAt').catch(() => null),
          api.get('/activity?limit=5&sort=-createdAt').catch(() => null),
        ]);
      if (cancelled) return;
      setState({
        summary: summaryRes?.data || null,
        leadSources: leadsReportRes?.data?.bySource || [],
        topProducts: topProductsRes?.data || [],
        recentLeads: leadsRes?.data || [],
        recentOrders: ordersRes?.data || [],
        recentAppointments: apptRes?.data || [],
        recentMessages: messagesRes?.data || [],
        recentActivity: activityRes?.data || [],
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const s = state.summary;
  const statCards = s
    ? [
        ['Total users', String(s.totalUsers ?? 0), '⚿', '#E3EEDF'],
        ['Total sellers', String(s.sellerCount ?? 0), '⛁', '#E3EEDF'],
        ['Total buyers', String(s.customerCount ?? 0), '◎', '#E3EEDF'],
        ['Total products', String(s.productCount ?? 0), '▥', '#F7ECD9'],
        ['Total orders', String(s.orderCount ?? 0), '▤', '#F7ECD9'],
        ['Total revenue', fmtPKR(s.revenue ?? 0), '₨', '#F7ECD9'],
        ['Pending approvals', String(s.pendingSellerApprovals ?? 0), '⛁', '#F6E2DC'],
        ['New leads', String(s.newLeads ?? 0), '◈', '#E3EEDF'],
        ['Pending appointments', String(s.pendingAppointments ?? 0), '◷', '#F6E2DC'],
        ['Active products', String(s.activeProducts ?? 0), '▣', '#F7ECD9'],
        ['Low stock products', String(s.lowStockProducts ?? 0), '⚠', '#F6E2DC'],
      ]
    : [];

  return { ...state, statCards, loading };
}
