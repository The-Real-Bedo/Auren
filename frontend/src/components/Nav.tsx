'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { LogoMark } from '@/app/page';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/agent-demo', label: 'Agent Demo' },
  { href: '/technocore', label: 'TechnoCore' },
  { href: '/build', label: 'Developers' },
  { href: '/invest', label: 'Invest' },
  { href: '/explore', label: 'Explore' },
  { href: '/demo', label: 'App Demo' },
];

export default function Nav() {
  const pathname = usePathname();
  const [account, setAccount] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHero = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const connectWallet = async () => {
    if (!(window as any).ethereum) return;
    try {
      const prov = new BrowserProvider((window as any).ethereum);
      await prov.send('eth_requestAccounts', []);
      const signer = await prov.getSigner();
      setAccount(await signer.getAddress());
      (window as any).ethereum.on('accountsChanged', (accs: string[]) =>
        setAccount(accs[0] || null)
      );
    } catch {}
  };

  const dark = isHero;
  const opaque = !isHero || scrolled;

  return (
    <>
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
          transition: 'background 0.25s, border-color 0.25s, backdrop-filter 0.25s',
          background: opaque
            ? dark
              ? 'rgba(10,13,20,0.92)'
              : 'rgba(248,246,242,0.92)'
            : 'transparent',
          backdropFilter: opaque ? 'blur(12px) saturate(180%)' : 'none',
          borderBottom: opaque
            ? dark
              ? '1px solid rgba(255,255,255,0.07)'
              : '1px solid rgba(10,13,20,0.08)'
            : '1px solid transparent',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <LogoMark size={26} />
            <span
              style={{
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '-0.025em',
                color: dark ? 'var(--color-paper)' : 'var(--color-ink)',
                lineHeight: 1,
              }}
            >
              Auren
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hide-mobile"
            style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 450,
                  color: dark
                    ? 'rgba(248,246,242,0.55)'
                    : 'var(--color-ink-500)',
                  textDecoration: 'none',
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'color 0.12s, background 0.12s',
                  whiteSpace: 'nowrap' as const,
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = dark
                    ? 'rgba(248,246,242,0.95)'
                    : 'var(--color-ink)';
                  (e.target as HTMLElement).style.background = dark
                    ? 'rgba(255,255,255,0.07)'
                    : 'var(--color-ink-50)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = dark
                    ? 'rgba(248,246,242,0.55)'
                    : 'var(--color-ink-500)';
                  (e.target as HTMLElement).style.background = 'transparent';
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div
            className="hide-mobile"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}
          >
            {account ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  background: dark
                    ? 'rgba(255,255,255,0.07)'
                    : 'var(--color-ink-50)',
                  border: dark
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid var(--color-ink-100)',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  color: dark ? 'rgba(248,246,242,0.7)' : 'var(--color-ink-500)',
                }}
              >
                <span className="dot-live" />
                {account.slice(0, 6)}…{account.slice(-4)}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  padding: '0.5rem 1.125rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  background: 'transparent',
                  color: dark ? 'rgba(248,246,242,0.8)' : 'var(--color-ink)',
                  border: dark
                    ? '1.5px solid rgba(248,246,242,0.2)'
                    : '1.5px solid var(--color-ink-200)',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = dark
                    ? 'rgba(248,246,242,0.45)'
                    : 'var(--color-ink-500)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = dark
                    ? 'rgba(248,246,242,0.2)'
                    : 'var(--color-ink-200)';
                }}
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: dark ? 'var(--color-paper)' : 'var(--color-ink)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                <line x1="3" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                <line x1="3" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            zIndex: 99,
            background: 'var(--color-ink)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {[...NAV_LINKS, { href: '/demo', label: 'Try Demo' }].map(
            ({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: 'rgba(248,246,242,0.7)',
                  textDecoration: 'none',
                  padding: '0.75rem 0.5rem',
                  fontSize: '1.0625rem',
                  fontWeight: 450,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'color 0.12s',
                }}
              >
                {label}
              </Link>
            )
          )}
          <button
            onClick={connectWallet}
            className="btn btn-gold"
            style={{ marginTop: '1rem', justifyContent: 'center' }}
          >
            {account
              ? `${account.slice(0, 6)}…${account.slice(-4)}`
              : 'Connect Wallet'}
          </button>
        </div>
      )}
    </>
  );
}
