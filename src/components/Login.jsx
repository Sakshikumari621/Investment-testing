import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { TrendingUp, Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const { login, register, state } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panPhoto, setPanPhoto] = useState(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);
  const [errorText, setErrorText] = useState('');

  const validateKyc = () => {
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    const aadhaarRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
    
    if (!panRegex.test(panNumber)) return 'Invalid PAN format (Expected: ABCDE1234F)';
    if (!aadhaarRegex.test(aadhaarNumber)) return 'Invalid Aadhaar format (12 digits, cannot start with 0 or 1)';
    if (!panPhoto) return 'PAN Photo is required';
    if (!aadhaarPhoto) return 'Aadhaar Photo is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    try {
      if (isSignUp) {
        const kycError = validateKyc();
        if (kycError) {
          setErrorText(kycError);
          return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('panNumber', panNumber);
        formData.append('aadhaarNumber', aadhaarNumber);
        formData.append('panPhoto', panPhoto);
        formData.append('aadhaarPhoto', aadhaarPhoto);

        await register(formData);
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
      <div className="glass-panel animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '450px', textAlign: 'center', margin: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '50%' }}>
            <TrendingUp size={40} color="#3b82f6" />
          </div>
        </div>
        <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }} className="text-gradient">Investment Portal</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          {isSignUp ? 'Verify your identity and start investing' : 'Sign in to view your portfolio'}
        </p>
        
        {errorText && (
          <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>
            {errorText}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: isSignUp ? '400px' : 'auto', overflowY: isSignUp ? 'auto' : 'visible', padding: '4px' }}>
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

            {isSignUp && (
              <>
                <div style={{ padding: '0 4px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>KYC DETAILS</div>
                
                <input 
                  type="text" 
                  placeholder="PAN Number (ABCDE1234F)" 
                  value={panNumber}
                  onChange={e => setPanNumber(e.target.value.toUpperCase())}
                  maxLength={10}
                  required 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PAN Card Photo</label>
                  <input 
                    type="file" 
                    onChange={e => setPanPhoto(e.target.files[0])}
                    accept="image/*,.pdf"
                    required 
                  />
                </div>

                <input 
                  type="text" 
                  placeholder="Aadhaar Number (12 Digits)" 
                  value={aadhaarNumber}
                  onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={12}
                  required 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Aadhaar Card Photo</label>
                  <input 
                    type="file" 
                    onChange={e => setAadhaarPhoto(e.target.files[0])}
                    accept="image/*,.pdf"
                    required 
                  />
                </div>
              </>
            )}
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
            {isSignUp ? 'Create Account & Submit KYC' : 'Sign In'}
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
