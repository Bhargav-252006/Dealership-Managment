import {useEffect, useState} from 'react';
import API from '../api';
import toast from 'react-hot-toast';

export default function Products() {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({name: '', category: 'Oil'});
  const [prodModal, setProdModal] = useState(false);
  const [prodForm, setProdForm] = useState({company: '', product_name: '', unit_size: '', units_per_box: '', default_price: ''});

  const [activeTab, setActiveTab] = useState('normal');

  const [editCompanyModal, setEditCompanyModal] = useState(false);
  const [editCompanyData, setEditCompanyData] = useState(null);

  const [editProdModal, setEditProdModal] = useState(false);
  const [editProdData, setEditProdData] = useState(null);

  const fetchCompanies = () => API.get('/companies/').then(({data}) => setCompanies(data));
  useEffect(() => {fetchCompanies();}, []);

  const saveCompany = async (e) => {
    e.preventDefault();
    try {
      await API.post('/companies/', form);
      toast.success('Company added!');
      setShowModal(false);
      setForm({name: '', category: 'Oil'});
      fetchCompanies();
    } catch {toast.error('Failed to add company');}
  };

  const updateCompany = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/companies/${editCompanyData.id}/`, {name: editCompanyData.name, category: editCompanyData.category});
      toast.success('Company updated!');
      setEditCompanyModal(false);
      fetchCompanies();
    } catch {toast.error('Failed to update company');}
  };

  const deleteCompany = async () => {
    if (!window.confirm(`Delete company "${editCompanyData.name}" and all its products?`)) return;
    try {
      await API.delete(`/companies/${editCompanyData.id}/`);
      toast.success('Company deleted');
      setEditCompanyModal(false);
      fetchCompanies();
    } catch {toast.error('Cannot delete — company may have existing orders');}
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      await API.post('/products/', prodForm);
      toast.success('Product added!');
      setProdModal(false);
      setProdForm({company: '', product_name: '', unit_size: '', units_per_box: '', default_price: ''});
      fetchCompanies();
    } catch {toast.error('Failed to add product');}
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/products/${editProdData.id}/`, {
        product_name: editProdData.product_name,
        unit_size: editProdData.unit_size,
        units_per_box: editProdData.units_per_box || null,
        default_price: editProdData.default_price
      });
      toast.success('Product updated!');
      setEditProdModal(false);
      fetchCompanies();
    } catch {toast.error('Failed to update product');}
  };

  const deleteProduct = async () => {
    if (!window.confirm(`Delete "${editProdData.product_name} (${editProdData.unit_size})"?`)) return;
    try {
      await API.delete(`/products/${editProdData.id}/`);
      toast.success('Product deleted');
      setEditProdModal(false);
      fetchCompanies();
    } catch {toast.error('Cannot delete — product may have existing orders');}
  };

  const catColor = (cat) => ({
    Oil: {bg: 'var(--yellow-bg)', color: 'var(--yellow)'},
    Atta: {bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308'},
    Soap: {bg: 'var(--blue-bg)', color: 'var(--blue)'},
    Rice: {bg: 'var(--green-bg)', color: 'var(--green)'},
  }[cat] || {bg: 'var(--bg-card)', color: 'var(--text-secondary)'});

  const CAT_ICON = {Oil: '🛢️', Soap: '🧼', Rice: '🌾', Atta: '🌾'};

  const renderCard = (co) => {
    const {bg, color} = catColor(co.category);
    return (
      <div key={co.id} className="card" style={{padding: 20}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14}}>
          <div>
            <h3 style={{fontSize: 16, fontWeight: 700}}>{co.name}</h3>
            <span className="badge" style={{background: bg, color, marginTop: 4, display: 'inline-flex'}}>{co.category}</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{fontSize: 28}}>{CAT_ICON[co.category] || '📦'}</span>
            <button
              onClick={() => {setEditCompanyData({id: co.id, name: co.name, category: co.category}); setEditCompanyModal(true);}}
              style={{background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: 6, padding: '4px 8px', fontSize: 13, cursor: 'pointer'}}
            >✏️</button>
          </div>
        </div>

        {co.products.length === 0 ? (
          <p style={{color: 'var(--text-muted)', fontSize: 13}}>No products yet</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            {[...co.products].sort((a, b) => a.unit_size.localeCompare(b.unit_size)).map(p => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
                borderRadius: 8, border: '1px solid var(--glass-border)'
              }}>
                <div>
                  <div style={{fontSize: 13, fontWeight: 600}}>{p.unit_size}</div>
                  {p.units_per_box && <div style={{fontSize: 11, color: 'var(--text-muted)'}}>{p.units_per_box}</div>}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: 14, fontWeight: 700, color: 'var(--accent-light)'}}>
                      ₹{p.units_per_box ? (parseFloat(p.default_price) * p.units_per_box).toFixed(2) : parseFloat(p.default_price).toFixed(2)}
                    </div>
                    {p.units_per_box && (
                      <div style={{fontSize: 10, color: 'var(--text-muted)'}}>
                        (₹{parseFloat(p.default_price).toFixed(2)}/pc)
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {setEditProdData({id: p.id, product_name: p.product_name, unit_size: p.unit_size, units_per_box: p.units_per_box || '', default_price: parseFloat(p.default_price)}); setEditProdModal(true);}}
                    style={{background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: 4, padding: '2px 6px', fontSize: 12, cursor: 'pointer'}}
                  >✏️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>🏷️ Products &amp; Companies</h2>
        <p>Manage your product catalog — brands and their variants.</p>
      </div>

      <div style={{display: 'flex', gap: 12, marginBottom: 24}}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Company</button>
        <button className="btn btn-secondary" onClick={() => setProdModal(true)}>+ Add Product</button>
      </div>

      <div style={{display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'center', background: 'var(--bg-card)', padding: '6px', borderRadius: '30px', border: '1px solid var(--glass-border)', width: 'fit-content', margin: '0 auto 32px'}}>
        <button
          onClick={() => setActiveTab('normal')}
          style={{
            padding: '10px 24px', borderRadius: 24, border: 'none', cursor: 'pointer',
            background: activeTab === 'normal' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'normal' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: activeTab === 'normal' ? '0 4px 12px var(--accent-glow)' : 'none',
            transition: 'all 0.3s ease', fontSize: 14
          }}>
          🛢️ Normal Oils
        </button>
        <button
          onClick={() => setActiveTab('lamp')}
          style={{
            padding: '10px 24px', borderRadius: 24, border: 'none', cursor: 'pointer',
            background: activeTab === 'lamp' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'lamp' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: activeTab === 'lamp' ? '0 4px 12px var(--accent-glow)' : 'none',
            transition: 'all 0.3s ease', fontSize: 14
          }}>
          🪔 Lamp / Palm Oil
        </button>
        <button
          onClick={() => setActiveTab('atta')}
          style={{
            padding: '10px 24px', borderRadius: 24, border: 'none', cursor: 'pointer',
            background: activeTab === 'atta' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'atta' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: activeTab === 'atta' ? '0 4px 12px var(--accent-glow)' : 'none',
            transition: 'all 0.3s ease', fontSize: 14
          }}>
          🌾 Attas
        </button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 32}}>
        {activeTab === 'normal' && companies.filter(co => co.category !== 'Atta' && !['Deepam Oil', 'Palm Oil'].includes(co.name)).map(co => renderCard(co))}
        {activeTab === 'lamp' && companies.filter(co => ['Deepam Oil', 'Palm Oil'].includes(co.name)).map(co => renderCard(co))}
        {activeTab === 'atta' && companies.filter(co => co.category === 'Atta' || ['Shubam Gold', 'Shreshta'].includes(co.name)).map(co => renderCard(co))}
      </div>

      {/* Add Company Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🏷️ Add Company</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={saveCompany}>
              <div className="form-group">
                <label>Company Name *</label>
                <input placeholder="e.g. Gold Drop" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="Oil">🛢️ Oil</option>
                  <option value="Atta">🌾 Atta</option>
                  <option value="Soap">🧼 Soap</option>
                  <option value="Rice">🌾 Rice</option>
                  <option value="Grocery">🛒 Grocery</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
              <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editCompanyModal && editCompanyData && (
        <div className="modal-overlay" onClick={() => setEditCompanyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">✏️ Edit Company</span>
              <button className="modal-close" onClick={() => setEditCompanyModal(false)}>✕</button>
            </div>
            <form onSubmit={updateCompany}>
              <div className="form-group">
                <label>Company Name *</label>
                <input value={editCompanyData.name}
                  onChange={e => setEditCompanyData({...editCompanyData, name: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={editCompanyData.category} onChange={e => setEditCompanyData({...editCompanyData, category: e.target.value})}>
                  <option value="Oil">🛢️ Oil</option>
                  <option value="Soap">🧼 Soap</option>
                  <option value="Rice">🌾 Rice</option>
                  <option value="Grocery">🛒 Grocery</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20}}>
                <button type="button" className="btn btn-danger" onClick={deleteCompany}>🗑️ Delete Company</button>
                <div style={{display: 'flex', gap: 10}}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditCompanyModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {prodModal && (
        <div className="modal-overlay" onClick={() => setProdModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">📦 Add Product</span>
              <button className="modal-close" onClick={() => setProdModal(false)}>✕</button>
            </div>
            <form onSubmit={saveProduct}>
              <div className="form-group">
                <label>Company *</label>
                <select value={prodForm.company}
                  onChange={e => setProdForm({...prodForm, company: e.target.value})} required>
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input placeholder="e.g. Gold Drop" value={prodForm.product_name}
                    onChange={e => setProdForm({...prodForm, product_name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Unit Size *</label>
                  <input placeholder="e.g. 5L, 1kg" value={prodForm.unit_size}
                    onChange={e => setProdForm({...prodForm, unit_size: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Units per Box</label>
                  <input type="number" placeholder="e.g. 16" value={prodForm.units_per_box}
                    onChange={e => setProdForm({...prodForm, units_per_box: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Price per Piece (₹)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={prodForm.default_price}
                    onChange={e => setProdForm({...prodForm, default_price: e.target.value})} />
                </div>
              </div>
              <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setProdModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProdModal && editProdData && (
        <div className="modal-overlay" onClick={() => setEditProdModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">✏️ Edit Product</span>
              <button className="modal-close" onClick={() => setEditProdModal(false)}>✕</button>
            </div>
            <form onSubmit={updateProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input value={editProdData.product_name}
                    onChange={e => setEditProdData({...editProdData, product_name: e.target.value})} required autoFocus />
                </div>
                <div className="form-group">
                  <label>Unit Size *</label>
                  <input value={editProdData.unit_size}
                    onChange={e => setEditProdData({...editProdData, unit_size: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Units per Box</label>
                  <input type="number" value={editProdData.units_per_box}
                    onChange={e => setEditProdData({...editProdData, units_per_box: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Price per Piece (₹) *</label>
                  <input type="number" step="0.01" value={editProdData.default_price}
                    onChange={e => setEditProdData({...editProdData, default_price: e.target.value})} required />
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20}}>
                <button type="button" className="btn btn-danger" onClick={deleteProduct}>🗑️ Delete Product</button>
                <div style={{display: 'flex', gap: 10}}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditProdModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
