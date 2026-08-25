# Arc Testnet Integration & Verification

## CURRENT Verified Arc Testnet Documentation

**Sources:** Official Arc Network Docs (docs.arc.network)

- **Chain ID:** `5042002` (Source: docs.arc.network, verified via RPC call `eth_chainId`)
- **RPC URL:** `https://rpc.testnet.arc.network` (Source: Official Circle/Arc Developer Docs. We are prioritizing this over unofficial endpoints.)
- **Native USDC Mechanics:** Arc is a stablecoin-native Layer-1 blockchain built by Circle. **USDC is the native gas token.** It functions identically to ETH on Ethereum. (Source: docs.arc.network/architecture).
- **Native USDC Transfers:** Native USDC is transferred using `msg.value` (just like native ETH). It has 18 decimals natively.
- **ERC-4337 EntryPoint Version:** v0.6 and v0.7 are natively supported by the Arc execution layer and bundler infra. (Source: docs.arc.network/account-abstraction)
- **ERC-4337 EntryPoint Address:** The canonical v0.6 EntryPoint is deployed at `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`. (Verified via `eth_getCode` directly on Arc RPC).
- **Paymaster Compatibility:** Fully compatible with standard ERC-4337 paymasters. Since gas is USDC, the Paymaster deposits native USDC (`msg.value`) into the EntryPoint.
- **Official Testnet Funding:** Testnet USDC is acquired strictly via the official Circle Faucet at `faucet.circle.com`. (Source: docs.arc.network/faucet)

*Note: All WUSDC (ERC-20) dependencies were entirely removed from the protocol because Arc native mechanics render them completely obsolete.*
