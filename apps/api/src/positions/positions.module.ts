import { Controller, Get, Param, Query } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { healthFactor, maxBorrowUsd, formatHf } from "@auron/sdk";
import type { PositionView } from "@auron/config";

@Controller("positions")
export class PositionsController {
  @Get("preview/borrow")
  previewBorrow(
    @Query("collateralUsd") collateralUsd = "10000",
    @Query("borrowUsd") borrowUsd = "6000",
  ) {
    const c = Number(collateralUsd);
    const b = Number(borrowUsd);
    const max = maxBorrowUsd(c);
    const hf = healthFactor(c, b);
    return {
      collateralUsd: c,
      borrowUsd: b,
      maxBorrowUsd: max,
      healthFactor: formatHf(hf),
      withinLtv: b <= max,
    };
  }

  @Get(":address")
  getPosition(@Param("address") address: string): PositionView & { address: string } {
    const collateralUsd = 10_000;
    const debtUsd = 6_000;
    const hf = healthFactor(collateralUsd, debtUsd);
    return {
      address,
      collateralUsd: String(collateralUsd),
      debtUsd: String(debtUsd),
      healthFactor: formatHf(hf),
      interestUsd: "82",
      ltvBps: 7000,
    };
  }
}

@Module({ controllers: [PositionsController] })
export class PositionsModule {}
