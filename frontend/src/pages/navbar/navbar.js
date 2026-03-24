import React from 'react';
import './navbar.css';

// DUMMY DATA - Centralized for easy updates
const MENU_DATA = {
  logo: {
    short: "A", // The icon version
    full: "Artifax" // The text version
  },
  mainMenu: [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' }, // Replace with your Icon components
    { id: 'inventory', label: 'Inventory', icon: '⬢' },
    { id: 'crafting', label: 'Crafting', icon: '⚒' },
    { id: 'analytics', label: 'Analytics', icon: '📊', active: true },
  ],
  adminMenu: [
    { id: 'users', label: 'Users', icon: '👥', badge: 'Admin' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ],
  user: {
    name: 'J. Martinez',
    role: 'Admin'
  }
};

const Navbar = () => {
  return (
    <aside className="sidebar-container">
      {/* LOGO SECTION */}
      <div className="sidebar-header">
        <div className="logo-placeholder">{/* ICON HERE */ MENU_DATA.logo.short}</div>
        <span className="nav-text logo-text">{MENU_DATA.logo.full}</span>
      </div>

      <div className="sidebar-content">
        {/* MAIN MENU */}
        <p className="section-title nav-text">MAIN MENU</p>
        <ul className="nav-list">
          {MENU_DATA.mainMenu.map((item) => (
            <li key={item.id} className={`nav-item ${item.active ? 'active' : ''}`}>
              <div className="nav-icon">{/* ICON HERE */ item.icon}</div>
              <span className="nav-text">{item.label}</span>
            </li>
          ))}
        </ul>

        {/* ADMIN SECTION */}
        <p className="section-title nav-text">ADMIN</p>
        <ul className="nav-list">
          {MENU_DATA.adminMenu.map((item) => (
            <li key={item.id} className="nav-item">
              <div className="nav-icon">{/* ICON HERE */ item.icon}</div>
              <span className="nav-text">{item.label}</span>
              {item.badge && <span className="admin-badge nav-text">{item.badge}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* FOOTER / USER SECTION */}
      <div className="sidebar-footer">
        <div className="user-avatar">{/* ICON/IMAGE HERE */}</div>
        <div className="user-info nav-text">
          <p className="user-name">{MENU_DATA.user.name}</p>
          <p className="user-role">{MENU_DATA.user.role}</p>
        </div>
        <div className="logout-icon nav-text">⭢</div>
      </div>
    </aside>
  );
};

export default Navbar;