# AUREN — Art Direction & Design Philosophy

## 1. Core Philosophy

Auren is institutional financial infrastructure for autonomous applications and on-chain agents.
The brand aesthetic is **quiet, precise, technical, editorial, and confident**.

We reject generic Web3 tropes:
- No neon cyan/magenta gradients
- No glassmorphic blur cards stacked everywhere
- No decorative floating spheres, particles, or visual noise
- No crypto-arcade gimmicks

We align with the design discipline of **Stripe, Apple, Arc Network, Linear, and high-end editorial publications**.

---

## 2. Color Palette & Restraint

| Token | Hex | Role | Usage Rule |
|---|---|---|---|
| **Obsidian** | `#0A0D14` | Primary Canvas | 80%+ of background surface. Deep, flat, matte near-black. |
| **Surface Dark** | `#121620` | Secondary Canvas / Insets | Subtle depth without glowing borders. |
| **Border Hairline** | `rgba(255, 255, 255, 0.08)` | Structural Dividers | 1px clean geometric grid lines. |
| **Warm Off-White** | `#F8F6F2` | Primary Typography | Headers, primary titles, high-contrast clarity. |
| **Muted Slate** | `#8A8F9E` | Secondary Typography | Body copy, technical descriptions, labels. |
| **Faint Slate** | `#525766` | Tertiary Metadata | Invariant tags, timestamps, block numbers. |
| **Auren Gold** | `#C8953A` | Intentional Accent | **RARE.** Used only at pivotal economic points (CTAs, status verification, settlement proof). |
| **Light Gold** | `#E2B768` | Code & Telemetry Focus | Highlights in monospace payloads. |

---

## 3. Typography & Hierarchy

- **Typefaces:**
  - **Sans-serif:** Inter (`var(--font-sans)`) with tight letter-spacing (`-0.035em` to `-0.045em`).
  - **Monospace:** JetBrains Mono / ui-monospace (`var(--font-mono)`) for addresses, hashes, numbers, code, and protocol invariants.
- **Scale:**
  - **Hero Title:** `clamp(3.5rem, 9vw, 7rem)` — massive, confident, breathing room.
  - **Section Headings:** `clamp(2rem, 4.5vw, 3.5rem)` — short, unambiguous statements.
  - **Body Text:** `1rem` to `1.125rem` — concise paragraphs (2-3 sentences max).
  - **Metadata:** `0.75rem` to `0.8125rem` — uppercase, tracking `0.08em`, monospace.

---

## 4. Spacing & Negative Space

- **Silence as a Feature:** Whitespace gives gravity to statements.
- **Section Rhythm:** `6rem` to `9rem` vertical separation between major narrative blocks.
- **Grid Layouts:** Strict 1px hairline dividers rather than floating boxes.

---

## 5. Visual Language & Primitives

- **Hairline Geometry:** 1px borders, subtle crosshairs, and clean orthogonal connector lines.
- **Direct Proof:** Display real data (real Arc Testnet blocks, real transaction hashes, real gas fees) without decorative framing.
- **No Floating Cards:** Use full-width editorial panels, left-aligned text blocks, and structured monospace data tables.

---

## 6. Motion & Interaction

- **Zero Gratuitous Motion:** Nothing continuously rotates, floats, or pulses without functional meaning.
- **Functional State Transitions:**
  - Fast, responsive hover transitions (`0.15s ease`).
  - Progress state changes during transaction signing and relayer broadcast.
- **Accessibility:** Full `prefers-reduced-motion` compliance.

---

## 7. Tone of Voice

- **Direct:** State what the system does without hype.
- **Technical Precision:** Use accurate terms (ERC-4337 v0.6, Non-Custodial, Canonical EntryPoint, Mudarabah Vaults, Arc Testnet 5042002).
- **Zero APY Promises:** Strict compliance with risk disclosures and testnet framing.
