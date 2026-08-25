import { ethers } from 'ethers';
import { AgentIdentity } from '../identity/didKey';
import { AurenTools } from '../tools/aurenTools';
import { TechnoCoreClient } from '../technocore/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DAPP_ABI = [
  'function purchaseItem() external payable',
  'function purchases(address) view returns (uint256)',
  'function splitter() view returns (address)'
];

const VAULT_ABI = [
  'function totalValue() view returns (uint256)',
  'function unrecoveredCapital() view returns (uint256)',
  'function totalGasDeployed() view returns (uint256)',
  'function totalCapitalRecovered() view returns (uint256)',
  'function totalSupplyShares() view returns (uint256)',
  'function lpShares(address) view returns (uint256)',
  'function lpProfitShareBps() view returns (uint256)'
];

export async function runRealArcE2E() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🚀 FINAL REAL ARC TESTNET USER AGENT E2E EXECUTION');
  console.log('════════════════════════════════════════════════════════════════\n');

  const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Use DEPLOYER_PRIVATE_KEY as the funding wallet on Arc Testnet
  const userPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!userPrivateKey) {
    throw new Error('Missing DEPLOYER_PRIVATE_KEY in .env');
  }
  const userWallet = new ethers.Wallet(userPrivateKey, provider);

  const technocore = new TechnoCoreClient();
  const agent = new AgentIdentity();
  const tools = new AurenTools(RPC_URL);

  console.log(`[Step 1] Initialized TechnoCore Agent Identity:`);
  console.log(`         DID:           ${agent.did}`);
  console.log(`         User Account:  ${userWallet.address}`);
  const userBalance = await provider.getBalance(userWallet.address);
  console.log(`         User Balance:  ${ethers.formatEther(userBalance)} USDC\n`);

  // Step 2: Discovery
  console.log(`[Step 2] Agent Discovery via Auren (list_opportunities)...`);
  const opportunities = await tools.listOpportunities();
  const targetDApp = opportunities[0];
  console.log(`         Discovered:    ${targetDApp.name} (${targetDApp.id})`);
  console.log(`         Vault:         ${targetDApp.vaultAddress}`);
  console.log(`         Target DApp:   ${targetDApp.targetContract}`);
  console.log(`         Paymaster:     ${targetDApp.paymasterAddress}`);
  console.log(`         Splitter:      ${targetDApp.splitterAddress}`);
  console.log(`         Chain ID:      ${targetDApp.chainId}\n`);

  // Step 3: Record Before State
  console.log(`[Step 3] Querying Pre-Execution On-Chain State...`);
  const vaultContract = new ethers.Contract(targetDApp.vaultAddress, VAULT_ABI, provider);
  const dappContract = new ethers.Contract(targetDApp.targetContract, DAPP_ABI, userWallet);

  const [tvlBefore, gasBefore, recBefore, unrecBefore, purchasesBefore] = await Promise.all([
    vaultContract.totalValue(),
    vaultContract.totalGasDeployed(),
    vaultContract.totalCapitalRecovered(),
    vaultContract.unrecoveredCapital(),
    dappContract.purchases(userWallet.address)
  ]);

  console.log(`         TVL Before:                 ${ethers.formatEther(tvlBefore)} USDC`);
  console.log(`         Gas Deployed Before:        ${ethers.formatEther(gasBefore)} USDC`);
  console.log(`         Capital Recovered Before:   ${ethers.formatEther(recBefore)} USDC`);
  console.log(`         Unrecovered Capital Before: ${ethers.formatEther(unrecBefore)} USDC`);
  console.log(`         User Purchases Before:      ${purchasesBefore.toString()}\n`);

  // Step 4: Sponsorship Policy Check
  const dappInterface = new ethers.Interface(DAPP_ABI);
  const callData = dappInterface.encodeFunctionData('purchaseItem');
  const maxGasCost = ethers.parseEther('0.005').toString();

  const sponsorshipPayload = {
    vaultAddress: targetDApp.vaultAddress,
    targetContract: targetDApp.targetContract,
    callData,
    sender: userWallet.address,
    maxCost: maxGasCost,
    chainId: targetDApp.chainId
  };

  console.log(`[Step 4] Pre-Flight Policy Verification (check_sponsorship)...`);
  const preFlight = await tools.checkSponsorship(sponsorshipPayload);
  if (!preFlight.eligible) {
    throw new Error(`Sponsorship rejected by Policy Engine: ${preFlight.reason}`);
  }
  console.log(`         Policy Check Result:  ✅ APPROVED (Max Gas: ${preFlight.maxGasCostUsdc} USDC)\n`);

  // Step 5: Signed Intent & Paymaster Authorization
  console.log(`[Step 5] Signing Action Intent with TechnoCore did:key...`);
  const signedEnvelope = await agent.signPayload('requestSponsorship', sponsorshipPayload);
  console.log(`         Nonce:        ${signedEnvelope.nonce}`);
  console.log(`         Signature:    ${signedEnvelope.signature.slice(0, 24)}…`);

  const sponsorshipAuth = await tools.requestSponsorship(signedEnvelope);
  if (!sponsorshipAuth.approved) {
    throw new Error(`Sponsorship authorization failed: ${sponsorshipAuth.error}`);
  }
  console.log(`         Paymaster Authorization Generated: ✅`);
  console.log(`         paymasterAndData: ${sponsorshipAuth.paymasterAndData?.slice(0, 32)}…\n`);

  // Step 6: Execute Real On-Chain Transaction on Arc Testnet
  const purchaseValue = ethers.parseEther('5.0'); // 5 USDC item purchase
  console.log(`[Step 6] Broadcasting Real Transaction to Arc Testnet...`);
  console.log(`         Invoking: ${targetDApp.targetContract}.purchaseItem{value: 5.0 USDC}()`);

  const tx = await dappContract.purchaseItem({ value: purchaseValue });
  console.log(`         Transaction Hash: ${tx.hash}`);
  console.log(`         Waiting for confirmation on Arc Testnet (Chain 5042002)…`);

  const receipt = await tx.wait(1);
  console.log(`         ✅ Transaction Confirmed in Block #${receipt.blockNumber}`);
  console.log(`         Gas Used:         ${receipt.gasUsed.toString()}`);
  console.log(`         Effective Price:  ${ethers.formatUnits(receipt.gasPrice || 0n, 'gwei')} Gwei\n`);

  // Step 7: Record After State
  console.log(`[Step 7] Querying Post-Execution On-Chain State...`);
  const [tvlAfter, gasAfter, recAfter, unrecAfter, purchasesAfter] = await Promise.all([
    vaultContract.totalValue(),
    vaultContract.totalGasDeployed(),
    vaultContract.totalCapitalRecovered(),
    vaultContract.unrecoveredCapital(),
    dappContract.purchases(userWallet.address)
  ]);

  console.log(`         TVL After:                 ${ethers.formatEther(tvlAfter)} USDC`);
  console.log(`         Gas Deployed After:        ${ethers.formatEther(gasAfter)} USDC`);
  console.log(`         Capital Recovered After:   ${ethers.formatEther(recAfter)} USDC`);
  console.log(`         Unrecovered Capital After: ${ethers.formatEther(unrecAfter)} USDC`);
  console.log(`         User Purchases After:      ${purchasesAfter.toString()}\n`);

  // Step 8: TechnoCore Synchronization
  console.log(`[Step 8] Synchronizing Execution State to TechnoCore...`);
  await technocore.say(
    'auren-ops',
    'technocore-agent',
    `[Arc TX CONFIRMED] Block #${receipt.blockNumber} | TX: ${tx.hash.slice(0, 16)}… | TVL: ${ethers.formatEther(tvlAfter)} USDC`
  );

  const e2eRecord = {
    agentDid: agent.did,
    action: 'purchaseItem',
    targetDApp: targetDApp.name,
    targetContract: targetDApp.targetContract,
    vault: targetDApp.vaultAddress,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    purchaseValue: '5.0 USDC',
    tvlBefore: ethers.formatEther(tvlBefore),
    tvlAfter: ethers.formatEther(tvlAfter),
    timestamp: Date.now()
  };

  await technocore.setNote('auren-agents', agent.did, JSON.stringify(e2eRecord));
  await technocore.setNote('auren-tx', tx.hash.toLowerCase(), JSON.stringify(e2eRecord));

  console.log(`         TechnoCore Room Broadcast: /r/auren-ops (✅)`);
  console.log(`         TechnoCore Notes Persisted: /kv/auren-agents/${agent.did.slice(0, 20)}… (✅)\n`);

  console.log('════════════════════════════════════════════════════════════════');
  console.log('🎉 FULL REAL ARC TESTNET USER AGENT E2E EXECUTION COMPLETE!');
  console.log('════════════════════════════════════════════════════════════════\n');

  return {
    success: true,
    agentDid: agent.did,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    tvlBefore: ethers.formatEther(tvlBefore),
    tvlAfter: ethers.formatEther(tvlAfter),
    gasBefore: ethers.formatEther(gasBefore),
    gasAfter: ethers.formatEther(gasAfter),
    recBefore: ethers.formatEther(recBefore),
    recAfter: ethers.formatEther(recAfter),
    unrecBefore: ethers.formatEther(unrecBefore),
    unrecAfter: ethers.formatEther(unrecAfter),
    purchasesBefore: purchasesBefore.toString(),
    purchasesAfter: purchasesAfter.toString()
  };
}

if (require.main === module) {
  runRealArcE2E().catch(err => {
    console.error('E2E Real Arc Execution Failed:', err);
    process.exit(1);
  });
}
