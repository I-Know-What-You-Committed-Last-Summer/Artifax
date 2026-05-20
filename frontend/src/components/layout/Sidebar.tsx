import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import dashboardIcon from '../../assets/images/dashboardIcon.png';
import inventoryIcon from '../../assets/images/inventoryIcon.png';
import craftingIcon from '../../assets/images/craftingIcon.png';
import analyticsIcon from '../../assets/images/analyticsIcon.png';
import usersIcon from '../../assets/images/usersIcon.png';

const MENU_DATA = {
  logo: {
    shortSrc: `${process.env.PUBLIC_URL}/artifax-logo.png`,
    shortAlt: 'Artifax mark',
    fullText: 'Artifax',
  },
  mainMenu: [
    { id: 'dashboard', label: 'Dashboard', icon: dashboardIcon, path: '/dashboard' },
    { id: 'inventory', label: 'Inventory', icon: inventoryIcon, path: '/inventory' },
    { id: 'crafting', label: 'Crafting', icon: craftingIcon, path: '/crafting' },
    { id: 'analytics', label: 'Analytics', icon: analyticsIcon, path: '/analytics' },
  ],
  adminMenu: [
    { id: 'users', label: 'Users', icon: usersIcon, path: '/users', badge: 'Admin' },
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
              <div className="nav-icon">
                <img className="nav-icon-image" src={item.icon} alt="" aria-hidden="true" />
              </div>
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
