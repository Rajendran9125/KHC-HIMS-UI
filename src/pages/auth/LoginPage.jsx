import React, { useState } from 'react';
import { api } from '../../services/api';
import { KeyRound, AlertCircle, ArrowRight, User, CheckCircle2, ArrowLeft, Mail, ShieldAlert } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'reset'
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Reset password form state
  const [resetUsername, setResetUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const resp = await api.login({ username: username.trim(), password });
      onLoginSuccess(resp);
    } catch (err) {
      setError(err.message || 'Login failed. Check username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!resetUsername.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!emailOrPhone.trim()) {
      setError('Registered Email or Phone number is mandatory for identity verification');
      return;
    }
    if (!newPassword) {
      setError('Please enter your new password');
      return;
    }
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and Confirm password do not match');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({
        username: resetUsername.trim(),
        newPassword: newPassword.trim(),
        emailOrPhone: emailOrPhone.trim() || undefined,
      });

      // Reset success: switch to login mode and pre-fill username
      setUsername(resetUsername.trim());
      setPassword('');
      setResetUsername('');
      setEmailOrPhone('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
      setSuccessMsg('Password updated successfully! Please sign in with your new password.');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const openResetMode = () => {
    setError(null);
    setSuccessMsg(null);
    setResetUsername(username);
    setMode('reset');
  };

  const openLoginMode = () => {
    setError(null);
    setSuccessMsg(null);
    setMode('login');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Brand Header with Uploaded KH Clinic Logo */}
        <div className="login-brand">
          <div className="login-logo-wrapper">
            <img 
              src="/kh-clinic-logo.jpg" 
              alt="KH CLINIC Logo" 
              className="login-logo-img"
            />
          </div>
          <h1 className="login-title">KH CLINIC</h1>
          <p className="login-subtitle">Melvisharam</p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="login-alert success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="login-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <div className="form-group" style={{ marginBottom: '18px', width: '100%' }}>
              <label className="form-label required">Username</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '38px', height: '46px', fontSize: '0.95rem' }}
                  autoFocus
                />
                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px', width: '100%' }}>
              <label className="form-label required">Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="password" 
                  className="form-control" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '38px', height: '46px', fontSize: '0.95rem' }}
                />
                <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: '700', height: '48px', marginTop: '6px' }}
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button 
                type="button" 
                className="reset-pass-link" 
                onClick={openResetMode}
              >
                <KeyRound size={14} />
                <span>Reset Password?</span>
              </button>
            </div>
          </form>
        ) : (
          /* MODE 2: RESET PASSWORD FORM */
          <form onSubmit={handleResetPassword} className="reset-password-form" style={{ width: '100%' }}>
            <div className="reset-header">
              <button 
                type="button" 
                className="back-btn" 
                onClick={openLoginMode}
                title="Back to Login"
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </button>
              <h2 className="reset-title">Reset Password</h2>
            </div>

            <div className="form-group" style={{ marginBottom: '14px', width: '100%' }}>
              <label className="form-label required">Username</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="Enter your username (e.g. admin)"
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '38px', height: '44px' }}
                  autoFocus
                />
                <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px', width: '100%' }}>
              <label className="form-label required">
                <span>Registered Email or Phone Number</span>
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter registered email or mobile number"
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '38px', height: '44px' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                * Mandatory verification: Must match the email or phone registered on this account
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '14px', width: '100%' }}>
              <label className="form-label required">New Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="password" 
                  className="form-control" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '38px', height: '44px' }}
                />
                <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px', width: '100%' }}>
              <label className="form-label required">Confirm New Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="password" 
                  className="form-control" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '38px', height: '44px' }}
                />
                <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '0.98rem', fontWeight: '700', height: '46px' }}
              disabled={loading}
            >
              <span>{loading ? 'Updating Password...' : 'Update & Reset Password'}</span>
              <CheckCircle2 size={18} />
            </button>
          </form>
        )}
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
          max-width: 440px;
          padding: 36px 32px;
        }
        .login-brand {
          text-align: center;
          margin-bottom: 22px;
        }
        .login-logo-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .login-logo-img {
          width: 105px;
          height: 105px;
          object-fit: contain;
          border-radius: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          background: #ffffff;
          padding: 4px;
          border: 1px solid #e2e8f0;
        }
        .login-title {
          font-size: 1.55rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .login-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 6px;
          font-weight: 500;
        }
        .login-alert {
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          line-height: 1.4;
        }
        .login-alert.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .login-alert.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .reset-pass-link {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          transition: color 0.15s ease;
        }
        .reset-pass-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
        .reset-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .reset-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .back-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 6px;
          border-radius: 4px;
          transition: all 0.15s ease;
        }
        .back-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
}
