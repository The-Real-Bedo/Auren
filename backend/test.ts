import { app } from './src/index';
import request from 'supertest';
import { ethers } from 'ethers';
import { defaultPolicyStore } from './src/storage/policyStore';

// Setup Mock Env
process.env.BACKEND_SIGNER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
process.env.RELAYER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
process.env.FACTORY_ADDRESS = ethers.ZeroAddress;

async function runTests() {
    console.log("Starting backend unit tests...");
    defaultPolicyStore.resetStore();

    const vaultAddress = "0x851bD1E5d9CdeD0f183e861dB98157641C826a74";
    const paymasterAddress = "0x2a4122372B1A624118Ee3e7D4503B9525CfDE076";
    const targetAddress = "0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6";
    const chainId = 5042002;

    const dappIface = new ethers.Interface(['function purchaseItem() external payable']);
    const accountIface = new ethers.Interface(['function execute(address dest, uint256 value, bytes func)']);

    const validActionCalldata = dappIface.encodeFunctionData('purchaseItem');
    const validCallData = accountIface.encodeFunctionData('execute', [
        targetAddress,
        ethers.parseEther('0.05'),
        validActionCalldata
    ]);

    const baseUserOp = {
        sender: "0x3333333333333333333333333333333333333333",
        nonce: 1,
        callData: validCallData,
        callGasLimit: 200000,
        verificationGasLimit: 350000,
        preVerificationGas: 60000,
        maxFeePerGas: ethers.parseUnits('30', 'gwei').toString(),
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei').toString()
    };

    // 1. Test Successful Sponsorship
    const res1 = await request(app)
        .post('/sponsor')
        .send({
            userOp: baseUserOp,
            paymasterAddress,
            vaultAddress,
            chainId
        });

    if (res1.status === 200 && res1.body.paymasterAndData) {
        console.log("✅ Sponsorship approved with signature:", res1.body.paymasterAndData.slice(0, 32) + "…");
    } else {
        console.error("❌ Sponsorship failed", res1.body);
        process.exit(1);
    }

    // 2. Test Max Gas Exceeded
    const res2 = await request(app)
        .post('/sponsor')
        .send({
            userOp: { ...baseUserOp, maxFeePerGas: ethers.parseUnits('2000', 'gwei').toString() },
            paymasterAddress,
            vaultAddress,
            chainId
        });

    if (res2.status === 403 && res2.body.error.includes("exceeds max limit")) {
        console.log("✅ Max gas limit rejected correctly");
    } else {
        console.error("❌ Max gas test failed", res2.body);
        process.exit(1);
    }

    // 3. Test Inactive / Unregistered DApp
    const res3 = await request(app)
        .post('/sponsor')
        .send({
            userOp: baseUserOp,
            paymasterAddress,
            vaultAddress: "0x4444444444444444444444444444444444444444",
            chainId
        });

    if (res3.status === 403 && res3.body.error.includes("not registered")) {
        console.log("✅ Inactive/Unregistered DApp rejected correctly");
    } else {
        console.error("❌ Unregistered DApp test failed", res3.body);
        process.exit(1);
    }

    console.log("All Backend API unit tests passed!\n");
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
