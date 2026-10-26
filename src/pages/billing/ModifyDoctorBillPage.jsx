import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Stethoscope, Search, CheckCircle, Save, AlertCircle } from 'lucide-react';

export default function ModifyDoctorBillPage() {
  const [bills, setBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [newDoctorId, setNewDoctorId] = useState('');
  const [reason, setReason] = useState('Correction in billing ledger / Doctor swap');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bList, docs] = await Promise.all([
        api.getBills(search),
        api.getDoctors(true),
      ]);
      setBills(bList || []);
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

  const handleSelectBill = (bill) => {
    setSelectedBill(bill);
    setNewDoctorId(bill.doctor?.id || (doctors[0]?.id ?? ''));
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      const updated = await api.modifyBillDoctor({
        id: selectedBill.id,
        doctorId: parseInt(newDoctorId),
        reason: reason,
      });
      setMessage({ type: 'success', text: `Doctor updated successfully on Bill: ${updated.billNumber}!` });
      setSelectedBill(updated);
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
            <span>BILLING &gt; DOCTOR NAME MODIFY - OP BILL</span>
          </h2>
          <p className="card-subtitle">Correct or modify the consulting doctor tagged to an existing outpatient invoice.</p>
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

      {selectedBill ? (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Selected Invoice</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e40af' }}>
                {selectedBill.billNumber} — {selectedBill.patient?.firstName} {selectedBill.patient?.lastName} (Total: ₹{selectedBill.totalAmount})
              </h3>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedBill(null)}>
              Change Selection
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Currently Tagged Doctor</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled 
                  value={`${selectedBill.doctor?.doctorName} (${selectedBill.doctor?.department})`}
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
                      {d.doctorName} — {d.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label required">Reason for Ledger Amendment</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Primary consult done by Dr. Sharma instead of Duty Doctor"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Update Doctor on Bill</span>
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
              placeholder="Search by Bill Number, Patient, or Doctor..."
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
                  <th>Bill Number</th>
                  <th>Patient Name</th>
                  <th>Tagged Doctor</th>
                  <th>Bill Amount (₹)</th>
                  <th>Payment Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading bills...</td></tr>
                ) : bills.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No bills found.</td></tr>
                ) : (
                  bills.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.billNumber}</strong></td>
                      <td>{b.patient?.firstName} {b.patient?.lastName}</td>
                      <td><strong>{b.doctor?.doctorName}</strong></td>
                      <td><strong>₹{b.totalAmount}</strong></td>
                      <td><span className="badge badge-primary">{b.paymentType}</span></td>
                      <td><span className="badge badge-success">{b.paymentStatus}</span></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSelectBill(b)}>
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
