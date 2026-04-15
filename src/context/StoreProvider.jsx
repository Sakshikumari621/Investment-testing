import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('dashboard_state');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      isLoggedIn: false,
      user: null,
      currentBalance: 10000,
      totalDeposited: 0,
      totalWithdrawn: 0,
      monthlyTarget: 15000,
      deposits: [],
      payouts: [],
      growthData: null
    };
  });

  useEffect(() => {
    localStorage.setItem('dashboard_state', JSON.stringify(state));
  }, [state]);

  const login = (email, password) => {
    setState(prev => ({ ...prev, isLoggedIn: true, user: { email } }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, isLoggedIn: false, user: null }));
  };

  const addDeposit = (amount, method) => {
    const newDeposit = {
      id: Date.now(),
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      method,
      status: 'Completed'
    };
    setState(prev => ({
      ...prev,
      currentBalance: prev.currentBalance + newDeposit.amount,
      totalDeposited: prev.totalDeposited + newDeposit.amount,
      deposits: [newDeposit, ...prev.deposits]
    }));
  };

  const requestPayout = (amount, method, details) => {
    const newPayout = {
      id: Date.now(),
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      method,
      details,
      status: 'Pending'
    };
    setState(prev => ({
      ...prev,
      currentBalance: prev.currentBalance - newPayout.amount,
      payouts: [newPayout, ...prev.payouts]
    }));
  };

  const approvePayout = (id) => {
    setState(prev => {
      const payouts = prev.payouts.map(p => {
        if (p.id === id) return { ...p, status: 'Approved' };
        return p;
      });
      const payout = prev.payouts.find(p => p.id === id);
      return {
        ...prev,
        payouts,
        totalWithdrawn: prev.totalWithdrawn + payout.amount
      };
    });
  };

  const rejectPayout = (id) => {
    setState(prev => {
      const payouts = prev.payouts.map(p => {
        if (p.id === id) return { ...p, status: 'Rejected' };
        return p;
      });
      const payout = prev.payouts.find(p => p.id === id);
      return {
        ...prev,
        payouts,
        currentBalance: prev.currentBalance + payout.amount
      };
    });
  };

  const generateGrowthData = () => {
    const totalGrowth = (Math.random() * 4 + 1).toFixed(2); // 1.00% to 5.00%
    const now = new Date();
    // use a random future month just to make it dynamic if user clicks multiple times
    const simMonth = Math.floor(Math.random() * 12);
    const numDaysInMonth = new Date(now.getFullYear(), simMonth + 1, 0).getDate();
    let weekdays = [];
    for (let i = 1; i <= numDaysInMonth; i++) {
      const d = new Date(now.getFullYear(), simMonth, i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        weekdays.push(`Day ${i}`);
      }
    }
    const numWeekdays = weekdays.length;
    
    // Distribute totalGrowth randomly to sum exactly to totalGrowth
    let randoms = Array.from({length: numWeekdays}, () => Math.random());
    let sumRandoms = randoms.reduce((a, b) => a + b, 0);
    let normalized = randoms.map(r => (r / sumRandoms) * parseFloat(totalGrowth));
    
    // Fix floating point sum rounding issues
    let diff = parseFloat(totalGrowth) - normalized.reduce((a, b) => a + b, 0);
    normalized[0] += diff;

    const monthsRaw = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daily = weekdays.map((day, ix) => ({
      day,
      pct: normalized[ix].toFixed(3),
    }));

    setState(prev => ({
      ...prev,
      growthData: {
        month: `${monthsRaw[simMonth]} ${now.getFullYear()}`,
        monthlyGrowthPct: totalGrowth,
        daily
      }
    }));
  };

  useEffect(() => {
    if (!state.growthData) {
      generateGrowthData();
    }
  }, []);

  return (
    <StoreContext.Provider value={{
      state,
      login,
      logout,
      addDeposit,
      requestPayout,
      approvePayout,
      rejectPayout,
      generateGrowthData
    }}>
      {children}
    </StoreContext.Provider>
  );
}
