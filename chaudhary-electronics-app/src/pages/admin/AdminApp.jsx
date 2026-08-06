import { Navigate, Route, Routes } from 'react-router-dom';
import '../../lib/adminChartSetup';
import '../../styles/admin.css';
import { AdminThemeProvider } from '../../context/admin/AdminThemeContext';
import { useAdminData } from '../../hooks/admin/useAdminData';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/layout/AdminLayout';
import Dashboard from '../../components/admin/dashboard/Dashboard';
import Appointments from '../../components/admin/pages/Appointments';
import Products from '../../components/admin/pages/Products';
import Categories from '../../components/admin/pages/Categories';
import Sellers from '../../components/admin/pages/Sellers';
import UsersRoles from '../../components/admin/pages/UsersRoles';
import Gallery from '../../components/admin/pages/Gallery';
import Settings from '../../components/admin/pages/Settings';
import Reports from '../../components/admin/pages/Reports';
import Leads from '../../components/admin/pages/Leads';
import Customers from '../../components/admin/pages/Customers';
import Services from '../../components/admin/pages/Services';
import ProjectsPage from '../../components/admin/pages/ProjectsPage';
import Orders from '../../components/admin/pages/Orders';
import Messages from '../../components/admin/pages/Messages';
import Notifications from '../../components/admin/pages/Notifications';
import Blog from '../../components/admin/pages/Blog';
import Testimonials from '../../components/admin/pages/Testimonials';
import Team from '../../components/admin/pages/Team';
import Cities from '../../components/admin/pages/Cities';
import Faqs from '../../components/admin/pages/Faqs';
import ActivityLogs from '../../components/admin/pages/ActivityLogs';
import Profile from '../../components/admin/pages/Profile';

/**
 * Route tree for the Admin Panel, mounted at `/admin/*` by the root router
 * (see src/App.jsx: `<Route path="/admin/*" element={<AdminApp />} />`).
 * All paths here are relative — AdminLayout renders the sidebar/header shell
 * once and everything below routes through its <Outlet />.
 *
 * Every module below is backed by the real backend API (server/) via either a
 * dedicated hook (useApiCollection, useGalleryData) or a bespoke page (Sellers,
 * Settings, Reports, Dashboard) — none of them read from the mock localStorage
 * store anymore except Settings' Backup tab, which still exports/restores
 * whatever remains in `useAdminData`'s local demo state.
 */
export default function AdminApp() {
  const admin = useAdminData();
  const { user, loading } = useAuth();

  // Real RBAC guard against the backend session (see server/src/middleware/auth.middleware.js) —
  // the panel itself is otherwise unchanged; this just gates entry to admin/superadmin accounts.
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper text-mut">
        Checking your session…
      </div>
    );
  }
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminThemeProvider>
      <Routes>
        <Route element={<AdminLayout admin={admin} />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="customers" element={<Customers />} />
          <Route path="services" element={<Services />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="blog" element={<Blog />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="team" element={<Team />} />
          <Route path="cities" element={<Cities />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="users" element={<UsersRoles />} />
          <Route path="activity" element={<ActivityLogs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings admin={admin} />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminThemeProvider>
  );
}
