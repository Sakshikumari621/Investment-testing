import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { QrCode, Copy, CheckCircle } from 'lucide-react';

export default function DepositView() {
  const { state, addDeposit } = useStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('crypto');

  // Dynamic labels and addresses from env
  const net1 = import.meta.env.VITE_NETWORK_1_NAME || 'TRC20';
  const net2 = import.meta.env.VITE_NETWORK_2_NAME || 'ERC20';
  const net3 = import.meta.env.VITE_NETWORK_3_NAME || 'BEP20';

  const [network, setNetwork] = useState(net1);
  const [copied, setCopied] = useState(false);

  const addressMapping = {
    [net1]: import.meta.env.VITE_NETWORK_1_ADDRESS || '0x_NETWORK_1_ADDRESS',
    [net2]: import.meta.env.VITE_NETWORK_2_ADDRESS || '0x_NETWORK_2_ADDRESS',
    [net3]: import.meta.env.VITE_NETWORK_3_ADDRESS || '0x_NETWORK_3_ADDRESS',
    UPI: import.meta.env.VITE_UPI_ID || 'placeholder@upi'
  };

  const currentAddress = method === 'crypto' ? addressMapping[network] : addressMapping.UPI;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = () => {
    if (amount && Number(amount) > 0) {
      addDeposit(amount, method.toUpperCase(), method === 'crypto' ? network : '');
      setAmount('');
    }
  };

  const qrData = method === 'crypto' 
    ? currentAddress 
    : `upi://pay?pa=${currentAddress}`;

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
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`} 
                alt="Payment QR Code"
                style={{ width: '150px', height: '150px', display: 'block' }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Select Method
            </label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="crypto">Crypto Wallet (USDT)</option>
              <option value="upi">UPI Transfer</option>
            </select>
          </div>

          {method === 'crypto' && (
            <div className="animate-fade-in" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Select Network (Compulsory)
              </label>
              <select 
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
              >
                <option value={net1}>{net1}</option>
                <option value={net2}>{net2}</option>
                <option value={net3}>{net3}</option>
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {method === 'crypto' ? `${network} Wallet Address` : 'UPI ID'}
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                value={currentAddress} 
                readOnly 
                style={{ cursor: 'pointer' }}
                onClick={handleCopy}
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
              <th>Network</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {state.deposits.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No deposits yet.</td>
              </tr>
            ) : (
              state.deposits.map(d => (
                <tr key={d.id}>
                  <td>{new Date(d.createdAt).toLocaleString()}</td>
                  <td>{d.method}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{d.network || '-'}</td>
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
