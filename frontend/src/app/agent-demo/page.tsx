'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stage {
  id: number;
  name: string;
  label: string;
  description: string;
  detail: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    name: 'Discovering',
    label: 'Agent Discovery',
    description: 'TechnoCore agent scans Auren directory via list_opportunities() tool.',
    detail: 'Target: Digital Marketplace (demo-marketplace) on Arc Testnet (Chain ID 5042002)',
  },
  {
    id: 2,
    name: 'Evaluating',
    label: 'Policy Evaluation',
    description: 'Auren Policy Engine evaluates dry-run eligibility (contract whitelist & gas limits).',
    detail: 'Action: purchaseItem() (0xef032d84) | Max Gas: 0.005 USDC | Status: APPROVED',
  },
  {
    id: 3,
    name: 'Authorizing',
    label: 'did:key Intent Signing',
    description: 'Agent signs request with Ed25519 did:key; Auren issues paymasterAndData.',
    detail: 'Signer: did:key:z6MkreBJ7AT2… | Paymaster: 0x2a4122372B1A…',
  },
  {
    id: 4,
    name: 'Executing',
    label: 'On-Chain Execution',
    description: 'Transaction is broadcast to Arc Testnet; Paymaster sponsors gas from vault.',
    detail: 'Target Contract: 0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6',
  },
  {
    id: 5,
    name: 'Confirming',
    label: 'Block Confirmation',
    description: 'Arc validator confirms transaction on-chain.',
    detail: 'Block #58665142 | Gas Used: 69,201 | Effective Price: 21.0 Gwei',
  },
  {
    id: 6,
    name: 'Settling',
    label: 'Revenue & State Sync',
    description: 'RevenueSplitter routes payment; TVL accrues; result stored in TechnoCore.',
    detail: 'Vault TVL: 30.00 → 32.50 USDC (+2.50 USDC) | Stored to /kv/auren-agents/<did>',
  },
];

const REAL_TX = {
  agentDid: 'did:key:z6MkreBJ7AT22iSUZNHKn4nC1uyao8Sb4mDK8cRePdFBjigt',
  userAddress: '0x30080EF681349fAca4808a78a292264A5310Ce2b',
  dappName: 'Digital Marketplace',
  dappContract: '0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6',
  vaultAddress: '0x851bD1E5d9CdeD0f183e861dB98157641C826a74',
  paymasterAddress: '0x2a4122372B1A624118Ee3e7D4503B9525CfDE076',
  splitterAddress: '0x8aA1197eFF337Db0c2aaF9e085c50cB46A7Fb2f7',
  txHash: '0xb9f95b44bf960be101c43ef1ea568e8a062530387a4275de355a0afa6110a2d4',
  blockNumber: 58665142,
  gasUsed: '69,201',
  effectiveGasPrice: '21.0 Gwei',
  actionValue: '5.00 USDC',
  tvlBefore: '30.00 USDC',
  tvlAfter: '32.50 USDC',
  vaultProfitAccrual: '+2.50 USDC (50% Split)',
  devProfitPayout: '+2.50 USDC (50% Split)',
  technoCoreRoom: '/r/auren-ops',
  technoCoreNote: '/kv/auren-agents/did:key:z6MkreBJ7AT2…',
};

export default function AgentDemoPage() {
  // Step 0: Idle, 1..6: Steps active, 7: All completed
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'flow' | 'evidence' | 'technocore'>('flow');

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= STAGES.length) {
            setIsPlaying(false);
            return STAGES.length + 1; // Transition to 7 (All Complete)
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const startDemo = () => {
    setCurrentStep(1);
    setIsPlaying(true);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--color-paper)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="badge badge-gold">Interactive Demo</span>
            <span className="badge badge-arc">Arc Testnet 5042002</span>
          </div>
          <h1 className="text-headline" style={{ color: 'var(--color-paper)', marginBottom: '0.75rem' }}>
            Watch an Autonomous Agent Execute
          </h1>
          <p style={{ color: 'rgba(248,246,242,0.5)', fontSize: '1.0625rem', maxWidth: 620 }}>
            Experience how a TechnoCore AI agent discovers an Arc DApp, passes Auren policy checks,
            signs with its Ed25519 <code style={{ color: 'var(--color-gold)' }}>did:key</code>, and executes an on-chain transaction with zero fund custody.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-ink-100)', paddingBottom: '0.5rem' }}>
          {[
            { id: 'flow', label: '1. Live Execution Simulator' },
            { id: 'evidence', label: '2. Verified On-Chain Evidence' },
            { id: 'technocore', label: '3. TechnoCore State & Notes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="btn btn-ghost btn-sm"
              style={{
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--color-ink)' : 'var(--color-ink-400)',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-gold)' : 'none',
                borderRadius: 0,
                padding: '0.625rem 1rem',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Live Execution Simulator */}
        {activeTab === 'flow' && (
          <div>
            {/* Control Bar */}
            <div className="card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>
                  TechnoCore User Agent Lifecycle
                </div>
                <div className="text-sm text-muted">
                  Simulating step-by-step agent discovery, policy evaluation, and Arc settlement.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {currentStep === 0 ? (
                  <button onClick={startDemo} className="btn btn-gold btn-lg">
                    ▶ Run Agent Execution
                  </button>
                ) : isPlaying ? (
                  <button onClick={() => setIsPlaying(false)} className="btn btn-outline">
                    ⏸ Pause
                  </button>
                ) : currentStep > STAGES.length ? (
                  <button onClick={resetDemo} className="btn btn-primary">
                    ↺ Replay Demo
                  </button>
                ) : (
                  <button onClick={() => setIsPlaying(true)} className="btn btn-gold">
                    ▶ Resume
                  </button>
                )}
                {currentStep > 0 && currentStep <= STAGES.length && (
                  <button onClick={() => setCurrentStep(prev => prev + 1)} className="btn btn-outline">
                    Next Step →
                  </button>
                )}
              </div>
            </div>

            {/* Stages Pipeline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              {STAGES.map((stage) => {
                const isComplete = currentStep > stage.id;
                const isCurrent = currentStep === stage.id;
                const isPending = currentStep < stage.id;

                return (
                  <div
                    key={stage.id}
                    className="card"
                    style={{
                      padding: '1.75rem',
                      position: 'relative',
                      overflow: 'hidden',
                      borderColor: isCurrent ? 'var(--color-gold)' : isComplete ? '#B8D9CB' : 'var(--color-ink-100)',
                      background: isCurrent ? 'var(--color-gold-50)' : isComplete ? 'var(--color-paper-white)' : 'var(--color-paper)',
                      boxShadow: isCurrent ? 'var(--shadow-gold)' : 'var(--shadow-xs)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Top indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isCurrent ? 'var(--color-gold)' : isComplete ? 'var(--color-emerald)' : 'var(--color-ink-400)',
                        }}
                      >
                        Step 0{stage.id} · {stage.name}
                      </span>
                      {isComplete && <span className="badge badge-green">✓ Completed</span>}
                      {isCurrent && (
                        <span className="badge badge-gold">
                          <span className="spinner spinner-gold" style={{ width: 10, height: 10, borderWidth: 2 }} />
                          Active
                        </span>
                      )}
                      {isPending && <span className="badge badge-neutral">Queued</span>}
                    </div>

                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                      {stage.label}
                    </h3>
                    <p className="text-sm text-muted" style={{ marginBottom: '1rem', minHeight: 44 }}>
                      {stage.description}
                    </p>

                    <div
                      className="card-inset"
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: isCurrent ? 'var(--color-ink)' : 'var(--color-ink-500)',
                        background: isCurrent ? 'white' : 'var(--color-paper)',
                      }}
                    >
                      {stage.detail}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Execution Complete Banner */}
            {currentStep > STAGES.length && (
              <div
                className="card"
                style={{
                  padding: '2.5rem',
                  background: 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  boxShadow: 'var(--shadow-xl)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span className="dot-live" />
                      <span className="badge badge-green">Verified on Arc Testnet</span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-paper)' }}>
                      Transaction Confirmed & Settled
                    </h2>
                    <p style={{ color: 'rgba(248,246,242,0.5)', fontSize: '0.9375rem', marginTop: 4 }}>
                      Autonomous User Agent executed action on Arc Testnet with zero vault custody.
                    </p>
                  </div>
                  <a
                    href={`https://testnet.arcscan.app/tx/${REAL_TX.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-gold btn-lg"
                  >
                    View on ArcScan ↗
                  </a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  {[
                    { label: 'Transaction Hash', value: `${REAL_TX.txHash.slice(0, 10)}…${REAL_TX.txHash.slice(-8)}` },
                    { label: 'Block Number', value: `#${REAL_TX.blockNumber}` },
                    { label: 'Gas Used', value: REAL_TX.gasUsed },
                    { label: 'Vault TVL Result', value: `${REAL_TX.tvlBefore} → ${REAL_TX.tvlAfter}` },
                  ].map((s) => (
                    <div key={s.label} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                      <div className="stat-label" style={{ color: 'rgba(248,246,242,0.4)', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ color: 'var(--color-paper)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.9375rem' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Verified On-Chain Evidence */}
        {activeTab === 'evidence' && (
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.375rem' }}>
                  Real Arc Testnet Transaction Evidence
                </h2>
                <p className="text-sm text-muted">
                  Executed by autonomous agent identity on Arc Testnet (Chain ID 5042002).
                </p>
              </div>
              <a
                href={`https://testnet.arcscan.app/tx/${REAL_TX.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
              >
                Open in ArcScan ↗
              </a>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                ['TechnoCore Agent DID', REAL_TX.agentDid],
                ['User Account Address', REAL_TX.userAddress],
                ['Target Arc DApp', `${REAL_TX.dappName} (${REAL_TX.dappContract})`],
                ['Isolated Vault Address', REAL_TX.vaultAddress],
                ['Investment Paymaster', REAL_TX.paymasterAddress],
                ['Revenue Splitter', REAL_TX.splitterAddress],
                ['Transaction Hash', REAL_TX.txHash],
                ['Block Number', `#${REAL_TX.blockNumber}`],
                ['Gas Used on Arc', REAL_TX.gasUsed],
                ['Effective Gas Price', REAL_TX.effectiveGasPrice],
                ['Purchase Item Value', REAL_TX.actionValue],
                ['Vault TVL Before', REAL_TX.tvlBefore],
                ['Vault TVL After', REAL_TX.tvlAfter],
                ['Vault Net Profit Accrual', REAL_TX.vaultProfitAccrual],
                ['Developer Payout', REAL_TX.devProfitPayout],
              ].map(([k, v]) => (
                <div key={k} className="metric-row" style={{ padding: '0.75rem 0' }}>
                  <span className="metric-label" style={{ minWidth: 220 }}>{k}</span>
                  <span className="metric-value text-mono" style={{ wordBreak: 'break-all', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TechnoCore State & Notes */}
        {activeTab === 'technocore' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                TechnoCore Room Broadcast (`/r/auren-ops`)
              </h3>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>
                Agents communicate and coordinate via zero-auth HTTP room endpoints.
              </p>
              <div className="card-inset" style={{ padding: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', background: 'var(--color-ink-900)', color: '#A0FFA0' }}>
                &gt; [Arc TX CONFIRMED] Block #{REAL_TX.blockNumber} | TX: {REAL_TX.txHash.slice(0, 20)}… | TVL: {REAL_TX.tvlAfter}
              </div>
            </div>

            <div className="card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Durable TechnoCore Note (`/kv/auren-agents/{REAL_TX.agentDid.slice(0, 16)}…`)
              </h3>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>
                Persistent agent state outliving individual sessions, retrieved over HTTP GET.
              </p>
              <pre
                className="card-inset"
                style={{
                  padding: '1.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  overflowX: 'auto',
                  background: 'var(--color-ink-900)',
                  color: 'var(--color-paper)',
                  lineHeight: 1.6,
                }}
              >
{JSON.stringify(
  {
    agentDid: REAL_TX.agentDid,
    action: 'purchaseItem',
    targetDApp: REAL_TX.dappName,
    targetContract: REAL_TX.dappContract,
    vault: REAL_TX.vaultAddress,
    txHash: REAL_TX.txHash,
    blockNumber: REAL_TX.blockNumber,
    gasUsed: REAL_TX.gasUsed,
    purchaseValue: REAL_TX.actionValue,
    tvlBefore: REAL_TX.tvlBefore,
    tvlAfter: REAL_TX.tvlAfter,
    timestamp: 1787593833000
  },
  null,
  2
)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
