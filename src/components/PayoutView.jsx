import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { Check, X } from 'lucide-react';

export default function PayoutView() {
  const { state, requestPayout, approvePayout, rejectPayout } = useStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  
  // Bank states
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  
  // UPI states
  const [upiId, setUpiId] = useState('');
  
  // Crypto states
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('');

  const availableBalance = state.currentBalance;

  const handleRequest = () => {
    const payoutData = {
      amount: Number(amount),
      method: method.toUpperCase(),
    };

    if (method === 'bank') {
      if (!accountHolderName || !accountNumber || !bankName || !ifscCode || !branchName) return;
      Object.assign(payoutData, { accountHolderName, accountNumber, bankName, ifscCode, branchName });
    } else if (method === 'upi') {
      if (!upiId) return;
      Object.assign(payoutData, { upiId });
    } else if (method === 'crypto') {
      if (!walletAddress || !network) return;
      Object.assign(payoutData, { walletAddress, network });
    }

    if (amount && Number(amount) > 0 && Number(amount) <= availableBalance) {
      requestPayout(payoutData);
      // Reset form
      setAmount('');
      setAccountHolderName('');
      setAccountNumber('');
      setBankName('');
      setIfscCode('');
      setBranchName('');
      setUpiId('');
      setWalletAddress('');
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

          {/* BANK FIELDS */}
          {method === 'bank' && (
            <div className="animate-fade-in" style={{ display: 'grid', gap: '12px' }}>
              <input type="text" placeholder="Account Holder Name" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} />
              <input type="text" placeholder="Bank Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
              <input type="text" placeholder="Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                 <input type="text" placeholder="IFSC Code" value={ifscCode} onChange={e => setIfscCode(e.target.value)} />
                 <input type="text" placeholder="Branch Name" value={branchName} onChange={e => setBranchName(e.target.value)} />
              </div>
            </div>
          )}

          {/* CRYPTO FIELDS */}
          {method === 'crypto' && (
            <div className="animate-fade-in" style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Network</label>
                <input 
                  type="text" 
                  placeholder="e.g. TRC20, ERC20, BEP20" 
                  value={network} 
                  onChange={(e) => setNetwork(e.target.value)} 
                />
              </div>
              <input type="text" placeholder="Wallet Address" value={walletAddress} onChange={e => setWalletAddress(e.target.value)} />
            </div>
          )}

          {/* UPI FIELDS */}
          {method === 'upi' && (
            <div className="animate-fade-in" style={{ display: 'grid', gap: '8px' }}>
              <input type="text" placeholder="UPI ID (e.g. name@ybl)" value={upiId} onChange={e => setUpiId(e.target.value)} />
              <p style={{ fontSize: '0.75rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '4px' }}>
                 ⚠️ Maximum limit for UPI withdrawals is 10,000 per transaction.
              </p>
            </div>
          )}

          <button 
            className="btn-primary" 
            onClick={handleRequest} 
            disabled={
              !amount || Number(amount) <= 0 || Number(amount) > availableBalance ||
              (method === 'bank' && (!accountHolderName || !accountNumber || !bankName || !ifscCode || !branchName)) ||
              (method === 'upi' && !upiId) ||
              (method === 'crypto' && (!walletAddress || !network))
            }
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
