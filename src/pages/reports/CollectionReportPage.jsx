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

export default function CollectionReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters matching Image 4 & 7
  const [reportType, setReportType] = useState('DETAIL'); // 'DETAIL' or 'SUMMARY'
  const [regNoFilter, setRegNoFilter] = useState('');
  const [payModeFilter, setPayModeFilter] = useState('');
  const [collectionTypeFilter, setCollectionTypeFilter] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateStr());
  const [endDate, setEndDate] = useState(getTodayDateStr());

  // Table controls
  const [searchTerm, setSearchTerm] = useState('');
  const [pageLength, setPageLength] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [collapsedFilters, setCollapsedFilters] = useState(false);

  // Columns for DETAIL View (Image 7)
  const detailColumns = [
    { key: 'sNo', label: 'S.NO', align: 'center' },
    { key: 'patientName', label: 'PATIENT NAME', align: 'left' },
    { key: 'regNumber', label: 'REG NUMBER', align: 'center' },
    { key: 'billType', label: 'BILL TYPE', align: 'center' },
    { key: 'ipNumber', label: 'IP NUMBER', align: 'center' },
    { key: 'billNumber', label: 'BILL NUMBER', align: 'center' },
    { key: 'date', label: 'DATE', align: 'center' },
    { key: 'receiptNumber', label: 'RECEIPT NUMBER', align: 'center' },
    { key: 'userName', label: 'USER NAME', align: 'center' },
    { key: 'payMode', label: 'PAY MODE', align: 'center' },
    { key: 'paymodeNumber', label: 'PAYMODE NUMBER', align: 'center' },
    { key: 'collectionType', label: 'COLLECTION TYPE', align: 'center' },
    { key: 'fromBank', label: 'FROM BANK', align: 'center' },
    { key: 'toBank', label: 'TO BANK', align: 'center' },
    { key: 'receiptAmount', label: 'RECEIPT AMOUNT', align: 'right' },
    { key: 'storeName', label: 'STORE NAME', align: 'left' },
  ];

  // Columns for SUMMARY View (Image 4)
  const summaryColumns = [
    { key: 'sNo', label: 'S.NO', align: 'center' },
    { key: 'collectionType', label: 'COLLECTION TYPE', align: 'left' },
    { key: 'cash', label: 'CASH', align: 'right' },
    { key: 'cheque', label: 'CHEQUE', align: 'right' },
    { key: 'card', label: 'CARD', align: 'right' },
    { key: 'demandDraft', label: 'DEMAND DRAFT', align: 'right' },
    { key: 'eft', label: 'EFT', align: 'right' },
    { key: 'upi', label: 'UPI', align: 'right' },
    { key: 'total', label: 'TOTAL', align: 'right' },
  ];

  const fetchCollection = async (overrideDates) => {
    try {
      setLoading(true);
      const sDate = overrideDates !== undefined ? overrideDates.startDate : startDate;
      const eDate = overrideDates !== undefined ? overrideDates.endDate : endDate;
      const params = {};
      if (sDate) params.startDate = sDate;
      if (eDate) params.endDate = eDate;
      if (payModeFilter) params.paymentType = payModeFilter;
      if (collectionTypeFilter) params.collectionType = collectionTypeFilter;
      const res = await api.getCollectionReport(params);
      setData(res);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching collection report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = getTodayDateStr();
    fetchCollection({ startDate: today, endDate: today });
  }, []);

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    fetchCollection();
  };

  const handleToday = () => {
    const today = getTodayDateStr();
    setStartDate(today);
    setEndDate(today);
    fetchCollection({ startDate: today, endDate: today });
  };

  const handleAllDates = () => {
    setStartDate('');
    setEndDate('');
    fetchCollection({ startDate: '', endDate: '' });
  };

  const handleReset = () => {
    const today = getTodayDateStr();
    setRegNoFilter('');
    setPayModeFilter('');
    setCollectionTypeFilter('');
    setStartDate(today);
    setEndDate(today);
    setSearchTerm('');
    fetchCollection({ startDate: today, endDate: today });
  };

  // Raw details
  const detailRows = useMemo(() => {
    if (!data?.details) return [];
    return data.details.map(d => ({
      ...d,
      dateFormatted: formatDateTime(d.date),
    }));
  }, [data?.details]);

  // Client filtering on details
  const filteredDetailRows = useMemo(() => {
    return detailRows.filter(r => {
      if (regNoFilter && !r.regNumber.toLowerCase().includes(regNoFilter.toLowerCase().trim())) {
        return false;
      }
      if (payModeFilter && r.payMode.toUpperCase() !== payModeFilter.toUpperCase()) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matches = 
          r.patientName.toLowerCase().includes(q) ||
          r.regNumber.toLowerCase().includes(q) ||
          r.billNumber.toLowerCase().includes(q) ||
          r.receiptNumber.toLowerCase().includes(q) ||
          r.payMode.toLowerCase().includes(q) ||
          String(r.receiptAmount).includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [detailRows, regNoFilter, payModeFilter, searchTerm]);

  // Sorted details
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

  // Paginated details
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
    exportToCsv(`COLLECTION_REPORT_${reportType}`, visibleCols, rowsForExport);
  };

  const totalReceiptAmount = filteredDetailRows.reduce((sum, r) => sum + r.receiptAmount, 0);

  return (
    <div className="bb-report-wrapper">
      <BackboneHeader 
        title="COLLECTION REPORT" 
        collapsed={collapsedFilters}
        onToggleCollapse={() => setCollapsedFilters(!collapsedFilters)}
      />

      {/* Filter Section matching Image 4 & 7 */}
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
              <label className="bb-filter-label">REGISTER NO</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. 189687"
                value={regNoFilter}
                onChange={(e) => setRegNoFilter(e.target.value)}
              />
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">PAY MODE</label>
              <select 
                className="bb-filter-select"
                value={payModeFilter}
                onChange={(e) => setPayModeFilter(e.target.value)}
              >
                <option value="">ALL PAY MODES</option>
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">CARD</option>
                <option value="INSURANCE">INSURANCE</option>
              </select>
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">COLLECTION TYPE</label>
              <select 
                className="bb-filter-select"
                value={collectionTypeFilter}
                onChange={(e) => setCollectionTypeFilter(e.target.value)}
              >
                <option value="">ALL COLLECTIONS</option>
                <option value="BILL COLLECTION">BILL COLLECTION</option>
                <option value="ADVANCE COLLECTION">ADVANCE COLLECTION</option>
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

      {/* BackBone Table: SUMMARY VIEW (Image 4) */}
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
                  <td colSpan={summaryColumns.length} className="bb-no-data">Loading Collection summary...</td>
                </tr>
              ) : summaryRows.length === 0 ? (
                <tr>
                  <td colSpan={summaryColumns.length} className="bb-no-data">No collection summary data found.</td>
                </tr>
              ) : (
                summaryRows.map((r, idx) => (
                  <tr key={idx}>
                    {!hiddenColumns.includes('sNo') && <td className="align-center">{idx + 1}</td>}
                    {!hiddenColumns.includes('collectionType') && <td><strong>{r.collectionType}</strong></td>}
                    {!hiddenColumns.includes('cash') && <td className="align-right">₹{formatCurrency(r.cash)}</td>}
                    {!hiddenColumns.includes('cheque') && <td className="align-right">₹{formatCurrency(r.cheque)}</td>}
                    {!hiddenColumns.includes('card') && <td className="align-right">₹{formatCurrency(r.card)}</td>}
                    {!hiddenColumns.includes('demandDraft') && <td className="align-right">₹{formatCurrency(r.demandDraft)}</td>}
                    {!hiddenColumns.includes('eft') && <td className="align-right">₹{formatCurrency(r.eft)}</td>}
                    {!hiddenColumns.includes('upi') && <td className="align-right">₹{formatCurrency(r.upi)}</td>}
                    {!hiddenColumns.includes('total') && <td className="align-right" style={{ fontWeight: '700', color: '#15803d' }}>₹{formatCurrency(r.total)}</td>}
                  </tr>
                ))
              )}
            </tbody>
            {summaryRows.length > 0 && (
              <tfoot>
                <tr>
                  {!hiddenColumns.includes('sNo') && <td></td>}
                  {!hiddenColumns.includes('collectionType') && <td><strong>TOTAL</strong></td>}
                  {!hiddenColumns.includes('cash') && <td className="align-right">₹{formatCurrency(data?.totalCash)}</td>}
                  {!hiddenColumns.includes('cheque') && <td className="align-right">₹{formatCurrency(data?.totalCheque)}</td>}
                  {!hiddenColumns.includes('card') && <td className="align-right">₹{formatCurrency(data?.totalCard)}</td>}
                  {!hiddenColumns.includes('demandDraft') && <td className="align-right">₹0.00</td>}
                  {!hiddenColumns.includes('eft') && <td className="align-right">₹0.00</td>}
                  {!hiddenColumns.includes('upi') && <td className="align-right">₹{formatCurrency(data?.totalUpi)}</td>}
                  {!hiddenColumns.includes('total') && <td className="align-right" style={{ color: '#15803d' }}>₹{formatCurrency(data?.totalAmount)}</td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* BackBone Table: DETAIL VIEW (Image 7) */}
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
                  <td colSpan={detailColumns.length} className="bb-no-data">Loading Collection detail records...</td>
                </tr>
              ) : paginatedDetailRows.length === 0 ? (
                <tr>
                  <td colSpan={detailColumns.length} className="bb-no-data">No collection records found matching filters.</td>
                </tr>
              ) : (
                paginatedDetailRows.map((r, idx) => {
                  const sNo = (currentPage - 1) * (pageLength === 999999 ? filteredDetailRows.length : pageLength) + idx + 1;
                  return (
                    <tr key={idx}>
                      {!hiddenColumns.includes('sNo') && <td className="align-center">{sNo}</td>}
                      {!hiddenColumns.includes('patientName') && <td><strong>{r.patientName}</strong></td>}
                      {!hiddenColumns.includes('regNumber') && <td className="align-center"><code>{r.regNumber}</code></td>}
                      {!hiddenColumns.includes('billType') && <td className="align-center">{r.billType}</td>}
                      {!hiddenColumns.includes('ipNumber') && <td className="align-center">{r.ipNumber}</td>}
                      {!hiddenColumns.includes('billNumber') && <td className="align-center"><strong>{r.billNumber}</strong></td>}
                      {!hiddenColumns.includes('date') && <td className="align-center">{r.dateFormatted}</td>}
                      {!hiddenColumns.includes('receiptNumber') && <td className="align-center">{r.receiptNumber}</td>}
                      {!hiddenColumns.includes('userName') && <td className="align-center">{r.userName}</td>}
                      {!hiddenColumns.includes('payMode') && (
                        <td className="align-center">
                          <span className={`bb-badge ${r.payMode.toLowerCase()}`}>
                            {r.payMode}
                          </span>
                        </td>
                      )}
                      {!hiddenColumns.includes('paymodeNumber') && <td className="align-center">{r.paymodeNumber}</td>}
                      {!hiddenColumns.includes('collectionType') && <td className="align-center">{r.collectionType}</td>}
                      {!hiddenColumns.includes('fromBank') && <td className="align-center">{r.fromBank}</td>}
                      {!hiddenColumns.includes('toBank') && <td className="align-center">{r.toBank}</td>}
                      {!hiddenColumns.includes('receiptAmount') && <td className="align-right" style={{ color: '#15803d', fontWeight: '700' }}>₹{formatCurrency(r.receiptAmount)}</td>}
                      {!hiddenColumns.includes('storeName') && <td>{r.storeName}</td>}
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredDetailRows.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="14"><strong>TOTAL COLLECTION</strong></td>
                  <td className="align-right" style={{ color: '#15803d' }}><strong>₹{formatCurrency(totalReceiptAmount)}</strong></td>
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
