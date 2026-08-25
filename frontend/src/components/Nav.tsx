'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path
        d="M14 4C8.477 4 4 8.477 4 14C4 19.523 8.477 24 14 24"
        stroke="#C8953A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="4" fill="#C8953A" />
      <circle cx="14" cy="7" r="2" fill="currentColor" fillOpacity="0.7" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: '/users', label: 'Users' },
  { href: '/build', label: 'Developers' },
  { href: '/capital', label: 'Capital' },
  { href: '/explore', label: 'Explore' },
  { href: '/technocore', label: 'TechnoCore' },
  { href: '/agent-demo', label: 'Live Demo', highlight: true },
];

export default function Nav() {
  const pathname = usePathname();
  const [account, setAccount] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    try {
      const prov = new BrowserProvider((window as any).ethereum);
      await prov.send('eth_requestAccounts', []);
      const signer = await prov.getSigner();
      setAccount(await signer.getAddress());
      (window as any).ethereum.on('accountsChanged', (accs: string[]) =>
        setAccount(accs[0] || null)
      );
    } catch (e) {
      console.warn('Wallet connection cancelled or failed', e);
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        background: scrolled ? 'rgba(10,13,20,0.92)' : 'rgba(10,13,20,0.75)',
        backdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.25s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1.5rem',
          width: '100%',
        }}
      >
        {/* Brand & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
              color: '#F8F6F2',
            }}
          >
            <LogoMark size={28} />
            <span
              style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                letterSpacing: '0.12em',
              }}
            >
              AUREN
            </span>
          </Link>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: 'rgba(200,149,58,0.1)',
              border: '1px solid rgba(200,149,58,0.25)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#C8953A',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#C8953A',
                boxShadow: '0 0 6px rgba(200,149,58,0.8)',
              }}
            />
            Arc Testnet
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}
          className="desktop-nav"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            if (link.highlight) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    background: 'rgba(200,149,58,0.15)',
                    border: '1px solid rgba(200,149,58,0.35)',
                    color: '#F8F6F2',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#4ade80',
                    }}
                  />
                  {link.label}
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#F8F6F2' : '#8A8F9E',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Wallet Connect */}
          <button
            onClick={connectWallet}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              background: account ? 'rgba(255,255,255,0.06)' : '#C8953A',
              border: account ? '1px solid rgba(255,255,255,0.12)' : 'none',
              color: account ? '#F8F6F2' : '#0A0D14',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {account ? `${account.slice(0, 6)}…${account.slice(-4)}` : 'Connect Wallet'}
          </button>
        </nav>
      </div>
    </header>
  );
}
