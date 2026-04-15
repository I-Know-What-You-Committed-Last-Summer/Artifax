import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const MENU_DATA = {
  logo: {
    shortSrc: `${process.env.PUBLIC_URL}/Logo.png`,
    shortAlt: 'Artifax mark',
    fullText: 'Artifax',
  },
  mainMenu: [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/dashboard' },
    { id: 'inventory', label: 'Inventory', icon: '⬢', path: '/inventory' },
    { id: 'crafting', label: 'Crafting', icon: '⚒', path: '/crafting' },
    { id: 'analytics', label: 'Analytics', icon: '📊', path: '/analytics' },
  ],
  adminMenu: [
    { id: 'users', label: 'Users', icon: '👥', path: '/users', badge: 'Admin' },
    { id: 'settings', label: 'Settings', icon: '⚙', path: '/settings' },
  ],
  user: {
    name: 'J. Martinez',
    role: 'Admin',
  },
};

function SidebarNavGroup({ title, items }) {
  return (
    <>
      <p className="section-title nav-text">{title}</p>
      <ul className="nav-list">
        {items.map((item) => (
          <li key={item.id}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              data-label={item.label}
              aria-label={item.label}
              title={item.label}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-text">{item.label}</span>
              {item.badge ? <span className="admin-badge nav-text">{item.badge}</span> : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <div className="logo-placeholder">
          <img className="logo-mark-image" src={MENU_DATA.logo.shortSrc} alt={MENU_DATA.logo.shortAlt} />
        </div>
        <span className="nav-text logo-text">{MENU_DATA.logo.fullText}</span>
      </div>

      <div className="sidebar-content">
        <SidebarNavGroup title="MAIN MENU" items={MENU_DATA.mainMenu} />
        <SidebarNavGroup title="ADMIN" items={MENU_DATA.adminMenu} />
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar" />
        <div className="user-info nav-text">
          <p className="user-name">{MENU_DATA.user.name}</p>
          <p className="user-role">{MENU_DATA.user.role}</p>
        </div>
        <div className="logout-icon nav-text">⭢</div>
      </div>
    </aside>
  );
}

export default Sidebar;
