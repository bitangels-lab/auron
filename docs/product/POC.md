# POC scope

## Goal

Prove the product architecture for **collateral → valuation → risk limits → stablecoin credit** (with RWA as the asset layer, not the headline). Stack should be credible to senior protocol engineers.

## Product framing (POC)

- Collateral creates borrowing capacity
- Oracle / NAV feeds risk calculations (mock $1.00 in V1)
- LTV / liquidation threshold / health factor are first-class UI
- Liquidation is explained via buffer + NAV shock preview
- Markets explore asset types; live borrow executes on AURWA

## In scope (6 screens)

1. Dashboard — portfolio + risk strip + credit explainer
2. Markets — collateral catalogue (LTV/LT/valuation)
3. Asset detail — risk params + borrow CTA
4. Borrow — guided steps + LTV/HF preview
5. Position — risk strip + partial repay / withdraw
6. Governance — AIP-style risk param vote (demo)

## Core on-chain loop

`Deposit AURWA → borrow ausUSD → monitor HF → repay → withdraw`

AURWA is a **simulated** treasury RWA ($1 NAV). No real RWA rails in V1.

## Out of scope

- Kubernetes, microservices, Kafka
- Multi-chain / cross-chain messaging
- Real RWA / KYC / institutional custody
- Mainnet deployment
- AI agents

## Progression

POC → Testnet MVP → Production RWA integrations → Multi-chain scale
