'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FundWalletPage() {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUserEmail();
  }, []);

  const fetchUserEmail = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setEmail(data.user.email);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const numAmount = parseFloat(amount);
    if (numAmount < 100) {
      setError('Minimum funding amount is ₦100');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount, email })
      });
      
      const data = await res.json();
      
      if (data.success) {
        window.location.href = data.authorization_url;
      } else {
        setError(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Fund Wallet</h1>
      
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💰</div>
          <p>Add money to your wallet using Paystack</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="100"
              step="100"
              required
              autoFocus
            />
            <small style={{ color: '#888' }}>Minimum: ₦100</small>
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              readOnly
              disabled
              style={{ backgroundColor: '#222', cursor: 'not-allowed' }}
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Processing...' : `Proceed to Pay ₦${amount || 0}`}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
          <p>✓ Secure payment via Paystack</p>
          <p>✓ Instant wallet credit</p>
          <p>✓ 7.5% VAT applies to service fees</p>
        </div>
      </div>
    </div>
  );
}