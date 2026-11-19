import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import BackboneHeader from '../../components/reports/BackboneHeader';
import BackboneToolbar from '../../components/reports/BackboneToolbar';
import BackbonePagination from '../../components/reports/BackbonePagination';
import { 
  formatDateTime, 
  formatCurrency, 
  exportToCsv, 
  copyTableToClipboard,
  getTodayDateStr
} from '../../components/reports/reportUtils';
import '../../components/reports/BackboneReport.css';

export default function OpBillingReportPage() {
  const [bills, setBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [billNoFilter, setBillNoFilter] = useState('');
  const [patientNameFilter, setPatientNameFilter] = useState('');
  const [regNoFilter, setRegNoFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [doctorIdFilter, setDoctorIdFilter] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateStr());
  const [endDate, setEndDate] = useState(getTodayDateStr());

  // Table controls
  const [searchTerm, setSearchTerm] = useState('');
  const [pageLength, setPageLength] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'billDate', direction: 'desc' });
  const [collapsedFilters, setCollapsedFilters] = useState(false);

  const columns = [
    { key: 'sNo', label: 'S.NO', align: 'center' },
    { key: 'billNumber', label: 'BILL NO', align: 'center' },
    { key: 'billDate', label: 'BILL DATE', align: 'center' },
    { key: 'regNo', label: 'REG NO', align: 'center' },
    { key: 'patientName', label: 'PATIENT NAME', align: 'left' },
    { key: 'userName', label: 'USER NAME', align: 'center' },
    { key: 'billAmount', label: 'BILL AMOUNT', align: 'right' },
    { key: 'refundAmount', label: 'REFUND AMOUNT', align: 'right' },
    { key: 'concAmount', label: 'CONC AMOUNT', align: 'right' },
    { key: 'osAmount', label: 'OS AMOUNT', align: 'right' },
    { key: 'rcptAmount', label: 'RCPT AMOUNT', align: 'right' },
    { key: 'roundOff', label: 'ROUND OFF', align: 'right' },
  ];

  const fetchReport = async (overrideDates) => {
    try {
      setLoading(true);
      const sDate = overrideDates !== undefined ? overrideDates.startDate : startDate;
      const eDate = overrideDates !== undefined ? overrideDates.endDate : endDate;
      const params = {};
      if (sDate) params.startDate = sDate;
      if (eDate) params.endDate = eDate;
      if (doctorIdFilter) params.doctorId = doctorIdFilter;
      const res = await api.getOpBillingReport(params);
      setBills(res?.bills || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching OP Billing Report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const docs = await api.getDoctors();
        setDoctors(docs || []);
      } catch (err) {
        console.error(err);
      }
      const today = getTodayDateStr();
      fetchReport({ startDate: today, endDate: today });
    }
    init();
  }, []);

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    fetchReport();
  };

  const handleToday = () => {
    const today = getTodayDateStr();
    setStartDate(today);
    setEndDate(today);
    fetchReport({ startDate: today, endDate: today });
  };

  const handleAllDates = () => {
    setStartDate('');
    setEndDate('');
    fetchReport({ startDate: '', endDate: '' });
  };

  const handleReset = () => {
    const today = getTodayDateStr();
    setBillNoFilter('');
    setPatientNameFilter('');
    setRegNoFilter('');
    setUserFilter('');
    setDoctorIdFilter('');
    setStartDate(today);
    setEndDate(today);
    setSearchTerm('');
    fetchReport({ startDate: today, endDate: today });
  };

  // Transform and filter rows
  const processedRows = useMemo(() => {
    return bills.map(b => {
      const tot = b.totalAmount || 0;
      const pd = b.paidAmount || 0;
      const ref = b.refundedAmount || 0;
      const conc = b.discount || 0;
      const isPaid = (b.paymentStatus || '').toUpperCase() === 'PAID';
      const os = isPaid ? 0 : Math.max(0, tot - pd);
      const rcpt = Math.max(0, (pd || tot) - ref);
      const pName = b.patient ? `${b.patient.firstName || ''} ${b.patient.lastName || ''}`.trim() : '-';
      const mrn = b.patient?.mrn || '-';
      const user = b.createdId ? `User-${b.createdId}` : 'Admin';

      return {
        id: b.id,
        raw: b,
        billNumber: b.billNumber,
        billDate: b.billDate,
        billDateFormatted: formatDateTime(b.billDate),
        regNo: mrn,
        patientName: pName,
        userName: user,
        billAmount: tot,
        refundAmount: ref,
        concAmount: conc,
        osAmount: os,
        rcptAmount: rcpt,
        roundOff: 0.00,
      };
    });
  }, [bills]);

  // Client-side filtering (filter bar fields + live search)
  const filteredRows = useMemo(() => {
    return processedRows.filter(r => {
      if (billNoFilter && !r.billNumber.toLowerCase().includes(billNoFilter.toLowerCase().trim())) {
        return false;
      }
      if (patientNameFilter && !r.patientName.toLowerCase().includes(patientNameFilter.toLowerCase().trim())) {
        return false;
      }
      if (regNoFilter && !r.regNo.toLowerCase().includes(regNoFilter.toLowerCase().trim())) {
        return false;
      }
      if (userFilter && !r.userName.toLowerCase().includes(userFilter.toLowerCase().trim())) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matches = 
          r.billNumber.toLowerCase().includes(q) ||
          r.regNo.toLowerCase().includes(q) ||
          r.patientName.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          String(r.billAmount).includes(q) ||
          String(r.rcptAmount).includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [processedRows, billNoFilter, patientNameFilter, regNoFilter, userFilter, searchTerm]);

  // Sort rows
  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    if (sortConfig.key) {
      list.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [filteredRows, sortConfig]);

  // Pagination slice
  const paginatedRows = useMemo(() => {
    if (pageLength === 999999) return sortedRows;
    const start = (currentPage - 1) * pageLength;
    return sortedRows.slice(start, start + pageLength);
  }, [sortedRows, currentPage, pageLength]);

  // Grand Totals for active filtered dataset
  const totals = useMemo(() => {
    return filteredRows.reduce((acc, r) => ({
      billAmount: acc.billAmount + r.billAmount,
      refundAmount: acc.refundAmount + r.refundAmount,
      concAmount: acc.concAmount + r.concAmount,
      osAmount: acc.osAmount + r.osAmount,
      rcptAmount: acc.rcptAmount + r.rcptAmount,
      roundOff: acc.roundOff + r.roundOff,
    }), { billAmount: 0, refundAmount: 0, concAmount: 0, osAmount: 0, rcptAmount: 0, roundOff: 0 });
  }, [filteredRows]);

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleToggleColumn = (colKey) => {
    setHiddenColumns(prev => 
      prev.includes(colKey) ? prev.filter(k => k !== colKey) : [...prev, colKey]
    );
  };

  const handleCopy = async () => {
    const visibleCols = columns.filter(c => !hiddenColumns.includes(c.key));
    const rowsForExport = sortedRows.map((r, idx) => ({
      ...r,
      sNo: idx + 1,
      billDate: r.billDateFormatted,
    }));
    await copyTableToClipboard(visibleCols, rowsForExport);
  };

  const handleExcel = () => {
    const visibleCols = columns.filter(c => !hiddenColumns.includes(c.key));
    const rowsForExport = sortedRows.map((r, idx) => ({
      ...r,
      sNo: idx + 1,
      billDate: r.billDateFormatted,
    }));
    exportToCsv('OP_BILL_REPORT', visibleCols, rowsForExport);
  };

  return (
    <div className="bb-report-wrapper">
      <BackboneHeader 
        title="OP BILL REPORT" 
        collapsed={collapsedFilters}
        onToggleCollapse={() => setCollapsedFilters(!collapsedFilters)}
      />

      {/* Filter Section matching Image 5 */}
      {!collapsedFilters && (
        <form onSubmit={handleApplyFilter} className="bb-filter-container no-print">
          <div className="bb-filter-grid">
            <div className="bb-filter-group">
              <label className="bb-filter-label">BILL NO</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. 2026157128"
                value={billNoFilter}
                onChange={(e) => setBillNoFilter(e.target.value)}
              />
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">PATIENT NAME</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. Akifa"
                value={patientNameFilter}
                onChange={(e) => setPatientNameFilter(e.target.value)}
              />
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">REGISTER NO</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. 325327"
                value={regNoFilter}
                onChange={(e) => setRegNoFilter(e.target.value)}
              />
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">BILLED USER</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. admin"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">DOCTOR</label>
              <select 
                className="bb-filter-select"
                value={doctorIdFilter}
                onChange={(e) => setDoctorIdFilter(e.target.value)}
              >
                <option value="">ALL DOCTORS</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.doctorName}</option>
                ))}
              </select>
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">FROM DATE</label>
              <input 
                type="date" 
                className="bb-filter-input" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">TO DATE</label>
              <input 
                type="date" 
                className="bb-filter-input" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Bottom Action Bar: Date Badge & Controls */}
          <div className="bb-filter-bottom-bar">
            <div className="bb-date-badge" title="Active Date Range">
              📅 {startDate && endDate ? `${startDate} TO ${endDate}` : startDate ? `FROM ${startDate}` : endDate ? `UP TO ${endDate}` : 'ALL DATES'}
            </div>
            <div className="bb-filter-btn-group">
              <button type="submit" className="bb-btn-go" title="Search with selected filters">GO</button>
              <button type="button" className="bb-btn-today" onClick={handleToday} title="Show Today's Reports Only">TODAY</button>
              <button type="button" className="bb-btn-all" onClick={handleAllDates} title="Show All Dates / Historical">ALL DATES</button>
              <button type="button" className="bb-btn-reset" onClick={handleReset} title="Reset to Today">RESET</button>
            </div>
          </div>
        </form>
      )}

      {/* Action Toolbar */}
      <BackboneToolbar 
        onPrint={() => window.print()}
        onCopy={handleCopy}
        onExcel={handleExcel}
        columns={columns}
        hiddenColumns={hiddenColumns}
        onToggleColumn={handleToggleColumn}
        pageLength={pageLength}
        onChangePageLength={(len) => { setPageLength(len); setCurrentPage(1); }}
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
      />

      {/* BackBone Table */}
      <div className="bb-table-responsive">
        <table className="bb-data-table">
          <thead>
            <tr>
              {columns.filter(c => !hiddenColumns.includes(c.key)).map(col => (
                <th 
                  key={col.key} 
                  className={`sortable ${col.align ? `align-${col.align}` : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  <span className="sort-icon">
                    {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="bb-no-data">Loading OP Billing Report records...</td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="bb-no-data">No records match the selected report criteria.</td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const sNo = (currentPage - 1) * (pageLength === 999999 ? filteredRows.length : pageLength) + idx + 1;
                return (
                  <tr key={row.id}>
                    {!hiddenColumns.includes('sNo') && <td className="align-center">{sNo}</td>}
                    {!hiddenColumns.includes('billNumber') && <td className="align-center"><strong>{row.billNumber}</strong></td>}
                    {!hiddenColumns.includes('billDate') && <td className="align-center">{row.billDateFormatted}</td>}
                    {!hiddenColumns.includes('regNo') && <td className="align-center"><code>{row.regNo}</code></td>}
                    {!hiddenColumns.includes('patientName') && <td><strong>{row.patientName}</strong></td>}
                    {!hiddenColumns.includes('userName') && <td className="align-center">{row.userName}</td>}
                    {!hiddenColumns.includes('billAmount') && <td className="align-right">₹{formatCurrency(row.billAmount)}</td>}
                    {!hiddenColumns.includes('refundAmount') && <td className="align-right" style={{ color: row.refundAmount > 0 ? '#dc2626' : 'inherit' }}>₹{formatCurrency(row.refundAmount)}</td>}
                    {!hiddenColumns.includes('concAmount') && <td className="align-right" style={{ color: row.concAmount > 0 ? '#b45309' : 'inherit' }}>₹{formatCurrency(row.concAmount)}</td>}
                    {!hiddenColumns.includes('osAmount') && <td className="align-right" style={{ color: row.osAmount > 0 ? '#dc2626' : 'inherit' }}>₹{formatCurrency(row.osAmount)}</td>}
                    {!hiddenColumns.includes('rcptAmount') && <td className="align-right" style={{ color: '#15803d', fontWeight: '700' }}>₹{formatCurrency(row.rcptAmount)}</td>}
                    {!hiddenColumns.includes('roundOff') && <td className="align-right">₹{formatCurrency(row.roundOff)}</td>}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* TOTAL Row matching Image 5 */}
          {filteredRows.length > 0 && (
            <tfoot>
              <tr>
                {!hiddenColumns.includes('sNo') && <td colSpan="6"><strong>TOTAL</strong></td>}
                {hiddenColumns.includes('sNo') && <td colSpan="5"><strong>TOTAL</strong></td>}
                {!hiddenColumns.includes('billAmount') && <td className="align-right">₹{formatCurrency(totals.billAmount)}</td>}
                {!hiddenColumns.includes('refundAmount') && <td className="align-right">₹{formatCurrency(totals.refundAmount)}</td>}
                {!hiddenColumns.includes('concAmount') && <td className="align-right">₹{formatCurrency(totals.concAmount)}</td>}
                {!hiddenColumns.includes('osAmount') && <td className="align-right" style={{ color: totals.osAmount > 0 ? '#dc2626' : 'inherit' }}>₹{formatCurrency(totals.osAmount)}</td>}
                {!hiddenColumns.includes('rcptAmount') && <td className="align-right" style={{ color: '#15803d' }}>₹{formatCurrency(totals.rcptAmount)}</td>}
                {!hiddenColumns.includes('roundOff') && <td className="align-right">₹{formatCurrency(totals.roundOff)}</td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <BackbonePagination 
        totalItems={filteredRows.length}
        pageLength={pageLength}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
