'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', marginBottom: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>💳</div>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          Digital Wallet System
        </h1>
        <p style={{ fontSize: '18px', color: '#888', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
          Send and receive money instantly. Fund your wallet with Paystack and transfer to other users.
        </p>
        {user ? (
          <Link href="/wallet" className="btn-primary" style={{ textDecoration: 'none' }}>
            Go to Wallet
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link href="/register" className="btn-primary" style={{ textDecoration: 'none' }}>
              Get Started
            </Link>
            <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Login
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2>Features</h2>
        <p style={{ color: '#888', marginTop: '10px' }}>Everything you need for digital payments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr)', gap: '30px', marginBottom: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>💰</div>
          <h3>Fund Wallet</h3>
          <p style={{ color: '#888' }}>Add money to your wallet using Paystack</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>📤</div>
          <h3>Send Money</h3>
          <p style={{ color: '#888' }}>Transfer instantly to other users</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>📊</div>
          <h3>Transaction History</h3>
          <p style={{ color: '#888' }}>View all your wallet activities</p>
        </div>
      </div>
    </div>
  );
};