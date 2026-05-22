import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { impersonate } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async (userId, currentStatus) => {
    try {
      const { data } = await API.patch(`/admin/users/${userId}/subscription`, {
        is_active: !currentStatus
      });
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: data.is_active } : u));
      toast.success(`Subscription ${data.is_active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to update subscription');
    }
  };

  const handleImpersonate = async (userId, username) => {
    try {
      toast.loading(`Impersonating ${username}...`);
      await impersonate(userId);
      toast.dismiss();
      toast.success(`You are now logged in as ${username}`);
      window.location.href = '/';
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to impersonate user');
    }
  };

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={fetchUsers}>Refresh Data</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading dealers...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'var(--surface-hover)' }}>
                <th style={{ padding: 16, color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14 }}>Dealer</th>
                <th style={{ padding: 16, color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14 }}>Type</th>
                <th style={{ padding: 16, color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14 }}>Status</th>
                <th style={{ padding: 16, color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: 16 }}>
                    <div style={{ fontWeight: 600 }}>{u.username}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{u.first_name || ''} {u.last_name || ''}</div>
                  </td>
                  <td style={{ padding: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
                    {u.business_type || 'N/A'}
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 12, 
                      fontSize: 12, 
                      fontWeight: 600,
                      backgroundColor: u.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: u.is_active ? '#4ade80' : '#f87171'
                    }}>
                      {u.is_active ? 'ACTIVE' : 'EXPIRED'}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => handleToggleSubscription(u.id, u.is_active)}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: 6, 
                          border: '1px solid var(--glass-border)', 
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleImpersonate(u.id, u.username)}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: 6, 
                          border: 'none', 
                          backgroundColor: 'var(--accent)',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        Impersonate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No dealers found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
