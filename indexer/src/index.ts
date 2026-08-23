import { ponder } from "ponder:registry";
import { collateralDeposit, borrowEvent, repayEvent } from "ponder:schema";

ponder.on("LendingPool:CollateralDeposited", async ({ event, context }) => {
  await context.db.insert(collateralDeposit).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    user: event.args.user,
    amount: event.args.amount,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});

ponder.on("LendingPool:Borrowed", async ({ event, context }) => {
  await context.db.insert(borrowEvent).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    user: event.args.user,
    amount: event.args.amount,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});

ponder.on("LendingPool:Repaid", async ({ event, context }) => {
  await context.db.insert(repayEvent).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    user: event.args.user,
    amount: event.args.amount,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});
