'use client';

import Link from 'next/link';

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

export default function Home() {
  return (
    <div style={{ background: '#0A0D14', color: '#F8F6F2', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── SECTION 01: HERO ──────────────────────────────────────── */}
      <section style={{ paddingTop: '10rem', paddingBottom: '7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="editorial-container">

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8953A' }} />
            <span className="mono-meta" style={{ color: '#E2B768' }}>
              Public Testnet · Arc Network (Chain 5042002)
            </span>
          </div>

          <h1 className="hero-title" style={{ marginBottom: '1.75rem' }}>
            AUREN
          </h1>

          <p style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 750, letterSpacing: '-0.035em', lineHeight: 1.15, maxWidth: 840, marginBottom: '1rem', color: '#F8F6F2' }}>
            The economic layer for autonomous applications.
          </p>

          <p style={{ fontSize: '1.25rem', fontWeight: 500, color: '#C8953A', marginBottom: '3rem', letterSpacing: '0.01em' }}>
            Fund growth. Enable agents.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/demo" className="btn-primary">
              Try Auren (Consumer Demo) →
            </Link>
            <Link href="/agent-demo" className="btn-secondary">
              Watch an Agent Execute
            </Link>
          </div>

        </div>
      </section>

      {/* ── SECTION 02: THE PROBLEM ───────────────────────────────── */}
      <section style={{ padding: '8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0D111A' }}>
        <div className="editorial-container">

          <div className="mono-meta" style={{ marginBottom: '1.5rem', color: '#C8953A' }}>
            01 / The Friction
          </div>

          <h2 className="section-title" style={{ maxWidth: 800, marginBottom: '4rem' }}>
            Autonomous applications can act.<br />
            <span style={{ color: '#8A8F9E' }}>But who pays for the action?</span>
          </h2>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            <div>
              <div className="mono-meta" style={{ marginBottom: '0.75rem' }}>Gas Tokens</div>
              <p style={{ fontSize: '1.0625rem', color: '#8A8F9E', lineHeight: 1.6, margin: 0 }}>
                Every blockchain action demands native gas tokens. Users abandon applications during onboarding; AI agents halt execution when wallets run dry.
              </p>
            </div>
            <div>
              <div className="mono-meta" style={{ marginBottom: '0.75rem' }}>Uncontrolled Risk</div>
              <p style={{ fontSize: '1.0625rem', color: '#8A8F9E', lineHeight: 1.6, margin: 0 }}>
                Naïve paymasters bleed capital to bots and spam. Applications require enforceable cryptographic policies before paying for transactions.
              </p>
            </div>
            <div>
              <div className="mono-meta" style={{ marginBottom: '0.75rem' }}>Unrecovered Capital</div>
              <p style={{ fontSize: '1.0625rem', color: '#8A8F9E', lineHeight: 1.6, margin: 0 }}>
                Sponsoring user growth is costly. Without automated revenue routing, developers burn venture capital without recovering principal.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 03: AUREN ─────────────────────────────────────── */}
      <section style={{ padding: '8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="editorial-container">

          <div className="mono-meta" style={{ marginBottom: '1.5rem', color: '#C8953A' }}>
            02 / The Solution
          </div>

          <h2 className="section-title" style={{ maxWidth: 900, marginBottom: '5rem' }}>
            Auren turns application activity into an economic system.
          </h2>

          {/* Linear Economic Diagram */}
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '3rem 2rem', background: '#0D111A' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', textAlign: 'center' }}>
              <div>
                <span className="mono-meta" style={{ color: '#C8953A', display: 'block', marginBottom: '0.5rem' }}>01. INFLOW</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8F6F2' }}>Capital Vault</div>
                <div style={{ fontSize: '0.8125rem', color: '#8A8F9E', marginTop: '0.25rem' }}>Isolated venture USDC</div>
              </div>
              <div style={{ color: '#525766', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</div>
              <div>
                <span className="mono-meta" style={{ color: '#C8953A', display: 'block', marginBottom: '0.5rem' }}>02. POLICY</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8F6F2' }}>Rule Engine</div>
                <div style={{ fontSize: '0.8125rem', color: '#8A8F9E', marginTop: '0.25rem' }}>≤ 0.01 USDC gas envelope</div>
              </div>
              <div style={{ color: '#525766', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</div>
              <div>
                <span className="mono-meta" style={{ color: '#C8953A', display: 'block', marginBottom: '0.5rem' }}>03. EXECUTION</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8F6F2' }}>EntryPoint v0.6</div>
                <div style={{ fontSize: '0.8125rem', color: '#8A8F9E', marginTop: '0.25rem' }}>Atomic Arc settlement</div>
              </div>
              <div style={{ color: '#525766', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</div>
              <div>
                <span className="mono-meta" style={{ color: '#C8953A', display: 'block', marginBottom: '0.5rem' }}>04. SETTLEMENT</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8F6F2' }}>Revenue Splitter</div>
                <div style={{ fontSize: '0.8125rem', color: '#8A8F9E', marginTop: '0.25rem' }}>Principal recovery + 50/50</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 04: THREE PARTICIPANTS ────────────────────────── */}
      <section style={{ padding: '8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0D111A' }}>
        <div className="editorial-container">

          <div className="mono-meta" style={{ marginBottom: '1.5rem', color: '#C8953A' }}>
            03 / Participants
          </div>

          <h2 className="section-title" style={{ maxWidth: 840, marginBottom: '4.5rem' }}>
            One economic layer.<br />
            Three ways to participate.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            {/* Panel 1: User */}
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 2rem', borderRadius: 8, background: '#0A0D14' }}>
              <div className="mono-meta" style={{ color: '#C8953A', marginBottom: '1rem' }}>01 / USER</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 750, color: '#F8F6F2', marginBottom: '1rem', lineHeight: 1.2 }}>
                Use applications.<br />Gas is sponsored.
              </h3>
              <p style={{ color: '#8A8F9E', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Interact with applications with zero friction. Keep complete non-custodial ownership of your wallet and only pay the real product price.
              </p>
              <Link href="/demo" style={{ color: '#C8953A', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                Try Consumer Demo →
              </Link>
            </div>

            {/* Panel 2: Developer */}
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 2rem', borderRadius: 8, background: '#0A0D14' }}>
              <div className="mono-meta" style={{ color: '#C8953A', marginBottom: '1rem' }}>02 / DEVELOPER</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 750, color: '#F8F6F2', marginBottom: '1rem', lineHeight: 1.2 }}>
                Acquire users.<br />Fund activity.<br />Measure revenue.
              </h3>
              <p style={{ color: '#8A8F9E', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Integrate gas sponsorship via the TypeScript SDK. Draw liquidity from venture vaults and automate top-line revenue settlement back to LPs.
              </p>
              <Link href="/build" style={{ color: '#C8953A', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                Build with Auren →
              </Link>
            </div>

            {/* Panel 3: Capital */}
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 2rem', borderRadius: 8, background: '#0A0D14' }}>
              <div className="mono-meta" style={{ color: '#C8953A', marginBottom: '1rem' }}>03 / CAPITAL</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 750, color: '#F8F6F2', marginBottom: '1rem', lineHeight: 1.2 }}>
                Fund growth.<br />Recover capital.<br />Share profit.
              </h3>
              <p style={{ color: '#8A8F9E', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Deploy USDC into isolated vaults to sponsor application adoption. 100% of top-line revenue first repays deployed gas principal before 50/50 profit splitting.
              </p>
              <Link href="/capital" style={{ color: '#C8953A', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                Explore Capital Vaults →
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 05: LIVE PROOF ────────────────────────────────── */}
      <section style={{ padding: '8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="editorial-container">

          <div className="mono-meta" style={{ marginBottom: '1.5rem', color: '#C8953A' }}>
            04 / On-Chain Proof
          </div>

          <h2 className="section-title" style={{ maxWidth: 840, marginBottom: '3.5rem' }}>
            Auren is already running on Arc.
          </h2>

          {/* Single Verified Transaction Display */}
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '2.5rem', background: '#0D111A' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="pill-badge pill-badge-green" style={{ marginBottom: '0.5rem' }}>
                  ✓ Confirmed on Arc Testnet (Chain 5042002)
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8F6F2', margin: 0 }}>
                  Real Consumer Purchase Execution
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="mono-meta">Block Height</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace', color: '#F8F6F2' }}>#58802235</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <span className="mono-meta">Transaction Hash</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  <a
                    href="https://testnet.arcscan.app/tx/0x635c22578ea72c9f97f4a609fcd06cc90697a6d069e3011393b684493139d197"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#E2B768', textDecoration: 'underline' }}
                  >
                    0x635c2257...39d197 ↗
                  </a>
                </div>
              </div>
              <div>
                <span className="mono-meta">Gas Paid by Auren</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#16A34A', fontWeight: 700, marginTop: '0.25rem' }}>
                  0.00292 USDC
                </div>
              </div>
              <div>
                <span className="mono-meta">User Gas Cost</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#F8F6F2', fontWeight: 700, marginTop: '0.25rem' }}>
                  0.00 USDC (100% Free)
                </div>
              </div>
              <div>
                <span className="mono-meta">Canonical EntryPoint</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#8A8F9E', marginTop: '0.25rem' }}>
                  0x5FF1...2789 (v0.6)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#8A8F9E' }}>
                Smart Account: <code>0xA32F...49CE</code> · Item Price: <code>10.00 USDC</code>
              </span>
              <Link href="/agent-demo" style={{ color: '#C8953A', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                Watch Real-Time Execution Console →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 06: AGENTS ────────────────────────────────────── */}
      <section style={{ padding: '8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0D111A' }}>
        <div className="editorial-container">

          <div className="mono-meta" style={{ marginBottom: '1.5rem', color: '#C8953A' }}>
            05 / Agent Runtime
          </div>

          <h2 className="section-title" style={{ maxWidth: 840, marginBottom: '3rem' }}>
            Agents can act.<br />
            <span style={{ color: '#8A8F9E' }}>Auren makes action economic.</span>
          </h2>

          <p style={{ fontSize: '1.125rem', color: '#8A8F9E', maxWidth: 720, lineHeight: 1.6, marginBottom: '3.5rem' }}>
            Integrated with TechnoCore for decentralized agent identity and MCP state, Auren allows autonomous agents to evaluate opportunities, obtain cryptographic gas sponsorship, and settle results on Arc.
          </p>

          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '2rem', background: '#0A0D14', marginBottom: '2.5rem' }}>
            <div className="mono-meta" style={{ color: '#8A8F9E', marginBottom: '1rem' }}>// Execution Flow</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#F8F6F2', lineHeight: 2 }}>
              <span style={{ color: '#E2B768' }}>TECHNOCORE</span> (did:key &amp; MCP state) → <br />
              <span style={{ color: '#E2B768' }}>AUREN POLICY</span> (rule verification &amp; 0.01 USDC ceiling) → <br />
              <span style={{ color: '#E2B768' }}>INVESTMENT PAYMASTER</span> (secp256k1 signature) → <br />
              <span style={{ color: '#16A34A' }}>ARC TESTNET</span> (atomic on-chain execution)
            </div>
          </div>

          <Link href="/agent-demo" className="btn-secondary">
            Watch an Agent Execute →
          </Link>

        </div>
      </section>

      {/* ── SECTION 07: CONSUMER EXPERIENCE ───────────────────────── */}
      <section style={{ padding: '8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="editorial-container">

          <div className="mono-meta" style={{ marginBottom: '1.5rem', color: '#C8953A' }}>
            06 / Consumer Experience
          </div>

          <h2 className="section-title" style={{ maxWidth: 800, marginBottom: '3.5rem' }}>
            Buy. Sign once. Gas covered.
          </h2>

          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '3rem 2.5rem', background: '#0D111A', maxWidth: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span className="mono-meta">Demo Application</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8F6F2', marginTop: '0.25rem' }}>Premium Access Pass</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8F6F2' }}>10.00 USDC</div>
                <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Gas: Sponsored by Auren</div>
              </div>
            </div>

            <p style={{ color: '#8A8F9E', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              The consumer signs one message in their wallet. The 10 USDC purchase routes directly to the application's vault; Auren covers 100% of network gas.
            </p>

            <Link href="/demo" className="btn-primary" style={{ width: '100%' }}>
              Try Consumer Demo →
            </Link>
          </div>

        </div>
      </section>

      {/* ── SECTION 08: DEVELOPERS ────────────────────────────────── */}
      <section style={{ padding: '8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0D111A' }}>
        <div className="editorial-container">

          <div className="mono-meta" style={{ marginBottom: '1.5rem', color: '#C8953A' }}>
            07 / Developer Integration
          </div>

          <h2 className="section-title" style={{ maxWidth: 800, marginBottom: '3.5rem' }}>
            Give your application an economic engine.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '1.0625rem', color: '#8A8F9E', lineHeight: 1.6, marginBottom: '2rem' }}>
                Integrate gas sponsorship into any Arc application with the Auren TypeScript SDK. Define spending policies, register with isolated vaults, and automate 50/50 profit splitting.
              </p>
              <Link href="/build" className="btn-primary">
                Build with Auren →
              </Link>
            </div>

            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '1.5rem', background: '#0A0D14', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
              <div style={{ color: '#8A8F9E', marginBottom: '0.5rem' }}>// Sponsor user action with Auren SDK</div>
              <div style={{ color: '#E2B768' }}>import &#123; AurenSDK &#125; from &apos;sdk&apos;;</div>
              <div style={{ color: '#F8F6F2', marginTop: '0.5rem' }}>const sdk = new AurenSDK(&#123; ... &#125;);</div>
              <div style={{ color: '#F8F6F2' }}>const userOp = await sdk.buildUserOp(&#123;</div>
              <div style={{ color: '#8A8F9E' }}>  sender: userSmartAccount,</div>
              <div style={{ color: '#8A8F9E' }}>  target: dAppAddress,</div>
              <div style={{ color: '#8A8F9E' }}>  callData: purchaseCallData</div>
              <div style={{ color: '#F8F6F2' }}>&#125;);</div>
              <div style={{ color: '#16A34A', marginTop: '0.5rem' }}>await sdk.sponsorAndSubmit(userOp);</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 09: CAPITAL ───────────────────────────────────── */}
      <section style={{ padding: '8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="editorial-container">

          <div className="mono-meta" style={{ marginBottom: '1.5rem', color: '#C8953A' }}>
            08 / Capital Infrastructure
          </div>

          <h2 className="section-title" style={{ maxWidth: 800, marginBottom: '3.5rem' }}>
            Fund application growth.<br />
            <span style={{ color: '#8A8F9E' }}>Measure recovery.</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '1.75rem', background: '#0D111A' }}>
              <span className="mono-meta">Capital Deployed</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8F6F2', marginTop: '0.5rem' }}>100% Isolated</div>
              <div style={{ fontSize: '0.8125rem', color: '#8A8F9E', marginTop: '0.25rem' }}>Zero cross-pool risk</div>
            </div>
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '1.75rem', background: '#0D111A' }}>
              <span className="mono-meta">Recovery Priority</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#C8953A', marginTop: '0.5rem' }}>Principal First</div>
              <div style={{ fontSize: '0.8125rem', color: '#8A8F9E', marginTop: '0.25rem' }}>Mudarabah structure</div>
            </div>
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '1.75rem', background: '#0D111A' }}>
              <span className="mono-meta">Profit Split</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8F6F2', marginTop: '0.5rem' }}>50 / 50</div>
              <div style={{ fontSize: '0.8125rem', color: '#8A8F9E', marginTop: '0.25rem' }}>LP and Developer</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#8A8F9E' }}>
              Risk Notice: Vault performance depends on DApp revenue on Arc Testnet. Capital recovery is not guaranteed.
            </span>
            <Link href="/capital" className="btn-secondary">
              Explore Capital Vaults →
            </Link>
          </div>

        </div>
      </section>

      {/* ── SECTION 10: FINAL STATEMENT ───────────────────────────── */}
      <section style={{ padding: '10rem 0 8rem', textAlign: 'center', background: '#070A0F' }}>
        <div className="editorial-container-narrow">

          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#F8F6F2', marginBottom: '2rem' }}>
            Fund growth.<br />
            Enable agents.
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <Link href="/demo" className="btn-primary">
              Try Auren →
            </Link>
            <Link href="/build" className="btn-secondary">
              Build on Arc
            </Link>
          </div>

          <div className="hairline-divider" style={{ marginBottom: '3rem' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#8A8F9E', fontSize: '0.8125rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogoMark size={20} />
              <span style={{ fontWeight: 800, color: '#F8F6F2', letterSpacing: '0.08em' }}>AUREN</span>
              <span>· Arc Testnet (5042002)</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/demo" style={{ color: 'inherit', textDecoration: 'none' }}>Consumer Demo</Link>
              <Link href="/agent-demo" style={{ color: 'inherit', textDecoration: 'none' }}>Agent Demo</Link>
              <Link href="/build" style={{ color: 'inherit', textDecoration: 'none' }}>Developers</Link>
              <Link href="/capital" style={{ color: 'inherit', textDecoration: 'none' }}>Capital</Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
