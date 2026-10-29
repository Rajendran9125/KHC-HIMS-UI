import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Receipt, Plus, Trash2, Printer, CheckCircle, Search, Layers, RotateCcw, ArrowRight, X } from 'lucide-react';

export default function OpServiceBillingPage({ onNavigate }) {
  const [registrations, setRegistrations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [serviceMasterList, setServiceMasterList] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [createdBill, setCreatedBill] = useState(null);

  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  const [doctorId, setDoctorId] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5);
  const [remarks, setRemarks] = useState('');

  const [items, setItems] = useState([]);

  useEffect(() => {
    async function init() {
      try {
        const [regs, docs, payTypes, svcs] = await Promise.all([
          api.getRegistrations(),
          api.getDoctors(true),
          api.getPaymentTypes(),
          api.getServices('', true),
        ]);
        setRegistrations(regs || []);
        setDoctors(docs || []);
        setPaymentTypes(payTypes || []);
        setServiceMasterList(svcs || []);
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  const handleSelectReg = (reg) => {
    setSelectedReg(reg);
    if (reg.doctor?.id) setDoctorId(reg.doctor.id);
    if (reg.paymentType) setPaymentType(reg.paymentType);
    const fee = reg.consultationFee || 300;
    setItems([
      { serviceName: `${reg.visitType || 'OP'} Consultation Fee`, serviceCategory: 'CONSULTATION', quantity: 1, unitPrice: fee }
    ]);
  };

  const handleAddPresetService = (svc) => {
    setItems([
      ...items,
      {
        serviceName: svc.serviceName,
        serviceCategory: svc.header || 'LAB',
        quantity: 1,
        unitPrice: svc.opRate || 0,
      }
    ]);
  };

  const handleAddCustomItem = () => {
    setItems([...items, { serviceName: '', serviceCategory: 'LABTEST', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // If serviceName changed, check if it matches a service from Master to auto-fill rate & category
    if (field === 'serviceName') {
      const match = serviceMasterList.find(s => s.serviceName.toLowerCase() === value.toLowerCase());
      if (match) {
        updated[index].unitPrice = match.opRate || 0;
        updated[index].serviceCategory = match.header || 'GENERAL';
      }
    }

    setItems(updated);
  };

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + ((parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity) || 1)), 0);
  const taxAmount = (subTotal - discount) > 0 ? ((subTotal - discount) * (taxPercent / 100)) : 0;
  const netTotal = Math.max(0, subTotal - discount + taxAmount);

  // Search Filter 1: Active OP Tickets filter
  const filteredRegistrations = registrations.filter(r => {
    if (!regSearchQuery.trim()) return true;
    const q = regSearchQuery.toLowerCase();
    const pName = `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.toLowerCase();
    const mrn = (r.patient?.mrn || '').toLowerCase();
    const opNum = (r.opNumber || '').toLowerCase();
    const mobile = (r.patient?.mobile || '').toLowerCase();
    const docName = (r.doctor?.doctorName || '').toLowerCase();
    return pName.includes(q) || mrn.includes(q) || opNum.includes(q) || mobile.includes(q) || docName.includes(q);
  });

  // Search Filter 2: Tariff Services filter
  const filteredServices = serviceMasterList.filter(s => {
    if (!serviceSearchQuery.trim()) return true;
    const q = serviceSearchQuery.toLowerCase();
    return (s.serviceName || '').toLowerCase().includes(q) || 
           (s.header || '').toLowerCase().includes(q) || 
           (s.department || '').toLowerCase().includes(q);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReg) {
      alert('Please select an OP Registration or Patient first.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one bill service item.');
      return;
    }

    try {
      const payload = {
        opRegistrationId: selectedReg.id,
        patientId: selectedReg.patient?.id,
        doctorId: parseInt(doctorId),
        paymentType: paymentType,
        discount: parseFloat(discount) || 0,
        tax: Math.round(taxAmount),
        paidAmount: Math.round(netTotal),
        remarks: remarks,
        items: items.map(item => ({
          serviceName: item.serviceName,
          serviceCategory: item.serviceCategory,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
        })),
      };

      const bill = await api.createOpBill(payload);
      setCreatedBill(bill);
    } catch (err) {
      alert('Error creating bill: ' + err.message);
    }
  };

  const handleReset = () => {
    setCreatedBill(null);
    setSelectedReg(null);
    setDiscount(0);
    setRemarks('');
    setItems([]);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              <Receipt size={22} color="#2563eb" />
              <span>BILLING &gt; OP SERVICE BILLING</span>
            </h2>
            {onNavigate && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('refund-billing')}
                style={{ borderColor: '#ef4444', color: '#dc2626', background: '#fef2f2', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                title="Go to Refund Billing to revert previously billed services"
              >
                <RotateCcw size={14} />
                <span>Refund / Revert Service</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
          <p className="card-subtitle" style={{ marginTop: '4px' }}>
            Generate itemized outpatient bill with automated OP rates populated from Service Master.
          </p>
        </div>
      </div>

      {createdBill ? (
        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#ecfdf5', borderRadius: '50%', color: '#059669', marginBottom: '12px' }}>
              <CheckCircle size={44} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
              OP Service Invoice Generated Successfully!
            </h3>
            <p style={{ color: '#64748b' }}>Bill No: <strong style={{ color: '#2563eb' }}>{createdBill.billNumber}</strong></p>
          </div>

          {/* Printable Invoice Card */}
          <div style={{ maxWidth: '650px', margin: '0 auto 28px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563eb', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '1.2rem' }}>KHC HEALTHCARE HOSPITAL</h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>OPD Services &amp; Cash Receipt</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{createdBill.billNumber}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date().toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem', marginBottom: '18px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
              <div>Patient: <strong>{createdBill.patient?.firstName} {createdBill.patient?.lastName}</strong></div>
              <div>MRN: <strong>{createdBill.patient?.mrn}</strong></div>
              <div>Doctor: <strong>{createdBill.doctor?.doctorName}</strong></div>
              <div>Payment Mode: <strong className="badge badge-success">{createdBill.paymentType}</strong></div>
            </div>

            <table className="data-table" style={{ marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service Item</th>
                  <th>Header / Category</th>
                  <th>Qty</th>
                  <th>OP Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {createdBill.items?.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.serviceName}</td>
                    <td><span className="badge badge-primary">{item.serviceCategory}</span></td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice}</td>
                    <td><strong>₹{item.totalPrice}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', fontSize: '0.9rem', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <div>Subtotal: <strong>₹{createdBill.subTotal}</strong></div>
              <div>Discount: <strong style={{ color: '#dc2626' }}>-₹{createdBill.discount}</strong></div>
              <div>Tax: <strong>+₹{createdBill.tax}</strong></div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#15803d', borderTop: '2px solid #2563eb', paddingTop: '6px', marginTop: '4px' }}>
                Net Paid: ₹{createdBill.totalAmount}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print Official Invoice
            </button>
            <button className="btn btn-primary" onClick={handleReset}>
              <Receipt size={16} /> Generate New Bill
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Step 1: Select Registration */}
          <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                Step 1: Select Active OP Registration Ticket
              </h3>
              {!selectedReg && (
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2563eb' }}>
                  Showing {filteredRegistrations.length} of {registrations.length} tickets
                </span>
              )}
            </div>

            {selectedReg ? (
              <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '6px', border: '1px solid #93c5fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{selectedReg.opNumber}</strong> — {selectedReg.patient?.firstName} {selectedReg.patient?.lastName} ({selectedReg.patient?.mrn}) | Dr: {selectedReg.doctor?.doctorName}
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelectedReg(null); setItems([]); }}>
                  Change OP Ticket
                </button>
              </div>
            ) : (
              <div>
                {/* Search Box for Active Tickets */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ paddingLeft: '36px', height: '38px', fontSize: '0.88rem' }}
                      placeholder="Search patient by Name, MRN, OP Ticket Number, Mobile, or Doctor..."
                      value={regSearchQuery}
                      onChange={(e) => setRegSearchQuery(e.target.value)}
                    />
                    {regSearchQuery && (
                      <button 
                        type="button" 
                        onClick={() => setRegSearchQuery('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>OP Ticket</th>
                        <th>MRN</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.length > 0 ? (
                        filteredRegistrations.map(r => (
                          <tr key={r.id}>
                            <td><strong>{r.opNumber}</strong></td>
                            <td><span className="badge badge-primary">{r.patient?.mrn}</span></td>
                            <td>{r.patient?.firstName} {r.patient?.lastName}</td>
                            <td>{r.doctor?.doctorName}</td>
                            <td><span className={`badge ${r.status === 'BILLED' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span></td>
                            <td>
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSelectReg(r)}>
                                Bill This Patient
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                            {regSearchQuery ? `No active tickets match "${regSearchQuery}"` : 'No active OP registration tickets available.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {!selectedReg ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
              <Receipt size={40} color="#94a3b8" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#334155', margin: '0 0 6px 0' }}>
                No Patient Selected for Billing
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Please click the blue <strong>"Bill This Patient"</strong> button in Step 1 above to load the patient ticket and prepare the bill.
              </p>
            </div>
          ) : (
            <>
              {/* Service Master Quick Presets & Service Search */}
          <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color="#2563eb" />
                <span>Quick Add from Service Master ({filteredServices.length} configured rates):</span>
              </span>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text"
                  className="form-control form-control-sm"
                  style={{ paddingLeft: '30px', height: '32px', fontSize: '0.82rem' }}
                  placeholder="Filter services (e.g. ECG, CBC, X-Ray)..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                />
                {serviceSearchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setServiceSearchQuery('')}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '130px', overflowY: 'auto' }}>
              {filteredServices.slice(0, 16).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleAddPresetService(s)}
                  title={`Category: ${s.header} | Department: ${s.department}`}
                  style={{ fontSize: '0.82rem', padding: '5px 10px' }}
                >
                  <Plus size={12} /> {s.serviceName} <strong>(₹{s.opRate})</strong>
                </button>
              ))}
              {filteredServices.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '6px' }}>
                  No matching services found for "{serviceSearchQuery}".
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Invoice Line Items ({items.length})</h3>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCustomItem}>
                  <Plus size={14} /> Add Line Item
                </button>
              </div>

              {/* Service datalist for autocomplete */}
              <datalist id="service-options">
                {serviceMasterList.map(s => (
                  <option key={s.id} value={s.serviceName}>{s.header} - ₹{s.opRate}</option>
                ))}
              </datalist>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Category / Header</th>
                      <th style={{ width: '90px' }}>Qty</th>
                      <th style={{ width: '130px' }}>OP Rate (₹)</th>
                      <th style={{ width: '120px' }}>Line Total (₹)</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <input 
                            type="text" 
                            className="form-control" 
                            required
                            value={item.serviceName}
                            onChange={(e) => handleItemChange(idx, 'serviceName', e.target.value)}
                            placeholder="Type service name or select from master..."
                            list="service-options"
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={item.serviceCategory}
                            onChange={(e) => handleItemChange(idx, 'serviceCategory', e.target.value.toUpperCase())}
                            placeholder="ECG, LABTEST, CBC..."
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-control" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-control" 
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td>
                          <strong>₹{((parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity) || 1)).toLocaleString()}</strong>
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleRemoveItem(idx)}
                            title="Remove / skip this service"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                          No services added yet. Click <strong>"+ Add Line Item"</strong> or choose from the Service Master buttons above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Billing Summary & Payment Type */}
            <div className="form-grid" style={{ background: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div className="form-group">
                <label className="form-label required">Tagged Doctor</label>
                <select 
                  className="form-control" 
                  required 
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                >
                  <option value="">-- Select Tagged Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.doctorName} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Payment Type</label>
                <select 
                  className="form-control" 
                  required
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="">-- Select Payment Type --</option>
                  {paymentTypes.length > 0 ? (
                    paymentTypes.map(py => (
                      <option key={py.id} value={py.typeName}>{py.typeName}</option>
                    ))
                  ) : (
                    <>
                      <option value="CASH">CASH</option>
                      <option value="UPI">UPI</option>
                      <option value="CARD">CARD</option>
                      <option value="INSURANCE">INSURANCE</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Discount Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tax GST (%)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="0"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Total Calculation Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '16px 20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Gross Subtotal: ₹{subTotal.toFixed(2)} | Discount: -₹{discount.toFixed(2)} | Tax: +₹{taxAmount.toFixed(2)}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e40af' }}>
                  Total Bill Amount: ₹{Math.round(netTotal).toLocaleString()}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                <Receipt size={18} />
                <span>Confirm &amp; Generate OP Bill</span>
              </button>
            </div>
          </form>
          </>
        )}
        </div>
      )}
    </div>
  );
}
