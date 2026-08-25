# Auren Protocol — Internal Security Audit Report (Read-Only)

**Audit Type:** Internal Static Analysis & Architectural Review
**Date:** August 25, 2026
**Audited Target:** Auren Protocol (Contracts, Backend, Agent SDK, Frontend)
**Network:** Arc Testnet (Chain ID `5042002`)
**Deployment State:** Active Testnet

---

## 1. Summary of Findings

| Finding ID | Title | Severity | Component | Exploitable on Current Testnet | Classification |
|---|---|---|---|---|---|
| **AUR-SEC-01** | Missing Calldata Decoding & Target Whitelist Verification in `/sponsor` | **High** | Backend (`/sponsor`) | **Yes** | **NEEDS FIX** |
| **AUR-SEC-02** | Ephemeral In-Memory Policy & Budget State in Backend | **Medium** | Backend Policy Engine | **Yes** | **NEEDS FIX** |
| **AUR-SEC-03** | Lack of EntryPoint Pre-Simulation in Relayer (`/agent/submit-userop`) | **Medium** | Backend Relayer | **Yes** | **NEEDS FIX** |
| **AUR-SEC-04** | Missing Paymaster Gas Reconciliation in `InvestmentPaymaster.postOp` | **Medium** | Smart Contracts (`InvestmentPaymaster`) | **Yes** | **NEEDS FIX** |
| **AUR-SEC-05** | No Withdrawal Method for Unused Paymaster EntryPoint Deposits | **Medium** | Smart Contracts (`InvestmentPaymaster`) | **No (Funds Safe, but Locked)** | **BLOCKER FOR MAINNET** |
| **AUR-SEC-06** | Open Wildcard CORS on Backend Service | **Low** | Backend (`index.ts`) | **Yes** | **NEEDS FIX** |
| **AUR-SEC-07** | Sybil Susceptibility of Per-Address Rate Limiting | **Low** | Backend Rate Limiter | **Yes** | **NEEDS FIX** |
| **AUR-SEC-08** | First-Depositor Share Math Dependency on Clean State | **Low** | Smart Contracts (`DAppVault`) | **No (Mitigated by 1000 dead shares)** | **PASS** |
| **AUR-SEC-09** | Reentrancy & Cross-Contract Security | **Informational** | Smart Contracts (`DAppVault`, `Splitter`) | **No** | **PASS** |
| **AUR-SEC-10** | Private Key Management & Frontend Zero-Exposure | **Informational** | Frontend & SDK | **No** | **PASS** |

---

## 2. Detailed Findings

---

### [AUR-SEC-01] Missing Calldata Decoding & Target Whitelist Verification in `/sponsor`
- **Severity:** **High**
- **Component:** Backend (`backend/src/index.ts` - `/sponsor`)
- **Attack Scenario:**
  An attacker crafts a UserOperation targeting an arbitrary contract on Arc Testnet (e.g., an unauthorized external contract or a high-gas loop) and calls `POST /sponsor`. Since `/sponsor` only checks `maxCost <= maxGasPerUserOp` and `spentToday + maxCost <= dailyBudget`, the backend signs the `paymasterAndData` authorization signature without inspecting or decoding `userOp.callData` to verify that the destination contract is whitelisted.
- **Preconditions:** Public access to the backend `/sponsor` API endpoint.
- **Impact:** The Auren Paymaster can be tricked into sponsoring gas for arbitrary smart contract transactions on Arc Testnet, exhausting the daily sponsorship budget allocated for verified DApps.
- **Current Mitigation:** Gas per operation is capped at `0.05 USDC`, and daily budget is capped at `100 USDC`.
- **Recommended Mitigation:**
  1. Decode `userOp.callData` to extract the destination address (`dest`) and function selector.
  2. Call `defaultPolicyEngine.evaluateDryRun(payload)` inside `/sponsor` before signing.
  3. Reject any UserOp whose execution target is not in the registered DApp whitelist.
- **Exploitable on Current Arc Testnet:** **Yes.**

---

### [AUR-SEC-02] Ephemeral In-Memory Policy & Budget State in Backend
- **Severity:** **Medium**
- **Component:** Backend Policy Engine (`backend/src/index.ts` & `agent/policies/policyEngine.ts`)
- **Attack Scenario:**
  The `DAppPolicies` and `UserRateLimits` mappings are stored in memory in JavaScript objects/maps. If the Render backend restarts, crashes, or scales across multiple containers:
  1. `spentToday` resets to `0`.
  2. Rate limit counters reset to `0`.
  An attacker can force restarts or exploit multi-instance drift to bypass the daily sponsorship budget.
- **Preconditions:** Container restart, crash, or horizontal scaling.
- **Impact:** Daily budget caps can be exceeded beyond the intended 100 USDC threshold across server lifecycle events.
- **Current Mitigation:** In-memory daily reset based on `Date.now() / 86400000`.
- **Recommended Mitigation:**
  Use a persistent KV store (e.g., Redis, PostgreSQL, or Upstash) for daily budget tracking and rate limits across instances and restarts.
- **Exploitable on Current Arc Testnet:** **Yes.**

---

### [AUR-SEC-03] Lack of EntryPoint Pre-Simulation in Relayer (`/agent/submit-userop`)
- **Severity:** **Medium**
- **Component:** Backend Relayer (`backend/src/index.ts` - `/agent/submit-userop`)
- **Attack Scenario:**
  An attacker submits a malformed or intentionally failing UserOperation to `POST /agent/submit-userop`. The relayer immediately executes `entryPoint.handleOps([formattedUserOp], relayerAddress)` on Arc Testnet without running `entryPoint.simulateValidation` or `handleOps.staticCall` first.
  If the operation reverts during execution due to application logic, the relayer's transaction might revert or consume unnecessary L1 base gas from the relayer wallet.
- **Preconditions:** Public access to `/agent/submit-userop`.
- **Impact:** Relayer wallet native USDC balance can be degraded by failed broadcast attempts.
- **Current Mitigation:** Strict address and chainId validation.
- **Recommended Mitigation:**
  Execute `await entryPoint.handleOps.staticCall([formattedUserOp], relayerSigner.address)` before sending the on-chain transaction. If the simulation fails, reject the request immediately with HTTP 400.
- **Exploitable on Current Arc Testnet:** **Yes.**

---

### [AUR-SEC-04] Missing Paymaster Gas Reconciliation in `InvestmentPaymaster.postOp`
- **Severity:** **Medium**
- **Component:** Smart Contracts ([`src/InvestmentPaymaster.sol`](file:///Users/0xbedo/Desktop/Web3/perpetua-share/src/InvestmentPaymaster.sol#L35))
- **Attack Scenario:**
  When EntryPoint validates the Paymaster, `validatePaymasterUserOp` calculates `maxCost = requiredFunds`. If the EntryPoint deposit is insufficient, `vault.deployCapital(deficit)` pulls the full `maxCost` into EntryPoint and increments `vault.totalGasDeployed += deficit`.
  In practice, the actual gas used (`actualGasCost`) is almost always significantly lower than `maxCost` (e.g., 0.007 USDC actual vs. 0.039 USDC maxCost).
  Because `InvestmentPaymaster.postOp` is currently empty (`{}`), the difference (`maxCost - actualGasCost`) remains deposited in EntryPoint, but `DAppVault.totalGasDeployed` still reflects `maxCost`.
- **Preconditions:** Normal execution of sponsored UserOperations where `deficit > 0`.
- **Impact:** `DAppVault.unrecoveredCapital()` overstates the true gas deployed, requiring more DApp revenue before LP profit splits are unlocked.
- **Current Mitigation:** The unused deposit remains safe in EntryPoint and serves future transactions.
- **Recommended Mitigation:**
  Implement `postOp` in `InvestmentPaymaster` to report `actualGasCost` back to `DAppVault` (or adjust `totalGasDeployed` to match actual gas consumed upon final settlement).
- **Exploitable on Current Arc Testnet:** **Yes (Accounting Precision Issue).**

---

### [AUR-SEC-05] No Withdrawal Method for Unused Paymaster EntryPoint Deposits
- **Severity:** **Medium**
- **Component:** Smart Contracts ([`src/InvestmentPaymaster.sol`](file:///Users/0xbedo/Desktop/Web3/perpetua-share/src/InvestmentPaymaster.sol))
- **Attack Scenario:**
  Capital deployed from `DAppVault` to `IEntryPoint.depositTo(paymaster)` resides inside EntryPoint under the Paymaster's address. Canonical EntryPoint v0.6 permits only the Paymaster contract itself (`msg.sender`) to call `entryPoint.withdrawTo(payable(recipient), amount)`.
  However, `InvestmentPaymaster.sol` does not expose an admin or vault-authorized `withdrawTo` function. If the vault is decommissioned or LPs wish to wind down the pool, any funds remaining in the Paymaster's EntryPoint deposit cannot be returned to the vault.
- **Preconditions:** Vault decommissioning or surplus capital reclamation.
- **Impact:** Capital locked in EntryPoint cannot be withdrawn back to the Vault.
- **Current Mitigation:** Deposits are only funded as needed for transaction execution.
- **Recommended Mitigation:**
  Add an authorized `withdrawDeposit(address payable to, uint256 amount)` function to `InvestmentPaymaster.sol` callable only by `vault` or governance.
- **Exploitable on Current Arc Testnet:** **No (Capital is safe on testnet, but feature is absent for mainnet).**

---

### [AUR-SEC-06] Open Wildcard CORS on Backend Service
- **Severity:** **Low**
- **Component:** Backend (`backend/src/index.ts`)
- **Attack Scenario:**
  `app.use(cors())` enables any origin (`*`) to query and submit requests to `/sponsor` and `/agent/submit-userop`.
- **Preconditions:** Malicious website visited by a user.
- **Impact:** Unauthorized third-party frontends can embed and invoke the Auren backend relayer.
- **Current Mitigation:** Request payload validation and rate limits.
- **Recommended Mitigation:** Restrict CORS origin in production to `https://auren-build.vercel.app` and authorized partner domains.
- **Exploitable on Current Arc Testnet:** **Yes.**

---

### [AUR-SEC-07] Sybil Susceptibility of Per-Address Rate Limiting
- **Severity:** **Low**
- **Component:** Backend Rate Limiter (`backend/src/index.ts` - `UserRateLimits`)
- **Attack Scenario:**
  Rate limits are keyed by `userOp.sender`. An attacker can generate hundreds of new counterfactual Smart Accounts by varying the `salt` parameter (`0, 1, 2, ...`), effectively bypassing the per-sender rate limit.
- **Preconditions:** Scripted attacker deploying multiple burner accounts.
- **Impact:** Accelerated exhaustion of the daily sponsorship budget.
- **Current Mitigation:** The daily budget cap (`100 USDC`) still acts as a hard global ceiling.
- **Recommended Mitigation:** Implement IP-based rate limiting and agent DID authentication envelopes for sponsorship requests.
- **Exploitable on Current Arc Testnet:** **Yes.**

---

### [AUR-SEC-08] First-Depositor Share Math & Inflation Analysis
- **Severity:** **Low (Informational)**
- **Component:** Smart Contracts ([`src/DAppVault.sol`](file:///Users/0xbedo/Desktop/Web3/perpetua-share/src/DAppVault.sol#L74-L78))
- **Analysis:**
  On the first deposit, `DAppVault.deposit()` mints 1,000 dead shares to `address(0)`:
  ```solidity
  if (totalSupplyShares == 0) {
      shares = amount;
      totalSupplyShares += 1000;
      lpShares[address(0)] += 1000;
  }
  ```
  This effectively mitigates the classical ERC-4626 first-depositor inflation attack for standard deposits.
- **Status:** **PASS.**

---

### [AUR-SEC-09] Reentrancy & Cross-Contract Security
- **Severity:** **Informational**
- **Component:** Smart Contracts ([`src/DAppVault.sol`](file:///Users/0xbedo/Desktop/Web3/perpetua-share/src/DAppVault.sol), [`src/RevenueSplitter.sol`](file:///Users/0xbedo/Desktop/Web3/perpetua-share/src/RevenueSplitter.sol))
- **Analysis:**
  All state-mutating functions in `DAppVault` (`deposit`, `withdraw`, `deployCapital`, `processRevenue`) are protected by OpenZeppelin's `ReentrancyGuard` (`nonReentrant`). Transfers of developer profit and withdrawal proceeds occur after state variable updates.
- **Status:** **PASS.**

---

### [AUR-SEC-10] Private Key Management & Frontend Zero-Exposure
- **Severity:** **Informational**
- **Component:** Frontend (`frontend/src/`) & SDK
- **Analysis:**
  Audit of the frontend bundle confirmed that no private keys (`BACKEND_SIGNER_PRIVATE_KEY`, `DEPLOYER_PRIVATE_KEY`, `RELAYER_PRIVATE_KEY`) are present in client-side code or public variables. The client interacts strictly through injected Web3 providers and public API endpoints.
- **Status:** **PASS.**
