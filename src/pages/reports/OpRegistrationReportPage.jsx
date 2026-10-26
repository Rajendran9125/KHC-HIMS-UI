import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BarChart3, Users, Filter, Printer, Stethoscope, History } from 'lucide-react';

export default function OpRegistrationReportPage() {
  const [data, setData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visitType, setVisitType] = useState('');
  const [doctorId, setDoctorId] = useState('');
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
    setTimeout(fetchReport, 0);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <BarChart3 size={22} color="#2563eb" />
            <span>REPORT &gt; OP REGISTRATION</span>
          </h2>
          <p className="card-subtitle">Outpatient registration metrics, footfall volume, new vs follow-up visits, and doctor loads.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Filter toolbar */}
      <form onSubmit={handleFilter} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' }}>
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
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>OP Ticket</th>
              <th>Date &amp; Time</th>
              <th>MRN</th>
              <th>Patient Name</th>
              <th>Age/Gender</th>
              <th>Doctor</th>
              <th>Visit Type</th>
              <th>Category</th>
              <th>Fee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '24px' }}>Loading registration records...</td></tr>
            ) : !data?.registrations || data.registrations.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '24px' }}>No registrations found.</td></tr>
            ) : (
              data.registrations.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.opNumber}</strong></td>
                  <td>{r.registrationDate ? new Date(r.registrationDate).toLocaleString() : '—'}</td>
                  <td><code>{r.patient?.mrn}</code></td>
                  <td><strong>{r.patient?.firstName} {r.patient?.lastName}</strong></td>
                  <td>{r.patient?.age}y / {r.patient?.gender}</td>
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
