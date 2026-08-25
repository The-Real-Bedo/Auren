# Auren Protocol — Browser ERC-4337 Account Abstraction Architecture

**Architecture Version:** 1.0.0
**Target Chain:** Arc Testnet (Chain ID `5042002`)
**Specification:** ERC-4337 v0.6 Canonical Standard

---

## 1. Architectural Overview

Auren enables gas-free, zero-custody autonomous application executions on Arc Testnet using ERC-4337 Account Abstraction and Mudarabah liquidity vaults.

```
┌─────────────────┐       ┌────────────────────────┐       ┌────────────────────────┐
│  Connected EOA  │──────▶│ Counterfactual Account │──────▶│   Auren Policy Engine  │
│ (User / Agent)  │       │ (SimpleAccount Proxy)  │       │  (/sponsor Authorization)
└─────────────────┘       └────────────────────────┘       └───────────┬────────────┘
                                                                       │ paymasterAndData
                                                                       ▼
┌─────────────────┐       ┌────────────────────────┐       ┌────────────────────────┐
│   Arc Testnet   │◀──────│ Canonical EntryPoint   │◀──────│     Auren Relayer      │
│ (DemoDApp Exec) │       │ (0x5FF137D4b0FDCD49D…) │       │ (/agent/submit-userop) │
└─────────────────┘       └───────────┬────────────┘       └────────────────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │  InvestmentPaymaster   │
                          │ (0x2a4122372B1A62411…) │
                          └───────────┬────────────┘
                                      │ Gas Prefund
                                      ▼
                          ┌────────────────────────┐
                          │       DAppVault        │
                          │ (0x851bD1E5d9CdeD0f1…) │
                          └────────────────────────┘
```

---

## 2. Key Components & Deployed Addresses

| Component | Network Address | Role & Responsibility |
|---|---|---|
| **Canonical EntryPoint v0.6** | `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` | Standard ERC-4337 v0.6 singleton; validates accounts, validates paymasters, and executes UserOperations. |
| **SimpleAccountFactory** | `0x2f1c18afD2536c74371fbaCEa6Ed21efa2D9a139` | Computes deterministic counterfactual addresses (`getAddress`) and deploys `ERC1967Proxy` smart accounts via `initCode`. |
| **InvestmentPaymaster** | `0x2a4122372B1A624118Ee3e7D4503B9525CfDE076` | Validates Auren backend cryptographic authorization signatures; draws gas deficit from `DAppVault.deployCapital()`. |
| **DAppVault (Active)** | `0x851bD1E5d9CdeD0f183e861dB98157641C826a74` | Holds LP capital; funds EntryPoint sponsorship deposits; accounts for gas deployed and capital recovery. |
| **RevenueSplitter** | `0x8aA1197eFF337Db0c2aaF9e085c50cB46A7Fb2f7` | Routes monetization proceeds to Vault for capital recovery before distributing profit splits (50% Vault / 50% Developer). |
| **DemoDApp** | `0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6` | Monetized test application exposing `purchaseItem()`. |
| **Backend Signer** | `0xB3d316bc01790150C061bF3a93d801C06251Bb1b` | Dedicated server-side signer for Paymaster sponsorship authorization. |
| **Auren Relayer** | `0x30080EF681349fAca4808a78a292264A5310Ce2b` | Server-side relayer submitting `EntryPoint.handleOps()`. |

---

## 3. End-to-End Execution Flow

### Step 1: Counterfactual Smart Account Derivation
- When the user connects their EOA (or an AI agent initializes its session key), the client queries `SimpleAccountFactory.createAccount.staticCall(owner, salt)`.
- The user's Smart Account address is determined before on-chain deployment.

### Step 2: Policy Evaluation & Intent Signing
- The client constructs the target calldata: `SimpleAccount.execute(DemoDApp, value, "0xef032d84")`.
- The client calls `POST /agent/check-sponsorship` to verify that the DApp is active and the action is whitelisted.
- The client calls `POST /sponsor` to request Paymaster sponsorship.
- The backend verifies daily budget limits and generates `paymasterAndData` (20 bytes Paymaster address + 65 bytes ECDSA signature).

### Step 3: User Operation Hashing & Signing
- The client computes `userOpHash = EntryPoint.getUserOpHash(userOp)`.
- The connected wallet (MetaMask) signs `userOpHash` using `personal_sign`.
- The user's EOA incurs **0 gas cost** during signing.

### Step 4: Relayer Broadcast
- The client posts the signed `UserOperation` to `POST /agent/submit-userop`.
- The Auren Relayer executes `EntryPoint.handleOps([userOp], relayerAddress)` on Arc Testnet.

### Step 5: On-Chain Validation & Execution
1. `EntryPoint` checks `initCode`. If the account is not deployed, `SimpleAccountFactory` creates the `ERC1967Proxy`.
2. `SimpleAccount.validateUserOp` validates the owner's signature against `userOpHash`.
3. `InvestmentPaymaster.validatePaymasterUserOp` verifies the backend signer signature and ensures required EntryPoint deposits are available.
4. `EntryPoint` executes `SimpleAccount.execute()`, calling `DemoDApp.purchaseItem()`.
5. `DemoDApp` sends revenue to `RevenueSplitter`, which updates `DAppVault` accounting.
6. `EntryPoint` deducts the actual gas fee directly from the Paymaster's deposit in EntryPoint.

---

## 4. Security & Role Separation

- **Private Key Isolation:**
  - `BACKEND_SIGNER_PRIVATE_KEY`: Kept on server; signs only validated `paymasterAndData` envelopes.
  - `RELAYER_PRIVATE_KEY`: Kept on server; submits `handleOps` transactions.
  - `USER_PRIVATE_KEY`: Remains in user's browser wallet (MetaMask) or agent keystore.
- **Relayer Whitelist Filters:**
  - Enforces `chainId == 5042002`
  - Restricts `entryPointAddress == 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
  - Restricts `paymasterAddress == 0x2a4122372B1A624118Ee3e7D4503B9525CfDE076`
  - Rejects transactions exceeding gas ceilings or unregistered contracts.
