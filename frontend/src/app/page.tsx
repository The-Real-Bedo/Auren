'use client';

import Link from 'next/link';
import { useState } from 'react';

/* ── Custom SVG Logo ────────────────────────────────────────── */
export function LogoMark({ size = 28 }: { size?: number }) {
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

/* ── Primary 5-Step Loop ────────────────────────────────────── */
const FLOW_STEPS = [
  {
    step: '01',
    name: 'Discover',
    title: 'Autonomous Discovery',
    body: 'Autonomous agents and clients query registered Arc ventures through the Auren registry and MCP tools.',
  },
  {
    step: '02',
    name: 'Evaluate',
    title: 'Policy Engine Check',
    body: 'Policy engine validates gas limits, contract whitelists, allowed function selectors, and daily budgets.',
  },
  {
    step: '03',
    name: 'Sponsor',
    title: 'Paymaster Authorization',
    body: 'Auren Paymaster signs cryptographic authorization envelopes (ERC-4337 v0.6) without user gas.',
  },
  {
    step: '04',
    name: 'Execute',
    title: 'On-Chain Execution',
    body: 'Relayers broadcast UserOperations to EntryPoint; transactions settle atomically on Arc Testnet.',
  },
  {
    step: '05',
    name: 'Settle',
    title: 'Revenue-First Settlement',
    body: 'DApp revenue flows to isolated vaults, recovering initial gas capital before distributing profit splits.',
  },
];

/* ── 3-Audience Profiles ────────────────────────────────────── */
const AUDIENCES = [
  {
    id: 'users',
    title: 'For Users',
    subtitle: 'Zero-Friction Applications',
    summary: 'Interact with applications without buying or holding transaction gas tokens for every single action.',
    points: [
      'Zero gas friction on eligible actions',
      'Non-custodial: you maintain 100% control of your wallet',
      'Transparent on-chain execution with zero hidden costs',
    ],
    cta: 'Explore User Experience',
    href: '/users',
  },
  {
    id: 'developers',
    title: 'For Developers',
    subtitle: 'Accelerate DApp Onboarding',
    summary: 'Integrate Paymasters and isolated liquidity to sponsor activity and automate top-line revenue settlement.',
    points: [
      'Plug-and-play TypeScript SDK & ERC-4337 Paymaster',
      'Configurable per-action gas rules & daily budgets',
      'Automated 50/50 profit splits via RevenueSplitter',
    ],
    cta: 'Developer Quickstart',
    href: '/build',
  },
  {
    id: 'capital',
    title: 'For Capital Providers',
    subtitle: 'Venture Liquidity & Growth',
    summary: 'Supply capital into isolated vaults to sponsor application activity with revenue-first principal recovery.',
    points: [
      'Isolated risk per DApp (no cross-pool contagion)',
      'Principal recovery before profit distribution (Mudarabah-inspired)',
      'Real-time on-chain accounting and TVL telemetry',
    ],
    cta: 'Explore Capital Vaults',
    href: '/capital',
  },
];

export default function Home() {
  const [selectedAudience, setSelectedAudience] = useState<'users' | 'developers' | 'capital'>('users');
  const activeAudience = AUDIENCES.find((a) => a.id === selectedAudience) || AUDIENCES[0];

  return (
    <div style={{ background: '#0A0D14', color: '#F8F6F2', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          paddingTop: '8rem',
          paddingBottom: '5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,149,58,0.12), transparent)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>

          {/* Status Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(200,149,58,0.12)', border: '1px solid rgba(200,149,58,0.3)', marginBottom: '1.75rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8953A', boxShadow: '0 0 8px #C8953A' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', color: '#C8953A' }}>
              PUBLIC TESTNET — ARC NETWORK (CHAIN 5042002)
            </span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              color: '#F8F6F2',
            }}
          >
            The economic layer for <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #C8953A 0%, #E2B768 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              autonomous applications.
            </span>
          </h1>

          {/* Tagline & Elevator Pitch */}
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 500,
              color: '#C8953A',
              marginBottom: '0.75rem',
            }}
          >
            Fund growth. Enable agents.
          </p>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              lineHeight: 1.6,
              color: '#8A8F9E',
              maxWidth: 760,
              margin: '0 auto 2.5rem auto',
            }}
          >
            Auren helps applications on Arc sponsor user and agent activity while enforcing economic policies, funding growth through isolated vaults, and settling generated revenue on-chain.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
                borderRadius: '8px',
                background: '#C8953A',
                color: '#0A0D14',
                fontWeight: 700,
                fontSize: '0.98rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(200,149,58,0.3)',
                transition: 'transform 0.2s, opacity 0.2s',
              }}
            >
              Try Auren (Consumer Demo)
              <span>→</span>
            </Link>

            <Link
              href="/agent-demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(200,149,58,0.4)',
                color: '#F8F6F2',
                fontWeight: 600,
                fontSize: '0.98rem',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              Watch an Agent Execute
              <span style={{ color: '#C8953A' }}>🤖</span>
            </Link>

            <Link
              href="/build"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.85rem 1.75rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#F8F6F2',
                fontWeight: 600,
                fontSize: '0.98rem',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              Build with Auren
            </Link>
          </div>

        </div>
      </section>

      {/* ── 3-AUDIENCE SELECTOR ─────────────────────────────────── */}
      <section style={{ padding: '4.5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0D111A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Built for the Entire Autonomous Ecosystem
            </h2>
            <p style={{ color: '#8A8F9E', fontSize: '0.98rem' }}>
              Select your perspective to see how Auren unlocks economic coordination on Arc.
            </p>
          </div>

          {/* Tab Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
            }}
          >
            {AUDIENCES.map((aud) => {
              const isSelected = aud.id === selectedAudience;
              return (
                <button
                  key={aud.id}
                  onClick={() => setSelectedAudience(aud.id as any)}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #C8953A' : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(200,149,58,0.15)' : 'rgba(255,255,255,0.02)',
                    color: isSelected ? '#F8F6F2' : '#8A8F9E',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {aud.title}
                </button>
              );
            })}
          </div>

          {/* Tab Panel */}
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '2.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: '#C8953A', textTransform: 'uppercase' }}>
                {activeAudience.subtitle}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 1rem 0' }}>
                {activeAudience.title}
              </h3>
              <p style={{ color: '#8A8F9E', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {activeAudience.summary}
              </p>
              <Link
                href={activeAudience.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#C8953A',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                }}
              >
                {activeAudience.cta} →
              </Link>
            </div>

            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#8A8F9E', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Key Advantages
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {activeAudience.points.map((pt, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.92rem', color: '#EDE8DF' }}>
                    <span style={{ color: '#C8953A', fontWeight: 800 }}>✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5-STEP EXECUTION LOOP ──────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', color: '#C8953A', textTransform: 'uppercase' }}>
              The Autonomous Loop
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
              Discover → Evaluate → Sponsor → Execute → Settle
            </h2>
            <p style={{ color: '#8A8F9E', maxWidth: 640, margin: '0.5rem auto 0 auto', fontSize: '0.95rem' }}>
              A complete on-chain lifecycle ensuring applications are funded, transactions are policy-verified, and revenue is automatically recovered.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
            {FLOW_STEPS.map((step) => (
              <div
                key={step.step}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#C8953A' }}>
                  {step.step}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8F6F2' }}>
                  {step.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#8A8F9E', lineHeight: 1.5, margin: 0 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── LIVE PROOF TEASER ──────────────────────────────────── */}
      <section style={{ padding: '4.5rem 1.5rem', background: '#0D111A' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ padding: '2.5rem', borderRadius: '12px', background: 'rgba(200,149,58,0.04)', border: '1px solid rgba(200,149,58,0.2)' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Experience Live ERC-4337 Sponsorship
            </h2>
            <p style={{ color: '#8A8F9E', fontSize: '0.95rem', maxWidth: 580, margin: '0 auto 1.5rem auto' }}>
              Trigger a real autonomous smart account execution on Arc Testnet. Watch the Auren Paymaster cover gas fees directly from the isolated DAppVault.
            </p>
            <Link
              href="/agent-demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                background: '#C8953A',
                color: '#0A0D14',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
              }}
            >
              Open Live Execution Console →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ padding: '3rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#8A8F9E', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LogoMark size={20} />
            <span style={{ fontWeight: 700, color: '#F8F6F2', letterSpacing: '0.08em' }}>AUREN</span>
            <span>— Arc Testnet Release Candidate</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/users" style={{ color: '#8A8F9E', textDecoration: 'none' }}>Users</Link>
            <Link href="/build" style={{ color: '#8A8F9E', textDecoration: 'none' }}>Developers</Link>
            <Link href="/capital" style={{ color: '#8A8F9E', textDecoration: 'none' }}>Capital</Link>
            <Link href="/explore" style={{ color: '#8A8F9E', textDecoration: 'none' }}>Explore</Link>
            <Link href="/technocore" style={{ color: '#8A8F9E', textDecoration: 'none' }}>TechnoCore</Link>
            <Link href="/brand" style={{ color: '#8A8F9E', textDecoration: 'none' }}>Brand</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
