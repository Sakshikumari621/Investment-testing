import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const [state, setState] = useState({
    isLoggedIn: false,
    user: null,
    currentBalance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    monthlyTarget: 15000,
    deposits: [],
    payouts: [],
    growthData: null
  });

  const [isLoading, setIsLoading] = useState(true);

  // Helper to talk to backend
  const apiCall = async (endpoint, method = 'GET', body = null) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || (data.errors && data.errors[0]?.msg) || 'API Error');
    }
    return data;
  };

  const fetchTransactions = async () => {
    try {
      const txData = await apiCall('/api/transactions');
      setState(prev => ({
        ...prev,
        deposits: txData.data.deposits,
        payouts: txData.data.payouts,
        currentBalance: txData.data.currentBalance,
        totalDeposited: txData.data.totalDeposited,
        totalWithdrawn: txData.data.totalWithdrawn
      }));
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiCall('/api/auth/me');
        setState(prev => ({ 
          ...prev, 
          isLoggedIn: true, 
          user: data.data,
        }));
        await fetchTransactions();
      } catch (e) {
        console.log('Not logged in', e.message);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await apiCall('/api/auth/login', 'POST', { email, password });
    setState(prev => ({ 
      ...prev, 
      isLoggedIn: true, 
      user: data.user
    }));
    await fetchTransactions();
  };

  const register = async (name, email, password) => {
    const data = await apiCall('/api/auth/register', 'POST', { name, email, password });
    setState(prev => ({ 
      ...prev, 
      isLoggedIn: true, 
      user: data.user
    }));
    await fetchTransactions();
  };

  const logout = async () => {
    try {
      await apiCall('/api/auth/logout', 'POST');
    } catch (e) {
      console.error(e);
    } finally {
      setState(prev => ({ 
        ...prev, 
        isLoggedIn: false, 
        user: null,
        currentBalance: 0,
        deposits: [],
        payouts: []
      }));
    }
  };

  const addDeposit = async (amount, method) => {
    try {
      await apiCall('/api/transactions/deposit', 'POST', { amount, method });
      // Refresh transactions to show the new pending deposit
      await fetchTransactions();
    } catch (error) {
      console.error('Deposit Error:', error);
      alert(error.message);
    }
  };

  const requestPayout = async (amount, method, details) => {
    try {
      await apiCall('/api/transactions/payout', 'POST', { amount, method, details });
      await fetchTransactions();
    } catch (error) {
      console.error('Payout Error:', error);
      alert(error.message);
    }
  };

  const generateGrowthData = () => {
    const totalGrowth = (Math.random() * 4 + 1).toFixed(2); 
    const now = new Date();
    const simMonth = Math.floor(Math.random() * 12);
    const numDaysInMonth = new Date(now.getFullYear(), simMonth + 1, 0).getDate();
    let weekdays = [];
    for (let i = 1; i <= numDaysInMonth; i++) {
        const d = new Date(now.getFullYear(), simMonth, i);
        if (d.getDay() !== 0 && d.getDay() !== 6) weekdays.push(`Day ${i}`);
    }
    
    let randoms = Array.from({length: weekdays.length}, () => Math.random());
    let sumRandoms = randoms.reduce((a, b) => a + b, 0);
    let normalized = randoms.map(r => (r / sumRandoms) * parseFloat(totalGrowth));
    normalized[0] += parseFloat(totalGrowth) - normalized.reduce((a, b) => a + b, 0);

    const monthsRaw = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    setState(prev => ({
      ...prev,
      growthData: {
        month: `${monthsRaw[simMonth]} ${now.getFullYear()}`,
        monthlyGrowthPct: totalGrowth,
        daily: weekdays.map((day, ix) => ({ day, pct: normalized[ix].toFixed(3) }))
      }
    }));
  };

  useEffect(() => {
    if (!state.growthData && state.isLoggedIn) {
      generateGrowthData();
    }
  }, [state.isLoggedIn]);

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{
      state,
      login,
      register,
      logout,
      addDeposit,
      requestPayout,
      generateGrowthData,
      fetchTransactions
    }}>
      {children}
    </StoreContext.Provider>
  );
}
