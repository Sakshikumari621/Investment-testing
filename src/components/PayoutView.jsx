import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { Check, X } from 'lucide-react';

export default function PayoutView() {
  const { state, requestPayout, approvePayout, rejectPayout } = useStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [details, setDetails] = useState('');
  const [network, setNetwork] = useState('');

  const availableBalance = state.currentBalance;

  const handleRequest = () => {
    if (amount && Number(amount) > 0 && Number(amount) <= availableBalance && details) {
      requestPayout(amount, method.toUpperCase(), details, network);
      setAmount('');
      setDetails('');
      setNetwork('');
    }
  };

  return (
    <div className="animate-fade-in">
      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Request Payout</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Available Balance: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>${availableBalance.toFixed(2)}</span>
      </p>

      <div className="glass-panel" style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.4)', marginBottom: '32px', maxWidth: '600px' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Withdrawal Amount ($)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              max={availableBalance}
            />
            {Number(amount) > availableBalance && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>Amount exceeds available balance.</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Withdrawal Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="bank">Bank Transfer</option>
              <option value="crypto">Crypto Wallet</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Network (optional)
            </label>
            <input 
              type="text" 
              placeholder="e.g. ERC20, TRC20, etc." 
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Account Details
            </label>
            <input 
              type="text" 
              placeholder={method === 'bank' ? 'Account Number & Routing' : method === 'crypto' ? 'Wallet Address' : 'UPI ID'} 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
            />
          </div>

          <button 
            className="btn-primary" 
            onClick={handleRequest} 
            disabled={!amount || Number(amount) <= 0 || Number(amount) > availableBalance || !details}
            style={{ marginTop: '8px' }}
          >
            Submit Request
          </button>
        </div>
      </div>

      <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Payout Requests History</h4>
      <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Network</th>
              <th>Status</th>
              <th>Admin Controls</th>
            </tr>
          </thead>
          <tbody>
            {state.payouts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No payout requests yet.</td>
              </tr>
            ) : (
              state.payouts.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                  <td style={{ fontWeight: 'bold' }}>${p.amount.toFixed(2)}</td>
                  <td>{p.method} {p.details && `(${p.details.substring(0, 10)}...)`}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.network || '-'}</td>
                  <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td>
                    {p.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-success" style={{ padding: '6px' }} onClick={() => approvePayout(p.id)} title="Approve">
                          <Check size={16} />
                        </button>
                        <button className="btn-danger" style={{ padding: '6px' }} onClick={() => rejectPayout(p.id)} title="Reject">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Resolved</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
