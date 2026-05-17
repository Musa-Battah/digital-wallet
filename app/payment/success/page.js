'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
      <h1>Payment Successful!</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>
        Your wallet has been funded successfully.
      </p>
      {reference && (
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          Reference: {reference}
        </p>
      )}
      <Link href="/wallet" className="btn-primary" style={{ textDecoration: 'none' }}>
        Go to Wallet
      </Link>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="card">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}