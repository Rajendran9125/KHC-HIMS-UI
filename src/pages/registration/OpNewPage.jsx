import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { UserPlus, Printer, CheckCircle, Search, User } from 'lucide-react';
import DobDatePicker from '../../components/DobDatePicker';

export default function OpNewPage({ onRegistrationSuccess }) {
  const [doctors, setDoctors] = useState([]);
  const [patientTypes, setPatientTypes] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    age: '',
    gender: 'MALE',
    mobile: '',
    email: '',
    address: '',
    bloodGroup: 'B+',
    emergencyContact: '',
    doctorId: '',
    patientType: 'GENERAL',
    paymentType: 'CASH',
    consultationFee: 300,
    department: '',
    remarks: '',
  });

  const [createdOp, setCreatedOp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [docs, pTypes, payTypes] = await Promise.all([
          api.getDoctors(true),
          api.getPatientTypes(),
          api.getPaymentTypes(),
        ]);
        setDoctors(docs || []);
        setPatientTypes(pTypes || []);
        setPaymentTypes(payTypes || []);

        if (docs && docs.length > 0) {
          setFormData(prev => ({
            ...prev,
            doctorId: docs[0].id,
            consultationFee: docs[0].consultationFee || 300,
            department: docs[0].department || '',
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMasters(false);
      }
    }
    init();
  }, []);

  const calculateAgeFromDob = (dobString) => {
    if (!dobString) return '';
    const parts = dobString.split('-');
    if (parts.length !== 3) return '';
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);
    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return '';

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    let age = currentYear - birthYear;
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    const computedAge = calculateAgeFromDob(dobVal);
    setFormData(prev => ({
      ...prev,
      dob: dobVal,
      age: computedAge !== '' ? computedAge : prev.age,
    }));
  };

  const handleDoctorChange = (e) => {
    const docId = parseInt(e.target.value);
    const selected = doctors.find(d => d.id === docId);
    setFormData(prev => ({
      ...prev,
      doctorId: docId,
      department: selected?.department || '',
      consultationFee: selected?.consultationFee || 300,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        dob: formData.dob || null,
        age: parseInt(formData.age) || 0,
        consultationFee: parseFloat(formData.consultationFee) || 0,
      };
      const result = await api.registerOpNew(payload);
      setCreatedOp(result);
      if (onRegistrationSuccess) onRegistrationSuccess();
    } catch (err) {
      alert('Error registering OP patient: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedOp(null);
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      age: '',
      gender: 'MALE',
      mobile: '',
      email: '',
      address: '',
      bloodGroup: 'B+',
      emergencyContact: '',
      doctorId: doctors[0]?.id || '',
      patientType: 'GENERAL',
      paymentType: 'CASH',
      consultationFee: doctors[0]?.consultationFee || 300,
      department: doctors[0]?.department || '',
      remarks: '',
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <UserPlus size={22} color="#2563eb" />
            <span>REGISTRATION &gt; OP NEW (Outpatient Registration)</span>
          </h2>
          <p className="card-subtitle">Register a brand new patient, generate MRN number, and issue the first OP Ticket.</p>
        </div>
      </div>

      {createdOp ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: '#ecfdf5', borderRadius: '50%', color: '#059669', marginBottom: '16px' }}>
            <CheckCircle size={48} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            OP Registration Successfully Issued!
          </h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Medical Record Number (MRN) and OP Ticket Number have been generated.
          </p>

          <div style={{ maxWidth: '480px', margin: '0 auto 28px', background: '#ffffff', border: '2px dashed #93c5fd', borderRadius: '8px', padding: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>OP Ticket No:</span>
              <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>{createdOp.opNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Patient MRN:</span>
              <strong>{createdOp.patient?.mrn}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Patient Name:</span>
              <strong>{createdOp.patient?.firstName} {createdOp.patient?.lastName} ({createdOp.patient?.age}y{createdOp.patient?.dob ? ` | DOB: ${createdOp.patient?.dob}` : ''} / {createdOp.patient?.gender})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Consulting Doctor:</span>
              <strong>{createdOp.doctor?.doctorName} ({createdOp.doctor?.department})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Consultation Fee:</span>
              <strong style={{ color: '#059669' }}>₹{createdOp.consultationFee} ({createdOp.paymentType})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Patient Category:</span>
              <span className="badge badge-primary">{createdOp.patientType}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print OP Slip
            </button>
            <button className="btn btn-primary" onClick={handleReset}>
              <UserPlus size={16} /> Register Another Patient
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
            1. Patient Demographics &amp; Identity
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">First Name</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="e.g. Ramesh"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="e.g. Rao"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth (DOB)</label>
              <DobDatePicker 
                value={formData.dob}
                onChange={(dobVal) => {
                  const computedAge = calculateAgeFromDob(dobVal);
                  setFormData(prev => ({
                    ...prev,
                    dob: dobVal,
                    age: computedAge !== '' ? computedAge : prev.age
                  }));
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Age (Years)</label>
              <input 
                type="number" 
                className="form-control" 
                required 
                min="0" 
                max="125"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                placeholder="e.g. 32"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Gender</label>
              <select 
                className="form-control" 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Mobile Number</label>
              <input 
                type="tel" 
                className="form-control" 
                required 
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                placeholder="e.g. 9876543210"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email ID</label>
              <input 
                type="email" 
                className="form-control" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="patient@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select 
                className="form-control" 
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="House No, Street, City"
              />
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af', margin: '24px 0 14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
            2. Consultation &amp; Billing Allotment
          </h3>

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
                    {d.doctorName} — {d.department} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input 
                type="text" 
                className="form-control" 
                disabled 
                value={formData.department}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Patient Type</label>
              <select 
                className="form-control" 
                value={formData.patientType}
                onChange={(e) => setFormData({...formData, patientType: e.target.value})}
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
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Payment Type</label>
              <select 
                className="form-control" 
                value={formData.paymentType}
                onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
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
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Consultation Fee (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                required 
                value={formData.consultationFee}
                onChange={(e) => setFormData({...formData, consultationFee: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chief Complaints / Remarks</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                placeholder="e.g. Chest discomfort, regular checkup"
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <UserPlus size={16} />
              <span>{isSubmitting ? 'Registering Patient...' : 'Submit OP New Registration'}</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Clear
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
