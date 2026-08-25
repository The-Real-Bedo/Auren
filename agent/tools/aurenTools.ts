import { ethers } from 'ethers';
import { PerpetuaSDK } from 'sdk';
import { defaultPolicyEngine, SponsorshipRequestPayload } from '../policies/policyEngine';
import { SignedEnvelope } from '../identity/didKey';

// Standard ABIs for query tools
const VAULT_ABI = [
  'function totalValue() view returns (uint256)',
  'function unrecoveredCapital() view returns (uint256)',
  'function totalGasDeployed() view returns (uint256)',
  'function totalCapitalRecovered() view returns (uint256)',
  'function totalSupplyShares() view returns (uint256)',
  'function lpShares(address) view returns (uint256)',
  'function lpProfitShareBps() view returns (uint256)',
  'function developer() view returns (address)',
  'function paymaster() view returns (address)',
  'function splitter() view returns (address)'
];

export interface DAppOpportunity {
  id: string;
  name: string;
  category: string;
  vaultAddress: string;
  paymasterAddress: string;
  targetContract: string;
  splitterAddress: string;
  chainId: number;
  lpProfitShareBps: number;
  recoveryModel: string;
  maxGasPerUserOpWei: string;
  maxGasCostUsdc: string;
  dailyBudgetUsdc: string;
  active: boolean;
}

export interface DAppEconomics {
  vaultAddress: string;
  totalValueUsdc: string;
  totalGasDeployedUsdc: string;
  totalCapitalRecoveredUsdc: string;
  unrecoveredCapitalUsdc: string;
  recoveryPercentage: string;
  lpProfitSharePercentage: string;
  netRealizedProfitUsdc: string;
  active: boolean;
}

export interface VaultStatus {
  vaultAddress: string;
  totalValue: string;
  totalSupplyShares: string;
  unrecoveredCapital: string;
  totalGasDeployed: string;
  totalCapitalRecovered: string;
  developer: string;
  paymaster: string;
  splitter: string;
}

export interface TransactionStatus {
  txHash: string;
  confirmed: boolean;
  status: 'pending' | 'success' | 'reverted' | 'not_found';
  blockNumber?: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

export class AurenTools {
  private provider: ethers.JsonRpcProvider;
  private sdk?: PerpetuaSDK;
  private backendSigner?: ethers.Wallet;
  private vaultCache: Map<string, { data: VaultStatus; expiresAt: number }> = new Map();

  // Registered DApps directory on Arc Testnet
  private static registeredOpportunities: DAppOpportunity[] = [
    {
      id: 'demo-marketplace',
      name: 'Digital Marketplace',
      category: 'Commerce / Gaming',
      vaultAddress: '0x851bD1E5d9CdeD0f183e861dB98157641C826a74',
      paymasterAddress: '0x2a4122372B1A624118Ee3e7D4503B9525CfDE076',
      targetContract: '0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6',
      splitterAddress: '0x8aA1197eFF337Db0c2aaF9e085c50cB46A7Fb2f7',
      chainId: 5042002,
      lpProfitShareBps: 5000,
      recoveryModel: 'Revenue-first principal recovery (Mudarabah-inspired)',
      maxGasPerUserOpWei: '10000000000000000', // 0.01 USDC (10^16 wei)
      maxGasCostUsdc: '0.01',
      dailyBudgetUsdc: '100.0',
      active: true
    }
  ];

  constructor(rpcUrl?: string, signerPrivateKey?: string) {
    const rpc = rpcUrl || process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
    this.provider = new ethers.JsonRpcProvider(rpc);

    const pk = signerPrivateKey || process.env.BACKEND_SIGNER_PRIVATE_KEY || process.env.SIGNER_PRIVATE_KEY;
    if (pk) {
      this.backendSigner = new ethers.Wallet(pk, this.provider);
      this.sdk = new PerpetuaSDK({
        factoryAddress: '0x8CB1E0Dcd5dA6F8C17b83535B4307128701BA7ab',
        signer: this.backendSigner
      });
    }
  }

  /**
   * Tool: listOpportunities
   * Discovers available DApp ventures and their economic parameters.
   */
  public async listOpportunities(): Promise<DAppOpportunity[]> {
    return AurenTools.registeredOpportunities;
  }

  /**
   * Tool: getVaultStatus
   * Reads real-time on-chain accounting with TTL caching and retry logic.
   */
  public async getVaultStatus(vaultAddress: string, forceFresh: boolean = false): Promise<VaultStatus> {
    const key = vaultAddress.toLowerCase();
    const now = Date.now();
    const cached = this.vaultCache.get(key);

    if (!forceFresh && cached && cached.expiresAt > now) {
      return cached.data;
    }

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, this.provider);

    // Call with retry helper
    const result = await this.retryRpc(async () => {
      const [
        totalValue,
        unrecoveredCapital,
        totalGasDeployed,
        totalCapitalRecovered,
        totalSupplyShares,
        developer,
        paymaster,
        splitter
      ] = await Promise.all([
        vault.totalValue(),
        vault.unrecoveredCapital(),
        vault.totalGasDeployed(),
        vault.totalCapitalRecovered(),
        vault.totalSupplyShares(),
        vault.developer(),
        vault.paymaster(),
        vault.splitter()
      ]);

      return {
        vaultAddress,
        totalValue: ethers.formatEther(totalValue),
        totalSupplyShares: totalSupplyShares.toString(),
        unrecoveredCapital: ethers.formatEther(unrecoveredCapital),
        totalGasDeployed: ethers.formatEther(totalGasDeployed),
        totalCapitalRecovered: ethers.formatEther(totalCapitalRecovered),
        developer,
        paymaster,
        splitter
      };
    });

    this.vaultCache.set(key, { data: result, expiresAt: now + 15_000 }); // 15s TTL cache
    return result;
  }

  /**
   * Tool: getDAppEconomics
   * Synthesizes historical performance, CAC recovery rate, and net profit metrics.
   */
  public async getDAppEconomics(vaultAddress: string): Promise<DAppEconomics> {
    const status = await this.getVaultStatus(vaultAddress);
    const policy = defaultPolicyEngine.getPolicy(vaultAddress);

    const gasDeployed = parseFloat(status.totalGasDeployed);
    const capitalRecovered = parseFloat(status.totalCapitalRecovered);
    const totalVal = parseFloat(status.totalValue);

    const recoveryPct = gasDeployed > 0
      ? Math.min(100, (capitalRecovered / gasDeployed) * 100).toFixed(2)
      : '100.00';

    const netProfit = Math.max(0, capitalRecovered - gasDeployed).toFixed(4);

    return {
      vaultAddress,
      totalValueUsdc: status.totalValue,
      totalGasDeployedUsdc: status.totalGasDeployed,
      totalCapitalRecoveredUsdc: status.totalCapitalRecovered,
      unrecoveredCapitalUsdc: status.unrecoveredCapital,
      recoveryPercentage: `${recoveryPct}%`,
      lpProfitSharePercentage: '50%',
      netRealizedProfitUsdc: netProfit,
      active: policy ? policy.active : true
    };
  }

  /**
   * Tool: checkSponsorship
   * Pre-flight eligibility check without spending budget or requiring signing.
   */
  public async checkSponsorship(payload: SponsorshipRequestPayload): Promise<{
    eligible: boolean;
    reason?: string;
    maxGasCostUsdc: string;
  }> {
    const result = defaultPolicyEngine.evaluateDryRun(payload);
    return {
      eligible: result.eligible,
      reason: result.reason,
      maxGasCostUsdc: ethers.formatEther(payload.maxCost || '0')
    };
  }

  /**
   * Tool: requestSponsorship
   * Evaluates signed TechnoCore did:key request and generates paymaster authorization signature.
   */
  public async requestSponsorship(envelope: SignedEnvelope<SponsorshipRequestPayload>): Promise<{
    approved: boolean;
    paymasterAndData?: string;
    error?: string;
  }> {
    const evalResult = defaultPolicyEngine.evaluateSignedRequest(envelope);
    if (!evalResult.approved) {
      return { approved: false, error: evalResult.error };
    }

    if (!this.sdk || !this.backendSigner) {
      return { approved: false, error: 'Auren Policy Signer is not configured on this node' };
    }

    const payload = envelope.payload;
    const opp = AurenTools.registeredOpportunities.find(
      o => o.vaultAddress.toLowerCase() === payload.vaultAddress.toLowerCase()
    );
    const paymasterAddress = opp ? opp.paymasterAddress : payload.vaultAddress;

    const userOp = {
      sender: payload.sender,
      nonce: payload.nonce || Math.floor(Math.random() * 1_000_000),
      callData: payload.callData,
      maxCost: payload.maxCost
    };

    const signature = await this.sdk.signUserOp(userOp, paymasterAddress, payload.chainId);
    return {
      approved: true,
      paymasterAndData: signature
    };
  }

  /**
   * Tool: getTransactionStatus
   * Queries Arc Testnet for transaction confirmation, status, and gas usage.
   */
  public async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    try {
      const receipt = await this.retryRpc(() => this.provider.getTransactionReceipt(txHash));
      if (!receipt) {
        return {
          txHash,
          confirmed: false,
          status: 'pending'
        };
      }

      return {
        txHash,
        confirmed: true,
        status: receipt.status === 1 ? 'success' : 'reverted',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice ? receipt.gasPrice.toString() : undefined
      };
    } catch (e: any) {
      return {
        txHash,
        confirmed: false,
        status: 'not_found'
      };
    }
  }

  /**
   * Resilient RPC execution with exponential backoff for testnet rate limits.
   */
  private async retryRpc<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        if (attempt < maxRetries - 1) {
          const delayMs = (attempt + 1) * 600;
          await new Promise(r => setTimeout(r, delayMs));
        }
      }
    }
    throw lastError;
  }
}
