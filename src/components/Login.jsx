import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { TrendingUp, Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const { login, register, state } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    try {
      if (isSignUp) {
        if (name && email && password) {
          await register(name, email, password);
        }
      } else {
        if (email && password) {
          await login(email, password);
        }
      }
    } catch (err) {
      setErrorText(err.message || 'Authentication failed. Please try again.');
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
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          {isSignUp ? 'Create an account to track your portfolio' : 'Sign in to view your portfolio'}
        </p>
        
        {errorText && (
          <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>
            {errorText}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {isSignUp && (
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required 
              />
            </div>
          )}

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
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#3b82f6', 
              cursor: 'pointer', 
              padding: 0, 
              font: 'inherit',
              textDecoration: 'underline'
            }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
