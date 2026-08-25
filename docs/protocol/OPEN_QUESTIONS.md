# Protocol open questions

These are intentional. The POC shows credible surface area; production design is the hiring pitch.

1. How should liquidation work for illiquid RWAs?
2. Oracle architecture: push NAV, pull Chainlink, dual-feed, circuit breakers?
3. How do we value illiquid / NAV-delayed RWAs?
4. Interest rate model: utilization kink vs governance-set rates?
5. LTV / LT per asset class and how often they change?
6. RWA transfer restrictions / allowlists / frozen accounts?
7. Oracle failure / staleness behavior?
8. ERC-4626 vaults vs custom collateral accounting?
9. Governance control of risk params (timelock, guardian)?
10. Upgradeability (UUPS / beacon / immutable modules)?
11. Manipulation resistance (oracle, governance, liquidations)?
12. Multi-chain: deploy per chain vs shared liquidity messaging?

Candidates should leave the demo saying: *there are real protocol design problems here.*
