import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    
    const { to_email, amount, note } = await request.json();
    
    if (!to_email || !amount || amount < 100) {
      return NextResponse.json({ error: 'Invalid transfer details' }, { status: 400 });
    }
    
    // Get sender's wallet
    const senderWallet = await query(
      'SELECT id, balance FROM wallets WHERE user_id = $1',
      [decoded.userId]
    );
    
    if (senderWallet.rows.length === 0) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }
    
    if (senderWallet.rows[0].balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }
    
    // Get recipient user and wallet
    const recipientUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [to_email]
    );
    
    if (recipientUser.rows.length === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }
    
    if (recipientUser.rows[0].id === decoded.userId) {
      return NextResponse.json({ error: 'Cannot send money to yourself' }, { status: 400 });
    }
    
    const recipientWallet = await query(
      'SELECT id FROM wallets WHERE user_id = $1',
      [recipientUser.rows[0].id]
    );
    
    if (recipientWallet.rows.length === 0) {
      return NextResponse.json({ error: 'Recipient wallet not found' }, { status: 404 });
    }
    
    const senderWalletId = senderWallet.rows[0].id;
    const recipientWalletId = recipientWallet.rows[0].id;
    const reference = `TRANSFER-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Start transaction
    const pool = (await import('@/lib/db')).default;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Deduct from sender
      await client.query(
        'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE id = $2',
        [amount, senderWalletId]
      );
      
      // Add to recipient
      await client.query(
        'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
        [amount, recipientWalletId]
      );
      
      // Get new balances
      const newSenderBalance = await client.query(
        'SELECT balance FROM wallets WHERE id = $1',
        [senderWalletId]
      );
      
      // Record sender transaction
      await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, description, reference)
         VALUES ($1, 'debit', $2, $3, $4, $5)`,
        [senderWalletId, amount, newSenderBalance.rows[0].balance, `Transfer to ${to_email}${note ? ': ' + note : ''}`, reference]
      );
      
      // Record recipient transaction
      const newRecipientBalance = await client.query(
        'SELECT balance FROM wallets WHERE id = $1',
        [recipientWalletId]
      );
      
      await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, description, reference)
         VALUES ($1, 'credit', $2, $3, $4, $5)`,
        [recipientWalletId, amount, newRecipientBalance.rows[0].balance, `Transfer from ${decoded.email}${note ? ': ' + note : ''}`, reference]
      );
      
      // Record transfer
      await client.query(
        `INSERT INTO transfers (reference, from_user_id, to_user_id, from_wallet_id, to_wallet_id, amount, note, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')`,
        [reference, decoded.userId, recipientUser.rows[0].id, senderWalletId, recipientWalletId, amount, note]
      );
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: `Successfully sent ₦${amount} to ${to_email}`,
        reference
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}