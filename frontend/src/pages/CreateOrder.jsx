import { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

const EMPTY_ITEM = { company: '', product: '', quantity: 1, price: '' };

export default function CreateOrder() {
  const [locations, setLocations] = useState([]);
  const [shops, setShops] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay()] === 'Sunday' ? 'Monday' : DAYS[new Date().getDay()]);
  
  const [selectedLoc, setSelectedLoc] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    API.get('/locations/').then(({ data }) => setLocations(data));
    API.get('/companies/').then(({ data }) => setCompanies(data));
  }, []);

  const onLocationChange = (locId) => {
    setSelectedLoc(locId);
    setSelectedShop('');
    if (locId) API.get(`/shops/?location=${locId}`).then(({ data }) => setShops(data));
    else setShops([]);
  };

  const getProducts = (companyId) => {
    if (!companyId) return [];
    const co = companies.find(c => c.id == companyId);
    return co ? co.products : [];
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'company') {
      updated[index].product = '';
      updated[index].price = '';
    }
    if (field === 'product') {
      const products = getProducts(updated[index].company);
      const prod = products.find(p => p.id == value);
      if (prod) {
        const piecePrice = parseFloat(prod.default_price) || 0;
        const units = parseInt(prod.units_per_box) || 1;
        updated[index].price = (piecePrice * units).toFixed(2); // auto-fill box rate
      }
    }
    setItems(updated);
  };

  const addItem = () => setItems([...items, { ...EMPTY_ITEM }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const totalAmount = items.reduce((sum, item) => {
    return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0));
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShop) { toast.error('Please select a shop'); return; }
    const validItems = items.filter(i => i.product && i.price);
    if (validItems.length === 0) { toast.error('Add at least one product'); return; }

    setSaving(true);
    try {
      const payload = {
        shop: parseInt(selectedShop),
        notes,
        items: validItems.map(i => ({
          product: parseInt(i.product),
          quantity: parseInt(i.quantity),
          price: parseFloat(i.price),
        })),
      };
      const { data } = await API.post('/orders/', payload);
      setSuccess(data);
      toast.success('Order created successfully!');
    } catch (err) {
      toast.error('Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedLoc(''); setSelectedShop('');
    setNotes(''); setItems([{ ...EMPTY_ITEM }]); setSuccess(null);
  };

  if (success) return (
    <div className="fade-in" style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
      <div className="card">
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Order #{success.id} Created!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
          Shop: <strong>{success.shop_name}</strong> — {success.location_name}
        </p>
        <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-light)', marginBottom: 24 }}>
          ₹{parseFloat(success.total_amount || totalAmount).toFixed(2)}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={resetForm}>➕ New Order</button>
          <a href="/orders" className="btn btn-primary">📋 View Orders</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="page-header">
        <h2>➕ Create New Order</h2>
        <p>Select a shop and add products to create an order.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Shop Selection */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>🏪 Select Shop</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Day:</label>
              <select 
                value={activeDay} 
                onChange={e => {
                  setActiveDay(e.target.value);
                  onLocationChange('');
                }}
                style={{ padding: '4px 8px', fontSize: 13, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'All'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Location</label>
              <select id="location-select" value={selectedLoc} onChange={e => onLocationChange(e.target.value)}>
                <option value="">— Select Location —</option>
                {locations.filter(l => activeDay === 'All' || l.visit_day === activeDay).map(l => (
                  <option key={l.id} value={l.id}>📍 {l.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Shop</label>
              <select id="shop-select" value={selectedShop} onChange={e => setSelectedShop(e.target.value)} disabled={!selectedLoc}>
                <option value="">— Select Shop —</option>
                {shops.map(s => <option key={s.id} value={s.id}>🏪 {s.shop_name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>📦 Order Items</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Product</button>
          </div>

          {/* Header */}
          <div className="order-item-header">
            {['Company', 'Product / Size', 'Boxes', 'Rate (₹)', ''].map(h => (
              <div key={h} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="order-item-row">
              <select
                value={item.company}
                onChange={e => updateItem(idx, 'company', e.target.value)}
              >
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select
                value={item.product}
                onChange={e => updateItem(idx, 'product', e.target.value)}
                disabled={!item.company}
              >
                <option value="">Select Product</option>
                {getProducts(item.company).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} ({p.unit_size}){p.units_per_box ? ` (${p.units_per_box}/box)` : ''}
                  </option>
                ))}
              </select>

              <input
                type="number" min="1" value={item.quantity}
                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                placeholder="Boxes"
              />

              <input
                type="number" step="0.01" placeholder="0.00" value={item.price}
                onChange={e => updateItem(idx, 'price', e.target.value)}
              />

              <button type="button" className="btn btn-danger btn-sm" style={{ padding: '8px 10px' }}
                onClick={() => removeItem(idx)} disabled={items.length === 1}>🗑️</button>
            </div>
          ))}

          {/* Total */}
          <div style={{
            borderTop: '1px solid var(--glass-border)', paddingTop: 14, marginTop: 4,
            display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Total (Boxes × Rate/Box):</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-light)' }}>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes & Submit */}
        <div className="card">
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea rows={2} placeholder="Any delivery instructions..." value={notes}
              onChange={e => setNotes(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>🔄 Reset</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-order-btn">
              {saving ? '⏳ Saving...' : '💾 Save Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
