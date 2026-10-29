import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Stethoscope, Plus, Edit2, Search, CheckCircle2, XCircle, Power, UserCheck, UserX } from 'lucide-react';

export default function AdminPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'inactive' | 'all'
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: '',
    specialization: '',
    department: '',
    consultationFee: 300,
    phone: '',
    roomNo: '',
    isActive: true,
  });

  const loadDoctors = async () => {
    try {
      setLoading(true);
      // Fetch all doctors so we can separate active and deactivated
      const data = await api.getDoctors(false);
      setDoctors(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      doctorName: '',
      specialization: '',
      department: '',
      consultationFee: 300,
      phone: '',
      roomNo: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      doctorName: doc.doctorName || '',
      specialization: doc.specialization || '',
      department: doc.department || '',
      consultationFee: doc.consultationFee || 300,
      phone: doc.phone || '',
      roomNo: doc.roomNo || '',
      isActive: doc.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await api.updateDoctor(editingDoctor.id, formData);
      } else {
        await api.createDoctor(formData);
      }
      setShowModal(false);
      loadDoctors();
    } catch (err) {
      alert('Error saving doctor: ' + err.message);
    }
  };

  const handleToggleStatus = async (doctor) => {
    const nextStatus = !doctor.isActive;
    const actionName = nextStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionName} "${doctor.doctorName}"?`)) {
      return;
    }
    try {
      await api.updateDoctor(doctor.id, {
        doctorName: doctor.doctorName,
        specialization: doctor.specialization,
        department: doctor.department,
        consultationFee: doctor.consultationFee,
        phone: doctor.phone,
        roomNo: doctor.roomNo,
        isActive: nextStatus,
      });
      loadDoctors();
    } catch (err) {
      alert('Failed to update doctor status: ' + err.message);
    }
  };

  const activeCount = doctors.filter(d => d.isActive).length;
  const inactiveCount = doctors.filter(d => !d.isActive).length;

  const filtered = doctors.filter(d => {
    // Filter by active/inactive tab
    if (statusFilter === 'active' && !d.isActive) return false;
    if (statusFilter === 'inactive' && d.isActive) return false;

    // Search query
    const q = search.toLowerCase();
    return (
      d.doctorName?.toLowerCase().includes(q) ||
      d.department?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.roomNo?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Stethoscope size={22} color="#2563eb" />
            <span>MASTER &gt; ADMIN (Doctor Master &amp; Hospital Management)</span>
          </h2>
          <p className="card-subtitle">Manage doctor credentials, consulting fees, room allotments, and departmental setups.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '16px', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderBottom: statusFilter === 'active' ? '3px solid #16a34a' : '3px solid transparent',
            color: statusFilter === 'active' ? '#16a34a' : '#64748b',
          }}
        >
          <CheckCircle2 size={15} />
          <span>Active Doctors ({activeCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('inactive')}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderBottom: statusFilter === 'inactive' ? '3px solid #dc2626' : '3px solid transparent',
            color: statusFilter === 'inactive' ? '#dc2626' : '#64748b',
          }}
        >
          <XCircle size={15} />
          <span>Deactivated Doctors ({inactiveCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderBottom: statusFilter === 'all' ? '3px solid #2563eb' : '3px solid transparent',
            color: statusFilter === 'all' ? '#2563eb' : '#64748b',
          }}
        >
          <span>All Doctors ({doctors.length})</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search doctor by name, department, or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Doctor Name</th>
              <th>Specialization</th>
              <th>Department</th>
              <th>Room No</th>
              <th>Consultation Fee</th>
              <th>Contact Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>Loading doctors...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                  {statusFilter === 'inactive' 
                    ? 'No deactivated doctors found. All doctors are currently active.' 
                    : statusFilter === 'active' 
                      ? 'No active doctors found matching search.' 
                      : 'No doctors found.'}
                </td>
              </tr>
            ) : (
              filtered.map(d => (
                <tr key={d.id} style={{ background: d.isActive ? '#ffffff' : '#fef2f2' }}>
                  <td><strong>#{d.id}</strong></td>
                  <td>
                    <strong>{d.doctorName}</strong>
                    {!d.isActive && (
                      <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: '#dc2626', fontWeight: '600' }}>
                        (Inactive)
                      </span>
                    )}
                  </td>
                  <td>{d.specialization}</td>
                  <td><span className="badge badge-primary">{d.department}</span></td>
                  <td>{d.roomNo || '—'}</td>
                  <td><strong>₹{d.consultationFee}</strong></td>
                  <td>{d.phone || '—'}</td>
                  <td>
                    {d.isActive ? (
                      <span className="badge badge-success"><CheckCircle2 size={12} /> Active</span>
                    ) : (
                      <span className="badge badge-danger"><XCircle size={12} /> Deactivated</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(d)} title="Edit Doctor Details & Status">
                        <Edit2 size={14} /> Edit
                      </button>
                      {d.isActive ? (
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleToggleStatus(d)}
                          title="Deactivate this doctor from OPD and billing"
                          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                        >
                          <UserX size={13} /> Deactivate
                        </button>
                      ) : (
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => handleToggleStatus(d)}
                          title="Activate this doctor to enable for OPD and billing"
                          style={{ padding: '4px 8px', fontSize: '0.78rem', background: '#16a34a', borderColor: '#16a34a', color: '#fff' }}
                        >
                          <UserCheck size={13} /> Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingDoctor ? 'Edit Doctor Master' : 'Add New Doctor Master'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Doctor Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    placeholder="e.g. Dr. Rajesh Sharma"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Department</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g. Cardiology"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="e.g. MBBS, MD (Cardiology)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Consultation Fee (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    min="0"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({...formData, consultationFee: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Room / OPD Chamber</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.roomNo}
                    onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                    placeholder="e.g. OPD-101"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Doctor Status</label>
                  <select 
                    className="form-control"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">🟢 Active (Available for OPD &amp; Consultations)</option>
                    <option value="false">🔴 Deactivated / Inactive (Hidden from OPD)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Doctor Master</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
