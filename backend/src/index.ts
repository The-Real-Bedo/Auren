import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { ethers } from 'ethers';
import { PerpetuaSDK } from 'sdk';
import { AurenTools, createAgentApiRouter } from '@auren/agent';

// Safely load the root .env relative to this file (works for both src/ and dist/)
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
// Prefer Arc RPC URL if available, else fallback
const RPC_URL = process.env.ARC_RPC_URL || process.env.RPC_URL || "https://rpc.testnet.arc.network";
const PRIVATE_KEY = process.env.BACKEND_SIGNER_PRIVATE_KEY || process.env.SIGNER_PRIVATE_KEY;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || ethers.ZeroAddress;

if (!PRIVATE_KEY) {
    console.error("Missing BACKEND_SIGNER_PRIVATE_KEY in environment");
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const sdk = new PerpetuaSDK({
    factoryAddress: FACTORY_ADDRESS,
    signer
});

// Initialize Auren Agent tools and mount /agent API router
const aurenTools = new AurenTools(RPC_URL, PRIVATE_KEY);
const agentApiRouter = createAgentApiRouter(aurenTools);
app.use('/agent', agentApiRouter);

// Pre-seeded DApp Policies for Arc Testnet & Local Environments
const DAppPolicies: Record<string, { active: boolean, maxGasPerUserOp: bigint, dailyBudget: bigint, spentToday: bigint }> = {
    // Arc Testnet Active DAppVault
    '0x851bd1e5d9cded0f183e861db98157641c826a74': {
        active: true,
        maxGasPerUserOp: ethers.parseEther('0.01'), // 0.01 USDC max per user op
        dailyBudget: ethers.parseEther('100.0'),    // 100 USDC daily budget
        spentToday: 0n
    },
    // Local / Dev Vault
    '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512': {
        active: true,
        maxGasPerUserOp: ethers.parseEther('0.01'),
        dailyBudget: ethers.parseEther('100.0'),
        spentToday: 0n
    }
};

const UserRateLimits: Record<string, { count: number, resetTime: number }> = {};

// ── TechnoCore / Agent Discovery Endpoints ─────────────────
const candidateDiscoveryDirs = [
    path.resolve(process.cwd(), '../agent/discovery'),
    path.resolve(process.cwd(), 'agent/discovery'),
    path.resolve(__dirname, '../../agent/discovery'),
    path.resolve(__dirname, '../../../agent/discovery')
];
const discoveryDir = candidateDiscoveryDirs.find(d => fs.existsSync(d)) || candidateDiscoveryDirs[0];

app.get('/llms.txt', (req: Request, res: Response) => {
    res.sendFile(path.join(discoveryDir, 'llms.txt'));
});

app.get('/skill.md', (req: Request, res: Response) => {
    res.sendFile(path.join(discoveryDir, 'skill.md'));
});

app.get('/.well-known/agent.json', (req: Request, res: Response) => {
    res.sendFile(path.join(discoveryDir, 'agent.json'));
});

app.get('/openapi.json', (req: Request, res: Response) => {
    res.sendFile(path.join(discoveryDir, 'openapi.json'));
});

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'Auren Economic Layer & Policy Engine',
        technocoreIntegration: 'active',
        rpc: RPC_URL,
        signerAddress: signer.address
    });
});

app.post('/sponsor', async (req: Request, res: Response): Promise<any> => {
    try {
        const { userOp, paymasterAddress, vaultAddress, chainId } = req.body;
        
        if (!userOp || !paymasterAddress || !vaultAddress || !chainId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const vaultKey = (vaultAddress || '').toLowerCase();
        let policy = DAppPolicies[vaultKey] || DAppPolicies[vaultAddress];
        
        // If not explicitly defined, initialize active default policy
        if (!policy) {
            policy = {
                active: true,
                maxGasPerUserOp: ethers.parseEther('0.01'),
                dailyBudget: ethers.parseEther('100.0'),
                spentToday: 0n
            };
            DAppPolicies[vaultKey] = policy;
        }

        if (!policy.active) {
            return res.status(403).json({ error: "DApp is not registered or inactive" });
        }

        const maxCost = BigInt(userOp.maxCost || 0);
        if (maxCost > policy.maxGasPerUserOp) {
            return res.status(403).json({ error: "UserOp exceeds maximum allowed gas cost" });
        }

        if (policy.spentToday + maxCost > policy.dailyBudget) {
            return res.status(429).json({ error: "DApp daily sponsorship budget exceeded" });
        }

        const sender = (userOp.sender || '').toLowerCase();
        const now = Date.now();
        if (!UserRateLimits[sender] || now > UserRateLimits[sender].resetTime) {
            UserRateLimits[sender] = { count: 1, resetTime: now + 60000 };
        } else {
            if (UserRateLimits[sender].count >= 30) {
                return res.status(429).json({ error: "User rate limit exceeded" });
            }
            UserRateLimits[sender].count += 1;
        }

        const signature = await sdk.signUserOp(userOp, paymasterAddress, chainId);
        policy.spentToday += maxCost;

        return res.json({ paymasterAndData: signature });
    } catch (error: any) {
        console.error("Sponsorship error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

app.post('/admin/policy', (req: Request, res: Response): any => {
    const { vaultAddress, active, maxGasPerUserOp, dailyBudget } = req.body;
    const vaultKey = (vaultAddress || '').toLowerCase();
    DAppPolicies[vaultKey] = {
        active,
        maxGasPerUserOp: BigInt(maxGasPerUserOp),
        dailyBudget: BigInt(dailyBudget),
        spentToday: 0n
    };
    return res.json({ success: true });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Auren Economic & Policy Engine running on port ${PORT}`);
        console.log(`TechnoCore Agent API mounted at http://localhost:${PORT}/agent`);
    });
}

export { app };
