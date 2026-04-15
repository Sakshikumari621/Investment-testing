import React from 'react';
import { useStore } from './context/StoreProvider';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const { state } = useStore();
  
  if (!state.isLoggedIn) {
    return <Login />;
  }
  
  return <Dashboard />;
}

export default App;
