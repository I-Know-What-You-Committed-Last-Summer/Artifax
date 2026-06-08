import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AppLayout from './layouts/AppLayout';
import CraftingPage from './pages/crafting/crafting';
import DashboardPage from './pages/dashboard/DashboardPage';
import InventoryPage from './pages/inventory/InventoryPage';
import AnalyticsPage from './pages/analytics/analytics';
import LoginPage from './pages/auth/LoginPage';
import OtpVerifyPage from './pages/auth/OtpVerifyPage';
import OtpVerifySuccessPage from './pages/auth/OtpVerifySuccessPage';
import OtpVerifyFailedPage from './pages/auth/OtpVerifyFailedPage';
import UsersPage from './pages/users/users';
import { useEffect, useState } from 'react';
import { clearCurrentUser, setCurrentUser } from './utils/currentUser';
import { clearAuthToken } from './utils/authToken';
import { getCurrentUserFromSession } from './services/authApi';

type RequireSessionProps = {
  children: JSX.Element;
};

function RequireSession({ children }: RequireSessionProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const sessionUser = await getCurrentUserFromSession();

        if (!mounted) {
          return;
        }

        setCurrentUser({
          name: sessionUser.Username || sessionUser.UserEmail || 'User',
          role: sessionUser.UserLevel || 'Employee',
          email: sessionUser.UserEmail,
        });
        setIsAuthenticated(true);
      } catch {
        if (!mounted) {
          return;
        }

        clearAuthToken();
        clearCurrentUser();
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (isChecking) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/verify" element={<OtpVerifyPage />} />
        <Route path="/login/verify-success" element={<OtpVerifySuccessPage />} />
        <Route path="/login/verify-failed" element={<OtpVerifyFailedPage />} />
        <Route
          path="/"
          element={(
            <RequireSession>
              <AppLayout />
            </RequireSession>
          )}
        >
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="crafting" element={<CraftingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
