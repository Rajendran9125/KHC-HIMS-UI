import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Edit3, 
  Save, 
  X, 
  Database,
  RefreshCw 
} from 'lucide-react';

export default function UserCreationPage() {
  const [users, setUsers] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menusLoading, setMenusLoading] = useState(true);
  
  // Edit mode tracking
  const [editingUserId, setEditingUserId] = useState(null);

  const [selectedMenus, setSelectedMenus] = useState([
    'op-new', 'op-review', 'patient-update', 'op-billing', 'report-registration'
  ]);

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'USER',
    department: 'Front Desk',
    isActive: true,
  });
  const [message, setMessage] = useState(null);

  // Load registered users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load system menus dynamically from database table (khc_app_menu)
  const loadMenus = async () => {
    try {
      setMenusLoading(true);
      const data = await api.getMenus();
      if (data && data.length > 0) {
        setMenus(data);
      } else {
        // Fallback default structure if DB is still seeding
        setMenus([
          { menuCode: 'admin', menuLabel: 'MASTER: ADMIN', category: 'MASTER' },
          { menuCode: 'users', menuLabel: 'MASTER: USER CREATION', category: 'MASTER' },
          { menuCode: 'services', menuLabel: 'MASTER: SERVICE MASTER (TARIFF)', category: 'MASTER' },
          { menuCode: 'op-new', menuLabel: 'REGISTRATION: OP NEW', category: 'REGISTRATION' },
          { menuCode: 'op-review', menuLabel: 'REGISTRATION: OP REVIEW', category: 'REGISTRATION' },
          { menuCode: 'patient-update', menuLabel: 'REGISTRATION: PATIENT DETAIL UPDATE', category: 'REGISTRATION' },
          { menuCode: 'modify-doctor-reg', menuLabel: 'REGISTRATION: DOCTOR MODIFY', category: 'REGISTRATION' },
          { menuCode: 'modify-patient-type', menuLabel: 'REGISTRATION: PATIENT TYPE MODIFY', category: 'REGISTRATION' },
          { menuCode: 'modify-payment-type-reg', menuLabel: 'REGISTRATION: PAYMENT TYPE MODIFY', category: 'REGISTRATION' },
          { menuCode: 'op-billing', menuLabel: 'BILLING: OP SERVICE BILLING', category: 'BILLING' },
          { menuCode: 'modify-doctor-bill', menuLabel: 'BILLING: DOCTOR MODIFY', category: 'BILLING' },
          { menuCode: 'modify-payment-type-bill', menuLabel: 'BILLING: PAYMENT TYPE MODIFY', category: 'BILLING' },
          { menuCode: 'report-billing', menuLabel: 'REPORT: OP BILLING', category: 'REPORT' },
          { menuCode: 'report-revenue', menuLabel: 'REPORT: REVENUE (SUMMARY + SERVICE WISE)', category: 'REPORT' },
          { menuCode: 'report-registration', menuLabel: 'REPORT: OP REGISTRATION', category: 'REPORT' },
        ]);
      }
    } catch (err) {
      console.warn('Could not fetch menus from database, using cached menus:', err.message);
    } finally {
      setMenusLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadMenus();
  }, []);

  const handleMenuToggle = (menuCode) => {
    if (selectedMenus.includes(menuCode)) {
      setSelectedMenus(selectedMenus.filter(m => m !== menuCode));
    } else {
      setSelectedMenus([...selectedMenus, menuCode]);
    }
  };

  const handleSelectAllMenus = () => {
    setSelectedMenus(menus.map(m => m.menuCode));
  };

  const handleDeselectAllMenus = () => {
    setSelectedMenus([]);
  };

  const resetForm = () => {
    setEditingUserId(null);
    setForm({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'USER',
      department: 'Front Desk',
      isActive: true,
    });
    setSelectedMenus(['op-new', 'op-review', 'patient-update', 'op-billing', 'report-registration']);
  };

  // Start editing an existing user
  const handleStartEdit = (user) => {
    setEditingUserId(user.id);
    setMessage(null);

    // Parse allowed menus
    let userMenus = [];
    if (user.role === 'ADMIN' || user.allowedMenus === 'all') {
      userMenus = menus.map(m => m.menuCode);
    } else if (user.allowedMenus) {
      userMenus = user.allowedMenus.split(',').map(s => s.trim()).filter(Boolean);
    }

    setSelectedMenus(userMenus);
    setForm({
      username: user.username,
      password: '', // leave blank to keep current password
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'USER',
      department: user.department || 'Front Desk',
      isActive: user.isActive !== undefined ? user.isActive : true,
    });

    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        // UPDATE MODE
        const payload = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          role: form.role,
          department: form.department,
          isActive: form.isActive,
          allowedMenus: form.role === 'ADMIN' ? 'all' : selectedMenus.join(','),
        };

        // Only send password if user typed a new one
        if (form.password && form.password.trim()) {
          payload.password = form.password.trim();
        }

        await api.updateUser(editingUserId, payload);
        setMessage({ type: 'success', text: `User "${form.username}" updated successfully!` });
        resetForm();
        loadUsers();
      } else {
        // CREATE MODE
        const payload = {
          ...form,
          password: form.password || 'password123',
          allowedMenus: form.role === 'ADMIN' ? 'all' : selectedMenus.join(','),
        };
        await api.createUser(payload);
        setMessage({ type: 'success', text: `User "${form.username}" created successfully with ${form.role} permissions!` });
        resetForm();
        loadUsers();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id, uname) => {
    if (!window.confirm(`Are you sure you want to delete user "${uname}"?`)) return;
    try {
      await api.deleteUser(id);
      setMessage({ type: 'success', text: `User "${uname}" removed.` });
      if (editingUserId === id) {
        resetForm();
      }
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
              {editingUserId ? <Edit3 size={22} color="#2563eb" /> : <UserPlus size={22} color="#2563eb" />}
              <span>{editingUserId ? `EDIT USER ACCOUNT: ${form.username}` : 'MASTER > USER CREATION'}</span>
            </h2>
            <p className="card-subtitle">
              {editingUserId 
                ? 'Update staff user credentials, role permissions, and active menu privileges.'
                : 'Create staff user accounts with Role-Based Access: Admin (All rights) or User (Selected menus only).'}
            </p>
          </div>
          {editingUserId && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={resetForm}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <X size={14} />
              <span>Cancel Edit</span>
            </button>
          )}
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

        {editingUserId && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 16px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', color: '#1e40af' }}>
              ✏️ Currently modifying credentials for: <strong>{form.username}</strong>
            </span>
            <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
              Cancel &amp; Create New User
            </button>
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
                disabled={Boolean(editingUserId)} // Keep login username stable during edit
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                placeholder="e.g. staff1 or receptionist"
                style={{ backgroundColor: editingUserId ? '#f1f5f9' : '#fff' }}
              />
            </div>

            <div className="form-group">
              <label className={`form-label ${editingUserId ? '' : 'required'}`}>
                {editingUserId ? 'Password (Leave blank to keep current)' : 'Password'}
              </label>
              <input 
                type="password" 
                className="form-control" 
                required={!editingUserId} 
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder={editingUserId ? 'Leave blank to keep existing password' : 'Set user password'}
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

            <div className="form-group">
              <label className="form-label">Mobile Phone Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                placeholder="e.g. 9811122233"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select 
                className="form-control" 
                value={form.isActive ? 'true' : 'false'}
                onChange={(e) => setForm({...form, isActive: e.target.value === 'true'})}
              >
                <option value="true">Active (Allowed to Sign In)</option>
                <option value="false">Inactive (Suspended / Blocked)</option>
              </select>
            </div>
          </div>

          {/* If Role is USER, show Menu Permission Selection (DYNAMIC FROM DB TABLE: khc_app_menu) */}
          {form.role === 'USER' && (
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={15} />
                  <span>Select Allowed Menus for this User (From Database Table: <code>khc_app_menu</code>):</span>
                </span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={handleSelectAllMenus}
                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    onClick={handleDeselectAllMenus}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {menusLoading ? (
                <div style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>Loading system menus from database...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {menus.map(m => (
                    <label 
                      key={m.menuCode} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontSize: '0.84rem', 
                        color: selectedMenus.includes(m.menuCode) ? '#1d4ed8' : '#334155', 
                        background: selectedMenus.includes(m.menuCode) ? '#eff6ff' : '#ffffff',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: selectedMenus.includes(m.menuCode) ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedMenus.includes(m.menuCode)}
                        onChange={() => handleMenuToggle(m.menuCode)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: selectedMenus.includes(m.menuCode) ? '700' : '500' }}>
                        {m.menuLabel}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {editingUserId ? <Save size={16} /> : <UserPlus size={16} />}
              <span>{editingUserId ? 'Save Changes & Update User' : 'Create User Account'}</span>
            </button>
            {editingUserId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>
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
                <th style={{ textAlign: 'center' }}>Action</th>
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
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => handleStartEdit(u)}
                          title="Edit User Details & Menus"
                          style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDelete(u.id, u.username)}
                          title="Delete User"
                          style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
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
