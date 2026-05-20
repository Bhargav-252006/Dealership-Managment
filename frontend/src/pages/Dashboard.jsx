import { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/')
      .then(({ data }) => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        setStats(null); // Explicitly null
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
