import React from 'react';
import { useStore } from '../context/StoreProvider';
import { DollarSign, ArrowUpRight, ArrowDownRight, Target, Activity, Clock } from 'lucide-react';

export default function SummaryCards() {
  const { state } = useStore();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const pendingPayouts = state.payouts.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);

  // Calculate current month's total growth percentage
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyPct = state.growthHistory
    .filter(g => {
      const d = new Date(g.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + curr.percentage, 0);

  const cards = [
    { 
      title: 'Current Balance', 
      value: formatCurrency(state.currentBalance), 
      icon: <DollarSign size={24} color="#3b82f6" />,
      bg: 'rgba(59, 130, 246, 0.1)'
    },
    { 
      title: 'Profit Base Amount', 
      value: formatCurrency(state.currentBase), 
      icon: <Target size={24} color="#ec4899" />,
      bg: 'rgba(236, 72, 153, 0.1)'
    },
    { 
      title: 'Total Deposited', 
      value: formatCurrency(state.totalDeposited), 
      icon: <ArrowUpRight size={24} color="#10b981" />,
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    { 
      title: 'Total Withdrawn', 
      value: formatCurrency(state.totalWithdrawn), 
      icon: <ArrowDownRight size={24} color="#f59e0b" />,
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    { 
      title: 'Pending Payouts', 
      value: formatCurrency(pendingPayouts), 
      icon: <Clock size={24} color="#8b5cf6" />,
      bg: 'rgba(139, 92, 246, 0.1)'
    },
    { 
      title: "Portfolio Growth (Month)", 
      value: `${monthlyPct.toFixed(2)}%`, 
      icon: <Activity size={24} color="#06b6d4" />,
      bg: 'rgba(6, 182, 212, 0.1)'
    }
  ];

  return (
    <div className="summary-cards" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
      gap: '20px' 
    }}>
      {cards.map((card, idx) => (
        <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: card.bg, padding: '12px', borderRadius: '12px' }}>
            {card.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '500' }}>
              {card.title}
            </h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
