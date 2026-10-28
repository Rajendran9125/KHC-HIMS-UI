import React from 'react';
import { 
  Building2, 
  ArrowUp, 
  Users, 
  Receipt, 
  DollarSign, 
  Layers, 
  Stethoscope, 
  Activity, 
  HeartPulse, 
  Microscope, 
  Clock, 
  PhoneCall, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function ConceptMenuGrid({ stats, currentUser }) {
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="clinic-dashboard">
      {/* 1. TOP NAVIGATION GUIDE BANNER (POINTS UP TO THE BLUE BAR) */}
      {/* <div className="top-nav-guide-banner">
        <div className="guide-left">
          <div className="arrow-pulse-box">
            <ArrowUp size={22} className="pulse-arrow" />
          </div>
          <div>
            <div className="guide-tag">MAIN MENU NAVIGATION</div>
            <h2 className="guide-heading">Use the Top Blue Navigation Bar to Open Modules</h2>
            <p className="guide-sub">
              Hover or click any tab above — <strong>MASTER</strong>, <strong>REGISTRATION</strong>, <strong>BILLING</strong>, or <strong>REPORT</strong> — to access functions like Admin, User Creation, Service Master (Tariff), OP New, and Reports.
            </p>
          </div>
        </div>

        <div className="guide-right">
          <div className="session-card">
            <div className="session-user">
              Signed in: <strong>{currentUser?.fullName || currentUser?.username}</strong>
            </div>
            <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-success'}`}>
              {isAdmin ? '🛡️ ADMIN (ALL RIGHTS)' : '🔒 USER (ASSIGNED MENUS)'}
            </span>
          </div>
        </div>
      </div> */}

      {/* 2. CLINIC PICTURE & HERO SHOWCASE */}
      <div className="clinic-hero-card">
        <div className="clinic-hero-media">
          <img 
            src="/clinic-hero.jpg" 
            alt="KHC Multi-Speciality Clinic Reception" 
            className="clinic-photo"
            onError={(e) => {
              // Graceful fallback to Unsplash web URL if local load fails
              e.currentTarget.src = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80";
            }}
          />
          <div className="clinic-photo-gradient"></div>
          
          <div className="clinic-hero-content">
            <div className="hospital-brand-pill">
              <Building2 size={16} />
              <span>KHC MULTI-SPECIALITY CLINIC &amp; HOSPITAL</span>
            </div>
            <h1 className="hospital-title">Outpatient &amp; Healthcare Operations Suite</h1>
            <p className="hospital-description">
              Welcome to the Hospital Information Management System (HIMS). Deliver seamless patient registrations, real-time diagnostic tariff configuration, and comprehensive outpatient billing workflows.
            </p>

            <div className="clinic-facility-chips">
              <div className="chip">
                <span className="chip-dot"></span>
                <span>OPD Services Active</span>
              </div>
              <div className="chip">
                <Clock size={14} />
                <span>08:00 AM – 08:00 PM</span>
              </div>
              <div className="chip">
                <HeartPulse size={14} />
                <span>24/7 Emergency &amp; Trauma</span>
              </div>
              <div className="chip">
                <PhoneCall size={14} />
                <span>Emergency: +91 44 2800 1234</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HOSPITAL OPERATIONAL ACTIVITY SNAPSHOT (KPI METRICS) */}
      <div className="kpi-section-title">
        <span className="line"></span>
        <span className="title-text">HOSPITAL ACTIVITY &amp; FINANCIAL SNAPSHOT</span>
        <span className="line"></span>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total OP Registrations</span>
            <span className="kpi-value">{stats?.totalRegistrations ?? '—'}</span>
            <span className="kpi-sub">Outpatient patient footfall</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <Receipt size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Bills Generated</span>
            <span className="kpi-value">{stats?.totalBills ?? '—'}</span>
            <span className="kpi-sub">Invoices processed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Revenue</span>
            <span className="kpi-value">₹{Number(stats?.totalRevenue || 0).toLocaleString()}</span>
            <span className="kpi-sub">Consolidated income</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            <Layers size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Configured Services</span>
            <span className="kpi-value">{stats?.totalServices ?? '17'}</span>
            <span className="kpi-sub">Tariff master items</span>
          </div>
        </div>
      </div>

      {/* 4. CLINICAL WINGS & SPECIALITIES DIRECTORY */}
      <div className="departments-grid">
        <div className="dept-card">
          <div className="dept-icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <HeartPulse size={22} />
          </div>
          <h4>Cardiology &amp; ECG</h4>
          <p>12-Lead ECG, 2D Echo, Cardiac OPD Consultations, and preventative health checks.</p>
          <span className="dept-badge">OPD-101 &bull; Dr. Rajesh Sharma</span>
        </div>

        <div className="dept-card">
          <div className="dept-icon-box" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <Microscope size={22} />
          </div>
          <h4>Diagnostic Pathology</h4>
          <p>Complete Blood Count (CBC), RBS, LFT, Lipid Profile, and Clinical Biochemistry tests.</p>
          <span className="dept-badge">Central Lab &bull; Floor 1</span>
        </div>

        <div className="dept-card">
          <div className="dept-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Activity size={22} />
          </div>
          <h4>Digital Radiology</h4>
          <p>High-resolution Digital Chest X-Ray, Abdomen Ultrasound (USG), and Imaging.</p>
          <span className="dept-badge">Radiology Wing &bull; Block B</span>
        </div>

        <div className="dept-card">
          <div className="dept-icon-box" style={{ background: '#dcfce7', color: '#15803d' }}>
            <Stethoscope size={22} />
          </div>
          <h4>General OPD &amp; Medicine</h4>
          <p>New patient registrations, follow-up reviews, and multi-speciality consultations.</p>
          <span className="dept-badge">OPD-102 &bull; Dr. Priya Nair</span>
        </div>
      </div>

      <style>{`
        .clinic-dashboard {
          width: 100%;
        }

        /* Top Guide Banner pointing to Top Menu Bar */
        .top-nav-guide-banner {
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
          border: 1px solid #bfdbfe;
          border-left: 5px solid #2563eb;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 6px rgba(37,99,235,0.08);
        }

        .guide-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .arrow-pulse-box {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #dbeafe;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          animation: bounce 1.8s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .pulse-arrow {
          color: #1d4ed8;
        }

        .guide-tag {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #2563eb;
          margin-bottom: 2px;
        }

        .guide-heading {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 3px 0;
        }

        .guide-sub {
          font-size: 0.85rem;
          color: #475569;
          margin: 0;
        }

        .session-card {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .session-user {
          font-size: 0.82rem;
          color: #334155;
        }

        /* Clinic Hero Photo Card */
        .clinic-hero-card {
          background: #0f172a;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 28px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
          border: 1px solid #334155;
        }

        .clinic-hero-media {
          position: relative;
          min-height: 340px;
          display: flex;
          align-items: flex-end;
        }

        .clinic-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: brightness(0.65);
        }

        .clinic-photo-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.95) 0%,
            rgba(15, 23, 42, 0.6) 45%,
            rgba(30, 58, 138, 0.35) 100%
          );
        }

        .clinic-hero-content {
          position: relative;
          z-index: 2;
          padding: 32px 36px;
          color: #ffffff;
          max-width: 820px;
        }

        .hospital-brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(37, 99, 235, 0.85);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          margin-bottom: 12px;
          backdrop-filter: blur(4px);
        }

        .hospital-title {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0 0 10px 0;
          line-height: 1.2;
        }

        .hospital-description {
          font-size: 0.95rem;
          color: #cbd5e1;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }

        .clinic-facility-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(6px);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #ffffff;
        }

        .chip-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 6px #10b981;
        }

        /* KPI Divider */
        .kpi-section-title {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 12px 0 20px 0;
        }

        .line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .title-text {
          font-size: 0.72rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.1em;
        }

        .kpi-sub {
          font-size: 0.74rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* Clinical Departments */
        .departments-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-top: 24px;
        }

        @media (max-width: 1024px) {
          .departments-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .top-nav-guide-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .session-card {
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .departments-grid {
            grid-template-columns: 1fr;
          }
        }

        .dept-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .dept-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }

        .dept-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .dept-card h4 {
          font-size: 0.98rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .dept-card p {
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.45;
          margin: 0 0 14px 0;
          flex: 1;
        }

        .dept-badge {
          font-size: 0.72rem;
          font-weight: 600;
          color: #2563eb;
          background: #eff6ff;
          padding: 4px 8px;
          border-radius: 4px;
          align-self: flex-start;
        }
      `}</style>
    </div>
  );
}
