import { PerpetuaSDK } from '@/sdk/index';
import { ethers, BrowserProvider } from 'ethers';

export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || ethers.ZeroAddress;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

export async function getSDK(provider?: BrowserProvider) {
    if (provider) {
        const signer = await provider.getSigner();
        return new PerpetuaSDK({ factoryAddress: FACTORY_ADDRESS, signer });
    }
    const defaultProvider = new ethers.JsonRpcProvider(RPC_URL);
    return new PerpetuaSDK({ factoryAddress: FACTORY_ADDRESS, provider: defaultProvider });
}
