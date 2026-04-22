import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreProvider';
import { LayoutDashboard, TrendingUp, CreditCard, Send, LogOut, Menu, X, LifeBuoy } from 'lucide-react';
import SummaryCards from './SummaryCards';
import GrowthView from './GrowthView';
import DepositView from './DepositView';
import PayoutView from './PayoutView';
import SupportView from './SupportView';
import KYCResubmitForm from './KYCResubmitForm';
import './Dashboard.css';

export default function Dashboard() {
  const { state, logout } = useStore();
  const [activeTab, setActiveTab] = useState('growth');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResubmitForm, setShowResubmitForm] = useState(false);
  const tabContentRef = useRef(null);

  // Scroll to tab content when switching to deposit or payout
  useEffect(() => {
    if (activeTab === 'deposit' || activeTab === 'payout') {
      setTimeout(() => {
        tabContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'growth', label: 'Investment Growth', icon: <TrendingUp size={20} /> },
    { id: 'deposit', label: 'Deposit Funds', icon: <CreditCard size={20} /> },
    { id: 'payout', label: 'Payout Requests', icon: <Send size={20} /> },
    { id: 'support', label: 'Support', icon: <LifeBuoy size={20} /> }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const goToDashboard = () => {
    setActiveTab('growth');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={goToDashboard} style={{ cursor: 'pointer' }} title="Back to Dashboard">
            <LayoutDashboard size={24} color="var(--accent-primary)" />
            <span className="text-gradient" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>InvestPro</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">{state.user?.email.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <p className="user-name" style={{ fontWeight: 'bold' }}>{state.user?.name}</p>
            <p className="user-email" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{state.user?.email}</p>
            <div style={{ marginTop: '8px', fontSize: '0.75rem', display: 'flex', gap: '4px', flexDirection: 'column' }}>
              <span style={{ color: state.user?.kycStatus === 'Approved' ? '#10b981' : '#f59e0b' }}>
                KYC: {state.user?.kycStatus} {state.user?.kycStatus === 'Approved' ? '✅' : '⏳'}
              </span>
              <span style={{ fontSize: '0.7rem' }}>PAN: {state.user?.panNumber} {state.user?.panVerified ? '✅' : '⏳'}</span>
              <span style={{ fontSize: '0.7rem' }}>ADHR: {state.user?.aadhaarNumber} {state.user?.aadhaarVerified ? '✅' : '⏳'}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            <span className="nav-icon"><LogOut size={20} /></span>
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="mobile-header glass-panel">
          <div className="logo" onClick={goToDashboard} style={{ cursor: 'pointer' }} title="Back to Dashboard">
            <LayoutDashboard size={24} color="var(--accent-primary)" />
            <span className="text-gradient" style={{ fontWeight: 'bold' }}>InvestPro</span>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        <div className="content-wrapper animate-fade-in">
          <header className="page-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <h2>Welcome back, {state.user?.name.split(' ')[0]}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Initial Deposit: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
                    state.deposits
                      .filter(d => d.status === 'Completed')
                      .sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.amount || 0
                  )}
                </p>
              </div>
              
              <div className={`kyc-badge ${state.user?.kycStatus.toLowerCase()}`} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: state.user?.kycStatus === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                 state.user?.kycStatus === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: state.user?.kycStatus === 'Approved' ? '#10b981' : 
                       state.user?.kycStatus === 'Rejected' ? '#ef4444' : '#f59e0b',
                border: `1px solid ${state.user?.kycStatus === 'Approved' ? '#10b981' : 
                                       state.user?.kycStatus === 'Rejected' ? '#ef4444' : '#f59e0b'}`
              }}>
                KYC STATUS: {state.user?.kycStatus.toUpperCase()}
              </div>
            </div>
          </header>

          {state.user?.kycStatus === 'Rejected' && (
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
              {!showResubmitForm ? (
                <>
                  <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>KYC Resubmission Required</h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                    Reason: <span style={{ fontWeight: 'bold' }}>{state.user?.kycRejectionReason || 'Please check your documents and re-upload.'}</span>
                  </p>
                  <button 
                    className="btn-primary" 
                    style={{ backgroundColor: '#ef4444' }} 
                    onClick={() => setShowResubmitForm(true)}
                  >
                    Resubmit Documents
                  </button>
                </>
              ) : (
                <KYCResubmitForm onComplete={() => setShowResubmitForm(false)} />
              )}
            </div>
          )}

          <SummaryCards />

          <div ref={tabContentRef} className="tab-content glass-panel" style={{ marginTop: '24px', padding: '24px' }}>
            {activeTab === 'growth' && <GrowthView />}
            {activeTab === 'deposit' && <DepositView />}
            {activeTab === 'payout' && <PayoutView />}
            {activeTab === 'support' && <SupportView />}
          </div>
        </div>
      </main>
    </div>
  );
}
