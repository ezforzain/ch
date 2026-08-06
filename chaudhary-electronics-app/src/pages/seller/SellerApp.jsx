import { Navigate, Route, Routes } from 'react-router-dom';
import '../../lib/adminChartSetup';
import '../../styles/admin.css';
import { AdminThemeProvider } from '../../context/admin/AdminThemeContext';
import { useSellerData } from '../../hooks/useSellerData';
import SellerLayout from '../../components/seller/layout/SellerLayout';
import SellerDashboard from './SellerDashboard';
import SellerOrders from './SellerOrders';
import SellerSettings from './SellerSettings';

/**
 * Route tree for the Seller Dashboard, mounted at `/seller/*` by the root router (see
 * src/App.jsx). Mirrors AdminApp.jsx's shape: one shared layout (sidebar + header) with
 * everything else routing through its <Outlet/>. RBAC (seller only) is enforced by
 * <ProtectedRoute> where this is mounted, same as AdminApp.
 */
export default function SellerApp() {
  const seller = useSellerData();

  return (
    <AdminThemeProvider>
      <Routes>
        <Route element={<SellerLayout />}>
          <Route index element={<SellerDashboard seller={seller} />} />
          <Route path="orders" element={<SellerOrders seller={seller} />} />
          <Route path="settings" element={<SellerSettings />} />
          <Route path="*" element={<Navigate to="/seller" replace />} />
        </Route>
      </Routes>
    </AdminThemeProvider>
  );
}
