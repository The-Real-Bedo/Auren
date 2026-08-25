import { ethers } from 'ethers';
import { PerpetuaSDK } from 'sdk';

async function runPaymasterSigningTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🛡️  RUNNING PAYMASTER SIGNATURE PIPELINE UNIT TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const signerKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const backendSignerWallet = new ethers.Wallet(signerKey);
  const expectedSignerAddress = backendSignerWallet.address.toLowerCase();

  const sdk = new PerpetuaSDK({
    factoryAddress: ethers.ZeroAddress,
    signer: backendSignerWallet
  });

  const paymasterAddress = '0x2a4122372B1A624118Ee3e7D4503B9525CfDE076';
  const chainId = 5042002;

  const baseUserOp = {
    sender: '0x1111111111111111111111111111111111111111',
    nonce: 1,
    initCode: '0x',
    callData: '0xef032d84',
    callGasLimit: 150000,
    verificationGasLimit: 200000,
    preVerificationGas: 50000,
    maxFeePerGas: ethers.parseUnits('10', 'gwei').toString(),
    maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei').toString()
  };

  // Helper to recover signer using the exact Solidity formula in InvestmentPaymaster.sol:
  // bytes32 hash = keccak256(abi.encode(userOp.sender, userOp.nonce, keccak256(userOp.callData), maxCost, block.chainid)).toEthSignedMessageHash();
  function verifyPaymasterSignatureOnChainFormula(op: any, pmAndData: string, entryPointMaxCost: bigint, cId: number): string {
    const rawSig = pmAndData.slice(42); // strip 0x + 20-byte address (40 hex chars)
    const signature = '0x' + rawSig;

    const abiCoder = new ethers.AbiCoder();
    const hash = ethers.keccak256(abiCoder.encode(
      ['address', 'uint256', 'bytes32', 'uint256', 'uint256'],
      [op.sender, BigInt(op.nonce), ethers.keccak256(op.callData), entryPointMaxCost, BigInt(cId)]
    ));

    const ethSignedHash = ethers.hashMessage(ethers.getBytes(hash));
    return ethers.recoverAddress(ethSignedHash, signature).toLowerCase();
  }

  // 1. Positive Test: Canonical Matching UserOp
  console.log('1. Testing canonical matching UserOp signature...');
  const paymasterAndData = await sdk.signUserOp(baseUserOp, paymasterAddress, chainId);

  // EntryPoint computes requiredPreFund: (150k + 200k*3 + 50k) * 10 gwei = 800k * 10 gwei = 0.008 USDC (8000000000000000 wei)
  const canonicalEntryPointMaxCost = (BigInt(baseUserOp.callGasLimit) + BigInt(baseUserOp.verificationGasLimit) * 3n + BigInt(baseUserOp.preVerificationGas)) * BigInt(baseUserOp.maxFeePerGas);

  const recoveredSigner = verifyPaymasterSignatureOnChainFormula(baseUserOp, paymasterAndData, canonicalEntryPointMaxCost, chainId);

  if (recoveredSigner === expectedSignerAddress) {
    console.log(`   ✓ Signer recovered correctly: ${recoveredSigner} == ${expectedSignerAddress}`);
  } else {
    throw new Error(`Test 1 Failed: Expected ${expectedSignerAddress}, got ${recoveredSigner}`);
  }

  // 2. Negative Test: Mutated callData
  console.log('2. Testing failure when callData mutates after signing...');
  const mutatedCallDataOp = { ...baseUserOp, callData: '0xdeadbeef' };
  const recoveredOnMutatedCallData = verifyPaymasterSignatureOnChainFormula(mutatedCallDataOp, paymasterAndData, canonicalEntryPointMaxCost, chainId);
  if (recoveredOnMutatedCallData !== expectedSignerAddress) {
    console.log('   ✓ Mutated callData successfully rejected (recovered != signer)');
  } else {
    throw new Error('Test 2 Failed: Mutated callData unexpectedly accepted');
  }

  // 3. Negative Test: Mutated gas limits (causes EntryPoint requiredPreFund mismatch)
  console.log('3. Testing failure when gas limits mutate after signing...');
  const mutatedGasLimitOp = { ...baseUserOp, callGasLimit: 200000 };
  const mutatedEntryPointMaxCost = (BigInt(mutatedGasLimitOp.callGasLimit) + BigInt(mutatedGasLimitOp.verificationGasLimit) * 3n + BigInt(mutatedGasLimitOp.preVerificationGas)) * BigInt(mutatedGasLimitOp.maxFeePerGas);
  const recoveredOnMutatedGas = verifyPaymasterSignatureOnChainFormula(mutatedGasLimitOp, paymasterAndData, mutatedEntryPointMaxCost, chainId);
  if (recoveredOnMutatedGas !== expectedSignerAddress) {
    console.log('   ✓ Mutated gas limits successfully rejected (recovered != signer)');
  } else {
    throw new Error('Test 3 Failed: Mutated gas limits unexpectedly accepted');
  }

  // 4. AA34 Reproduction Test: Hardcoded/Overridden maxCost
  console.log('4. Reproducing AA34 root cause: Backend signing overridden maxCost (0.01 USDC) vs EntryPoint maxCost (0.008 USDC)...');
  // If backend used a hardcoded maxCost (e.g. 0.01 USDC = 10^16 wei)
  const overriddenMaxCost = ethers.parseEther('0.01');
  const abiCoder = new ethers.AbiCoder();
  const badHash = ethers.keccak256(abiCoder.encode(
    ['address', 'uint256', 'bytes32', 'uint256', 'uint256'],
    [baseUserOp.sender, BigInt(baseUserOp.nonce), ethers.keccak256(baseUserOp.callData), overriddenMaxCost, BigInt(chainId)]
  ));
  const badSig = await backendSignerWallet.signMessage(ethers.getBytes(badHash));
  const badPmAndData = ethers.concat([paymasterAddress, badSig]);

  // When EntryPoint verifies with actual requiredPreFund (0.008 USDC)
  const recoveredOnAA34 = verifyPaymasterSignatureOnChainFormula(baseUserOp, badPmAndData, canonicalEntryPointMaxCost, chainId);

  if (recoveredOnAA34 !== expectedSignerAddress) {
    console.log(`   ✓ AA34 reproduced: Recovered ${recoveredOnAA34} != Authorized Signer ${expectedSignerAddress}`);
    console.log('   ✓ Digest signed:   keccak256(abi.encode(sender, nonce, callDataHash, 0.01 USDC, chainId))');
    console.log('   ✓ Digest verified: keccak256(abi.encode(sender, nonce, callDataHash, 0.008 USDC, chainId))');
    console.log('   ✓ Field mismatch:  maxCost parameter in ABI-encoded tuple');
  } else {
    throw new Error('Test 4 Failed: Bad signature unexpectedly verified');
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL PAYMASTER SIGNATURE PIPELINE TESTS PASSED');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runPaymasterSigningTests().catch(e => {
  console.error(e);
  process.exit(1);
});
