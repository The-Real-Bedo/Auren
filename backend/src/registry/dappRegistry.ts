import { ethers } from 'ethers';

export interface RegisteredDApp {
  id: string;
  name: string;
  chainId: number;
  entryPointAddress: string;
  paymasterAddress: string;
  vaultAddress: string;
  targetContract: string;
  allowedSelectors: string[];
  maxActionValueWei: bigint;
  maxGasPerUserOpWei: bigint;
  dailyBudgetWei: bigint;
  active: boolean;
}

// Server-side authoritative DApp Registry
export const DAPP_REGISTRY: Record<string, RegisteredDApp> = {
  // Arc Testnet Active DemoDApp
  '0x851bd1e5d9cded0f183e861db98157641c826a74': {
    id: 'demo-marketplace-arc',
    name: 'Digital Marketplace (Arc Testnet)',
    chainId: 5042002,
    entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'.toLowerCase(),
    paymasterAddress: '0x2a4122372B1A624118Ee3e7D4503B9525CfDE076'.toLowerCase(),
    vaultAddress: '0x851bD1E5d9CdeD0f183e861dB98157641C826a74'.toLowerCase(),
    targetContract: '0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6'.toLowerCase(),
    allowedSelectors: [
      '0xef032d84', // purchaseItem()
      ethers.id('purchaseItem()').slice(0, 10).toLowerCase()
    ],
    maxActionValueWei: ethers.parseEther('10.0'), // 10 USDC max purchase value
    maxGasPerUserOpWei: ethers.parseEther('0.05'), // 0.05 USDC max gas
    dailyBudgetWei: ethers.parseEther('100.0'),     // 100 USDC daily budget
    active: true
  },
  // Local Anvil Dev DApp
  '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512': {
    id: 'demo-marketplace-local',
    name: 'Digital Marketplace (Local Dev)',
    chainId: 31337,
    entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'.toLowerCase(),
    paymasterAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'.toLowerCase(),
    vaultAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'.toLowerCase(),
    targetContract: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'.toLowerCase(),
    allowedSelectors: [
      '0xef032d84',
      ethers.id('purchaseItem()').slice(0, 10).toLowerCase()
    ],
    maxActionValueWei: ethers.parseEther('10.0'),
    maxGasPerUserOpWei: ethers.parseEther('0.05'),
    dailyBudgetWei: ethers.parseEther('100.0'),
    active: true
  }
};

const ACCOUNT_EXECUTE_INTERFACE = new ethers.Interface([
  'function execute(address dest, uint256 value, bytes func)'
]);

export interface DecodedExecution {
  targetContract: string;
  valueWei: bigint;
  functionSelector: string;
  innerCalldata: string;
}

/**
 * Decodes and validates UserOperation calldata.
 * Supports both SmartAccount.execute(dest, value, func) wrapper and direct contract calldata.
 */
export function decodeUserOpCalldata(callDataHex: string): DecodedExecution {
  if (!callDataHex || callDataHex === '0x') {
    return {
      targetContract: ethers.ZeroAddress,
      valueWei: 0n,
      functionSelector: '0x',
      innerCalldata: '0x'
    };
  }

  try {
    const parsed = ACCOUNT_EXECUTE_INTERFACE.parseTransaction({ data: callDataHex });
    if (parsed && parsed.name === 'execute') {
      const dest = (parsed.args[0] as string).toLowerCase();
      const valueWei = BigInt(parsed.args[1] || 0);
      const innerFunc = (parsed.args[2] as string) || '0x';
      const selector = innerFunc.length >= 10 ? innerFunc.slice(0, 10).toLowerCase() : '0x';

      return {
        targetContract: dest,
        valueWei,
        functionSelector: selector,
        innerCalldata: innerFunc
      };
    }
  } catch {
    // If not encoded as execute(), extract top-level selector
  }

  const selector = callDataHex.length >= 10 ? callDataHex.slice(0, 10).toLowerCase() : '0x';
  return {
    targetContract: ethers.ZeroAddress,
    valueWei: 0n,
    functionSelector: selector,
    innerCalldata: callDataHex
  };
}

export function validateSponsorshipAgainstRegistry(params: {
  vaultAddress: string;
  paymasterAddress: string;
  chainId: number;
  callData: string;
  maxCostWei: bigint;
}): { valid: boolean; error?: string; registeredDApp?: RegisteredDApp } {
  const vaultKey = (params.vaultAddress || '').toLowerCase();
  const dApp = DAPP_REGISTRY[vaultKey];

  if (!dApp) {
    return { valid: false, error: `DApp vault ${params.vaultAddress} is not registered in Auren Registry` };
  }

  if (!dApp.active) {
    return { valid: false, error: `DApp ${dApp.name} is currently inactive` };
  }

  if (dApp.chainId !== Number(params.chainId)) {
    return { valid: false, error: `Chain ID mismatch: expected ${dApp.chainId}, received ${params.chainId}` };
  }

  if (dApp.paymasterAddress.toLowerCase() !== (params.paymasterAddress || '').toLowerCase()) {
    return { valid: false, error: `Paymaster address ${params.paymasterAddress} does not match registered paymaster ${dApp.paymasterAddress}` };
  }

  if (params.maxCostWei > dApp.maxGasPerUserOpWei) {
    return {
      valid: false,
      error: `Requested gas cost (${ethers.formatEther(params.maxCostWei)} USDC) exceeds max limit (${ethers.formatEther(dApp.maxGasPerUserOpWei)} USDC)`
    };
  }

  const decoded = decodeUserOpCalldata(params.callData);

  if (decoded.targetContract !== ethers.ZeroAddress && decoded.targetContract !== dApp.targetContract) {
    return {
      valid: false,
      error: `Execution destination ${decoded.targetContract} is not authorized for DApp ${dApp.name} (authorized: ${dApp.targetContract})`
    };
  }

  const isAllowed = dApp.allowedSelectors.some(s => s.toLowerCase() === decoded.functionSelector);
  if (!isAllowed) {
    return {
      valid: false,
      error: `Function selector ${decoded.functionSelector} is not permitted for sponsorship by DApp ${dApp.name}`
    };
  }

  if (decoded.valueWei > dApp.maxActionValueWei) {
    return {
      valid: false,
      error: `Action value ${ethers.formatEther(decoded.valueWei)} USDC exceeds maximum permitted action value (${ethers.formatEther(dApp.maxActionValueWei)} USDC)`
    };
  }

  return { valid: true, registeredDApp: dApp };
}
