import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';
import { getCurrentUserFromSession } from '../../services/authApi';

// DUMMY DATA - 
const MENU_DATA = {
  logo: {
    shortSrc: `${process.env.PUBLIC_URL}/artifax-logo.png`,
    shortAlt: 'Artifax mark',
    full: 'Artifax',
  },
  mainMenu: [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' }, // 
    { id: 'inventory', label: 'Inventory', icon: '⬢' },
    { id: 'crafting', label: 'Crafting', icon: '⚒' },
  ],
  adminMenu: [
    { id: 'analytics', label: 'Analytics', icon: '📊', badge: 'Admin' },
    { id: 'users', label: 'Users', icon: '👥', badge: 'Admin' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ],
  user: {
    name: 'J. Martinez',
    role: 'Admin'
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getCurrentUserFromSession();
        if (!mounted) return;
        const level = (me?.UserLevel ?? '').toString().toLowerCase();
        setIsAdmin(level === 'admin');
      } catch (err) {
        // If session not present or request fails, treat as non-admin
        if (mounted) setIsAdmin(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleNavClick = (id) => {
    navigate(`/${id}`);
  };

  return (
    <aside className="sidebar-container">
      {/* LOGO SECTION */}
      <div className="sidebar-header">
        <div className="logo-placeholder">
          <img className="logo-mark-image" src={MENU_DATA.logo.shortSrc} alt={MENU_DATA.logo.shortAlt} />
        </div>
        <span className="nav-text logo-text">{MENU_DATA.logo.full}</span>
      </div>

      <div className="sidebar-content">
        {/* MAIN MENU */}
        <p className="section-title nav-text">MAIN MENU</p>
        <ul className="nav-list">
          {MENU_DATA.mainMenu.map((item) => (
            <li key={item.id} className="nav-item" onClick={() => handleNavClick(item.id)} style={{ cursor: 'pointer' }}>
              <div className="nav-icon">{/* ICON HERE */ item.icon}</div>
              <span className="nav-text">{item.label}</span>
            </li>
          ))}
        </ul>

        {/* ADMIN SECTION */}
        {isAdmin && (
          <>
            <p className="section-title nav-text">ADMIN</p>
            <ul className="nav-list">
              {MENU_DATA.adminMenu.map((item) => (
                <li key={item.id} className="nav-item" onClick={() => handleNavClick(item.id)} style={{ cursor: 'pointer' }}>
                  <div className="nav-icon">{/* ICON HERE */ item.icon}</div>
                  <span className="nav-text">{item.label}</span>
                  {item.badge && <span className="admin-badge nav-text">{item.badge}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* FOOTER / USER SECTION */}
      <div className="sidebar-footer">
        <div className="user-avatar">{/* ICON/IMAGE  */}</div>
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