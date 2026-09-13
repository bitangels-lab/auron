# Architecture

```
React (Next.js)
      │
   wagmi / viem
      │
      ▼
 Solidity (Foundry)  ── source of truth
      │
   events
      │
      ▼
   Ponder ──► PostgreSQL ──► NestJS API ──► React
                    ▲
                  Redis (cache / queues later)
```

## On-chain

- ownership, deposits, withdrawals
- collateral, borrow, repay
- interest accounting (extend), liquidation
- fees, permissions, governance, settlement

## Off-chain

- analytics, portfolio aggregation
- history, search, notifications
- risk dashboards, indexing
- non-consensus calculations

## Monorepo layout

See root README. Modular monolith API — no microservices for POC.
