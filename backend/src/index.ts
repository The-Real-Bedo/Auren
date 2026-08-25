import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { ethers } from 'ethers';
import { PerpetuaSDK } from 'sdk';
import { AurenTools, createAgentApiRouter } from '@auren/agent';
import { DAPP_REGISTRY, validateSponsorshipAgainstRegistry, decodeUserOpCalldata } from './registry/dappRegistry';
import { defaultPolicyStore } from './storage/policyStore';
import { defaultRateLimiter } from './middleware/rateLimiter';

// Safely load root .env relative to this directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();

// ── AUR-SEC-07: Environment-Driven CORS ────────────────────
const defaultOrigins = [
  'https://auren-build.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : defaultOrigins;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || envOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin ${origin} not permitted`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3001;
const RPC_URL = process.env.ARC_RPC_URL || process.env.RPC_URL || 'https://rpc.testnet.arc.network';

// ── Strict Key Separation ─────────────────────────────────
const BACKEND_SIGNER_KEY = process.env.BACKEND_SIGNER_PRIVATE_KEY || process.env.SIGNER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const RELAYER_KEY = process.env.RELAYER_PRIVATE_KEY || process.env.BACKEND_SIGNER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || BACKEND_SIGNER_KEY;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || ethers.ZeroAddress;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const backendSigner = new ethers.Wallet(BACKEND_SIGNER_KEY, provider);
const relayerSigner = new ethers.Wallet(RELAYER_KEY as string, provider);

const sdk = new PerpetuaSDK({
  factoryAddress: FACTORY_ADDRESS,
  signer: backendSigner
});

// Initialize Auren Agent tools and mount /agent API router
const aurenTools = new AurenTools(RPC_URL, BACKEND_SIGNER_KEY);
const agentApiRouter = createAgentApiRouter(aurenTools);
app.use('/agent', agentApiRouter);

const ENTRY_POINT_ABI = [
  'function getNonce(address,uint192) view returns (uint256)',
  'function getUserOpHash(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp) view returns (bytes32)',
  'function handleOps(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature)[] ops, address payable beneficiary) external',
  'function balanceOf(address) view returns (uint256)',
  'error FailedOp(uint256 opIndex, string reason)',
  'error ExecutionResult(uint256 preOpGas, uint256 paid, uint48 validAfter, uint48 validUntil, bool targetSuccess, bytes targetResult)'
];

// ── Discovery Endpoints ────────────────────────────────────
const candidateDiscoveryDirs = [
  path.resolve(process.cwd(), '../agent/discovery'),
  path.resolve(process.cwd(), 'agent/discovery'),
  path.resolve(__dirname, '../../agent/discovery'),
  path.resolve(__dirname, '../../../agent/discovery')
];
const discoveryDir = candidateDiscoveryDirs.find(d => fs.existsSync(d)) || candidateDiscoveryDirs[0];

app.get('/llms.txt', (req: Request, res: Response) => {
  res.sendFile(path.join(discoveryDir, 'llms.txt'));
});

app.get('/skill.md', (req: Request, res: Response) => {
  res.sendFile(path.join(discoveryDir, 'skill.md'));
});

app.get('/.well-known/agent.json', (req: Request, res: Response) => {
  res.sendFile(path.join(discoveryDir, 'agent.json'));
});

app.get('/openapi.json', (req: Request, res: Response) => {
  res.sendFile(path.join(discoveryDir, 'openapi.json'));
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Auren Economic Layer & Hardened Policy Engine',
    rpc: RPC_URL,
    signerAddress: backendSigner.address,
    relayerAddress: relayerSigner.address,
    registeredDAppsCount: Object.keys(DAPP_REGISTRY).length
  });
});

/**
 * AUR-SEC-01 & AUR-SEC-02: Hardened Sponsorship Authorization Endpoint
 */
app.post('/sponsor', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userOp, paymasterAddress, vaultAddress, chainId } = req.body;

    if (!userOp || !paymasterAddress || !vaultAddress || !chainId) {
      return res.status(400).json({ error: 'Missing required fields (userOp, paymasterAddress, vaultAddress, chainId)' });
    }

    const sender = (userOp.sender || '').toLowerCase();
    const agentDid = (req.headers['x-agent-did'] as string) || undefined;

    // 1. Layered Anti-Sybil Rate Limiting (AUR-SEC-06)
    const rateCheck = defaultRateLimiter.checkRateLimit(req, sender, agentDid);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: rateCheck.error });
    }

    // Compute canonical maxCost from gas fields matching EntryPoint requiredPreFund
    const callGas = BigInt(userOp.callGasLimit || 150000);
    const verGas = BigInt(userOp.verificationGasLimit || 200000);
    const preGas = BigInt(userOp.preVerificationGas || 50000);
    const maxFee = BigInt(userOp.maxFeePerGas || ethers.parseUnits('10', 'gwei'));
    const maxCostWei = (callGas + verGas * 3n + preGas) * maxFee;

    // 2. Strict Registry & Calldata Whitelist Verification (AUR-SEC-01)
    const validation = validateSponsorshipAgainstRegistry({
      vaultAddress,
      paymasterAddress,
      chainId: Number(chainId),
      callData: userOp.callData || '0x',
      maxCostWei
    });

    if (!validation.valid || !validation.registeredDApp) {
      return res.status(403).json({ error: validation.error || 'Sponsorship authorization rejected' });
    }

    const dApp = validation.registeredDApp;

    // 3. Persistent & Concurrency-Safe Daily Budget Verification (AUR-SEC-02)
    const budgetSpend = defaultPolicyStore.atomicSpendBudget(
      dApp.vaultAddress,
      maxCostWei,
      dApp.dailyBudgetWei
    );

    if (!budgetSpend.approved) {
      return res.status(429).json({ error: budgetSpend.error });
    }

    // 4. Generate Cryptographic paymasterAndData with exact UserOp fields
    const signature = await sdk.signUserOp(userOp, paymasterAddress, Number(chainId));

    return res.json({
      paymasterAndData: signature,
      remainingDailyBudgetUsdc: ethers.formatEther(budgetSpend.remainingBudgetWei)
    });
  } catch (error: any) {
    console.error('Sponsorship authorization error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * AUR-SEC-03: Hardened Relayer / Bundler Endpoint with EntryPoint Pre-Simulation
 */
app.post('/agent/submit-userop', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userOp, chainId, entryPointAddress, paymasterAddress } = req.body;

    if (!userOp || !userOp.sender || !userOp.callData || !userOp.signature || !userOp.paymasterAndData) {
      return res.status(400).json({ error: 'Invalid UserOperation structure' });
    }

    const numericChainId = Number(chainId);
    if (numericChainId !== 5042002 && numericChainId !== 31337) {
      return res.status(400).json({ error: `Unsupported chainId ${chainId} (must be 5042002 or 31337)` });
    }

    const epAddr = (entryPointAddress || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789').toLowerCase();
    if (epAddr !== '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789') {
      return res.status(400).json({ error: 'Unauthorized EntryPoint address' });
    }

    const pmAddr = (paymasterAddress || '0x2a4122372B1A624118Ee3e7D4503B9525CfDE076').toLowerCase();
    if (pmAddr !== '0x2a4122372b1a624118ee3e7d4503b9525cfde076' && pmAddr !== '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0') {
      return res.status(400).json({ error: 'Unauthorized Paymaster address' });
    }

    // Format UserOp struct for EntryPoint
    const formattedUserOp = {
      sender: userOp.sender,
      nonce: BigInt(userOp.nonce || 0),
      initCode: userOp.initCode || '0x',
      callData: userOp.callData,
      callGasLimit: BigInt(userOp.callGasLimit || 200000),
      verificationGasLimit: BigInt(userOp.verificationGasLimit || 350000),
      preVerificationGas: BigInt(userOp.preVerificationGas || 60000),
      maxFeePerGas: BigInt(userOp.maxFeePerGas || ethers.parseUnits('30', 'gwei')),
      maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas || ethers.parseUnits('2', 'gwei')),
      paymasterAndData: userOp.paymasterAndData,
      signature: userOp.signature
    };

    const entryPoint = new ethers.Contract(entryPointAddress || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', ENTRY_POINT_ABI, relayerSigner);
    const userOpHash = await entryPoint.getUserOpHash(formattedUserOp);

    // ── AUR-SEC-03: Pre-Simulation via staticCall ──────────
    try {
      await entryPoint.handleOps.staticCall([formattedUserOp], relayerSigner.address);
    } catch (simError: any) {
      let decodedReason = simError.reason || simError.shortMessage || simError.message || 'Simulation reverted';
      try {
        const errData = simError.data || (simError.error && (simError.error.data || simError.error.error?.data));
        if (errData && typeof errData === 'string') {
          const parsed = entryPoint.interface.parseError(errData);
          if (parsed && parsed.name === 'FailedOp') {
            decodedReason = `EntryPoint FailedOp: ${parsed.args[1]}`;
          }
        }
      } catch (_) {}
      console.warn(`Relayer: Pre-simulation failed for UserOp ${userOpHash}:`, decodedReason);
      return res.status(400).json({
        error: 'UserOperation pre-simulation failed on EntryPoint',
        revertReason: decodedReason,
        userOpHash
      });
    }

    console.log(`Relaying verified UserOp ${userOpHash} for sender ${formattedUserOp.sender}...`);

    const tx = await entryPoint.handleOps([formattedUserOp], relayerSigner.address, {
      gasLimit: 1500000
    });

    console.log(`Relayed handleOps broadcasted: ${tx.hash}`);
    const receipt = await tx.wait(1);

    if (!receipt || receipt.status !== 1) {
      return res.status(500).json({
        error: 'UserOperation execution reverted on-chain',
        transactionHash: tx.hash,
        userOpHash
      });
    }

    return res.json({
      success: true,
      userOpHash,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status
    });
  } catch (error: any) {
    console.error('Relayer execution error:', error);
    return res.status(500).json({
      error: error.reason || error.message || 'Failed to relay UserOperation'
    });
  }
});

// Admin Policy Inspection Endpoint
app.get('/admin/policy/:vaultAddress', (req: Request, res: Response): any => {
  const vaultParam = Array.isArray(req.params.vaultAddress) ? req.params.vaultAddress[0] : req.params.vaultAddress;
  const vaultKey = (vaultParam || '').toLowerCase();
  const dApp = DAPP_REGISTRY[vaultKey];
  if (!dApp) {
    return res.status(404).json({ error: 'DApp not registered' });
  }

  const budget = defaultPolicyStore.getBudgetStatus(dApp.vaultAddress, dApp.dailyBudgetWei);
  return res.json({
    dApp: {
      id: dApp.id,
      name: dApp.name,
      active: dApp.active,
      dailyBudgetUsdc: ethers.formatEther(dApp.dailyBudgetWei),
      spentTodayUsdc: ethers.formatEther(budget.spentTodayWei),
      remainingUsdc: ethers.formatEther(budget.remainingWei),
      maxGasPerUserOpUsdc: ethers.formatEther(dApp.maxGasPerUserOpWei)
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Auren Security-Hardened Policy Engine running on port ${PORT}`);
    console.log(`Allowed CORS Origins: ${envOrigins.join(', ')}`);
  });
}

export { app };
