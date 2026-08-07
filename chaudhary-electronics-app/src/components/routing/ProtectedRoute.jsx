import { Navigate } from 'react-router-dom';
import { useAuth, redirectPathForRole } from '../../context/AuthContext';

/** Reusable role-gated route guard, used by both /admin/* and /seller/* — replaces the
 * loading/role check that used to be hand-inlined once in AdminApp.jsx. Mounted outside
 * each panel's <Suspense> in App.jsx so an unauthorized visitor is redirected before the
 * lazy panel chunk is ever fetched. */
export default function ProtectedRoute({ roles, children, redirectTo = '/login' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-paper text-mut">Checking your session…</div>;
  }
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  // Signed in but the wrong role for this area (e.g. a seller hitting /admin) — send them
  // to where they actually belong instead of back to a login form they're already past.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={redirectPathForRole(user.role)} replace />;
  }
  return children;
}
