import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const event = body;
    
    console.log('Wallet webhook received:', event.event);
    
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      const { wallet_id, user_id } = metadata;
      
      console.log(`Processing wallet funding for reference: ${reference}`);
      
      // Get pending transaction
      const txResult = await query(
        'SELECT * FROM wallet_transactions WHERE reference = $1 AND status = $2',
        [reference, 'pending']
      );
      
      if (txResult.rows.length > 0) {
        const transaction = txResult.rows[0];
        const amount = transaction.amount;
        
        // Update wallet balance
        const walletResult = await query(
          'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING balance',
          [amount, wallet_id]
        );
        
        const newBalance = walletResult.rows[0].balance;
        
        // Update transaction status and balance_after (using transaction_type, not type)
        await query(
          `UPDATE wallet_transactions 
           SET status = 'completed', balance_after = $1 
           WHERE reference = $2`,
          [newBalance, reference]
        );
        
        console.log(`Wallet funded: +₦${amount}, New balance: ₦${newBalance}`);
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}