import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
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
    
    // Get user's wallet
    const walletResult = await query(
      'SELECT id FROM wallets WHERE user_id = $1',
      [decoded.userId]
    );
    
    if (walletResult.rows.length === 0) {
      return NextResponse.json({ transactions: [] });
    }
    
    const walletId = walletResult.rows[0].id;
    
    // Get wallet transactions (using transaction_type)
    const transactions = await query(`
      SELECT * FROM wallet_transactions 
      WHERE wallet_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [walletId]);
    
    return NextResponse.json({
      transactions: transactions.rows
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}