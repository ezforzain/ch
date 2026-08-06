import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminTheme } from '../../../context/admin/AdminThemeContext';
import Sidebar from '../../admin/layout/Sidebar';
import SellerHeader from './SellerHeader';
import { sellerNavDefs } from '../../../data/seller/sellerNavDefs';

/** Shell for /seller/* — same shape as AdminLayout.jsx, reusing the now-generalized
 * Sidebar (navDefs/basePath/brandLabel props) instead of a near-duplicate component,
 * and AdminThemeProvider (mounted by SellerApp.jsx) for the same --a-* palette tokens
 * the admin panel uses — there's nothing admin-specific about that palette despite the
 * name, so introducing a parallel theme system for Seller would be pure duplication. */
export default function SellerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { cssVars } = useAdminTheme();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-[var(--a-paper)] text-[var(--a-ink)]" style={cssVars}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        navDefs={sellerNavDefs}
        basePath="/seller"
        brandLabel="Seller Panel"
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <SellerHeader />
        <main key={pathname} className="animate-ce-page-in flex min-w-0 flex-1 flex-col gap-5 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
