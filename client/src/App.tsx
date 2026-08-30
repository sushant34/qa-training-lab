import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { EcommerceAuthProvider, useEcommerceAuth } from './hooks/useEcommerceAuth';
import Sidebar from './components/Sidebar';
import EcommerceSidebar from './components/EcommerceSidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import RequirementsPage from './pages/RequirementsPage';
import TestCasesPage from './pages/TestCasesPage';
import TestExecutionPage from './pages/TestExecutionPage';
import BugReportsPage from './pages/BugReportsPage';
import MyScorePage from './pages/MyScorePage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import InternsPage from './pages/InternsPage';
import BugRepositoryPage from './pages/BugRepositoryPage';
import EcommerceLoginPage from './pages/EcommerceLoginPage';
import EcommerceRegisterPage from './pages/EcommerceRegisterPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const EcommerceProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useEcommerceAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/ecommerce/login" replace />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="lg:ml-72 p-4 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

const EcommerceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <EcommerceSidebar />
      <main className="lg:ml-72 p-4 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isEcommerceRoute = location.pathname.startsWith('/ecommerce');

  if (isEcommerceRoute) {
    return (
      <Routes>
        <Route path="/ecommerce/login" element={<EcommerceLoginPage />} />
        <Route path="/ecommerce/register" element={<EcommerceRegisterPage />} />
        <Route path="/ecommerce/shop" element={
          <EcommerceProtectedRoute>
            <EcommerceLayout><ShopPage /></EcommerceLayout>
          </EcommerceProtectedRoute>
        } />
        <Route path="/ecommerce/cart" element={
          <EcommerceProtectedRoute>
            <EcommerceLayout><CartPage /></EcommerceLayout>
          </EcommerceProtectedRoute>
        } />
        <Route path="/ecommerce/checkout" element={
          <EcommerceProtectedRoute>
            <EcommerceLayout><CheckoutPage /></EcommerceLayout>
          </EcommerceProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/ecommerce/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'TRAINER' ? '/trainer-dashboard' : '/dashboard'} replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/trainer-dashboard" element={
        <ProtectedRoute>
          <AppLayout><TrainerDashboardPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/requirements" element={
        <ProtectedRoute>
          <AppLayout><RequirementsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/test-cases" element={
        <ProtectedRoute>
          <AppLayout><TestCasesPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/test-execution" element={
        <ProtectedRoute>
          <AppLayout><TestExecutionPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/bug-reports" element={
        <ProtectedRoute>
          <AppLayout><BugReportsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/my-score" element={
        <ProtectedRoute>
          <AppLayout><MyScorePage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/interns" element={
        <ProtectedRoute>
          <AppLayout><InternsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/bug-repository" element={
        <ProtectedRoute>
          <AppLayout><BugRepositoryPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <EcommerceAuthProvider>
        <Router>
          <Toaster position="top-right" />
          <AppRoutes />
        </Router>
      </EcommerceAuthProvider>
    </AuthProvider>
  );
};

export default App;
