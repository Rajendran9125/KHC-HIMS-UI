import React, { useState } from 'react';
import { api } from '../../services/api';
import { Building2, ShieldCheck, UserCheck, KeyRound, AlertCircle, ArrowRight, User } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await api.login({ username: username.trim(), password });
      onLoginSuccess(resp);
    } catch (err) {
      setError(err.message || 'Login failed. Check username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="login-logo">
            <Building2 size={32} color="#ffffff" />
          </div>
          <h1 className="login-title">KHC HEALTHCARE</h1>
          <p className="login-subtitle">Hospital Information Management System (HIMS)</p>
        </div>

        {error && (
          <div className="login-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label required">Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{ paddingLeft: '36px' }}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="form-label required">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ paddingLeft: '36px' }}
              />
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: '700' }}
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to HIMS Portal'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Logins for Easy Evaluation */}
        <div className="quick-logins">
          <span className="quick-title">Quick Demo Login Shortcuts:</span>
          
          <button 
            type="button" 
            className="quick-chip admin"
            onClick={() => handleQuickLogin('admin', 'admin123')}
          >
            <ShieldCheck size={16} />
            <div>
              <strong>Admin Role (All Rights)</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Username: <code>admin</code> | Full Master, Admin &amp; Services</div>
            </div>
          </button>

          <button 
            type="button" 
            className="quick-chip user"
            onClick={() => handleQuickLogin('user1', 'user123')}
          >
            <UserCheck size={16} />
            <div>
              <strong>Frontdesk User (Selected Menus)</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Username: <code>user1</code> | Registration &amp; Billing Only</div>
            </div>
          </button>

          <button 
            type="button" 
            className="quick-chip user"
            onClick={() => handleQuickLogin('cashier1', 'cashier123')}
          >
            <UserCheck size={16} />
            <div>
              <strong>Cashier User (Selected Menus)</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Username: <code>cashier1</code> | Billing &amp; Reports Only</div>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%);
          padding: 20px;
        }
        .login-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          width: 100%;
          max-width: 460px;
          padding: 36px 32px;
        }
        .login-brand {
          text-align: center;
          margin-bottom: 24px;
        }
        .login-logo {
          width: 56px;
          height: 56px;
          background: #2563eb;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(37,99,235,0.35);
        }
        .login-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .login-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 4px;
        }
        .login-alert {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
        }
        .quick-logins {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .quick-title {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 4px;
          display: block;
        }
        .quick-chip {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .quick-chip:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          transform: translateY(-1px);
        }
        .quick-chip.admin {
          border-left: 4px solid #2563eb;
        }
        .quick-chip.user {
          border-left: 4px solid #059669;
        }
      `}</style>
    </div>
  );
}
