import { PerpetuaSDK } from '@/sdk/index';
import { ethers, BrowserProvider } from 'ethers';

export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x8CB1E0Dcd5dA6F8C17b83535B4307128701BA7ab";
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.testnet.arc.network";

export async function getSDK(provider?: BrowserProvider) {
    if (provider) {
        const signer = await provider.getSigner();
        return new PerpetuaSDK({ factoryAddress: FACTORY_ADDRESS, signer });
    }
    const defaultProvider = new ethers.JsonRpcProvider(RPC_URL);
    return new PerpetuaSDK({ factoryAddress: FACTORY_ADDRESS, provider: defaultProvider });
}
