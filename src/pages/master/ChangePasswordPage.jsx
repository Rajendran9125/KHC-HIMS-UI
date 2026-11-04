import React, { useState } from 'react';
import { api } from '../../services/api';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, User, RefreshCw } from 'lucide-react';

export default function ChangePasswordPage({ currentUser }) {
  const [username, setUsername] = useState(currentUser?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRe, setShowRe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!username.trim()) {
      setMessage({ type: 'danger', text: 'Username is required.' });
      return;
    }
    if (!oldPassword) {
      setMessage({ type: 'danger', text: 'Please enter your current (old) password.' });
      return;
    }
    if (!newPassword) {
      setMessage({ type: 'danger', text: 'Please enter a new password.' });
      return;
    }
    if (newPassword.length < 4) {
      setMessage({ type: 'danger', text: 'New password must be at least 4 characters long.' });
      return;
    }
    if (newPassword !== rePassword) {
      setMessage({ type: 'danger', text: 'New password and Re-entered password do not match.' });
      return;
    }
    if (newPassword === oldPassword) {
      setMessage({ type: 'danger', text: 'New password cannot be the same as your old password.' });
      return;
    }

    try {
      setLoading(true);
      await api.changePassword({
        username: username.trim(),
        oldPassword: oldPassword,
        newPassword: newPassword,
        rePassword: rePassword,
      });

      setMessage({ 
        type: 'success', 
        text: `Password for user "${username}" has been successfully changed!` 
      });
      // Clear password fields on success
      setOldPassword('');
      setNewPassword('');
      setRePassword('');
    } catch (err) {
      setMessage({ 
        type: 'danger', 
        text: err.message || 'Failed to change password. Please check your old password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOldPassword('');
    setNewPassword('');
    setRePassword('');
    setMessage(null);
  };

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <KeyRound size={22} color="#2563eb" />
            <span>MASTER &gt; CHANGE PASSWORD</span>
          </h2>
          <p className="card-subtitle">
            Update account security credentials with old password verification.
          </p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontSize: '0.92rem', fontWeight: '500' }}>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
            <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
            Current account: <strong>{currentUser?.username}</strong> ({currentUser?.role})
          </span>
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label required">Old Password (Current Password)</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showOld ? 'text' : 'password'} 
              className="form-control" 
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter your current password"
              style={{ paddingLeft: '36px', paddingRight: '40px' }}
            />
            <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <button 
              type="button" 
              onClick={() => setShowOld(!showOld)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label required">New Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showNew ? 'text' : 'password'} 
              className="form-control" 
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter minimum 4 characters"
              style={{ paddingLeft: '36px', paddingRight: '40px' }}
            />
            <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <button 
              type="button" 
              onClick={() => setShowNew(!showNew)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label required">Re-enter New Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showRe ? 'text' : 'password'} 
              className="form-control" 
              required
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              placeholder="Confirm new password"
              style={{ paddingLeft: '36px', paddingRight: '40px' }}
            />
            <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <button 
              type="button" 
              onClick={() => setShowRe(!showRe)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              {showRe ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleReset}
            disabled={loading}
          >
            Clear
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ minWidth: '160px' }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <KeyRound size={16} />
                <span>Change Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
