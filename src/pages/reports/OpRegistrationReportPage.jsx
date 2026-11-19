import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import BackboneHeader from '../../components/reports/BackboneHeader';
import BackboneToolbar from '../../components/reports/BackboneToolbar';
import BackbonePagination from '../../components/reports/BackbonePagination';
import { 
  formatDateTime, 
  formatAgeDetailed, 
  formatCurrency, 
  exportToCsv, 
  copyTableToClipboard,
  getTodayDateStr
} from '../../components/reports/reportUtils';
import '../../components/reports/BackboneReport.css';

export default function OpRegistrationReportPage() {
  const [registrations, setRegistrations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientTypes, setPatientTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters matching Image 6
  const [regNoFilter, setRegNoFilter] = useState('');
  const [patientNameFilter, setPatientNameFilter] = useState('');
  const [doctorIdFilter, setDoctorIdFilter] = useState('');
  const [visitTypeFilter, setVisitTypeFilter] = useState('');
  const [patientTypeFilter, setPatientTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateStr());
  const [endDate, setEndDate] = useState(getTodayDateStr());

  // Table controls
  const [searchTerm, setSearchTerm] = useState('');
  const [pageLength, setPageLength] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'registrationDate', direction: 'desc' });
  const [collapsedFilters, setCollapsedFilters] = useState(false);

  const columns = [
    { key: 'sNo', label: 'S.NO', align: 'center' },
    { key: 'regNo', label: 'REG NO', align: 'center' },
    { key: 'tokenNo', label: 'TOKEN NO', align: 'center' },
    { key: 'visitDate', label: 'VISIT DATE', align: 'center' },
    { key: 'visitType', label: 'VISIT TYPE', align: 'center' },
    { key: 'patientName', label: 'NAME', align: 'left' },
    { key: 'ageFormatted', label: 'AGE', align: 'center' },
    { key: 'gender', label: 'GENDER', align: 'center' },
    { key: 'department', label: 'DEPARTMENT', align: 'left' },
    { key: 'doctorName', label: 'DOCTOR', align: 'left' },
    { key: 'mobile', label: 'MOBILE', align: 'center' },
    { key: 'address', label: 'ADDRESS', align: 'left' },
    { key: 'email', label: 'EMAIL', align: 'left' },
    { key: 'caseType', label: 'CASETYPE', align: 'center' },
    { key: 'billStatus', label: 'BILLSTATUS', align: 'center' },
    { key: 'patientType', label: 'PATIENT TYPE', align: 'center' },
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
      if (visitTypeFilter) params.visitType = visitTypeFilter;
      const res = await api.getOpRegistrationReport(params);
      setRegistrations(res?.registrations || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching OP Registration Report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const [docs, pTypes] = await Promise.all([
          api.getDoctors(),
          api.getPatientTypes(),
        ]);
        setDoctors(docs || []);
        setPatientTypes(pTypes || []);
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
    setRegNoFilter('');
    setPatientNameFilter('');
    setDoctorIdFilter('');
    setVisitTypeFilter('');
    setPatientTypeFilter('');
    setDepartmentFilter('');
    setStartDate(today);
    setEndDate(today);
    setSearchTerm('');
    fetchReport({ startDate: today, endDate: today });
  };

  // Transform rows matching Image 6
  const processedRows = useMemo(() => {
    return registrations.map(r => {
      const p = r.patient || {};
      const d = r.doctor || {};
      const pName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || '-';
      const ageStr = formatAgeDetailed(p.dob, p.age);
      const dept = r.department || d.department || 'General';
      const addr = r.residentialAddress || p.address || '-';
      const caseType = r.remarks || 'General';
      const pType = r.patientType || 'General';

      return {
        id: r.id,
        raw: r,
        regNo: p.mrn || '-',
        tokenNo: r.opNumber || '-',
        visitDate: r.registrationDate,
        visitDateFormatted: formatDateTime(r.registrationDate),
        visitType: r.visitType || 'NEW',
        patientName: pName,
        ageFormatted: ageStr,
        gender: (p.gender || '-').toUpperCase(),
        department: dept,
        doctorName: d.doctorName || '-',
        mobile: p.mobile || '-',
        address: addr,
        email: p.email || '-',
        caseType: caseType,
        billStatus: r.status || 'WAITING',
        patientType: pType,
        consultationFee: r.consultationFee || 0,
      };
    });
  }, [registrations]);

  // Client-side filtering
  const filteredRows = useMemo(() => {
    return processedRows.filter(r => {
      if (regNoFilter && !r.regNo.toLowerCase().includes(regNoFilter.toLowerCase().trim())) {
        return false;
      }
      if (patientNameFilter && !r.patientName.toLowerCase().includes(patientNameFilter.toLowerCase().trim())) {
        return false;
      }
      if (visitTypeFilter && visitTypeFilter !== 'ALL' && r.visitType !== visitTypeFilter) {
        return false;
      }
      if (patientTypeFilter && patientTypeFilter !== 'ALL' && r.patientType.toLowerCase() !== patientTypeFilter.toLowerCase()) {
        return false;
      }
      if (departmentFilter && !r.department.toLowerCase().includes(departmentFilter.toLowerCase().trim())) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matches = 
          r.regNo.toLowerCase().includes(q) ||
          r.tokenNo.toLowerCase().includes(q) ||
          r.patientName.toLowerCase().includes(q) ||
          r.doctorName.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.mobile.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.patientType.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [processedRows, regNoFilter, patientNameFilter, visitTypeFilter, patientTypeFilter, departmentFilter, searchTerm]);

  // Sorting
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
      visitDate: r.visitDateFormatted,
    }));
    await copyTableToClipboard(visibleCols, rowsForExport);
  };

  const handleExcel = () => {
    const visibleCols = columns.filter(c => !hiddenColumns.includes(c.key));
    const rowsForExport = sortedRows.map((r, idx) => ({
      ...r,
      sNo: idx + 1,
      visitDate: r.visitDateFormatted,
    }));
    exportToCsv('OP_REGISTRATION_REPORT', visibleCols, rowsForExport);
  };

  const newVisits = filteredRows.filter(r => r.visitType === 'NEW').length;
  const reviewVisits = filteredRows.filter(r => r.visitType === 'REVIEW').length;
  const totalFees = filteredRows.reduce((sum, r) => sum + r.consultationFee, 0);

  return (
    <div className="bb-report-wrapper">
      <BackboneHeader 
        title="OP REPORT" 
        collapsed={collapsedFilters}
        onToggleCollapse={() => setCollapsedFilters(!collapsedFilters)}
      />

      {/* Filter Section matching Image 6 */}
      {!collapsedFilters && (
        <form onSubmit={handleApplyFilter} className="bb-filter-container no-print">
          <div className="bb-filter-grid">
            <div className="bb-filter-group">
              <label className="bb-filter-label">REG NO</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. 225320"
                value={regNoFilter}
                onChange={(e) => setRegNoFilter(e.target.value)}
              />
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">PATIENT NAME</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. Parimala"
                value={patientNameFilter}
                onChange={(e) => setPatientNameFilter(e.target.value)}
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
              <label className="bb-filter-label">VISIT TYPE</label>
              <select 
                className="bb-filter-select"
                value={visitTypeFilter}
                onChange={(e) => setVisitTypeFilter(e.target.value)}
              >
                <option value="ALL">ALL VISITS</option>
                <option value="NEW">NEW</option>
                <option value="REVIEW">REVIEW</option>
              </select>
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">PATIENT TYPE</label>
              <select 
                className="bb-filter-select"
                value={patientTypeFilter}
                onChange={(e) => setPatientTypeFilter(e.target.value)}
              >
                <option value="ALL">ALL TYPES</option>
                <option value="General">General</option>
                <option value="Corporate">Corporate</option>
                <option value="Insurance">Insurance</option>
                {patientTypes.map(pt => (
                  <option key={pt.id} value={pt.typeName}>{pt.typeName}</option>
                ))}
              </select>
            </div>

            <div className="bb-filter-group">
              <label className="bb-filter-label">DEPARTMENT</label>
              <input 
                type="text" 
                className="bb-filter-input" 
                placeholder="e.g. Cardiology"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              />
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

      {/* BackBone Table matching Image 6 */}
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
                <td colSpan={columns.length} className="bb-no-data">Loading OP Report records...</td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="bb-no-data">No patient registration visits found matching filter criteria.</td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const sNo = (currentPage - 1) * (pageLength === 999999 ? filteredRows.length : pageLength) + idx + 1;
                return (
                  <tr key={row.id}>
                    {!hiddenColumns.includes('sNo') && <td className="align-center">{sNo}</td>}
                    {!hiddenColumns.includes('regNo') && <td className="align-center"><strong>{row.regNo}</strong></td>}
                    {!hiddenColumns.includes('tokenNo') && <td className="align-center"><code>{row.tokenNo}</code></td>}
                    {!hiddenColumns.includes('visitDate') && <td className="align-center">{row.visitDateFormatted}</td>}
                    {!hiddenColumns.includes('visitType') && (
                      <td className="align-center">
                        <span className={`bb-badge ${row.visitType === 'NEW' ? 'new' : 'review'}`}>
                          {row.visitType}
                        </span>
                      </td>
                    )}
                    {!hiddenColumns.includes('patientName') && <td><strong>{row.patientName}</strong></td>}
                    {!hiddenColumns.includes('ageFormatted') && <td className="align-center"><strong>{row.ageFormatted}</strong></td>}
                    {!hiddenColumns.includes('gender') && <td className="align-center">{row.gender}</td>}
                    {!hiddenColumns.includes('department') && <td>{row.department}</td>}
                    {!hiddenColumns.includes('doctorName') && <td>{row.doctorName}</td>}
                    {!hiddenColumns.includes('mobile') && <td className="align-center">{row.mobile}</td>}
                    {!hiddenColumns.includes('address') && <td>{row.address}</td>}
                    {!hiddenColumns.includes('email') && <td>{row.email}</td>}
                    {!hiddenColumns.includes('caseType') && <td className="align-center">{row.caseType}</td>}
                    {!hiddenColumns.includes('billStatus') && (
                      <td className="align-center">
                        <span className={`bb-badge ${row.billStatus === 'BILLED' ? 'billed' : 'waiting'}`}>
                          {row.billStatus}
                        </span>
                      </td>
                    )}
                    {!hiddenColumns.includes('patientType') && (
                      <td className="align-center">
                        <span className={`bb-badge ${row.patientType.toLowerCase().includes('corp') ? 'corporate' : 'general'}`}>
                          {row.patientType}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Footer Totals */}
          {filteredRows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={columns.filter(c => !hiddenColumns.includes(c.key)).length}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>TOTAL VISITS: {filteredRows.length}</strong> (NEW: {newVisits} | REVIEW: {reviewVisits})</span>
                    <span><strong>CONSULTATION REVENUE: ₹{formatCurrency(totalFees)}</strong></span>
                  </div>
                </td>
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
