import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { History, Search, UserCheck, CheckCircle, Printer } from 'lucide-react';

export default function OpReviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [createdReview, setCreatedReview] = useState(null);

  const [formData, setFormData] = useState({
    doctorId: '',
    patientType: 'GENERAL',
    paymentType: 'CASH',
    consultationFee: 150,
    department: '',
    remarks: 'Routine OP Review / Follow-up visit',
  });

  useEffect(() => {
    async function loadDoctors() {
      try {
        const docs = await api.getDoctors(true);
        setDoctors(docs || []);
        if (docs && docs.length > 0) {
          setFormData(prev => ({
            ...prev,
            doctorId: docs[0].id,
            department: docs[0].department || '',
            consultationFee: Math.round((docs[0].consultationFee || 300) * 0.5),
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDoctors();
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await api.searchPatients(searchQuery.trim());
      setPatients(results || []);
    } catch (err) {
      alert('Error searching patients: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatients([]);
  };

  const handleDoctorChange = (e) => {
    const docId = parseInt(e.target.value);
    const selected = doctors.find(d => d.id === docId);
    setFormData(prev => ({
      ...prev,
      doctorId: docId,
      department: selected?.department || '',
      consultationFee: Math.round((selected?.consultationFee || 300) * 0.5),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please select an existing patient first.');
      return;
    }
    try {
      const payload = {
        patientId: selectedPatient.id,
        mrn: selectedPatient.mrn,
        doctorId: formData.doctorId,
        patientType: formData.patientType,
        paymentType: formData.paymentType,
        consultationFee: parseFloat(formData.consultationFee) || 0,
        department: formData.department,
        remarks: formData.remarks,
      };
      const result = await api.registerOpReview(payload);
      setCreatedReview(result);
    } catch (err) {
      alert('Error generating review visit: ' + err.message);
    }
  };

  const handleReset = () => {
    setCreatedReview(null);
    setSelectedPatient(null);
    setSearchQuery('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <History size={22} color="#2563eb" />
            <span>REGISTRATION &gt; OP REVIEW (Follow-up Consultation)</span>
          </h2>
          <p className="card-subtitle">Lookup existing registered patient by MRN or Mobile and generate follow-up review slip.</p>
        </div>
      </div>

      {createdReview ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: '#ecfdf5', borderRadius: '50%', color: '#059669', marginBottom: '16px' }}>
            <CheckCircle size={48} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            OP Review Ticket Generated!
          </h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Follow-up visit has been registered in the system.
          </p>

          <div style={{ maxWidth: '480px', margin: '0 auto 28px', background: '#ffffff', border: '2px dashed #93c5fd', borderRadius: '8px', padding: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>OP Ticket No:</span>
              <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>{createdReview.opNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Visit Type:</span>
              <span className="badge badge-warning">REVIEW</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Patient MRN:</span>
              <strong>{createdReview.patient?.mrn}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Patient Name:</span>
              <strong>{createdReview.patient?.firstName} {createdReview.patient?.lastName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Consulting Doctor:</span>
              <strong>{createdReview.doctor?.doctorName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Review Fee:</span>
              <strong style={{ color: '#059669' }}>₹{createdReview.consultationFee}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print Review Slip
            </button>
            <button className="btn btn-primary" onClick={handleReset}>
              <History size={16} /> Next Review Visit
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Step 1: Search Patient */}
          <div style={{ background: '#eff6ff', padding: '18px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e40af', marginBottom: '10px' }}>
              Step 1: Search Patient Database by MRN, Name, or Mobile
            </h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter MRN (e.g. MRN-2026-1001) or Mobile Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={isSearching}>
                <Search size={16} />
                <span>{isSearching ? 'Searching...' : 'Search Patient'}</span>
              </button>
            </form>

            {patients.length > 0 && (
              <div style={{ marginTop: '16px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1', maxHeight: '200px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>MRN</th>
                      <th>Patient Name</th>
                      <th>Age / Gender</th>
                      <th>Mobile</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.mrn}</strong></td>
                        <td>{p.firstName} {p.lastName}</td>
                        <td>{p.age}y / {p.gender}</td>
                        <td>{p.mobile}</td>
                        <td>
                          <button 
                            type="button" 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSelectPatient(p)}
                          >
                            Select for Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Step 2: Fill Consultation Details */}
          {selectedPatient ? (
            <form onSubmit={handleSubmit}>
              <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Selected Patient</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#14532d' }}>
                    {selectedPatient.firstName} {selectedPatient.lastName} — {selectedPatient.mrn} ({selectedPatient.mobile})
                  </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedPatient(null)}>
                  Change Patient
                </button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Consulting Doctor</label>
                  <select 
                    className="form-control" 
                    required 
                    value={formData.doctorId}
                    onChange={handleDoctorChange}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.doctorName} — {d.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Patient Type</label>
                  <select 
                    className="form-control" 
                    value={formData.patientType}
                    onChange={(e) => setFormData({...formData, patientType: e.target.value})}
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="VIP">VIP</option>
                    <option value="INSURANCE">INSURANCE</option>
                    <option value="CORPORATE">CORPORATE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Payment Type</label>
                  <select 
                    className="form-control" 
                    value={formData.paymentType}
                    onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                  >
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">CARD</option>
                    <option value="INSURANCE">INSURANCE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Review Consultation Fee (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({...formData, consultationFee: parseFloat(e.target.value) || 0})}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Review Notes / Follow-up Details</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  <History size={16} />
                  <span>Issue OP Review Ticket</span>
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
              Search for an existing patient above to begin review registration.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
