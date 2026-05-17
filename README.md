# 💳 Digital Wallet System (Nigeria)

A complete digital wallet system built with Next.js that allows users to fund their wallets via Paystack, send money to other users, and track all transactions. Designed for Nigerian users with NGN currency support.

## 🚀 Live Demo

[View Live Demo](https://digital-wallet-swart-chi.vercel.app/)

## ✨ Features

### User Features
- **Wallet Dashboard** - View balance and recent transactions
- **Fund Wallet** - Add money using Paystack (₦100 minimum)
- **Send Money** - Transfer instantly to other users
- **Transaction History** - View all wallet activities
- **Secure Authentication** - JWT-based auth with HTTP-only cookies

### Technical Features
- **Real-time Balance Updates** - Instant updates after transactions
- **Transaction Tracking** - Complete audit trail of all activities
- **Paystack Integration** - Secure payment processing
- **Webhook Support** - Automatic wallet crediting on successful payment
- **Nigerian Context** - ₦ Naira currency, Nigerian business logic

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16 (App Router) |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Neon) |
| **Authentication** | JWT + HTTP-only Cookies |
| **Payments** | Paystack |
| **Styling** | Custom CSS (Playpen Sans font) |
| **Deployment** | Vercel |

## 📊 Database Schema

```sql
-- Users table (extends auth system)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'NGN',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('credit', 'debit')),
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transfers between users
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(255) UNIQUE,
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    from_wallet_id INTEGER REFERENCES wallets(id),
    to_wallet_id INTEGER REFERENCES wallets(id),
    amount DECIMAL(10,2) NOT NULL,
    note TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-create wallet for new users
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id, balance)
    VALUES (NEW.id, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_wallet
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_wallet_for_user();

# Clone the repository
git clone https://github.com/Musa-Battah/digital-wallet.git
cd digital-wallet

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Database (Neon)
PGHOST=your_neon_host
PGPORT=5432
PGDATABASE=neondb
PGUSER=your_user
PGPASSWORD=your_password
PGSSLMODE=require

# JWT Authentication
JWT_SECRET=your_super_secret_key

# Paystack (Test Keys)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx

# App URL
NEXTAUTH_URL=http://localhost:3000

# Reference Prefix for Webhook Routing
NEXT_PUBLIC_REFERENCE_PREFIX=WALLET-