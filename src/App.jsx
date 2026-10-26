import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ConceptMenuGrid from './components/ConceptMenuGrid';
import LoginPage from './pages/auth/LoginPage';

// Master Pages
import AdminPage from './pages/master/AdminPage';
import UserCreationPage from './pages/master/UserCreationPage';
import ServiceMasterPage from './pages/master/ServiceMasterPage';

// Registration Pages
import OpNewPage from './pages/registration/OpNewPage';
import OpReviewPage from './pages/registration/OpReviewPage';
import PatientUpdatePage from './pages/registration/PatientUpdatePage';
import ModifyDoctorRegPage from './pages/registration/ModifyDoctorRegPage';
import ModifyPatientTypePage from './pages/registration/ModifyPatientTypePage';
import ModifyPaymentTypeRegPage from './pages/registration/ModifyPaymentTypeRegPage';

// Billing Pages
import OpServiceBillingPage from './pages/billing/OpServiceBillingPage';
import ModifyDoctorBillPage from './pages/billing/ModifyDoctorBillPage';
import ModifyPaymentTypeBillPage from './pages/billing/ModifyPaymentTypeBillPage';

// Report Pages
import OpBillingReportPage from './pages/reports/OpBillingReportPage';
import RevenueReportPage from './pages/reports/RevenueReportPage';
import OpRegistrationReportPage from './pages/reports/OpRegistrationReportPage';

import { api } from './services/api';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('khc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.warn('Backend not ready yet or loading stats failed:', err.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadStats();
    }
  }, [activeView, currentUser]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('khc_user', JSON.stringify(userData));
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('khc_user');
    setActiveView('dashboard');
  };

  // If not logged in, render the login page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'ADMIN';
  const allowed = Array.isArray(currentUser?.allowedMenus)
    ? currentUser.allowedMenus
    : (currentUser?.allowedMenus || '').split(/[\s,]+/).map(s => s.trim()).filter(Boolean);

  const isPermitted = (viewId) => {
    if (viewId === 'dashboard') return true;
    if (isAdmin) return true;
    return allowed.includes(viewId);
  };

  const renderCurrentView = () => {
    if (!isPermitted(activeView)) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: '#fee2e2', borderRadius: '50%', color: '#dc2626', marginBottom: '16px' }}>
            <ShieldAlert size={48} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Access Restricted
          </h2>
          <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 20px' }}>
            Your account (<strong>{currentUser.username}</strong>) has the <strong>{currentUser.role}</strong> role and only has access to selected menus. This screen requires Administrator permissions.
          </p>
          <button className="btn btn-primary" onClick={() => setActiveView('dashboard')}>
            Return to Allowed Menus
          </button>
        </div>
      );
    }

    switch (activeView) {
      // Master
      case 'admin':
        return <AdminPage />;
      case 'users':
        return <UserCreationPage />;
      case 'services':
        return <ServiceMasterPage />;

      // Registration
      case 'op-new':
        return <OpNewPage onRegistrationSuccess={loadStats} />;
      case 'op-review':
        return <OpReviewPage />;
      case 'patient-update':
        return <PatientUpdatePage />;
      case 'modify-doctor-reg':
        return <ModifyDoctorRegPage />;
      case 'modify-patient-type':
        return <ModifyPatientTypePage />;
      case 'modify-payment-type-reg':
        return <ModifyPaymentTypeRegPage />;

      // Billing
      case 'op-billing':
        return <OpServiceBillingPage />;
      case 'modify-doctor-bill':
        return <ModifyDoctorBillPage />;
      case 'modify-payment-type-bill':
        return <ModifyPaymentTypeBillPage />;

      // Reports
      case 'report-billing':
        return <OpBillingReportPage />;
      case 'report-revenue':
        return <RevenueReportPage />;
      case 'report-registration':
        return <OpRegistrationReportPage />;

      // Default: Concept Overview
      case 'dashboard':
      default:
        return <ConceptMenuGrid onNavigate={setActiveView} stats={stats} currentUser={currentUser} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="main-content">
        {/* Breadcrumb Navigation when viewing a sub-screen */}
        {activeView !== 'dashboard' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.85rem', color: '#64748b' }}>
            <button 
              onClick={() => setActiveView('dashboard')}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}
            >
              Main Menu
            </button>
            <span>/</span>
            <span style={{ textTransform: 'uppercase', fontWeight: '700', color: '#1e293b' }}>
              {activeView.replace(/-/g, ' ')}
            </span>
          </div>
        )}

        {renderCurrentView()}
      </main>

      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '16px 24px', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
        KHC - Hospital Information Management System &copy; {new Date().getFullYear()} &bull; Signed in as: <strong>{currentUser.username}</strong> ({currentUser.role})
      </footer>
    </div>
  );
}
