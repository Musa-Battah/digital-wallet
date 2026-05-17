'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      
      const [walletRes, transactionsRes] = await Promise.all([
        fetch('/api/wallet'),
        fetch('/api/wallet/transactions')
      ]);
      
      const walletData = await walletRes.json();
      const transactionsData = await transactionsRes.json();
      
      setWallet(walletData);
      setTransactions(transactionsData.transactions || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading wallet...</div>;
  }

  return (
    <div>
      <h1>My Wallet</h1>
      
      {/* Balance Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ color: '#888', marginBottom: '10px' }}>Available Balance</div>
        <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
          {formatNaira(wallet?.balance || 0)}
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link href="/wallet/fund" className="btn-primary" style={{ textDecoration: 'none' }}>
            Fund Wallet
          </Link>
          <Link href="/wallet/send" className="btn-secondary" style={{ textDecoration: 'none' }}>
            Send Money
          </Link>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <h2>Recent Transactions</h2>
      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No Transactions Yet</div>
          <div className="empty-state-text">Fund your wallet or send money to see transactions</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td>{tx.description}</td>
                  <td className={tx.type === 'credit' ? 'amount-positive' : 'amount-negative'}>
                    {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                  </td>
                  <td>
                    <span className={`status-${tx.status}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}