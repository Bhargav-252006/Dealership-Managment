import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LINKS = [
  { to: '/',        icon: '📊', label: 'Dashboard' },
  { to: '/shops',   icon: '📍', label: 'Locations & Shops' },
  { to: '/orders/create', icon: '➕', label: 'Create Order' },
  { to: '/orders',  icon: '📋', label: 'Order History' },
  { to: '/products',icon: '🏷️', label: 'Products' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  const initials = user?.user?.first_name
    ? user.user.first_name[0] + (user.user.last_name?.[0] || '')
    : user?.user?.username?.[0]?.toUpperCase() || 'D';

  const name = user?.user?.first_name
    ? `${user.user.first_name} ${user.user.last_name || ''}`
    : user?.user?.username;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'mobile-open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🛢️</div>
          <div>
            <h1>DealerConnect</h1>
            <p>Order Management</p>
          </div>
        </div>

        <nav className="nav-links">
          {LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)} // Close sidebar on navigate
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" style={{ marginBottom: 10 }}>
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{name}</div>
              <div className="user-role">{user?.business_type || 'Dealer'}</div>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
