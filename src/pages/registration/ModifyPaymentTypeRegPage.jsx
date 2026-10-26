import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CreditCard, Search, CheckCircle, Save, AlertCircle } from 'lucide-react';

export default function ModifyPaymentTypeRegPage() {
  const [registrations, setRegistrations] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);
  const [newPaymentType, setNewPaymentType] = useState('UPI');
  const [reason, setReason] = useState('Patient opted for UPI / QR transfer');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, types] = await Promise.all([
        api.getRegistrations(search),
        api.getPaymentTypes(),
      ]);
      setRegistrations(regs || []);
      setPaymentTypes(types || []);
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
    setNewPaymentType(reg.paymentType || 'CASH');
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedReg) return;
    try {
      const updated = await api.modifyRegPaymentType({
        id: selectedReg.id,
        paymentType: newPaymentType,
        reason: reason,
      });
      setMessage({ type: 'success', text: `Payment Type updated to "${updated.paymentType}" for OP: ${updated.opNumber}!` });
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
            <CreditCard size={22} color="#2563eb" />
            <span>REGISTRATION &gt; PAYMENT TYPE MODIFY</span>
          </h2>
          <p className="card-subtitle">Change the recorded payment method (Cash, Card, UPI, Insurance) on an OP registration ticket.</p>
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
                <label className="form-label">Current Payment Mode</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled 
                  value={selectedReg.paymentType || 'CASH'}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Select New Payment Type</label>
                <select 
                  className="form-control" 
                  required 
                  value={newPaymentType}
                  onChange={(e) => setNewPaymentType(e.target.value)}
                >
                  {paymentTypes.length > 0 ? (
                    paymentTypes.map(py => (
                      <option key={py.id} value={py.typeName}>{py.typeName}</option>
                    ))
                  ) : (
                    <>
                      <option value="CASH">CASH</option>
                      <option value="UPI">UPI</option>
                      <option value="CARD">CARD</option>
                      <option value="INSURANCE">INSURANCE</option>
                      <option value="CHEQUE">CHEQUE</option>
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
                  placeholder="e.g. Counter cash swapped with UPI QR transfer"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Payment Mode Modification</span>
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
              placeholder="Search by OP Number, MRN, or Patient..."
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
                  <th>Doctor</th>
                  <th>Fee (₹)</th>
                  <th>Current Payment Mode</th>
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
                      <td>{r.doctor?.doctorName}</td>
                      <td>₹{r.consultationFee}</td>
                      <td><span className="badge badge-warning">{r.paymentType || 'CASH'}</span></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSelectReg(r)}>
                          Modify Payment
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
