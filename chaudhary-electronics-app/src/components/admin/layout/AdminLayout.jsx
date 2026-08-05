import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminTheme } from '../../../context/admin/AdminThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';

/** Shell: sidebar + header + <Outlet/> main content — mirrors source's root
 * `<div style="{{ rootStyle }}"><aside/>...<main/></div>` layout. */
export default function AdminLayout({ admin }) {
  const [collapsed, setCollapsed] = useState(false);
  const { cssVars } = useAdminTheme();

  return (
    <div
      className="flex min-h-screen bg-[var(--a-paper)] text-[var(--a-ink)]"
      style={cssVars}
    >
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header admin={admin} />
        <main className="flex min-w-0 flex-1 flex-col gap-5 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
