import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Search, Users, Filter, Printer, Stethoscope, History, X } from 'lucide-react';

export default function OpRegistrationReportPage() {
  const [data, setData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visitType, setVisitType] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const docs = await api.getDoctors();
        setDoctors(docs || []);
      } catch (err) {
        console.error(err);
      }
      fetchReport();
    }
    init();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (visitType) params.visitType = visitType;
      if (doctorId) params.doctorId = doctorId;
      const res = await api.getOpRegistrationReport(params);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setVisitType('');
    setDoctorId('');
    setPatientSearch('');
    setTimeout(fetchReport, 0);
  };

  // Filter registrations in-memory by patientSearch (Patient ID / MRN, Name, Phone, OP Token)
  const displayedRegistrations = useMemo(() => {
    if (!data?.registrations) return [];
    if (!patientSearch.trim()) return data.registrations;
    const q = patientSearch.toLowerCase().trim();
    return data.registrations.filter(r => {
      const opNum = (r.opNumber || '').toLowerCase();
      const mrn = (r.patient?.mrn || '').toLowerCase();
      const pName = `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.toLowerCase();
      const phone = (r.patient?.mobile || '').toLowerCase();
      const doc = (r.doctor?.doctorName || '').toLowerCase();
      return opNum.includes(q) || mrn.includes(q) || pName.includes(q) || phone.includes(q) || doc.includes(q);
    });
  }, [data?.registrations, patientSearch]);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Search size={22} color="#2563eb" />
            <span>REPORT &gt; OP PATIENT SEARCH OPTION</span>
          </h2>
          <p className="card-subtitle">
            Search, filter, and view registered outpatient records by Patient ID, Token, Name, Mobile, Doctor, or Date.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Filter toolbar */}
      <form onSubmit={handleFilter} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' }}>
        {/* Top row: Patient Search Query */}
        <div style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e3a8a', marginBottom: '4px' }}>
            Search Patient by Patient ID (MRN), Name, Mobile Number, or OP Token
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.9rem' }}
              placeholder="e.g. Type MRN-2026-0001, Ramesh, 9876543210, or OP-2026-0001..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
            {patientSearch && (
              <button 
                type="button" 
                onClick={() => setPatientSearch('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: Date & Dropdown Filters */}
        <div className="form-grid" style={{ marginBottom: '12px' }}>
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">To Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Visit Type</label>
            <select 
              className="form-control" 
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
            >
              <option value="">All Visits</option>
              <option value="NEW">New Consultations</option>
              <option value="REVIEW">Review / Follow-ups</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Consulting Doctor</label>
            <select 
              className="form-control" 
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.doctorName}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary btn-sm">
            <Filter size={14} /> Filter Registrations
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Outpatients</span>
            <span className="kpi-value">{data?.totalCount ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">New Registrations</span>
            <span className="kpi-value">{data?.newCount ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <History size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Review Visits</span>
            <span className="kpi-value">{data?.reviewCount ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            <Stethoscope size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Consultation Fees Collected</span>
            <span className="kpi-value">₹{Number(data?.totalFees || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Doctor Volume Breakdown */}
      {data?.doctorCounts && Object.keys(data.doctorCounts).length > 0 && (
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '12px' }}>
            Doctor-Wise Patient Consult Volume:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.entries(data.doctorCounts).map(([doc, cnt]) => (
              <div key={doc} style={{ background: '#fff', border: '1px solid #bfdbfe', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>{doc}: </span>
                <strong style={{ color: '#1d4ed8' }}>{cnt} patients</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration Details Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1e3a8a' }}>
          Showing {displayedRegistrations.length} of {data?.totalCount ?? 0} registered patient visits
        </span>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>OP Token</th>
              <th>Date &amp; Time</th>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Age/Gender</th>
              <th>Contact</th>
              <th>Doctor</th>
              <th>Visit Type</th>
              <th>Category</th>
              <th>Fee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="11" style={{ textAlign: 'center', padding: '24px' }}>Loading registration records...</td></tr>
            ) : displayedRegistrations.length === 0 ? (
              <tr><td colSpan="11" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No registrations match the selected filters or search text.</td></tr>
            ) : (
              displayedRegistrations.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.opNumber}</strong></td>
                  <td>{r.registrationDate ? new Date(r.registrationDate).toLocaleString('en-GB') : '-'}</td>
                  <td><code>{r.patient?.mrn}</code></td>
                  <td><strong>{r.patient?.firstName} {r.patient?.lastName}</strong></td>
                  <td>{r.patient?.age}y / {r.patient?.gender}</td>
                  <td>{r.patient?.mobile || '-'}</td>
                  <td>{r.doctor?.doctorName}</td>
                  <td>
                    <span className={`badge ${r.visitType === 'NEW' ? 'badge-primary' : 'badge-warning'}`}>
                      {r.visitType}
                    </span>
                  </td>
                  <td><span className="badge badge-success">{r.patientType}</span></td>
                  <td><strong>₹{r.consultationFee}</strong></td>
                  <td>
                    <span className={`badge ${r.status === 'BILLED' ? 'badge-success' : 'badge-warning'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
