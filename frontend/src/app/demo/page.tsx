'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrowserProvider, ethers } from 'ethers';
import { CONTRACTS, ARC_TESTNET_CHAIN_ID } from '../../config/contracts';
import {
  executeSponsoredAction,
  getSmartAccountAddress,
  checkAccountDeployed,
  SharedERC4337Result
} from '../../lib/erc4337';

type PurchaseState =
  | 'idle'
  | 'connecting'
  | 'checking-network'
  | 'preparing'
  | 'sponsoring'
  | 'signing'
  | 'submitting'
  | 'confirming'
  | 'success'
  | 'error';

export default function ConsumerDemoPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [smartAccount, setSmartAccount] = useState<string | null>(null);
  const [isSmartAccountDeployed, setIsSmartAccountDeployed] = useState<boolean>(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [state, setState] = useState<PurchaseState>('idle');
  const [stepDetail, setStepDetail] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<SharedERC4337Result | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [showEconomicDetails, setShowEconomicDetails] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<string>('0.00');

  const config = CONTRACTS[ARC_TESTNET_CHAIN_ID];
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;
  const itemPriceUsdc = '10.00';
  const itemPriceWei = ethers.parseEther('10.0');

  // Listen for wallet account / network changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setSmartAccount(null);
        } else {
          setAccount(accounts[0]);
        }
      };
      const handleChainChanged = (hexChainId: string) => {
        setChainId(parseInt(hexChainId, 16));
      };

      eth.on('accountsChanged', handleAccountsChanged);
      eth.on('chainChanged', handleChainChanged);

      return () => {
        eth.removeListener('accountsChanged', handleAccountsChanged);
        eth.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Sync Smart Account and balance when account or chainId changes
  useEffect(() => {
    if (!account || !isArc) return;
    const currentAccount = account;
    let mounted = true;

    async function loadAccountData() {
      try {
        const prov = new ethers.JsonRpcProvider(config.rpc);
        const sa = await getSmartAccountAddress(currentAccount, 0, prov);
        const deployed = await checkAccountDeployed(sa, prov);
        const bal = await prov.getBalance(currentAccount);

        if (mounted) {
          setSmartAccount(sa);
          setIsSmartAccountDeployed(deployed);
          setUserBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
        }
      } catch (err) {
        console.error('Failed to load account data:', err);
      }
    }

    loadAccountData();
    return () => { mounted = false; };
  }, [account, isArc]);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setErrorMsg('Please install a Web3 wallet (e.g. MetaMask) to continue.');
      setState('error');
      return;
    }

    setState('connecting');
    setErrorMsg('');

    try {
      const browserProvider = new BrowserProvider((window as any).ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setChainId(Number(network.chainId));

      if (Number(network.chainId) !== ARC_TESTNET_CHAIN_ID) {
        setState('checking-network');
        await switchToArcTestnet(browserProvider);
      } else {
        setState('idle');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect wallet.');
      setState('error');
    }
  };

  const switchToArcTestnet = async (prov?: BrowserProvider) => {
    const p = prov || provider;
    if (!p) return;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${ARC_TESTNET_CHAIN_ID.toString(16)}` }],
      });
      setChainId(ARC_TESTNET_CHAIN_ID);
      setState('idle');
    } catch (switchError: any) {
      // Chain not added (error 4902)
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${ARC_TESTNET_CHAIN_ID.toString(16)}`,
                chainName: 'Arc Testnet',
                nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                rpcUrls: [config.rpc],
                blockExplorerUrls: [config.explorer],
              },
            ],
          });
          setChainId(ARC_TESTNET_CHAIN_ID);
          setState('idle');
        } catch (addError: any) {
          setErrorMsg('Failed to add Arc Testnet to your wallet.');
          setState('error');
        }
      } else {
        setErrorMsg('Please switch your wallet to Arc Testnet to continue.');
        setState('error');
      }
    }
  };

  const handlePurchase = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    if (!isArc) {
      await switchToArcTestnet();
      return;
    }

    if (!provider) return;

    setErrorMsg('');
    setResult(null);

    try {
      const execResult = await executeSponsoredAction({
        provider,
        ownerAddress: account,
        targetContractAddress: config.demoDApp,
        purchaseValueWei: itemPriceWei,
        onStepChange: (stepName, detail) => {
          setState(stepName as PurchaseState);
          setStepDetail(detail);
        }
      });

      setResult(execResult);
      setState('success');
    } catch (err: any) {
      console.error('Purchase flow error:', err);
      let userFriendlyError = err.message || 'Transaction could not be completed.';
      if (userFriendlyError.includes('user rejected') || userFriendlyError.includes('ACTION_REJECTED')) {
        userFriendlyError = 'Signature request was cancelled in your wallet.';
      } else if (userFriendlyError.includes('insufficient funds') || userFriendlyError.includes('exceeds balance')) {
        userFriendlyError = 'Your connected wallet needs at least 10 USDC on Arc Testnet to purchase this item. (Note: Auren will cover the transaction gas).';
      }
      setErrorMsg(userFriendlyError);
      setState('error');
    }
  };

  const isProcessing = ['connecting', 'checking-network', 'preparing', 'sponsoring', 'signing', 'submitting', 'confirming'].includes(state);

  return (
    <div style={{ paddingTop: 72, background: 'var(--color-paper)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* ── HEADER & POSITIONING ─────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--color-border)', background: 'white', padding: '3.5rem 1.5rem 3rem' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.35rem 0.85rem', borderRadius: 99, marginBottom: '1.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#166534' }}>
              Arc Testnet · Consumer Demo
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-ink)', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            Use applications without worrying about transaction gas.
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-muted)', maxWidth: 640, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Auren automatically sponsors eligible blockchain transactions. You keep full non-custodial ownership of your wallet and only pay the actual item price.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-ink-faint)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>✓</span> 100% Non-Custodial
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-ink-faint)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>✓</span> $0.00 Gas to User
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-ink-faint)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>✓</span> Instant On-Chain Settlement
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 760, margin: '2.5rem auto 0', padding: '0 1.25rem' }}>

        {/* Testnet Disclaimer */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1rem' }}>ℹ️</span>
          <span style={{ fontSize: '0.8125rem', color: '#92400E' }}>
            <strong>Public Testnet Mode:</strong> This demo runs on Arc Testnet using test USDC. Do not send real funds.
          </span>
        </div>

        {/* Product Purchase Card */}
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-gold)' }}>
                Demo DApp Marketplace
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink)', marginTop: '0.25rem' }}>
                Premium Access Pass
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                ${itemPriceUsdc} <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-ink-muted)' }}>USDC</span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#16A34A' }}>
                Transaction Gas: FREE
              </div>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Purchase a lifetime access pass on Arc Testnet. The purchase payment routes directly to the application's Revenue Splitter and Vault, while Auren's Investment Paymaster covers 100% of the blockchain transaction gas.
            </p>

            {/* Price Breakdown */}
            <div style={{ background: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--color-ink)' }}>Item Price</span>
                <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>10.00 USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--color-ink)' }}>Estimated Network Gas</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--color-ink-faint)' }}>~0.003 USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Auren Gas Sponsorship</span>
                <span style={{ fontWeight: 600, color: '#16A34A' }}>- 100% Covered</span>
              </div>
              <div style={{ height: 1, background: 'var(--color-border)', margin: '0.75rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.0625rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--color-ink)' }}>You Pay (Connected Wallet)</span>
                <span style={{ color: 'var(--color-ink)' }}>10.00 USDC</span>
              </div>
            </div>

            {/* Connected Wallet Info */}
            {account && (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--color-ink-faint)', display: 'block' }}>Connected EOA Wallet:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-ink)' }}>
                    {account.slice(0, 8)}...{account.slice(-6)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--color-ink-faint)', display: 'block' }}>Testnet Balance:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{userBalance} USDC</span>
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {state === 'error' && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', color: '#991B1B', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Purchase Incomplete</div>
                {errorMsg}
              </div>
            )}

            {/* In-Flight Status Indicator */}
            {isProcessing && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #93C5FD', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 700, color: '#1E40AF', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  Processing Sponsored Purchase
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#3B82F6' }}>
                  {stepDetail || 'Communicating with Auren Protocol & Arc Testnet...'}
                </div>
              </div>
            )}

            {/* Action Button */}
            {!account ? (
              <button
                onClick={connectWallet}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
              >
                Connect Wallet to Purchase
              </button>
            ) : !isArc ? (
              <button
                onClick={() => switchToArcTestnet()}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700, background: '#D97706' }}
              >
                Switch Wallet to Arc Testnet
              </button>
            ) : state === 'success' ? (
              <button
                onClick={() => { setState('idle'); setResult(null); }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
              >
                Purchase Another Item
              </button>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  opacity: isProcessing ? 0.7 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Processing Transaction...' : 'Buy Now — Gas Covered by Auren'}
              </button>
            )}
          </div>
        </div>

        {/* ── SUCCESS SCREEN ────────────────────────────────────────── */}
        {state === 'success' && result && (
          <div style={{ marginTop: '2rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: '#16A34A', color: 'white', fontWeight: 800, fontSize: '1.125rem' }}>
                ✓
              </span>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534', margin: 0 }}>
                  Purchase Confirmed!
                </h3>
                <span style={{ fontSize: '0.8125rem', color: '#15803D' }}>
                  Your transaction was executed on Arc Testnet with 100% sponsored gas.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #DCFCE7' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', display: 'block' }}>Item Price Paid:</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-ink)' }}>10.00 USDC</span>
              </div>
              <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #DCFCE7' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', display: 'block' }}>Gas Paid by You:</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#16A34A' }}>0.00 USDC (Sponsored)</span>
              </div>
              <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #DCFCE7' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', display: 'block' }}>Total Purchases:</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                  {result.purchasesBefore} → {result.purchasesAfter}
                </span>
              </div>
            </div>

            <div style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: 8, border: '1px solid #DCFCE7', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>Transaction Hash:</span>
                <a
                  href={`https://testnet.arcscan.app/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-gold)', fontFamily: 'monospace', fontWeight: 600, textDecoration: 'underline' }}
                >
                  {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)} ↗
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>Block Confirmed:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>#{result.blockNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>Smart Account:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-ink)' }}>
                  {result.smartAccount.slice(0, 8)}...{result.smartAccount.slice(-6)}
                </span>
              </div>
            </div>

            {/* Economic Settlement Collapsible */}
            <div style={{ borderTop: '1px solid #DCFCE7', paddingTop: '1rem' }}>
              <button
                onClick={() => setShowEconomicDetails(!showEconomicDetails)}
                style={{ background: 'none', border: 'none', color: '#166534', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
              >
                <span>{showEconomicDetails ? '▼' : '▶'}</span>
                View Economic Settlement & Vault Accounting
              </button>

              {showEconomicDetails && (
                <div style={{ marginTop: '1rem', background: 'white', borderRadius: 8, padding: '1rem', border: '1px solid #DCFCE7', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--color-ink-muted)' }}>Vault TVL:</span>
                    <span>{result.tvlBefore} USDC → <strong>{result.tvlAfter} USDC</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--color-ink-muted)' }}>Paymaster Gas Cost:</span>
                    <span>{result.paymasterGasPaid} USDC</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--color-ink-muted)' }}>Revenue Splitter:</span>
                    <span>50% LP Pool / 50% Developer</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-ink-muted)' }}>Unrecovered Capital:</span>
                    <span>{result.unrecoveredCapital} USDC</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TECHNICAL DETAILS COLLAPSIBLE ───────────────────────── */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            style={{ background: 'none', border: 'none', color: 'var(--color-ink-muted)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>{showTechnicalDetails ? '▼' : '▶'}</span>
            Technical details (ERC-4337 & Paymaster Architecture)
          </button>

          {showTechnicalDetails && (
            <div style={{ marginTop: '1rem', background: 'white', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1.25rem', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--color-ink-faint)' }}>EntryPoint v0.6: </span>
                <span style={{ color: 'var(--color-ink)' }}>{config.entryPoint}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--color-ink-faint)' }}>InvestmentPaymaster: </span>
                <span style={{ color: 'var(--color-ink)' }}>{config.paymaster}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--color-ink-faint)' }}>DemoDApp Target: </span>
                <span style={{ color: 'var(--color-ink)' }}>{config.demoDApp}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--color-ink-faint)' }}>DAppVault: </span>
                <span style={{ color: 'var(--color-ink)' }}>{config.vault}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-ink-faint)' }}>SimpleAccountFactory: </span>
                <span style={{ color: 'var(--color-ink)' }}>{config.accountFactory}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER NAVIGATION TO AGENT & BUILD ───────────────────── */}
        <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <Link
            href="/agent-demo"
            style={{ textDecoration: 'none', background: 'white', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.25rem', display: 'block', transition: 'transform 0.15s ease' }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Autonomous Agents →
            </div>
            <div style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.25rem' }}>
              Watch an Agent Execute
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)' }}>
              See an AI agent discover, evaluate, and execute sponsored actions autonomously.
            </div>
          </Link>

          <Link
            href="/build"
            style={{ textDecoration: 'none', background: 'white', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.25rem', display: 'block', transition: 'transform 0.15s ease' }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Developers →
            </div>
            <div style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.25rem' }}>
              Build with Auren SDK
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)' }}>
              Integrate zero-gas onboarding into your Arc application in under 5 minutes.
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
