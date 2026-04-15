import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { TrendingUp, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center', margin: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '50%' }}>
            <TrendingUp size={40} color="#3b82f6" />
          </div>
        </div>
        <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }} className="text-gradient">Investment Portal</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Sign in to view your demo portfolio</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
            Sign In (Demo)
          </button>
        </form>
      </div>
    </div>
  );
}
