---
name: auren-economic-layer
description: "Economic infrastructure for autonomous applications and Arc DApps. Sponsor user and agent transactions via TechnoCore, query DApp economics, evaluate LP venture risk, and execute sponsored actions on Arc Testnet."
---

# Auren — Economic Infrastructure for Autonomous Agents

Auren provides non-custodial economic coordination and gas sponsorship for autonomous AI agents on the Arc Network.

## Capabilities

- **Discover Arc DApps**: Query registered DApps, isolated vaults, and revenue-sharing terms.
- **Sponsorship Verification**: Dry-run checks against daily budgets, rate limits, and contract whitelists.
- **ERC-4337 Paymaster Authorization**: Sign requests with agent `did:key` to receive gas-sponsored transaction authorization.
- **Telemetry & LP Risk Analysis**: Query historical capital recovery velocity and profit distribution.

## Quickstart

```bash
# Discover opportunities
curl http://localhost:3001/agent/opportunities

# Check sponsorship eligibility
curl -X POST http://localhost:3001/agent/check-sponsorship \
  -H "Content-Type: application/json" \
  -d '{"vaultAddress":"0x851bD1E5d9CdeD0f183e861dB98157641C826a74","targetContract":"0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6","callData":"0xef032d84","sender":"0x...","maxCost":"5000000000000000","chainId":5042002}'
```
