import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Activity, Search, CheckCircle, Save, AlertCircle } from 'lucide-react';

export default function ModifyPatientTypePage() {
  const [registrations, setRegistrations] = useState([]);
  const [patientTypes, setPatientTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);
  const [newPatientType, setNewPatientType] = useState('VIP');
  const [reason, setReason] = useState('Insurance card verified / VIP request');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, types] = await Promise.all([
        api.getRegistrations(search),
        api.getPatientTypes(),
      ]);
      setRegistrations(regs || []);
      setPatientTypes(types || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectReg = (reg) => {
    setSelectedReg(reg);
    setNewPatientType(reg.patientType || 'GENERAL');
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedReg) return;
    try {
      const updated = await api.modifyRegPatientType({
        id: selectedReg.id,
        patientType: newPatientType,
        reason: reason,
      });
      setMessage({ type: 'success', text: `Patient Type updated to "${updated.patientType}" for OP: ${updated.opNumber}!` });
      setSelectedReg(updated);
      loadData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Activity size={22} color="#2563eb" />
            <span>REGISTRATION &gt; PATIENT TYPE MODIFY</span>
          </h2>
          <p className="card-subtitle">Change patient classification category (General, VIP, Corporate, Insurance) for active registrations.</p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '18px',
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {selectedReg ? (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Selected Registration</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e40af' }}>
                {selectedReg.opNumber} — {selectedReg.patient?.firstName} {selectedReg.patient?.lastName}
              </h3>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReg(null)}>
              Change Selection
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Current Patient Category</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled 
                  value={selectedReg.patientType || 'GENERAL'}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Select New Patient Type</label>
                <select 
                  className="form-control" 
                  required 
                  value={newPatientType}
                  onChange={(e) => setNewPatientType(e.target.value)}
                >
                  {patientTypes.length > 0 ? (
                    patientTypes.map(pt => (
                      <option key={pt.id} value={pt.typeName}>{pt.typeName}</option>
                    ))
                  ) : (
                    <>
                      <option value="GENERAL">GENERAL</option>
                      <option value="VIP">VIP</option>
                      <option value="INSURANCE">INSURANCE</option>
                      <option value="CORPORATE">CORPORATE</option>
                      <option value="EMERGENCY">EMERGENCY</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label required">Reason for Modification</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Corporate employer letter submitted"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Patient Type Modification</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by OP Number or Patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '400px' }}
            />
            <button className="btn btn-secondary" onClick={loadData}>
              <Search size={16} /> Filter
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>OP Number</th>
                  <th>MRN</th>
                  <th>Patient Name</th>
                  <th>Current Patient Type</th>
                  <th>Doctor</th>
                  <th>Payment Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                ) : registrations.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No registrations found.</td></tr>
                ) : (
                  registrations.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.opNumber}</strong></td>
                      <td><code>{r.patient?.mrn}</code></td>
                      <td>{r.patient?.firstName} {r.patient?.lastName}</td>
                      <td><span className="badge badge-primary">{r.patientType || 'GENERAL'}</span></td>
                      <td>{r.doctor?.doctorName}</td>
                      <td>{r.paymentType}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSelectReg(r)}>
                          Modify Type
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
