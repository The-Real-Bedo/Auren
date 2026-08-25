'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { CONTRACTS, ARC_TESTNET_CHAIN_ID } from '../../config/contracts';
import { VAULT_ABI } from '../../config/abis';

const DAPP_ABI = ['function purchaseItem() external payable'];
type TxState = 'idle' | 'sponsoring' | 'confirming' | 'success' | 'error';

export default function DemoPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [txState, setTxState] = useState<TxState>('idle');
  const [txHash, setTxHash] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [metrics, setMetrics] = useState<any>(null);
  const [paymasterSig, setPaymasterSig] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const config = CONTRACTS[ARC_TESTNET_CHAIN_ID];
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;

  const connect = async () => {
    if (!(window as any).ethereum) { alert('Install MetaMask first.'); return; }
    const prov = new BrowserProvider((window as any).ethereum);
    await prov.send('eth_requestAccounts', []);
    const signer = await prov.getSigner();
    const net = await prov.getNetwork();
    setAccount(await signer.getAddress());
    setProvider(prov);
    setChainId(Number(net.chainId));
    (window as any).ethereum.on('chainChanged', () => window.location.reload());
  };

  const loadMetrics = async () => {
    if (!provider || !isArc) return;
    try {
      const vault = new Contract(config.vault, VAULT_ABI, provider);
      const [tvl, unrecovered, recovered] = await Promise.all([
        vault.totalValue(), vault.unrecoveredCapital(), vault.totalCapitalRecovered(),
      ]);
      setMetrics({ tvl, unrecovered, recovered });
    } catch {}
  };

  useEffect(() => { if (provider && isArc) loadMetrics(); }, [provider, chainId]);

  const handleBuy = async () => {
    if (!provider || !isArc || !account) return;
    setTxState('sponsoring');
    setErrMsg(''); setTxHash(''); setPaymasterSig('');

    try {
      const signer = await provider.getSigner();
      const dapp = new Contract(config.demoDApp, DAPP_ABI, signer);
      const callData = dapp.interface.encodeFunctionData('purchaseItem');

      const res = await fetch('http://localhost:3001/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userOp: { sender: account, nonce: Math.floor(Math.random() * 1e6), callData, maxCost: ethers.parseEther('0.005').toString() },
          paymasterAddress: config.paymaster,
          vaultAddress: config.vault,
          chainId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sponsorship failed');
      setPaymasterSig(data.paymasterAndData);

      setTxState('confirming');
      const tx = await dapp.purchaseItem({ value: ethers.parseEther('10') });
      setTxHash(tx.hash);
      await tx.wait();
      setTxState('success');
      loadMetrics();
    } catch (e: any) {
      setErrMsg(e.reason || e.message || 'Unknown error');
      setTxState('error');
    }
  };

  const reset = () => { setTxState('idle'); setTxHash(''); setErrMsg(''); setPaymasterSig(''); };

  return (
    <div style={{ paddingTop: 64, background: 'var(--color-paper)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="page-header">
        <div className="container-xs" style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-arc" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            <span className="dot-live" style={{ background: 'var(--color-arc)', animation: 'none' }} />
            Live Demo · Arc Testnet
          </span>
          <h1 className="text-headline" style={{ color: 'var(--color-paper)', marginBottom: '0.75rem' }}>
            Digital Marketplace
          </h1>
          <p style={{ color: 'rgba(248,246,242,0.45)', fontSize: '1rem' }}>
            Purchase a digital item. Your transaction cost is covered by Auren.
          </p>
        </div>
      </div>

      <div className="container-xs" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        {/* Wallet state */}
        {!account && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.625rem' }}>Connect to continue</h3>
            <p className="text-sm text-muted" style={{ marginBottom: '2rem' }}>
              Connect your wallet to Arc Testnet to experience gas-sponsored transactions.
            </p>
            <button onClick={connect} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Connect Wallet
            </button>
          </div>
        )}

        {account && !isArc && (
          <div className="status status-warning" style={{ marginBottom: '2rem' }}>
            <span>⚠</span>
            <span>Switch to <strong>Arc Testnet</strong> — Chain ID {ARC_TESTNET_CHAIN_ID}, RPC: {config.rpc}</span>
          </div>
        )}

        {account && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <span className="badge badge-green">
              <span className="dot-live" />
              {account.slice(0, 6)}…{account.slice(-4)}
            </span>
            {isArc && <span className="badge badge-arc">Arc Testnet</span>}
          </div>
        )}

        {/* Product card */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
          {/* Product header */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {/* Thumbnail */}
            <div style={{
              width: 72, height: 72, flexShrink: 0,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-gold-50)',
              border: '1px solid var(--color-gold-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 6h16v16H6z" rx="2" stroke="var(--color-gold)" strokeWidth="1.5" fill="none" />
                <path d="M10 14h8M14 10v8" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.375rem' }}>
                    Premium Digital Asset
                  </h2>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-gold">Gas covered by Auren</span>
                    <span className="badge badge-neutral">Digital goods</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>10.00</div>
                  <div className="text-xs text-muted" style={{ marginTop: 2 }}>USDC · Arc native</div>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" style={{ marginBottom: '2rem' }} />

          {/* Buy flow states */}
          {txState === 'idle' && (
            <button
              onClick={handleBuy}
              disabled={!isArc || !account}
              className="btn btn-gold btn-xl"
              style={{ width: '100%' }}
            >
              Buy Now
            </button>
          )}

          {txState === 'sponsoring' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <span className="spinner spinner-gold spinner-lg" />
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>Authorizing sponsorship</div>
              <p className="text-sm text-muted">Auren is securing your transaction cost.</p>
            </div>
          )}

          {txState === 'confirming' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <span className="spinner spinner-lg" />
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Confirming on Arc Testnet</div>
              {txHash && (
                <a
                  href={`${config.explorer}/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}
                >
                  {txHash.slice(0, 14)}…{txHash.slice(-8)} ↗
                </a>
              )}
            </div>
          )}

          {txState === 'success' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--color-emerald-50)',
                border: '1px solid #B8D9CB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="var(--color-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Purchase confirmed
              </div>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>
                Revenue has been routed through the Perpetua distribution system.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {txHash && (
                  <a
                    href={`${config.explorer}/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    View on Arc Explorer ↗
                  </a>
                )}
                <button onClick={reset} className="btn btn-ghost btn-sm">Buy another</button>
              </div>
            </div>
          )}

          {txState === 'error' && (
            <div>
              <div className="status status-error" style={{ marginBottom: '1rem' }}>
                <span>✕</span>
                <span>{errMsg}</span>
              </div>
              <button onClick={reset} className="btn btn-outline btn-sm">Try again</button>
            </div>
          )}
        </div>

        {/* Advanced */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--color-ink-400)', marginBottom: showAdvanced ? '0.75rem' : 0 }}
        >
          {showAdvanced ? '▲' : '▼'} Technical details
        </button>

        {showAdvanced && (
          <div className="card-inset" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gap: '0.625rem' }}>
              {[
                ['Protocol', 'ERC-4337 Account Abstraction'],
                ['Paymaster', config.paymaster],
                ['DemoDApp', config.demoDApp],
                ['Vault', config.vault],
                ['EntryPoint', config.entryPoint],
                ['Chain ID', String(ARC_TESTNET_CHAIN_ID)],
                ['RPC', config.rpc],
                ['Paymaster authorization', paymasterSig ? paymasterSig.slice(0, 26) + '…' : '—'],
                ['Transaction hash', txHash || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-ink-400)', minWidth: 180, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-ink)', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vault accounting */}
        {metrics && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>Vault Accounting</h3>
              <button onClick={loadMetrics} className="btn btn-ghost btn-sm">↻</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Total Vault Value', value: parseFloat(ethers.formatEther(metrics.tvl)).toFixed(4) + ' USDC', color: 'var(--color-ink)' },
                { label: 'Capital at Risk', value: parseFloat(ethers.formatEther(metrics.unrecovered)).toFixed(4) + ' USDC', color: metrics.unrecovered > BigInt(0) ? 'var(--color-rose)' : 'var(--color-emerald)' },
                { label: 'Capital Recovered', value: parseFloat(ethers.formatEther(metrics.recovered)).toFixed(4) + ' USDC', color: 'var(--color-emerald)' },
              ].map(s => (
                <div key={s.label} className="metric-row">
                  <span className="metric-label">{s.label}</span>
                  <span className="metric-value" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
            <p className="text-2xs text-subtle" style={{ marginTop: '1rem' }}>
              Live from {config.vault.slice(0, 12)}… · Arc Testnet Chain ID {ARC_TESTNET_CHAIN_ID}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
