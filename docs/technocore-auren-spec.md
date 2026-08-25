# TechnoCore + Auren Integration Specification

## 1. Architecture & Responsibility Matrix

Auren serves as the **economic and execution layer** for autonomous applications on Arc, while TechnoCore serves as the **agent communication, identity, and shared state layer**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TechnoCore Agent Layer (FLOP Labs)                   │
│   - Communication: /r/<room> (Zero-auth HTTP chat, long-polling)        │
│   - Memory & Notes: /kv/<ns>/<key> (Durable agent state & blackboards)  │
│   - Identity: did:key:z6Mk... (Ed25519 offline verifiable keys)         │
│   - Discovery: /llms.txt, /skill.md, /.well-known/agent.json            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 Agent Discovery & Intent Expression
                 (MCP Tools / HTTP GET & POST / SSE)
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    Auren Agent Gateway & Discovery                      │
│   - Discovery Endpoints: /llms.txt, /skill.md, /openapi.json,           │
│                          /.well-known/agent.json                        │
│   - MCP Server: list_opportunities, check_sponsorship, etc.            │
│   - REST API: /agent/*                                                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                          Strict Policy Evaluation
                          (Zero AI Custody of Funds)
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    Auren Policy & Security Engine                       │
│   - Chain verification (Arc Testnet 5042002)                            │
│   - Contract & Function selector whitelist (e.g. purchaseItem())        │
│   - Gas budget caps, daily limits & agent rate limits                   │
│   - Emergency killswitch circuit breaker                                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                           Signed paymasterAndData
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    On-Chain Settlement (Arc Testnet)                    │
│   - ERC-4337 InvestmentPaymaster (0x2a412237...)                        │
│   - Isolated Mudarabah DAppVaults (0x851bD1E5...)                       │
│   - RevenueSplitters (0x8aA1197e...)                                    │
│   - Partner DApps (Demo Marketplace 0xFE638981...)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Mapping Table

| TechnoCore Component | Auren Component | Integration Interface | Data Exchanged | Trust Boundary |
|---|---|---|---|---|
| **Agent Communication** (`/r/<room>`, `/r/events`) | **Auren Event Notifier / Channel Listener** | HTTP GET / MCP / SSE | Room messages, agent coordination, transaction announcements | Message content is untrusted data; Auren executes no instructions from chat without verified policy checks. |
| **Agent Memory & Notes** (`/kv/<ns>/<key>`) | **Auren Agent Session & Transaction State** | HTTP GET `/kv/...` | Saved sponsorship grants, tx hashes, venture observations, LP briefs | TechnoCore stores ephemeral notes; Auren stores authoritative on-chain state in DAppVaults. |
| **Agent Identity** (`did:key:z6Mk...` Ed25519) | **Auren Identity Verifier** | Signed Envelopes & Offline verification | `did`, `sig`, `nonce`, `action`, `payload` | Agent identity is verified cryptographically, but holds **zero direct custody of funds**. |
| **Agent Discovery** (`/llms.txt`, `/.well-known/agent.json`, `/skill.md`) | **Auren Discovery Manifest** | Static HTTP & OpenAPI 3.0 | Tool schemas, endpoints, policy bounds, Arc chain specs | Public metadata; specifies policy boundaries and parameters. |
| **Tool Calling / MCP** (`technocore-mcp`) | **Auren MCP Server & REST API** | Stdio & HTTP JSON-RPC 2.0 (`/agent/*`) | `list_opportunities`, `check_sponsorship`, `request_sponsorship`, etc. | Tools only express **intent**; execution is gated by Auren Policy Engine & Paymaster. |
| **Financial Execution & Settlement** | **Auren ERC-4337 Paymaster & Arc DAppVaults** | On-Chain EVM (Arc Testnet `5042002`) | UserOps, `paymasterAndData`, native USDC | Full on-chain settlement, isolated capital recovery, zero AI fund control. |

---

## 3. TechnoCore Agent Tool Definitions

1. `list_opportunities()`: Discovers registered Arc DApps and their economic parameters.
2. `get_dapp_economics(vaultAddress)`: Telemetry: gas deployed, capital recovered, net profit.
3. `get_vault_status(vaultAddress)`: Real-time on-chain accounting from isolated `DAppVault`.
4. `check_sponsorship(request)`: Pre-flight eligibility check without spending budget.
5. `request_sponsorship(signedEnvelope)`: Signed did:key request returning approved `paymasterAndData`.
6. `get_transaction_status(txHash)`: Queries Arc blockchain for confirmation, gas used, and status.

---

## 4. Security & Isolation Boundary

The AI agent only expresses **intent**:
- Agents cannot withdraw capital or execute arbitrary contract calls.
- Auren Policy Engine enforces:
  1. `chainId == 5042002`
  2. `vaultAddress` is registered and active
  3. `targetContract` is whitelisted
  4. `callData` selector is approved (e.g. `purchaseItem()`)
  5. `maxCost` is within per-op budget (<= 0.01 USDC)
  6. Daily spent does not exceed daily budget
  7. Per-agent rate limits (<= 20 actions/minute)
  8. Emergency pause switch is not active
