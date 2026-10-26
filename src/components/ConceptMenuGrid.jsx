import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Receipt, 
  BarChart3, 
  ArrowRight,
  DollarSign,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';

const MENU_SECTIONS = [
  {
    id: 'master',
    title: 'MASTER',
    icon: ShieldCheck,
    items: [
      { id: 'admin', label: 'ADMIN' },
      { id: 'users', label: 'USER CREATION' },
      { id: 'services', label: 'SERVICE MASTER (TARIFF)', isSpecial: true },
    ],
  },
  {
    id: 'registration',
    title: 'REGISTRATION',
    icon: Users,
    items: [
      { id: 'op-new', label: 'OP NEW' },
      { id: 'op-review', label: 'OP REVIEW' },
      { id: 'patient-update', label: 'PATIENT DETAIL UPDATE' },
      { id: 'modify-doctor-reg', label: 'DOCTOR NAME MODIFY - REGISTRATION' },
      { id: 'modify-patient-type', label: 'PATIENT TYPE MODIFY' },
      { id: 'modify-payment-type-reg', label: 'PAYMENT TYPE MODIFY' },
    ],
  },
  {
    id: 'billing',
    title: 'BILLING',
    icon: Receipt,
    items: [
      { id: 'op-billing', label: 'OP SERVICE BILLING' },
      { id: 'modify-doctor-bill', label: 'DOCTOR NAME MODIFY - OP BILL' },
      { id: 'modify-payment-type-bill', label: 'PAYMENT TYPE MODIFY' },
    ],
  },
  {
    id: 'report',
    title: 'REPORT',
    icon: BarChart3,
    items: [
      { id: 'report-billing', label: 'OP BILLING' },
      { id: 'report-revenue', label: 'REVENUE (SUMMARY + SERVICE WISE)' },
      { id: 'report-registration', label: 'OP REGISTRATION' },
    ],
  },
];

export default function ConceptMenuGrid({ onNavigate, stats, currentUser }) {
  const isAdmin = currentUser?.role === 'ADMIN';
  
  // Parse allowed menus safely (handles array or string format)
  const allowed = Array.isArray(currentUser?.allowedMenus)
    ? currentUser.allowedMenus
    : (currentUser?.allowedMenus || '').split(/[\s,]+/).map(s => s.trim()).filter(Boolean);

  const isPermitted = (viewId) => {
    if (isAdmin) return true;
    return allowed.includes(viewId);
  };

  // Strictly filter: ONLY keep items permitted for this user.
  // Unpermitted items are completely omitted.
  // Columns with 0 permitted items are also completely omitted.
  const visibleSections = MENU_SECTIONS.map((section) => {
    const visibleItems = section.items.filter((item) => isPermitted(item.id));
    return {
      ...section,
      items: visibleItems,
    };
  }).filter((section) => section.items.length > 0);

  const totalVisibleItems = visibleSections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="concept-wrapper">
      {/* 1. TOP HEADER - Sleek and immediate */}
      <div className="top-nav-header">
        <div className="top-nav-titles">
          <div className="nav-tagline">
            <span className="live-dot"></span>
            <span>HOSPITAL OPERATIONS MATRIX</span>
          </div>
          <h1 className="nav-main-title">Main Navigation Menu</h1>
          <p className="nav-sub-title">
            Select an operational module to open work desk &bull; Signed in as: <strong>{currentUser?.fullName || currentUser?.username}</strong>
          </p>
        </div>

        <div className="nav-access-pill">
          {isAdmin ? (
            <div className="pill-admin">
              <ShieldCheck size={16} />
              <span>ADMINISTRATOR &bull; ALL MENUS ACTIVE</span>
            </div>
          ) : (
            <div className="pill-user">
              <CheckCircle2 size={16} />
              <span>USER ROLE &bull; {totalVisibleItems} SELECTED MENUS ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN NAVIGATION GRID (PLACED RIGHT AT THE TOP) */}
      {visibleSections.length === 0 ? (
        <div className="empty-menus-box">
          <Lock size={36} color="#94a3b8" />
          <h3>No Menus Assigned</h3>
          <p>Your user account currently has no active permissions assigned. Please contact the Hospital Administrator.</p>
        </div>
      ) : (
        <div 
          className="concept-grid"
          style={{
            gridTemplateColumns: `repeat(${Math.min(visibleSections.length, 4)}, minmax(0, 1fr))`
          }}
        >
          {visibleSections.map((section) => (
            <div key={section.id} className="concept-column">
              <div className="concept-header">
                <section.icon size={20} />
                <span>{section.title}</span>
              </div>
              <div className="concept-body">
                {section.items.map((item) => (
                  <button 
                    key={item.id}
                    className={`concept-item-btn ${item.isSpecial ? 'tariff-btn' : ''}`} 
                    onClick={() => onNavigate(item.id)}
                  >
                    <span className={`concept-bullet ${item.isSpecial ? 'tariff-bullet' : ''}`}></span>
                    <span className={`item-text ${item.isSpecial ? 'tariff-text' : ''}`}>
                      {item.label}
                    </span>
                    <ArrowRight size={14} className="hover-arrow" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. OPERATIONAL OVERVIEW & KPI STATS (SITS CLEANLY BELOW THE MENU GRID) */}
      <div className="overview-divider">
        <span className="divider-line"></span>
        <span className="divider-label">HOSPITAL ACTIVITY SNAPSHOT</span>
        <span className="divider-line"></span>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total OP Registrations</span>
            <span className="kpi-value">{stats?.totalRegistrations ?? '—'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <Receipt size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Bills Generated</span>
            <span className="kpi-value">{stats?.totalBills ?? '—'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Revenue</span>
            <span className="kpi-value">₹{Number(stats?.totalRevenue || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            <Layers size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Configured Services</span>
            <span className="kpi-value">{stats?.totalServices ?? '17'}</span>
          </div>
        </div>
      </div>

      <style>{`
        .concept-wrapper {
          width: 100%;
        }

        .top-nav-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin-bottom: 22px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .nav-tagline {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.25);
        }

        .nav-main-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
          letter-spacing: -0.01em;
        }

        .nav-sub-title {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        .nav-access-pill .pill-admin {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 20px;
        }

        .nav-access-pill .pill-user {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 20px;
        }

        .concept-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 28px;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .concept-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .top-nav-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }

        @media (max-width: 640px) {
          .concept-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .tariff-btn {
          background: #f0fdf4 !important;
          border-color: #bbf7d0 !important;
        }

        .tariff-bullet {
          background-color: #059669 !important;
        }

        .tariff-text {
          color: #065f46 !important;
          font-weight: 800 !important;
        }

        .item-text {
          flex: 1;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.01em;
        }

        .hover-arrow {
          color: #94a3b8;
          opacity: 0;
          transition: all 0.15s ease;
        }

        .concept-item-btn:hover .hover-arrow {
          opacity: 1;
          transform: translateX(3px);
          color: #2563eb;
        }

        .empty-menus-box {
          background: #ffffff;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
          margin-bottom: 28px;
        }

        .empty-menus-box h3 {
          margin: 12px 0 6px 0;
          color: #1e293b;
        }

        .empty-menus-box p {
          color: #64748b;
          font-size: 0.9rem;
          max-width: 420px;
          margin: 0 auto;
        }

        .overview-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 28px 0 16px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .divider-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.1em;
        }
      `}</style>
    </div>
  );
}
