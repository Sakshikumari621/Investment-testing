import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { QrCode, Copy, CheckCircle } from 'lucide-react';

export default function DepositView() {
  const { state, addDeposit } = useStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('crypto');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // simulated copy
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = () => {
    if (amount && Number(amount) > 0) {
      addDeposit(amount, method.toUpperCase());
      setAmount('');
    }
  };

  return (
    <div className="animate-fade-in">
      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Deposit Funds</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Add more funds to your investment balance.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Payment Methods */}
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.4)' }}>
          <h4 style={{ marginBottom: '16px' }}>Payment Details</h4>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
              <QrCode size={150} color="black" />
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Select Method
            </label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="crypto">Crypto Wallet (USDT / BTC)</option>
              <option value="upi">UPI Transfer</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {method === 'crypto' ? 'Wallet Address' : 'UPI ID'}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={method === 'crypto' ? '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' : 'demo@upi'} 
                readOnly 
              />
              <button className="btn-secondary" onClick={handleCopy} title="Copy">
                {copied ? <CheckCircle size={20} color="var(--success)" /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Form */}
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.4)' }}>
          <h4 style={{ marginBottom: '16px' }}>Confirm Deposit</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            After making the payment using the details provided, enter the amount and click "I have paid".
          </p>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Amount Deposited ($)
            </label>
            <input 
              type="number" 
              placeholder="e.g. 500" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              min="1"
            />
          </div>

          <button className="btn-primary" style={{ width: '100%' }} onClick={handleDeposit} disabled={!amount || Number(amount) <= 0}>
            I Have Paid
          </button>
        </div>
      </div>

      {/* History Table */}
      <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Deposit History</h4>
      <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {state.deposits.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No deposits yet.</td>
              </tr>
            ) : (
              state.deposits.map(d => (
                <tr key={d.id}>
                  <td>{new Date(d.date).toLocaleString()}</td>
                  <td>{d.method}</td>
                  <td style={{ fontWeight: 'bold' }}>${d.amount.toFixed(2)}</td>
                  <td><span className={`badge badge-${d.status.toLowerCase()}`}>{d.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
