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
                    <div style={{ display: 'flex', gap: 8 }}>

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
