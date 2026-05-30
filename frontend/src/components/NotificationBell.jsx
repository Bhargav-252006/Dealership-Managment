import { useEffect, useState, useRef } from 'react';
import API from '../api';

export default function NotificationBell({ align = 'right' }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = () => {
    API.get('/notifications/')
      .then(({ data }) => {
        setNotifications(data);
      })
      .catch(err => console.error('Error fetching notifications:', err));
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 20,
          cursor: 'pointer',
          padding: 8,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          borderRadius: '50%',
          transition: 'background 0.2s',
        }}
        className="nav-icon-btn"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              background: 'var(--red)',
              color: 'white',
              fontSize: 10,
              fontWeight: 'bold',
              borderRadius: '50%',
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 4px rgba(0,0,0,0.2)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: align === 'left' ? '45px' : 'auto',
            top: align === 'left' ? 'auto' : '40px',
            left: align === 'left' ? 0 : 'auto',
            right: align === 'left' ? 'auto' : 0,
            width: '320px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflow: 'hidden',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="fade-in"
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: '2px 6px',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    cursor: n.is_read ? 'default' : 'pointer',
                    background: n.is_read ? 'transparent' : 'rgba(217, 119, 6, 0.04)',
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                  className="notification-item"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    {!n.is_read && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          background: 'var(--accent)',
                          borderRadius: '50%',
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.3, marginBottom: 4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
