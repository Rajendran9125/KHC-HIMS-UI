import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Home,
  ShieldCheck, 
  UserPlus, 
  UserCheck, 
  History, 
  UserCog, 
  Stethoscope, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  FileText, 
  PieChart, 
  Activity,
  Layers,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export default function Navbar({ activeView, setActiveView, currentUser, onLogout }) {
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  const isAdmin = currentUser?.role === 'ADMIN';
  const allowed = Array.isArray(currentUser?.allowedMenus)
    ? currentUser.allowedMenus
    : (currentUser?.allowedMenus || '').split(/[\s,]+/).map(s => s.trim()).filter(Boolean);

  const isAllowed = (menuId) => {
    if (isAdmin) return true;
    return allowed.includes(menuId);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (viewId) => {
    if (!isAllowed(viewId)) {
      alert(`Access Restricted: Your user account does not have permission to view this menu. Required: ADMIN role.`);
      return;
    }
    setActiveView(viewId);
    setOpenMenu(null);
  };

  const toggleDropdown = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // Permissions check for main tabs
  const hasMasterAccess = isAdmin || isAllowed('admin') || isAllowed('users') || isAllowed('services');
  const hasRegAccess = isAdmin || ['op-new', 'op-review', 'patient-update', 'modify-doctor-reg', 'modify-patient-type', 'modify-payment-type-reg'].some(isAllowed);
  const hasBillAccess = isAdmin || ['op-billing', 'modify-doctor-bill', 'modify-payment-type-bill', 'refund-billing'].some(isAllowed);
  const hasReportAccess = isAdmin || ['report-billing', 'report-revenue', 'report-registration'].some(isAllowed);

  return (
    <header className="navbar-container" ref={navRef}>
      {/* Top Header Bar */}
      <div className="navbar-top">
        <div className="navbar-brand" onClick={() => setActiveView('dashboard')}>
          <img 
            src="/kh-clinic-logo.jpg" 
            alt="KH CLINIC Logo" 
            className="navbar-brand-logo-img" 
          />
          <div>
            <div className="brand-title">KH CLINIC</div>
          </div>
        </div>

        <div className="navbar-actions">
          <button 
            className={`nav-pill-btn ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
            title="Return to Clinic Home & Overview"
          >
            <Home size={16} />
            <span>Clinic Home</span>
          </button>

          {/* User Profile Pill */}
          {currentUser && (
            <div className="user-profile-badge">
              <UserIcon size={16} color="#2563eb" />
              <div className="user-details">
                <span className="user-name">{currentUser.fullName || currentUser.username}</span>
                <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-success'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {currentUser.role} {isAdmin ? '(ALL RIGHTS)' : '(SELECTED MENUS)'}
                </span>
              </div>
              <button className="logout-btn" onClick={onLogout} title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Top Navigation Strip (MASTER, REGISTRATION, BILLING, REPORT) */}
      <nav className="navbar-menu-strip">
        {/* 1. MASTER TAB */}
        {hasMasterAccess && (
          <div 
            className="nav-dropdown-wrapper"
            onMouseEnter={() => setOpenMenu('master')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button 
              className={`nav-menu-btn ${['admin', 'users', 'services'].includes(activeView) ? 'active' : ''}`}
              onClick={() => toggleDropdown('master')}
            >
              <ShieldCheck size={17} />
              <span>MASTER</span>
              <ChevronDown size={14} className={openMenu === 'master' ? 'rotate' : ''} />
            </button>

            {openMenu === 'master' && (
              <div className="nav-dropdown-menu">
                {isAllowed('admin') && (
                  <button 
                    className={`dropdown-item ${activeView === 'admin' ? 'active' : ''}`}
                    onClick={() => handleSelect('admin')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">ADMIN</div>
                      <div className="dropdown-desc">Doctor Master &amp; Hospital Settings</div>
                    </div>
                  </button>
                )}

                {isAllowed('users') && (
                  <button 
                    className={`dropdown-item ${activeView === 'users' ? 'active' : ''}`}
                    onClick={() => handleSelect('users')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">USER CREATION</div>
                      <div className="dropdown-desc">Staff Accounts, Passwords &amp; Roles</div>
                    </div>
                  </button>
                )}

                {isAllowed('services') && (
                  <button 
                    className={`dropdown-item highlight-tariff ${activeView === 'services' ? 'active' : ''}`}
                    onClick={() => handleSelect('services')}
                  >
                    <span className="dropdown-bullet bullet-tariff"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title text-tariff">SERVICE MASTER (TARIFF)</div>
                      <div className="dropdown-desc">Rates: ECG, Lab, CBC, OP/IP Tariff</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. REGISTRATION TAB */}
        {hasRegAccess && (
          <div 
            className="nav-dropdown-wrapper"
            onMouseEnter={() => setOpenMenu('registration')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button 
              className={`nav-menu-btn ${['op-new', 'op-review', 'patient-update', 'modify-doctor-reg', 'modify-patient-type', 'modify-payment-type-reg'].includes(activeView) ? 'active' : ''}`}
              onClick={() => toggleDropdown('registration')}
            >
              <UserCheck size={17} />
              <span>REGISTRATION</span>
              <ChevronDown size={14} className={openMenu === 'registration' ? 'rotate' : ''} />
            </button>

            {openMenu === 'registration' && (
              <div className="nav-dropdown-menu">
                {isAllowed('op-new') && (
                  <button 
                    className={`dropdown-item ${activeView === 'op-new' ? 'active' : ''}`}
                    onClick={() => handleSelect('op-new')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">OP NEW</div>
                      <div className="dropdown-desc">New Patient Outpatient Registration</div>
                    </div>
                  </button>
                )}

                {isAllowed('op-review') && (
                  <button 
                    className={`dropdown-item ${activeView === 'op-review' ? 'active' : ''}`}
                    onClick={() => handleSelect('op-review')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">OP REVIEW</div>
                      <div className="dropdown-desc">Follow-up &amp; Review Consultations</div>
                    </div>
                  </button>
                )}

                {isAllowed('patient-update') && (
                  <button 
                    className={`dropdown-item ${activeView === 'patient-update' ? 'active' : ''}`}
                    onClick={() => handleSelect('patient-update')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">PATIENT DETAIL UPDATE</div>
                      <div className="dropdown-desc">Update Demographics &amp; Phone Number</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-doctor-reg') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-doctor-reg' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-doctor-reg')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">DOCTOR NAME MODIFY - REGISTRATION</div>
                      <div className="dropdown-desc">Reassign Doctor on Registration Slip</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-patient-type') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-patient-type' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-patient-type')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">PATIENT TYPE MODIFY</div>
                      <div className="dropdown-desc">General, VIP, Corporate or Insurance</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-payment-type-reg') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-payment-type-reg' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-payment-type-reg')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">PAYMENT TYPE MODIFY</div>
                      <div className="dropdown-desc">Cash, Card, UPI on Registration</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. BILLING TAB */}
        {hasBillAccess && (
          <div 
            className="nav-dropdown-wrapper"
            onMouseEnter={() => setOpenMenu('billing')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button 
              className={`nav-menu-btn ${['op-billing', 'modify-doctor-bill', 'modify-payment-type-bill', 'refund-billing'].includes(activeView) ? 'active' : ''}`}
              onClick={() => toggleDropdown('billing')}
            >
              <Receipt size={17} />
              <span>BILLING</span>
              <ChevronDown size={14} className={openMenu === 'billing' ? 'rotate' : ''} />
            </button>

            {openMenu === 'billing' && (
              <div className="nav-dropdown-menu">
                {isAllowed('op-billing') && (
                  <button 
                    className={`dropdown-item ${activeView === 'op-billing' ? 'active' : ''}`}
                    onClick={() => handleSelect('op-billing')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">OP SERVICE BILLING</div>
                      <div className="dropdown-desc">Lab, Radiology &amp; Procedure Billing</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-doctor-bill') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-doctor-bill' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-doctor-bill')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">DOCTOR NAME MODIFY - OP BILL</div>
                      <div className="dropdown-desc">Update Tagged Doctor on Invoice</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-payment-type-bill') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-payment-type-bill' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-payment-type-bill')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">PAYMENT TYPE MODIFY</div>
                      <div className="dropdown-desc">Cash, Card, UPI, Credit on Bill</div>
                    </div>
                  </button>
                )}

                {(isAdmin || isAllowed('refund-billing') || isAllowed('op-billing')) && (
                  <button 
                    className={`dropdown-item ${activeView === 'refund-billing' ? 'active' : ''}`}
                    onClick={() => handleSelect('refund-billing')}
                  >
                    <span className="dropdown-bullet" style={{ background: '#dc2626' }}></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title" style={{ color: '#dc2626' }}>REFUND BILLING</div>
                      <div className="dropdown-desc">Revert Skipped Services &amp; Issue Refunds</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. REPORT TAB */}
        {hasReportAccess && (
          <div 
            className="nav-dropdown-wrapper"
            onMouseEnter={() => setOpenMenu('report')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button 
              className={`nav-menu-btn ${['report-billing', 'report-revenue', 'report-registration'].includes(activeView) ? 'active' : ''}`}
              onClick={() => toggleDropdown('report')}
            >
              <BarChart3 size={17} />
              <span>REPORT</span>
              <ChevronDown size={14} className={openMenu === 'report' ? 'rotate' : ''} />
            </button>

            {openMenu === 'report' && (
              <div className="nav-dropdown-menu">
                {isAllowed('report-billing') && (
                  <button 
                    className={`dropdown-item ${activeView === 'report-billing' ? 'active' : ''}`}
                    onClick={() => handleSelect('report-billing')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">OP BILLING</div>
                      <div className="dropdown-desc">Billing Register &amp; Daily Invoices</div>
                    </div>
                  </button>
                )}

                {isAllowed('report-revenue') && (
                  <button 
                    className={`dropdown-item ${activeView === 'report-revenue' ? 'active' : ''}`}
                    onClick={() => handleSelect('report-revenue')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">REVENUE (SUMMARY + SERVICE WISE)</div>
                      <div className="dropdown-desc">Category Breakdown &amp; Financial Inflow</div>
                    </div>
                  </button>
                )}

                {isAllowed('report-registration') && (
                  <button 
                    className={`dropdown-item ${activeView === 'report-registration' ? 'active' : ''}`}
                    onClick={() => handleSelect('report-registration')}
                  >
                    <span className="dropdown-bullet"></span>
                    <div className="dropdown-text">
                      <div className="dropdown-title">OP REGISTRATION</div>
                      <div className="dropdown-desc">Footfall, Doctor Loads &amp; Patient Types</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      <style>{`
        .navbar-container {
          background: #ffffff;
          border-bottom: 2px solid #2563eb;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
          position: sticky;
          top: 0;
          z-index: 1000;
          overflow: visible !important;
        }

        .navbar-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
        }

        .navbar-brand-logo-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 8px;
          background: #ffffff;
          padding: 2px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }

        .brand-logo {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(37,99,235,0.3);
        }

        .brand-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #0f172a;
        }

        .brand-sub {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 500;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .nav-pill-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .nav-pill-btn:hover, .nav-pill-btn.active {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 6px 14px;
          border-radius: 24px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .logout-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.15s;
        }

        .logout-btn:hover {
          background: #fee2e2;
        }

        .navbar-menu-strip {
          display: flex;
          padding: 0 24px;
          background: #1e3a8a;
          overflow: visible !important;
          position: relative;
        }

        .nav-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }

        .nav-menu-btn {
          background: transparent;
          border: none;
          color: #e0e7ff;
          padding: 13px 22px;
          font-weight: 700;
          font-size: 0.92rem;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          border-bottom: 3px solid transparent;
        }

        .nav-menu-btn:hover, .nav-menu-btn.active {
          background: #1d4ed8;
          color: #ffffff;
          border-bottom-color: #60a5fa;
        }

        .rotate {
          transform: rotate(180deg);
        }

        .nav-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 330px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-top: 3px solid #2563eb;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.22);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 99999;
          animation: slideDown 0.15s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          transition: all 0.12s ease;
          width: 100%;
        }

        .dropdown-item:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          transform: translateX(3px);
        }

        .dropdown-item.active {
          background: #dbeafe;
          border-color: #60a5fa;
        }

        .dropdown-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
          flex-shrink: 0;
        }

        .dropdown-text {
          flex: 1;
        }

        .dropdown-title {
          font-weight: 700;
          font-size: 0.86rem;
          color: #0f172a;
          letter-spacing: 0.02em;
        }

        .dropdown-desc {
          font-size: 0.74rem;
          color: #64748b;
          margin-top: 2px;
        }

        .highlight-tariff {
          background: #f0fdf4 !important;
          border-color: #bbf7d0 !important;
        }

        .highlight-tariff:hover {
          background: #dcfce7 !important;
          border-color: #86efac !important;
        }

        .bullet-tariff {
          background: #059669 !important;
        }

        .text-tariff {
          color: #065f46 !important;
          font-weight: 800 !important;
        }
      `}</style>
    </header>
  );
}
