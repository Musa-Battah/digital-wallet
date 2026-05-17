'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SendMoneyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    amount: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const amountNum = parseFloat(formData.amount);
    if (amountNum < 100) {
      setError('Minimum transfer amount is ₦100');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: formData.email,
          amount: amountNum,
          note: formData.note
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Successfully sent ₦${amountNum} to ${formData.email}`);
        setTimeout(() => {
          router.push('/wallet');
        }, 2000);
      } else {
        setError(data.error || 'Transfer failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Send Money</h1>
      
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📤</div>
          <p>Send money to other users instantly</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Recipient Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Amount (₦)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="100"
              step="100"
              required
            />
            <small style={{ color: '#888' }}>Minimum: ₦100</small>
          </div>
          
          <div className="form-group">
            <label>Note (Optional)</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="What's this for?"
              rows="2"
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Processing...' : `Send ₦${formData.amount || 0}`}
          </button>
        </form>
      </div>
    </div>
  );
}