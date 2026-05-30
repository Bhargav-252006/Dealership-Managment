import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function InactiveAccount() {
  const { logout } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: 24
    }}>
      <div className="card fade-in" style={{
        maxWidth: 500,
        width: '100%',
        textAlign: 'center',
        padding: 40
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
          Account Inactive
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
          Your account is currently inactive. Please contact the developer to activate your account and gain access to TradeHub.
        </p>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 32
        }}>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 4 }}>Contact Email</div>
          <a 
            href="mailto:23211a67a7@gmail.com" 
            style={{ color: 'var(--accent-light)', fontWeight: 600, fontSize: 18, textDecoration: 'none' }}
          >
            23211a67a7@gmail.com
          </a>
        </div>

        <button 
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
