import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { History, Search, UserCheck, CheckCircle, Printer } from 'lucide-react';
import { printLandscapeSlip } from '../../utils/printSlip';

export default function OpReviewPage({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [createdReview, setCreatedReview] = useState(null);

  const loggedUserName = 
    currentUser?.fullName || 
    (currentUser?.firstName ? (currentUser.firstName + ' ' + (currentUser.lastName || '')).trim() : null) ||
    currentUser?.username ||
    (() => {
      try {
        const u = JSON.parse(localStorage.getItem('khc_user') || '{}');
        return u.fullName || (u.firstName ? (u.firstName + ' ' + (u.lastName || '')).trim() : null) || u.username || 'Administrator';
      } catch (e) {
        return 'Administrator';
      }
    })();

  const [formData, setFormData] = useState({
    doctorId: '',
    patientType: '',
    paymentType: '',
    consultationFee: 0,
    department: '',
    remarks: 'Routine OP Review / Follow-up visit',
  });

  useEffect(() => {
    async function loadDoctors() {
      try {
        const docs = await api.getDoctors(true);
        setDoctors(docs || []);
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
    const val = e.target.value;
    if (!val) {
      setFormData(prev => ({
        ...prev,
        doctorId: '',
        department: '',
        consultationFee: 0,
      }));
      return;
    }
    const docId = parseInt(val);
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
    if (!formData.doctorId) {
      alert('Please select Consulting Doctor');
      return;
    }
    if (!formData.patientType) {
      alert('Please select Patient Type');
      return;
    }
    if (!formData.paymentType) {
      alert('Please select Payment Type');
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
      <div className="card-header no-print">
        <div>
          <h2 className="card-title">
            <History size={22} color="#2563eb" />
            <span>REGISTRATION &gt; OP REVIEW (Follow-up Consultation)</span>
          </h2>
          <p className="card-subtitle">Lookup existing registered patient by Patient ID or Mobile and generate follow-up review token slip.</p>
        </div>
      </div>

      {createdReview ? (
        <div className="op-success-view" style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div className="no-print">
            <div style={{ display: 'inline-flex', padding: '12px', background: '#ecfdf5', borderRadius: '50%', color: '#059669', marginBottom: '14px' }}>
              <CheckCircle size={44} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              OP Review Successfully Issued!
            </h3>
            <p style={{ color: '#64748b', marginBottom: '22px' }}>
              Follow-up visit has been registered in the system.
            </p>
          </div>

          {/* Printable OP Review Slip (A5 Size Landscape Format) */}
          <div 
            id="op-review-slip"
            className="op-a5-print-card"
            style={{ 
              maxWidth: '820px', 
              margin: '0 auto 24px', 
              background: '#ffffff', 
              border: '2px solid #1e3a8a', 
              borderRadius: '8px', 
              padding: '16px 22px', 
              textAlign: 'left',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            {/* Hospital Header with KH Group Logo on the Left Side */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '10px', marginBottom: '10px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)' }}>
                <img 
                  src="/KH Logo.jpeg" 
                  alt="KH Group Logo" 
                  style={{ height: '52px', width: 'auto', objectFit: 'contain' }} 
                />
              </div>
              <div style={{ width: '100%', textAlign: 'center', paddingLeft: '70px', paddingRight: '70px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e3a8a', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                  KH CLINIC
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                  Melvisharam - 632509, Ranipet Dist., Tamil Nadu | Ph: 04172-266123
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563eb', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Outpatient (OP) Review Token Slip
                </div>
              </div>
            </div>

            {/* Date & Visit Type Subheader Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#475569', background: '#fef3c7', padding: '5px 12px', borderRadius: '4px', marginBottom: '10px' }}>
              <span>
                <strong>Date &amp; Time:</strong> {new Date(createdReview.registrationDate || Date.now()).toLocaleDateString('en-GB')} {new Date(createdReview.registrationDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
              <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>FOLLOW-UP REVIEW</span>
            </div>

            {/* Landscape Two-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '10px 24px', fontSize: '0.84rem' }}>
              {/* Left Column: Patient Demographics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>OP Token No:</span>
                  <strong style={{ color: '#2563eb', fontSize: '1.25rem', letterSpacing: '0.03em' }}>{createdReview.opNumber}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Patient Id:</span>
                  <strong style={{ color: '#0f172a', fontSize: '1.1rem', fontFamily: 'monospace' }}>{createdReview.patient?.mrn}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Patient Name:</span>
                  <strong style={{ color: '#0f172a' }}>
                    {createdReview.patient?.firstName} {createdReview.patient?.lastName} ({createdReview.patient?.age}y / {createdReview.patient?.gender})
                  </strong>
                </div>

                {createdReview.patient?.mobile && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Contact Mobile:</span>
                    <strong style={{ color: '#0f172a' }}>{createdReview.patient?.mobile}</strong>
                  </div>
                )}
              </div>

              {/* Right Column: Doctor & Billing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Consulting Doctor:</span>
                  <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                    {createdReview.doctor?.doctorName}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Department:</span>
                  <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                    {createdReview.doctor?.department || 'General Medicine'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Review Fee:</span>
                  <strong style={{ color: '#059669', fontSize: '1.1rem' }}>₹{createdReview.consultationFee} ({createdReview.paymentType})</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Patient Category:</span>
                  <span className="badge badge-primary">{createdReview.patientType}</span>
                </div>
              </div>
            </div>

            {/* Slip Footer */}
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '0.72rem', color: '#64748b' }}>
              <div style={{ fontStyle: 'italic', marginBottom: '8px', textAlign: 'center' }}>
                * Valid for today only. Please bring past prescriptions and diagnostic reports.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '2px' }}>
                <span>Billed By: <strong style={{ color: '#0f172a' }}>{loggedUserName}</strong></span>
              </div>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => printLandscapeSlip('op-review-slip', 'OP Review Slip')}
              style={{ padding: '9px 20px', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Printer size={17} /> Print Review Slip (A5 Landscape)
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleReset}
              style={{ padding: '9px 20px', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <History size={17} /> Next Review Visit
            </button>
          </div>
        </div>) : (
        <div>
          {/* Step 1: Search Patient */}
          <div style={{ background: '#eff6ff', padding: '18px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e40af', marginBottom: '10px' }}>
              Step 1: Search Patient Database by Patient ID, Name, or Mobile
            </h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter Patient ID (e.g. KH20260001) or Mobile Number..."
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
                      <th>Patient ID</th>
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
                    <option value="">-- Select Consulting Doctor --</option>
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
                    required
                    value={formData.patientType}
                    onChange={(e) => setFormData({...formData, patientType: e.target.value})}
                  >
                    <option value="">-- Select Patient Type --</option>
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
                    required
                    value={formData.paymentType}
                    onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                  >
                    <option value="">-- Select Payment Type --</option>
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
                  <span>Issue OP Review Token</span>
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
