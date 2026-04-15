import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { LayoutDashboard, TrendingUp, CreditCard, Send, LogOut, Menu, X } from 'lucide-react';
import SummaryCards from './SummaryCards';
import GrowthView from './GrowthView';
import DepositView from './DepositView';
import PayoutView from './PayoutView';
import './Dashboard.css';

export default function Dashboard() {
  const { state, logout } = useStore();
  const [activeTab, setActiveTab] = useState('growth');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'growth', label: 'Investment Growth', icon: <TrendingUp size={20} /> },
    { id: 'deposit', label: 'Deposit Funds', icon: <CreditCard size={20} /> },
    { id: 'payout', label: 'Payout Requests', icon: <Send size={20} /> }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
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
            <p className="user-email">{state.user?.email}</p>
            <p className="user-status">Verified Account</p>
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
          <div className="logo">
            <LayoutDashboard size={24} color="var(--accent-primary)" />
            <span className="text-gradient" style={{ fontWeight: 'bold' }}>InvestPro</span>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        <div className="content-wrapper animate-fade-in">
          <header className="page-header">
            <h2>Welcome back, Investor</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Here's your portfolio overview</p>
          </header>

          <SummaryCards />

          <div className="tab-content glass-panel" style={{ marginTop: '24px', padding: '24px' }}>
            {activeTab === 'growth' && <GrowthView />}
            {activeTab === 'deposit' && <DepositView />}
            {activeTab === 'payout' && <PayoutView />}
          </div>
        </div>
      </main>
    </div>
  );
}
