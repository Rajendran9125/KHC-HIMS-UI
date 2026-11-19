import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import BackboneHeader from '../../components/reports/BackboneHeader';
import BackboneToolbar from '../../components/reports/BackboneToolbar';
import BackbonePagination from '../../components/reports/BackbonePagination';
import { 
  formatCurrency, 
  exportToCsv, 
  copyTableToClipboard,
  getTodayDateStr
} from '../../components/reports/reportUtils';
import '../../components/reports/BackboneReport.css';

export default function RevenueReportPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters matching Image 2
  const [reportType, setReportType] = useState('SUMMARY'); // SUMMARY or DETAIL
  const [revenueType, setRevenueType] = useState('HEADER'); // HEADER or SERVICE
  const [headerFilter, setHeaderFilter] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateStr());
  const [endDate, setEndDate] = useState(getTodayDateStr());

  // Table controls
  const [searchTerm, setSearchTerm] = useState('');
  const [pageLength, setPageLength] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'header', direction: 'asc' });
  const [collapsedFilters, setCollapsedFilters] = useState(false);

  const columns = [
    { key: 'sNo', label: 'S.NO', align: 'center' },
    { key: 'header', label: 'HEADER', align: 'left' },
    { key: 'qty', label: 'QTY', align: 'center' },
    { key: 'billAmount', label: 'BILL AMOUNT', align: 'right' },
    { key: 'taxAmount', label: 'TAX AMOUNT', align: 'right' },
    { key: 'billTotal', label: 'BILL TOTAL', align: 'right' },
    { key: 'concessionAmount', label: 'CONCESSION AMOUNT', align: 'right' },
    { key: 'netAmount', label: 'NET AMOUNT', align: 'right' },
  ];

  const fetchRevenue = async (overrideDates) => {
    try {
      setLoading(true);
      const sDate = overrideDates !== undefined ? overrideDates.startDate : startDate;
      const eDate = overrideDates !== undefined ? overrideDates.endDate : endDate;
      const params = {};
      if (sDate) params.startDate = sDate;
      if (eDate) params.endDate = eDate;
      const res = await api.getRevenueReport(params);
      setReportData(res);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching revenue report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = getTodayDateStr();
    fetchRevenue({ startDate: today, endDate: today });
  }, []);

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    fetchRevenue();
  };

  const handleToday = () => {
    const today = getTodayDateStr();
    setStartDate(today);
    setEndDate(today);
    fetchRevenue({ startDate: today, endDate: today });
  };

  const handleAllDates = () => {
    setStartDate('');
    setEndDate('');
    fetchRevenue({ startDate: '', endDate: '' });
  };

  const handleReset = () => {
    const today = getTodayDateStr();
    setHeaderFilter('');
    setBillTypeFilter('');
    setStartDate(today);
    setEndDate(today);
    setSearchTerm('');
    fetchRevenue({ startDate: today, endDate: today });
  };

  const rows = useMemo(() => {
    if (!reportData?.headerRows) return [];
    return reportData.headerRows;
  }, [reportData]);

  // Client-side filtering
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (headerFilter && !r.header.toLowerCase().includes(headerFilter.toLowerCase().trim())) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matches = 
          r.header.toLowerCase().includes(q) ||
          String(r.qty).includes(q) ||
          String(r.billAmount).includes(q) ||
          String(r.netAmount).includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [rows, headerFilter, searchTerm]);

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

  // Pagination
  const paginatedRows = useMemo(() => {
    if (pageLength === 999999) return sortedRows;
    const start = (currentPage - 1) * pageLength;
    return sortedRows.slice(start, start + pageLength);
  }, [sortedRows, currentPage, pageLength]);

  // Dynamic Grand Totals based on filtered rows
  const totals = useMemo(() => {
    return filteredRows.reduce((acc, r) => ({
      qty: acc.qty + (r.qty || 0),
      billAmount: acc.billAmount + (r.billAmount || 0),
      taxAmount: acc.taxAmount + (r.taxAmount || 0),
      billTotal: acc.billTotal + (r.billTotal || 0),
      concessionAmount: acc.concessionAmount + (r.concessionAmount || 0),
      netAmount: acc.netAmount + (r.netAmount || 0),
    }), { qty: 0, billAmount: 0, taxAmount: 0, billTotal: 0, concessionAmount: 0, netAmount: 0 });
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
    }));
    await copyTableToClipboard(visibleCols, rowsForExport);
  };

  const handleExcel = () => {
    const visibleCols = columns.filter(c => !hiddenColumns.includes(c.key));
    const rowsForExport = sortedRows.map((r, idx) => ({
      ...r,
      sNo: idx + 1,
    }));
    exportToCsv('REVENUE_REPORT_SUMMARY', visibleCols, rowsForExport);
  };

  return (
    <div className="bb-report-wrapper">
      <BackboneHeader 
        title="REVENUE REPORT" 
        collapsed={collapsedFilters}
        onToggleCollapse={() => setCollapsedFilters(!collapsedFilters)}
      />

      {/* Filter Section matching Image 2 */}
      {!collapsedFilters && (
        <form onSubmit={handleApplyFilter} className="bb-filter-container no-print">
          <div className="bb-filter-grid">
            <div className="bb-filter-group">
              <label className="bb-filter-label">REPORT TYPE</label>
              <select 
                className="bb-filter-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="SUMMARY">SUMMARY</option>
                <option value="DETAIL">DETAIL</option>
              </select>
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">REVENUE TYPE</label>
              <select 
                className="bb-filter-select"
                value={revenueType}
                onChange={(e) => setRevenueType(e.target.value)}
              >
                <option value="HEADER">HEADER</option>
                <option value="SERVICE">SERVICE</option>
              </select>
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">HEADERS</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. Biochemistry"
                value={headerFilter}
                onChange={(e) => setHeaderFilter(e.target.value)}
              />
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">BILL TYPE</label>
              <select 
                className="bb-filter-select"
                value={billTypeFilter}
                onChange={(e) => setBillTypeFilter(e.target.value)}
              >
                <option value="">NOTHING SELECTED</option>
                <option value="OP">OP</option>
                <option value="PHARMACY">PHARMACY</option>
                <option value="IP">IP</option>
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

      {/* BackBone Table matching Image 2 */}
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
                <td colSpan={columns.length} className="bb-no-data">Loading Revenue Report header metrics...</td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="bb-no-data">No diagnostic or service billing data found for selected period.</td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const sNo = (currentPage - 1) * (pageLength === 999999 ? filteredRows.length : pageLength) + idx + 1;
                return (
                  <tr key={row.header}>
                    {!hiddenColumns.includes('sNo') && <td className="align-center">{sNo}</td>}
                    {!hiddenColumns.includes('header') && <td><strong>{row.header}</strong></td>}
                    {!hiddenColumns.includes('qty') && <td className="align-center">{row.qty}</td>}
                    {!hiddenColumns.includes('billAmount') && <td className="align-right">₹{formatCurrency(row.billAmount)}</td>}
                    {!hiddenColumns.includes('taxAmount') && <td className="align-right">₹{formatCurrency(row.taxAmount)}</td>}
                    {!hiddenColumns.includes('billTotal') && <td className="align-right">₹{formatCurrency(row.billTotal)}</td>}
                    {!hiddenColumns.includes('concessionAmount') && <td className="align-right" style={{ color: row.concessionAmount > 0 ? '#b45309' : 'inherit' }}>₹{formatCurrency(row.concessionAmount)}</td>}
                    {!hiddenColumns.includes('netAmount') && <td className="align-right" style={{ color: '#15803d', fontWeight: '700' }}>₹{formatCurrency(row.netAmount)}</td>}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Grand TOTAL Row matching Image 2 */}
          {filteredRows.length > 0 && (
            <tfoot>
              <tr>
                {!hiddenColumns.includes('sNo') && <td></td>}
                {!hiddenColumns.includes('header') && <td><strong>TOTAL</strong></td>}
                {!hiddenColumns.includes('qty') && <td className="align-center"><strong>{totals.qty}</strong></td>}
                {!hiddenColumns.includes('billAmount') && <td className="align-right">₹{formatCurrency(totals.billAmount)}</td>}
                {!hiddenColumns.includes('taxAmount') && <td className="align-right">₹{formatCurrency(totals.taxAmount)}</td>}
                {!hiddenColumns.includes('billTotal') && <td className="align-right">₹{formatCurrency(totals.billTotal)}</td>}
                {!hiddenColumns.includes('concessionAmount') && <td className="align-right">₹{formatCurrency(totals.concessionAmount)}</td>}
                {!hiddenColumns.includes('netAmount') && <td className="align-right" style={{ color: '#15803d' }}>₹{formatCurrency(totals.netAmount)}</td>}
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
