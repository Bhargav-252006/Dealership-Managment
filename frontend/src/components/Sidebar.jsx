import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

const DEALER_LINKS = [
  { to: '/',        icon: '📊', label: 'Dashboard' },
  { to: '/shops',   icon: '📍', label: 'Locations & Shops' },
  { to: '/orders/create', icon: '➕', label: 'Create Order' },
  { to: '/orders',  icon: '📋', label: 'Order History' },
  { to: '/products',icon: '🏷️', label: 'Products' },
];

const ADMIN_LINKS = [
  { to: '/admin',   icon: '👑', label: 'Dealer Management' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
            <h1 style={{fontSize: '18px'}}>Surya Oil Dealership</h1>
            <p>Order Management</p>
            <div style={{
              fontSize: '11px', 
              color: 'var(--accent)', 
              fontWeight: 600, 
              marginTop: '4px',
              display: 'inline-block',
              padding: '2px 8px',
              background: 'rgba(217, 119, 6, 0.1)',
              borderRadius: '12px'
            }}>
              ⭐ Monthly Subscription
            </div>
          </div>
        </div>

        <nav className="nav-links">
          {(user?.user?.is_admin ? ADMIN_LINKS : DEALER_LINKS).map(link => (
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
          <div className="user-info" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="user-avatar">{initials}</div>
              <div>
                <div className="user-name">{name}</div>
                <div className="user-role">{user?.user?.is_admin ? 'Super Admin' : (user?.business_type || 'Dealer')}</div>
              </div>
            </div>
            {!user?.user?.is_admin && <NotificationBell align="left" />}
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }} 
            onClick={toggleTheme}
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
