import { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/dashboard/'),
      API.get('/announcements/')
    ])
      .then(([statsRes, annRes]) => {
        setStats(statsRes.data);
        setAnnouncements(annRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        setStats(null);
      });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)', fontSize: 18 }}>
      ⏳ Loading dashboard...
    </div>
  );

  if (!stats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'red', fontSize: 18 }}>
      ❌ Failed to load dashboard. Check console or backend logs.
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      {announcements.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
            📢 Announcements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {announcements.map(ann => (
              <div key={ann.id} className="card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent)', margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                  <h4 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{ann.title}</h4>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(ann.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{ann.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card purple">
          <span className="stat-icon">🏪</span>
          <div className="stat-value">{stats.total_shops}</div>
          <div className="stat-label">Total Shops</div>
        </div>
        <div className="stat-card blue">
          <span className="stat-icon">📦</span>
          <div className="stat-value">{stats.orders_today}</div>
          <div className="stat-label">Orders Today</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>🕐 Recent Orders</h3>
        </div>

        {stats.recent_orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No orders yet</h3>
            <p>Create your first order from the Create Order page</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.recent_orders.map(order => (
              <div key={order.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>
                    <span style={{ color: 'var(--accent-light)' }}>#{order.id}</span> — {order.shop_name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    📍 {order.location_name} &nbsp;•&nbsp; 📅 {order.order_date}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent-light)' }}>
                  ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
