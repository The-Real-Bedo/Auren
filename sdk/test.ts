import { PerpetuaSDK } from './src/index';
import { ethers } from 'ethers';

async function run() {
    console.log("SDK successfully loaded.");
    const provider = ethers.getDefaultProvider();
    const wallet = ethers.Wallet.createRandom().connect(provider);

    const sdk = new PerpetuaSDK({
        factoryAddress: "0x1234567890123456789012345678901234567890",
        signer: wallet
    });

    console.log("SDK instantiated with factory:", sdk.factoryAddress);

    // Just a quick instantiation check since we don't have a live node running in this script
    if (sdk.createVault) console.log("createVault method exists.");
    if (sdk.getVaultStats) console.log("getVaultStats method exists.");
}

run().catch(console.error);
