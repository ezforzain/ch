import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

/**
 * Real-API hook for the Seller Dashboard — same pattern as ProductsContext.jsx (api.get via
 * src/lib/api.js, bearer token attached automatically). Backed by two verified backend
 * endpoints, both `authorize('seller')`-gated:
 *   GET /sellers/me/stats -> { productCount, activeProductCount, orderCount, unitsSold, revenue }
 *   GET /orders/seller    -> paginated Order[] (see meta) — each order includes ALL of its
 *     items, not just this seller's (a multi-seller cart returns the whole order), so
 *     myLineItems()/myOrderTotal() filter a given order down to this seller's own lines.
 */
export function useSellerData() {
  const { user } = useAuth();
  const showToast = useToast();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/sellers/me/stats');
      setStats(res.data);
    } catch (err) {
      showToast(err.message || 'Could not load your stats.');
    } finally {
      setStatsLoading(false);
    }
  }, [showToast]);

  const loadOrders = useCallback(
    async (query = '') => {
      setOrdersLoading(true);
      try {
        const res = await api.get(`/orders/seller${query}`);
        setOrders(res.data);
        setPagination(res.meta || null);
      } catch (err) {
        showToast(err.message || 'Could not load your orders.');
      } finally {
        setOrdersLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    loadStats();
    loadOrders();
  }, [loadStats, loadOrders]);

  const myLineItems = useCallback(
    (order) => (order.items || []).filter((i) => String(i.seller) === String(user?._id)),
    [user],
  );
  const myOrderTotal = useCallback(
    (order) => myLineItems(order).reduce((sum, i) => sum + i.price * i.qty, 0),
    [myLineItems],
  );

  return {
    stats,
    statsLoading,
    orders,
    ordersLoading,
    pagination,
    refetchStats: loadStats,
    refetchOrders: loadOrders,
    myLineItems,
    myOrderTotal,
  };
}
