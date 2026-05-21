import { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

export default function Shops() {
  const [locations, setLocations] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState('');
  const [showLocModal, setShowLocModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay()] === 'Sunday' ? 'Monday' : DAYS[new Date().getDay()]);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDay, setNewLocDay] = useState('Monday');
  
  const [shopForm, setShopForm] = useState({ shop_name: '', owner_name: '', phone: '', address: '', location: '' });

  // Edit shop
  const [editShopModal, setEditShopModal] = useState(false);
  const [editShopData, setEditShopData] = useState(null);

  // Shop orders
  const [showShopOrdersModal, setShowShopOrdersModal] = useState(false);
  const [shopOrders, setShopOrders] = useState({ shop: null, orders: [] });

  const [allShops, setAllShops] = useState([]);

  const fetchLocations = () => API.get('/locations/').then(({ data }) => setLocations(data));
  const fetchShops = (locId = '') => {
    if (allShops.length > 0 && !locId) {
      // Already loaded, just reset filter
      setShops(allShops);
      return;
    }
    const url = '/shops/';
    API.get(url).then(({ data }) => {
      setAllShops(data);
      setShops(locId ? data.filter(s => s.location_id == locId) : data);
    });
  };

  useEffect(() => { fetchLocations(); fetchShops(); }, []);

  const filterByLocation = (id) => {
    setSelectedLoc(id);
    // Filter client-side — no extra API call needed!
    if (id) {
      setShops(allShops.filter(s => s.location_id == id));
    } else {
      // Filter by active day
      const activeLocs = locations.filter(l => activeDay === 'All' || l.visit_day === activeDay).map(l => l.id);
      setShops(allShops.filter(s => activeLocs.includes(s.location_id)));
    }
  };

  const addLocation = async (e) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    try {
      await API.post('/locations/', { name: newLocName, visit_day: newLocDay });
      setNewLocName('');
      setShowLocModal(false);
      fetchLocations();
      toast.success('Location added');
    } catch { toast.error('Failed to add location'); }
  };

  const saveShop = async (e) => {
    e.preventDefault();
    try {
      await API.post('/shops/', shopForm);
      toast.success('Shop added!');
      setShowShopModal(false);
      setShopForm({ shop_name: '', owner_name: '', phone: '', address: '', location: '' });
      setAllShops([]); // invalidate cache
      fetchShops(selectedLoc);
    } catch { toast.error('Failed to add shop'); }
  };

  const updateShop = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/shops/${editShopData.id}/`, editShopData);
      toast.success('Shop updated!');
      setEditShopModal(false);
      setAllShops([]); // invalidate cache
      fetchShops(selectedLoc);
    } catch { toast.error('Failed to update shop'); }
  };

  const deleteShop = async () => {
    if (!window.confirm(`Delete shop "${editShopData.shop_name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/shops/${editShopData.id}/`);
      toast.success('Shop deleted');
      setEditShopModal(false);
      fetchShops(selectedLoc);
    } catch { toast.error('Cannot delete — shop may have existing orders'); }
  };

  const deleteLocation = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    await API.delete(`/locations/${id}/`);
    toast.success('Location deleted');
    fetchLocations();
    fetchShops();
  };

  const viewShopOrders = async (shop) => {
    try {
      const { data } = await API.get(`/orders/?shop=${shop.id}`);
      setShopOrders({ shop, orders: data });
      setShowShopOrdersModal(true);
    } catch {
      toast.error('Failed to load shop orders');
    }
  };

  const STATUS_COLORS = {
    Ordered:   { badge: 'badge-ordered' },
    Shipped:   { badge: 'badge-shipped' },
    Delivered: { badge: 'badge-delivered' },
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>📍 Locations &amp; Shops</h2>
        <p>Manage your delivery areas and shop network.</p>
      </div>

      {/* Locations Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>🗺️ Locations</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowLocModal(true)}>+ Add Location</button>
        </div>

        {/* Weekday Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'All'].map(day => (
            <button
              key={day}
              className={`btn btn-sm ${activeDay === day ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setActiveDay(day);
                filterByLocation('');
              }}
              style={{ borderRadius: 20, padding: '6px 16px', fontSize: 13 }}
            >
              {day}
            </button>
          ))}
        </div>

        {locations.filter(l => activeDay === 'All' || l.visit_day === activeDay).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <h3>No locations for {activeDay}</h3>
            <p>Add your delivery locations or change the day filter</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${selectedLoc === '' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => filterByLocation('')}
            >All {activeDay !== 'All' ? activeDay : ''} Areas</button>
            {locations.filter(l => activeDay === 'All' || l.visit_day === activeDay).map(loc => (
              <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className={`btn btn-sm ${selectedLoc == loc.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => filterByLocation(loc.id)}
                >
                  📍 {loc.name}
                  <span style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 6 }}>
                    {loc.shop_count}
                  </span>
                </button>
                <button className="btn btn-danger btn-sm" style={{ padding: '5px 8px' }} onClick={() => deleteLocation(loc.id)}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shops Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>🏪 Shops ({shops.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowShopModal(true)}>+ Add Shop</button>
        </div>

        {shops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <h3>No shops found</h3>
            <p>Add shops to start taking orders</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {shops.map(shop => (
              <div
                key={shop.id}
                onClick={() => viewShopOrders(shop)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                {/* Left: Shop info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--blue)', marginBottom: 6 }}>
                    🏪 {shop.shop_name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {shop.owner_name && <span>👤 {shop.owner_name}</span>}
                    {shop.phone && <span>📞 {shop.phone}</span>}
                    {shop.location_name && (
                      <span className="badge" style={{ background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: 11 }}>
                        📍 {shop.location_name}
                      </span>
                    )}
                    {shop.address && <span style={{ color: 'var(--text-muted)' }}>📌 {shop.address}</span>}
                  </div>
                </div>

                {/* Right: Edit + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setEditShopData({ ...shop }); setEditShopModal(true); }}
                    className="btn btn-secondary btn-sm"
                    title="Edit Shop"
                  >✏️ Edit</button>
                  <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Location Modal */}
      {showLocModal && (
        <div className="modal-overlay" onClick={() => setShowLocModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">📍 Add Location</span>
              <button className="modal-close" onClick={() => setShowLocModal(false)}>✕</button>
            </div>
            <form onSubmit={addLocation}>
              <div className="form-group">
                <label>Location Name</label>
                <input placeholder="e.g. Shamirpet" value={newLocName} onChange={e => setNewLocName(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label>Visit Day</label>
                <select value={newLocDay} onChange={e => setNewLocDay(e.target.value)}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLocModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shop Modal */}
      {showShopModal && (
        <div className="modal-overlay" onClick={() => setShowShopModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🏪 Add New Shop</span>
              <button className="modal-close" onClick={() => setShowShopModal(false)}>✕</button>
            </div>
            <form onSubmit={saveShop}>
              <div className="form-row">
                <div className="form-group">
                  <label>Shop Name *</label>
                  <input placeholder="Sri Lakshmi Stores" value={shopForm.shop_name}
                    onChange={e => setShopForm({ ...shopForm, shop_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Owner Name</label>
                  <input placeholder="Ravi Kumar" value={shopForm.owner_name}
                    onChange={e => setShopForm({ ...shopForm, owner_name: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input placeholder="9876543210" value={shopForm.phone}
                    onChange={e => setShopForm({ ...shopForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <select value={shopForm.location}
                    onChange={e => setShopForm({ ...shopForm, location: e.target.value })} required>
                    <option value="">Select Location</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea rows={2} placeholder="Shop address..." value={shopForm.address}
                  onChange={e => setShopForm({ ...shopForm, address: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowShopModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shop Modal */}
      {editShopModal && editShopData && (
        <div className="modal-overlay" onClick={() => setEditShopModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">✏️ Edit Shop</span>
              <button className="modal-close" onClick={() => setEditShopModal(false)}>✕</button>
            </div>
            <form onSubmit={updateShop}>
              <div className="form-row">
                <div className="form-group">
                  <label>Shop Name *</label>
                  <input value={editShopData.shop_name}
                    onChange={e => setEditShopData({ ...editShopData, shop_name: e.target.value })} required autoFocus />
                </div>
                <div className="form-group">
                  <label>Owner Name</label>
                  <input value={editShopData.owner_name || ''}
                    onChange={e => setEditShopData({ ...editShopData, owner_name: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input value={editShopData.phone || ''}
                    onChange={e => setEditShopData({ ...editShopData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <select value={editShopData.location || ''}
                    onChange={e => setEditShopData({ ...editShopData, location: e.target.value })} required>
                    <option value="">Select Location</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea rows={2} value={editShopData.address || ''}
                  onChange={e => setEditShopData({ ...editShopData, address: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <button type="button" className="btn btn-danger" onClick={deleteShop}>🗑️ Delete Shop</button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditShopModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update Shop</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Shop Orders Modal */}
      {showShopOrdersModal && shopOrders.shop && (
        <div className="modal-overlay" onClick={() => setShowShopOrdersModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">📦 Orders: {shopOrders.shop.shop_name}</span>
              <button className="modal-close" onClick={() => setShowShopOrdersModal(false)}>✕</button>
            </div>

            {/* Shop summary */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {shopOrders.shop.owner_name && <span>👤 {shopOrders.shop.owner_name}</span>}
              {shopOrders.shop.phone && <span>📞 {shopOrders.shop.phone}</span>}
              {shopOrders.shop.location_name && <span>📍 {shopOrders.shop.location_name}</span>}
              {shopOrders.shop.address && <span>📌 {shopOrders.shop.address}</span>}
            </div>

            {shopOrders.orders.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '40px 0' }}>No orders found for this shop.</p>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
                {shopOrders.orders.map(order => (
                  <div key={order.id} style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, marginBottom: 12, border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <strong>Order #{order.id}</strong> • <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{order.order_date}</span>
                      </div>
                      <span className={`badge ${STATUS_COLORS[order.status]?.badge || ''}`}>{order.status}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span>{item.product_name} <span style={{ color: 'var(--text-muted)' }}>({item.unit_size})</span></span>
                          <span style={{ color: 'var(--text-secondary)' }}>×{item.quantity} — ₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                      <strong style={{ fontSize: 15, color: 'var(--accent-light)' }}>Total: ₹{order.total_amount}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
