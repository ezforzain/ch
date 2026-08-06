import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Reusable role-gated route guard, used by both /admin/* and /seller/* — replaces the
 * loading/role check that used to be hand-inlined once in AdminApp.jsx. Mounted outside
 * each panel's <Suspense> in App.jsx so an unauthorized visitor is redirected before the
 * lazy panel chunk is ever fetched. */
export default function ProtectedRoute({ roles, children, redirectTo = '/login' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-paper text-mut">Checking your session…</div>;
  }
  if (!user || (roles && !roles.includes(user.role))) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}
