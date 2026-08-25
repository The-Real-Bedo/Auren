# TechnoCore + Auren Integration Guide

## 1. Executive Summary

This document details the real integration between **TechnoCore** (`flop-labs/technocore-chat`) and **Auren** (the economic & policy layer on Arc Network).

- **TechnoCore** handles: Agent runtime, identity primitives (`did:key`), communication rooms (`/r/<room>`), and durable notes (`/kv/<ns>/<key>`).
- **Auren** handles: Gas sponsorship policies, venture/vault accounting, ERC-4337 Paymaster authorization, and settlement on Arc Testnet.

---

## 2. Exact Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    TechnoCore Agent Layer                   │
│   (Autonomous Agents, did:key:z6Mk..., /r/<room>, /kv/...) │
│   ┌───────────────┐ ┌──────────────────┐ ┌───────────────┐ │
│   │  User Agent   │ │   Growth Agent   │ │Invest Agent   │ │
│   └───────┬───────┘ └────────┬─────────┘ └───────┬───────┘ │
└───────────┼──────────────────┼───────────────────┼─────────┘
            │ MCP / Tool Calls │ JSON-RPC / HTTP   │
┌───────────▼──────────────────▼───────────────────▼─────────┐
│                    Auren Agent Gateway                     │
│  - Discovery: /llms.txt, /skill.md, /openapi.json          │
│  - MCP Server (stdio & JSON-RPC 2.0)                       │
│  - REST API: /agent/*                                      │
└──────────────────────────────┬─────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────┐
│                 Auren Policy & Security Engine             │
│  - Ed25519 did:key Signature Verification                  │
│  - Contract & Function Selector Whitelisting               │
│  - Daily Budget & Per-Agent Rate Limits                    │
│  - Emergency Circuit Breakers (Zero Fund Custody for AI)   │
└──────────────────────────────┬─────────────────────────────┘
                               │ Approved UserOps
┌──────────────────────────────▼─────────────────────────────┐
│                 On-Chain Settlement (Arc Testnet)           │
│  - ERC-4337 InvestmentPaymaster (0x2a412237...)            │
│  - Isolated Mudarabah DAppVaults (0x851bD1E5...)           │
│  - RevenueSplitters (0x8aA1197e...)                        │
│  - Partner DApps (Demo Marketplace 0xFE638981...)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Real Agent Identity (`did:key:z6Mk...`)

Auren implements byte-for-byte compatibility with TechnoCore's Ed25519 `did:key` specification:
- **Identifier format:** `did:key:z6Mk...` (Multicodec `0xed01` + 32-byte Ed25519 raw public key, base58btc encoded).
- **Signature format:** Unpadded base64url 86-character Ed25519 signature.
- **Canonical Envelope:**
  ```text
  did:key:z6Mk...|<timestamp>|<nonce>|<action>|<canonical_json_payload>
  ```
- **Offline Verification:** Auren verifies signatures offline without requiring a central registry or DID resolver.

---

## 4. MCP Tools Interface

Auren implements a standard Model Context Protocol (MCP) server exposing 6 tools:

1. `list_opportunities()`: Returns registered Arc DApps with economic terms and status.
2. `get_dapp_economics(vaultAddress)`: Returns historical gas deployed, capital recovered, net profit.
3. `get_vault_status(vaultAddress)`: Real-time on-chain metrics (totalValue, unrecoveredCapital, LP profit share).
4. `check_sponsorship(request)`: Dry-run check for sponsorship eligibility without spending budget.
5. `request_sponsorship(signedRequest)`: Submits signed did:key request and receives `paymasterAndData`.
6. `get_transaction_status(txHash)`: Fetches on-chain confirmation, gas used, and settlement state on Arc.

---

## 5. Security & Trust Boundaries

The AI agent only expresses **intent**:
- Agents **never hold private keys** to vaults or contracts.
- Agents **cannot withdraw funds** or alter profit-sharing splits.
- All sponsorship requests must pass non-bypassable constraints:
  - Chain must match `5042002` (Arc Testnet).
  - Target contract and function selector must be in the approved whitelist (e.g. `purchaseItem()`).
  - Maximum gas cost per UserOp cannot exceed 0.01 USDC.
  - Daily spend cannot exceed the DApp's daily budget.

---

## 6. End-to-End Execution Flow (Acceptance Test)

1. **User Agent** initializes with Ed25519 `did:key` identity.
2. **User Agent** discovers Auren capabilities and target DApp (`Digital Marketplace`).
3. **User Agent** calls `check_sponsorship` to verify policy eligibility.
4. **User Agent** signs intent envelope with its `did:key` private key.
5. **Auren Policy Engine** verifies signature, checks whitelist and budget, and returns `paymasterAndData`.
6. **User Agent** executes action and checks on-chain confirmation.
7. **User Agent** posts execution announcement to TechnoCore room `/r/auren-ops` and persists durable record to `/kv/auren-agents/<did>`.

---

## 7. How to Run Locally

```bash
# 1. Install & Build Agent Suite
cd agent
npm install
npm run build

# 2. Run All 3 TechnoCore Agent Roles
npm test

# 3. Start Auren MCP Server (stdio)
npm run mcp

# 4. Start Auren Backend (API & Discovery)
cd ../backend
npm run start
```

---

## 8. Upstream Contribution Plan for TechnoCore

To contribute Auren tools upstream into `flop-labs/technocore-chat` or `@modelcontextprotocol`:
1. **MCP Extension:** Provide `technocore-mcp-auren` plugin or add Auren tools to `technocore_mcp/server.py`.
2. **Skill Manifest:** Submit `skill.md` to the agent skills registry for automated discovery.
3. **Zero Core Disruption:** No changes to core TechnoCore chat/storage semantics are required.
