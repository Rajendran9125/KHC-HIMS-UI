import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PieChart, TrendingUp, DollarSign, Filter, Printer, Layers, RotateCcw } from 'lucide-react';

export default function RevenueReportPage() {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.getRevenueReport(params);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const totalRev = data?.totalPaid || data?.totalBilled || 1;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <PieChart size={22} color="#2563eb" />
            <span>REPORT &gt; REVENUE (SUMMARY + SERVICE WISE)</span>
          </h2>
          <p className="card-subtitle">Hospital revenue analytics — Executive financial summary and department/service-wise contribution breakdown.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Date Filter */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px', display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label className="form-label">From Date</label>
          <input 
            type="date" 
            className="form-control" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">To Date</label>
          <input 
            type="date" 
            className="form-control" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={fetchRevenue}>
          <Filter size={14} /> Refresh Analytics
        </button>
      </div>

      {/* KPI Top Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Realized Revenue (Net)</span>
            <span className="kpi-value">₹{Number(data?.totalPaid || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Gross Billed</span>
            <span className="kpi-value">₹{Number(data?.totalBilled || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <RotateCcw size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Refunded</span>
            <span className="kpi-value" style={{ color: '#dc2626' }}>
              ₹{Number(data?.totalRefunded || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fee2e2', color: '#b45309' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Concessions / Discounts</span>
            <span className="kpi-value">₹{Number(data?.totalDiscount || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '12px' }}>
        {/* Service Wise Revenue */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#2563eb" />
            <span>Service Wise Revenue Contribution</span>
          </h3>

          {data?.serviceWiseRevenue && Object.keys(data.serviceWiseRevenue).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(data.serviceWiseRevenue).map(([category, amount]) => {
                const percent = Math.min(100, Math.round((amount / totalRev) * 100));
                const count = data.serviceWiseCount?.[category] || 0;
                return (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>
                        {category} ({count} services performed)
                      </span>
                      <span style={{ fontWeight: '700', color: '#2563eb' }}>
                        ₹{Number(amount).toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${percent}%`, 
                          background: category === 'LAB' ? '#0ea5e9' :
                                      category === 'RADIOLOGY' ? '#8b5cf6' :
                                      category === 'PROCEDURE' ? '#f59e0b' : '#2563eb',
                          borderRadius: '5px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>No service item billing records found.</p>
          )}
        </div>

        {/* Payment Type Breakdown */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#059669" />
            <span>Payment Method Distribution</span>
          </h3>

          {data?.paymentTypeBreakdown && Object.keys(data.paymentTypeBreakdown).length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment Mode</th>
                  <th>Amount Realized (₹)</th>
                  <th>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.paymentTypeBreakdown).map(([mode, amt]) => {
                  const percent = Math.round((amt / (data.totalPaid || 1)) * 100);
                  return (
                    <tr key={mode}>
                      <td><strong>{mode}</strong></td>
                      <td>₹{Number(amt).toLocaleString()}</td>
                      <td>
                        <span className="badge badge-success">{percent}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#94a3b8' }}>No payment distribution records available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
