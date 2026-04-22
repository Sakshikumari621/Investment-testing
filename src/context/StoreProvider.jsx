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
    deposits: [],
    payouts: [],
    growthHistory: [],
    totalGrowthEarned: 0,
    currentBase: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Helper to talk to backend
  const apiCall = async (endpoint, method = 'GET', body = null, isMultipart = false) => {
    const options = {
      method,
      headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
      credentials: 'include'
    };

    // Add Authorization header if token exists in localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      options.headers['Authorization'] = `Bearer ${savedToken}`;
    }
    
    if (body) {
      options.body = isMultipart ? body : JSON.stringify(body);
    }
    
    const BASE_URL = '';
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok || !data.success) {
      // If unauthorized, we might want to clear local storage
      if (res.status === 401) {
        localStorage.removeItem('token');
      }
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
        growthHistory: txData.data.growthHistory,
        currentBalance: txData.data.currentBalance,
        totalDeposited: txData.data.totalDeposited,
        totalWithdrawn: txData.data.totalWithdrawn,
        totalGrowthEarned: txData.data.totalGrowthEarned,
        currentBase: txData.data.currentBase
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
    
    // Save token for persistent sessions across refreshes
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    setState(prev => ({ 
      ...prev, 
      isLoggedIn: true, 
      user: data.user
    }));
    await fetchTransactions();
  };

  const register = async (formData) => {
    const data = await apiCall('/api/auth/register', 'POST', formData, true);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

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
      localStorage.removeItem('token');
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

  const addDeposit = async (amount, method, network) => {
    try {
      await apiCall('/api/transactions/deposit', 'POST', { amount, method, network });
      // Refresh transactions to show the new pending deposit
      await fetchTransactions();
    } catch (error) {
      console.error('Deposit Error:', error);
      alert(error.message);
    }
  };

  const requestPayout = async (amount, method, details, network) => {
    try {
      await apiCall('/api/transactions/payout', 'POST', { amount, method, details, network });
      await fetchTransactions();
    } catch (error) {
      console.error('Payout Error:', error);
      alert(error.message);
    }
  };

  const resubmitKYC = async (formData) => {
    const data = await apiCall('/api/auth/resubmit-kyc', 'POST', formData, true);
    setState(prev => ({ 
      ...prev, 
      user: { ...prev.user, kycStatus: data.data.kycStatus }
    }));
    return data;
  };

  // Removed frontend simulation in favor of real backend persistence

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
      resubmitKYC,
      fetchTransactions
    }}>
      {children}
    </StoreContext.Provider>
  );
}
