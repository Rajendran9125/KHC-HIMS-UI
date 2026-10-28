import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  RotateCcw, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  X, 
  Receipt, 
  ArrowLeft,
  DollarSign,
  User,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function RefundBillingPage({ onNavigate }) {
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refundModalItem, setRefundModalItem] = useState(null); // Item to refund
  const [refundReason, setRefundReason] = useState('Service skipped by patient');
  const [customReason, setCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRefundReceipt, setLastRefundReceipt] = useState(null);
  const [showFullRefundModal, setShowFullRefundModal] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async (query = '') => {
    setLoading(true);
    try {
      const data = await api.getBills(query);
      setBills(data || []);
      if (selectedBill) {
        const updated = (data || []).find(b => b.id === selectedBill.id);
        if (updated) setSelectedBill(updated);
      }
    } catch (err) {
      console.error('Failed to load bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBills(searchQuery);
  };

  const handleSelectBill = (bill) => {
    setSelectedBill(bill);
    setLastRefundReceipt(null);
  };

  const handleOpenItemRefund = (item) => {
    setRefundModalItem(item);
    setRefundReason('Service skipped by patient');
    setCustomReason('');
  };

  const handleConfirmItemRefund = async () => {
    if (!selectedBill || !refundModalItem) return;
    setIsProcessing(true);
    const finalReason = refundReason === 'Other' ? customReason.trim() || 'Custom refund reason' : refundReason;

    try {
      const updatedBill = await api.refundBillItem({
        billId: selectedBill.id,
        itemId: refundModalItem.id,
        reason: finalReason
      });

      setSelectedBill(updatedBill);
      setLastRefundReceipt({
        billNumber: updatedBill.billNumber,
        patientName: `${updatedBill.patient?.firstName || ''} ${updatedBill.patient?.lastName || ''}`,
        mrn: updatedBill.patient?.mrn,
        doctor: updatedBill.doctor?.doctorName,
        serviceName: refundModalItem.serviceName,
        category: refundModalItem.serviceCategory,
        refundAmount: refundModalItem.totalPrice,
        reason: finalReason,
        refundDate: new Date().toLocaleString(),
        paymentType: updatedBill.paymentType
      });

      setRefundModalItem(null);
      loadBills(searchQuery);
    } catch (err) {
      alert('Error processing refund: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmFullRefund = async () => {
    if (!selectedBill) return;
    setIsProcessing(true);
    const finalReason = refundReason === 'Other' ? customReason.trim() || 'Custom full refund' : refundReason;

    try {
      const updatedBill = await api.refundFullBill({
        billId: selectedBill.id,
        reason: finalReason
      });

      setSelectedBill(updatedBill);
      setLastRefundReceipt({
        billNumber: updatedBill.billNumber,
        patientName: `${updatedBill.patient?.firstName || ''} ${updatedBill.patient?.lastName || ''}`,
        mrn: updatedBill.patient?.mrn,
        doctor: updatedBill.doctor?.doctorName,
        serviceName: 'Full Bill Cancellation (All Services Reverted)',
        category: 'ALL SERVICES',
        refundAmount: updatedBill.totalAmount,
        reason: finalReason,
        refundDate: new Date().toLocaleString(),
        paymentType: updatedBill.paymentType
      });

      setShowFullRefundModal(false);
      loadBills(searchQuery);
    } catch (err) {
      alert('Error processing full refund: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter bills in client view
  const filteredBills = bills.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const bNum = (b.billNumber || '').toLowerCase();
    const pName = `${b.patient?.firstName || ''} ${b.patient?.lastName || ''}`.toLowerCase();
    const mrn = (b.patient?.mrn || '').toLowerCase();
    const doc = (b.doctor?.doctorName || '').toLowerCase();
    return bNum.includes(q) || pName.includes(q) || mrn.includes(q) || doc.includes(q);
  });

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>
              <RotateCcw size={22} color="#dc2626" />
              <span>BILLING &gt; REFUND BILLING (SERVICE REVERSAL)</span>
            </h2>
            <p className="card-subtitle" style={{ marginTop: '4px' }}>
              Revert skipped services, issue item-level refunds, and generate official hospital refund vouchers.
            </p>
          </div>
          {onNavigate && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('op-billing')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} />
              <span>Back to OP Service Billing</span>
            </button>
          )}
        </div>
      </div>

      {/* SEARCH AND SELECT BILL */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '36px', height: '40px' }}
              placeholder="Search by Bill Number (e.g. BILL-2026-3001), Patient MRN (e.g. MRN2026001), or Patient Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); loadBills(''); }}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '40px' }}>
            <Search size={16} /> Search Bills
          </button>
        </form>

        {/* Recent Bills Dropdown / Quick Select Table */}
        {!selectedBill && (
          <div style={{ maxHeight: '220px', overflowY: 'auto', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>MRN</th>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Total Amount</th>
                  <th>Refunded</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.billNumber}</strong></td>
                      <td><span className="badge badge-primary">{b.patient?.mrn}</span></td>
                      <td>{b.patient?.firstName} {b.patient?.lastName}</td>
                      <td>{b.doctor?.doctorName}</td>
                      <td>₹{b.totalAmount}</td>
                      <td>
                        {b.refundedAmount > 0 ? (
                          <strong style={{ color: '#dc2626' }}>₹{b.refundedAmount}</strong>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${
                          b.paymentStatus === 'REFUNDED' ? 'badge-danger' : 
                          b.paymentStatus === 'PARTIAL_REFUND' ? 'badge-warning' : 
                          'badge-success'
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleSelectBill(b)}
                          style={{ borderColor: '#ef4444', color: '#dc2626', fontWeight: '700' }}
                        >
                          <RotateCcw size={13} /> Manage / Refund
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                      {loading ? 'Loading bills...' : 'No bills found matching your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SELECTED BILL WORKFLOW */}
      {selectedBill && (
        <div>
          {/* Bill Overview Banner */}
          <div style={{ background: '#eff6ff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a', margin: 0 }}>
                  {selectedBill.billNumber}
                </h3>
                <span className={`badge ${
                  selectedBill.paymentStatus === 'REFUNDED' ? 'badge-danger' : 
                  selectedBill.paymentStatus === 'PARTIAL_REFUND' ? 'badge-warning' : 
                  'badge-success'
                }`} style={{ fontSize: '0.8rem', padding: '3px 8px' }}>
                  {selectedBill.paymentStatus}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: '4px' }}>
                Patient: <strong>{selectedBill.patient?.firstName} {selectedBill.patient?.lastName}</strong> ({selectedBill.patient?.mrn}) &bull; Doctor: <strong>{selectedBill.doctor?.doctorName}</strong> &bull; Paid Via: <strong>{selectedBill.paymentType}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {selectedBill.paymentStatus !== 'REFUNDED' && (
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowFullRefundModal(true)}
                  style={{ fontWeight: '700' }}
                >
                  <RotateCcw size={14} /> Full Bill Refund
                </button>
              )}
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedBill(null)}
              >
                Choose Another Bill
              </button>
            </div>
          </div>

          {/* Financial Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Original Bill Total</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                ₹{selectedBill.totalAmount}
              </div>
            </div>

            <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#b91c1c', textTransform: 'uppercase' }}>Refunded Amount</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
                ₹{selectedBill.refundedAmount || 0}
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>Net Retained Amount</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
                ₹{Math.max(0, (selectedBill.totalAmount || 0) - (selectedBill.refundedAmount || 0))}
              </div>
            </div>
          </div>

          {/* ITEM-LEVEL SERVICE REVERSAL TABLE */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                Billed Services ({selectedBill.items?.length || 0}) — Revert Skipped Services:
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Click <strong>"Revert / Refund This Service"</strong> next to any service the patient did not take.
              </span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                    <th>Item Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items?.map((item, index) => {
                    const isRefunded = item.status === 'REFUNDED';
                    return (
                      <tr key={item.id || index} style={{ background: isRefunded ? '#fef2f2' : 'inherit' }}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{item.serviceName}</strong>
                          {isRefunded && item.refundReason && (
                            <div style={{ fontSize: '0.76rem', color: '#dc2626', marginTop: '2px' }}>
                              Reason: {item.refundReason}
                            </div>
                          )}
                        </td>
                        <td><span className="badge badge-primary">{item.serviceCategory}</span></td>
                        <td>{item.quantity}</td>
                        <td>₹{item.unitPrice}</td>
                        <td><strong>₹{item.totalPrice}</strong></td>
                        <td>
                          {isRefunded ? (
                            <span className="badge badge-danger">
                              REFUNDED (₹{item.totalPrice})
                            </span>
                          ) : (
                            <span className="badge badge-success">
                              BILLED
                            </span>
                          )}
                        </td>
                        <td>
                          {isRefunded ? (
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                              ✓ Reverted
                            </span>
                          ) : (
                            <button 
                              type="button" 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleOpenItemRefund(item)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '700' }}
                            >
                              <RotateCcw size={13} /> Revert / Refund Service
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PRINTABLE REFUND VOUCHER SLIP */}
          {lastRefundReceipt && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: '800' }}>
                  <CheckCircle size={20} />
                  <span>Official Refund Slip Issued:</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                  <Printer size={15} /> Print Refund Slip
                </button>
              </div>

              {/* Printable Voucher Paper */}
              <div style={{ maxWidth: '520px', margin: '0 auto', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '12px', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '1.15rem' }}>KH CLINIC HEALTHCARE</h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Melvisharam &bull; Outpatient Service Reversal Voucher</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#dc2626', marginTop: '4px' }}>REFUND VOUCHER</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', marginBottom: '14px' }}>
                  <div>Bill No: <strong>{lastRefundReceipt.billNumber}</strong></div>
                  <div>Date: <strong>{lastRefundReceipt.refundDate}</strong></div>
                  <div>Patient: <strong>{lastRefundReceipt.patientName}</strong></div>
                  <div>MRN: <strong>{lastRefundReceipt.mrn}</strong></div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '0.88rem' }}>
                  <div>Reverted Service: <strong>{lastRefundReceipt.serviceName}</strong></div>
                  <div>Category: {lastRefundReceipt.category}</div>
                  <div style={{ marginTop: '6px', fontSize: '1.1rem', fontWeight: '800', color: '#dc2626' }}>
                    Refund Cash / Credit: ₹{lastRefundReceipt.refundAmount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    Reason: <em>{lastRefundReceipt.reason}</em>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', fontSize: '0.8rem', color: '#64748b' }}>
                  <div>Cashier / Billing Desk</div>
                  <div>Patient / Attendant Signature</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: SINGLE ITEM REFUND REASON */}
      {refundModalItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', width: '92%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} color="#dc2626" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Confirm Service Reversal / Refund
                </h3>
              </div>
              <button onClick={() => setRefundModalItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#fef2f2', padding: '12px 16px', borderRadius: '6px', border: '1px solid #fecaca', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#991b1b' }}>
                {refundModalItem.serviceName}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: '2px' }}>
                Refund Amount to Return: <strong>₹{refundModalItem.totalPrice}</strong>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label required">Select Reversal Reason</label>
              <select 
                className="form-control"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              >
                <option value="Service skipped by patient">Service skipped by patient</option>
                <option value="Doctor cancelled / advised not required">Doctor cancelled / advised not required</option>
                <option value="Patient declined investigation">Patient declined investigation</option>
                <option value="Wrong service billed in error">Wrong service billed in error</option>
                <option value="Other">Other (Enter custom reason below)</option>
              </select>
            </div>

            {refundReason === 'Other' && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label required">Specify Reason</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Test machine under maintenance..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setRefundModalItem(null)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleConfirmItemRefund}
                disabled={isProcessing}
                style={{ fontWeight: '700' }}
              >
                {isProcessing ? 'Processing Refund...' : `Refund ₹${refundModalItem.totalPrice}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL BILL REFUND */}
      {showFullRefundModal && selectedBill && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', width: '92%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="#dc2626" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Confirm Full Bill Refund
                </h3>
              </div>
              <button onClick={() => setShowFullRefundModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '14px' }}>
              This will revert all remaining service items on bill <strong>{selectedBill.billNumber}</strong> and issue a full refund of <strong>₹{selectedBill.totalAmount}</strong>.
            </p>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label required">Select Cancellation Reason</label>
              <select 
                className="form-control"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              >
                <option value="Patient cancelled all services">Patient cancelled all services</option>
                <option value="Doctor cancelled entire prescription">Doctor cancelled entire prescription</option>
                <option value="Duplicate bill generated">Duplicate bill generated</option>
                <option value="Patient left without consultation">Patient left without consultation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {refundReason === 'Other' && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label required">Specify Reason</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Reason for full cancellation..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowFullRefundModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleConfirmFullRefund}
                disabled={isProcessing}
                style={{ fontWeight: '700' }}
              >
                {isProcessing ? 'Processing Full Refund...' : `Refund Full Bill (₹${selectedBill.totalAmount})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
