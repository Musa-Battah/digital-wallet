import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const REFERENCE_PREFIX = process.env.NEXT_PUBLIC_REFERENCE_PREFIX || 'WALLET-';
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { amount, email } = await request.json();
    
    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Minimum funding amount is ₦100' }, { status: 400 });
    }
    
    // Get wallet
    const walletResult = await query(
      'SELECT id, balance FROM wallets WHERE user_id = $1',
      [decoded.userId]
    );
    
    if (walletResult.rows.length === 0) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }
    
    const walletId = walletResult.rows[0].id;
    const reference = `${REFERENCE_PREFIX}${decoded.userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Create pending transaction record
    await query(
      `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, balance_after, description, reference, status)
       VALUES ($1, 'credit', $2, $3, 'Wallet funding - pending', $4, 'pending')`,
      [walletId, amount, walletResult.rows[0].balance, reference]
    );
    
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        email: email,
        reference: reference,
        metadata: {
          wallet_id: walletId,
          user_id: decoded.userId,
          type: 'wallet_funding'
        },
        callback_url: `${BASE_URL}/api/payment/verify`,
      }),
    });
    
    const data = await response.json();
    
    if (data.status) {
      return NextResponse.json({
        success: true,
        authorization_url: data.data.authorization_url,
        reference: data.data.reference
      });
    } else {
      console.error('Paystack error:', data);
      return NextResponse.json({ error: data.message }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Wallet funding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}