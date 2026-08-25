import { app } from './src/index';
import request from 'supertest';
import { ethers } from 'ethers';

// Setup Mock Env
process.env.SIGNER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Anvil Account 0
process.env.FACTORY_ADDRESS = ethers.ZeroAddress;

async function runTests() {
    console.log("Starting backend tests...");

    const vaultAddress = "0x1111111111111111111111111111111111111111";
    const paymasterAddress = "0x2222222222222222222222222222222222222222";
    
    // 1. Register Policy
    await request(app)
        .post('/admin/policy')
        .send({
            vaultAddress,
            active: true,
            maxGasPerUserOp: 100000n.toString(),
            dailyBudget: 500000n.toString()
        })
        .expect(200);
    
    console.log("✅ Policy registered");

    const baseUserOp = {
        sender: "0x3333333333333333333333333333333333333333",
        nonce: 1,
        callData: "0x",
        maxCost: 50000
    };

    // 2. Test Successful Sponsorship
    const res1 = await request(app)
        .post('/sponsor')
        .send({
            userOp: baseUserOp,
            paymasterAddress,
            vaultAddress,
            chainId: 1337
        });
    
    if (res1.status === 200 && res1.body.paymasterAndData) {
        console.log("✅ Sponsorship approved with signature:", res1.body.paymasterAndData);
    } else {
        console.error("❌ Sponsorship failed", res1.body);
        process.exit(1);
    }

    // 3. Test Max Gas Exceeded
    const res2 = await request(app)
        .post('/sponsor')
        .send({
            userOp: { ...baseUserOp, maxCost: 200000 },
            paymasterAddress,
            vaultAddress,
            chainId: 1337
        });
    
    if (res2.status === 403 && res2.body.error.includes("exceeds maximum")) {
        console.log("✅ Max gas limit rejected correctly");
    } else {
        console.error("❌ Max gas test failed");
        process.exit(1);
    }

    // 4. Test Inactive DApp
    await request(app)
        .post('/sponsor')
        .send({
            userOp: baseUserOp,
            paymasterAddress,
            vaultAddress: "0x4444444444444444444444444444444444444444",
            chainId: 1337
        }).expect(403);
    
    console.log("✅ Inactive DApp rejected correctly");
    
    console.log("All Backend API tests passed!");
    process.exit(0);
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
