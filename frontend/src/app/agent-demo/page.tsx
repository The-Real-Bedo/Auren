'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { CONTRACTS, ARC_TESTNET_CHAIN_ID } from '../../config/contracts';
import { getApiUrl } from '../../config/api';

const EP_ABI = [
  'function getNonce(address,uint192) view returns (uint256)',
  'function getUserOpHash(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp) view returns (bytes32)',
  'function balanceOf(address) view returns (uint256)'
];

const FACTORY_ABI = [
  'function createAccount(address,uint256) returns (address)',
  'function getAddress(address,uint256) view returns (address)'
];

const ACCOUNT_ABI = [
  'function execute(address,uint256,bytes) external'
];

const DAPP_ABI = [
  'function purchaseItem() external payable',
  'function purchases(address) view returns (uint256)',
  'function splitter() view returns (address)'
];

const VAULT_ABI = [
  'function totalValue() view returns (uint256)',
  'function unrecoveredCapital() view returns (uint256)',
  'function totalGasDeployed() view returns (uint256)',
  'function totalCapitalRecovered() view returns (uint256)'
];

type ExecutionState =
  | 'idle'
  | 'connecting'
  | 'discovering'
  | 'evaluating'
  | 'building-userop'
  | 'signing'
  | 'submitting'
  | 'confirming'
  | 'settling'
  | 'success'
  | 'error';

interface LiveERC4337Result {
  userOpHash: string;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  paymasterGasPaid: string;
  smartAccount: string;
  userEOA: string;
  isFirstDeployment: boolean;
  purchaseValue: string;
  tvlBefore: string;
  tvlAfter: string;
  purchasesBefore: string;
  purchasesAfter: string;
  paymasterDepositBefore: string;
  paymasterDepositAfter: string;
  technoCoreRoom: string;
  technoCoreNoteKey: string;
  timestamp: number;
}

// Historical benchmark from protocol genesis (preserved for audit/comparison only)
const HISTORICAL_GENESIS_PROOF = {
  label: 'Genesis E2E Benchmark (Block #58665142)',
  txHash: '0xb9f95b44bf960be101c43ef1ea568e8a062530387a4275de355a0afa6110a2d4',
  blockNumber: 58665142,
  gasUsed: '69,201',
  effectiveGasPrice: '21.0 Gwei',
  actionValue: '5.00 USDC',
  tvlBefore: '30.00 USDC',
  tvlAfter: '32.50 USDC',
  vaultProfitAccrual: '+2.50 USDC (50% Split)',
  devProfitPayout: '+2.50 USDC (50% Split)',
  agentDid: 'did:key:z6MkreBJ7AT22iSUZNHKn4nC1uyao8Sb4mDK8cRePdFBjigt',
  technoCoreRoom: '/r/auren-ops',
  technoCoreNote: '/kv/auren-agents/did:key:z6MkreBJ7AT2…',
};

export default function AgentDemoPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'evidence' | 'technocore'>('live');

  // Wallet State
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0.00');

  // Smart Account State
  const [smartAccount, setSmartAccount] = useState<string | null>(null);
  const [isSmartAccountDeployed, setIsSmartAccountDeployed] = useState<boolean>(false);
  const [smartAccountBalance, setSmartAccountBalance] = useState<string>('0.00');

  // Execution State Machine
  const [state, setState] = useState<ExecutionState>('idle');
  const [stepDetail, setStepDetail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [maxSponsoredGas, setMaxSponsoredGas] = useState<string>('0.01');

  // Purchase Amount (Testnet native USDC)
  const [purchaseAmount, setPurchaseAmount] = useState<string>('0.001');

  // Real Execution Result
  const [executionResult, setExecutionResult] = useState<LiveERC4337Result | null>(null);

  const arcConfig = CONTRACTS[ARC_TESTNET_CHAIN_ID];
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;

  // Initialize wallet listener
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const browserProvider = new BrowserProvider((window as any).ethereum);
      setProvider(browserProvider);

      browserProvider.getNetwork().then((net) => {
        setChainId(Number(net.chainId));
      }).catch(() => {});

      browserProvider.listAccounts().then(async (accounts) => {
        if (accounts.length > 0) {
          const addr = accounts[0].address;
          setAccount(addr);
          updateAccountDetails(addr, browserProvider);
        }
      }).catch(() => {});

      const handleAccountsChanged = (accs: string[]) => {
        const addr = accs[0] || null;
        setAccount(addr);
        if (addr) {
          updateAccountDetails(addr, browserProvider);
        } else {
          setSmartAccount(null);
        }
      };

      const handleChainChanged = (cId: string) => {
        setChainId(parseInt(cId, 16));
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const updateAccountDetails = async (eoaAddr: string, prov: BrowserProvider) => {
    try {
      const bal = await prov.getBalance(eoaAddr);
      setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));

      // Derive counterfactual Smart Account
      const rpcProvider = new ethers.JsonRpcProvider(arcConfig.rpc);
      const factory = new Contract(arcConfig.accountFactory, FACTORY_ABI, rpcProvider);
      const saAddr = await factory.createAccount.staticCall(eoaAddr, 0);
      setSmartAccount(saAddr);

      const code = await rpcProvider.getCode(saAddr);
      const deployed = code.length > 2;
      setIsSmartAccountDeployed(deployed);

      const saBal = await rpcProvider.getBalance(saAddr);
      setSmartAccountBalance(parseFloat(ethers.formatEther(saBal)).toFixed(4));
    } catch (e) {
      console.error('Failed to update account details:', e);
    }
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      setErrorMessage('No EVM wallet detected. Please install MetaMask or another Web3 wallet.');
      return;
    }
    try {
      const browserProvider = new BrowserProvider((window as any).ethereum);
      await browserProvider.send('eth_requestAccounts', []);
      const signer = await browserProvider.getSigner();
      const addr = await signer.getAddress();
      const net = await browserProvider.getNetwork();
      setProvider(browserProvider);
      setAccount(addr);
      setChainId(Number(net.chainId));
      await updateAccountDetails(addr, browserProvider);
      setErrorMessage('');
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to connect wallet');
    }
  };

  const switchToArc = async () => {
    if (!(window as any).ethereum) return;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4cef52' }], // 5042002 in hex
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x4cef52',
                chainName: 'Arc Testnet',
                rpcUrls: ['https://rpc.testnet.arc.network'],
                nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                blockExplorerUrls: ['https://testnet.arcscan.app'],
              },
            ],
          });
        } catch (addError: any) {
          setErrorMessage(addError.message || 'Failed to add Arc Testnet to wallet');
        }
      } else {
        setErrorMessage(switchError.message || 'Failed to switch to Arc Testnet');
      }
    }
  };

  /**
   * REAL ERC-4337 BROWSER EXECUTION WITH AUREN PAYMASTER SPONSORSHIP
   */
  const handleRunERC4337Execution = async () => {
    if (!account || !provider) {
      await connectWallet();
      return;
    }

    if (!isArc) {
      await switchToArc();
      return;
    }

    setErrorMessage('');
    setExecutionResult(null);

    try {
      const arcRpcProvider = new ethers.JsonRpcProvider(arcConfig.rpc);
      const entryPoint = new Contract(arcConfig.entryPoint, EP_ABI, arcRpcProvider);
      const factory = new Contract(arcConfig.accountFactory, FACTORY_ABI, arcRpcProvider);
      const vaultContract = new Contract(arcConfig.vault, VAULT_ABI, arcRpcProvider);
      const dappContract = new Contract(arcConfig.demoDApp, DAPP_ABI, arcRpcProvider);

      // ── STEP 1: DISCOVERING ────────────────────────────────
      setState('discovering');
      setStepDetail('Querying Auren Opportunity Registry & pre-execution on-chain state...');

      const oppRes = await fetch(getApiUrl('/agent/opportunities'));
      const oppData = await oppRes.json();
      if (!oppRes.ok || !oppData.opportunities || oppData.opportunities.length === 0) {
        throw new Error('Failed to discover active Arc DApp opportunities from Auren Registry');
      }
      const targetOpportunity = oppData.opportunities[0];

      // Derive Smart Account & Check Deployment
      const sa = await factory.createAccount.staticCall(account, 0);
      setSmartAccount(sa);
      const code = await arcRpcProvider.getCode(sa);
      const isDeployed = code.length > 2;
      setIsSmartAccountDeployed(isDeployed);

      // Pre-execution queries
      const [tvlBefore, gasDeployedBefore, purchasesBefore, paymasterDepositBefore] = await Promise.all([
        vaultContract.totalValue(),
        vaultContract.totalGasDeployed(),
        dappContract.purchases(sa).catch(() => BigInt(0)),
        entryPoint.balanceOf(arcConfig.paymaster)
      ]);

      // ── STEP 2: EVALUATING ─────────────────────────────────
      setState('evaluating');
      const maxCostLimitWei = targetOpportunity.maxGasPerUserOpWei || ethers.parseEther('0.01').toString();
      const maxCostLimitUsdc = targetOpportunity.maxGasCostUsdc || ethers.formatEther(maxCostLimitWei);
      setMaxSponsoredGas(maxCostLimitUsdc);

      setStepDetail(`Policy Engine evaluating sponsorship bounds (${maxCostLimitUsdc} USDC limit) for ${targetOpportunity.name}...`);

      const dappInterface = new ethers.Interface(DAPP_ABI);
      const actionCallData = dappInterface.encodeFunctionData('purchaseItem');

      // Fetch dynamic network fee data to bound gas cost accurately
      const [feeData, latestBlock] = await Promise.all([
        arcRpcProvider.getFeeData(),
        arcRpcProvider.getBlock('latest').catch(() => null)
      ]);
      const baseFee = latestBlock?.baseFeePerGas || feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits('1', 'gwei');
      // Buffer of 10% over base fee + priority fee to guarantee inclusion without 2x inflation
      const dynamicMaxFee = (baseFee * 110n) / 100n + maxPriorityFeePerGas;
      const maxFeePerGas = dynamicMaxFee > ethers.parseUnits('25', 'gwei') ? ethers.parseUnits('25', 'gwei') : dynamicMaxFee;

      // Safely optimized gas envelope derived from on-chain simulation:
      // SimpleAccount.execute (92.5k gas) + safety margin -> 100k
      const callGasLimit = '100000';
      // SimpleAccount + InvestmentPaymaster validation -> 80k (100k if deploying)
      const verificationGasLimit = isDeployed ? '80000' : '100000';
      // Pre-verification overhead -> 30k
      const preVerificationGas = '30000';

      // Total gas envelope: (callGasLimit + 3 * verificationGasLimit + preVerificationGas) * maxFeePerGas
      const gasUnitsTotal = BigInt(callGasLimit) + BigInt(verificationGasLimit) * 3n + BigInt(preVerificationGas);
      const computedCostWei = gasUnitsTotal * maxFeePerGas;
      const authoritativeLimitWei = BigInt(maxCostLimitWei);

      if (computedCostWei > authoritativeLimitWei) {
        throw new Error("Current network fee estimate exceeds Auren's sponsorship limit. Please try again shortly.");
      }

      const policyRes = await fetch(getApiUrl('/agent/check-sponsorship'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultAddress: targetOpportunity.vaultAddress,
          targetContract: targetOpportunity.targetContract,
          callData: actionCallData,
          sender: sa,
          maxCost: computedCostWei.toString(),
          chainId: ARC_TESTNET_CHAIN_ID,
        }),
      });
      const policyData = await policyRes.json();
      if (!policyRes.ok || !policyData.eligible) {
        throw new Error(`Sponsorship rejected by Policy Engine: ${policyData.reason || 'Not eligible'}`);
      }

      // ── STEP 3: BUILDING USEROPERATION ─────────────────────
      setState('building-userop');
      setStepDetail('Constructing ERC-4337 UserOperation struct & requesting Paymaster signature...');

      const factoryInterface = new ethers.Interface(FACTORY_ABI);
      const accountInterface = new ethers.Interface(ACCOUNT_ABI);

      const initCode = isDeployed
        ? '0x'
        : ethers.concat([arcConfig.accountFactory, factoryInterface.encodeFunctionData('createAccount', [account, 0])]);

      const purchaseValue = ethers.parseEther(purchaseAmount);

      // Verify Smart Account has required funds to execute purchaseItem{value: purchaseValue}
      if (purchaseValue > 0n) {
        const saBal = await arcRpcProvider.getBalance(sa);
        if (saBal < purchaseValue) {
          setStepDetail(`Pre-funding Smart Account (${ethers.formatEther(purchaseValue)} USDC) from connected wallet...`);
          const signer = await provider.getSigner();
          const fundTx = await signer.sendTransaction({
            to: sa,
            value: purchaseValue
          });
          await fundTx.wait(1);
        }
      }

      const executeCallData = accountInterface.encodeFunctionData('execute', [
        arcConfig.demoDApp,
        purchaseValue,
        actionCallData
      ]);

      const nonce = await entryPoint.getNonce(sa, 0);

      const userOp: any = {
        sender: sa,
        nonce: nonce.toString(),
        initCode,
        callData: executeCallData,
        callGasLimit,
        verificationGasLimit,
        preVerificationGas,
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        maxCost: computedCostWei.toString(),
        paymasterAndData: '0x',
        signature: '0x'
      };

      // Request Paymaster signature from Auren backend
      const sponsorRes = await fetch(getApiUrl('/sponsor'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userOp,
          paymasterAddress: arcConfig.paymaster,
          vaultAddress: arcConfig.vault,
          chainId: ARC_TESTNET_CHAIN_ID,
        }),
      });
      const sponsorData = await sponsorRes.json();
      if (!sponsorRes.ok || !sponsorData.paymasterAndData) {
        throw new Error(sponsorData.error || 'Failed to obtain Paymaster authorization');
      }
      userOp.paymasterAndData = sponsorData.paymasterAndData;

      // ── STEP 4: USER SIGNING (EOA Owner) ───────────────────
      setState('signing');
      setStepDetail('Please approve the UserOperation hash signature in your wallet...');

      const formattedUserOp = {
        sender: userOp.sender,
        nonce: BigInt(userOp.nonce),
        initCode: userOp.initCode,
        callData: userOp.callData,
        callGasLimit: BigInt(userOp.callGasLimit),
        verificationGasLimit: BigInt(userOp.verificationGasLimit),
        preVerificationGas: BigInt(userOp.preVerificationGas),
        maxFeePerGas: BigInt(userOp.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas),
        paymasterAndData: userOp.paymasterAndData,
        signature: '0x'
      };

      const userOpHash = await entryPoint.getUserOpHash(formattedUserOp);

      const signer = await provider.getSigner();
      const userSignature = await signer.signMessage(ethers.getBytes(userOpHash));
      userOp.signature = userSignature;

      // ── STEP 5: SUBMITTING TO RELAYER ──────────────────────
      setState('submitting');
      setStepDetail('Submitting UserOperation to Auren Relayer → EntryPoint.handleOps()...');

      const submitRes = await fetch(getApiUrl('/agent/submit-userop'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userOp,
          chainId: ARC_TESTNET_CHAIN_ID,
          entryPointAddress: arcConfig.entryPoint,
          paymasterAddress: arcConfig.paymaster,
        }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData.success) {
        const detail = submitData.revertReason ? `: ${submitData.revertReason}` : (submitData.error ? `: ${submitData.error}` : '');
        throw new Error(`Relayer execution failed${detail}`);
      }

      // ── STEP 6: SETTLING & ON-CHAIN VERIFICATION ───────────
      setState('settling');
      setStepDetail('Reading confirmed on-chain Paymaster gas and vault accounting...');

      const [tvlAfter, purchasesAfter, paymasterDepositAfter] = await Promise.all([
        vaultContract.totalValue(),
        dappContract.purchases(sa).catch(() => BigInt(0)),
        entryPoint.balanceOf(arcConfig.paymaster)
      ]);

      const gasPaid = paymasterDepositBefore > paymasterDepositAfter
        ? paymasterDepositBefore - paymasterDepositAfter
        : BigInt(0);

      const executionPayload: LiveERC4337Result = {
        userOpHash: submitData.userOpHash,
        txHash: submitData.transactionHash,
        blockNumber: submitData.blockNumber,
        gasUsed: submitData.gasUsed,
        paymasterGasPaid: `${ethers.formatEther(gasPaid)} USDC`,
        smartAccount: sa,
        userEOA: account,
        isFirstDeployment: !isDeployed,
        purchaseValue: `${purchaseAmount} USDC`,
        tvlBefore: `${ethers.formatEther(tvlBefore)} USDC`,
        tvlAfter: `${ethers.formatEther(tvlAfter)} USDC`,
        purchasesBefore: purchasesBefore.toString(),
        purchasesAfter: purchasesAfter.toString(),
        paymasterDepositBefore: `${ethers.formatEther(paymasterDepositBefore)} USDC`,
        paymasterDepositAfter: `${ethers.formatEther(paymasterDepositAfter)} USDC`,
        technoCoreRoom: '/r/auren-ops',
        technoCoreNoteKey: `/kv/auren-agents/${sa}`,
        timestamp: Date.now(),
      };

      setExecutionResult(executionPayload);
      setIsSmartAccountDeployed(true);
      setState('success');
      setStepDetail('ERC-4337 Sponsored Transaction confirmed and verified on Arc Testnet!');

      await updateAccountDetails(account, provider);

    } catch (err: any) {
      console.error('ERC-4337 Execution error:', err);
      setState('error');
      setErrorMessage(err.reason || err.message || 'Execution failed on Arc Testnet');
      setStepDetail('');
    }
  };

  const getStepStatus = (targetState: ExecutionState) => {
    const statesOrder: ExecutionState[] = [
      'discovering',
      'evaluating',
      'building-userop',
      'signing',
      'submitting',
      'confirming',
      'settling',
      'success'
    ];
    const currentIndex = statesOrder.indexOf(state);
    const targetIndex = statesOrder.indexOf(targetState);

    if (state === 'error') return 'failed';
    if (state === 'success' || currentIndex > targetIndex) return 'complete';
    if (currentIndex === targetIndex) return 'active';
    return 'pending';
  };

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--color-paper)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span className="badge badge-gold">ERC-4337 Account Abstraction</span>
            <span className="badge badge-arc">Arc Testnet 5042002</span>
            <span className="badge badge-green">100% Gas Sponsored by Auren</span>
          </div>
          <h1 className="text-headline" style={{ color: 'var(--color-paper)', marginBottom: '0.75rem' }}>
            Autonomous Agent Execution Console
          </h1>
          <p style={{ color: 'rgba(248,246,242,0.5)', fontSize: '1.0625rem', maxWidth: 640, lineHeight: 1.6 }}>
            Execute real ERC-4337 sponsored UserOperations on Arc Testnet.
            Your EOA signs the operation with zero gas cost; Auren Paymaster pays the gas from vault capital through Canonical EntryPoint v0.6.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-ink-100)', paddingBottom: '0.5rem' }}>
          {[
            { id: 'live', label: '1. Live ERC-4337 Console' },
            { id: 'evidence', label: '2. Genesis Benchmark Proof' },
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

        {/* TAB 1: Live ERC-4337 Console */}
        {activeTab === 'live' && (
          <div>
            {/* Control & Wallet Connection Bar */}
            <div
              className="card"
              style={{
                padding: '1.75rem 2rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                background: 'var(--color-paper-white)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>ERC-4337 Sponsored Execution</span>
                  <span className="badge badge-green" style={{ fontSize: '0.6875rem' }}>
                    {executionResult ? '✓ Gas Sponsored by Auren' : 'Arc Testnet Sponsorship Eligible'}
                  </span>
                </div>
                <div className="text-sm text-muted">
                  {executionResult
                    ? 'Sponsored by Auren on Arc Testnet via Canonical EntryPoint v0.6.'
                    : 'Eligible actions can be sponsored by Auren on Arc Testnet.'}
                </div>
                {smartAccount && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-ink-700)', fontFamily: 'var(--font-mono)' }}>
                    <span>Smart Account: <strong>{smartAccount.slice(0, 10)}…{smartAccount.slice(-8)}</strong></span>
                    <span className="badge badge-neutral" style={{ marginLeft: 8, fontSize: '0.6875rem' }}>
                      {isSmartAccountDeployed ? '✓ Deployed' : 'Counterfactual (Deploys on 1st Op)'}
                    </span>
                  </div>
                )}
                {stepDetail && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-gold)', fontFamily: 'var(--font-mono)' }}>
                    ↳ {stepDetail}
                  </div>
                )}
              </div>

              {/* Wallet & Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {!account ? (
                  <button onClick={connectWallet} className="btn btn-primary btn-md">
                    Connect Wallet
                  </button>
                ) : !isArc ? (
                  <button onClick={switchToArc} className="btn btn-gold btn-md">
                    ⚠ Switch to Arc Testnet
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      onClick={handleRunERC4337Execution}
                      disabled={state !== 'idle' && state !== 'success' && state !== 'error'}
                      className="btn btn-gold btn-md"
                    >
                      {state !== 'idle' && state !== 'success' && state !== 'error' ? (
                        <>
                          <span className="spinner spinner-gold" style={{ width: 12, height: 12, borderWidth: 2, marginRight: 6 }} />
                          Executing ERC-4337...
                        </>
                      ) : state === 'success' ? (
                        '↺ Run Another Sponsored Execution'
                      ) : (
                        '▶ Run Sponsored UserOp'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Architecture Explainer Badge */}
            <div
              className="card-inset"
              style={{
                padding: '0.875rem 1.25rem',
                marginBottom: '2rem',
                background: '#F0FDF4',
                borderColor: '#BBF7D0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.8125rem',
                color: '#166534',
              }}
            >
              <span style={{ fontSize: '1.125rem' }}>🛡️</span>
              <span>
                <strong>Gas Sponsorship Policy:</strong> Max sponsored gas: <strong>{maxSponsoredGas} USDC</strong> per action (configured by server policy).
                Gas fees are covered directly by <strong>Auren InvestmentPaymaster (<code>0x2a412237…</code>)</strong> via Canonical EntryPoint v0.6 on <strong>Arc Testnet</strong>.
              </span>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  marginBottom: '2rem',
                  background: '#FEF2F2',
                  borderColor: '#FCA5A5',
                  color: '#991B1B',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 2 }}>Execution Halted</div>
                  <div style={{ fontSize: '0.8125rem' }}>{errorMessage}</div>
                </div>
                <button
                  onClick={() => { setState('idle'); setErrorMessage(''); }}
                  className="btn btn-sm"
                  style={{ background: 'white', borderColor: '#FCA5A5', color: '#991B1B' }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 6 Real ERC-4337 Stages Pipeline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                {
                  id: 'discovering' as ExecutionState,
                  n: '01',
                  title: '1. DApp Discovery',
                  desc: 'Agent queries Opportunity Registry & computes Smart Account address from Factory.',
                  info: 'Target: Digital Marketplace | Factory: 0x2f1c18…',
                },
                {
                  id: 'evaluating' as ExecutionState,
                  n: '02',
                  title: '2. Policy Evaluation',
                  desc: 'Policy Engine verifies selector whitelist, daily budget, and sender limits.',
                  info: `Action: purchaseItem() (0xef032d84) | Max Gas Bound: ${maxSponsoredGas} USDC`,
                },
                {
                  id: 'building-userop' as ExecutionState,
                  n: '03',
                  title: '3. Paymaster Authorization',
                  desc: 'Auren backend validates envelope and signs cryptographic paymasterAndData.',
                  info: 'Paymaster: 0x2a412237… | EntryPoint: 0x5FF137…',
                },
                {
                  id: 'signing' as ExecutionState,
                  n: '04',
                  title: '4. EOA Owner Signature',
                  desc: 'Connected wallet signs userOpHash (0 gas required by user).',
                  info: 'Signer: Connected EOA | Account: SimpleAccount Proxy',
                },
                {
                  id: 'submitting' as ExecutionState,
                  n: '05',
                  title: '5. Relayer Broadcast',
                  desc: 'Auren Relayer packages UserOp and calls EntryPoint.handleOps().',
                  info: 'Relayer: Server-side | Mode: ERC-4337 Bundler',
                },
                {
                  id: 'settling' as ExecutionState,
                  n: '06',
                  title: '6. Settlement & Accounting',
                  desc: 'EntryPoint deducts gas from Paymaster; RevenueSplitter settles profit to Vault.',
                  info: 'Accounting: DAppVault totalValue() & /r/auren-ops',
                },
              ].map((stage) => {
                const status = getStepStatus(stage.id);

                return (
                  <div
                    key={stage.n}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      position: 'relative',
                      overflow: 'hidden',
                      borderColor:
                        status === 'active'
                          ? 'var(--color-gold)'
                          : status === 'complete'
                          ? '#B8D9CB'
                          : status === 'failed'
                          ? '#FCA5A5'
                          : 'var(--color-ink-100)',
                      background:
                        status === 'active'
                          ? 'var(--color-gold-50)'
                          : status === 'complete'
                          ? 'var(--color-paper-white)'
                          : 'var(--color-paper)',
                      boxShadow: status === 'active' ? 'var(--shadow-gold)' : 'var(--shadow-xs)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color:
                            status === 'active'
                              ? 'var(--color-gold)'
                              : status === 'complete'
                              ? 'var(--color-emerald)'
                              : 'var(--color-ink-400)',
                        }}
                      >
                        Step {stage.n}
                      </span>
                      {status === 'complete' && <span className="badge badge-green">✓ Completed</span>}
                      {status === 'active' && (
                        <span className="badge badge-gold">
                          <span className="spinner spinner-gold" style={{ width: 10, height: 10, borderWidth: 2 }} />
                          Active
                        </span>
                      )}
                      {status === 'pending' && <span className="badge badge-neutral">Queued</span>}
                      {status === 'failed' && <span className="badge badge-neutral" style={{ background: '#FEE2E2', color: '#991B1B' }}>Failed</span>}
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                      {stage.title}
                    </h3>
                    <p className="text-xs text-muted" style={{ marginBottom: '0.875rem', minHeight: 36, lineHeight: 1.5 }}>
                      {stage.desc}
                    </p>

                    <div
                      className="card-inset"
                      style={{
                        padding: '0.625rem 0.875rem',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        background: status === 'active' ? 'white' : 'var(--color-paper)',
                        color: 'var(--color-ink-600)',
                      }}
                    >
                      {stage.info}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* REAL NEW ERC-4337 TRANSACTION RECEIPT */}
            {executionResult && (
              <div
                className="card animate-fade-in"
                style={{
                  padding: '2.5rem',
                  background: 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-xl)',
                  marginBottom: '3rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="badge badge-green">✓ Sponsored by Auren Paymaster</span>
                      <span className="badge badge-gold">Canonical EntryPoint v0.6</span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-paper)', margin: 0 }}>
                      ERC-4337 UserOp Confirmed in Block #{executionResult.blockNumber}
                    </h2>
                    <p style={{ color: 'rgba(248,246,242,0.5)', fontSize: '0.875rem', marginTop: 4 }}>
                      Executed through Smart Account <code>{executionResult.smartAccount}</code>.
                      User paid <strong>0.00 USDC gas</strong>; Paymaster paid <strong>{executionResult.paymasterGasPaid}</strong>.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a
                      href={`https://testnet.arcscan.app/tx/${executionResult.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-gold btn-md"
                    >
                      View on ArcScan ↗
                    </a>
                    <button
                      onClick={handleRunERC4337Execution}
                      className="btn btn-outline-white btn-md"
                    >
                      ↺ Run Again
                    </button>
                  </div>
                </div>

                {/* Real Metrics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    marginBottom: '2rem',
                  }}
                >
                  {[
                    { label: 'Transaction Hash', value: `${executionResult.txHash.slice(0, 12)}…${executionResult.txHash.slice(-8)}` },
                    { label: 'UserOperation Hash', value: `${executionResult.userOpHash.slice(0, 12)}…${executionResult.userOpHash.slice(-8)}` },
                    { label: 'Smart Account (Sender)', value: `${executionResult.smartAccount.slice(0, 10)}…${executionResult.smartAccount.slice(-8)}` },
                    { label: 'User EOA Gas Paid', value: '0.00 USDC (Sponsored)' },
                    { label: 'Paymaster Gas Paid', value: executionResult.paymasterGasPaid },
                    { label: 'Gas Used', value: executionResult.gasUsed },
                    { label: 'Vault TVL (Before → After)', value: `${executionResult.tvlBefore} → ${executionResult.tvlAfter}` },
                    { label: 'Smart Account Purchases', value: `${executionResult.purchasesBefore} → ${executionResult.purchasesAfter}` },
                  ].map((m) => (
                    <div key={m.label} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                      <div className="stat-label" style={{ color: 'rgba(248,246,242,0.4)', marginBottom: 4 }}>
                        {m.label}
                      </div>
                      <div style={{ color: 'var(--color-paper)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* TechnoCore Sync Receipt */}
                <div className="card-inset" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                      TechnoCore State Synchronization
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '0.625rem' }}>Synced</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'rgba(248,246,242,0.7)', lineHeight: 1.6 }}>
                    <div>• Room Broadcast: <code>{executionResult.technoCoreRoom}</code></div>
                    <div>• Agent Note Record: <code>{executionResult.technoCoreNoteKey}</code></div>
                    <div>• UserOp Record: <code>/kv/auren-userop/{executionResult.userOpHash.slice(0, 16)}…</code></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Historical Genesis Proof Benchmark */}
        {activeTab === 'evidence' && (
          <div>
            <div
              className="card-inset"
              style={{
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                background: 'var(--color-paper-white)',
                borderLeft: '4px solid var(--color-gold)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 4 }}>
                Historical Genesis Benchmark
              </div>
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                This is the genesis E2E audit benchmark executed during the initial Auren on-chain deployment.
                Live executions run in Tab 1 generate brand-new Arc Testnet ERC-4337 sponsored transactions.
              </p>
            </div>

            <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-ink-100)', paddingBottom: '1.25rem' }}>
                <div>
                  <span className="badge badge-arc" style={{ marginBottom: '0.5rem' }}>Genesis Benchmark</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {HISTORICAL_GENESIS_PROOF.label}
                  </h2>
                </div>
                <a
                  href={`https://testnet.arcscan.app/tx/${HISTORICAL_GENESIS_PROOF.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  View on ArcScan ↗
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {[
                  ['Transaction Hash', HISTORICAL_GENESIS_PROOF.txHash],
                  ['Block Number', `#${HISTORICAL_GENESIS_PROOF.blockNumber}`],
                  ['Gas Used', HISTORICAL_GENESIS_PROOF.gasUsed],
                  ['Effective Gas Price', HISTORICAL_GENESIS_PROOF.effectiveGasPrice],
                  ['Item Price', HISTORICAL_GENESIS_PROOF.actionValue],
                  ['Vault TVL Growth', `${HISTORICAL_GENESIS_PROOF.tvlBefore} → ${HISTORICAL_GENESIS_PROOF.tvlAfter}`],
                  ['Vault Profit Share', HISTORICAL_GENESIS_PROOF.vaultProfitAccrual],
                  ['Developer Profit Share', HISTORICAL_GENESIS_PROOF.devProfitPayout],
                ].map(([k, v]) => (
                  <div key={k} className="metric-row" style={{ padding: '0.75rem 0' }}>
                    <span className="metric-label">{k}</span>
                    <span className="metric-value text-mono" style={{ fontSize: '0.8125rem' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TechnoCore State & Notes */}
        {activeTab === 'technocore' && (
          <div>
            <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-gold">TechnoCore Architecture</span>
                <span className="text-xs text-muted">FLOP Labs Standard</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Zero-Auth HTTP Memory & Chat Layer
              </h2>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
                TechnoCore provides decentralized agent coordination without central servers.
                Auren agents broadcast execution receipts to room <code>/r/auren-ops</code> and store verifiable state in <code>/kv/auren-agents/</code>.
              </p>

              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="card-inset" style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    1. Zero-Auth Plain GET Room Read
                  </div>
                  <pre style={{ background: 'var(--color-ink-900)', color: 'var(--color-paper)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', overflowX: 'auto' }}>
{`curl -s "https://chat.flop.finance/r/auren-ops?limit=5"
[
  {
    "sender": "technocore-agent",
    "text": "[ERC-4337 SPONSORED] Block #58777974 | TX: 0x0a958dd5… | Gas Paid by Paymaster: 0.0074 USDC",
    "timestamp": 1787617500000
  }
]`}
                  </pre>
                </div>

                <div className="card-inset" style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    2. Persistent Agent KV State Note
                  </div>
                  <pre style={{ background: 'var(--color-ink-900)', color: 'var(--color-paper)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', overflowX: 'auto' }}>
{`curl -s "https://chat.flop.finance/kv/auren-agents/0xA32F89a543C36A678e0c03C022CB39abB14e49CE"
{
  "smartAccount": "0xA32F89a543C36A678e0c03C022CB39abB14e49CE",
  "action": "purchaseItem",
  "targetDApp": "Digital Marketplace",
  "targetContract": "0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6",
  "vault": "0x851bD1E5d9CdeD0f183e861dB98157641C826a74",
  "paymaster": "0x2a4122372B1A624118Ee3e7D4503B9525CfDE076",
  "userOpHash": "0xc043df72dc84ec06f3842c7edf728484c70606eb27375b687360a341bb9b15de",
  "txHash": "0x0a958dd53b280a9bbda9a222ddede4363017de6bd945d03c7e649e620c947b1c",
  "blockNumber": 58777974,
  "paymasterGasPaid": "0.007466712 USDC",
  "userGasPaid": "0.00 USDC"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
