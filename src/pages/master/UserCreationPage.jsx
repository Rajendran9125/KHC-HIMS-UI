import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { UserPlus, UserCheck, Trash2, CheckCircle2, XCircle, KeyRound, Lock } from 'lucide-react';

const ALL_MENUS = [
  { id: 'admin', label: 'MASTER: ADMIN' },
  { id: 'users', label: 'MASTER: USER CREATION' },
  { id: 'services', label: 'MASTER: SERVICE MASTER (TARIFF)' },
  { id: 'op-new', label: 'REGISTRATION: OP NEW' },
  { id: 'op-review', label: 'REGISTRATION: OP REVIEW' },
  { id: 'patient-update', label: 'REGISTRATION: PATIENT DETAIL UPDATE' },
  { id: 'modify-doctor-reg', label: 'REGISTRATION: DOCTOR MODIFY' },
  { id: 'modify-patient-type', label: 'REGISTRATION: PATIENT TYPE MODIFY' },
  { id: 'modify-payment-type-reg', label: 'REGISTRATION: PAYMENT TYPE MODIFY' },
  { id: 'op-billing', label: 'BILLING: OP SERVICE BILLING' },
  { id: 'modify-doctor-bill', label: 'BILLING: DOCTOR MODIFY' },
  { id: 'modify-payment-type-bill', label: 'BILLING: PAYMENT TYPE MODIFY' },
  { id: 'report-billing', label: 'REPORT: OP BILLING' },
  { id: 'report-revenue', label: 'REPORT: REVENUE (SUMMARY + SERVICE WISE)' },
  { id: 'report-registration', label: 'REPORT: OP REGISTRATION' },
];

export default function UserCreationPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenus, setSelectedMenus] = useState([
    'op-new', 'op-review', 'patient-update', 'op-billing', 'report-registration'
  ]);

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'USER',
    department: 'Front Desk',
    phone: '',
    isActive: true,
  });
  const [message, setMessage] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleMenuToggle = (menuId) => {
    if (selectedMenus.includes(menuId)) {
      setSelectedMenus(selectedMenus.filter(m => m !== menuId));
    } else {
      setSelectedMenus([...selectedMenus, menuId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        password: form.password || 'password123',
        allowedMenus: form.role === 'ADMIN' ? 'all' : selectedMenus.join(','),
      };
      await api.createUser(payload);
      setMessage({ type: 'success', text: `User "${form.username}" created successfully with ${form.role} permissions!` });
      setForm({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'USER',
        department: 'Front Desk',
        phone: '',
        isActive: true,
      });
      loadUsers();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    }
  };

  const handleDelete = async (id, uname) => {
    if (!window.confirm(`Are you sure you want to delete user "${uname}"?`)) return;
    try {
      await api.deleteUser(id);
      setMessage({ type: 'success', text: `User "${uname}" removed.` });
      loadUsers();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <UserPlus size={22} color="#2563eb" />
              <span>MASTER &gt; USER CREATION</span>
            </h2>
            <p className="card-subtitle">
              Create staff user accounts with Role-Based Access: Admin (All rights) or User (Selected menus only).
            </p>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '18px',
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '28px' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Username (Login ID)</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                placeholder="e.g. staff1 or receptionist"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Password</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder="Set user password"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Full Staff Name</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={form.fullName}
                onChange={(e) => setForm({...form, fullName: e.target.value})}
                placeholder="e.g. John Smith"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Role</label>
              <select 
                className="form-control" 
                value={form.role}
                onChange={(e) => setForm({...form, role: e.target.value})}
              >
                <option value="ADMIN">ADMIN (All Rights — Full Access to Master, Reg, Bill, Report)</option>
                <option value="USER">USER (Selected Menus Only)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input 
                type="text" 
                className="form-control" 
                value={form.department}
                onChange={(e) => setForm({...form, department: e.target.value})}
                placeholder="e.g. Front Desk, Accounts, Lab"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="staff@hospital.com"
              />
            </div>
          </div>

          {/* If Role is USER, show Menu Permission Selection */}
          {form.role === 'USER' && (
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Lock size={15} />
                <span>Select Allowed Menus for this User (Selected Menu Only):</span>
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                {ALL_MENUS.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={selectedMenus.includes(m.id)}
                      onChange={() => handleMenuToggle(m.id)}
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            <UserPlus size={16} />
            <span>Create User Account</span>
          </button>
        </form>

        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
          Registered Hospital Users ({users.length})
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Allowed Menus</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No users configured yet.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td><strong>#{u.id}</strong></td>
                    <td><code>{u.username}</code></td>
                    <td><strong>{u.fullName}</strong></td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-success'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.department || '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '280px' }}>
                      {u.role === 'ADMIN' ? (
                        <strong style={{ color: '#2563eb' }}>All Menus (Full Rights)</strong>
                      ) : (
                        u.allowedMenus || 'Default (OP New, Review, Billing)'
                      )}
                    </td>
                    <td>
                      {u.isActive ? (
                        <span className="badge badge-success"><CheckCircle2 size={12} /> Active</span>
                      ) : (
                        <span className="badge badge-danger"><XCircle size={12} /> Inactive</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDelete(u.id, u.username)}
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
