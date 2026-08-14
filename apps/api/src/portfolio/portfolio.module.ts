import { Controller, Get } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { PortfolioSummary } from "@auron/config";

@Controller("portfolio")
export class PortfolioController {
  @Get()
  getPortfolio(): PortfolioSummary {
    // POC: demo aggregates until indexer + on-chain reads are wired
    return {
      totalUsd: "128450",
      rwaUsd: "80000",
      defiUsd: "38450",
      stablecoinUsd: "10000",
      borrowedUsd: "42000",
      healthFactor: "1.82",
    };
  }
}

@Module({ controllers: [PortfolioController] })
export class PortfolioModule {}
