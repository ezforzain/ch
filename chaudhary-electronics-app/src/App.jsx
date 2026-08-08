import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './i18n/LangContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { CartProvider } from './context/CartContext';
import ScrollToHash from './components/ScrollToHash';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AdminApp = lazy(() => import('./pages/admin/AdminApp'));
const SellerApp = lazy(() => import('./pages/seller/SellerApp'));
// Lazy so the Firebase SDK it pulls in (via GoogleSignInButton.jsx) only ever loads for
// someone actually visiting /login, not bundled into every page's initial load.
const Login = lazy(() => import('./pages/Login'));

/**
 * One router for the whole site. Public pages (Home, Marketplace, Product Details,
 * Privacy, Terms, 404) share a single <PublicLayout> (Navbar/Footer/floating CTAs — see
 * that file) instead of each hand-copying its own chrome. Auth pages stay chrome-free by
 * design (see AuthShell.jsx). /admin/* and /seller/* are lazy-loaded, role-gated panels
 * that share the same design tokens as the public site (see src/index.css's @theme block
 * vs. src/data/admin/theme.js) and the same collapsible-sidebar shell pattern.
 */
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
            {/* Cart + wishlist, shared by the /marketplace grid and the /product/:id
                page now that product detail is a real route instead of a modal
                owned by the marketplace grid component. */}
            <CartProvider>
              <BrowserRouter>
                <ScrollToHash />
                <Routes>
                  {/* The whole public site (Home, Marketplace, product pages, Privacy/Terms) requires
                      being signed in — an unauthenticated visitor is bounced to /login before any of
                      it renders, so Login is genuinely the first screen the site shows. */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <PublicLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/" element={<Home />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  <Route
                    path="/login"
                    element={
                      <Suspense fallback={<PanelLoading label="Loading…" />}>
                        <Login />
                      </Suspense>
                    }
                  />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute roles={['admin', 'superadmin']}>
                        <Suspense fallback={<PanelLoading label="Loading admin panel…" />}>
                          <AdminApp />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/*"
                    element={
                      <ProtectedRoute roles={['seller']}>
                        <Suspense fallback={<PanelLoading label="Loading seller dashboard…" />}>
                          <SellerApp />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </ToastProvider>
    </LangProvider>
  );
}

function PanelLoading({ label }) {
  return <div className="grid min-h-screen place-items-center bg-paper text-mut">{label}</div>;
}
