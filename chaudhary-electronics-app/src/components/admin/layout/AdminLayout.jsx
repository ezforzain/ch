import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminTheme } from '../../../context/admin/AdminThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';

/** Shell: sidebar + header + <Outlet/> main content — mirrors source's root
 * `<div style="{{ rootStyle }}"><aside/>...<main/></div>` layout. `key={pathname}` +
 * `animate-ce-page-in` on <main> gives navigating between admin sub-pages the same
 * subtle fade/slide the public site already has (see PublicLayout.jsx). */
export default function AdminLayout({ admin }) {
  const [collapsed, setCollapsed] = useState(false);
  const { cssVars } = useAdminTheme();
  const { pathname } = useLocation();

  return (
    <div
      className="flex min-h-screen bg-[var(--a-paper)] text-[var(--a-ink)]"
      style={cssVars}
    >
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header admin={admin} />
        <main key={pathname} className="animate-ce-page-in flex min-w-0 flex-1 flex-col gap-5 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
