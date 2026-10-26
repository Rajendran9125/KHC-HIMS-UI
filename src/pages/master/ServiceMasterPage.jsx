import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Layers, Plus, Edit2, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react';

const COMMON_HEADERS = ['ALL', 'ECG', 'LABTEST', 'CBC', 'RADIOLOGY', 'PROCEDURE', 'CONSULTATION', 'PHARMACY'];

export default function ServiceMasterPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHeader, setSelectedHeader] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    serviceName: '',
    header: 'LABTEST',
    department: '',
    opRate: 0,
    ipRate: 0,
    isActive: true,
  });

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await api.getServices();
      setServices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      serviceName: '',
      header: 'LABTEST',
      department: 'Pathology',
      opRate: 300,
      ipRate: 400,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (svc) => {
    setEditingService(svc);
    setFormData({
      serviceName: svc.serviceName || '',
      header: svc.header || 'GENERAL',
      department: svc.department || '',
      opRate: svc.opRate ?? 0,
      ipRate: svc.ipRate ?? 0,
      isActive: svc.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        opRate: parseFloat(formData.opRate) || 0,
        ipRate: parseFloat(formData.ipRate) || 0,
        isActive: Boolean(formData.isActive),
      };

      if (editingService) {
        await api.updateService(editingService.id, payload);
      } else {
        await api.createService(payload);
      }
      setShowModal(false);
      loadServices();
    } catch (err) {
      alert('Error saving service: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service "${name}"?`)) return;
    try {
      await api.deleteService(id);
      loadServices();
    } catch (err) {
      alert('Error deleting service: ' + err.message);
    }
  };

  const filtered = services.filter(s => {
    const matchesSearch = 
      s.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()) ||
      s.header?.toLowerCase().includes(search.toLowerCase());
    
    const matchesHeader = selectedHeader === 'ALL' || s.header?.toUpperCase() === selectedHeader;
    return matchesSearch && matchesHeader;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Layers size={22} color="#2563eb" />
            <span>MASTER &gt; SERVICE MASTER (Tariff &amp; Amount Master)</span>
          </h2>
          <p className="card-subtitle">
            Configure clinical services, headers (ECG, Labtest, CBC, Radiology), departments, OP Rates, and IP Rates.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add New Service Rate</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search by Service name, Header, or Department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '380px' }}
        />

        {/* Header Category Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '4px 0' }}>
          {COMMON_HEADERS.map(h => (
            <button
              key={h}
              type="button"
              className={`btn btn-sm ${selectedHeader === h ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedHeader(h)}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service Name</th>
              <th>Header / Category</th>
              <th>Department</th>
              <th>OP RATE (₹)</th>
              <th>IP RATE (₹)</th>
              <th>Active Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading service tariffs...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>No services found.</td></tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>#{s.id}</strong></td>
                  <td><strong>{s.serviceName}</strong></td>
                  <td>
                    <span className={`badge ${
                      s.header === 'ECG' ? 'badge-primary' :
                      s.header === 'CBC' || s.header === 'LABTEST' ? 'badge-warning' :
                      s.header === 'RADIOLOGY' ? 'badge-primary' : 'badge-success'
                    }`}>
                      {s.header}
                    </span>
                  </td>
                  <td>{s.department || 'General'}</td>
                  <td><strong style={{ color: '#15803d', fontSize: '0.95rem' }}>₹{s.opRate}</strong></td>
                  <td><strong style={{ color: '#1e40af', fontSize: '0.95rem' }}>₹{s.ipRate}</strong></td>
                  <td>
                    {s.isActive ? (
                      <span className="badge badge-success"><CheckCircle2 size={12} /> ACTIVE</span>
                    ) : (
                      <span className="badge badge-danger"><XCircle size={12} /> INACTIVE</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(s)} title="Edit">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id, s.serviceName)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingService ? 'Edit Service Tariff' : 'Add New Service Tariff'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label required">Service Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.serviceName}
                    onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                    placeholder="e.g. 12-Lead ECG / Complete Blood Count (CBC) / Chest X-Ray"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Header (Category)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.header}
                    onChange={(e) => setFormData({...formData, header: e.target.value.toUpperCase()})}
                    placeholder="e.g. ECG, LABTEST, CBC, RADIOLOGY, PROCEDURE"
                    list="header-options"
                  />
                  <datalist id="header-options">
                    <option value="ECG" />
                    <option value="LABTEST" />
                    <option value="CBC" />
                    <option value="RADIOLOGY" />
                    <option value="PROCEDURE" />
                    <option value="CONSULTATION" />
                    <option value="PHARMACY" />
                  </datalist>
                </div>

                <div className="form-group">
                  <label className="form-label required">Department</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g. Cardiology, Pathology, Radiology, Nursing"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">OP RATE (Outpatient Tariff ₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    min="0"
                    step="0.01"
                    value={formData.opRate}
                    onChange={(e) => setFormData({...formData, opRate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">IP RATE (Inpatient Tariff ₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    min="0"
                    step="0.01"
                    value={formData.ipRate}
                    onChange={(e) => setFormData({...formData, ipRate: e.target.value})}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label required">Active Status (is_active)</label>
                  <select 
                    className="form-control"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">ACTIVE (Available for Billing &amp; Orders)</option>
                    <option value="false">INACTIVE (Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Service Rate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
