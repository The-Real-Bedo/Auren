import { ethers } from 'ethers';
import { AgentIdentity, SignedEnvelope } from '../identity/didKey';

export interface DAppPolicy {
  vaultAddress: string;
  targetContracts: string[];       // Allowed contract addresses (e.g. DemoDApp)
  allowedSelectors: string[];      // 4-byte function selectors permitted for sponsorship
  active: boolean;
  maxGasPerUserOp: bigint;         // in wei (native USDC 18 decimals)
  dailyBudget: bigint;             // in wei
  spentToday: bigint;
  lastResetDay: number;
}

export interface SponsorshipRequestPayload {
  vaultAddress: string;
  targetContract: string;
  callData: string;
  sender: string;                  // User account / agent address
  maxCost: string;                 // Gas cost limit in wei
  chainId: number;
  nonce?: number;
}

export class PolicyEngine {
  private dAppPolicies: Map<string, DAppPolicy> = new Map();
  private userRateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private processedNonces: Set<string> = new Set();
  private globalEmergencyPaused: boolean = false;

  constructor() {
    // Initialize default registry with verified Arc Testnet contracts
    this.registerDApp({
      vaultAddress: '0x851bD1E5d9CdeD0f183e861dB98157641C826a74'.toLowerCase(),
      targetContracts: ['0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6'.toLowerCase()],
      // purchaseItem() selector: 0xef032d84 or ethers.id("purchaseItem()").slice(0, 10)
      allowedSelectors: [
        ethers.id('purchaseItem()').slice(0, 10),
        '0x' // basic transfers if allowed
      ],
      active: true,
      maxGasPerUserOp: ethers.parseEther('0.01'), // 0.01 USDC max gas per op
      dailyBudget: ethers.parseEther('100.0'),    // 100 USDC daily budget
      spentToday: 0n,
      lastResetDay: Math.floor(Date.now() / 86_400_000)
    });
  }

  public registerDApp(policy: DAppPolicy): void {
    this.dAppPolicies.set(policy.vaultAddress.toLowerCase(), {
      ...policy,
      vaultAddress: policy.vaultAddress.toLowerCase(),
      targetContracts: policy.targetContracts.map(c => c.toLowerCase()),
      spentToday: policy.spentToday || 0n,
      lastResetDay: policy.lastResetDay || Math.floor(Date.now() / 86_400_000)
    });
  }

  public setGlobalEmergencyPause(paused: boolean): void {
    this.globalEmergencyPaused = paused;
  }

  public isEmergencyPaused(): boolean {
    return this.globalEmergencyPaused;
  }

  public getPolicy(vaultAddress: string): DAppPolicy | undefined {
    return this.dAppPolicies.get(vaultAddress.toLowerCase());
  }

  public getAllPolicies(): DAppPolicy[] {
    return Array.from(this.dAppPolicies.values());
  }

  /**
   * Pre-flight evaluation without mutating budget or recording nonces.
   */
  public evaluateDryRun(payload: SponsorshipRequestPayload): { eligible: boolean; reason?: string } {
    if (this.globalEmergencyPaused) {
      return { eligible: false, reason: 'Protocol is in emergency pause mode' };
    }

    const vaultAddr = payload.vaultAddress.toLowerCase();
    const policy = this.dAppPolicies.get(vaultAddr);

    if (!policy || !policy.active) {
      return { eligible: false, reason: `DApp vault ${payload.vaultAddress} is not registered or active` };
    }

    // Check target contract
    const targetAddr = payload.targetContract.toLowerCase();
    if (!policy.targetContracts.includes(targetAddr)) {
      return { eligible: false, reason: `Target contract ${payload.targetContract} is not in the allowed contract whitelist` };
    }

    // Check function selector
    const selector = payload.callData.length >= 10 ? payload.callData.slice(0, 10).toLowerCase() : '0x';
    const isAllowedSelector = policy.allowedSelectors.some(s => s.toLowerCase() === selector || s === '0x');
    if (!isAllowedSelector) {
      return { eligible: false, reason: `Action selector ${selector} is not permitted for sponsorship` };
    }

    // Check gas cost limit
    const requestedCost = BigInt(payload.maxCost || '0');
    if (requestedCost > policy.maxGasPerUserOp) {
      return {
        eligible: false,
        reason: `Requested gas cost (${ethers.formatEther(requestedCost)} USDC) exceeds max allowed per action (${ethers.formatEther(policy.maxGasPerUserOp)} USDC)`
      };
    }

    // Check daily budget
    const currentDay = Math.floor(Date.now() / 86_400_000);
    const spentToday = policy.lastResetDay === currentDay ? policy.spentToday : 0n;
    if (spentToday + requestedCost > policy.dailyBudget) {
      return { eligible: false, reason: 'DApp daily sponsorship budget exceeded' };
    }

    return { eligible: true };
  }

  /**
   * Full policy verification for signed agent requests.
   */
  public evaluateSignedRequest(
    envelope: SignedEnvelope<SponsorshipRequestPayload>
  ): { approved: boolean; error?: string } {
    // 1. Cryptographic Envelope Verification
    const didCheck = AgentIdentity.verifyEnvelope(envelope);
    if (!didCheck.valid) {
      return { approved: false, error: `Identity verification failed: ${didCheck.error}` };
    }

    // 2. Replay check
    if (this.processedNonces.has(envelope.nonce)) {
      return { approved: false, error: `Nonce ${envelope.nonce} has already been used (replay detected)` };
    }

    const payload = envelope.payload;

    // 3. Dry-run logic check
    const dryRun = this.evaluateDryRun(payload);
    if (!dryRun.eligible) {
      return { approved: false, error: dryRun.reason };
    }

    // 4. Rate limiting per agent DID / sender
    const agentKey = envelope.did.toLowerCase();
    const now = Date.now();
    const rate = this.userRateLimits.get(agentKey);

    if (!rate || now > rate.resetTime) {
      this.userRateLimits.set(agentKey, { count: 1, resetTime: now + 60_000 });
    } else {
      if (rate.count >= 20) { // Max 20 actions per minute per agent
        return { approved: false, error: 'Agent rate limit exceeded (maximum 20 sponsorships per minute)' };
      }
      rate.count += 1;
    }

    // 5. Commit budget spend & record nonce
    const vaultAddr = payload.vaultAddress.toLowerCase();
    const policy = this.dAppPolicies.get(vaultAddr)!;
    const currentDay = Math.floor(Date.now() / 86_400_000);

    if (policy.lastResetDay !== currentDay) {
      policy.spentToday = 0n;
      policy.lastResetDay = currentDay;
    }
    policy.spentToday += BigInt(payload.maxCost || '0');
    this.processedNonces.add(envelope.nonce);

    return { approved: true };
  }
}

// Singleton policy engine instance for Auren
export const defaultPolicyEngine = new PolicyEngine();
