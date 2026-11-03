import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { UserPlus, Printer, CheckCircle, Search, User, MapPin } from 'lucide-react';
import DobDatePicker from '../../components/DobDatePicker';
import { printLandscapeSlip } from '../../utils/printSlip';

export default function OpNewPage({ onRegistrationSuccess, currentUser }) {
  const [doctors, setDoctors] = useState([]);
  const [patientTypes, setPatientTypes] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(true);
  
  // No default values: all dropdowns start empty and must be selected manually
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    age: '',
    gender: '', // empty by default
    mobile: '',
    email: '',
    countryId: '', // empty by default
    stateId: '',   // empty by default
    cityId: '',    // empty by default
    pincode: '',
    address: '',
    bloodGroup: '', // empty by default
    emergencyContact: '',
    doctorId: '',   // empty by default
    patientType: '', // empty by default
    paymentType: '', // empty by default
    consultationFee: 0,
    department: '',
    remarks: '',
  });

  const [createdOp, setCreatedOp] = useState(null);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [docs, pTypes, payTypes, cList, sList, ctList] = await Promise.all([
          api.getDoctors(true),
          api.getPatientTypes(),
          api.getPaymentTypes(),
          api.getCountries(true),
          api.getStates('', true),
          api.getCities('', true),
        ]);
        setDoctors(docs || []);
        setPatientTypes(pTypes || []);
        setPaymentTypes(payTypes || []);
        setCountries(cList || []);
        setStates(sList || []);
        setCities(ctList || []);
        // No defaults are assigned; user selects all manually
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

  const handleCountryChange = (e) => {
    const cId = e.target.value ? parseInt(e.target.value) : '';
    setFormData(prev => ({
      ...prev,
      countryId: cId,
      stateId: '', // do not select default
      cityId: '',  // do not select default
      pincode: '',
    }));
  };

  const handleStateChange = (e) => {
    const sId = e.target.value ? parseInt(e.target.value) : '';
    setFormData(prev => ({
      ...prev,
      stateId: sId,
      cityId: '',  // do not select default
      pincode: '',
    }));
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setFormData(prev => ({
        ...prev,
        cityId: '',
        pincode: '',
      }));
      return;
    }
    const ctId = parseInt(val);
    const selectedCity = cities.find(c => c.id === ctId);
    setFormData(prev => ({
      ...prev,
      cityId: ctId,
      pincode: selectedCity?.defaultPincode || '',
    }));
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
      consultationFee: selected?.consultationFee || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gender) {
      alert('Please select Gender');
      return;
    }
    if (!formData.countryId) {
      alert('Please select Country');
      return;
    }
    if (!formData.stateId) {
      alert('Please select State');
      return;
    }
    if (!formData.cityId) {
      alert('Please select City');
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

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        dob: formData.dob || null,
        age: parseInt(formData.age) || 0,
        consultationFee: parseFloat(formData.consultationFee) || 0,
        countryId: formData.countryId ? parseInt(formData.countryId) : null,
        stateId: formData.stateId ? parseInt(formData.stateId) : null,
        cityId: formData.cityId ? parseInt(formData.cityId) : null,
        pincode: formData.pincode || '',
        residentialAddress: formData.address || '',
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
      gender: '',
      mobile: '',
      email: '',
      countryId: '',
      stateId: '',
      cityId: '',
      pincode: '',
      address: '',
      bloodGroup: '',
      emergencyContact: '',
      doctorId: '',
      patientType: '',
      paymentType: '',
      consultationFee: 0,
      department: '',
      remarks: '',
    });
  };

  // Filtered dropdown lists for cascading state & city
  const availableStates = states.filter(s => !formData.countryId || s.country?.id === parseInt(formData.countryId));
  const availableCities = cities.filter(c => !formData.stateId || c.state?.id === parseInt(formData.stateId));

  return (
    <div className="card">
      <div className="card-header no-print">
        <div>
          <h2 className="card-title">
            <UserPlus size={22} color="#2563eb" />
            <span>REGISTRATION &gt; OP NEW (Outpatient Registration)</span>
          </h2>
          <p className="card-subtitle">Register a brand new patient, generate Patient ID, and issue the first OP Token.</p>
        </div>
      </div>

      {createdOp ? (
        <div className="op-success-view" style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div className="no-print">
            <div style={{ display: 'inline-flex', padding: '12px', background: '#ecfdf5', borderRadius: '50%', color: '#059669', marginBottom: '14px' }}>
              <CheckCircle size={44} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              OP Registration Successfully Issued!
            </h3>
            <p style={{ color: '#64748b', marginBottom: '22px' }}>
              Patient ID and OP Token Number have been generated.
            </p>
          </div>

          {/* Printable OP Registration Slip (A5 Size Landscape Format) */}
          <div 
            id="op-registration-slip"
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
                  Outpatient (OP) Registration Token Slip
                </div>
              </div>
            </div>

            {/* Date & Visit Type Subheader Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', padding: '5px 12px', borderRadius: '4px', marginBottom: '10px' }}>
              <span>
                <strong>Date &amp; Time:</strong> {new Date(createdOp.registrationDate || Date.now()).toLocaleDateString('en-GB')} {new Date(createdOp.registrationDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
              <span><strong>Visit Type:</strong> NEW VISIT</span>
            </div>

            {/* Landscape Two-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '10px 24px', fontSize: '0.84rem' }}>
              {/* Left Column: Patient Demographics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>OP Token No:</span>
                  <strong style={{ color: '#2563eb', fontSize: '1.25rem', letterSpacing: '0.03em' }}>{createdOp.opNumber}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Patient Id:</span>
                  <strong style={{ color: '#0f172a', fontSize: '1.1rem', fontFamily: 'monospace' }}>{createdOp.patient?.mrn}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Patient Name:</span>
                  <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                    {createdOp.patient?.firstName} {createdOp.patient?.lastName} ({createdOp.patient?.age}y{createdOp.patient?.dob ? ` | DOB: ${createdOp.patient?.dob}` : ''} / {createdOp.patient?.gender})
                  </strong>
                </div>

                {createdOp.patient?.mobile && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Contact Mobile:</span>
                    <strong style={{ color: '#0f172a' }}>{createdOp.patient?.mobile}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Location:</span>
                  <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: '240px' }}>
                    {cities.find(c => c.id === createdOp.cityId)?.cityName || 'City'}
                    {states.find(s => s.id === createdOp.stateId)?.stateName ? `, ${states.find(s => s.id === createdOp.stateId)?.stateName}` : ''}
                    {countries.find(c => c.id === createdOp.countryId)?.countryName ? `, ${countries.find(c => c.id === createdOp.countryId)?.countryName}` : ''}
                    {createdOp.pincode ? ` - ${createdOp.pincode}` : ''}
                  </strong>
                </div>

                {createdOp.residentialAddress && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Street Address:</span>
                    <span style={{ color: '#0f172a', textAlign: 'right', maxWidth: '240px' }}>{createdOp.residentialAddress}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Doctor & Billing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Consulting Doctor:</span>
                  <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                    {createdOp.doctor?.doctorName}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Department:</span>
                  <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                    {createdOp.doctor?.department || 'General Medicine'}
                  </strong>
                </div>

                {createdOp.doctor?.roomNo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Consulting Room:</span>
                    <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                      {createdOp.doctor?.roomNo}
                    </strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Consultation Fee:</span>
                  <strong style={{ color: '#059669', fontSize: '1.1rem' }}>₹{createdOp.consultationFee} ({createdOp.paymentType})</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Patient Category:</span>
                  <span className="badge badge-primary">{createdOp.patientType}</span>
                </div>

                {createdOp.remarks && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Remarks:</span>
                    <span style={{ color: '#0f172a', textAlign: 'right', maxWidth: '220px' }}>{createdOp.remarks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Slip Footer with Notice & Billed By */}
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '0.72rem', color: '#64748b' }}>
              <div style={{ fontStyle: 'italic', marginBottom: '8px', textAlign: 'center' }}>
                * Valid for the date of issue only. Please bring this slip for pharmacy, laboratory &amp; follow-up visits.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '2px' }}>
                <span>Billed By: <strong style={{ color: '#0f172a' }}>{loggedUserName}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => printLandscapeSlip('op-registration-slip', 'OP Registration Slip')}
              style={{ padding: '9px 20px', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Printer size={17} /> Print OP Slip (A5 Landscape)
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleReset}
              style={{ padding: '9px 20px', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <UserPlus size={17} /> Register Another Patient
            </button>
          </div>
        </div>) : (
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
                required
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="">-- Select Gender --</option>
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
                <option value="">-- Select Blood Group --</option>
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

            {/* Geographic Location Hierarchy - No Defaults */}
            <div className="form-group">
              <label className="form-label required">Country</label>
              <select
                className="form-control"
                required
                value={formData.countryId}
                onChange={handleCountryChange}
              >
                <option value="">-- Select Country --</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.countryName} ({c.countryCode || c.phoneCode})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">State</label>
              <select
                className="form-control"
                required
                value={formData.stateId}
                onChange={handleStateChange}
                disabled={!formData.countryId}
              >
                <option value="">{formData.countryId ? '-- Select State --' : '-- Select Country First --'}</option>
                {availableStates.map(s => (
                  <option key={s.id} value={s.id}>{s.stateName} ({s.stateCode || 'State'})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">City</label>
              <select
                className="form-control"
                required
                value={formData.cityId}
                onChange={handleCityChange}
                disabled={!formData.stateId}
              >
                <option value="">{formData.stateId ? '-- Select City --' : '-- Select State First --'}</option>
                {availableCities.map(c => (
                  <option key={c.id} value={c.id}>{c.cityName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.pincode}
                onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                placeholder="e.g. 632509"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Residential Address / Street Details</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="House / Flat No, Street Name, Landmark"
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
                <option value="">-- Select Consulting Doctor --</option>
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
                placeholder="Selected after doctor is chosen"
              />
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
                required
                value={formData.paymentType}
                onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
              >
                <option value="">-- Select Payment Type --</option>
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
