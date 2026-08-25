# Auren Protocol — Comprehensive Security Threat Model

**Document Version:** 1.0.0
**Target Environment:** Arc Testnet (Chain ID `5042002`) & Production Architecture
**Scope:** Smart Contracts, ERC-4337 Account Abstraction, Backend Policy Engine & Relayer, TechnoCore Agent Framework, Frontend Interface.

---

## 1. System Architecture & Trust Boundaries

The Auren system consists of five distinct security zones:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE 1: UNTRUSTED CLIENT LAYER                                         │
│ - Browser Web3 Wallets (MetaMask) / Injected Providers                 │
│ - External Autonomous AI Agents                                        │
│ - TechnoCore Public Chat / KV Storage (/r/auren-ops)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Signed Envelopes & UserOps (0 Keys)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE 2: AUREN POLICY ENGINE & RELAYER (SERVER-SIDE ON RENDER)          │
│ - Express API (/sponsor, /agent/*, /agent/submit-userop)               │
│ - In-Memory Policy Checks (Whitelists, Daily Budgets, Rate Limits)     │
│ - Secrets: BACKEND_SIGNER_PRIVATE_KEY, RELAYER_PRIVATE_KEY             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Relayed handleOps() & paymasterAndData
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE 3: ERC-4337 INFRASTRUCTURE ON ARC TESTNET                         │
│ - Canonical EntryPoint v0.6 (0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789)│
│ - SimpleAccountFactory (0x2f1c18afD2536c74371fbaCEa6Ed21efa2D9a139)   │
│ - User Smart Accounts (SimpleAccount / ERC1967Proxy)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Gas Deduction & Execution
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE 4: AUREN PROTOCOL CONTRACTS ON ARC TESTNET                        │
│ - InvestmentPaymaster (0x2a4122372B1A624118Ee3e7D4503B9525CfDE076)     │
│ - DAppVault (0x851bD1E5d9CdeD0f183e861dB98157641C826a74)              │
│ - RevenueSplitter (0x8aA1197eFF337Db0c2aaF9e085c50cB46A7Fb2f7)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Monetization Value Routing
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE 5: INTEGRATED ECOSYSTEM DAPPS (TARGET CONTRACTS)                  │
│ - DemoDApp (0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6)               │
│ - Third-party Arc DApps                                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Threat Vector Evaluation Matrix

| ID | Threat Category | Target Component | Threat Description | Inherent Risk | Residual Risk | Status |
|---|---|---|---|---|---|---|
| **T01** | **Replay Attacks** | `EntryPoint` / `Paymaster` | Replaying intercepted UserOp or Paymaster signature | Critical | Low | **PASS** (Protected by `block.chainid` + `nonce` on-chain) |
| **T02** | **Nonce Reuse** | `SimpleAccount` / `EntryPoint` | Submitting old or duplicate nonces | High | None | **PASS** (Enforced by canonical EntryPoint nonce manager) |
| **T03** | **ChainId Mismatch** | `InvestmentPaymaster` | Replaying testnet signatures on mainnet | Critical | None | **PASS** (Hash strictly incorporates `block.chainid`) |
| **T04** | **EntryPoint Spoofing** | `Paymaster` / `Account` | Malicious contract posing as EntryPoint | Critical | None | **PASS** (EntryPoint is immutable and strictly verified) |
| **T05** | **Paymaster Spoofing** | `DAppVault` | Attacker contract calling `deployCapital` | Critical | None | **PASS** (`deployCapital` allows only bound Paymaster address) |
| **T06** | **Target Contract Spoofing** | Policy Engine / Relayer | Sponsoring gas for unapproved malicious contracts | High | Medium | **NEEDS FIX** (`/sponsor` must enforce strict target contract whitelist check) |
| **T07** | **Function Selector Bypass** | Policy Engine | Sponsoring unauthorized function calls | High | Medium | **NEEDS FIX** (`/sponsor` must decode calldata to verify selector) |
| **T08** | **Malicious Calldata** | `SimpleAccount` | Calldata designed to exploit execution loop | High | Low | **PASS** (SimpleAccount execution reverts atomic state on subcall failure) |
| **T09** | **Arbitrary UserOperations** | Relayer | Relayer broadcasting arbitrary unverified UserOps | High | Medium | **NEEDS FIX** (Relayer must validate policy compliance before relay) |
| **T10** | **Policy Bypass** | Backend `/sponsor` | Circumventing gas limits or budget rules | High | Medium | **NEEDS FIX** (Consolidate validation logic in `PolicyEngine`) |
| **T11** | **Daily Budget Bypass** | Backend State | Budget reset on server reboot or multi-container drift | Medium | Medium | **NEEDS FIX** (Move budget tracking from in-memory to persistent KV/Redis) |
| **T12** | **Rate-Limit Bypass** | Backend State | Attacker rotating sender keypairs | Medium | Medium | **NEEDS FIX** (Apply IP/DID rate limiting in addition to sender address) |
| **T13** | **Relayer Gas Drain** | Relayer Wallet | Forcing relayer to pay L1 gas on reverting ops | High | Medium | **NEEDS FIX** (Pre-simulate `simulateValidation` before `handleOps`) |
| **T14** | **Paymaster Draining** | `InvestmentPaymaster` | Spurring excessive gas usage up to vault balance | High | Low | **PASS** (Capped by `maxGasPerUserOp` and daily budget) |
| **T15** | **Vault Capital Draining** | `DAppVault` | Unauthorized extraction of LP liquidity | Critical | None | **PASS** (Only LPs can withdraw based on proportional shares) |
| **T16** | **Unauthorized Withdrawals** | `DAppVault` | Non-shareholders calling `withdraw()` | Critical | None | **PASS** (Protected by share balance verification) |
| **T17** | **Reentrancy** | `DAppVault` / `Splitter` | Cross-function or subcall reentrancy during payouts | Critical | None | **PASS** (Protected by OpenZeppelin `ReentrancyGuard`) |
| **T18** | **Accounting Insolvency** | `DAppVault` | Share value dilution from unrecovered gas deployment | High | Low | **PASS** (`unrecoveredCapital` prioritized before profit distribution) |
| **T19** | **Integer Rounding** | `DAppVault` | Precision loss in share minting / burning | Low | Low | **PASS** (Standard share math with 18 decimal precision) |
| **T20** | **Inflation Attack** | `DAppVault` | First depositor share inflation exploit | Medium | Low | **PASS** (Burns 1,000 initial dead shares to `address(0)`) |
| **T21** | **Initialization Hijack** | `SimpleAccount` | Front-running proxy `initialize()` call | Critical | None | **PASS** (Atomic initialization inside ERC1967 constructor) |
| **T22** | **Create2 Salt Collision** | `SimpleAccountFactory` | Address collision across distinct owners | High | None | **PASS** (Owner address encoded in initialization calldata) |
| **T23** | **Signature Malleability** | `SimpleAccount` / `Paymaster`| S-value malleability in ECDSA signature recovery | High | None | **PASS** (OpenZeppelin v5 ECDSA library rejects non-canonical s/v) |
| **T24** | **Invalid Owner Signature** | `SimpleAccount` | Executing UserOp without valid EOA signature | Critical | None | **PASS** (Returns `SIG_VALIDATION_FAILED` to EntryPoint) |
| **T25** | **Failed UserOp Handling** | `EntryPoint` | UserOp internal revert handling | Medium | Low | **PASS** (EntryPoint emits `UserOperationRevertReason`, paymaster gas charged) |
| **T26** | **Failed PostOp Handling** | `InvestmentPaymaster` | Gas accounting discrepancy between maxCost and actual | Medium | Low | **NEEDS FIX** (`postOp` should reconcile actual gas deployed) |
| **T27** | **Sponsorship Denial of Service**| Backend / DApp Vault | Malicious actors exhausting daily budget | Medium | Medium | **NEEDS FIX** (Tiered reputation / sybil resistance for agents) |
| **T28** | **Frontend Secret Leak** | Frontend Bundle | Private keys or admin credentials in client code | Critical | None | **PASS** (Zero private keys or backend secrets in frontend) |
| **T29** | **CORS & Public API Abuse**| Backend API | Cross-origin unauthorized invocation | Low | Low | **NEEDS FIX** (Restrict CORS origin in production) |
| **T30** | **TechnoCore Untrusted Input** | Agent Reasoning | Prompt injection or untrusted data from chat | Low | Low | **PASS** (Agent treats chat as untrusted log; validates on-chain via RPC) |
