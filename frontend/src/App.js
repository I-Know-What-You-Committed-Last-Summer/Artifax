import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AppLayout from './layouts/AppLayout';
import PlaceholderPage from './pages/PlaceholderPage';
import CraftingPage from './pages/crafting/crafting';
import DashboardPage from './pages/dashboard/DashboardPage';
import InventoryPage from './pages/inventory/InventoryPage';
import AnalyticsPage from './pages/analytics/analytics';
import LoginPage from './pages/auth/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="crafting" element={<CraftingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="users" element={<PlaceholderPage title="Users" />} />
          <Route path="profile" element={<PlaceholderPage title="Profile" />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
