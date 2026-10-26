import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ChevronDown, 
  LayoutGrid, 
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
  User as UserIcon,
  Lock
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

  // Check if at least one sub-item in section is allowed
  const hasMasterAccess = isAdmin || isAllowed('admin') || isAllowed('users') || isAllowed('services');
  const hasRegAccess = isAdmin || ['op-new', 'op-review', 'patient-update', 'modify-doctor-reg', 'modify-patient-type', 'modify-payment-type-reg'].some(isAllowed);
  const hasBillAccess = isAdmin || ['op-billing', 'modify-doctor-bill', 'modify-payment-type-bill'].some(isAllowed);
  const hasReportAccess = isAdmin || ['report-billing', 'report-revenue', 'report-registration'].some(isAllowed);

  return (
    <header className="navbar-container" ref={navRef}>
      <div className="navbar-top">
        <div className="navbar-brand" onClick={() => setActiveView('dashboard')}>
          <div className="brand-logo">
            <Building2 size={24} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">KHC HOSPITAL INFORMATION SYSTEM</div>
            <div className="brand-sub">HIMS Navigation &amp; Outpatient Operations Suite</div>
          </div>
        </div>

        <div className="navbar-actions">
          <button 
            className={`nav-pill-btn ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutGrid size={16} />
            <span>Concept Menu Grid</span>
          </button>

          {/* User Profile Pill */}
          {currentUser && (
            <div className="user-profile-badge">
              <UserIcon size={16} color="#2563eb" />
              <div className="user-details">
                <span className="user-name">{currentUser.fullName || currentUser.username}</span>
                <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-success'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {currentUser.role} {isAdmin ? '(ALL RIGHTS)' : '(SELECTED)'}
                </span>
              </div>
              <button className="logout-btn" onClick={onLogout} title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar-menu-strip">
        {/* 1. MASTER (Hidden or restricted for normal user unless granted) */}
        {hasMasterAccess && (
          <div className="nav-dropdown-wrapper">
            <button 
              className={`nav-menu-btn ${['admin', 'users', 'services'].includes(activeView) ? 'active' : ''}`}
              onClick={() => toggleDropdown('master')}
            >
              <ShieldCheck size={16} />
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
                    <ShieldCheck size={16} className="item-icon" />
                    <div>
                      <div className="item-title">ADMIN</div>
                      <div className="item-desc">Doctor Master &amp; Hospital Controls</div>
                    </div>
                  </button>
                )}

                {isAllowed('users') && (
                  <button 
                    className={`dropdown-item ${activeView === 'users' ? 'active' : ''}`}
                    onClick={() => handleSelect('users')}
                  >
                    <UserPlus size={16} className="item-icon" />
                    <div>
                      <div className="item-title">USER CREATION</div>
                      <div className="item-desc">Staff &amp; System User Credentials</div>
                    </div>
                  </button>
                )}

                {isAllowed('services') && (
                  <button 
                    className={`dropdown-item ${activeView === 'services' ? 'active' : ''}`}
                    onClick={() => handleSelect('services')}
                  >
                    <Layers size={16} className="item-icon" />
                    <div>
                      <div className="item-title">SERVICE MASTER</div>
                      <div className="item-desc">Tariff Rates (ECG, Lab, CBC, OP/IP Rate)</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. REGISTRATION */}
        {hasRegAccess && (
          <div className="nav-dropdown-wrapper">
            <button 
              className={`nav-menu-btn ${['op-new', 'op-review', 'patient-update', 'modify-doctor-reg', 'modify-patient-type', 'modify-payment-type-reg'].includes(activeView) ? 'active' : ''}`}
              onClick={() => toggleDropdown('registration')}
            >
              <UserCheck size={16} />
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
                    <UserPlus size={16} className="item-icon" />
                    <div>
                      <div className="item-title">OP NEW</div>
                      <div className="item-desc">New Patient Outpatient Registration</div>
                    </div>
                  </button>
                )}

                {isAllowed('op-review') && (
                  <button 
                    className={`dropdown-item ${activeView === 'op-review' ? 'active' : ''}`}
                    onClick={() => handleSelect('op-review')}
                  >
                    <History size={16} className="item-icon" />
                    <div>
                      <div className="item-title">OP REVIEW</div>
                      <div className="item-desc">Follow-up &amp; Review Consultations</div>
                    </div>
                  </button>
                )}

                {isAllowed('patient-update') && (
                  <button 
                    className={`dropdown-item ${activeView === 'patient-update' ? 'active' : ''}`}
                    onClick={() => handleSelect('patient-update')}
                  >
                    <UserCog size={16} className="item-icon" />
                    <div>
                      <div className="item-title">PATIENT DETAIL UPDATE</div>
                      <div className="item-desc">Update Demographics &amp; Contact Info</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-doctor-reg') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-doctor-reg' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-doctor-reg')}
                  >
                    <Stethoscope size={16} className="item-icon" />
                    <div>
                      <div className="item-title">DOCTORE NAME MODIFY - REGISTRATION</div>
                      <div className="item-desc">Reassign Consulting Doctor</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-patient-type') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-patient-type' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-patient-type')}
                  >
                    <Activity size={16} className="item-icon" />
                    <div>
                      <div className="item-title">PATIENT TYPE MODIFY</div>
                      <div className="item-desc">General, VIP, Corporate or Insurance</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-payment-type-reg') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-payment-type-reg' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-payment-type-reg')}
                  >
                    <CreditCard size={16} className="item-icon" />
                    <div>
                      <div className="item-title">PAYMENT TYPE MODIFY</div>
                      <div className="item-desc">Cash, Card, UPI on Registration</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. BILLING */}
        {hasBillAccess && (
          <div className="nav-dropdown-wrapper">
            <button 
              className={`nav-menu-btn ${['op-billing', 'modify-doctor-bill', 'modify-payment-type-bill'].includes(activeView) ? 'active' : ''}`}
              onClick={() => toggleDropdown('billing')}
            >
              <Receipt size={16} />
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
                    <Receipt size={16} className="item-icon" />
                    <div>
                      <div className="item-title">OP SERVICE BILLING</div>
                      <div className="item-desc">Lab, Radiology &amp; Procedure Invoicing</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-doctor-bill') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-doctor-bill' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-doctor-bill')}
                  >
                    <Stethoscope size={16} className="item-icon" />
                    <div>
                      <div className="item-title">DOCTOR NAME MODIFY - OP BILL</div>
                      <div className="item-desc">Update Tagged Doctor on Invoice</div>
                    </div>
                  </button>
                )}

                {isAllowed('modify-payment-type-bill') && (
                  <button 
                    className={`dropdown-item ${activeView === 'modify-payment-type-bill' ? 'active' : ''}`}
                    onClick={() => handleSelect('modify-payment-type-bill')}
                  >
                    <CreditCard size={16} className="item-icon" />
                    <div>
                      <div className="item-title">PAYMENT TYPE MODIFY</div>
                      <div className="item-desc">Change Payment Mode on Invoice</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. REPORT */}
        {hasReportAccess && (
          <div className="nav-dropdown-wrapper">
            <button 
              className={`nav-menu-btn ${['report-billing', 'report-revenue', 'report-registration'].includes(activeView) ? 'active' : ''}`}
              onClick={() => toggleDropdown('report')}
            >
              <BarChart3 size={16} />
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
                    <FileText size={16} className="item-icon" />
                    <div>
                      <div className="item-title">OP BILLING</div>
                      <div className="item-desc">Financial Audit &amp; Invoicing Registry</div>
                    </div>
                  </button>
                )}

                {isAllowed('report-revenue') && (
                  <button 
                    className={`dropdown-item ${activeView === 'report-revenue' ? 'active' : ''}`}
                    onClick={() => handleSelect('report-revenue')}
                  >
                    <PieChart size={16} className="item-icon" />
                    <div>
                      <div className="item-title">REVENUE (SUMMARY + SERVICE WIAS)</div>
                      <div className="item-desc">Category Breakdown &amp; Total Inflow</div>
                    </div>
                  </button>
                )}

                {isAllowed('report-registration') && (
                  <button 
                    className={`dropdown-item ${activeView === 'report-registration' ? 'active' : ''}`}
                    onClick={() => handleSelect('report-registration')}
                  >
                    <BarChart3 size={16} className="item-icon" />
                    <div>
                      <div className="item-title">OP REGISTRATION</div>
                      <div className="item-desc">Footfall, Doctor Loads &amp; Patient Types</div>
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
          z-index: 100;
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
          padding: 8px 14px;
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
          overflow-x: auto;
        }
        .nav-dropdown-wrapper {
          position: relative;
        }
        .nav-menu-btn {
          background: transparent;
          border: none;
          color: #e0e7ff;
          padding: 12px 18px;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.04em;
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
          min-width: 320px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 200;
          animation: slideDown 0.15s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dropdown-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          transition: all 0.12s ease;
          width: 100%;
        }
        .dropdown-item:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
        }
        .dropdown-item.active {
          background: #dbeafe;
          border-color: #93c5fd;
        }
        .item-icon {
          color: #2563eb;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .item-title {
          font-weight: 700;
          font-size: 0.85rem;
          color: #1e293b;
        }
        .item-desc {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 2px;
        }
      `}</style>
    </header>
  );
}
