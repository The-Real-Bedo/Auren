'use client';

import Link from 'next/link';

export default function CapitalPage() {
  const metrics = [
    {
      label: 'Capital Supplied (TVL)',
      value: '47.51 USDC',
      desc: 'Liquid native USDC deposited by LPs in the active isolated vault on Arc Testnet.',
    },
    {
      label: 'Capital Deployed for Gas',
      value: '0.0074 USDC',
      desc: 'Total gas funds drawn from the vault to sponsor verified user & agent executions.',
    },
    {
      label: 'Capital Recovered',
      value: '0.00 USDC',
      desc: 'Top-line DApp monetization proceeds routed back to principal recovery.',
    },
    {
      label: 'Unrecovered Capital',
      value: '0.0074 USDC',
      desc: 'Outstanding deployed capital remaining to be recovered prior to profit sharing.',
    },
    {
      label: 'Realized LP Profit',
      value: '0.00 USDC',
      desc: 'Profits distributed according to the 50/50 Mudarabah-inspired profit sharing terms.',
    },
    {
      label: 'Venture Risk Model',
      value: 'Isolated Vault',
      desc: 'Each DApp maintains independent accounting with zero cross-pool risk contagion.',
    },
  ];

  return (
    <div style={{ background: '#0A0D14', color: '#F8F6F2', minHeight: '100vh', paddingTop: '6.5rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: 1050, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(200,149,58,0.1)', border: '1px solid rgba(200,149,58,0.25)', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#C8953A', letterSpacing: '0.05em' }}>
              CAPITAL & LIQUIDITY INFRASTRUCTURE
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Fund application growth with revenue-first recovery.
          </h1>

          <p style={{ color: '#8A8F9E', fontSize: '1.1rem', maxWidth: 720, margin: '0 auto', lineHeight: 1.6 }}>
            Capital providers supply growth liquidity into isolated application ventures. Generated revenue is used to recover initial capital before profit sharing commences according to venture terms.
          </p>
        </div>

        {/* Live On-Chain Accounting Card */}
        <div style={{ background: '#0D111A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '2.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#C8953A', textTransform: 'uppercase' }}>
                Active Isolated Venture
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.2rem 0 0 0' }}>
                Digital Marketplace Vault (Arc Testnet)
              </h2>
            </div>
            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.75rem', borderRadius: '6px', color: '#8A8F9E' }}>
              Vault: 0x851b…6a74
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#8A8F9E', marginBottom: '0.4rem' }}>{m.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8F6F2', marginBottom: '0.4rem' }}>{m.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#666B7A', lineHeight: 1.4 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mechanism Deep Dive */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C8953A', marginBottom: '0.75rem' }}>
              1. Growth Capital Deployment
            </h3>
            <p style={{ color: '#8A8F9E', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              LP funds deposited in the DAppVault are drawn only when eligible users or autonomous agents execute policy-approved transactions. Gas funds are transferred into the EntryPoint Paymaster on demand.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C8953A', marginBottom: '0.75rem' }}>
              2. Revenue-First Capital Recovery
            </h3>
            <p style={{ color: '#8A8F9E', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              When monetized actions occur, 100% of top-line revenue routes to the vault until all deployed gas capital is fully recovered. This prioritizes principal preservation over premature profit distributions.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C8953A', marginBottom: '0.75rem' }}>
              3. Mudarabah-Inspired Profit Sharing
            </h3>
            <p style={{ color: '#8A8F9E', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Once deployed capital is 100% recovered, net generated profits are split automatically between liquidity providers and the DApp developer according to the on-chain agreement (e.g. 50% LP / 50% Developer).
            </p>
          </div>
        </div>

        {/* Risk & Sharia Disclaimer (Explicit & Honest) */}
        <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '2rem', marginBottom: '3rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Important Risk & Testnet Disclosures
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#B3B8C5', fontSize: '0.88rem', lineHeight: 1.5 }}>
            <li>• <strong>Returns are not guaranteed:</strong> Capital deployment is contingent on application usage. If an application generates insufficient revenue, unrecovered capital loss is possible.</li>
            <li>• <strong>No fixed yield or interest:</strong> Auren strictly avoids debt, interest (riba), or guaranteed return mechanics. Profit distributions occur only from real realized application revenue.</li>
            <li>• <strong>Public Testnet release:</strong> Current contracts are deployed on Arc Testnet (Chain ID 5042002) for validation and testing. Do not supply mainnet assets.</li>
            <li>• <strong>Governance & Compliance:</strong> The economic mechanism is inspired by Mudarabah venture partnerships and is subject to appropriate independent legal and qualified Sharia board review prior to production mainnet deployment.</li>
          </ul>
        </div>

        {/* Explore DApps CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.8rem 1.6rem',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#F8F6F2',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            Explore Active Ventures →
          </Link>
        </div>

      </div>
    </div>
  );
}
