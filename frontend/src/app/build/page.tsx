'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AUREN_API_URL } from '../../config/api';

export default function DevelopersPage() {
  const [activeLang, setActiveLang] = useState<'sdk' | 'mcp' | 'rest'>('sdk');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--color-paper)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="badge badge-gold">Developer Hub</span>
            <span className="badge badge-arc">Arc Testnet 5042002</span>
          </div>
          <h1 className="text-headline" style={{ color: 'var(--color-paper)', marginBottom: '0.75rem' }}>
            Integrate Auren in Minutes
          </h1>
          <p style={{ color: 'rgba(248,246,242,0.5)', fontSize: '1.0625rem', maxWidth: 640 }}>
            Eliminate transaction friction for users and autonomous agents.
            Fund sponsorship budgets with isolated vault capital and share upside from top-line revenue.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
        {/* Telemetry: How much value are sponsored users generating? */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '3.5rem', background: 'var(--color-paper-white)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>Live Ecosystem Telemetry</span>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
              How Much Value Are Sponsored Users Generating?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
            {[
              { label: 'Sponsored Users', value: '142 Active' },
              { label: 'Sponsored Actions', value: '1,890 Tx' },
              { label: 'Gas Sponsored', value: '0.45 USDC' },
              { label: 'Revenue Generated', value: '45.00 USDC' },
              { label: 'Capital Recovered', value: '100%' },
              { label: 'Realized Profit', value: '22.50 USDC' },
            ].map((stat) => (
              <div key={stat.label} className="card-inset" style={{ padding: '1.25rem' }}>
                <div className="stat-label" style={{ marginBottom: 4 }}>{stat.label}</div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Step Quickstart Guide */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Integration Architecture</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              5 Steps to Sponsor Transactions
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {[
              {
                step: '01',
                title: 'Deploy Your Isolated DAppVault',
                desc: 'Deploy an isolated vault via MudarabahVaultFactory. Specify your LP profit-share ratio (e.g. 50% = 5000 bps).',
                code: 'const { vaultAddress, paymasterAddress } = await factory.createVault(5000);',
              },
              {
                step: '02',
                title: 'Configure Sponsorship Policy',
                desc: 'Register allowed contract targets, function selectors (e.g. purchaseItem()), and daily budget caps in the Auren Policy Engine.',
                code: 'await policyEngine.registerDApp({ vaultAddress, targetContracts: [myDApp], allowedSelectors: ["0xef032d84"], dailyBudget: ethers.parseEther("50.0") });',
              },
              {
                step: '03',
                title: 'Install SDK or MCP Server',
                desc: 'Install @auren/sdk in your web app, or connect your TechnoCore autonomous agent directly via Model Context Protocol (MCP).',
                code: 'npm install @auren/sdk   # or run: npx auren-mcp',
              },
              {
                step: '04',
                title: 'Request Sponsorship Authorization',
                desc: 'When a user or agent prepares a transaction, request approved paymasterAndData envelope from Auren Policy Engine.',
                code: 'const { paymasterAndData } = await auren.requestSponsorship({ vaultAddress, targetContract, callData, sender });',
              },
              {
                step: '05',
                title: 'Route Revenue for Settlement',
                desc: 'When users perform monetized actions, forward payment through your bound RevenueSplitter. Capital is recovered first before profit splits.',
                code: 'revenueSplitter.processPayment{value: paymentAmount}();',
              },
            ].map((s) => (
              <div key={s.step} className="card" style={{ padding: '1.75rem 2rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-gold)', minWidth: 40 }}>
                    {s.step}
                  </div>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.375rem' }}>{s.title}</h3>
                    <p className="text-sm text-muted" style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{s.desc}</p>
                    <pre
                      className="card-inset"
                      style={{
                        padding: '0.875rem 1.25rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        background: 'var(--color-ink-900)',
                        color: '#E0E7FF',
                        overflowX: 'auto',
                        lineHeight: 1.5,
                      }}
                    >
                      {s.code}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Code Integration Tabs */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                Code Integration Examples
              </h2>
              <p className="text-sm text-muted">Clean interfaces for web apps, autonomous agents, and REST backends.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                ['sdk', 'TypeScript SDK'],
                ['mcp', 'TechnoCore MCP Tool'],
                ['rest', 'REST API'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveLang(id as any)}
                  className={`btn btn-sm ${activeLang === id ? 'btn-primary' : 'btn-outline'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeLang === 'sdk' && (
            <pre
              className="card-inset"
              style={{
                padding: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                background: 'var(--color-ink-900)',
                color: 'var(--color-paper)',
                overflowX: 'auto',
                lineHeight: 1.6,
              }}
            >
{`import { AurenSDK } from '@auren/sdk';
import { ethers } from 'ethers';

const auren = new AurenSDK({
  rpcUrl: 'https://rpc.testnet.arc.network',
  chainId: 5042002
});

// 1. Check if user action is eligible for gas sponsorship
const eligibility = await auren.checkSponsorship({
  vaultAddress: '0x851bD1E5d9CdeD0f183e861dB98157641C826a74',
  targetContract: '0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6',
  callData: '0xef032d84', // purchaseItem()
  sender: userAddress,
  maxCost: ethers.parseEther('0.005').toString()
});

if (eligibility.eligible) {
  // 2. Request Paymaster sponsorship authorization
  const auth = await auren.requestSponsorship({ ... });

  // 3. Dispatch sponsored transaction via ERC-4337 EntryPoint
  console.log('Sponsorship paymasterAndData:', auth.paymasterAndData);
}`}
            </pre>
          )}

          {activeLang === 'mcp' && (
            <pre
              className="card-inset"
              style={{
                padding: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                background: 'var(--color-ink-900)',
                color: 'var(--color-paper)',
                overflowX: 'auto',
                lineHeight: 1.6,
              }}
            >
{`// TechnoCore Agent tool call via standard MCP (Model Context Protocol)
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "check_sponsorship",
    "arguments": {
      "vaultAddress": "0x851bD1E5d9CdeD0f183e861dB98157641C826a74",
      "targetContract": "0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6",
      "callData": "0xef032d84",
      "sender": "0x30080EF681349fAca4808a78a292264A5310Ce2b",
      "maxCost": "5000000000000000",
      "chainId": 5042002
    }
  }
}`}
            </pre>
          )}

          {activeLang === 'rest' && (
            <pre
              className="card-inset"
              style={{
                padding: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                background: 'var(--color-ink-900)',
                color: 'var(--color-paper)',
                overflowX: 'auto',
                lineHeight: 1.6,
              }}
            >
{`# Pre-flight sponsorship check
curl -X POST ${AUREN_API_URL}/agent/check-sponsorship \\
  -H "Content-Type: application/json" \\
  -d '{
    "vaultAddress": "0x851bD1E5d9CdeD0f183e861dB98157641C826a74",
    "targetContract": "0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6",
    "callData": "0xef032d84",
    "sender": "0x30080EF681349fAca4808a78a292264A5310Ce2b",
    "maxCost": "5000000000000000",
    "chainId": 5042002
  }'`}
            </pre>
          )}
        </div>

        {/* Collapsible Advanced Protocol Details */}
        <div className="card" style={{ padding: '2rem' }}>
          <div
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                {showAdvanced ? '▼' : '▶'} Advanced / Protocol Architecture Details
              </h3>
              <p className="text-xs text-muted" style={{ margin: '4px 0 0' }}>
                Underlying contract mechanics, Mudarabah recovery rules, and EntryPoint v0.6 compatibility.
              </p>
            </div>
            <span className="badge badge-neutral">{showAdvanced ? 'Collapse' : 'Expand'}</span>
          </div>

          {showAdvanced && (
            <div style={{ marginTop: '1.75rem', paddingTop: '1.75rem', borderTop: '1px solid var(--color-ink-100)', display: 'grid', gap: '1rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
              <p>
                <strong>Capital First, Profit Second:</strong> When DApp revenue arrives at <code>RevenueSplitter</code>, 100% of funds flow to <code>DAppVault.recordCapitalRecovery()</code> until <code>unrecoveredCapital() == 0</code>. Only then does the profit split activate.
              </p>
              <p>
                <strong>Isolated Security:</strong> Every DApp receives its own isolated vault and bound paymaster. Compromise or depletion of one DApp&apos;s budget has zero spillover effect on other vaults.
              </p>
              <p>
                <strong>Native USDC Mechanics:</strong> Arc Network handles USDC as the native L1 gas token with 18 decimals, transferred natively via <code>msg.value</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
