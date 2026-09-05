import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { EcommerceAuthProvider, useEcommerceAuth } from './hooks/useEcommerceAuth';
import { ThemeProvider } from './hooks/useTheme';
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
import ProductDetailsPage from './pages/ProductDetailsPage';
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import InternsPage from './pages/InternsPage';
import BugRepositoryPage from './pages/BugRepositoryPage';
import EcommerceLoginPage from './pages/EcommerceLoginPage';
import EcommerceRegisterPage from './pages/EcommerceRegisterPage';
import TraceabilityMatrixPage from './pages/TraceabilityMatrixPage';
import CoverageDashboardPage from './pages/CoverageDashboardPage';
import TutorialPage from './pages/TutorialPage';
import ApiTesterPage from './pages/ApiTesterPage';
import ApiTutorialPage from './pages/ApiTutorialPage';
import ApiChallengesPage from './pages/ApiChallengesPage';

const LoadingSpinner: React.FC<{ color?: string }> = ({ color = 'border-indigo-600' }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${color}`}></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const TrainerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'TRAINER') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const EcommerceProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useEcommerceAuth();

  if (loading) {
    return <LoadingSpinner color="border-emerald-600" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/ecommerce/login" replace />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Sidebar />
      <main id="main-content" className="lg:ml-72 p-4 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto page-enter">
        {children}
      </main>
    </div>
  );
};

const EcommerceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <EcommerceSidebar />
      <main id="main-content" className="lg:ml-72 p-4 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto page-enter">
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
        <Route path="/ecommerce/products/:id" element={
          <EcommerceProtectedRoute>
            <EcommerceLayout><ProductDetailsPage /></EcommerceLayout>
          </EcommerceProtectedRoute>
        } />
        <Route path="/ecommerce/wishlist" element={
          <EcommerceProtectedRoute>
            <EcommerceLayout><WishlistPage /></EcommerceLayout>
          </EcommerceProtectedRoute>
        } />
        <Route path="/ecommerce/orders" element={
          <EcommerceProtectedRoute>
            <EcommerceLayout><OrderHistoryPage /></EcommerceLayout>
          </EcommerceProtectedRoute>
        } />
        <Route path="/ecommerce/profile" element={
          <EcommerceProtectedRoute>
            <EcommerceLayout><ProfilePage /></EcommerceLayout>
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
        <TrainerRoute>
          <AppLayout><TrainerDashboardPage /></AppLayout>
        </TrainerRoute>
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
        <TrainerRoute>
          <AppLayout><InternsPage /></AppLayout>
        </TrainerRoute>
      } />

      <Route path="/bug-repository" element={
        <TrainerRoute>
          <AppLayout><BugRepositoryPage /></AppLayout>
        </TrainerRoute>
      } />

      <Route path="/tutorial" element={
        <ProtectedRoute>
          <AppLayout><TutorialPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/traceability" element={
        <ProtectedRoute>
          <AppLayout><TraceabilityMatrixPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/coverage" element={
        <ProtectedRoute>
          <AppLayout><CoverageDashboardPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/api-tester" element={
        <ProtectedRoute>
          <AppLayout><ApiTesterPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/api-tutorial" element={
        <ProtectedRoute>
          <AppLayout><ApiTutorialPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/api-challenges" element={
        <ProtectedRoute>
          <AppLayout><ApiChallengesPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EcommerceAuthProvider>
          <Router>
            <Toaster position="top-right" />
            <AppRoutes />
          </Router>
        </EcommerceAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
