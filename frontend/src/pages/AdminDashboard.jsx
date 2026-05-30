import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dealers'); // 'dealers' | 'analytics' | 'logs' | 'announcements'
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { impersonate } = useAuth();

  // Search queries
  const [searchDealers, setSearchDealers] = useState('');
  const [searchLogs, setSearchLogs] = useState('');

  // Announcement form
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMessage, setAnnounceMessage] = useState('');
  const [announcing, setAnnouncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dealers') {
        const { data } = await API.get('/admin/users');
        setUsers(data);
      } else if (activeTab === 'analytics') {
        const { data } = await API.get('/admin/analytics');
        setAnalytics(data);
      } else if (activeTab === 'logs') {
        const { data } = await API.get('/admin/activity-logs');
        setLogs(data);
      }
    } catch (err) {
      toast.error('Failed to load data');
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

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await API.patch(`/admin/users/${userId}/subscription`, { is_active: !currentStatus });
      toast.success('Subscription status updated');
      // Refresh list
      const { data } = await API.get('/admin/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceMessage.trim()) {
      return toast.error('Title and message are required');
    }
    setAnnouncing(true);
    try {
      await API.post('/announcements/', {
        title: announceTitle,
        message: announceMessage
      });
      toast.success('Announcement broadcasted successfully to all dealers!');
      setAnnounceTitle('');
      setAnnounceMessage('');
      setActiveTab('dealers');
    } catch (err) {
      toast.error('Failed to publish announcement');
    } finally {
      setAnnouncing(false);
    }
  };

  // Render SVG Chart for Analytics
  const renderSVGChart = (dailyRevenue) => {
    if (!dailyRevenue || dailyRevenue.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

    const dataPoints = dailyRevenue.map(d => ({
      date: d.date,
      value: parseFloat(d.revenue)
    }));

    const maxVal = Math.max(...dataPoints.map(d => d.value), 100);
    const width = 600;
    const height = 200;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Calculate coordinates
    const coords = dataPoints.map((d, i) => {
      const x = paddingLeft + (i * chartWidth) / (dataPoints.length - 1);
      const y = paddingTop + chartHeight - (d.value * chartHeight) / maxVal;
      return { x, y, date: d.date, value: d.value };
    });

    const pathD = coords.length > 0
      ? `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ')
      : '';

    const areaD = coords.length > 0
      ? `${pathD} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`
      : '';

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '500px', height: 'auto' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0"/>
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + chartHeight * ratio;
            const val = (maxVal * (1 - ratio)).toFixed(0);
            return (
              <g key={index}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <text x={paddingLeft - 10} y={y + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">₹{val}</text>
              </g>
            );
          })}

          {/* Area under the line */}
          {areaD && <path d={areaD} fill="url(#chartGradient)" />}

          {/* Line path */}
          {pathD && <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />}

          {/* Points */}
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r="4"
              fill="var(--bg-secondary)"
              stroke="var(--accent-light)"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
            >
              <title>{c.date}: ₹{c.value.toFixed(2)}</title>
            </circle>
          ))}

          {/* X Axis Labels */}
          {coords.map((c, i) => {
            // Only show alternate labels to prevent crowding
            if (coords.length > 7 && i % 2 !== 0) return null;
            const dateParts = c.date.split('-');
            const displayDate = `${dateParts[1]}/${dateParts[2]}`; // MM/DD
            return (
              <text key={i} x={c.x} y={height - paddingBottom + 18} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                {displayDate}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  // Filter Dealers
  const filteredDealers = users.filter(u => {
    const q = searchDealers.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name || '').toLowerCase().includes(q) ||
      (u.business_type || '').toLowerCase().includes(q)
    );
  });

  // Filter Logs
  const filteredLogs = logs.filter(log => {
    const q = searchLogs.toLowerCase();
    const username = log.user?.username || '';
    const name = `${log.user?.first_name || ''} ${log.user?.last_name || ''}`;
    return (
      log.action.toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      username.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-container fade-in" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 28, fontWeight: 800 }}>👑 Admin Control Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage TradeHub platform and view global dealership metrics.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={fetchData}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tabs Menu */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        borderBottom: '1px solid var(--glass-border)', 
        marginBottom: 24,
        overflowX: 'auto',
        paddingBottom: 6
      }}>
        {[
          { id: 'dealers', label: '👥 Dealers', count: users.length },
          { id: 'analytics', label: '📊 Analytics' },
          { id: 'logs', label: '📜 Activity Logs' },
          { id: 'announcements', label: '📢 Announcements' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id ? '0 -2px 10px rgba(217, 119, 6, 0.15)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && activeTab !== 'announcements' ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ marginRight: 10 }} /> Loading data...
        </div>
      ) : (
        <div>
          {/* Tab 1: Dealers List */}
          {activeTab === 'dealers' && (
            <div className="fade-in">
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="🔍 Search dealers by username, business category, or name..."
                  value={searchDealers}
                  onChange={e => setSearchDealers(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>Dealer</th>
                      <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>Phone / Business</th>
                      <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>Status</th>
                      <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDealers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{u.username}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.first_name || ''} {u.last_name || ''}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{u.phone || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--accent)' }}>{u.business_type || 'Oil'}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span 
                            onClick={() => toggleUserStatus(u.id, u.is_active)}
                            style={{ 
                              display: 'inline-block',
                              padding: '4px 10px', 
                              borderRadius: 12, 
                              fontSize: 11, 
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: u.is_active ? 'var(--green-bg)' : 'var(--red-bg)',
                              color: u.is_active ? 'var(--green)' : 'var(--red)',
                              border: '1px solid currentColor',
                              transition: 'transform 0.1s'
                            }}
                            className="status-toggle-btn"
                          >
                            {u.is_active ? '● Active' : '○ Suspended'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
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
                              fontWeight: 700,
                              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.2)'
                            }}
                          >
                            💻 Impersonate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredDealers.length === 0 && (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching dealers found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Analytics */}
          {activeTab === 'analytics' && analytics && (
            <div className="fade-in">
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="stat-card purple" style={{ margin: 0 }}>
                  <span className="stat-icon">💵</span>
                  <div className="stat-value">₹{parseFloat(analytics.totalRevenue).toLocaleString('en-IN')}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card blue" style={{ margin: 0 }}>
                  <span className="stat-icon">📦</span>
                  <div className="stat-value">{analytics.totalOrders}</div>
                  <div className="stat-label">Orders Handled</div>
                </div>
                <div className="stat-card yellow" style={{ margin: 0, background: 'linear-gradient(135deg, rgba(202, 138, 4, 0.15) 0%, rgba(20, 30, 48, 0.4) 100%)', border: '1px solid rgba(202, 138, 4, 0.3)' }}>
                  <span className="stat-icon">👥</span>
                  <div className="stat-value">{analytics.totalDealers}</div>
                  <div className="stat-label">Active Dealers</div>
                </div>
                <div className="stat-card green" style={{ margin: 0 }}>
                  <span className="stat-icon">🏪</span>
                  <div className="stat-value">{analytics.totalShops}</div>
                  <div className="stat-label">Shops Registered</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
                {/* SVG Area Chart */}
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📈 Revenue Trend (Last 14 Days)</h3>
                  {renderSVGChart(analytics.dailyRevenue)}
                </div>

                {/* Top Dealers */}
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🏆 Top Performing Dealers</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {analytics.topDealers.map((d, index) => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ 
                            background: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--glass-border)',
                            color: index < 3 ? 'black' : 'var(--text-primary)',
                            borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12
                          }}>
                            {index + 1}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{d.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.ordersCount} orders</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent-light)' }}>
                          ₹{parseFloat(d.revenue).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                    {analytics.topDealers.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 12 }}>
                        No orders recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Activity Logs */}
          {activeTab === 'logs' && (
            <div className="fade-in">
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="🔍 Search logs by username, action type, or details..."
                  value={searchLogs}
                  onChange={e => setSearchLogs(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, width: '15%' }}>User</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, width: '20%' }}>Action</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, width: '45%' }}>Details</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, width: '20%' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{log.user?.username || 'System'}</span>
                        </td>
                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <span className="badge" style={{ 
                            background: log.action.startsWith('Created') ? 'var(--green-bg)' : log.action.startsWith('Deleted') ? 'var(--red-bg)' : 'var(--yellow-bg)',
                            color: log.action.startsWith('Created') ? 'var(--green)' : log.action.startsWith('Deleted') ? 'var(--red)' : 'var(--yellow)',
                            fontSize: 11, fontWeight: 700
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-word', verticalAlign: 'top' }}>
                          {log.details || '—'}
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 11, color: 'var(--text-muted)', verticalAlign: 'top' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No activities recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Announcements Composer */}
          {activeTab === 'announcements' && (
            <div className="card fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>📢 Broadcast Announcement</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>This message will be broadcasted to all active dealers instantly. It will appear at the top of their dashboard and trigger a notification alert.</p>
              
              <form onSubmit={handlePostAnnouncement}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>Announcement Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Stock Availability Notice / Price Revisions"
                    value={announceTitle}
                    onChange={e => setAnnounceTitle(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--glass-border)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      marginTop: 6
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>Message Body</label>
                  <textarea
                    placeholder="Provide detailed notice specifications here..."
                    rows="5"
                    value={announceMessage}
                    onChange={e => setAnnounceMessage(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--glass-border)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      marginTop: 6,
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setAnnounceTitle(''); setAnnounceMessage(''); }}
                    disabled={announcing}
                  >
                    Clear Form
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={announcing}
                  >
                    {announcing ? 'Broadcasting...' : '📢 Publish Broadcast'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
