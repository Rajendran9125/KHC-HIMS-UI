import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FileText, Search, Printer, DollarSign, Receipt, Filter, RotateCcw } from 'lucide-react';

export default function OpBillingReportPage() {
  const [reportData, setReportData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
      if (doctorId) params.doctorId = doctorId;
      const data = await api.getOpBillingReport(params);
      setReportData(data);
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
    setDoctorId('');
    setTimeout(fetchReport, 0);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <FileText size={22} color="#2563eb" />
            <span>REPORT &gt; OP BILLING</span>
          </h2>
          <p className="card-subtitle">Comprehensive financial audit report of all outpatient service invoices and collections.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Filter Toolbar */}
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
            <label className="form-label">Filter by Doctor</label>
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
            <Filter size={14} /> Apply Filter
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
            <Receipt size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Bills</span>
            <span className="kpi-value">{reportData?.totalCount ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Gross Invoiced</span>
            <span className="kpi-value">₹{Number(reportData?.totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <RotateCcw size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Refunded</span>
            <span className="kpi-value" style={{ color: '#dc2626' }}>
              ₹{Number(reportData?.totalRefunded || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Net Collected (After Refunds)</span>
            <span className="kpi-value" style={{ color: '#16a34a' }}>
              ₹{Number(reportData?.totalPaid || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Discounts Given</span>
            <span className="kpi-value">₹{Number(reportData?.totalDiscount || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Date &amp; Time</th>
              <th>Patient MRN &amp; Name</th>
              <th>Doctor</th>
              <th>Payment Mode</th>
              <th>Bill Total</th>
              <th>Discount</th>
              <th>Refunded</th>
              <th>Net Collected</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '24px' }}>Loading report data...</td></tr>
            ) : !reportData?.bills || reportData.bills.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '24px' }}>No bills found matching filters.</td></tr>
            ) : (
              reportData.bills.map(b => {
                const netAmount = Math.max(0, (b.paidAmount || b.totalAmount || 0) - (b.refundedAmount || 0));
                const isRefunded = b.paymentStatus === 'REFUNDED';
                const isPartial = b.paymentStatus === 'PARTIAL_REFUND';
                return (
                  <tr key={b.id} style={{ background: isRefunded ? '#fef2f2' : 'inherit' }}>
                    <td><strong>{b.billNumber}</strong></td>
                    <td>{b.billDate ? new Date(b.billDate).toLocaleString() : '—'}</td>
                    <td>
                      <strong>{b.patient?.firstName} {b.patient?.lastName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.patient?.mrn}</div>
                    </td>
                    <td>{b.doctor?.doctorName}</td>
                    <td><span className="badge badge-primary">{b.paymentType}</span></td>
                    <td>₹{b.totalAmount}</td>
                    <td style={{ color: '#dc2626' }}>₹{b.discount || 0}</td>
                    <td>
                      {b.refundedAmount > 0 ? (
                        <strong style={{ color: '#dc2626' }}>-₹{b.refundedAmount}</strong>
                      ) : '—'}
                    </td>
                    <td>
                      <strong style={{ color: netAmount === 0 ? '#94a3b8' : '#15803d' }}>
                        ₹{netAmount}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${isRefunded ? 'badge-danger' : isPartial ? 'badge-warning' : 'badge-success'}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
