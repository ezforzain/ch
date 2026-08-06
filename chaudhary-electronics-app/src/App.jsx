import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LangProvider } from './i18n/LangContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import ScrollToHash from './components/ScrollToHash';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

export default function App() {
  return (
    <LangProvider>
      <ToastProvider>
      <AuthProvider>
        {/* Single shared product store — read/written by both the public
            Marketplace and the Admin Panel's Products page/Dashboard, so a
            product added or edited in one place is immediately correct
            everywhere else. */}
        <ProductsProvider>
        <BrowserRouter>
          <ScrollToHash />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Marketplace.dc.html was an identical duplicate of the homepage in the
                source export — the marketplace lives inline on the homepage, so the
                nav link just deep-links to that section instead of duplicating it. */}
            <Route path="/marketplace" element={<Navigate to="/#products" replace />} />
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminApp />
                </Suspense>
              }
            />
          </Routes>
        </BrowserRouter>
        </ProductsProvider>
      </AuthProvider>
      </ToastProvider>
    </LangProvider>
  );
}

function AdminLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper text-mut">
      Loading admin panel…
    </div>
  );
}
