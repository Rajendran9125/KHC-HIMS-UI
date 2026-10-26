import React, { useState } from 'react';
import { api } from '../../services/api';
import { UserCog, Search, CheckCircle, Save } from 'lucide-react';

export default function PatientUpdatePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [form, setForm] = useState({
    id: null,
    firstName: '',
    lastName: '',
    age: '',
    gender: 'MALE',
    mobile: '',
    email: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
  });

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
      age: p.age || '',
      gender: p.gender || 'MALE',
      mobile: p.mobile || '',
      email: p.email || '',
      address: p.address || '',
      bloodGroup: p.bloodGroup || 'B+',
      emergencyContact: p.emergencyContact || '',
    });
    setResults([]);
    setSavedSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        age: parseInt(form.age) || 0,
      };
      await api.updatePatient(payload);
      setSavedSuccess(true);
    } catch (err) {
      alert('Error updating patient: ' + err.message);
    }
  };

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
                {results.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.mrn}</strong></td>
                    <td>{p.firstName} {p.lastName}</td>
                    <td>{p.age}y / {p.gender}</td>
                    <td>{p.mobile}</td>
                    <td>
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSelect(p)}
                      >
                        Edit Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div style={{ padding: '14px 18px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <span>Patient record successfully updated and synchronized!</span>
        </div>
      )}

      {selectedPatient ? (
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Editing MRN: <strong style={{ color: '#2563eb' }}>{selectedPatient.mrn}</strong>
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedPatient(null)}>
              Select Another Patient
            </button>
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
              <label className="form-label required">Age (Years)</label>
              <input 
                type="number" 
                className="form-control" 
                required 
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
              <label className="form-label">Emergency Contact Phone</label>
              <input 
                type="tel" 
                className="form-control" 
                value={form.emergencyContact}
                onChange={(e) => setForm({...form, emergencyContact: e.target.value})}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Residential Address</label>
              <input 
                type="text" 
                className="form-control" 
                value={form.address}
                onChange={(e) => setForm({...form, address: e.target.value})}
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
