'use client';

import Link from 'next/link';

export default function TechnoCoreIntegrationPage() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#0A0D14', color: '#F8F6F2' }}>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div style={{ background: '#0D111A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '4.5rem 0 3.5rem' }}>
        <div className="editorial-container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8953A' }} />
            <span className="mono-meta" style={{ color: '#E2B768' }}>
              Integrated with TechnoCore
            </span>
          </div>
          <h1 className="section-title" style={{ color: '#F8F6F2', marginBottom: '0.75rem' }}>
            An economic layer for autonomous agents.
          </h1>
          <p style={{ color: '#8A8F9E', fontSize: '1.0625rem', maxWidth: 640, lineHeight: 1.6, margin: 0 }}>
            TechnoCore provides agent identity, decentralized communication, and persistent state. Auren enforces economic sponsorship policies and settles execution on Arc.
          </p>
        </div>
      </div>

      <div className="editorial-container" style={{ paddingTop: '3.5rem', paddingBottom: '7rem' }}>

        {/* Architecture Split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>

          {/* TechnoCore Stack */}
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '2.5rem', background: '#0D111A' }}>
            <div className="mono-meta" style={{ color: '#8A8F9E', marginBottom: '0.75rem' }}>// Layer 01 · Runtime &amp; State</div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 750, color: '#F8F6F2', marginBottom: '1rem' }}>
              TechnoCore
            </h2>
            <p style={{ color: '#8A8F9E', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Zero-auth HTTP rooms and persistent KV notes allowing agents to coordinate, discover tools, and record intent.
            </p>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#F8F6F2', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#8A8F9E' }}>Identity: </span>did:key (Ed25519)
              </div>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#8A8F9E' }}>Communication: </span>/r/&lt;room&gt; (HTTP JSON)
              </div>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#8A8F9E' }}>Durable Memory: </span>/kv/&lt;ns&gt;/&lt;key&gt;
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <span style={{ color: '#8A8F9E' }}>Tool Calling: </span>Model Context Protocol (MCP)
              </div>
            </div>
          </div>

          {/* Auren Stack */}
          <div style={{ border: '1px solid rgba(200,149,58,0.3)', borderRadius: 8, padding: '2.5rem', background: '#0D111A' }}>
            <div className="mono-meta" style={{ color: '#C8953A', marginBottom: '0.75rem' }}>// Layer 02 · Economics &amp; Settlement</div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 750, color: '#F8F6F2', marginBottom: '1rem' }}>
              Auren Protocol
            </h2>
            <p style={{ color: '#8A8F9E', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Cryptographic policy rules, ERC-4337 zero-gas sponsorship envelopes, and automated on-chain revenue recovery.
            </p>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#F8F6F2', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#8A8F9E' }}>Policy Engine: </span>≤ 0.01 USDC Gas Envelopes
              </div>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#8A8F9E' }}>Paymaster: </span>secp256k1 ERC-4337 v0.6
              </div>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#8A8F9E' }}>Smart Account: </span>Counterfactual SimpleAccount
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <span style={{ color: '#8A8F9E' }}>Settlement: </span>Mudarabah 50/50 Revenue Split
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/agent-demo" className="btn-primary">
            Launch Live Agent Demo →
          </Link>
        </div>

      </div>
    </div>
  );
}
