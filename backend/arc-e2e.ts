import { ethers } from 'ethers';
import request from 'supertest';
import { app } from './src/index';

async function runE2E() {
    console.log("🚀 Starting Arc Testnet E2E Demo...");

    const deployerPk = process.env.DEPLOYER_PRIVATE_KEY!;
    const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
    const userWallet = new ethers.Wallet(deployerPk, provider);
    
    const VAULT = "0x851bD1E5d9CdeD0f183e861dB98157641C826a74";
    const PAYMASTER = "0x2a4122372B1A624118Ee3e7D4503B9525CfDE076";
    const ENTRY_POINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
    const DEMO_DAPP = "0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6";
    const CHAIN_ID = 5042002;

    process.env.RPC_URL = process.env.ARC_RPC_URL;
    process.env.SIGNER_PRIVATE_KEY = process.env.BACKEND_SIGNER_PRIVATE_KEY;
    process.env.FACTORY_ADDRESS = "0x8CB1E0Dcd5dA6F8C17b83535B4307128701BA7ab";

    // 1. Register Policy in Backend
    await request(app)
        .post('/admin/policy')
        .send({
            vaultAddress: VAULT,
            active: true,
            maxGasPerUserOp: 10000000000000000n.toString(), // 0.01 USDC
            dailyBudget: 5000000000000000000n.toString() // 5 USDC
        });
    console.log("✅ Policy Registered in Backend");

    const dappAbi = ["function purchaseItem() external payable"];
    const dappInterface = new ethers.Interface(dappAbi);
    const callData = dappInterface.encodeFunctionData("purchaseItem");
    
    const userOp = {
        sender: userWallet.address, // Mock sender since we aren't executing handleOps
        nonce: Math.floor(Math.random() * 1000000),
        callData: callData,
        maxCost: ethers.parseEther("0.005").toString()
    };

    // 2. Request Sponsorship
    const res = await request(app)
        .post('/sponsor')
        .send({
            userOp,
            paymasterAddress: PAYMASTER,
            vaultAddress: VAULT,
            chainId: CHAIN_ID
        });

    if (res.status !== 200) throw new Error("Sponsorship failed: " + JSON.stringify(res.body));
    console.log("✅ Backend validated policy and signed UserOp!");
    console.log("📝 paymasterAndData:", res.body.paymasterAndData);

    console.log("Executing Purchase on DemoDApp (Simulating Execution Phase)...");
    const demoContract = new ethers.Contract(DEMO_DAPP, dappAbi, userWallet);
    const tx = await demoContract.purchaseItem({ value: ethers.parseEther("10") }); // type 0 not needed for ethers v6 if it auto-detects
    console.log("Transaction Hash:", tx.hash);
    await tx.wait();
    console.log("✅ Purchase Successful!");
    
    // Check Vault Accounting
    const vaultAbi = [
        "function unrecoveredCapital() external view returns (uint256)",
        "function totalCapitalRecovered() external view returns (uint256)",
        "function totalRealizedProfit() external view returns (uint256)",
        "function totalValue() external view returns (uint256)"
    ];
    const vaultContract = new ethers.Contract(VAULT, vaultAbi, provider);
    const unrecovered = await vaultContract.unrecoveredCapital();
    const recovered = await vaultContract.totalCapitalRecovered();
    const profit = await vaultContract.totalRealizedProfit();
    const total = await vaultContract.totalValue();
    
    console.log(`Vault Accounting:
      Total Value: ${ethers.formatEther(total)} USDC
      Unrecovered: ${ethers.formatEther(unrecovered)} USDC
      Recovered: ${ethers.formatEther(recovered)} USDC
      Realized Profit: ${ethers.formatEther(profit)} USDC
    `);
    
    process.exit(0);
}

runE2E().catch(console.error);
