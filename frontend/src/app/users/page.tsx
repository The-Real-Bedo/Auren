'use client';

import Link from 'next/link';

export default function UsersPage() {
  const steps = [
    {
      num: '1',
      title: 'Connect Your Wallet',
      description: 'Connect any standard Web3 wallet (MetaMask, Coinbase, Rainbow) to an Auren-enabled application on Arc.',
    },
    {
      num: '2',
      title: 'Select an Action',
      description: 'Choose what you want to do (e.g. mint an item, make a marketplace purchase, or interact with an agent).',
    },
    {
      num: '3',
      title: 'Sign to Authorize',
      description: 'Approve the action intent in your wallet. You will notice zero network gas fees requested from your balance.',
    },
    {
      num: '4',
      title: 'Auren Sponsors the Transaction',
      description: 'Auren automatically covers the gas costs on Arc Testnet through the application’s dedicated liquidity vault.',
    },
    {
      num: '5',
      title: 'Execution Confirmed',
      description: 'Your action settles instantly on the Arc blockchain with verifiable on-chain transparency.',
    },
  ];

  return (
    <div style={{ background: '#0A0D14', color: '#F8F6F2', minHeight: '100vh', paddingTop: '6.5rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(200,149,58,0.1)', border: '1px solid rgba(200,149,58,0.25)', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#C8953A', letterSpacing: '0.05em' }}>
              FOR USERS & AGENTS
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Use applications without worrying about gas fees.
          </h1>

          <p style={{ color: '#8A8F9E', fontSize: '1.1rem', maxWidth: 680, margin: '0 auto', lineHeight: 1.6 }}>
            Auren removes the friction of acquiring and managing transaction gas. When you interact with Auren-enabled DApps on Arc, transaction fees are sponsored automatically.
          </p>
        </div>

        {/* 5-Step Visual Flow */}
        <div style={{ background: '#0D111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '2.5rem', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
            How It Works for You
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {steps.map((s) => (
              <div
                key={s.num}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(200,149,58,0.15)',
                    color: '#C8953A',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                  }}
                >
                  {s.num}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{s.title}</h3>
                <p style={{ color: '#8A8F9E', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C8953A', marginBottom: '0.5rem' }}>
              100% Non-Custodial
            </h3>
            <p style={{ color: '#8A8F9E', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
              You maintain total custody of your wallet and private keys. Auren only signs authorization for gas coverage—it never has access to your assets or funds.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C8953A', marginBottom: '0.5rem' }}>
              Built for Humans & AI Agents
            </h3>
            <p style={{ color: '#8A8F9E', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
              Whether you are an end-user clicking in a web interface or an autonomous AI agent executing via API/MCP, sponsorship policies operate consistently and securely.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C8953A', marginBottom: '0.5rem' }}>
              Testnet Transparency
            </h3>
            <p style={{ color: '#8A8F9E', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
              Gas sponsorship is currently live and verifiable on Arc Testnet (Chain ID 5042002). Every transaction is recorded transparently on the Arc block explorer.
            </p>
          </div>
        </div>

        {/* Live CTA */}
        <div style={{ textAlign: 'center', background: 'rgba(200,149,58,0.05)', border: '1px solid rgba(200,149,58,0.2)', borderRadius: '12px', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            See It Work in Real Time
          </h2>
          <p style={{ color: '#8A8F9E', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto 1.5rem auto' }}>
            Try the live interactive execution console on Arc Testnet to watch an autonomous smart account execute with zero user gas.
          </p>
          <Link
            href="/agent-demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.8rem 1.6rem',
              borderRadius: '6px',
              background: '#C8953A',
              color: '#0A0D14',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            Launch Live Demo →
          </Link>
        </div>

      </div>
    </div>
  );
}
