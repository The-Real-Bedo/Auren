# Perpetua Protocol — Arc Testnet Live Deployment Report

## 1. Executive Summary

Perpetua is a decentralized capital-coordination protocol designed for user acquisition on stablecoin-native blockchains like Arc. It enables capital providers (investors) to fund gas sponsorship budgets for Web3 applications via ERC-4337 Account Abstraction. The deployed capital is recovered from top-line DApp revenue before profit-sharing commences, ensuring a strict Mudarabah-inspired, non-interest revenue model.

---

## 2. Deployed Contracts (Arc Testnet — Chain ID `5042002`)

All contracts are deployed and verified live on Arc Testnet:

| Contract | Address | Purpose |
|---|---|---|
| **MudarabahVaultFactory** | `0x8CB1E0Dcd5dA6F8C17b83535B4307128701BA7ab` | Deploys isolated vaults and bound paymasters per DApp |
| **DAppVault (Active Instance)** | `0x851bD1E5d9CdeD0f183e861dB98157641C826a74` | Capital pool, LP share tracking, recovery accounting |
| **InvestmentPaymaster** | `0x2a4122372B1A624118Ee3e7D4503B9525CfDE076` | ERC-4337 Paymaster sponsoring gas from vault capital |
| **RevenueSplitter** | `0x8aA1197eFF337Db0c2aaF9e085c50cB46A7Fb2f7` | Receives DApp revenue, routes recovery + profit share |
| **DemoDApp (Digital Marketplace)**| `0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6` | Demonstration commerce contract utilizing paymaster |
| **Canonical EntryPoint v0.6** | `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` | Official ERC-4337 EntryPoint on Arc Network |

---

## 3. Network Configuration

- **Chain ID:** `5042002`
- **Network Name:** Arc Testnet
- **RPC Endpoint:** `https://rpc.testnet.arc.network`
- **Native Gas Token:** USDC (18 decimals, transfers via `msg.value`)
- **Block Explorer:** `https://testnet.arcscan.io` (or official Arc Explorer)

---

## 4. On-Chain Protocol Accounting

The active `DAppVault` maintains the following verifiable on-chain state:
- **`totalValue()`**: Total liquid USDC balance in the vault
- **`totalGasDeployed()`**: Cumulative native USDC pulled by the Paymaster for user sponsorship
- **`totalCapitalRecovered()`**: Cumulative USDC returned via `RevenueSplitter.recordCapitalRecovery()`
- **`unrecoveredCapital()`**: `max(0, totalGasDeployed - totalCapitalRecovered)`
- **`lpShares(address)`**: Pro-rata equity shares of the capital pool
- **`totalSupplyShares()`**: Total circulating shares across all LPs

### Economic Rule: Capital First, Profit Second
1. When DApp revenue arrives at `RevenueSplitter`:
2. If `vault.unrecoveredCapital() > 0`, 100% of revenue flows to `vault.recordCapitalRecovery{value: amount}()` until full principal recovery.
3. Only once `unrecoveredCapital() == 0` does the profit-sharing split trigger:
   - `lpProfitShareBps` (e.g. 50%) -> `vault.receiveProfit{value: lpShare}()`
   - Remainder -> DApp Developer payout address

---

## 5. End-to-End Flow Verification

The verified production transaction lifecycle:
1. **User Interaction:** User prepares UserOperation on the frontend.
2. **Policy Verification:** Off-chain Policy Engine signs authorization payload.
3. **Execution & Sponsorship:** ERC-4337 EntryPoint executes transaction; `InvestmentPaymaster` draws gas from `DAppVault`.
4. **Revenue Generation:** User completes transaction (e.g. `DemoDApp.purchaseItem()` for 10 USDC).
5. **Settlement:** `DemoDApp` forwards revenue to `RevenueSplitter`, which recovers deployed capital first and deposits profit to `DAppVault`.
6. **Value Accrual:** Vault TVL increases, backing LP shares with higher redemption value.

---

## 6. Frontend & Developer Tooling

- **Live Web Interface:** Full Next.js product suite (`/`, `/invest`, `/build`, `/explore`, `/demo`)
- **SDK Package:** `@perpetua/sdk` (`PerpetuaSDK` TypeScript client for UserOp signing and policy requests)
- **Backend Service:** Express Policy Engine on port 3001 (`POST /sponsor`, `POST /admin/policy`, `GET /health`)
