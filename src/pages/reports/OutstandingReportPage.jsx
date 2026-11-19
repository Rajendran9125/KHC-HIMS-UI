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

export default function OutstandingReportPage() {
  const [data, setData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters matching Image 1 & 3
  const [reportType, setReportType] = useState('DETAIL'); // 'DETAIL' or 'SUMMARY'
  const [regNoFilter, setRegNoFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [doctorIdFilter, setDoctorIdFilter] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateStr());
  const [endDate, setEndDate] = useState(getTodayDateStr());

  // Table controls
  const [searchTerm, setSearchTerm] = useState('');
  const [pageLength, setPageLength] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'outstandingDate', direction: 'desc' });
  const [collapsedFilters, setCollapsedFilters] = useState(false);

  // Columns for DETAIL View (Image 3)
  const detailColumns = [
    { key: 'sNo', label: 'S.NO', align: 'center' },
    { key: 'billType', label: 'BILL TYPE', align: 'center' },
    { key: 'patientName', label: 'PATIENT NAME', align: 'left' },
    { key: 'regNumber', label: 'REG NUMBER', align: 'center' },
    { key: 'ipNumber', label: 'IP NUMBER', align: 'center' },
    { key: 'admissionDate', label: 'ADMISSION DATE', align: 'center' },
    { key: 'corpRefNo', label: 'CORP REF NO', align: 'center' },
    { key: 'billNumber', label: 'BILL NUMBER', align: 'center' },
    { key: 'outstandingDate', label: 'OUTSTANDING DATE', align: 'center' },
    { key: 'userName', label: 'USER NAME', align: 'center' },
    { key: 'membershipId', label: 'MEMBERSHIP ID', align: 'center' },
    { key: 'source', label: 'SOURCE', align: 'center' },
    { key: 'sourceName', label: 'SOURCE NAME', align: 'left' },
    { key: 'doctorName', label: 'DOCTOR NAME', align: 'left' },
    { key: 'billAmount', label: 'BILL AMOUNT', align: 'right' },
    { key: 'outstandingAmount', label: 'OUTSTANDING AMOUNT', align: 'right' },
    { key: 'balanceAmount', label: 'BALANCE AMOUNT', align: 'right' },
    { key: 'remarks', label: 'BILL / OS REMARKS', align: 'left' },
  ];

  // Columns for SUMMARY View (Image 1)
  const summaryColumns = [
    { key: 'sNo', label: 'S.NO', align: 'center' },
    { key: 'source', label: 'SOURCE', align: 'left' },
    { key: 'outstandingAmount', label: 'OUTSTANDING AMOUNT', align: 'right' },
    { key: 'balanceAmount', label: 'BALANCE AMOUNT', align: 'right' },
  ];

  const fetchOutstanding = async (overrideDates) => {
    try {
      setLoading(true);
      const sDate = overrideDates !== undefined ? overrideDates.startDate : startDate;
      const eDate = overrideDates !== undefined ? overrideDates.endDate : endDate;
      const params = {};
      if (sDate) params.startDate = sDate;
      if (eDate) params.endDate = eDate;
      if (sourceFilter) params.source = sourceFilter;
      if (doctorIdFilter) params.doctorId = doctorIdFilter;
      const res = await api.getOutstandingReport(params);
      setData(res);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching outstanding report:', err);
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
      fetchOutstanding({ startDate: today, endDate: today });
    }
    init();
  }, []);

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    fetchOutstanding();
  };

  const handleToday = () => {
    const today = getTodayDateStr();
    setStartDate(today);
    setEndDate(today);
    fetchOutstanding({ startDate: today, endDate: today });
  };

  const handleAllDates = () => {
    setStartDate('');
    setEndDate('');
    fetchOutstanding({ startDate: '', endDate: '' });
  };

  const handleReset = () => {
    const today = getTodayDateStr();
    setRegNoFilter('');
    setSourceFilter('');
    setDoctorIdFilter('');
    setStartDate(today);
    setEndDate(today);
    setSearchTerm('');
    fetchOutstanding({ startDate: today, endDate: today });
  };

  // Detail rows
  const detailRows = useMemo(() => {
    if (!data?.details) return [];
    return data.details.map(d => ({
      ...d,
      dateFormatted: formatDateTime(d.outstandingDate),
    }));
  }, [data?.details]);

  // Client filtering
  const filteredDetailRows = useMemo(() => {
    return detailRows.filter(r => {
      if (regNoFilter && !r.regNumber.toLowerCase().includes(regNoFilter.toLowerCase().trim())) {
        return false;
      }
      if (sourceFilter && sourceFilter !== 'ALL' && r.source.toLowerCase() !== sourceFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matches = 
          r.patientName.toLowerCase().includes(q) ||
          r.regNumber.toLowerCase().includes(q) ||
          r.billNumber.toLowerCase().includes(q) ||
          r.doctorName.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q) ||
          r.sourceName.toLowerCase().includes(q) ||
          String(r.outstandingAmount).includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [detailRows, regNoFilter, sourceFilter, searchTerm]);

  // Sort
  const sortedDetailRows = useMemo(() => {
    const list = [...filteredDetailRows];
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
  }, [filteredDetailRows, sortConfig]);

  // Pagination
  const paginatedDetailRows = useMemo(() => {
    if (pageLength === 999999) return sortedDetailRows;
    const start = (currentPage - 1) * pageLength;
    return sortedDetailRows.slice(start, start + pageLength);
  }, [sortedDetailRows, currentPage, pageLength]);

  // Summary rows
  const summaryRows = useMemo(() => {
    if (!data?.summary) return [];
    return data.summary;
  }, [data?.summary]);

  const activeColumns = reportType === 'SUMMARY' ? summaryColumns : detailColumns;

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
    const visibleCols = activeColumns.filter(c => !hiddenColumns.includes(c.key));
    const targetRows = reportType === 'SUMMARY' ? summaryRows : sortedDetailRows;
    const rowsForExport = targetRows.map((r, idx) => ({
      ...r,
      sNo: idx + 1,
    }));
    await copyTableToClipboard(visibleCols, rowsForExport);
  };

  const handleExcel = () => {
    const visibleCols = activeColumns.filter(c => !hiddenColumns.includes(c.key));
    const targetRows = reportType === 'SUMMARY' ? summaryRows : sortedDetailRows;
    const rowsForExport = targetRows.map((r, idx) => ({
      ...r,
      sNo: idx + 1,
    }));
    exportToCsv(`OUTSTANDING_REPORT_${reportType}`, visibleCols, rowsForExport);
  };

  const totals = useMemo(() => {
    return filteredDetailRows.reduce((acc, r) => ({
      billAmount: acc.billAmount + (r.billAmount || 0),
      outstandingAmount: acc.outstandingAmount + (r.outstandingAmount || 0),
      balanceAmount: acc.balanceAmount + (r.balanceAmount || 0),
    }), { billAmount: 0, outstandingAmount: 0, balanceAmount: 0 });
  }, [filteredDetailRows]);

  return (
    <div className="bb-report-wrapper">
      <BackboneHeader 
        title="OUTSTANDING REPORT" 
        collapsed={collapsedFilters}
        onToggleCollapse={() => setCollapsedFilters(!collapsedFilters)}
      />

      {/* Filter Section matching Image 1 & 3 */}
      {!collapsedFilters && (
        <form onSubmit={handleApplyFilter} className="bb-filter-container no-print">
          <div className="bb-filter-grid">
            <div className="bb-filter-group">
              <label className="bb-filter-label">REPORT TYPE *</label>
              <select 
                className="bb-filter-select"
                value={reportType}
                onChange={(e) => { setReportType(e.target.value); setCurrentPage(1); }}
              >
                <option value="DETAIL">DETAIL</option>
                <option value="SUMMARY">SUMMARY</option>
              </select>
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">REG NUMBER</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. 112577"
                value={regNoFilter}
                onChange={(e) => setRegNoFilter(e.target.value)}
              />
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">SOURCE</label>
              <select 
                className="bb-filter-select"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="ALL">ALL SOURCES</option>
                <option value="Corporate">Corporate</option>
                <option value="General">General</option>
              </select>
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
        columns={activeColumns}
        hiddenColumns={hiddenColumns}
        onToggleColumn={handleToggleColumn}
        pageLength={pageLength}
        onChangePageLength={(len) => { setPageLength(len); setCurrentPage(1); }}
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
      />

      {/* SUMMARY VIEW (Image 1) */}
      {reportType === 'SUMMARY' && (
        <div className="bb-table-responsive">
          <table className="bb-data-table">
            <thead>
              <tr>
                {summaryColumns.filter(c => !hiddenColumns.includes(c.key)).map(col => (
                  <th key={col.key} className={col.align ? `align-${col.align}` : ''}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={summaryColumns.length} className="bb-no-data">Loading Outstanding summary...</td>
                </tr>
              ) : summaryRows.length === 0 ? (
                <tr>
                  <td colSpan={summaryColumns.length} className="bb-no-data">No outstanding dues recorded.</td>
                </tr>
              ) : (
                summaryRows.map((r, idx) => (
                  <tr key={idx}>
                    {!hiddenColumns.includes('sNo') && <td className="align-center">{idx + 1}</td>}
                    {!hiddenColumns.includes('source') && <td><strong>{r.source}</strong></td>}
                    {!hiddenColumns.includes('outstandingAmount') && <td className="align-right" style={{ color: '#dc2626', fontWeight: '700' }}>₹{formatCurrency(r.outstandingAmount)}</td>}
                    {!hiddenColumns.includes('balanceAmount') && <td className="align-right" style={{ color: '#dc2626', fontWeight: '700' }}>₹{formatCurrency(r.balanceAmount)}</td>}
                  </tr>
                ))
              )}
            </tbody>
            {summaryRows.length > 0 && (
              <tfoot>
                <tr>
                  {!hiddenColumns.includes('sNo') && <td></td>}
                  {!hiddenColumns.includes('source') && <td><strong>TOTAL</strong></td>}
                  {!hiddenColumns.includes('outstandingAmount') && <td className="align-right" style={{ color: '#dc2626' }}>₹{formatCurrency(data?.totalOutstandingAmount)}</td>}
                  {!hiddenColumns.includes('balanceAmount') && <td className="align-right" style={{ color: '#dc2626' }}>₹{formatCurrency(data?.totalBalanceAmount)}</td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* DETAIL VIEW (Image 3) */}
      {reportType === 'DETAIL' && (
        <div className="bb-table-responsive">
          <table className="bb-data-table">
            <thead>
              <tr>
                {detailColumns.filter(c => !hiddenColumns.includes(c.key)).map(col => (
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
                  <td colSpan={detailColumns.length} className="bb-no-data">Loading Outstanding detail bills...</td>
                </tr>
              ) : paginatedDetailRows.length === 0 ? (
                <tr>
                  <td colSpan={detailColumns.length} className="bb-no-data">No outstanding bills found matching filters.</td>
                </tr>
              ) : (
                paginatedDetailRows.map((r, idx) => {
                  const sNo = (currentPage - 1) * (pageLength === 999999 ? filteredDetailRows.length : pageLength) + idx + 1;
                  return (
                    <tr key={idx}>
                      {!hiddenColumns.includes('sNo') && <td className="align-center">{sNo}</td>}
                      {!hiddenColumns.includes('billType') && <td className="align-center">{r.billType}</td>}
                      {!hiddenColumns.includes('patientName') && <td><strong>{r.patientName}</strong></td>}
                      {!hiddenColumns.includes('regNumber') && <td className="align-center"><code>{r.regNumber}</code></td>}
                      {!hiddenColumns.includes('ipNumber') && <td className="align-center">{r.ipNumber}</td>}
                      {!hiddenColumns.includes('admissionDate') && <td className="align-center">{r.admissionDate}</td>}
                      {!hiddenColumns.includes('corpRefNo') && <td className="align-center">{r.corpRefNo}</td>}
                      {!hiddenColumns.includes('billNumber') && <td className="align-center"><strong>{r.billNumber}</strong></td>}
                      {!hiddenColumns.includes('outstandingDate') && <td className="align-center">{r.dateFormatted}</td>}
                      {!hiddenColumns.includes('userName') && <td className="align-center">{r.userName}</td>}
                      {!hiddenColumns.includes('membershipId') && <td className="align-center">{r.membershipId}</td>}
                      {!hiddenColumns.includes('source') && (
                        <td className="align-center">
                          <span className={`bb-badge ${r.source.toLowerCase()}`}>
                            {r.source}
                          </span>
                        </td>
                      )}
                      {!hiddenColumns.includes('sourceName') && <td>{r.sourceName}</td>}
                      {!hiddenColumns.includes('doctorName') && <td>{r.doctorName}</td>}
                      {!hiddenColumns.includes('billAmount') && <td className="align-right">₹{formatCurrency(r.billAmount)}</td>}
                      {!hiddenColumns.includes('outstandingAmount') && <td className="align-right" style={{ color: '#dc2626', fontWeight: '700' }}>₹{formatCurrency(r.outstandingAmount)}</td>}
                      {!hiddenColumns.includes('balanceAmount') && <td className="align-right" style={{ color: '#dc2626', fontWeight: '700' }}>₹{formatCurrency(r.balanceAmount)}</td>}
                      {!hiddenColumns.includes('remarks') && <td>{r.remarks}</td>}
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredDetailRows.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="14"><strong>TOTAL OUTSTANDING</strong></td>
                  <td className="align-right">₹{formatCurrency(totals.billAmount)}</td>
                  <td className="align-right" style={{ color: '#dc2626' }}>₹{formatCurrency(totals.outstandingAmount)}</td>
                  <td className="align-right" style={{ color: '#dc2626' }}>₹{formatCurrency(totals.balanceAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      <BackbonePagination 
        totalItems={reportType === 'SUMMARY' ? summaryRows.length : filteredDetailRows.length}
        pageLength={pageLength}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
