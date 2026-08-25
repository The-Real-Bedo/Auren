# Auren + TechnoCore: Integration Architecture

## 1. System Overview

**Auren** is the economic and execution infrastructure for autonomous applications and Arc DApps.
**TechnoCore** is the agent communication, identity, and execution runtime layer.

```
┌─────────────────────────────────────────────────────────────┐
│                    TechnoCore Agent Layer                   │
│   (Autonomous Agents, did:key Identity, Action Planning)   │
│   ┌───────────────┐ ┌──────────────────┐ ┌───────────────┐ │
│   │  User Agent   │ │   Growth Agent   │ │Invest Agent   │ │
│   └───────┬───────┘ └────────┬─────────┘ └───────┬───────┘ │
└───────────┼──────────────────┼───────────────────┼─────────┘
            │ MCP / Tool Calls │ JSON-RPC / HTTP   │
┌───────────▼──────────────────▼───────────────────▼─────────┐
│                    Auren Agent Gateway                     │
│  - MCP Server (stdio / HTTP)                               │
│  - Agent API Router (/agent/api)                           │
│  - Tools: listOpportunities, checkSponsorship, etc.        │
└──────────────────────────────┬─────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────┐
│                 Auren Policy & Security Engine             │
│  - did:key Signature Verification                          │
│  - Action Whitelisting & Selector Verification             │
│  - Per-Agent / Daily Rate & Budget Limits                  │
│  - Emergency Circuit Breakers (Pause / Killswitch)         │
└──────────────────────────────┬─────────────────────────────┘
                               │ Approved UserOps
┌──────────────────────────────▼─────────────────────────────┐
│                 On-Chain Settlement (Arc Testnet)           │
│  - ERC-4337 InvestmentPaymaster                            │
│  - Isolated Mudarabah DAppVaults                           │
│  - RevenueSplitters (Capital Recovery -> Profit Sharing)   │
│  - Registered Partner DApps (e.g. DemoDApp Marketplace)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Separation of Concerns: Auren vs. TechnoCore

| Responsibility | Auren (Economic Layer) | TechnoCore (Agent Layer) |
|---|---|---|
| **Identity & Authentication** | Verifies agent signatures via `did:key` public keys without custody | Generates and manages agent cryptographic keys (`did:key`) |
| **Capital & Vaults** | Holds LP capital in isolated `DAppVault` smart contracts; manages capital recovery | **Zero access / custody** of vault funds or private keys |
| **Policy & Permissions** | Enforces allowed chains, target contracts, call selectors, rate limits, daily caps | Plans actions and requests pre-flight checks against policy |
| **Gas Sponsorship** | Signs ERC-4337 `paymasterAndData` via backend signer to fund transactions | Requests sponsorship envelope for approved on-chain calls |
| **Economic Analysis** | Exposes verified on-chain metrics (TVL, unrecovered capital, profit share) | Analyzes telemetry (Growth Agent) or LP risk (Investment Agent) |
| **Transaction Execution** | Bundles or validates UserOps through canonical EntryPoint v0.6 | Submits transaction or delegates to paymaster |

---

## 3. Cryptographic Agent Identity (`did:key` Signed-Write Model)

TechnoCore agents authenticate to Auren using a standard `did:key` envelope. The agent creates a signed payload:

```json
{
  "did": "did:key:z6MkuT...",
  "timestamp": 1787588000000,
  "nonce": "a8f93b...",
  "action": "requestSponsorship",
  "payload": {
    "vaultAddress": "0x851bD1E5d9CdeD0f183e861dB98157641C826a74",
    "targetContract": "0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6",
    "callData": "0x446e6... (purchaseItem)",
    "maxCost": "5000000000000000"
  },
  "signature": "0x7a8b9c..."
}
```

Auren validates:
1. `did` public key resolves and verifies `signature` over `(timestamp, nonce, action, payload)`.
2. Timestamp is within a strict replay window (e.g. ±60s) and `nonce` is unique.
3. The agent is authorized for the target DApp action.

---

## 4. Policy Engine Constraints

Every agent sponsorship request is subject to non-bypassable constraints:
1. **Chain Whitelist:** Must match `5042002` (Arc Testnet).
2. **Registered DApp & Vault:** Target vault must be active and mapped in Auren.
3. **Contract & Function Whitelist:** Call target and function selector must be explicitly permitted (e.g. `purchaseItem()`). Arbitrary contract calls or vault withdrawal calls are strictly rejected.
4. **Gas Budget & Rate Limits:**
   - Maximum gas cost per UserOp (e.g. 0.005 USDC).
   - Maximum daily budget per DApp (e.g. 50 USDC/day).
   - Per-agent rate limits (e.g. max 5 actions/min).
5. **Emergency Pause:** Global or per-vault pause switch stops all sponsorship immediately.

---

## 5. Agent Tools (Public Interface)

Exposed via TypeScript SDK, REST API (`/agent/api`), and MCP server (`/agent/mcp`):

1. `listOpportunities()`: Returns registered Arc DApps with economic terms and status.
2. `getDAppEconomics(vaultAddress)`: Returns historical gas deployed, capital recovered, net profit.
3. `getVaultStatus(vaultAddress)`: Real-time on-chain metrics (totalValue, unrecoveredCapital, LP profit share).
4. `checkSponsorship(request)`: Dry-run check for sponsorship eligibility without spending budget.
5. `requestSponsorship(signedRequest)`: Submits signed did:key request and receives `paymasterAndData`.
6. `getTransactionStatus(txHash)`: Fetches on-chain confirmation, gas used, and settlement state on Arc.

---

## 6. The Three Autonomous Agent Roles

1. **User Agent (Autonomous Consumer):**
   - Discovers registered Arc DApps.
   - Evaluates desired interaction.
   - Requests sponsorship via Auren Policy Engine.
   - Submits sponsored transaction on Arc.
   - Verifies execution confirmation.

2. **Growth Agent (Autonomous Strategist):**
   - Telemetry analytics: queries sponsorship burn vs. revenue generation.
   - Computes CAC (Customer Acquisition Cost) in gas vs. LTV/revenue.
   - Recommends policy adjustments (e.g., recommend increase daily budget for high-converting contracts).

3. **Investment Agent (LP Risk & Capital Analyst):**
   - Evaluates LP opportunities across active vaults.
   - Assesses capital at risk (`unrecoveredCapital`), recovery velocity, and profit sharing terms.
   - Produces risk/return assessments without having custody or trading permissions.
