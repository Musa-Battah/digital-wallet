import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.redirect(new URL('/payment/failed', process.env.NEXTAUTH_URL));
    }
    
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
      },
    });
    
    const data = await response.json();
    
    if (data.status && data.data.status === 'success') {
      const { wallet_id } = data.data.metadata;
      const amount = data.data.amount / 100;
      
      // Update wallet balance
      await query(
        'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
        [amount, wallet_id]
      );
      
      // Get new balance
      const walletResult = await query(
        'SELECT balance FROM wallets WHERE id = $1',
        [wallet_id]
      );
      
      // Update transaction
      await query(
        `UPDATE wallet_transactions 
         SET status = 'completed', balance_after = $1 
         WHERE reference = $2`,
        [walletResult.rows[0].balance, reference]
      );
      
      return NextResponse.redirect(new URL(`/payment/success?reference=${reference}`, process.env.NEXTAUTH_URL));
    } else {
      return NextResponse.redirect(new URL(`/payment/failed`, process.env.NEXTAUTH_URL));
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.redirect(new URL('/payment/failed', process.env.NEXTAUTH_URL));
  }
}