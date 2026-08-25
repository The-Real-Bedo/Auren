import { ethers, Provider, Signer, Contract, ContractTransactionResponse } from 'ethers';

import factoryAbi from './abi/MudarabahVaultFactory.json';
import vaultAbi from './abi/DAppVault.json';
import splitterAbi from './abi/RevenueSplitter.json';

export interface PerpetuaConfig {
    factoryAddress: string;
    provider?: Provider;
    signer?: Signer;
}

export interface VaultStats {
    totalValue: bigint;
    unrecoveredCapital: bigint;
    totalGasDeployed: bigint;
    totalSupplyShares: bigint;
}

export class PerpetuaSDK {
    public factoryAddress: string;
    public provider?: Provider;
    public signer?: Signer;
    private factoryContract: Contract;

    constructor(config: PerpetuaConfig) {
        this.factoryAddress = config.factoryAddress;
        this.provider = config.provider;
        this.signer = config.signer;

        const runner = this.signer || this.provider;
        if (!runner) {
            throw new Error("Must provide either a provider or a signer");
        }

        this.factoryContract = new Contract(this.factoryAddress, factoryAbi, runner);
    }

    /**
     * Creates a new DApp Vault.
     * @param lpProfitShareBps The percentage of net profit the LPs will take (in basis points, e.g., 5000 = 50%)
     */
    public async createVault(lpProfitShareBps: number): Promise<{
        tx: ContractTransactionResponse,
        vaultAddress?: string,
        paymasterAddress?: string,
        splitterAddress?: string
    }> {
        if (!this.signer) throw new Error("Signer required for transactions");
        if (lpProfitShareBps < 0 || lpProfitShareBps > 10000) {
            throw new Error("lpProfitShareBps must be between 0 and 10000");
        }

        const tx = await this.factoryContract.createVault(lpProfitShareBps);
        const receipt = await tx.wait();

        let vaultAddress, paymasterAddress, splitterAddress;
        if (receipt && receipt.logs) {
            for (const log of receipt.logs) {
                try {
                    const parsed = this.factoryContract.interface.parseLog(log as any);
                    if (parsed && parsed.name === 'VaultCreated') {
                        vaultAddress = parsed.args.vault;
                        paymasterAddress = parsed.args.paymaster;
                        splitterAddress = parsed.args.splitter;
                    }
                } catch (e) {
                    // Ignore non-matching logs
                }
            }
        }

        return { tx, vaultAddress, paymasterAddress, splitterAddress };
    }

    /**
     * Fetches current economic metrics for a specific vault.
     * @param vaultAddress The isolated vault address
     */
    public async getVaultStats(vaultAddress: string): Promise<VaultStats> {
        const runner = this.signer || this.provider;
        const vault = new Contract(vaultAddress, vaultAbi, runner);

        const [totalValue, unrecoveredCapital, totalGasDeployed, totalSupplyShares] = await Promise.all([
            vault.totalValue(),
            vault.unrecoveredCapital(),
            vault.totalGasDeployed(),
            vault.totalSupplyShares()
        ]);

        return {
            totalValue,
            unrecoveredCapital,
            totalGasDeployed,
            totalSupplyShares
        };
    }

    /**
     * Helper to sign a UserOperation for the InvestmentPaymaster (v0.6 AA)
     */
    public async signUserOp(
        userOp: any,
        paymasterAddress: string,
        chainId: number
    ): Promise<string> {
        if (!this.signer) throw new Error("Signer required");

        // The hash structure matching the contract's `validatePaymasterUserOp`
        const abiCoder = new ethers.AbiCoder();
        const hash = ethers.keccak256(abiCoder.encode(
            ["address", "uint256", "bytes", "uint256", "uint256"],
            [userOp.sender, userOp.nonce, userOp.callData, userOp.maxCost || 0, chainId]
        ));

        // Sign the hash (verifying signer)
        const signature = await this.signer.signMessage(ethers.getBytes(hash));

        // paymasterAndData = paymasterAddress (20 bytes) + signature (65 bytes)
        return ethers.concat([paymasterAddress, signature]);
    }

    /**
     * Generates transaction data to route a payment through the RevenueSplitter
     */
    public async processRevenue(
        splitterAddress: string,
        userAddress: string,
        amount: bigint
    ): Promise<ContractTransactionResponse> {
        if (!this.signer) throw new Error("Signer required");
        const splitter = new Contract(splitterAddress, splitterAbi, this.signer);
        return splitter.processPayment(userAddress, amount);
    }
}
