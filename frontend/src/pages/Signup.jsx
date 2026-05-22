import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    business_type: 'Oil',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await API.post('/register/', formData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page fade-in">
      <div className="login-card" style={{ maxWidth: 500 }}>
        <div className="login-logo">
          <div className="logo-big">🛢️</div>
          <h1>Create Account</h1>
          <p>Join TradeHub today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>First Name</label>
              <input type="text" name="first_name" placeholder="John" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Last Name</label>
              <input type="text" name="last_name" placeholder="Doe" value={formData.last_name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Username *</label>
            <input type="text" name="username" placeholder="Choose a unique username" value={formData.username} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Email</label>
              <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Phone Number</label>
              <input type="tel" name="phone" placeholder="+91..." value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Business Type</label>
            <select name="business_type" value={formData.business_type} onChange={handleChange}>
              <option value="Oil">Oil Distributorship</option>
              <option value="Grocery">Grocery Whole-seller</option>
              <option value="Supermarket">Supermarket Chain</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Password *</label>
              <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Confirm Password *</label>
              <input type="password" name="confirm_password" placeholder="••••••••" value={formData.confirm_password} onChange={handleChange} required minLength={6} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12, padding: '12px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}
