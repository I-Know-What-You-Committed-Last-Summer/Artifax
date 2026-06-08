import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
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
import { useEffect } from 'react';
import { useApi } from './hooks';

function App() {
  // Backend integration commented out - requires .NET SDK installation
  // TODO: Uncomment when backend is running on localhost:5253


  const api = useApi();

  useEffect(() => {
    
    (async () => {
      try {
        const result = await api.get('/Item/item');
        console.log(result);
        return result;
      } catch (error) {
        console.log("Error:"+error);
      }
    })();
    
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/verify" element={<OtpVerifyPage />} />
        <Route path="/login/verify-success" element={<OtpVerifySuccessPage />} />
        <Route path="/login/verify-failed" element={<OtpVerifyFailedPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="crafting" element={<CraftingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;
