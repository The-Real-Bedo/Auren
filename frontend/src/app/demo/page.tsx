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
        userFriendlyError = 'Your connected wallet needs at least 10 USDC on Arc Testnet to purchase this item. (Note: Auren covers the transaction gas).';
      }
      setErrorMsg(userFriendlyError);
      setState('error');
    }
  };

  const isProcessing = ['connecting', 'checking-network', 'preparing', 'sponsoring', 'signing', 'submitting', 'confirming'].includes(state);

  return (
    <div style={{ paddingTop: 64, background: '#0A0D14', minHeight: '100vh', paddingBottom: 100 }}>
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0D111A', padding: '4.5rem 1.5rem 3.5rem' }}>
        <div className="editorial-container-narrow" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
            <span className="mono-meta" style={{ color: '#4ADE80' }}>
              Arc Testnet · Consumer Demo
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#F8F6F2', marginBottom: '1rem', lineHeight: 1.15 }}>
            Use applications without worrying about transaction gas.
          </h1>
          <p style={{ fontSize: '1.0625rem', color: '#8A8F9E', maxWidth: 600, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Auren automatically sponsors eligible blockchain transactions. You keep full non-custodial ownership of your wallet and only pay the actual item price.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="mono-meta" style={{ color: '#F8F6F2' }}>
              <span style={{ color: '#C8953A', fontWeight: 700 }}>✓</span> 100% Non-Custodial
            </div>
            <div className="mono-meta" style={{ color: '#F8F6F2' }}>
              <span style={{ color: '#C8953A', fontWeight: 700 }}>✓</span> $0.00 Gas to User
            </div>
            <div className="mono-meta" style={{ color: '#F8F6F2' }}>
              <span style={{ color: '#C8953A', fontWeight: 700 }}>✓</span> Instant Settlement
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="editorial-container-narrow" style={{ marginTop: '3.5rem' }}>

        {/* Product Purchase Box */}
        <div style={{ background: '#0D111A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>

          <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="mono-meta" style={{ color: '#C8953A' }}>Demo Application</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 750, color: '#F8F6F2', marginTop: '0.25rem' }}>
                Premium Access Pass
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8F6F2' }}>
                ${itemPriceUsdc} <span style={{ fontSize: '0.875rem', color: '#8A8F9E' }}>USDC</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4ADE80' }}>
                Gas: Sponsored by Auren
              </div>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            <p style={{ color: '#8A8F9E', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Purchase a lifetime access pass on Arc Testnet. The purchase payment routes directly to the application's Revenue Splitter and Vault, while Auren's Investment Paymaster covers 100% of the transaction gas.
            </p>

            {/* Price Breakdown */}
            <div style={{ background: '#0A0D14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                <span style={{ color: '#8A8F9E' }}>Item Price</span>
                <span style={{ fontWeight: 600, color: '#F8F6F2' }}>10.00 USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                <span style={{ color: '#8A8F9E' }}>Estimated Network Gas</span>
                <span style={{ textDecoration: 'line-through', color: '#525766' }}>~0.003 USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                <span style={{ color: '#C8953A', fontWeight: 600 }}>Auren Gas Sponsorship</span>
                <span style={{ fontWeight: 600, color: '#4ADE80' }}>- 100% Covered</span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.75rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                <span style={{ color: '#F8F6F2' }}>You Pay (Connected Wallet)</span>
                <span style={{ color: '#F8F6F2' }}>10.00 USDC</span>
              </div>
            </div>

            {/* Connected Wallet Info */}
            {account && (
              <div style={{ background: '#0A0D14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                <div>
                  <span className="mono-meta" style={{ display: 'block' }}>Connected EOA:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#F8F6F2' }}>
                    {account.slice(0, 8)}...{account.slice(-6)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="mono-meta" style={{ display: 'block' }}>Testnet Balance:</span>
                  <span style={{ fontWeight: 600, color: '#F8F6F2', fontFamily: 'monospace' }}>{userBalance} USDC</span>
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {state === 'error' && (
              <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: 6, padding: '1rem', marginBottom: '1.5rem', color: '#F87171', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Purchase Incomplete</div>
                {errorMsg}
              </div>
            )}

            {/* In-Flight Status Indicator */}
            {isProcessing && (
              <div style={{ background: '#0A0D14', border: '1px solid #C8953A', borderRadius: 6, padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#C8953A', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  Processing Sponsored Purchase
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#8A8F9E' }}>
                  {stepDetail || 'Communicating with Auren Protocol on Arc...'}
                </div>
              </div>
            )}

            {/* Action Button */}
            {!account ? (
              <button
                onClick={connectWallet}
                className="btn-primary"
                style={{ width: '100%', padding: '1rem' }}
              >
                Connect Wallet to Purchase
              </button>
            ) : !isArc ? (
              <button
                onClick={() => switchToArcTestnet()}
                className="btn-primary"
                style={{ width: '100%', padding: '1rem' }}
              >
                Switch Wallet to Arc Testnet
              </button>
            ) : state === 'success' ? (
              <button
                onClick={() => { setState('idle'); setResult(null); }}
                className="btn-secondary"
                style={{ width: '100%', padding: '1rem' }}
              >
                Purchase Another Item
              </button>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  opacity: isProcessing ? 0.6 : 1,
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
          <div style={{ marginTop: '2.5rem', background: '#0D111A', border: '1px solid rgba(22, 163, 74, 0.4)', borderRadius: 8, padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#16A34A', color: '#0A0D14', fontWeight: 800, fontSize: '0.875rem' }}>
                ✓
              </span>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8F6F2', margin: 0 }}>
                  Purchase Confirmed on Arc
                </h3>
                <span style={{ fontSize: '0.8125rem', color: '#4ADE80' }}>
                  Transaction executed with 100% sponsored gas.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#0A0D14', padding: '1rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="mono-meta" style={{ display: 'block' }}>Item Price:</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8F6F2' }}>10.00 USDC</span>
              </div>
              <div style={{ background: '#0A0D14', padding: '1rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="mono-meta" style={{ display: 'block' }}>Gas Paid by You:</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#4ADE80' }}>0.00 USDC (Free)</span>
              </div>
              <div style={{ background: '#0A0D14', padding: '1rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="mono-meta" style={{ display: 'block' }}>Purchases:</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8F6F2' }}>
                  {result.purchasesBefore} → {result.purchasesAfter}
                </span>
              </div>
            </div>

            <div style={{ background: '#0A0D14', padding: '1rem 1.25rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8A8F9E' }}>Transaction Hash:</span>
                <a
                  href={`https://testnet.arcscan.app/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#E2B768', fontFamily: 'monospace', fontWeight: 600, textDecoration: 'underline' }}
                >
                  {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)} ↗
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8A8F9E' }}>Block Confirmed:</span>
                <span style={{ fontWeight: 600, color: '#F8F6F2', fontFamily: 'monospace' }}>#{result.blockNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8A8F9E' }}>Smart Account:</span>
                <span style={{ fontFamily: 'monospace', color: '#F8F6F2' }}>
                  {result.smartAccount.slice(0, 8)}...{result.smartAccount.slice(-6)}
                </span>
              </div>
            </div>

            {/* Economic Settlement Collapsible */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <button
                onClick={() => setShowEconomicDetails(!showEconomicDetails)}
                style={{ background: 'none', border: 'none', color: '#C8953A', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
              >
                <span>{showEconomicDetails ? '▼' : '▶'}</span>
                View Economic Settlement &amp; Vault Accounting
              </button>

              {showEconomicDetails && (
                <div style={{ marginTop: '1rem', background: '#0A0D14', borderRadius: 6, padding: '1rem', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#8A8F9E' }}>Vault TVL:</span>
                    <span>{result.tvlBefore} USDC → <strong>{result.tvlAfter} USDC</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#8A8F9E' }}>Paymaster Gas Cost:</span>
                    <span style={{ color: '#4ADE80' }}>{result.paymasterGasPaid} USDC</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#8A8F9E' }}>Revenue Splitter:</span>
                    <span>50% LP Pool / 50% Developer</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8A8F9E' }}>Unrecovered Capital:</span>
                    <span>{result.unrecoveredCapital} USDC</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TECHNICAL DETAILS COLLAPSIBLE ───────────────────────── */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            style={{ background: 'none', border: 'none', color: '#8A8F9E', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>{showTechnicalDetails ? '▼' : '▶'}</span>
            Technical details (ERC-4337 &amp; Paymaster Architecture)
          </button>

          {showTechnicalDetails && (
            <div style={{ marginTop: '1rem', background: '#0D111A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '1.25rem', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: '#8A8F9E' }}>EntryPoint v0.6: </span>
                <span style={{ color: '#F8F6F2' }}>{config.entryPoint}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: '#8A8F9E' }}>InvestmentPaymaster: </span>
                <span style={{ color: '#F8F6F2' }}>{config.paymaster}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: '#8A8F9E' }}>DemoDApp Target: </span>
                <span style={{ color: '#F8F6F2' }}>{config.demoDApp}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: '#8A8F9E' }}>DAppVault: </span>
                <span style={{ color: '#F8F6F2' }}>{config.vault}</span>
              </div>
              <div>
                <span style={{ color: '#8A8F9E' }}>SimpleAccountFactory: </span>
                <span style={{ color: '#F8F6F2' }}>{config.accountFactory}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
