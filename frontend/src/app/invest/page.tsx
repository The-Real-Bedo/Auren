'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { CONTRACTS, ARC_TESTNET_CHAIN_ID } from '../../config/contracts';
import { VAULT_ABI } from '../../config/abis';
import Link from 'next/link';

function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const connect = async () => {
    if (!(window as any).ethereum) return;
    const prov = new BrowserProvider((window as any).ethereum);
    await prov.send('eth_requestAccounts', []);
    const signer = await prov.getSigner();
    const net = await prov.getNetwork();
    setAccount(await signer.getAddress());
    setProvider(prov);
    setChainId(Number(net.chainId));
    (window as any).ethereum.on('chainChanged', () => window.location.reload());
    (window as any).ethereum.on('accountsChanged', () => window.location.reload());
  };
  return { account, provider, chainId, connect };
}

export default function InvestPage() {
  const { account, provider, chainId, connect } = useWallet();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [depositAmt, setDepositAmt] = useState('');
  const [status, setStatus] = useState<null | { type: string; msg: string }>(null);
  const [diagnostic, setDiagnostic] = useState('');

  const config = CONTRACTS[ARC_TESTNET_CHAIN_ID];
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;

  const loadMetrics = async () => {
    if (!provider || !isArc) return;
    setLoading(true);
    try {
      const code = await provider.getCode(config.vault);
      if (code === '0x') { setDiagnostic('Contract not found'); setLoading(false); return; }
      const vault = new Contract(config.vault, VAULT_ABI, provider);
      const [tvl, unrecovered, recovered, gasDeployed, totalSupply, myShares] = await Promise.all([
        vault.totalValue(), vault.unrecoveredCapital(), vault.totalCapitalRecovered(),
        vault.totalGasDeployed(), vault.totalSupplyShares(),
        account ? vault.lpShares(account) : Promise.resolve(BigInt(0)),
      ]);
      setMetrics({ tvl, unrecovered, recovered, gasDeployed, totalSupply, myShares });
      setDiagnostic(`verified · ${config.vault.slice(0,10)}… · chain ${chainId}`);
    } catch (e: any) {
      setDiagnostic('Error: ' + e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (provider && isArc) loadMetrics(); }, [provider, chainId, account]);

  const handleDeposit = async () => {
    if (!provider || !depositAmt) return;
    try {
      const signer = await provider.getSigner();
      const vault = new Contract(config.vault, VAULT_ABI, signer);
      setStatus({ type: 'info', msg: 'Confirm in your wallet…' });
      const tx = await vault.deposit({ value: ethers.parseEther(depositAmt) });
      setStatus({ type: 'info', msg: 'Waiting for confirmation…' });
      await tx.wait();
      setStatus({ type: 'success', msg: `${depositAmt} USDC deposited successfully.` });
      setDepositAmt('');
      loadMetrics();
    } catch (e: any) { setStatus({ type: 'error', msg: e.reason || e.message }); }
  };

  const poolPct = metrics && metrics.totalSupply > BigInt(0)
    ? ((Number(metrics.myShares) / Number(metrics.totalSupply)) * 100).toFixed(4)
    : '0.0000';

  const myExposure = metrics
    ? ((Number(ethers.formatEther(metrics.unrecovered)) * Number(metrics.myShares)) / Math.max(Number(metrics.totalSupply), 1)).toFixed(4)
    : null;

  return (
    <div style={{ paddingTop: 64, background: 'var(--color-paper)', minHeight: '100vh' }}>
      {/* Page header */}
      <div className="page-header">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-gold" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>Investor</span>
          <h1 className="text-headline" style={{ color: 'var(--color-paper)', marginBottom: '0.75rem' }}>
            Capital Dashboard
          </h1>
          <p style={{ color: 'rgba(248,246,242,0.45)', fontSize: '1rem', maxWidth: 520 }}>
            Track deployed capital, monitor recovery, and view realized profit — sourced directly from the on-chain vault.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        {/* No wallet */}
        {!account && (
          <div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
            <div className="card" style={{ padding: '3.5rem 2.5rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-paper)', border: '1px solid var(--color-ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="6" width="18" height="13" rx="2.5" stroke="var(--color-ink-400)" strokeWidth="1.5"/>
                  <path d="M15 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" fill="var(--color-ink-400)"/>
                  <path d="M2 10h18" stroke="var(--color-ink-400)" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>Connect your wallet</h3>
              <p className="text-sm text-muted" style={{ marginBottom: '2rem' }}>
                Connect on Arc Testnet (Chain ID {ARC_TESTNET_CHAIN_ID}) to view your capital position.
              </p>
              <button onClick={connect} className="btn btn-primary btn-lg" style={{ width: '100%' }}>Connect Wallet</button>
            </div>
          </div>
        )}

        {/* Wrong network */}
        {account && !isArc && (
          <div className="status status-warning" style={{ marginBottom: '2rem', maxWidth: 680 }}>
            <span>⚠</span>
            <div>
              <strong>Switch network</strong> — Please switch to Arc Testnet (Chain ID: {ARC_TESTNET_CHAIN_ID}, RPC: {config.rpc})
            </div>
          </div>
        )}

        {/* Connected & correct chain */}
        {account && isArc && (
          <>
            {/* Diagnostic */}
            {diagnostic && (
              <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="dot-live" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-400)', fontFamily: 'var(--font-mono)' }}>{diagnostic}</span>
              </div>
            )}

            {/* DApp venture card */}
            <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden', padding: 0 }}>
              {/* Top accent bar */}
              <div style={{ height: 4, background: 'linear-gradient(90deg, var(--color-gold) 0%, var(--color-gold-300) 100%)' }} />

              <div style={{ padding: '2rem 2rem 1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Demo Digital Marketplace</h2>
                      <span className="badge badge-green">Active</span>
                    </div>
                    <p className="text-sm text-muted">Arc Testnet · 50% LP profit share</p>
                  </div>
                  <button onClick={loadMetrics} className="btn btn-ghost btn-sm" disabled={loading}>
                    {loading ? <span className="spinner" /> : '↻'}&nbsp;Refresh
                  </button>
                </div>

                {/* Stats grid */}
                {loading && !metrics ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--color-ink-100)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} style={{ background: 'var(--color-paper)', padding: '1.5rem' }}>
                        <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 24, width: 120 }} />
                      </div>
                    ))}
                  </div>
                ) : metrics ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px', background: 'var(--color-ink-100)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    {[
                      { label: 'Total Vault Value', value: parseFloat(ethers.formatEther(metrics.tvl)).toFixed(2), unit: 'USDC', color: 'var(--color-ink)' },
                      { label: 'Gas Sponsored', value: parseFloat(ethers.formatEther(metrics.gasDeployed)).toFixed(4), unit: 'USDC', color: 'var(--color-ink)' },
                      { label: 'Capital Recovered', value: parseFloat(ethers.formatEther(metrics.recovered)).toFixed(4), unit: 'USDC', color: 'var(--color-emerald)' },
                      { label: 'Capital at Risk', value: parseFloat(ethers.formatEther(metrics.unrecovered)).toFixed(4), unit: 'USDC', color: metrics.unrecovered > BigInt(0) ? 'var(--color-rose)' : 'var(--color-emerald)' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--color-paper-white)', padding: '1.5rem' }}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value-sm" style={{ color: s.color }}>
                          {s.value} <span className="stat-unit">{s.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* My position + Deposit */}
            <div className="grid-2" style={{ gap: '1.5rem' }}>
              {/* My position */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.75rem' }}>My Position</h3>
                {metrics ? (
                  <div>
                    <div className="metric-row">
                      <span className="metric-label">LP Shares held</span>
                      <span className="metric-value">{parseFloat(ethers.formatEther(metrics.myShares)).toFixed(4)}</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Pool ownership</span>
                      <span className="metric-value">{poolPct}%</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Capital at risk (est.)</span>
                      <span className="metric-value" style={{ color: 'var(--color-rose)' }}>{myExposure} USDC</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Realized profit</span>
                      <span className="metric-value" style={{ color: 'var(--color-emerald)' }}>0.0000 USDC</span>
                    </div>
                    <p className="text-xs text-muted" style={{ marginTop: '1.25rem', lineHeight: 1.6 }}>
                      Exposure is estimated from your share of unrecovered deployed capital. No guaranteed returns. Capital is at risk.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[100, 80, 110, 70].map(w => (
                      <div key={w} className="skeleton" style={{ height: 14, width: `${w}%` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Deposit */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Provide Capital</h3>
                <p className="text-sm text-muted" style={{ marginBottom: '1.75rem' }}>
                  Capital is deployed to sponsor user transactions. Recovery flows from DApp revenue.
                </p>
                <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1rem' }}>
                  <input
                    className="input"
                    type="number"
                    placeholder="Amount in USDC"
                    min="0"
                    value={depositAmt}
                    onChange={e => setDepositAmt(e.target.value)}
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={!depositAmt}
                    className="btn btn-gold"
                    style={{ flexShrink: 0 }}
                  >
                    Deposit
                  </button>
                </div>
                {status && (
                  <div className={`status status-${status.type}`}>{status.msg}</div>
                )}
                <div
                  className="card-inset"
                  style={{ marginTop: '1.25rem', padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--color-ink-400)', lineHeight: 1.6 }}
                >
                  Native USDC on Arc · No fixed interest · Profit-sharing model only · Subject to qualified Sharia scholar review
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
