# Auren Protocol — Release Candidate 2 (RC2) Pre-Commit Release Audit

**Audit Date:** August 25, 2026
**Auditor:** Antigravity AI Assistant & Engineering Team
**Scope:** Complete Working-Tree Audit Prior to RC2 Git Staging & Public Testnet Release
**Target Chain:** Arc Testnet (Chain ID `5042002`)
**Specification:** Canonical ERC-4337 v0.6 Account Abstraction & Mudarabah-Inspired Capital Recovery

---

## 1. Granular Working-Tree File Classification

Every modified and untracked file in the repository is strictly classified into exactly one domain:

| File Path | Classification | Purpose & Description |
|---|---|---|
| `src/DAppVault.sol` | **CORE PROTOCOL** | Added `reconcileGasSpent()` and `reclaimPaymasterDeposit()`. |
| `src/InvestmentPaymaster.sol` | **CORE PROTOCOL** | Implemented `postOp` reconciliation and `withdrawDepositToVault()`. |
| `src/SimpleAccount.sol` | **ERC4337** | Minimal ERC-4337 v0.6 Smart Account contract. |
| `src/SimpleAccountFactory.sol` | **ERC4337** | Deterministic `CREATE2` factory (`ERC1967Proxy`) for smart accounts. |
| `sdk/src/index.ts` | **CORE PROTOCOL** | Added `signUserOp()`, `getVaultStats()`, `processRevenue()`. |
| `sdk/package.json` | **CORE PROTOCOL** | SDK package configuration. |
| `sdk/package-lock.json` | **CORE PROTOCOL** | SDK dependency lock. |
| `agent/package-lock.json` | **CORE PROTOCOL** | Agent dependency lock. |
| `backend/src/index.ts` | **BACKEND SECURITY** | Strict policy verification, rate limiting, pre-simulation, and CORS. |
| `backend/src/registry/dappRegistry.ts` | **BACKEND SECURITY** | Authoritative DApp registry & recursive calldata decoder. |
| `backend/src/storage/policyStore.ts` | **BACKEND SECURITY** | Atomic, concurrency-safe persistent daily budget store. |
| `backend/src/middleware/rateLimiter.ts` | **BACKEND SECURITY** | Multi-layered anti-sybil rate limiter (IP, DID, Account). |
| `backend/package.json` | **BACKEND SECURITY** | Backend dependencies (`cors`, `express`, `ethers`). |
| `backend/package-lock.json` | **BACKEND SECURITY** | Backend dependency lock. |
| `backend/test.ts` | **TEST** | Core backend unit tests. |
| `backend/test/adversarial.test.ts` | **TEST** | 10-scenario adversarial attack test suite. |
| `test/Invariants.t.sol` | **TEST** | Foundry invariant and property fuzz tests (10,000 runs). |
| `test/SimpleAccount.t.sol` | **TEST** | Counterfactual smart account and deposit recovery tests. |
| `foundry.toml` | **DEPLOYMENT TOOLING** | Foundry compiler & optimizer configuration. |
| `script/DeploySimpleAccountFactory.s.sol` | **DEPLOYMENT TOOLING** | Deployment script for `SimpleAccountFactory`. |
| `script/runErc4337ReleaseVerification.ts` | **TEST** | Controlled on-chain verification script for Testnet RC. |
| `.gitignore` | **DEPLOYMENT TOOLING** | Production-grade ignore rules (secrets, build artifacts, budget stores). |
| `frontend/src/app/page.tsx` | **FRONTEND PRODUCT** | Product homepage with 3-audience selector and 5-step loop. |
| `frontend/src/app/users/page.tsx` | **FRONTEND PRODUCT** | Plain-English user onboarding experience. |
| `frontend/src/app/capital/page.tsx` | **FRONTEND PRODUCT** | LP venture hub & risk disclosures (no APY/hype). |
| `frontend/src/app/build/page.tsx` | **FRONTEND PRODUCT** | Canonical Developer Hub with 5-step quickstart. |
| `frontend/src/app/explore/page.tsx` | **FRONTEND PRODUCT** | Directory separating DemoDApp and Partner applications. |
| `frontend/src/app/agent-demo/page.tsx` | **FRONTEND PRODUCT** | Real live interactive ERC-4337 console. |
| `frontend/src/app/layout.tsx` | **FRONTEND PRODUCT** | Metadata, OpenGraph social sharing, and SEO configuration. |
| `frontend/src/components/Nav.tsx` | **FRONTEND PRODUCT** | Unified product navigation & Web3 wallet connection. |
| `frontend/src/config/contracts.ts` | **FRONTEND PRODUCT** | Verified contract addresses on Arc Testnet. |
| `frontend/package.json` | **FRONTEND PRODUCT** | Frontend dependencies (`sharp`, `ethers`, `next`). |
| `frontend/package-lock.json` | **FRONTEND PRODUCT** | Frontend dependency lock. |
| `frontend/tsconfig.json` | **FRONTEND PRODUCT** | Next.js TypeScript configuration. |
| `frontend/scripts/generate-brand-assets.js` | **DEPLOYMENT TOOLING** | Script to generate crisp SVG and PNG brand assets. |
| `frontend/public/brand/logo/auren-logo-mark.svg` | **BRANDING** | Standalone gold geometric brand mark. |
| `frontend/public/brand/logo/auren-logo-primary.svg`| **BRANDING** | Horizontal primary logo with wordmark. |
| `frontend/public/brand/logo/auren-logo-white.svg`  | **BRANDING** | Monochrome white logo for dark contexts. |
| `frontend/public/brand/logo/auren-logo-black.svg`  | **BRANDING** | Monochrome dark logo for light contexts. |
| `frontend/public/brand/social/auren-x-profile.png` | **BRANDING** | Twitter/X profile asset (400x400). |
| `frontend/public/brand/social/auren-x-header.png`  | **BRANDING** | Twitter/X banner asset (1500x500). |
| `frontend/public/brand/social/auren-og-image.png`  | **BRANDING** | OpenGraph social preview asset (1200x630). |
| `frontend/public/brand/background/auren-hero-background.png` | **BRANDING** | High-resolution background texture (1920x1080). |
| `frontend/public/brand/background/auren-profile-background.png` | **BRANDING** | High-resolution ambient background (1920x1080). |
| `frontend/public/brand/README.md` | **DOCUMENTATION** | Brand guidelines, asset dimensions, and color palette. |
| `docs/browser-erc4337-architecture.md` | **DOCUMENTATION** | End-to-end ERC-4337 browser architecture. |
| `docs/browser-erc4337-e2e.md` | **DOCUMENTATION** | E2E execution specification. |
| `docs/live-browser-erc4337-verification.md` | **DOCUMENTATION** | Live Arc Testnet execution logs and receipts. |
| `docs/security/internal-security-audit.md` | **DOCUMENTATION** | 30-category security vulnerability audit. |
| `docs/security/threat-model.md` | **DOCUMENTATION** | Attack vectors and trust boundary matrix. |
| `docs/security/remediation-report.md` | **DOCUMENTATION** | Security fixes and code remediations. |
| `docs/security/production-readiness.md` | **DOCUMENTATION** | Pre-mainnet operational criteria. |
| `docs/security/release-candidate-verification.md` | **DOCUMENTATION** | RC1 release verification report. |

---

## 2. Solidity & Smart Contract Security Audit

### 2.1 `src/DAppVault.sol`
- **What Changed:**
  1. `deployCapital(uint256 amount)`: Changed visibility to `public` and permitted both `paymaster` and `developer` to fund EntryPoint on-demand.
  2. `fundPaymasterDeposit(uint256 amount)`: Added alias for Paymaster pre-funding.
  3. `reconcileGasSpent(uint256 actualCost, uint256 reservedCost)`:
     - Access Control: Only callable by `paymaster` (`msg.sender == paymaster`).
     - Logic: Calculates unused gas (`reservedCost - actualCost`) and safely decrements `totalGasDeployed` and `unrecoveredCapital`.
     - Invariant: `totalGasDeployed` is bounded; never underflows.
  4. `reclaimPaymasterDeposit(uint256 amount)`:
     - Access Control: Only callable by `developer` or `factory` (`msg.sender == developer || msg.sender == factory`).
     - Logic: Instructs `InvestmentPaymaster` to withdraw excess EntryPoint deposits back into the vault, preventing capital lockup.
- **Economic Assumptions:**
  - Preserves 100% of Mudarabah venture economics: capital is recovered first from top-line revenue before 50/50 profit sharing. `reconcileGasSpent` enhances accuracy by charging vaults only for actual gas consumed on-chain.
- **Upgradeability & Trust Assumptions:**
  - Contracts are 100% immutable (non-proxy). Zero admin upgrade backdoors.

### 2.2 `src/InvestmentPaymaster.sol`
- **What Changed:**
  1. `validatePaymasterUserOp`: Returns `abi.encode(maxCost)` in context for post-operation reconciliation.
  2. `postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost)`: Decodes `maxCost` and triggers `vault.reconcileGasSpent(actualGasCost, maxCost)`.
  3. `withdrawDepositToVault(uint256 amount)`: Authorized to `vault` or `vault.developer()`, calling `entryPoint.withdrawTo(vault, amount)`.
  4. Added `receive() external payable {}`.
- **Access Control:**
  - Validation and PostOp are strictly restricted to `msg.sender == address(entryPoint)`.
  - Signature recovery requires exact ECDSA match with `backendSigner`.

### 2.3 `src/SimpleAccount.sol` & `src/SimpleAccountFactory.sol`
- **Architecture:** Canonical ERC-4337 v0.6 Smart Account and deterministic `CREATE2` Factory (`ERC1967Proxy`).
- **Access Control:**
  - Account execution (`execute`, `executeBatch`) restricted to `owner` or `entryPoint`.
  - Initializers disabled in implementation constructor (`_disableInitializers()`).
  - Signature verification (`_validateSignature`) strictly recovers the `owner` address from `userOpHash.toEthSignedMessageHash()`.

---

## 3. Deployment Impact & Contract Compatibility Matrix

| Contract Component | Existing Deployed Address (Arc Testnet) | Requires Redeployment for Testnet? | Safe for Public RC2? | Mainnet Impact |
|---|---|---|---|---|
| **EntryPoint v0.6** | `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` | **NO** | **YES** | Canonical singleton. |
| **SimpleAccountFactory** | `0x2f1c18afD2536c74371fbaCEa6Ed21efa2D9a139` | **NO** | **YES** | Deployed & verified. |
| **InvestmentPaymaster** | `0x2a4122372B1A624118Ee3e7D4503B9525CfDE076` | **NO** | **YES** | Live with 4.988 USDC deposit. |
| **DAppVault** | `0x851bD1E5d9CdeD0f183e861dB98157641C826a74` | **NO** | **YES** | Live with 47.514 USDC TVL. |
| **RevenueSplitter** | `0x8aA1197eFF337Db0c2aaF9e085c50cB46A7Fb2f7` | **NO** | **YES** | Bound to DAppVault. |
| **DemoDApp** | `0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6` | **NO** | **YES** | Target marketplace contract. |
| **MudarabahVaultFactory** | `0x8CB1E0Dcd5dA6F8C17b83535B4307128701BA7ab` | **NO** | **YES** | Mainnet will use new bytecode. |

> **Note on Testnet vs Mainnet:** Existing deployed testnet contracts (`0x851b...` and `0x2a41...`) continue to operate without breaking. New bytecode improvements (`reconcileGasSpent` and `reclaimPaymasterDeposit`) will be deployed during the official Mainnet rollout.

---

## 4. Brand Asset Audit (`frontend/public/brand/`)

All 9 brand assets were verified for integrity, dimensions, and visual fidelity:

- `logo/auren-logo-mark.svg` — 256x256 vector mark (460 B)
- `logo/auren-logo-primary.svg` — 600x160 horizontal logo (906 B)
- `logo/auren-logo-white.svg` — 600x160 monochrome white (710 B)
- `logo/auren-logo-black.svg` — 600x160 monochrome dark (710 B)
- `social/auren-x-profile.png` — **400 × 400 px PNG** (15 KB)
- `social/auren-x-header.png` — **1500 × 500 px PNG** (55 KB)
- `social/auren-og-image.png` — **1200 × 630 px PNG** (73 KB)
- `background/auren-hero-background.png` — **1920 × 1080 px PNG** (90 KB)
- `background/auren-profile-background.png` — **1920 × 1080 px PNG** (78 KB)
- `README.md` — Contributor brand guidelines & color tokens.

---

## 5. Product Routes & Navigation Verification

- **Routes Checked:**
  - `/` (Home) $\rightarrow$ Product positioning, 3-audience selector, 5-step loop.
  - `/users` $\rightarrow$ Plain-English user benefits, zero-gas onboarding.
  - `/build` $\rightarrow$ Canonical Developer Hub with 5-step integration.
  - `/capital` $\rightarrow$ LP venture hub, revenue-first recovery, risk disclosures.
  - `/explore` $\rightarrow$ Clean separation of DemoDApp and Partner Applications.
  - `/agent-demo` $\rightarrow$ Live ERC-4337 console with verified on-chain metrics.
  - `/technocore` $\rightarrow$ TechnoCore runtime vs Auren economic layer.
  - `/demo` $\rightarrow$ Interactive commerce demonstration.
  - `/dev` $\rightarrow$ Correctly redirects to `/build`.
- **Navigation & Links:** Zero broken internal links. Zero hardcoded `localhost` URLs in production bundles.

---

## 6. Real ERC-4337 Execution & Security Verification

A live, non-reused, user-signed sponsored transaction was verified on Arc Testnet:

- **Transaction Hash:** [`0x2b7c88f783592459bad26383e009bab6bbd267be87804b27971706f35e3b4223`](https://testnet.arcscan.app/tx/0x2b7c88f783592459bad26383e009bab6bbd267be87804b27971706f35e3b4223)
- **UserOp Hash:** `0x8a36b38daeab9888da0b427fb7f7f488f4c7429bf83d8481e0aab32646db69df`
- **Confirmed Block:** `#58781676` (Gas: `153,504`)
- **Gas Paid by Paymaster:** `0.003719012 USDC` (Deducted from EntryPoint deposit)
- **User EOA Gas Cost:** **`0.00 USDC`** (100% Sponsored)
- **TechnoCore Synchronization:** Broadcast confirmed in room `/r/auren-ops` (Seq #6) and KV note `/kv/auren-rc/2b7c88f783592459bad26383e009bab6`.

---

## 7. Comprehensive Test Suite Results

```bash
# 1. TypeScript Packages
✓ sdk: build succeeded
✓ agent: build succeeded
✓ backend: build succeeded
✓ frontend: 15/15 static pages prerendered in 481ms (0 errors)

# 2. Backend Unit & Adversarial Tests
✓ 10/10 Adversarial Attack Scenarios Blocked (0 Gas Burned)
  - Missing fields (400)
  - Unregistered vault (403)
  - Forged Paymaster (403)
  - Chain mismatch (403)
  - Unauthorized target (403)
  - Unauthorized selector (403)
  - Gas limit violation (403)
  - Valid sponsorship (200)
  - Daily budget exhaustion (429)
  - Relayer simulation failure (400)

# 3. Foundry Smart Contract Suite
✓ 4 Test Suites, 13 Tests Total, 20,000 Fuzz Runs (100% PASS, 0 Failures)
  - DemoDAppTest: 2 passed
  - SimpleAccountTest: 2 passed
  - InvariantsTest: 8 passed (Fuzz: 10,000 runs)
  - IsolatedVaultTest: 1 passed (Fuzz: 10,000 runs)
```

---

## 8. Files Safe to Commit vs. Excluded Files

### 8.1 Files Safe to Commit
- All files in `src/`, `test/`, `script/`.
- All files in `sdk/src/`, `sdk/package.json`.
- All files in `backend/src/`, `backend/test/`, `backend/package.json`.
- All files in `frontend/src/`, `frontend/public/brand/`, `frontend/package.json`.
- All files in `docs/security/`, `docs/release/`.
- `.gitignore`, `foundry.toml`.

### 8.2 Excluded Files (Never Commit)
- `.env`, `.env.*`, `.env.save`
- `backend/.auren_budget_store.json` (Ignored by `.gitignore`)
- `node_modules/`, `cache/`, `out/`, `broadcast/`, `dist/`, `.next/`

---

## 9. Final Pre-Commit Release Verdict

```yaml
SAFE TO COMMIT: YES
REQUIRES CONTRACT REDEPLOY: NO
TESTNET RC2 READY: YES
```
