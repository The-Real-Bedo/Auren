import { ethers, BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import { CONTRACTS, ARC_TESTNET_CHAIN_ID } from '../config/contracts';
import { getApiUrl } from '../config/api';

export const ENTRY_POINT_ABI = [
  'function getNonce(address,uint192) view returns (uint256)',
  'function getUserOpHash(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp) view returns (bytes32)',
  'function balanceOf(address account) view returns (uint256)'
];

export const FACTORY_ABI = [
  'function getAddress(address owner, uint256 salt) view returns (address)',
  'function createAccount(address owner, uint256 salt) returns (address)'
];

export const ACCOUNT_ABI = [
  'function execute(address,uint256,bytes) external'
];

export const DAPP_ABI = [
  'function purchaseItem() external payable',
  'function purchases(address) view returns (uint256)',
  'function splitter() view returns (address)'
];

export const VAULT_ABI = [
  'function totalValue() view returns (uint256)',
  'function unrecoveredCapital() view returns (uint256)',
  'function totalGasDeployed() view returns (uint256)',
  'function totalCapitalRecovered() view returns (uint256)',
  'function developer() view returns (address)'
];

export interface SharedERC4337Result {
  txHash: string;
  userOpHash: string;
  blockNumber: number;
  gasUsed: string;
  paymasterGasPaid: string;
  userGasPaid: string;
  smartAccount: string;
  userEOA: string;
  isFirstDeployment: boolean;
  purchaseValue: string;
  purchasesBefore: string;
  purchasesAfter: string;
  tvlBefore: string;
  tvlAfter: string;
  unrecoveredCapital: string;
  totalCapitalRecovered: string;
  timestamp: number;
}

export async function getSmartAccountAddress(
  ownerAddress: string,
  salt = 0,
  provider?: JsonRpcProvider | BrowserProvider
): Promise<string> {
  const config = CONTRACTS[ARC_TESTNET_CHAIN_ID];
  const rpcProvider = provider || new JsonRpcProvider(config.rpc);
  const factory = new Contract(config.accountFactory, FACTORY_ABI, rpcProvider);
  return factory.getFunction('getAddress')(ownerAddress, salt);
}

export async function checkAccountDeployed(
  accountAddress: string,
  provider?: JsonRpcProvider | BrowserProvider
): Promise<boolean> {
  const config = CONTRACTS[ARC_TESTNET_CHAIN_ID];
  const rpcProvider = provider || new JsonRpcProvider(config.rpc);
  const code = await rpcProvider.getCode(accountAddress);
  return code.length > 2;
}

export interface ExecuteSponsoredActionParams {
  provider: BrowserProvider;
  ownerAddress: string;
  targetContractAddress?: string;
  actionCallData?: string;
  purchaseValueWei?: bigint;
  onStepChange?: (step: string, detail: string) => void;
}

export async function executeSponsoredAction(
  params: ExecuteSponsoredActionParams
): Promise<SharedERC4337Result> {
  const {
    provider,
    ownerAddress,
    targetContractAddress,
    actionCallData,
    purchaseValueWei = 0n,
    onStepChange = () => {}
  } = params;

  const config = CONTRACTS[ARC_TESTNET_CHAIN_ID];
  const arcRpcProvider = new JsonRpcProvider(config.rpc);

  const targetContract = targetContractAddress || config.demoDApp;
  const dappInterface = new ethers.Interface(DAPP_ABI);
  const callDataToExecute = actionCallData || dappInterface.encodeFunctionData('purchaseItem');

  // 1. Derive Smart Account
  onStepChange('preparing', 'Deriving counterfactual Smart Account address...');
  const factoryContract = new Contract(config.accountFactory, FACTORY_ABI, arcRpcProvider);
  const entryPoint = new Contract(config.entryPoint, ENTRY_POINT_ABI, arcRpcProvider);
  const vaultContract = new Contract(config.vault, VAULT_ABI, arcRpcProvider);
  const dappContract = new Contract(targetContract, DAPP_ABI, arcRpcProvider);

  const sa: string = await factoryContract.getFunction('getAddress')(ownerAddress, 0);
  const isDeployed = await checkAccountDeployed(sa, arcRpcProvider);

  // Read Pre-Execution Metrics
  const [tvlBefore, purchasesBefore, paymasterDepositBefore] = await Promise.all([
    vaultContract.totalValue(),
    dappContract.purchases(sa).catch(() => BigInt(0)),
    entryPoint.balanceOf(config.paymaster)
  ]);

  // 2. Fetch Live Network Fees & Compute Optimized Gas Envelope
  onStepChange('sponsoring', 'Evaluating network gas & requesting Auren sponsorship...');
  const [feeData, latestBlock] = await Promise.all([
    arcRpcProvider.getFeeData(),
    arcRpcProvider.getBlock('latest').catch(() => null)
  ]);
  const baseFee = latestBlock?.baseFeePerGas || feeData.gasPrice || ethers.parseUnits('20', 'gwei');
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits('1', 'gwei');
  const dynamicMaxFee = (baseFee * 110n) / 100n + maxPriorityFeePerGas;
  const maxFeePerGas = dynamicMaxFee > ethers.parseUnits('25', 'gwei') ? ethers.parseUnits('25', 'gwei') : dynamicMaxFee;

  const callGasLimit = '100000';
  const verificationGasLimit = isDeployed ? '80000' : '100000';
  const preVerificationGas = '30000';

  const gasUnitsTotal = BigInt(callGasLimit) + BigInt(verificationGasLimit) * 3n + BigInt(preVerificationGas);
  const computedCostWei = gasUnitsTotal * maxFeePerGas;
  const maxPolicyBudgetWei = ethers.parseEther('0.01'); // 0.01 USDC hard cap

  if (computedCostWei > maxPolicyBudgetWei) {
    throw new Error("Current network fee estimate exceeds Auren's sponsorship limit. Please try again shortly.");
  }

  // 3. Pre-fund Smart Account if executing value transfer
  if (purchaseValueWei > 0n) {
    const saBal = await arcRpcProvider.getBalance(sa);
    if (saBal < purchaseValueWei) {
      onStepChange('preparing', `Depositing ${ethers.formatEther(purchaseValueWei)} USDC into Smart Account for item price...`);
      const signer = await provider.getSigner();
      const fundTx = await signer.sendTransaction({
        to: sa,
        value: purchaseValueWei
      });
      await fundTx.wait(1);
    }
  }

  // 4. Build UserOperation
  const factoryInterface = new ethers.Interface(FACTORY_ABI);
  const accountInterface = new ethers.Interface(ACCOUNT_ABI);

  const initCode = isDeployed
    ? '0x'
    : ethers.concat([config.accountFactory, factoryInterface.encodeFunctionData('createAccount', [ownerAddress, 0])]);

  const executeCallData = accountInterface.encodeFunctionData('execute', [
    targetContract,
    purchaseValueWei,
    callDataToExecute
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

  // Request Paymaster Signature from Backend Policy Engine
  const sponsorRes = await fetch(getApiUrl('/sponsor'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userOp,
      paymasterAddress: config.paymaster,
      vaultAddress: config.vault,
      chainId: ARC_TESTNET_CHAIN_ID,
    }),
  });

  const sponsorData = await sponsorRes.json();
  if (!sponsorRes.ok || !sponsorData.paymasterAndData) {
    throw new Error(sponsorData.error || 'Sponsorship authorization rejected by Auren Policy Engine');
  }
  userOp.paymasterAndData = sponsorData.paymasterAndData;

  // 5. Sign UserOperation Hash with User EOA
  onStepChange('signing', 'Please approve the zero-gas UserOperation signature in your wallet...');
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

  // 6. Submit UserOp via Relayer
  onStepChange('submitting', 'Submitting sponsored UserOperation to Relayer → EntryPoint.handleOps()...');
  const submitRes = await fetch(getApiUrl('/agent/submit-userop'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userOp,
      chainId: ARC_TESTNET_CHAIN_ID,
      entryPointAddress: config.entryPoint,
      paymasterAddress: config.paymaster,
    }),
  });

  const submitData = await submitRes.json();
  if (!submitRes.ok || !submitData.success) {
    const detail = submitData.revertReason ? `: ${submitData.revertReason}` : (submitData.error ? `: ${submitData.error}` : '');
    throw new Error(`Relayer execution failed${detail}`);
  }

  // 7. Verify Post-Execution On-Chain State
  onStepChange('confirming', 'Confirming on-chain settlement & economic distribution...');
  const [tvlAfter, purchasesAfter, paymasterDepositAfter, unrecoveredCapital, totalCapitalRecovered] = await Promise.all([
    vaultContract.totalValue(),
    dappContract.purchases(sa).catch(() => BigInt(0)),
    entryPoint.balanceOf(config.paymaster),
    vaultContract.unrecoveredCapital(),
    vaultContract.totalCapitalRecovered()
  ]);

  const gasPaid = paymasterDepositBefore > paymasterDepositAfter
    ? paymasterDepositBefore - paymasterDepositAfter
    : BigInt(0);

  return {
    txHash: submitData.txHash,
    userOpHash: submitData.userOpHash || userOpHash,
    blockNumber: submitData.blockNumber,
    gasUsed: submitData.gasUsed ? submitData.gasUsed.toString() : '0',
    paymasterGasPaid: ethers.formatEther(gasPaid),
    userGasPaid: '0.00',
    smartAccount: sa,
    userEOA: ownerAddress,
    isFirstDeployment: !isDeployed,
    purchaseValue: ethers.formatEther(purchaseValueWei),
    purchasesBefore: purchasesBefore.toString(),
    purchasesAfter: purchasesAfter.toString(),
    tvlBefore: ethers.formatEther(tvlBefore),
    tvlAfter: ethers.formatEther(tvlAfter),
    unrecoveredCapital: ethers.formatEther(unrecoveredCapital),
    totalCapitalRecovered: ethers.formatEther(totalCapitalRecovered),
    timestamp: Date.now()
  };
}
