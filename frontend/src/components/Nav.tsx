'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

export function LogoMark({ size = 24 }: { size?: number }) {
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
  { href: '/demo', label: 'Product' },
  { href: '/build', label: 'Developers' },
  { href: '/agent-demo', label: 'Agents' },
  { href: '/capital', label: 'Capital' },
  { href: '/explore', label: 'Explore' },
  { href: '/technocore', label: 'TechnoCore' },
];

export default function Nav() {
  const pathname = usePathname();
  const [account, setAccount] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
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
        background: scrolled ? 'rgba(10, 13, 20, 0.95)' : 'rgba(10, 13, 20, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.15s ease',
      }}
    >
      <div
        className="editorial-container-wide"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Left: Brand & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
            <LogoMark size={24} />
            <span
              style={{
                fontWeight: 850,
                fontSize: '1rem',
                letterSpacing: '0.1em',
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
              padding: '0.15rem 0.5rem',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.6875rem',
              fontFamily: 'monospace',
              color: '#8A8F9E',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8953A' }} />
            ARC 5042002
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="desktop-nav"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#F8F6F2' : '#8A8F9E',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link
            href="/demo"
            className="btn-primary"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
            }}
          >
            Try Auren
          </Link>

          <button
            onClick={connectWallet}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 6,
              background: account ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#F8F6F2',
              fontSize: '0.8125rem',
              fontFamily: account ? 'monospace' : 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {account ? `${account.slice(0, 6)}…${account.slice(-4)}` : 'Connect'}
          </button>
        </div>
      </div>
    </header>
  );
}
