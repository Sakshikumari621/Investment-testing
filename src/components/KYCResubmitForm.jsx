import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { FileText, ArrowRight, CheckCircle } from 'lucide-react';

export default function KYCResubmitForm({ onComplete }) {
  const { resubmitKYC } = useStore();
  
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panPhoto, setPanPhoto] = useState(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

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
    setIsSubmitting(true);
    
    try {
      const kycError = validateKyc();
      if (kycError) {
        setErrorText(kycError);
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('panNumber', panNumber);
      formData.append('aadhaarNumber', aadhaarNumber);
      formData.append('panPhoto', panPhoto);
      formData.append('aadhaarPhoto', aadhaarPhoto);

      await resubmitKYC(formData);
      setIsDone(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
    } catch (err) {
      setErrorText(err.message || 'Resubmission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }} className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <CheckCircle size={48} color="#10b981" />
        </div>
        <h3 style={{ color: '#10b981', marginBottom: '8px' }}>Documents Resubmitted!</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Your documents have been sent for verification. Status: Pending.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <FileText size={24} color="#3b82f6" />
        <h3 style={{ margin: 0 }}>KYC Resubmission</h3>
      </div>
      
      {errorText && (
        <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>
          {errorText}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              PAN Card Details
            </label>
            <input 
              type="text" 
              placeholder="PAN Number (ABCDE1234F)" 
              value={panNumber}
              onChange={e => setPanNumber(e.target.value.toUpperCase())}
              maxLength={10}
              required 
              style={{ marginBottom: '12px' }}
            />
            <input 
              type="file" 
              onChange={e => setPanPhoto(e.target.files[0])}
              accept="image/*,.pdf"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Aadhaar Card Details
            </label>
            <input 
              type="text" 
              placeholder="Aadhaar Number (12 Digits)" 
              value={aadhaarNumber}
              onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
              maxLength={12}
              required 
              style={{ marginBottom: '12px' }}
            />
            <input 
              type="file" 
              onChange={e => setAadhaarPhoto(e.target.files[0])}
              accept="image/*,.pdf"
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isSubmitting}
          style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          {isSubmitting ? 'Uploading...' : 'Submit Documents for Verification'}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
}
