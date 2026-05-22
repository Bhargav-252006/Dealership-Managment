import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Shops from './pages/Shops';
import CreateOrder from './pages/CreateOrder';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function AppRoutes() {
  const { user, loading, stopImpersonating } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: 18,
      flexDirection: 'column', gap: 16
    }}>
      <div style={{ fontSize: 48 }}>🛢️</div>
      <span>Loading TradeHub...</span>
    </div>
  );

  if (!user) {
    return (
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  const isImpersonating = !!localStorage.getItem('adminToken');

  return (
    <div className="app-layout">
      {isImpersonating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#ef4444', color: 'white', padding: '8px 16px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
          fontWeight: 600, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          ⚠️ You are currently impersonating dealer: {user.user?.username}
          <button 
            onClick={stopImpersonating}
            style={{ 
              background: 'white', color: '#ef4444', border: 'none', 
              padding: '4px 12px', borderRadius: 4, fontWeight: 700, cursor: 'pointer' 
            }}
          >
            Stop Impersonating
          </button>
        </div>
      )}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: isImpersonating ? 36 : 0 }}>
        {/* Mobile Header */}
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="logo-icon" style={{ fontSize: 24 }}>🛢️</div>
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>TradeHub</h1>
          </div>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
        </header>

        <main className="main-content" style={{ minHeight: 'auto' }}>
          <Routes>
            {user.user?.is_admin ? (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/shops" element={<Shops />} />
                <Route path="/orders/create" element={<CreateOrder />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/products" element={<Products />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2640',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              fontSize: 14,
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
