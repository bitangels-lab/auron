import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { PortfolioModule } from "./portfolio/portfolio.module";
import { MarketsModule } from "./markets/markets.module";
import { PositionsModule } from "./positions/positions.module";
import { GovernanceModule } from "./governance/governance.module";

@Module({
  imports: [HealthModule, PortfolioModule, MarketsModule, PositionsModule, GovernanceModule],
})
export class AppModule {}
