# POC scope

## Goal

Prove the product architecture for **RWA collateral → stablecoin credit** with a stack senior protocol engineers respect.

## In scope (6 screens)

1. Dashboard — portfolio + health
2. RWA Markets — simulated markets
3. Asset detail — deposit CTA
4. Borrow — LTV + health factor
5. Position — repay / withdraw
6. Governance — AIP-style risk param vote

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
