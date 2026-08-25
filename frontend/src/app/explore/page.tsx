'use client';

import Link from 'next/link';
import { CONTRACTS, ARC_TESTNET_CHAIN_ID } from '../../config/contracts';

const config = CONTRACTS[ARC_TESTNET_CHAIN_ID];

export default function ExplorePage() {
  return (
    <div style={{ background: '#0A0D14', color: '#F8F6F2', minHeight: '100vh', paddingTop: '6.5rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: 1050, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(200,149,58,0.1)', border: '1px solid rgba(200,149,58,0.25)', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#C8953A', letterSpacing: '0.05em' }}>
              VENTURE & DAPP DIRECTORY
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Explore Auren-Enabled Applications
          </h1>

          <p style={{ color: '#8A8F9E', fontSize: '1.05rem', maxWidth: 640, lineHeight: 1.6 }}>
            Browse active application ventures on Arc Testnet. Each venture operates with an isolated liquidity vault and transparent on-chain revenue recovery.
          </p>
        </div>

        {/* Section 1: Technical Demonstration */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
              Technical Demonstration
            </h2>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(200,149,58,0.15)', color: '#C8953A', fontWeight: 600 }}>
              Reference Implementation
            </span>
          </div>

          <div style={{ background: '#0D111A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg, #C8953A 0%, #E2B768 100%)' }} />
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Demo Digital Marketplace</h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 600 }}>
                      Live on Testnet
                    </span>
                  </div>
                  <p style={{ color: '#8A8F9E', fontSize: '0.9rem', maxWidth: 580, margin: 0, lineHeight: 1.5 }}>
                    A demonstration commerce contract on Arc Testnet where sponsored digital item purchases flow through Auren's isolated capital infrastructure.
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C8953A' }}>50%</div>
                  <div style={{ fontSize: '0.78rem', color: '#8A8F9E' }}>LP Profit Split</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#8A8F9E', marginBottom: '0.2rem' }}>Network</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Arc Testnet</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#8A8F9E', marginBottom: '0.2rem' }}>Capital Asset</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Native USDC</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#8A8F9E', marginBottom: '0.2rem' }}>Recovery Rule</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Revenue-First</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#8A8F9E', marginBottom: '0.2rem' }}>Sponsorship</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>ERC-4337 v0.6</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  href="/agent-demo"
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '6px',
                    background: '#C8953A',
                    color: '#0A0D14',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                  }}
                >
                  Run Agent Execution
                </Link>
                <Link
                  href="/capital"
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F8F6F2',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                  }}
                >
                  View Capital Metrics
                </Link>
              </div>
            </div>

            <div style={{ padding: '0.75rem 2rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem', color: '#666B7A' }}>
              Vault: <code style={{ color: '#8A8F9E' }}>{config.vault}</code> | Paymaster: <code style={{ color: '#8A8F9E' }}>{config.paymaster}</code>
            </div>
          </div>
        </div>

        {/* Section 2: Partner Applications (Clear Empty State) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
              Partner Applications
            </h2>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#8A8F9E' }}>
              Ecosystem Cohort
            </span>
          </div>

          <div
            style={{
              background: '#0D111A',
              border: '1px dashed rgba(255,255,255,0.12)',
              borderRadius: '14px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,149,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Looking for the first Auren partner applications.
            </h3>

            <p style={{ color: '#8A8F9E', fontSize: '0.95rem', maxWidth: 540, margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
              Are you building a decentralized application, autonomous agent service, or marketplace on Arc? Integrate Auren to eliminate gas friction for your users and bootstrap growth liquidity.
            </p>

            <Link
              href="/build"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                background: 'rgba(200,149,58,0.15)',
                border: '1px solid rgba(200,149,58,0.3)',
                color: '#F8F6F2',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              Integrate your Arc DApp →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
