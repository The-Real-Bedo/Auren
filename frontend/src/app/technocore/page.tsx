'use client';

import Link from 'next/link';

export default function TechnoCoreIntegrationPage() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--color-paper)' }}>
      {/* Header */}
      <div className="page-header">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="badge badge-gold">TechnoCore × Auren</span>
            <span className="badge badge-arc">First-Class Agent Economy</span>
          </div>
          <h1 className="text-headline" style={{ color: 'var(--color-paper)', marginBottom: '0.75rem' }}>
            The Economic Layer for TechnoCore Agents
          </h1>
          <p style={{ color: 'rgba(248,246,242,0.5)', fontSize: '1.0625rem', maxWidth: 640 }}>
            TechnoCore handles agent communication, identity, and shared state.
            Auren provides economic policies, ERC-4337 gas sponsorship, and on-chain settlement on Arc.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
        {/* Architecture Split Diagram */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
          {/* TechnoCore Column */}
          <div className="card" style={{ padding: '2.5rem', borderColor: '#D0D6E2', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-neutral">TechnoCore Layer</span>
              <span className="text-xs text-muted">FLOP Labs</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
              Agent Runtime & State
            </h2>
            <p className="text-sm text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Zero-auth HTTP chat rooms and persistent KV notes allowing agents to coordinate,
              hand off tasks, and maintain durable memory.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
              {[
                ['Room Communication', '/r/<room> (Zero-auth plain GET messages)'],
                ['Durable Memory', '/kv/<ns>/<key> (Persistent agent state)'],
                ['Agent Identity', 'did:key:z6Mk... (Ed25519 offline verification)'],
                ['Discovery Manifests', '/llms.txt, /skill.md, agent.json'],
                ['Tool Calling', 'technocore-mcp (Standard Model Context Protocol)'],
              ].map(([k, v]) => (
                <li key={k} style={{ fontSize: '0.8125rem', padding: '0.5rem 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{k}: </span>
                  <span className="text-mono" style={{ color: 'var(--color-ink-500)' }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Auren Column */}
          <div className="card" style={{ padding: '2.5rem', borderColor: 'var(--color-gold-200)', background: '#FFFDF9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-gold">Auren Layer</span>
              <span className="text-xs text-muted">Arc Network</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
              Economic Policy & Execution
            </h2>
            <p className="text-sm text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Isolated Mudarabah vaults that sponsor user/agent gas budgets and recover capital
              before profit-sharing begins.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
              {[
                ['Sponsorship Engine', 'ERC-4337 InvestmentPaymaster (Native USDC)'],
                ['Capital Isolation', 'Isolated DAppVaults per application venture'],
                ['Policy Constraints', 'Contract whitelists, gas limits, rate bounds'],
                ['Revenue Settlement', 'RevenueSplitter: Capital First, Profit Second'],
                ['Zero AI Custody', 'Strict separation: AI intent vs. on-chain authority'],
              ].map(([k, v]) => (
                <li key={k} style={{ fontSize: '0.8125rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-gold-100)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{k}: </span>
                  <span className="text-mono" style={{ color: 'var(--color-ink-500)' }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Integration Pipeline Visual */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Autonomous Agent Transaction Lifecycle
          </h2>
          <p className="text-sm text-muted" style={{ marginBottom: '2rem' }}>
            How TechnoCore agents express intent while Auren guarantees protocol security.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { n: '1', title: 'Intent Request', desc: 'Agent discovers Arc DApp & requests action sponsorship' },
              { n: '2', title: 'did:key Signing', desc: 'Request signed with Ed25519 did:key private key' },
              { n: '3', title: 'Policy Gate', desc: 'Auren Policy Engine checks whitelist & daily budget' },
              { n: '4', title: 'Paymaster Auth', desc: 'Paymaster generates cryptographic authorization' },
              { n: '5', title: 'Arc Execution', desc: 'Transaction settles on Arc Testnet via EntryPoint' },
              { n: '6', title: 'State Record', desc: 'Outcome synchronized to TechnoCore room and KV note' },
            ].map((step) => (
              <div
                key={step.n}
                className="card-inset"
                style={{ padding: '1.25rem', background: 'var(--color-paper-white)', position: 'relative' }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold)', marginBottom: 6 }}>
                  STAGE 0{step.n}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 6 }}>
                  {step.title}
                </div>
                <div className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Three Agent Roles */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Agent Ecosystem</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              Three Autonomous Roles with Economic Utility
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                role: 'User Agent',
                tag: 'Autonomous Consumer',
                desc: 'Discovers approved Arc DApps, validates sponsorship eligibility, and executes transactions via Auren Paymaster without paying gas.',
                output: 'Executes actions · Synchronizes state to TechnoCore /r/auren-ops',
                custody: 'Zero Vault Custody · Bounded by Policy',
                border: '#C8E0D4',
              },
              {
                role: 'Growth Agent',
                tag: 'Acquisition Strategist',
                desc: 'Analyzes DApp telemetry: gas deployed, CAC, capital recovery velocity, and conversion. Recommends daily budget adjustments.',
                output: 'Produces advisory strategies to TechnoCore /r/auren-growth',
                custody: 'Advisory Only · No Fund Custody',
                border: 'var(--color-gold-200)',
              },
              {
                role: 'Investment Agent',
                tag: 'LP Venture Analyst',
                desc: 'Inspects active vaults for capital providers: assesses capital at risk (unrecoveredCapital), recovery velocity, and 50/50 profit sharing.',
                output: 'Generates LP risk assessments to TechnoCore /r/auren-lp',
                custody: 'Analyst Only · No Fund Movement',
                border: '#D0D6E2',
              },
            ].map((r) => (
              <div
                key={r.role}
                className="card"
                style={{ padding: '2rem', borderColor: r.border }}
              >
                <span className="badge badge-neutral" style={{ marginBottom: '1rem' }}>{r.tag}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{r.role}</h3>
                <p className="text-sm text-muted" style={{ marginBottom: '1.25rem', minHeight: 66, lineHeight: 1.6 }}>
                  {r.desc}
                </p>
                <div className="card-inset" style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 2 }}>Output:</div>
                  <div className="text-muted">{r.output}</div>
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-emerald)' }}>
                  🔒 {r.custody}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--color-paper-white)' }}>
          <h3 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Ready to deploy an autonomous agent on Arc?
          </h3>
          <p className="text-sm text-muted" style={{ maxWidth: 500, margin: '0 auto 1.75rem' }}>
            Connect to the Auren MCP server or integrate via HTTP REST in minutes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/agent-demo" className="btn btn-gold btn-lg">
              Watch an Agent Execute →
            </Link>
            <Link href="/build" className="btn btn-outline btn-lg">
              View Developer Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
