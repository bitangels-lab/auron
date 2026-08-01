import { Controller, Get, Param, Post } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { ProposalView } from "@auron/config";

const DEMO: ProposalView[] = [
  {
    id: "AIP-003",
    title: "Change ausUSD LTV from 70% → 65%",
    description:
      "Tighten maximum LTV for AURWA-backed borrows. Open question: should risk params be governance-timelocked?",
    forPct: 72,
    againstPct: 28,
    status: "active",
  },
];

@Controller("governance")
export class GovernanceController {
  @Get("proposals")
  list(): ProposalView[] {
    return DEMO;
  }

  @Get("proposals/:id")
  get(@Param("id") id: string) {
    return DEMO.find((p) => p.id === id) ?? DEMO[0];
  }

  @Post("proposals/:id/vote")
  vote(@Param("id") id: string) {
    return {
      id,
      status: "recorded_offchain_demo",
      message: "POC records intent; on-chain Governance.vote wired after deploy.",
    };
  }
}

@Module({ controllers: [GovernanceController] })
export class GovernanceModule {}
