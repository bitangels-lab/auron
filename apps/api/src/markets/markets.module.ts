import { Controller, Get, Param, NotFoundException } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { MARKETS } from "@auron/config";

@Controller("markets")
export class MarketsController {
  @Get()
  list() {
    return MARKETS;
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    const market = MARKETS.find((m) => m.id === id);
    if (!market) throw new NotFoundException("Market not found");
    return {
      ...market,
      description:
        market.id === "us-treasury"
          ? "Simulated tokenized US Treasury exposure (AURWA). Posted as collateral to unlock ausUSD credit. 1 token ≈ $1.00 NAV via mock oracle."
          : "Simulated market for product exploration. Borrow against live collateral is wired for AURWA (US Treasury) only in this POC.",
      assetYieldLabel: "Underlying asset yield (illustrative)",
      borrowAprLabel: "Borrow APR not yet differentiated in POC",
    };
  }
}

@Module({ controllers: [MarketsController] })
export class MarketsModule {}
