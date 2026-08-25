'use client';

import Link from 'next/link';

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

/* ── 5-Step Visual Flow ─────────────────────────────────────── */
const FLOW_STEPS = [
  {
    step: '01',
    name: 'Discover',
    title: 'Agent Discovery',
    body: 'TechnoCore agent discovers active Arc DApps through Auren directory & MCP tools.',
  },
  {
    step: '02',
    name: 'Evaluate',
    title: 'Policy Evaluation',
    body: 'Auren Policy Engine evaluates whitelist, gas bounds, and daily venture budget.',
  },
  {
    step: '03',
    name: 'Sponsor',
    title: 'Intent Authorization',
    body: 'Agent signs with did:key; Auren generates bounded Paymaster authorization.',
  },
  {
    step: '04',
    name: 'Execute',
    title: 'On-Chain Execution',
    body: 'Transaction executes on Arc Testnet with gas covered from isolated DAppVault.',
  },
  {
    step: '05',
    name: 'Settle',
    title: 'Revenue Distribution',
    body: 'Capital recovered first from top-line revenue before profit-sharing commences.',
  },
];

/* ── Verified Live Arc Data ─────────────────────────────────── */
const VERIFIED_TX = {
  hash: '0xb9f95b44bf960be101c43ef1ea568e8a062530387a4275de355a0afa6110a2d4',
  block: '58665142',
  gasUsed: '69,201',
  actionValue: '5.00 USDC',
  tvlBefore: '30.00 USDC',
  tvlAfter: '32.50 USDC',
  agentDid: 'did:key:z6MkreBJ7AT22iSUZNHKn4nC1uyao8Sb4mDK8cRePdFBjigt',
};

/* ── Component ─────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ═══════════════════════════════════════════ HERO SECTION */}
      <section
        className="hero"
        style={{
          paddingTop: '7.5rem',
          paddingBottom: '4.5rem',
          minHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Badges */}
          <div className="anim-fade-up" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <span className="badge badge-arc">
              <span className="dot-live" style={{ background: '#4A5AD8', animation: 'none' }} />
              Live on Arc Testnet
            </span>
            <span className="badge badge-gold">
              TechnoCore Integration Live
            </span>
          </div>

          {/* Headline */}
          <div style={{ maxWidth: 880, marginBottom: '1.75rem' }}>
            <h1
              className="text-display-xl anim-fade-up d-1"
              style={{ color: '#F8F6F2', margin: 0, lineHeight: 1.05 }}
            >
              The economic layer for
            </h1>
            <h1
              className="text-display-xl anim-fade-up d-2"
              style={{
                color: 'var(--color-gold)',
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              autonomous applications.
            </h1>
          </div>

          {/* Subtitle & Tagline */}
          <p
            className="anim-fade-up d-3"
            style={{
              fontSize: '1.25rem',
              fontWeight: 500,
              lineHeight: 1.6,
              color: 'rgba(248,246,242,0.85)',
              marginBottom: '0.75rem',
            }}
          >
            Fund growth. Enable agents.
          </p>
          <p
            className="anim-fade-up d-3"
            style={{
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'rgba(248,246,242,0.5)',
              maxWidth: 620,
              margin: '0 0 2.5rem 0',
            }}
          >
            Auren enables capital providers to fund user and AI-agent transaction budgets.
            TechnoCore agents discover, evaluate, and execute sponsored actions on Arc,
            while revenue recovers capital first before profit-sharing begins.
          </p>

          {/* CTAs */}
          <div
            className="anim-fade-up d-4"
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}
          >
            <Link href="/agent-demo" className="btn btn-gold btn-lg">
              ▶ Watch an Agent Execute
            </Link>
            <Link href="/build" className="btn btn-outline-white btn-lg">
              Build with Auren
            </Link>
          </div>

          {/* 5-Step Visual Flow Strip */}
          <div
            className="anim-fade-up d-5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
              10-Second Mental Model: How Value & Transactions Flow
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {FLOW_STEPS.map((item, idx) => (
                <div key={item.step} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                      {item.step}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-paper)' }}>
                      {item.name}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(248,246,242,0.5)', lineHeight: 1.5, margin: 0 }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ REAL ON-CHAIN SPOTLIGHT */}
      <section style={{ background: 'var(--color-paper-white)', padding: '5rem 0', borderBottom: '1px solid var(--color-ink-100)' }}>
        <div className="container">
          <div className="card" style={{ padding: '2.5rem', background: 'var(--color-ink)', color: 'var(--color-paper)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="dot-live" />
                  <span className="badge badge-green">Verified Real On-Chain Execution</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-paper)', letterSpacing: '-0.025em' }}>
                  TechnoCore User Agent Execution Live on Arc Testnet
                </h2>
                <p style={{ color: 'rgba(248,246,242,0.5)', fontSize: '0.875rem', marginTop: 4 }}>
                  Agent signed with Ed25519 <code style={{ color: 'var(--color-gold)' }}>did:key</code>, sponsored by Paymaster, confirmed in Block #{VERIFIED_TX.block}.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a
                  href={`https://testnet.arcscan.app/tx/${VERIFIED_TX.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-gold btn-md"
                >
                  View on ArcScan ↗
                </a>
                <Link href="/agent-demo" className="btn btn-outline-white btn-md">
                  Interactive Simulator →
                </Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {[
                { label: 'Transaction Hash', value: `${VERIFIED_TX.hash.slice(0, 10)}…${VERIFIED_TX.hash.slice(-8)}` },
                { label: 'Block Confirmed', value: `#${VERIFIED_TX.block}` },
                { label: 'Gas Used', value: VERIFIED_TX.gasUsed },
                { label: 'Vault TVL Growth', value: `${VERIFIED_TX.tvlBefore} → ${VERIFIED_TX.tvlAfter}` },
                { label: 'Profit Realized', value: '+2.50 USDC (50/50 Split)' },
              ].map((m) => (
                <div key={m.label} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="stat-label" style={{ color: 'rgba(248,246,242,0.4)', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ color: 'var(--color-paper)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ THREE AGENT ROLES */}
      <section style={{ padding: '6rem 0', background: 'var(--color-paper)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>Economic Utility</span>
            <h2 className="text-display" style={{ marginBottom: '0.75rem' }}>
              Three Autonomous Roles
            </h2>
            <p className="text-body text-muted">
              AI agents in Auren express intent and analyze telemetry — on-chain policy and isolated vaults hold authoritative control.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.75rem' }}>
            {/* User Agent */}
            <div className="card" style={{ padding: '2.25rem', borderColor: '#B8D9CB', background: '#F4FAF7' }}>
              <span className="badge badge-green" style={{ marginBottom: '1.25rem' }}>Autonomous Consumer</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>User Agent</h3>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6, minHeight: 68 }}>
                Discovers registered Arc DApps, validates sponsorship eligibility against Auren policy, signs requests with its <code style={{ color: 'var(--color-ink)' }}>did:key</code>, and executes gas-free on Arc.
              </p>
              <div className="card-inset" style={{ padding: '1rem', fontSize: '0.75rem', background: 'white', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Capability: </span>
                <span>Calls Auren Paymaster & syncs state to TechnoCore /r/auren-ops</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-emerald)' }}>
                🔒 Zero Vault Custody · Bounded by Policy
              </div>
            </div>

            {/* Growth Agent */}
            <div className="card" style={{ padding: '2.25rem', borderColor: 'var(--color-gold-200)', background: '#FFFDF9' }}>
              <span className="badge badge-gold" style={{ marginBottom: '1.25rem' }}>Acquisition Strategist</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Growth Agent</h3>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6, minHeight: 68 }}>
                Analyzes gas spent, revenue generated, and capital recovery velocity. Recommends sponsorship budget adjustments to DApp developers to maximize ROI.
              </p>
              <div className="card-inset" style={{ padding: '1rem', fontSize: '0.75rem', background: 'white', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Capability: </span>
                <span>Publishes advisories to TechnoCore /r/auren-growth and /kv/auren-growth</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                🔒 Advisory Only · No Direct Fund Control
              </div>
            </div>

            {/* Investment Agent */}
            <div className="card" style={{ padding: '2.25rem', borderColor: '#D0D6E2', background: '#F8FAFC' }}>
              <span className="badge badge-neutral" style={{ marginBottom: '1.25rem' }}>LP Venture Analyst</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Investment Agent</h3>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6, minHeight: 68 }}>
                Evaluates active vaults for LPs: calculates capital at risk (unrecovered principal), recovery rate, and net profit distribution under non-interest terms.
              </p>
              <div className="card-inset" style={{ padding: '1rem', fontSize: '0.75rem', background: 'white', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Capability: </span>
                <span>Generates LP venture risk briefs to TechnoCore /r/auren-lp</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3B82F6' }}>
                🔒 Analyst Only · No Fund Movement Authority
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ BUILT FOR ARC ECOSYSTEM */}
      <section style={{ padding: '6rem 0', background: 'var(--color-paper-white)', borderTop: '1px solid var(--color-ink-100)', borderBottom: '1px solid var(--color-ink-100)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-arc" style={{ marginBottom: '1rem' }}>Ecosystem Architecture</span>
              <h2 className="text-display" style={{ marginBottom: '1rem' }}>
                Built for the Arc Ecosystem
              </h2>
              <p className="text-body text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Arc is a stablecoin-native Layer-1 blockchain built by Circle where USDC is the native gas token.
                Auren leverages native USDC with ERC-4337 Account Abstraction and TechnoCore MCP tools to enable frictionless agent commerce.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/technocore" className="btn btn-primary">
                  TechnoCore Architecture →
                </Link>
                <Link href="/build" className="btn btn-outline">
                  Developer Quickstart
                </Link>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  ['Network', 'Arc Testnet (Chain ID 5042002)'],
                  ['Native Gas Token', 'USDC (18 decimals via msg.value)'],
                  ['Account Abstraction', 'ERC-4337 Canonical EntryPoint v0.6'],
                  ['Agent Identity', 'Ed25519 did:key:z6Mk...'],
                  ['Agent Discovery', '/llms.txt, /skill.md, agent.json'],
                  ['Tool Standard', 'Model Context Protocol (MCP) stdio & JSON-RPC'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--color-ink-100)', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{k}</span>
                    <span className="text-mono" style={{ color: 'var(--color-ink-500)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ TECHNICAL TRANSPARENCY / TRUST */}
      <section style={{ padding: '6rem 0', background: 'var(--color-paper)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3rem' }}>
            <span className="badge badge-neutral" style={{ marginBottom: '0.75rem' }}>Trust & Transparency</span>
            <h2 className="text-display" style={{ marginBottom: '0.75rem' }}>
              Verified Deployed Contracts
            </h2>
            <p className="text-body text-muted">
              Deterministic on-chain authority guarantees that funds are protected by smart contracts, not AI promises.
            </p>
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                ['MudarabahVaultFactory', '0x8CB1E0Dcd5dA6F8C17b83535B4307128701BA7ab'],
                ['Active DAppVault', '0x851bD1E5d9CdeD0f183e861dB98157641C826a74'],
                ['InvestmentPaymaster', '0x2a4122372B1A624118Ee3e7D4503B9525CfDE076'],
                ['RevenueSplitter', '0x8aA1197eFF337Db0c2aaF9e085c50cB46A7Fb2f7'],
                ['DemoDApp Marketplace', '0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6'],
                ['Canonical EntryPoint v0.6', '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'],
              ].map(([name, addr]) => (
                <div key={name} className="metric-row" style={{ padding: '0.75rem 0' }}>
                  <span className="metric-label" style={{ minWidth: 200, fontWeight: 600 }}>{name}</span>
                  <a
                    href={`https://testnet.arcscan.app/address/${addr}`}
                    target="_blank"
                    rel="noreferrer"
                    className="metric-value text-mono"
                    style={{ color: 'var(--color-ink)', textDecoration: 'underline' }}
                  >
                    {addr}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ FINAL CTAS */}
      <section style={{ padding: '6rem 0', background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 680 }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-paper)', marginBottom: '1rem' }}>
            Build with Auren
          </h2>
          <p style={{ color: 'rgba(248,246,242,0.6)', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Empower your DApp or autonomous agent with frictionless gas sponsorship and profit-sharing capital.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link href="/agent-demo" className="btn btn-gold btn-lg">
              ▶ Watch an Agent Execute
            </Link>
            <Link href="/build" className="btn btn-outline-white btn-lg">
              Launch an Agent / DApp
            </Link>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'rgba(248,246,242,0.3)', margin: 0 }}>
            No guaranteed returns · No fixed APY · Capital is at risk · Designed around a non-interest, profit-sharing model; subject to qualified Sharia scholar review.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ FOOTER */}
      <footer style={{ background: 'var(--color-ink)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <LogoMark size={22} />
            <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--color-paper)' }}>
              Auren
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(248,246,242,0.2)', marginLeft: '0.5rem' }}>
              Arc Testnet · TechnoCore Integration
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              ['Agent Demo', '/agent-demo'],
              ['TechnoCore', '/technocore'],
              ['Developers', '/build'],
              ['Invest', '/invest'],
              ['Explore', '/explore'],
              ['App Demo', '/demo'],
            ].map(([label, href]) => (
              <Link key={label} href={href} style={{ color: 'rgba(248,246,242,0.4)', fontSize: '0.8125rem', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
