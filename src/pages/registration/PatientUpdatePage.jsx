import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { UserCog, Search, CheckCircle, Save } from 'lucide-react';
import DobDatePicker from '../../components/DobDatePicker';

export default function PatientUpdatePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [form, setForm] = useState({
    id: null,
    firstName: '',
    lastName: '',
    dob: '',
    age: '',
    gender: 'MALE',
    mobile: '',
    email: '',
    countryId: '',
    stateId: '',
    cityId: '',
    pincode: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
  });

  useEffect(() => {
    async function loadLocations() {
      try {
        const [cList, sList, ctList] = await Promise.all([
          api.getCountries(false),
          api.getStates('', false),
          api.getCities('', false),
        ]);
        setCountries(cList || []);
        setStates(sList || []);
        setCities(ctList || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadLocations();
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
    setForm(prev => ({
      ...prev,
      dob: dobVal,
      age: computedAge !== '' ? computedAge : prev.age,
    }));
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setSavedSuccess(false);
    try {
      const data = await api.searchPatients(query.trim());
      setResults(data || []);
    } catch (err) {
      alert('Error searching patients: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (p) => {
    setSelectedPatient(p);
    setForm({
      id: p.id,
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      dob: p.dob || '',
      age: p.age || '',
      gender: p.gender || 'MALE',
      mobile: p.mobile || '',
      email: p.email || '',
      countryId: p.countryId || '',
      stateId: p.stateId || '',
      cityId: p.cityId || '',
      pincode: p.pincode || '',
      address: p.address || '',
      bloodGroup: p.bloodGroup || 'B+',
      emergencyContact: p.emergencyContact || '',
    });
    setResults([]);
    setSavedSuccess(false);
  };

  const handleCountryChange = (e) => {
    const cId = parseInt(e.target.value) || '';
    const matchedStates = states.filter(s => s.country?.id === cId);
    const firstState = matchedStates[0] || null;
    const matchedCities = firstState ? cities.filter(c => c.state?.id === firstState.id) : [];
    const firstCity = matchedCities[0] || null;

    setForm(prev => ({
      ...prev,
      countryId: cId,
      stateId: firstState ? firstState.id : '',
      cityId: firstCity ? firstCity.id : '',
      pincode: firstCity?.defaultPincode || '',
    }));
  };

  const handleStateChange = (e) => {
    const sId = parseInt(e.target.value) || '';
    const matchedCities = cities.filter(c => c.state?.id === sId);
    const firstCity = matchedCities[0] || null;

    setForm(prev => ({
      ...prev,
      stateId: sId,
      cityId: firstCity ? firstCity.id : '',
      pincode: firstCity?.defaultPincode || '',
    }));
  };

  const handleCityChange = (e) => {
    const ctId = parseInt(e.target.value) || '';
    const selectedCity = cities.find(c => c.id === ctId);

    setForm(prev => ({
      ...prev,
      cityId: ctId,
      pincode: selectedCity?.defaultPincode || prev.pincode,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        dob: form.dob || null,
        age: parseInt(form.age) || 0,
        countryId: form.countryId ? parseInt(form.countryId) : null,
        stateId: form.stateId ? parseInt(form.stateId) : null,
        cityId: form.cityId ? parseInt(form.cityId) : null,
      };
      await api.updatePatient(payload);
      setSavedSuccess(true);
    } catch (err) {
      alert('Error updating patient: ' + err.message);
    }
  };

  const availableStates = states.filter(s => !form.countryId || s.country?.id === parseInt(form.countryId));
  const availableCities = cities.filter(c => !form.stateId || c.state?.id === parseInt(form.stateId));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <UserCog size={22} color="#2563eb" />
            <span>REGISTRATION &gt; PATIENT DETAIL UPDATE</span>
          </h2>
          <p className="card-subtitle">Search registered patient by MRN or contact info and update address, mobile, or demographics.</p>
        </div>
      </div>

      {/* Search Header */}
      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search patient by MRN, Name, or Mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={isSearching}>
            <Search size={16} />
            <span>{isSearching ? 'Searching...' : 'Find Patient'}</span>
          </button>
        </form>

        {results.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
              Search Results ({results.length}):
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  style={{ 
                    padding: '10px 14px', 
                    background: '#ffffff', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <strong style={{ color: '#2563eb' }}>{p.mrn}</strong> — {p.firstName} {p.lastName} ({p.gender}, {p.age}y{p.dob ? ` | DOB: ${p.dob}` : ''})
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    📱 {p.mobile} {p.address ? `| 🏠 ${p.address}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} />
          <span>Patient record updated successfully.</span>
        </div>
      )}

      {selectedPatient ? (
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
              Editing: {selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.mrn})
            </h3>
            <span className="badge badge-primary">ID: #{selectedPatient.id}</span>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">First Name</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={form.firstName}
                onChange={(e) => setForm({...form, firstName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={form.lastName}
                onChange={(e) => setForm({...form, lastName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth (DOB)</label>
              <DobDatePicker 
                value={form.dob}
                onChange={(dobVal) => {
                  const computedAge = calculateAgeFromDob(dobVal);
                  setForm(prev => ({
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
                value={form.age}
                onChange={(e) => setForm({...form, age: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Gender</label>
              <select 
                className="form-control" 
                value={form.gender}
                onChange={(e) => setForm({...form, gender: e.target.value})}
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
                value={form.mobile}
                onChange={(e) => setForm({...form, mobile: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select 
                className="form-control" 
                value={form.bloodGroup}
                onChange={(e) => setForm({...form, bloodGroup: e.target.value})}
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

            {/* Country / State / City / Pincode */}
            <div className="form-group">
              <label className="form-label">Country</label>
              <select
                className="form-control"
                value={form.countryId}
                onChange={handleCountryChange}
              >
                <option value="">-- Select Country --</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.countryName} ({c.countryCode})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <select
                className="form-control"
                value={form.stateId}
                onChange={handleStateChange}
              >
                <option value="">-- Select State --</option>
                {availableStates.map(s => (
                  <option key={s.id} value={s.id}>{s.stateName} ({s.stateCode || 'State'})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <select
                className="form-control"
                value={form.cityId}
                onChange={handleCityChange}
              >
                <option value="">-- Select City --</option>
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
                value={form.pincode}
                onChange={(e) => setForm({...form, pincode: e.target.value})}
                placeholder="e.g. 632509"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Residential Address</label>
              <input 
                type="text" 
                className="form-control" 
                value={form.address}
                onChange={(e) => setForm({...form, address: e.target.value})}
                placeholder="House / Flat No, Street, Landmark"
              />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save &amp; Update Patient Details</span>
            </button>
          </div>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
          Search for a patient to inspect and update details.
        </div>
      )}
    </div>
  );
}
