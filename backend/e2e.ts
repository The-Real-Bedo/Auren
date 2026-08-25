import { execSync } from 'child_process';
import { ethers } from 'ethers';
import request from 'supertest';
import { app } from './src/index';

async function runE2E() {
    console.log("🚀 Starting E2E Demo...");
    
    // 1. Start Anvil in background (or assume it's running for the test)
    // For this test, we will just spawn it, or run forge script directly if it spawns a local evm
    // We will deploy the contracts using Anvil
    console.log("📦 Deploying contracts to local Anvil node...");
    
    // Clean and build to ensure fresh state
    execSync('cd .. && ~/.foundry/bin/forge build', { stdio: 'ignore' });
    
    // We will use the anvil node if we start it, but let's just launch anvil as a child process
    const { spawn } = require('child_process');
    const anvil = spawn('~/.foundry/bin/anvil', [], { shell: true });
    
    // wait for anvil to start
    await new Promise(r => setTimeout(r, 2000));
    
    try {
        const output = execSync('cd .. && ~/.foundry/bin/forge script script/DeployE2E.s.sol --rpc-url http://127.0.0.1:8545 --broadcast').toString();
        
        const extractAddress = (key: string) => {
            const match = output.match(new RegExp(`${key}: (0x[a-fA-F0-9]{40})`));
            return match ? match[1] : '';
        };

        const WUSDC = extractAddress('WUSDC');
        const ENTRY_POINT = extractAddress('EntryPoint');
        const FACTORY = extractAddress('Factory');
        const VAULT = extractAddress('Vault');
        const PAYMASTER = extractAddress('Paymaster');
        
        console.log(`✅ Deployed Vault: ${VAULT}`);
        console.log(`✅ Deployed Paymaster: ${PAYMASTER}`);

        // Setup Backend Env
        process.env.RPC_URL = "http://127.0.0.1:8545";
        process.env.BACKEND_SIGNER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        process.env.FACTORY_ADDRESS = FACTORY;

        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.BACKEND_SIGNER_PRIVATE_KEY, provider);

        // 2. Register Policy in Backend
        await request(app)
            .post('/admin/policy')
            .send({
                vaultAddress: VAULT,
                active: true,
                maxGasPerUserOp: 100000n.toString(),
                dailyBudget: 500000n.toString()
            })
            .expect(200);
        console.log("✅ Policy Registered in Backend");

        // 3. User Creates UserOp
        const userOp = {
            sender: "0x3333333333333333333333333333333333333333",
            nonce: 1,
            callData: "0xdeadbeef",
            maxCost: 21000
        };

        // 4. User requests sponsorship from Backend
        const res = await request(app)
            .post('/sponsor')
            .send({
                userOp,
                paymasterAddress: PAYMASTER,
                vaultAddress: VAULT,
                chainId: 31337 // Anvil default chainId
            });
            
        if (res.status !== 200) throw new Error("Sponsorship failed: " + JSON.stringify(res.body));
        
        console.log("✅ Backend validated policy and signed UserOp!");
        console.log("📝 paymasterAndData:", res.body.paymasterAndData);

        // 5. Submit to EntryPoint (Mock Validation)
        // For our MVP mock, the paymaster implements validatePaymasterUserOp
        // We will call it directly to simulate the EntryPoint validating the signature
        const paymasterAbi = [
            "function validatePaymasterUserOp(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 maxCost) external returns (bytes context, uint256 validationData)"
        ];
        
        const paymasterContract = new ethers.Contract(PAYMASTER, paymasterAbi, signer);
        
        const fullUserOp = {
            sender: userOp.sender,
            nonce: userOp.nonce,
            initCode: "0x",
            callData: userOp.callData,
            callGasLimit: 0,
            verificationGasLimit: 0,
            preVerificationGas: 0,
            maxFeePerGas: 0,
            maxPriorityFeePerGas: 0,
            paymasterAndData: res.body.paymasterAndData,
            signature: "0x"
        };
        
        // Generate the hash that EntryPoint would generate
        const abiCoder = new ethers.AbiCoder();
        const hash = ethers.keccak256(abiCoder.encode(
            ["address", "uint256", "bytes", "uint256", "uint256"],
            [userOp.sender, userOp.nonce, userOp.callData, userOp.maxCost, 31337]
        ));

        // Let's impersonate the EntryPoint to call validatePaymasterUserOp
        const data = paymasterContract.interface.encodeFunctionData("validatePaymasterUserOp", [fullUserOp, hash, userOp.maxCost]);
        
        await provider.send("anvil_impersonateAccount", [ENTRY_POINT]);
        
        // In anvil, we can impersonate accounts easily
        await provider.send("anvil_impersonateAccount", [ENTRY_POINT]);
        await provider.send("anvil_setBalance", [ENTRY_POINT, "0x1000000000000000000"]);
        
        const epSigner = await provider.getSigner(ENTRY_POINT);
        const epPaymasterContract = new ethers.Contract(PAYMASTER, paymasterAbi, epSigner);
        
        const validationResult = await epPaymasterContract.validatePaymasterUserOp.staticCall(fullUserOp, hash, userOp.maxCost);
        
        console.log("✅ EntryPoint validation result (0 means success):", validationResult[1].toString());
        
        if (validationResult[1].toString() !== "0") {
            throw new Error("Signature validation failed on-chain!");
        }

        console.log("🎉 E2E Sponsorship Flow Complete!");

    } finally {
        anvil.kill();
    }
}

runE2E().catch(console.error);
