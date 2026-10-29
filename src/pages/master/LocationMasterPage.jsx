import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Globe, MapPin, Building, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Layers, RefreshCw } from 'lucide-react';

export default function LocationMasterPage() {
  const [activeTab, setActiveTab] = useState('cities'); // 'countries' | 'states' | 'cities'
  
  // Data states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCountryId, setFilterCountryId] = useState('');
  const [filterStateId, setFilterStateId] = useState('');

  // Modals
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [countryForm, setCountryForm] = useState({ countryName: '', countryCode: '', phoneCode: '+91', isActive: true });

  const [showStateModal, setShowStateModal] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [stateForm, setStateForm] = useState({ stateName: '', stateCode: '', countryId: '', isActive: true });

  const [showCityModal, setShowCityModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [cityForm, setCityForm] = useState({ cityName: '', stateId: '', defaultPincode: '', isActive: true });

  const loadAll = async () => {
    try {
      setLoading(true);
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
      alert('Failed to load location data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // --- COUNTRY HANDLERS ---
  const openAddCountry = () => {
    setEditingCountry(null);
    setCountryForm({ countryName: '', countryCode: '', phoneCode: '+91', isActive: true });
    setShowCountryModal(true);
  };

  const openEditCountry = (c) => {
    setEditingCountry(c);
    setCountryForm({
      countryName: c.countryName || '',
      countryCode: c.countryCode || '',
      phoneCode: c.phoneCode || '+91',
      isActive: c.isActive !== false,
    });
    setShowCountryModal(true);
  };

  const handleSaveCountry = async (e) => {
    e.preventDefault();
    try {
      if (editingCountry) {
        await api.updateCountry(editingCountry.id, countryForm);
      } else {
        await api.createCountry(countryForm);
      }
      setShowCountryModal(false);
      loadAll();
    } catch (err) {
      alert('Error saving country: ' + err.message);
    }
  };

  const handleDeleteCountry = async (c) => {
    if (!window.confirm(`Delete country "${c.countryName}"? Any dependent states and cities may be affected.`)) return;
    try {
      await api.deleteCountry(c.id);
      loadAll();
    } catch (err) {
      alert('Failed to delete country: ' + err.message);
    }
  };

  // --- STATE HANDLERS ---
  const openAddState = () => {
    setEditingState(null);
    const defaultCountry = countries[0]?.id || '';
    setStateForm({ stateName: '', stateCode: '', countryId: filterCountryId || defaultCountry, isActive: true });
    setShowStateModal(true);
  };

  const openEditState = (s) => {
    setEditingState(s);
    setStateForm({
      stateName: s.stateName || '',
      stateCode: s.stateCode || '',
      countryId: s.country?.id || countries[0]?.id || '',
      isActive: s.isActive !== false,
    });
    setShowStateModal(true);
  };

  const handleSaveState = async (e) => {
    e.preventDefault();
    try {
      if (editingState) {
        await api.updateState(editingState.id, stateForm);
      } else {
        await api.createState(stateForm);
      }
      setShowStateModal(false);
      loadAll();
    } catch (err) {
      alert('Error saving state: ' + err.message);
    }
  };

  const handleDeleteState = async (s) => {
    if (!window.confirm(`Delete state "${s.stateName}"?`)) return;
    try {
      await api.deleteState(s.id);
      loadAll();
    } catch (err) {
      alert('Failed to delete state: ' + err.message);
    }
  };

  // --- CITY HANDLERS ---
  const openAddCity = () => {
    setEditingCity(null);
    const defaultState = filterStateId || states[0]?.id || '';
    setCityForm({ cityName: '', stateId: defaultState, defaultPincode: '', isActive: true });
    setShowCityModal(true);
  };

  const openEditCity = (c) => {
    setEditingCity(c);
    setCityForm({
      cityName: c.cityName || '',
      stateId: c.state?.id || states[0]?.id || '',
      defaultPincode: c.defaultPincode || '',
      isActive: c.isActive !== false,
    });
    setShowCityModal(true);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    try {
      if (editingCity) {
        await api.updateCity(editingCity.id, cityForm);
      } else {
        await api.createCity(cityForm);
      }
      setShowCityModal(false);
      loadAll();
    } catch (err) {
      alert('Error saving city: ' + err.message);
    }
  };

  const handleDeleteCity = async (c) => {
    if (!window.confirm(`Delete city "${c.cityName}"?`)) return;
    try {
      await api.deleteCity(c.id);
      loadAll();
    } catch (err) {
      alert('Failed to delete city: ' + err.message);
    }
  };

  // Filtered queries
  const filteredCountries = countries.filter(c =>
    c.countryName?.toLowerCase().includes(search.toLowerCase()) ||
    c.countryCode?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStates = states.filter(s => {
    if (filterCountryId && String(s.country?.id) !== String(filterCountryId)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.stateName?.toLowerCase().includes(q) ||
        s.stateCode?.toLowerCase().includes(q) ||
        s.country?.countryName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredCities = cities.filter(c => {
    if (filterCountryId && String(c.state?.country?.id) !== String(filterCountryId)) return false;
    if (filterStateId && String(c.state?.id) !== String(filterStateId)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.cityName?.toLowerCase().includes(q) ||
        c.defaultPincode?.toLowerCase().includes(q) ||
        c.state?.stateName?.toLowerCase().includes(q) ||
        c.state?.country?.countryName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Globe size={22} color="#2563eb" />
            <span>MASTER &gt; LOCATION MASTER (COUNTRY / STATE / CITY MAPPING)</span>
          </h2>
          <p className="card-subtitle">
            Configure geographic hierarchy (Country ➔ State ➔ City) and default postal pincodes for OP registration.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={loadAll} title="Refresh data">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          {activeTab === 'countries' && (
            <button className="btn btn-primary" onClick={openAddCountry}>
              <Plus size={16} />
              <span>Add Country</span>
            </button>
          )}
          {activeTab === 'states' && (
            <button className="btn btn-primary" onClick={openAddState}>
              <Plus size={16} />
              <span>Add State</span>
            </button>
          )}
          {activeTab === 'cities' && (
            <button className="btn btn-primary" onClick={openAddCity}>
              <Plus size={16} />
              <span>Add City</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('cities'); setSearch(''); }}
          style={{
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: activeTab === 'cities' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'cities' ? '#2563eb' : '#64748b',
          }}
        >
          <Building size={16} />
          <span>Cities ({cities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('states'); setSearch(''); }}
          style={{
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: activeTab === 'states' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'states' ? '#2563eb' : '#64748b',
          }}
        >
          <MapPin size={16} />
          <span>States ({states.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('countries'); setSearch(''); }}
          style={{
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: activeTab === 'countries' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'countries' ? '#2563eb' : '#64748b',
          }}
        >
          <Globe size={16} />
          <span>Countries ({countries.length})</span>
        </button>
      </div>

      {/* Search & Hierarchical Filtering Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '320px' }}
        />

        {(activeTab === 'states' || activeTab === 'cities') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Country:</span>
            <select
              className="form-control"
              value={filterCountryId}
              onChange={(e) => {
                setFilterCountryId(e.target.value);
                setFilterStateId('');
              }}
              style={{ minWidth: '180px' }}
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.countryName} ({c.countryCode || c.phoneCode})</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'cities' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>State:</span>
            <select
              className="form-control"
              value={filterStateId}
              onChange={(e) => setFilterStateId(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">All States</option>
              {states
                .filter(s => !filterCountryId || String(s.country?.id) === String(filterCountryId))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.stateName} ({s.stateCode || 'State'})</option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* --- TAB 1: CITIES TABLE --- */}
      {activeTab === 'cities' && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>City Name</th>
                <th>Default Pincode</th>
                <th>State (Mapped)</th>
                <th>Country</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading cities...</td></tr>
              ) : filteredCities.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No cities found matching filters.</td></tr>
              ) : (
                filteredCities.map(c => (
                  <tr key={c.id}>
                    <td><strong>#{c.id}</strong></td>
                    <td><strong>{c.cityName}</strong></td>
                    <td>
                      {c.defaultPincode ? (
                        <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#0369a1', background: '#f0f9ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                          {c.defaultPincode}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className="badge badge-primary">{c.state?.stateName || '—'}</span>
                    </td>
                    <td>{c.state?.country?.countryName || '—'}</td>
                    <td>
                      {c.isActive ? (
                        <span className="badge badge-success"><CheckCircle2 size={12} /> Active</span>
                      ) : (
                        <span className="badge badge-danger"><XCircle size={12} /> Inactive</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditCity(c)}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCity(c)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 2: STATES TABLE --- */}
      {activeTab === 'states' && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>State Name</th>
                <th>State Code</th>
                <th>Mapped Country</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading states...</td></tr>
              ) : filteredStates.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No states found.</td></tr>
              ) : (
                filteredStates.map(s => (
                  <tr key={s.id}>
                    <td><strong>#{s.id}</strong></td>
                    <td><strong>{s.stateName}</strong></td>
                    <td><span className="badge badge-primary">{s.stateCode || '—'}</span></td>
                    <td>{s.country?.countryName || '—'}</td>
                    <td>
                      {s.isActive ? (
                        <span className="badge badge-success"><CheckCircle2 size={12} /> Active</span>
                      ) : (
                        <span className="badge badge-danger"><XCircle size={12} /> Inactive</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditState(s)}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteState(s)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 3: COUNTRIES TABLE --- */}
      {activeTab === 'countries' && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Country Name</th>
                <th>ISO Code</th>
                <th>Dial / Phone Code</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading countries...</td></tr>
              ) : filteredCountries.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No countries found.</td></tr>
              ) : (
                filteredCountries.map(c => (
                  <tr key={c.id}>
                    <td><strong>#{c.id}</strong></td>
                    <td><strong>{c.countryName}</strong></td>
                    <td><span className="badge badge-primary">{c.countryCode || '—'}</span></td>
                    <td><span style={{ fontWeight: '600', color: '#16a34a' }}>{c.phoneCode || '—'}</span></td>
                    <td>
                      {c.isActive ? (
                        <span className="badge badge-success"><CheckCircle2 size={12} /> Active</span>
                      ) : (
                        <span className="badge badge-danger"><XCircle size={12} /> Inactive</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditCountry(c)}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCountry(c)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- COUNTRY MODAL --- */}
      {showCountryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCountry ? 'Edit Country Master' : 'Add New Country Master'}</h3>
              <button className="modal-close" onClick={() => setShowCountryModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveCountry}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label required">Country Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={countryForm.countryName}
                  onChange={(e) => setCountryForm({...countryForm, countryName: e.target.value})}
                  placeholder="e.g. India"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Country Code (ISO 2/3)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={countryForm.countryCode}
                  onChange={(e) => setCountryForm({...countryForm, countryCode: e.target.value.toUpperCase()})}
                  placeholder="e.g. IN"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Phone Dial Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={countryForm.phoneCode}
                  onChange={(e) => setCountryForm({...countryForm, phoneCode: e.target.value})}
                  placeholder="e.g. +91"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Status</label>
                <select 
                  className="form-control"
                  value={countryForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setCountryForm({...countryForm, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCountryModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Country</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- STATE MODAL --- */}
      {showStateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingState ? 'Edit State Master' : 'Add New State Master'}</h3>
              <button className="modal-close" onClick={() => setShowStateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveState}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label required">Parent Country</label>
                <select 
                  className="form-control" 
                  required
                  value={stateForm.countryId}
                  onChange={(e) => setStateForm({...stateForm, countryId: parseInt(e.target.value)})}
                >
                  <option value="">-- Select Country --</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.countryName} ({c.countryCode})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label required">State Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={stateForm.stateName}
                  onChange={(e) => setStateForm({...stateForm, stateName: e.target.value})}
                  placeholder="e.g. Tamil Nadu"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">State Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={stateForm.stateCode}
                  onChange={(e) => setStateForm({...stateForm, stateCode: e.target.value.toUpperCase()})}
                  placeholder="e.g. TN"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Status</label>
                <select 
                  className="form-control"
                  value={stateForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setStateForm({...stateForm, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save State</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CITY MODAL --- */}
      {showCityModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCity ? 'Edit City Master' : 'Add New City Master'}</h3>
              <button className="modal-close" onClick={() => setShowCityModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveCity}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label required">Parent State</label>
                <select 
                  className="form-control" 
                  required
                  value={cityForm.stateId}
                  onChange={(e) => setCityForm({...cityForm, stateId: parseInt(e.target.value)})}
                >
                  <option value="">-- Select State --</option>
                  {states.map(s => (
                    <option key={s.id} value={s.id}>{s.stateName} ({s.country?.countryName})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label required">City Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={cityForm.cityName}
                  onChange={(e) => setCityForm({...cityForm, cityName: e.target.value})}
                  placeholder="e.g. Melvisharam"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Default Postal Pincode</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={cityForm.defaultPincode}
                  onChange={(e) => setCityForm({...cityForm, defaultPincode: e.target.value})}
                  placeholder="e.g. 632509"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Status</label>
                <select 
                  className="form-control"
                  value={cityForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setCityForm({...cityForm, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCityModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save City</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
