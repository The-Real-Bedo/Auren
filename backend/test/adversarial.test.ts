import { app } from '../src/index';
import request from 'supertest';
import { ethers } from 'ethers';
import { defaultPolicyStore } from '../src/storage/policyStore';

// Setup Mock Env
process.env.BACKEND_SIGNER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
process.env.RELAYER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
process.env.FACTORY_ADDRESS = ethers.ZeroAddress;

async function runAdversarialTestSuite() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🛡️  RUNNING AUREN BACKEND ADVERSARIAL SECURITY TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  defaultPolicyStore.resetStore();

  const validVault = '0x851bD1E5d9CdeD0f183e861dB98157641C826a74';
  const validPaymaster = '0x2a4122372B1A624118Ee3e7D4503B9525CfDE076';
  const validTarget = '0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6';
  const validChainId = 5042002;
  const validEntryPoint = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

  const dappIface = new ethers.Interface(['function purchaseItem() external payable']);
  const accountIface = new ethers.Interface(['function execute(address dest, uint256 value, bytes func)']);

  const validActionCalldata = dappIface.encodeFunctionData('purchaseItem');
  const validCallData = accountIface.encodeFunctionData('execute', [
    validTarget,
    ethers.parseEther('0.05'),
    validActionCalldata
  ]);

  const baseUserOp = {
    sender: '0x3333333333333333333333333333333333333333',
    nonce: 0,
    initCode: '0x',
    callData: validCallData,
    callGasLimit: 200000,
    verificationGasLimit: 350000,
    preVerificationGas: 60000,
    maxFeePerGas: ethers.parseUnits('30', 'gwei').toString(),
    maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei').toString()
  };

  // ── TEST 1: Missing Required Fields ─────────────────────────
  console.log('1. Testing missing required fields...');
  await request(app)
    .post('/sponsor')
    .send({})
    .expect(400);
  console.log('   ✓ Rejected missing fields with HTTP 400');

  // ── TEST 2: Unregistered / Forged DApp Vault ─────────────────
  console.log('2. Testing unregistered / forged DApp vault rejection...');
  const res2 = await request(app)
    .post('/sponsor')
    .send({
      userOp: baseUserOp,
      paymasterAddress: validPaymaster,
      vaultAddress: '0x0000000000000000000000000000000000000bad',
      chainId: validChainId
    })
    .expect(403);
  if (res2.body.error && res2.body.error.includes('not registered')) {
    console.log('   ✓ Unregistered DApp rejected with HTTP 403');
  } else {
    throw new Error('Test 2 failed: ' + JSON.stringify(res2.body));
  }

  // ── TEST 3: Forged Paymaster Address ─────────────────────────
  console.log('3. Testing forged paymaster address rejection...');
  const res3 = await request(app)
    .post('/sponsor')
    .send({
      userOp: baseUserOp,
      paymasterAddress: '0x0000000000000000000000000000000000000bad',
      vaultAddress: validVault,
      chainId: validChainId
    })
    .expect(403);
  if (res3.body.error && res3.body.error.includes('Paymaster address')) {
    console.log('   ✓ Forged paymaster address rejected with HTTP 403');
  } else {
    throw new Error('Test 3 failed: ' + JSON.stringify(res3.body));
  }

  // ── TEST 4: Wrong Chain ID ───────────────────────────────────
  console.log('4. Testing wrong chainId rejection...');
  const res4 = await request(app)
    .post('/sponsor')
    .send({
      userOp: baseUserOp,
      paymasterAddress: validPaymaster,
      vaultAddress: validVault,
      chainId: 1 // Ethereum Mainnet instead of Arc Testnet
    })
    .expect(403);
  if (res4.body.error && res4.body.error.includes('Chain ID mismatch')) {
    console.log('   ✓ Wrong chainId rejected with HTTP 403');
  } else {
    throw new Error('Test 4 failed: ' + JSON.stringify(res4.body));
  }

  // ── TEST 5: Unauthorized Target Contract ─────────────────────
  console.log('5. Testing unauthorized target contract execution...');
  const attackerTargetCalldata = accountIface.encodeFunctionData('execute', [
    '0x0000000000000000000000000000000000000bad', // Unauthorized target
    ethers.parseEther('0.05'),
    validActionCalldata
  ]);
  const res5 = await request(app)
    .post('/sponsor')
    .send({
      userOp: { ...baseUserOp, callData: attackerTargetCalldata },
      paymasterAddress: validPaymaster,
      vaultAddress: validVault,
      chainId: validChainId
    })
    .expect(403);
  if (res5.body.error && res5.body.error.includes('not authorized')) {
    console.log('   ✓ Unauthorized execution target rejected with HTTP 403');
  } else {
    throw new Error('Test 5 failed: ' + JSON.stringify(res5.body));
  }

  // ── TEST 6: Unauthorized Function Selector ───────────────────
  console.log('6. Testing unauthorized function selector rejection...');
  const drainCalldata = accountIface.encodeFunctionData('execute', [
    validTarget,
    ethers.parseEther('0.05'),
    '0xdeadbeef12345678' // Arbitrary selector
  ]);
  const res6 = await request(app)
    .post('/sponsor')
    .send({
      userOp: { ...baseUserOp, callData: drainCalldata },
      paymasterAddress: validPaymaster,
      vaultAddress: validVault,
      chainId: validChainId
    })
    .expect(403);
  if (res6.body.error && res6.body.error.includes('selector')) {
    console.log('   ✓ Unauthorized function selector rejected with HTTP 403');
  } else {
    throw new Error('Test 6 failed: ' + JSON.stringify(res6.body));
  }

  // ── TEST 7: Excessive Gas Limit Requested ───────────────────
  console.log('7. Testing excessive gas limit rejection...');
  const res7 = await request(app)
    .post('/sponsor')
    .send({
      userOp: { ...baseUserOp, maxFeePerGas: ethers.parseUnits('1000', 'gwei').toString() }, // Huge fee
      paymasterAddress: validPaymaster,
      vaultAddress: validVault,
      chainId: validChainId
    })
    .expect(403);
  if (res7.body.error && res7.body.error.includes('exceeds max limit')) {
    console.log('   ✓ Excessive gas cost rejected with HTTP 403');
  } else {
    throw new Error('Test 7 failed: ' + JSON.stringify(res7.body));
  }

  // ── TEST 8: Successful Legitimate Sponsorship ─────────────────
  console.log('8. Testing legitimate sponsorship authorization...');
  const res8 = await request(app)
    .post('/sponsor')
    .send({
      userOp: baseUserOp,
      paymasterAddress: validPaymaster,
      vaultAddress: validVault,
      chainId: validChainId
    })
    .expect(200);
  if (res8.body.paymasterAndData && res8.body.paymasterAndData.startsWith(validPaymaster.toLowerCase())) {
    console.log('   ✓ Valid paymasterAndData generated:', res8.body.paymasterAndData.slice(0, 32) + '…');
    console.log('   ✓ Remaining daily budget:', res8.body.remainingDailyBudgetUsdc, 'USDC');
  } else {
    throw new Error('Test 8 failed: ' + JSON.stringify(res8.body));
  }

  // ── TEST 9: Daily Budget Exhaustion Enforcement ──────────────
  console.log('9. Testing daily budget exhaustion enforcement...');
  // Force spend remaining budget so next action exceeds 100 USDC limit
  defaultPolicyStore.atomicSpendBudget(validVault, ethers.parseEther('99.95'), ethers.parseEther('100.0'));

  const res9 = await request(app)
    .post('/sponsor')
    .send({
      userOp: baseUserOp,
      paymasterAddress: validPaymaster,
      vaultAddress: validVault,
      chainId: validChainId
    })
    .expect(429);
  if (res9.body.error && res9.body.error.includes('budget exceeded')) {
    console.log('   ✓ Budget exhaustion enforced with HTTP 429');
  } else {
    throw new Error('Test 9 failed: ' + JSON.stringify(res9.body));
  }

  // ── TEST 10: Relayer Simulation Rejection ─────────────────────
  console.log('10. Testing relayer pre-simulation failure handling...');
  const invalidUserOp = {
    ...baseUserOp,
    paymasterAndData: '0x' + '00'.repeat(85),
    signature: '0x' + '00'.repeat(65)
  };
  const res10 = await request(app)
    .post('/agent/submit-userop')
    .send({
      userOp: invalidUserOp,
      chainId: validChainId,
      entryPointAddress: validEntryPoint,
      paymasterAddress: validPaymaster
    })
    .expect(400);
  if (res10.body.error && res10.body.error.includes('pre-simulation failed')) {
    console.log('   ✓ Invalid UserOp blocked during pre-simulation without broadcasting to chain');
  } else {
    throw new Error('Test 10 failed: ' + JSON.stringify(res10.body));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL 10 ADVERSARIAL BACKEND TESTS PASSED (0 FAILURES)');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runAdversarialTestSuite().catch((err) => {
  console.error('Adversarial test error:', err);
  process.exit(1);
});
