import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, redirectPathForRole } from '../../context/AuthContext';

/** Reusable role-gated route guard, used by /admin/*, /seller/*, and any other
 * account-specific page (e.g. /profile). Mounted outside each panel's <Suspense> in
 * App.jsx so an unauthorized visitor is redirected before the lazy panel chunk is ever
 * fetched. Passes the current location as `state.from` so Login can send the visitor
 * back to whatever they were trying to reach once they've signed in. */
export default function ProtectedRoute({ roles, children, redirectTo = '/login' }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-paper text-mut">Checking your session…</div>;
  }
  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  // Signed in but the wrong role for this area (e.g. a seller hitting /admin) — send them
  // to where they actually belong instead of back to a login form they're already past.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={redirectPathForRole(user.role)} replace />;
  }
  return children;
}
