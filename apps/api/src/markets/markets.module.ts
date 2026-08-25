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
          ? "Simulated tokenized US Treasury exposure (AURWA). 1 token ≈ $1.00 NAV for POC."
          : "Simulated RWA market for protocol UX demos.",
      ltvBps: 7000,
      liquidationThresholdBps: 8000,
    };
  }
}

@Module({ controllers: [MarketsController] })
export class MarketsModule {}
