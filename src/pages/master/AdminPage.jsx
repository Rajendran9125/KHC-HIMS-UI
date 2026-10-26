import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Stethoscope, Plus, Edit2, Search, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      const data = await api.getDoctors();
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

  const filtered = doctors.filter(d => 
    d.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    d.department?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

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
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>No doctors found</td></tr>
            ) : (
              filtered.map(d => (
                <tr key={d.id}>
                  <td><strong>#{d.id}</strong></td>
                  <td><strong>{d.doctorName}</strong></td>
                  <td>{d.specialization}</td>
                  <td><span className="badge badge-primary">{d.department}</span></td>
                  <td>{d.roomNo || '—'}</td>
                  <td><strong>₹{d.consultationFee}</strong></td>
                  <td>{d.phone || '—'}</td>
                  <td>
                    {d.isActive ? (
                      <span className="badge badge-success"><CheckCircle2 size={12} /> Active</span>
                    ) : (
                      <span className="badge badge-danger"><XCircle size={12} /> Inactive</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(d)}>
                      <Edit2 size={14} /> Edit
                    </button>
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
