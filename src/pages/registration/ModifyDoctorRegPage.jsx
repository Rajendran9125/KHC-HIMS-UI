import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Stethoscope, Search, CheckCircle, Save, AlertCircle } from 'lucide-react';

export default function ModifyDoctorRegPage() {
  const [registrations, setRegistrations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);
  const [newDoctorId, setNewDoctorId] = useState('');
  const [reason, setReason] = useState('Patient request / Department transfer');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, docs] = await Promise.all([
        api.getRegistrations(search),
        api.getDoctors(true),
      ]);
      setRegistrations(regs || []);
      setDoctors(docs || []);
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
    setNewDoctorId(reg.doctor?.id || (doctors[0]?.id ?? ''));
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedReg) return;
    try {
      const updated = await api.modifyRegDoctor({
        id: selectedReg.id,
        doctorId: parseInt(newDoctorId),
        reason: reason,
      });
      setMessage({ type: 'success', text: `Doctor updated successfully for OP Ticket: ${updated.opNumber}!` });
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
            <Stethoscope size={22} color="#2563eb" />
            <span>REGISTRATION &gt; DOCTOR NAME MODIFY - REGISTRATION</span>
          </h2>
          <p className="card-subtitle">Modify and reassign the consulting doctor for an active OP registration ticket.</p>
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
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Selected OP Ticket</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e40af' }}>
                {selectedReg.opNumber} — {selectedReg.patient?.firstName} {selectedReg.patient?.lastName} ({selectedReg.patient?.mrn})
              </h3>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReg(null)}>
              Change Selection
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Current Assigned Doctor</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled 
                  value={`${selectedReg.doctor?.doctorName} (${selectedReg.doctor?.department})`}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Select New Doctor</label>
                <select 
                  className="form-control" 
                  required 
                  value={newDoctorId}
                  onChange={(e) => setNewDoctorId(e.target.value)}
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.doctorName} — {d.department} ({d.specialization})
                    </option>
                  ))}
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
                  placeholder="e.g. Doctor unavailable / Referred to Cardiologist"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Doctor Reassignment</span>
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
              placeholder="Filter by OP Number, MRN, Patient Name..."
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
                  <th>Current Doctor</th>
                  <th>Department</th>
                  <th>Visit Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading registrations...</td></tr>
                ) : registrations.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No registrations found.</td></tr>
                ) : (
                  registrations.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.opNumber}</strong></td>
                      <td><code>{r.patient?.mrn}</code></td>
                      <td>{r.patient?.firstName} {r.patient?.lastName}</td>
                      <td><strong>{r.doctor?.doctorName}</strong></td>
                      <td>{r.department || r.doctor?.department}</td>
                      <td><span className="badge badge-primary">{r.visitType}</span></td>
                      <td>
                        <span className={`badge ${r.status === 'BILLED' ? 'badge-success' : 'badge-warning'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSelectReg(r)}>
                          Modify Doctor
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
