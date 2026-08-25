'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CONTRACTS, ARC_TESTNET_CHAIN_ID } from '../../config/contracts';
import { AUREN_API_URL } from '../../config/api';

export default function DevelopersPage() {
  const [activeLang, setActiveLang] = useState<'sdk' | 'mcp' | 'rest'>('sdk');
  const config = CONTRACTS[ARC_TESTNET_CHAIN_ID];

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#0A0D14', color: '#F8F6F2' }}>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div style={{ background: '#0D111A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '4.5rem 0 3.5rem' }}>
        <div className="editorial-container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8953A' }} />
            <span className="mono-meta" style={{ color: '#E2B768' }}>
              Developer Quickstart · Arc Testnet 5042002
            </span>
          </div>
          <h1 className="section-title" style={{ color: '#F8F6F2', marginBottom: '0.75rem' }}>
            Give your application an economic engine.
          </h1>
          <p style={{ color: '#8A8F9E', fontSize: '1.0625rem', maxWidth: 640, lineHeight: 1.6, margin: 0 }}>
            Eliminate onboarding gas friction for users and autonomous agents. Fund sponsorship budgets with isolated vault capital and automate revenue settlement on Arc.
          </p>
        </div>
      </div>

      <div className="editorial-container" style={{ paddingTop: '3.5rem', paddingBottom: '7rem' }}>

        {/* Architecture Flow */}
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '2.5rem', background: '#0D111A', marginBottom: '3.5rem' }}>
          <div className="mono-meta" style={{ color: '#C8953A', marginBottom: '0.75rem' }}>// Architecture</div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 750, color: '#F8F6F2', marginBottom: '1.5rem' }}>
            How Applications Integrate with Auren
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            <div>
              <div className="mono-meta" style={{ color: '#E2B768', marginBottom: '0.5rem' }}>01. INSTALL SDK</div>
              <p style={{ fontSize: '0.9375rem', color: '#8A8F9E', lineHeight: 1.6, margin: 0 }}>
                Add <code>@auren/sdk</code> to your frontend or agent runtime. Derive non-custodial Smart Accounts via <code>SimpleAccountFactory</code>.
              </p>
            </div>
            <div>
              <div className="mono-meta" style={{ color: '#E2B768', marginBottom: '0.5rem' }}>02. DEFINE POLICIES</div>
              <p style={{ fontSize: '0.9375rem', color: '#8A8F9E', lineHeight: 1.6, margin: 0 }}>
                Set max gas per action (≤ 0.01 USDC) and daily rate limits. The Policy Engine rejects unapproved calls before signing.
              </p>
            </div>
            <div>
              <div className="mono-meta" style={{ color: '#E2B768', marginBottom: '0.5rem' }}>03. ROUTE REVENUE</div>
              <p style={{ fontSize: '0.9375rem', color: '#8A8F9E', lineHeight: 1.6, margin: 0 }}>
                Direct product payments to your <code>RevenueSplitter</code>. Incoming funds first recover gas principal, then split 50/50 with LPs.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Code Tabs */}
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', background: '#0D111A', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0A0D14', padding: '0.5rem 1rem', gap: '0.5rem' }}>
            {[
              { id: 'sdk', label: 'TypeScript SDK' },
              { id: 'mcp', label: 'Model Context Protocol (MCP)' },
              { id: 'rest', label: 'HTTP REST API' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLang(tab.id as any)}
                style={{
                  background: activeLang === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: activeLang === tab.id ? '#F8F6F2' : '#8A8F9E',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  border: 'none',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '2rem', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.7 }}>
            {activeLang === 'sdk' && (
              <div>
                <div style={{ color: '#8A8F9E' }}>// 1. Initialize Auren SDK on Arc Testnet</div>
                <div style={{ color: '#E2B768' }}>import &#123; AurenSDK &#125; from &apos;@auren/sdk&apos;;</div>
                <div style={{ color: '#F8F6F2', marginTop: '0.5rem' }}>const sdk = new AurenSDK(&#123;</div>
                <div style={{ color: '#8A8F9E' }}>  chainId: 5042002,</div>
                <div style={{ color: '#8A8F9E' }}>  vaultAddress: &apos;{config.vault}&apos;,</div>
                <div style={{ color: '#8A8F9E' }}>  paymasterAddress: &apos;{config.paymaster}&apos;,</div>
                <div style={{ color: '#F8F6F2' }}>&#125;);</div>
                <div style={{ color: '#8A8F9E', marginTop: '1rem' }}>// 2. Build and execute sponsored UserOperation</div>
                <div style={{ color: '#F8F6F2' }}>const result = await sdk.executeSponsoredUserOp(&#123;</div>
                <div style={{ color: '#8A8F9E' }}>  target: &apos;{config.demoDApp}&apos;,</div>
                <div style={{ color: '#8A8F9E' }}>  callData: purchaseCallData,</div>
                <div style={{ color: '#8A8F9E' }}>  userSigner: walletSigner</div>
                <div style={{ color: '#F8F6F2' }}>&#125;);</div>
                <div style={{ color: '#16A34A', marginTop: '0.5rem' }}>console.log(&apos;Confirmed in tx:&apos;, result.transactionHash);</div>
              </div>
            )}

            {activeLang === 'mcp' && (
              <div>
                <div style={{ color: '#8A8F9E' }}>// AI Agents discover and execute via TechnoCore MCP Tools</div>
                <div style={{ color: '#E2B768' }}>const tools = await mcpClient.listTools();</div>
                <div style={{ color: '#8A8F9E', marginTop: '0.5rem' }}>// 1. Discover active sponsored opportunities</div>
                <div style={{ color: '#F8F6F2' }}>const ops = await mcpClient.callTool(&apos;get_opportunities&apos;, &#123;&#125;);</div>
                <div style={{ color: '#8A8F9E', marginTop: '0.5rem' }}>// 2. Execute sponsored transaction with zero gas</div>
                <div style={{ color: '#F8F6F2' }}>const tx = await mcpClient.callTool(&apos;execute_sponsored_action&apos;, &#123;</div>
                <div style={{ color: '#8A8F9E' }}>  vault: &apos;{config.vault}&apos;,</div>
                <div style={{ color: '#8A8F9E' }}>  action: &apos;purchaseItem&apos;</div>
                <div style={{ color: '#F8F6F2' }}>&#125;);</div>
              </div>
            )}

            {activeLang === 'rest' && (
              <div>
                <div style={{ color: '#8A8F9E' }}>// POST {AUREN_API_URL}/sponsor</div>
                <div style={{ color: '#F8F6F2' }}>curl -X POST {AUREN_API_URL}/sponsor \</div>
                <div style={{ color: '#8A8F9E' }}>  -H &quot;Content-Type: application/json&quot; \</div>
                <div style={{ color: '#8A8F9E' }}>  -d &apos;&#123;&quot;userOp&quot;: &#123;...&#125;, &quot;vaultAddress&quot;: &quot;{config.vault}&quot;&#125;&apos;</div>
                <div style={{ color: '#16A34A', marginTop: '0.75rem' }}># Returns paymasterAndData with cryptographic secp256k1 signature</div>
              </div>
            )}
          </div>
        </div>

        {/* Contract Registry */}
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '2.5rem', background: '#0D111A' }}>
          <div className="mono-meta" style={{ color: '#C8953A', marginBottom: '0.75rem' }}>// Arc Testnet Deployments</div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 750, color: '#F8F6F2', marginBottom: '1.5rem' }}>
            Canonical Protocol Contracts
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
            <div>
              <span className="mono-meta">Canonical EntryPoint v0.6</span>
              <div style={{ color: '#F8F6F2', marginTop: '0.25rem' }}>{config.entryPoint}</div>
            </div>
            <div>
              <span className="mono-meta">InvestmentPaymaster</span>
              <div style={{ color: '#F8F6F2', marginTop: '0.25rem' }}>{config.paymaster}</div>
            </div>
            <div>
              <span className="mono-meta">SimpleAccountFactory</span>
              <div style={{ color: '#F8F6F2', marginTop: '0.25rem' }}>{config.accountFactory}</div>
            </div>
            <div>
              <span className="mono-meta">DemoDApp</span>
              <div style={{ color: '#F8F6F2', marginTop: '0.25rem' }}>{config.demoDApp}</div>
            </div>
            <div>
              <span className="mono-meta">DAppVault</span>
              <div style={{ color: '#F8F6F2', marginTop: '0.25rem' }}>{config.vault}</div>
            </div>
            <div>
              <span className="mono-meta">RevenueSplitter</span>
              <div style={{ color: '#F8F6F2', marginTop: '0.25rem' }}>{config.splitter}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
