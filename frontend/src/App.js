import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './pages/navbar/navbar';
import Crafting from './pages/crafting/crafting';

// Page Components
const Dashboard = () => <div className="page-content"><h1>Dashboard</h1></div>;
const Inventory = () => <div className="page-content"><h1>Inventory</h1></div>;
const Analytics = () => <div className="page-content"><h1>Analytics</h1></div>;
const Users = () => <div className="page-content"><h1>Users</h1></div>;
const Settings = () => <div className="page-content"><h1>Settings</h1></div>;

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/crafting" element={<Crafting />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
