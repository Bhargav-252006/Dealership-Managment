import { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ location: '', shop: '' });
  const [shops, setShops] = useState([]);

  const fetchOrders = (f = filters) => {
    const params = new URLSearchParams();
    if (f.location) params.append('location', f.location);
    if (f.shop) params.append('shop', f.shop);
    API.get(`/orders/?${params}`).then(({ data }) => { setOrders(data); setLoading(false); });
  };

  useEffect(() => {
    fetchOrders();
    API.get('/locations/').then(({ data }) => setLocations(data));
    API.get('/shops/').then(({ data }) => setShops(data));
  }, []);

  const setFilter = (key, val) => {
    const updated = { ...filters, [key]: val };
    setFilters(updated);
    fetchOrders(updated);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.order_date === todayStr);
  const todayTotal = todayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>📋 Order History</h2>
        <p>View all orders.</p>
      </div>

      {/* Today's Summary */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, background: 'linear-gradient(135deg, rgba(46, 196, 182, 0.15) 0%, rgba(20, 30, 48, 0.4) 100%)', border: '1px solid rgba(46, 196, 182, 0.3)' }}>
        <div>
          <h3 style={{ fontSize: 18, color: 'var(--accent-light)', marginBottom: 4, fontWeight: 700 }}>📅 Today's Overview</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Orders placed today ({todayStr})</p>
        </div>
        <div style={{ display: 'flex', gap: 30 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Orders Today</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{todayOrders.length}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Expected Amount</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>₹{todayTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select value={filters.location} onChange={e => setFilter('location', e.target.value)}>
          <option value="">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>📍 {l.name}</option>)}
        </select>
        <select value={filters.shop} onChange={e => setFilter('shop', e.target.value)}>
          <option value="">All Shops</option>
          {shops.map(s => <option key={s.id} value={s.id}>🏪 {s.shop_name}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ location: '', shop: '' }); fetchOrders({ location: '', shop: '' }); }}>
          🔄 Clear
        </button>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>{orders.length} orders</span>
      </div>

      {/* Orders List */}
      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading orders...</h3></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No orders found</h3>
            <p>Try changing the filters or create a new order</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelected(order)}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                    <span style={{ color: 'var(--accent-light)' }}>#{order.id}</span> — {order.shop_name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    📍 {order.location_name} &nbsp;•&nbsp; 📅 {order.order_date} &nbsp;•&nbsp; {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--accent-light)', flexShrink: 0 }}>
                  ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 18, flexShrink: 0 }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Order #{selected.id} — {selected.shop_name}</span>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
              📍 {selected.location_name} &nbsp;|&nbsp; 📅 {selected.order_date}
            </div>

            {/* Items Table */}
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📦 Order Items</h4>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Company</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Rate/Box</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {[...selected.items]
                    .sort((a, b) => a.product_name.localeCompare(b.product_name))
                    .map(item => (
                      <tr key={item.id}>
                        <td data-label="Product" style={{ fontWeight: 600 }}>{item.product_name}</td>
                        <td data-label="Company" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.company_name}</td>
                        <td data-label="Size"><span className="badge" style={{ background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: 11 }}>{item.unit_size}</span></td>
                        <td data-label="Qty">{item.quantity}</td>
                        <td data-label="Rate/Box">₹{parseFloat(item.price).toFixed(2)}</td>
                        <td data-label="Subtotal" style={{ fontWeight: 700 }}>₹{parseFloat(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total:</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-light)' }}>
                ₹{parseFloat(selected.total_amount || 0).toFixed(2)}
              </span>
            </div>

            {selected.notes && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                📝 {selected.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
