# Auren Protocol — ERC-4337 Live On-Chain Execution Proof & Test Matrix

**Network:** Arc Testnet (Chain ID `5042002`)
**Status:** 100% Verified On-Chain

---

## 1. Verified Live Execution Benchmark

The following live ERC-4337 sponsored execution was broadcast and confirmed on Arc Testnet:

- **Transaction Hash:** [`0x0a958dd53b280a9bbda9a222ddede4363017de6bd945d03c7e649e620c947b1c`](https://testnet.arcscan.app/tx/0x0a958dd53b280a9bbda9a222ddede4363017de6bd945d03c7e649e620c947b1c)
- **UserOperation Hash:** `0xc043df72dc84ec06f3842c7edf728484c70606eb27375b687360a341bb9b15de`
- **Block Number:** `58777974`
- **EntryPoint Target:** `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
- **Smart Account (Sender):** `0xA32F89a543C36A678e0c03C022CB39abB14e49CE`
- **Smart Account Owner (EOA):** `0x30080EF681349fAca4808a78a292264A5310Ce2b`
- **InvestmentPaymaster:** `0x2a4122372B1A624118Ee3e7D4503B9525CfDE076`
- **Gas Used:** `324,754`
- **User EOA Gas Paid:** **`0.00 USDC`** (Zero Gas Incurred by User)
- **Paymaster Gas Paid:** **`0.007466712 USDC`** (Deducted from EntryPoint Deposit)
- **Smart Account Purchases (Before → After):** `0 → 1`
- **DAppVault TVL (Before → After):** `47.50 USDC → 47.5175 USDC`

---

## 2. Test Verification Matrix

| Test Scenario | Test Description | Result | Verification Layer |
|---|---|---|---|
| **1. Smart Account Counterfactual Derivation** | Derive deterministic proxy address via `SimpleAccountFactory` | **PASS** | Foundry (`SimpleAccountTest`) & Arc RPC |
| **2. Dynamic Account Deployment on 1st Op** | Account deployed via `initCode` in first `handleOps` call | **PASS** | On-Chain (`Block #58777974`) |
| **3. Account Owner Signature Validation** | SimpleAccount validates owner signature over `userOpHash` | **PASS** | Solidity Unit Test & Arc RPC |
| **4. Invalid Owner Signature Rejection** | UserOp with forged signature reverts with `SIG_VALIDATION_FAILED` | **PASS** | Foundry (`SimpleAccountTest`) |
| **5. Paymaster Authorization Signature** | Backend signer signs 85-byte `paymasterAndData` | **PASS** | `PerpetuaSDK.signUserOp` & Backend |
| **6. Invalid Paymaster Signature Rejection** | Paymaster reverts if signature does not match backend signer | **PASS** | `InvestmentPaymaster.sol` |
| **7. Policy Engine Whitelist Check** | Rejects non-whitelisted selectors or contracts | **PASS** | Backend (`/agent/check-sponsorship`) |
| **8. Daily Budget & Rate Limiting** | Blocks requests exceeding daily budget caps | **PASS** | Backend (`test.ts`) |
| **9. Unauthorized EntryPoint Rejection** | Relayer rejects submission to non-canonical EntryPoint | **PASS** | Backend (`/agent/submit-userop`) |
| **10. Paymaster Capital Deployment** | Gas charged directly to Paymaster's deposit in EntryPoint | **PASS** | On-Chain (`Block #58777974`) |
| **11. DApp Revenue & TVL Accrual** | `purchaseItem()` routes revenue to `DAppVault` | **PASS** | On-Chain (`Block #58777974`) |
| **12. TechnoCore Event Sync** | Logs execution event to `/r/auren-ops` and KV note | **PASS** | TechnoCore Integration |

---

## 3. How to Run Verification Tests

### Foundry Unit Tests
```bash
forge test --match-path test/SimpleAccount.t.sol -vvv
```

### Backend Relayer & Policy Tests
```bash
cd backend && npm test
```

### Frontend Production Build
```bash
cd frontend && npm run build
```
