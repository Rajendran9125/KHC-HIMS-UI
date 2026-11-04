import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { 
  Printer, 
  Search, 
  FileText, 
  RotateCcw, 
  Receipt, 
  Calendar, 
  User, 
  CheckCircle, 
  X, 
  Clock, 
  Filter,
  Eye,
  FileCheck
} from 'lucide-react';
import { printLandscapeSlip } from '../../utils/printSlip';

export default function CopyBillPage({ onNavigate, currentUser }) {
  const [activeTab, setActiveTab] = useState('SERVICE_BILLS'); // 'SERVICE_BILLS' | 'OP_REGISTRATIONS'
  const [bills, setBills] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Selected item for preview & duplicate print
  const [previewBill, setPreviewBill] = useState(null);
  const [previewReg, setPreviewReg] = useState(null);

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

  // Load both bills and registrations
  const loadData = async () => {
    setLoading(true);
    try {
      const [billList, regList] = await Promise.all([
        api.getBills(),
        api.getRegistrations()
      ]);
      setBills(billList || []);
      setRegistrations(regList || []);
    } catch (err) {
      console.error('Error loading bills/registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter service bills
  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const billNum = (b.billNumber || '').toLowerCase();
        const pName = `${b.patient?.firstName || ''} ${b.patient?.lastName || ''}`.toLowerCase();
        const mrn = (b.patient?.mrn || '').toLowerCase();
        const phone = (b.patient?.mobile || '').toLowerCase();
        const doc = (b.doctor?.doctorName || '').toLowerCase();
        const opNum = (b.opRegistration?.opNumber || '').toLowerCase();
        const matches = billNum.includes(q) || pName.includes(q) || mrn.includes(q) || phone.includes(q) || doc.includes(q) || opNum.includes(q);
        if (!matches) return false;
      }

      // Date range filter
      if (fromDate) {
        const bDateStr = b.billDate ? b.billDate.substring(0, 10) : '';
        if (bDateStr && bDateStr < fromDate) return false;
      }
      if (toDate) {
        const bDateStr = b.billDate ? b.billDate.substring(0, 10) : '';
        if (bDateStr && bDateStr > toDate) return false;
      }

      return true;
    });
  }, [bills, searchQuery, fromDate, toDate]);

  // Filter OP registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const opNum = (r.opNumber || '').toLowerCase();
        const pName = `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.toLowerCase();
        const mrn = (r.patient?.mrn || '').toLowerCase();
        const phone = (r.patient?.mobile || '').toLowerCase();
        const doc = (r.doctor?.doctorName || '').toLowerCase();
        const matches = opNum.includes(q) || pName.includes(q) || mrn.includes(q) || phone.includes(q) || doc.includes(q);
        if (!matches) return false;
      }

      // Date range filter
      if (fromDate) {
        const rDateStr = r.registrationDate ? r.registrationDate.substring(0, 10) : '';
        if (rDateStr && rDateStr < fromDate) return false;
      }
      if (toDate) {
        const rDateStr = r.registrationDate ? r.registrationDate.substring(0, 10) : '';
        if (rDateStr && rDateStr > toDate) return false;
      }

      return true;
    });
  }, [registrations, searchQuery, fromDate, toDate]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
  };

  const setFilterToday = () => {
    const today = new Date().toISOString().substring(0, 10);
    setFromDate(today);
    setToDate(today);
  };

  const handlePrintServiceBill = (bill) => {
    setPreviewBill(bill);
    setPreviewReg(null);
  };

  const handlePrintOpSlip = (reg) => {
    setPreviewReg(reg);
    setPreviewBill(null);
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header no-print">
        <div>
          <h2 className="card-title">
            <Printer size={22} color="#2563eb" />
            <span>BILLING &gt; COPY BILL (DUPLICATE / REPRINT)</span>
          </h2>
          <p className="card-subtitle">
            Search, retrieve and print duplicate copies of OP Service Invoices and OP Registration Slips.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={loadData}
            title="Reload recent bills and registrations"
          >
            <RotateCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', paddingBottom: '4px' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('SERVICE_BILLS'); setPreviewBill(null); setPreviewReg(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.92rem',
            fontWeight: activeTab === 'SERVICE_BILLS' ? '700' : '600',
            color: activeTab === 'SERVICE_BILLS' ? '#1d4ed8' : '#64748b',
            background: activeTab === 'SERVICE_BILLS' ? '#eff6ff' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'SERVICE_BILLS' ? '3px solid #2563eb' : '3px solid transparent',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Receipt size={17} />
          <span>OP Service Invoices (Bills)</span>
          <span style={{ 
            background: activeTab === 'SERVICE_BILLS' ? '#2563eb' : '#cbd5e1', 
            color: '#fff', 
            borderRadius: '10px', 
            padding: '1px 8px', 
            fontSize: '0.75rem',
            fontWeight: '700'
          }}>
            {filteredBills.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('OP_REGISTRATIONS'); setPreviewBill(null); setPreviewReg(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.92rem',
            fontWeight: activeTab === 'OP_REGISTRATIONS' ? '700' : '600',
            color: activeTab === 'OP_REGISTRATIONS' ? '#1d4ed8' : '#64748b',
            background: activeTab === 'OP_REGISTRATIONS' ? '#eff6ff' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'OP_REGISTRATIONS' ? '3px solid #2563eb' : '3px solid transparent',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={17} />
          <span>OP Registration Slips (Tokens)</span>
          <span style={{ 
            background: activeTab === 'OP_REGISTRATIONS' ? '#2563eb' : '#cbd5e1', 
            color: '#fff', 
            borderRadius: '10px', 
            padding: '1px 8px', 
            fontSize: '0.75rem',
            fontWeight: '700'
          }}>
            {filteredRegistrations.length}
          </span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="no-print" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 2fr) minmax(140px, 1fr) minmax(140px, 1fr) auto', gap: '12px', alignItems: 'end' }}>
          {/* Universal Search Query */}
          <div>
            <label className="form-label" style={{ fontWeight: '600', fontSize: '0.82rem', marginBottom: '4px' }}>
              Search Filter (Bill No / Token / Patient ID / Name / Mobile)
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.88rem' }}
                placeholder={activeTab === 'SERVICE_BILLS' ? 'Type Bill No (e.g. BILL-2026-3001), Patient ID, Name, Phone...' : 'Type OP Token (e.g. OP-2026-0001), Patient ID, Name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* From Date */}
          <div>
            <label className="form-label" style={{ fontWeight: '600', fontSize: '0.82rem', marginBottom: '4px' }}>
              From Date
            </label>
            <input
              type="date"
              className="form-control"
              style={{ height: '38px', fontSize: '0.88rem' }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div>
            <label className="form-label" style={{ fontWeight: '600', fontSize: '0.82rem', marginBottom: '4px' }}>
              To Date
            </label>
            <input
              type="date"
              className="form-control"
              style={{ height: '38px', fontSize: '0.88rem' }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Quick Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ height: '38px', padding: '0 12px', fontWeight: '600' }}
              onClick={setFilterToday}
              title="Filter records created today"
            >
              Today
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ height: '38px', padding: '0 12px' }}
              onClick={handleResetFilters}
              title="Clear all filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <RotateCcw size={28} className="spin" style={{ marginBottom: '10px' }} />
          <div>Loading bills and registration records...</div>
        </div>
      ) : activeTab === 'SERVICE_BILLS' ? (
        /* ======================== TAB 1: SERVICE BILLS ======================== */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1e3a8a' }}>
              Found {filteredBills.length} Service Invoices
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Click <strong>"Print Copy Bill"</strong> on any row to preview and reprint duplicate invoice.
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Date &amp; Time</th>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th style={{ textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ textAlign: 'right' }}>Paid (₹)</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No service bills matched the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map(b => (
                    <tr key={b.id} style={{ background: previewBill?.id === b.id ? '#eff6ff' : 'transparent' }}>
                      <td>
                        <strong style={{ color: '#2563eb' }}>{b.billNumber}</strong>
                        {b.opRegistration && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Token: {b.opRegistration.opNumber}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{b.billDate ? new Date(b.billDate).toLocaleDateString('en-GB') : '-'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {b.billDate ? new Date(b.billDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                        </div>
                      </td>
                      <td><span className="badge badge-primary">{b.patient?.mrn}</span></td>
                      <td>
                        <strong>{b.patient?.firstName} {b.patient?.lastName}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {b.patient?.age ? `${b.patient.age}y` : ''} {b.patient?.gender ? `/ ${b.patient.gender}` : ''} {b.patient?.mobile ? `• ${b.patient.mobile}` : ''}
                        </div>
                      </td>
                      <td>{b.doctor?.doctorName}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>
                        ₹{Number(b.totalAmount || 0).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                        ₹{Number(b.paidAmount || 0).toLocaleString()}
                      </td>
                      <td><span className="badge badge-success">{b.paymentType || 'CASH'}</span></td>
                      <td>
                        <span className={`badge ${
                          b.paymentStatus === 'PAID' ? 'badge-success' : 
                          b.paymentStatus === 'REFUNDED' ? 'badge-danger' : 
                          b.paymentStatus === 'PARTIAL_REFUND' ? 'badge-warning' : 'badge-primary'
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handlePrintServiceBill(b)}
                          title="Preview & print duplicate bill copy"
                        >
                          <Printer size={14} />
                          <span>Print Copy Bill</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================== TAB 2: OP REGISTRATIONS ======================== */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1e3a8a' }}>
              Found {filteredRegistrations.length} OP Registrations
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Click <strong>"Print Duplicate Slip"</strong> on any row to preview and reprint OP token slip.
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>OP Token No</th>
                  <th>Date &amp; Time</th>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th style={{ textAlign: 'right' }}>Fee (₹)</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No OP registration records matched the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map(r => (
                    <tr key={r.id} style={{ background: previewReg?.id === r.id ? '#eff6ff' : 'transparent' }}>
                      <td><strong style={{ color: '#2563eb' }}>{r.opNumber}</strong></td>
                      <td>
                        <div>{r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('en-GB') : '-'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {r.registrationDate ? new Date(r.registrationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                        </div>
                      </td>
                      <td><span className="badge badge-primary">{r.patient?.mrn}</span></td>
                      <td>
                        <strong>{r.patient?.firstName} {r.patient?.lastName}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {r.patient?.age ? `${r.patient.age}y` : ''} {r.patient?.gender ? `/ ${r.patient.gender}` : ''} {r.patient?.mobile ? `• ${r.patient.mobile}` : ''}
                        </div>
                      </td>
                      <td>{r.doctor?.doctorName}</td>
                      <td>{r.department || r.doctor?.department || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>
                        ₹{Number(r.consultationFee || 0).toLocaleString()}
                      </td>
                      <td><span className="badge badge-success">{r.paymentType || 'CASH'}</span></td>
                      <td>
                        <span className={`badge ${r.status === 'BILLED' ? 'badge-success' : 'badge-warning'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handlePrintOpSlip(r)}
                          title="Preview & print duplicate OP slip"
                        >
                          <Printer size={14} />
                          <span>Print Duplicate Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================== MODAL PREVIEW: SERVICE INVOICE COPY ======================== */}
      {previewBill && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '880px',
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Modal Actions Bar */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={22} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a' }}>
                  Duplicate Bill Preview &amp; Reprint
                </h3>
                <span className="badge badge-warning" style={{ fontWeight: '800' }}>DUPLICATE COPY</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => printLandscapeSlip('copy-service-bill-slip', `Duplicate Bill - ${previewBill.billNumber}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                >
                  <Printer size={16} /> Print Duplicate Bill
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPreviewBill(null)}
                >
                  <X size={16} /> Close
                </button>
              </div>
            </div>

            {/* Printable A5 Landscape Slip */}
            <div 
              id="copy-service-bill-slip"
              className="op-a5-print-card"
              style={{ 
                margin: '0 auto', 
                background: '#ffffff', 
                border: '2px solid #1e3a8a', 
                borderRadius: '8px', 
                padding: '16px 22px', 
                textAlign: 'left',
                position: 'relative'
              }}
            >
              {/* Duplicate Watermark / Ribbon Banner */}
              <div style={{ 
                background: '#fef3c7', 
                border: '1.5px dashed #d97706', 
                color: '#92400e', 
                textAlign: 'center', 
                padding: '5px 12px', 
                borderRadius: '4px', 
                fontWeight: '800', 
                fontSize: '0.85rem', 
                letterSpacing: '0.08em',
                marginBottom: '12px'
              }}>
                *** DUPLICATE BILL / REPRINT COPY ***
                <span style={{ fontWeight: '500', fontSize: '0.74rem', marginLeft: '12px', color: '#78350f' }}>
                  Reprinted on: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} | By: {loggedUserName}
                </span>
              </div>

              {/* Header: Logo on Left, Clinic in Center, Bill info on Right */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 150px', alignItems: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '10px', marginBottom: '12px' }}>
                <div>
                  <img 
                    src="/KH Logo.jpeg" 
                    alt="KH Group Logo" 
                    style={{ height: '54px', width: 'auto', objectFit: 'contain' }} 
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e3a8a', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                    KH CLINIC
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                    Melvisharam - 632509, Ranipet Dist., Tamil Nadu | Ph: 04172-266123
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563eb', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    OPD Services &amp; Cash Receipt (Duplicate Copy)
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#475569' }}>
                  <div style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '0.95rem' }}>{previewBill.billNumber}</div>
                  <div style={{ marginTop: '2px' }}>Orig Date: {new Date(previewBill.billDate || Date.now()).toLocaleDateString('en-GB')}</div>
                  <div>{new Date(previewBill.billDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                </div>
              </div>

              {/* Patient & Doctor Demographics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px 20px', fontSize: '0.82rem', marginBottom: '12px', background: '#f8fafc', padding: '8px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Patient:</span>
                  <strong style={{ color: '#0f172a' }}>
                    {previewBill.patient?.firstName} {previewBill.patient?.lastName} {previewBill.patient?.age ? `(${previewBill.patient?.age}y / ${previewBill.patient?.gender || ''})` : ''}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Patient ID:</span>
                  <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '0.95rem' }}>{previewBill.patient?.mrn}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Doctor:</span>
                  <strong style={{ color: '#0f172a' }}>{previewBill.doctor?.doctorName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Payment Mode:</span>
                  <strong className="badge badge-success">{previewBill.paymentType}</strong>
                </div>
              </div>

              {/* Service Items Table */}
              <table className="data-table" style={{ marginBottom: '10px', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                    <th>Service Item</th>
                    <th>Header / Category</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>OP Rate</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewBill.items?.map((item, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ fontWeight: '600' }}>
                        {item.serviceName}
                        {item.status === 'REFUNDED' && (
                          <span className="badge badge-danger" style={{ marginLeft: '6px', fontSize: '0.7rem' }}>REFUNDED</span>
                        )}
                      </td>
                      <td><span className="badge badge-primary">{item.serviceCategory}</span></td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>₹{item.unitPrice}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>₹{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Summary & Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'end', marginTop: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                  <div><strong>Payment Status:</strong> {previewBill.paymentStatus}</div>
                  {previewBill.remarks && <div><strong>Remarks:</strong> {previewBill.remarks}</div>}
                  <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', width: '130px', textAlign: 'center' }}>
                      Cashier Signature
                    </div>
                    <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', width: '130px', textAlign: 'center' }}>
                      Authorized Signatory
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Gross Sub Total:</span>
                    <strong>₹{Number(previewBill.subTotal || 0).toLocaleString()}</strong>
                  </div>
                  {Number(previewBill.discount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#dc2626' }}>
                      <span>Discount:</span>
                      <strong>-₹{Number(previewBill.discount).toLocaleString()}</strong>
                    </div>
                  )}
                  {Number(previewBill.tax || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>GST Amount:</span>
                      <strong>+₹{Number(previewBill.tax).toLocaleString()}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #94a3b8', paddingTop: '6px', fontSize: '0.98rem', color: '#1e3a8a' }}>
                    <strong>Net Total Amount:</strong>
                    <strong>₹{Number(previewBill.totalAmount || 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: '#059669', fontWeight: '700' }}>
                    <span>Paid Amount:</span>
                    <span>₹{Number(previewBill.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  {Number(previewBill.refundedAmount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: '#dc2626', fontWeight: '700' }}>
                      <span>Refunded Amount:</span>
                      <span>-₹{Number(previewBill.refundedAmount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================== MODAL PREVIEW: OP REGISTRATION SLIP DUPLICATE ======================== */}
      {previewReg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '880px',
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Modal Actions Bar */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={22} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a' }}>
                  Duplicate OP Registration Slip Preview &amp; Reprint
                </h3>
                <span className="badge badge-warning" style={{ fontWeight: '800' }}>DUPLICATE COPY</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => printLandscapeSlip('copy-op-reg-slip', `Duplicate OP Slip - ${previewReg.opNumber}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                >
                  <Printer size={16} /> Print Duplicate Slip
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPreviewReg(null)}
                >
                  <X size={16} /> Close
                </button>
              </div>
            </div>

            {/* Printable A5 Landscape OP Slip */}
            <div 
              id="copy-op-reg-slip"
              className="op-a5-print-card"
              style={{ 
                margin: '0 auto', 
                background: '#ffffff', 
                border: '2px solid #1e3a8a', 
                borderRadius: '8px', 
                padding: '16px 22px', 
                textAlign: 'left',
                position: 'relative'
              }}
            >
              {/* Duplicate Watermark / Ribbon Banner */}
              <div style={{ 
                background: '#fef3c7', 
                border: '1.5px dashed #d97706', 
                color: '#92400e', 
                textAlign: 'center', 
                padding: '5px 12px', 
                borderRadius: '4px', 
                fontWeight: '800', 
                fontSize: '0.85rem', 
                letterSpacing: '0.08em',
                marginBottom: '12px'
              }}>
                *** DUPLICATE OP REGISTRATION SLIP / REPRINT ***
                <span style={{ fontWeight: '500', fontSize: '0.74rem', marginLeft: '12px', color: '#78350f' }}>
                  Reprinted on: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} | By: {loggedUserName}
                </span>
              </div>

              {/* Hospital Header with Logo */}
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
                    Outpatient (OP) Registration Token Slip (Duplicate)
                  </div>
                </div>
              </div>

              {/* Date & Visit Type Subheader */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', padding: '5px 12px', borderRadius: '4px', marginBottom: '10px' }}>
                <span>
                  <strong>Original Date &amp; Time:</strong> {new Date(previewReg.registrationDate || Date.now()).toLocaleDateString('en-GB')} {new Date(previewReg.registrationDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
                <span><strong>Visit Type:</strong> {previewReg.visitType || 'OUTPATIENT'}</span>
              </div>

              {/* Landscape Two-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '10px 24px', fontSize: '0.84rem' }}>
                {/* Left Column: Demographics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>OP Token No:</span>
                    <strong style={{ color: '#2563eb', fontSize: '1.25rem', letterSpacing: '0.03em' }}>{previewReg.opNumber}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Patient ID:</span>
                    <strong style={{ color: '#0f172a', fontSize: '1.1rem', fontFamily: 'monospace' }}>{previewReg.patient?.mrn}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Patient Name:</span>
                    <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                      {previewReg.patient?.firstName} {previewReg.patient?.lastName} ({previewReg.patient?.age}y{previewReg.patient?.dob ? ` | DOB: ${previewReg.patient?.dob}` : ''} / {previewReg.patient?.gender})
                    </strong>
                  </div>

                  {previewReg.patient?.mobile && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                      <span style={{ color: '#64748b', fontWeight: '600' }}>Contact Mobile:</span>
                      <strong style={{ color: '#0f172a' }}>{previewReg.patient?.mobile}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Address / City:</span>
                    <span style={{ color: '#0f172a', textAlign: 'right', maxWidth: '240px' }}>
                      {previewReg.patient?.city ? previewReg.patient?.city?.cityName : ''} {previewReg.patient?.state ? `, ${previewReg.patient?.state?.stateName}` : ''}
                      {!previewReg.patient?.city && !previewReg.patient?.state ? (previewReg.patient?.residentialAddress || 'Melvisharam') : ''}
                    </span>
                  </div>
                </div>

                {/* Right Column: Doctor & Fee Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Consulting Doctor:</span>
                    <strong style={{ color: '#0f172a', fontSize: '1.02rem' }}>{previewReg.doctor?.doctorName}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Department:</span>
                    <strong style={{ color: '#0f172a' }}>{previewReg.department || previewReg.doctor?.department || 'General Medicine'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Category / Type:</span>
                    <span className="badge badge-primary">{previewReg.patientType || 'GENERAL'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Payment Mode:</span>
                    <strong className="badge badge-success">{previewReg.paymentType || 'CASH'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', background: '#ecfdf5', padding: '6px 10px', borderRadius: '4px' }}>
                    <span style={{ color: '#065f46', fontWeight: '700' }}>Consultation Fee:</span>
                    <strong style={{ color: '#059669', fontSize: '1.25rem' }}>₹{previewReg.consultationFee || 0}</strong>
                  </div>
                </div>
              </div>

              {/* Consultation Note & Footer */}
              <div style={{ marginTop: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', fontSize: '0.74rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  Please present this duplicate slip at the consultation desk. Valid for current visit only.
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Issued By:</strong> {previewReg.createdBy || loggedUserName}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
