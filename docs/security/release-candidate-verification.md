# Auren Protocol — Release Candidate Verification Report

**Release Candidate Version:** 1.0.0-rc1
**Verification Date:** August 25, 2026
**Target Chain:** Arc Testnet (Chain ID `5042002`)
**Specification:** Canonical ERC-4337 v0.6 Account Abstraction
**Final Classification:** **TESTNET RELEASE CANDIDATE — PASS**

---

## 1. Git Commit & Repository Verification

- **Repository Base Commit:** `2a31955d084b7e3d29b395fefe6f0615aa5e5bb1`
- **Monorepo Build Status:**
  - `sdk` $\rightarrow$ `tsc` **(PASS)**
  - `agent` $\rightarrow$ `tsc` **(PASS)**
  - `backend` $\rightarrow$ `tsc` **(PASS)**
  - `frontend` $\rightarrow$ `next build` (13/13 static routes prerendered) **(PASS)**
- **Foundry Test Suite:**
  - 4 Test Suites, 13 Tests Total, 20,000 Fuzz Runs **(100% PASS, 0 Failures)**

---

## 2. Render Production Verification

- **Service URL:** `https://auren-cc2f.onrender.com`
- **Verified Endpoints:**
  - `GET /health` $\rightarrow$ HTTP 200 (`status: ok`, Chain ID `5042002`, RPC `https://rpc.testnet.arc.network`)
  - `GET /agent/opportunities` $\rightarrow$ HTTP 200 (Active Demo DApp `0x851bD1E5d9CdeD0f183e861dB98157641C826a74`)
  - `GET /llms.txt` $\rightarrow$ HTTP 200 (Agent discovery specification)
  - `GET /skill.md` $\rightarrow$ HTTP 200 (TechnoCore skill definition)
  - `GET /.well-known/agent.json` $\rightarrow$ HTTP 200 (A2A capabilities manifest)
  - `GET /openapi.json` $\rightarrow$ HTTP 200 (OpenAPI 3.0.3 specification)
- **Security Check:** Zero private keys or internal credentials exposed in responses. Strict CORS active.

---

## 3. Vercel Production Verification

- **Frontend URL:** `https://auren-build.vercel.app`
- **Client Bundle Audit:**
  - Zero private keys (`DEPLOYER_PRIVATE_KEY`, `BACKEND_SIGNER_PRIVATE_KEY`, `RELAYER_PRIVATE_KEY`) present in client-side JS.
  - All API calls route through `NEXT_PUBLIC_AUREN_API_URL`.
- **Public Routes Verified:**
  - `/` — Homepage & Liquidity Hub
  - `/agent-demo` — Live ERC-4337 Interactive Console
  - `/build` — Official Developer Hub (Active route)
  - `/technocore` — Autonomous Agent Terminal
  - `/demo` — Interactive DApp Marketplace
  - `/explore` — Ecosystem Venture Directory

---

## 4. Real Live ERC-4337 Execution Proof on Arc Testnet

A controlled live ERC-4337 sponsored execution was broadcast and confirmed on Arc Testnet:

| Metric | Verified On-Chain Value |
|---|---|
| **Transaction Hash** | [`0x2b7c88f783592459bad26383e009bab6bbd267be87804b27971706f35e3b4223`](https://testnet.arcscan.app/tx/0x2b7c88f783592459bad26383e009bab6bbd267be87804b27971706f35e3b4223) |
| **UserOperation Hash** | `0x8a36b38daeab9888da0b427fb7f7f488f4c7429bf83d8481e0aab32646db69df` |
| **Confirmed Block** | `58781676` |
| **Gas Used** | `153,504` |
| **Smart Account Address** | `0xA32F89a543C36A678e0c03C022CB39abB14e49CE` |
| **Connected EOA Owner** | `0x30080EF681349fAca4808a78a292264A5310Ce2b` |
| **InvestmentPaymaster** | `0x2a4122372B1A624118Ee3e7D4503B9525CfDE076` |
| **Target DApp** | `0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6` |
| **EntryPoint Singleton** | `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` |
| **Actual Gas Paid by Paymaster** | **`0.003719012 USDC`** (Deducted from EntryPoint deposit) |
| **Actual Gas Paid by User EOA** | **`0.00 USDC`** (100% Zero-Gas Sponsorship) |
| **Smart Account Purchases Delta** | `1` $\rightarrow$ `2` (+1 item purchased) |

---

## 5. Live Accounting Reconciliation Before & After Execution

| State Variable | Value Before Execution | Value After Execution | Net Change / Explanation |
|---|---|---|---|
| **Vault TVL** | `47.517533288 USDC` | `47.514314276 USDC` | `-0.003219012 USDC` (Net of item purchase + gas charged) |
| **Total Gas Deployed** | `0.00 USDC` | `0.00 USDC` | Existing Paymaster EntryPoint deposit utilized |
| **Total Capital Recovered** | `0.00 USDC` | `0.00 USDC` | Prior to threshold recovery trigger |
| **Unrecovered Capital** | `0.00 USDC` | `0.00 USDC` | Zero unrecovered risk |
| **Paymaster EntryPoint Deposit**| `4.992533288 USDC` | `4.988814276 USDC` | **`-0.003719012 USDC` (Exact Gas Consumed)** |
| **Smart Account Purchases** | `1` | `2` | **`+1` (Item recorded on-chain)** |

---

## 6. TechnoCore Coordination & Verification

- **Public Room Broadcast (`/r/auren-ops`):**
  `[RC VERIFIED] ERC-4337 UserOp: 0x8a36b38daeab98… | Block #58781676 | Tx: 0x2b7c88f7835924… | Paymaster Gas: 0.003719012 USDC` (Sequence #6 confirmed).
- **Persistent Note (`/kv/auren-rc/2b7c88f783592459bad26383e009bab6`):**
  Immutable execution receipt stored with full metadata, gas used, timestamp, and addresses.

---

## 7. Security Regression Test Suite (10 Scenarios)

All 10 adversarial attacks against `/sponsor` and `/agent/submit-userop` were verified as rejected:

1. **Missing Required Fields:** Rejected with `HTTP 400` (`PASS`).
2. **Forged / Unregistered DApp Vault:** Rejected with `HTTP 403` (`PASS`).
3. **Forged Paymaster Address:** Rejected with `HTTP 403` (`PASS`).
4. **Wrong Chain ID (e.g. Mainnet instead of Arc):** Rejected with `HTTP 403` (`PASS`).
5. **Unauthorized Target Contract Execution:** Rejected with `HTTP 403` (`PASS`).
6. **Unauthorized Function Selector (Arbitrary calldata):** Rejected with `HTTP 403` (`PASS`).
7. **Excessive Gas Limit Requested:** Rejected with `HTTP 403` (`PASS`).
8. **Legitimate Sponsorship Authorization:** Approved with `HTTP 200` (`PASS`).
9. **Daily Budget Exhaustion Enforcement:** Blocked with `HTTP 429` (`PASS`).
10. **Relayer Pre-Simulation Failure:** Rejected with `HTTP 400` with zero gas burned (`PASS`).

---

## 8. Final Production Environment Configuration

```bash
# ==============================================================================
# Auren Backend Production Environment Configuration (Render)
# ==============================================================================

PORT=3001
ARC_RPC_URL=https://rpc.testnet.arc.network
CHAIN_ID=5042002

# Role-Separated Keys (NEVER REUSE ACROSS ROLES)
BACKEND_SIGNER_PRIVATE_KEY=0x...   # Signs paymasterAndData envelopes only
RELAYER_PRIVATE_KEY=0x...          # Submits handleOps transactions only

# Note: DEPLOYER_PRIVATE_KEY is NOT required in the backend runtime.

# Infrastructure & CORS
FACTORY_ADDRESS=0x8CB1E0Dcd5dA6F8C17b83535B4307128701BA7ab
ALLOWED_ORIGINS=https://auren-build.vercel.app,http://localhost:3000,http://localhost:3001
NODE_ENV=production
```

---

## 9. Remaining Limitations & Mainnet Pre-Requisites

1. **External Third-Party Audit Required:**
   Formal security review by an external smart contract auditing firm is mandatory before deploying real financial capital to mainnet.
2. **Mainnet Canonical EntryPoint v0.6 Deployment:**
   Verification that the canonical EntryPoint v0.6 singleton is initialized on Arc Mainnet with equivalent gas parameters.
3. **Dedicated Bundler Integration (ERC-4337 P2P Network):**
   For scale, transition from single relayer execution to an Alto / Stackup / Pimlico P2P bundler node network.

---

## 10. Release Candidate Verdict

# **TESTNET RELEASE CANDIDATE — PASS**
