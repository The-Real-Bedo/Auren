# AUREN

> **The economic layer for autonomous applications.**

Auren is an economic execution layer for applications and autonomous agents running on **Arc Testnet**.

It combines **ERC-4337 Account Abstraction**, programmable gas sponsorship, policy-controlled execution, isolated application vaults, and on-chain revenue settlement.

Auren is designed to make application and agent activity economically executable while keeping users in control of their wallets.

---

## Live on Arc Testnet

**Network:** Arc Testnet
**Chain ID:** `5042002`

### Explore Auren

🌐 **Website**
https://auren-build.vercel.app

🛒 **Consumer Demo**
https://auren-build.vercel.app/demo

🤖 **Live Agent Execution**
https://auren-build.vercel.app/agent-demo

🛠️ **Developer Hub**
https://auren-build.vercel.app/build

🧠 **TechnoCore Integration**
https://auren-build.vercel.app/technocore

💻 **GitHub**
https://github.com/The-Real-Bedo/Auren

---

# What Auren Does

Auren sits between application activity and the economic resources required to execute that activity.

At a high level:

```text
User / Agent
      ↓
Auren Policy Engine
      ↓
ERC-4337 UserOperation
      ↓
Auren Paymaster
      ↓
Arc EntryPoint
      ↓
Application
      ↓
Revenue Settlement
      ↓
Application Vault
```

Eligible actions can be executed with **transaction gas sponsored by Auren**, while the user's wallet remains non-custodial.

The user still pays the actual product or application price when applicable. Auren sponsors the transaction gas separately.

---

# Why Auren?

Blockchain applications often introduce unnecessary friction:

* Users need to think about transaction gas.
* Developers need to manage sponsorship rules.
* Autonomous agents need controlled ways to execute transactions.
* Application growth requires capital.
* Sponsorship spending needs measurable economic outcomes.

Auren connects these pieces into one economic execution layer.

```text
Capital
   ↓
Application Growth
   ↓
Sponsored Activity
   ↓
Revenue
   ↓
Capital Recovery
   ↓
Profit Sharing
```

---

# For Users

Auren allows eligible applications to sponsor transaction gas.

### Example

```text
Item Price
10.00 USDC

Transaction Gas
Sponsored by Auren

User Gas
0.00 USDC
```

The user connects their own wallet, approves the action, and keeps control of their assets and signing authority.

### Try it

https://auren-build.vercel.app/demo

The consumer demo runs on Arc Testnet and performs real ERC-4337 transactions.

---

# For Developers

Auren gives Arc applications a programmable sponsorship layer.

Developers can define policies around:

* supported DApps
* allowed contracts
* allowed function selectors
* maximum gas sponsorship
* action limits
* daily sponsorship budgets
* application activity

The Developer Hub contains the current integration flow, SDK examples, API references, and architecture:

https://auren-build.vercel.app/build

### Integration flow

```text
Register Application
        ↓
Define Policy
        ↓
Configure Sponsorship
        ↓
Integrate SDK
        ↓
Test on Arc Testnet
        ↓
Launch
```

---

# For Autonomous Agents

Auren allows autonomous agents to participate in controlled on-chain execution.

A typical flow is:

```text
Discover
   ↓
Evaluate
   ↓
Authorize
   ↓
Build UserOperation
   ↓
Execute
   ↓
Settle
```

Agents can discover eligible opportunities, evaluate sponsorship policies, request authorization, and execute supported actions through ERC-4337 Smart Accounts.

Auren is also integrated with **TechnoCore** for agent identity, communication, and state synchronization.

### Live Agent Demo

https://auren-build.vercel.app/agent-demo

The demo executes real sponsored UserOperations on Arc Testnet.

---

# For Capital Providers

Auren uses isolated application-level ventures rather than relying on one global pool for every application.

Capital can be deployed toward application growth, while application revenue is used for revenue-first recovery of deployed sponsorship capital before profit sharing according to the venture terms.

Example lifecycle:

```text
Capital Supplied
      ↓
Capital Deployed
      ↓
Application Activity
      ↓
Revenue Generated
      ↓
Capital Recovered
      ↓
Profit Sharing
```

The system tracks on-chain metrics such as:

* capital supplied
* capital deployed
* capital recovered
* unrecovered capital
* application revenue
* realized profit
* LP share

### Important

Returns are not guaranteed.

Losses are possible.

Auren is currently a public testnet system and should not be treated as a production investment product.

---

# ERC-4337 Account Abstraction

Auren uses ERC-4337 Account Abstraction to separate:

**User authorization**

from

**transaction submission**

and

**gas sponsorship**

The current architecture includes:

```text
User EOA
    ↓
SimpleAccount
    ↓
UserOperation
    ↓
Auren Paymaster
    ↓
EntryPoint v0.6
    ↓
Arc
```

The connected user signs the UserOperation.

The Auren Relayer submits the operation.

The Auren Paymaster covers the execution gas.

---

# Policy-Controlled Sponsorship

Auren does not blindly sponsor arbitrary transactions.

The backend policy layer validates the requested operation before authorization.

Policies can enforce:

* approved DApps
* approved target contracts
* approved function selectors
* gas limits
* action limits
* daily sponsorship budgets
* sender and agent controls
* chain and EntryPoint validation

Unknown or unauthorized operations are rejected.

The current DemoDApp sponsorship policy uses a maximum per-operation sponsorship envelope of:

```text
0.01 USDC
```

---

# Paymaster

The Auren InvestmentPaymaster participates directly in the ERC-4337 execution path.

Conceptually:

```text
UserOperation
      ↓
EntryPoint
      ↓
InvestmentPaymaster
      ↓
DAppVault
```

The Paymaster provides gas sponsorship through the EntryPoint while application-level accounting remains connected to the corresponding venture vault.

The current testnet implementation also reconciles actual gas usage rather than assuming that the maximum reserved gas was fully consumed.

---

# Application Vaults

Each application can operate through an isolated economic structure.

The vault tracks values including:

```text
Total Value
Total Gas Deployed
Total Capital Recovered
Unrecovered Capital
```

The architecture is designed to keep application economics isolated and prevent one application from silently sharing the economic state of another.

---

# Revenue Settlement

Auren uses a RevenueSplitter to route application revenue between the relevant economic participants according to the venture configuration.

The current DemoDApp provides a complete testnet example:

```text
User Purchase
      ↓
DemoDApp
      ↓
RevenueSplitter
      ↓
Application Vault
```

This provides a visible on-chain example of the complete application-to-settlement lifecycle.

---

# TechnoCore Integration

Auren integrates with TechnoCore to provide an agent-oriented environment around the economic execution layer.

Conceptually:

```text
TECHNOCORE
Identity
Communication
State
MCP
   ↓
AUREN
Policy
Sponsorship
Execution
Settlement
   ↓
ARC
```

TechnoCore is used for agent identity, communication, and state synchronization.

Auren is responsible for economic policy and blockchain execution.

Live integration:

https://auren-build.vercel.app/technocore

---

# Public Testnet Proof

Auren has been verified with real Arc Testnet ERC-4337 executions.

The testnet has been used to verify:

* Smart Account creation
* UserOperation signing
* Paymaster authorization
* EntryPoint execution
* Relayer submission
* real gas sponsorship
* application execution
* vault accounting
* revenue settlement
* TechnoCore synchronization

Example verified execution:

```text
Transaction:
0x6c2d02dcfeabae7bc1930f880b837bb2d5ada30a448cb7ef458d3a24e63ed3ae

UserOperation:
0x209033d87ef011...

User Gas:
0.00 USDC

Paymaster Gas:
0.002919966 USDC

Network:
Arc Testnet

Chain ID:
5042002
```

Additional execution and verification reports are available in `docs/`.

---

# Arc Testnet Contracts

## EntryPoint

```text
0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
```

## SimpleAccountFactory

```text
0x2f1c18afD2536c74371fbaCEa6Ed21efa2D9a139
```

## MudarabahVaultFactory

```text
0x8CB1E0Dcd5dA6F8C17b83535B4307128701BA7ab
```

## InvestmentPaymaster

```text
0x2a4122372B1A624118Ee3e7D4503B9525CfDE076
```

## DAppVault

```text
0x851bD1E5d9CdeD0f183e861dB98157641C826a74
```

## RevenueSplitter

```text
0x8aA1197eFF337Db0c2aaF9e085c50cB46A7Fb2f7
```

## DemoDApp

```text
0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6
```

---

# Repository Structure

```text
Auren/
├── agent/                  # Agent runtime and TechnoCore integration
├── backend/                # Policy engine, API and relayer
├── deployments/            # Testnet deployment information
├── docs/                   # Architecture and security documentation
├── frontend/               # Public Next.js application
├── lib/                    # External Solidity libraries
├── script/                 # Deployment and verification scripts
├── sdk/                    # TypeScript SDK
├── src/                    # Solidity contracts
└── test/                   # Solidity and invariant tests
```

---

# Development

## Requirements

Typical development requires:

* Node.js
* npm
* Foundry
* an EVM-compatible wallet for frontend testnet interactions

---

## Smart Contracts

Install dependencies and build:

```bash
forge build
```

Run the Solidity test suite:

```bash
forge test
```

Format contracts:

```bash
forge fmt
```

---

## SDK

```bash
cd sdk
npm install
npm run build
```

---

## Agent Layer

```bash
cd agent
npm install
npm run build
```

---

## Backend

```bash
cd backend
npm install
npm run build
npm start
```

The backend requires environment-specific configuration and secrets for signer and relayer roles.

**Never commit private keys or `.env` files.**

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The local frontend runs separately from the production deployment and can be configured to use a local or testnet backend.

---

# Testing

Auren includes multiple layers of verification:

### Solidity

* unit tests
* invariant tests
* fuzz testing
* ERC-4337 Smart Account tests
* Paymaster signature tests

### Backend

* policy tests
* adversarial authorization tests
* rate limiting tests
* sponsorship budget tests
* UserOperation validation tests
* Paymaster signature tests

### Frontend

* production build verification
* route verification
* UI tests

The current testnet release has been verified through the full monorepo build and test pipeline.

---

# Security

Security-sensitive architecture is documented in:

```text
docs/security/
```

Key areas include:

* threat model
* internal security audit
* remediation report
* production-readiness analysis
* ERC-4337 browser execution verification
* live AA34 signature verification

The repository intentionally keeps signer roles separated:

```text
Backend Signer
Relayer
Deployer
```

These roles must never share private keys.

Private keys must never be exposed to the frontend.

---

# Current Status

## Arc Public Testnet

✅ Live public website
✅ Real ERC-4337 sponsored execution
✅ Smart Account + Factory
✅ Auren Paymaster
✅ Dedicated Relayer
✅ Policy-controlled sponsorship
✅ Consumer DApp
✅ Agent execution console
✅ Developer Hub
✅ Isolated application vaults
✅ Revenue settlement
✅ TechnoCore integration
✅ Adversarial security testing
✅ Foundry fuzz/invariant testing

### Important

Auren is currently a **public Arc Testnet project**.

The protocol is experimental.

Do not use real funds.

Mainnet deployment is outside the current scope.

---

# Roadmap

### Public Testnet

* onboard developers
* test additional application use cases
* improve agent integrations
* expand policy and sponsorship tooling
* collect community feedback

### Ecosystem Integrations

* more Arc applications
* more autonomous-agent workflows
* additional developer tooling
* expanded TechnoCore integrations

### Future Production Preparation

* external smart-contract security audit
* operational hardening
* production infrastructure
* mainnet deployment planning

---

# Contributing

Auren is being developed as an open technical project.

Useful contributions include:

* bug reports
* reproducible test cases
* developer documentation
* Arc Testnet integration feedback
* security testing
* SDK improvements
* agent tooling
* application integrations

When reporting a problem, include:

* environment
* expected behavior
* actual behavior
* reproduction steps
* relevant logs

Never include:

* private keys
* seed phrases
* API secrets
* `.env` contents

---

# Disclaimer

Auren is currently deployed on **Arc Testnet** for experimentation and development.

Nothing in this repository constitutes investment advice, a promise of returns, or a guarantee of financial performance.

The protocol and its economic mechanisms remain experimental and subject to further security, legal, and economic review before any production deployment.

---

# Links

**Website**
https://auren-build.vercel.app

**GitHub**
https://github.com/The-Real-Bedo/Auren

**Consumer Demo**
https://auren-build.vercel.app/demo

**Agent Demo**
https://auren-build.vercel.app/agent-demo

**Developer Hub**
https://auren-build.vercel.app/build

**TechnoCore**
https://auren-build.vercel.app/technocore
