'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          💳 <span>Digital</span> Wallet
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
        
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          {user && (
            <>
              <Link href="/wallet" className={`nav-link ${isActive('/wallet') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                Wallet
              </Link>
              <Link href="/wallet/send" className={`nav-link ${isActive('/wallet/send') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                Send
              </Link>
              <Link href="/wallet/fund" className={`nav-link ${isActive('/wallet/fund') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                Fund
              </Link>
            </>
          )}
          {user ? (
            <>
              <span className="user-name">👋 {user.name}</span>
              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link href="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}