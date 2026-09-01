import { onchainTable } from "ponder";

export const collateralDeposit = onchainTable("collateral_deposit", (t) => ({
  id: t.text().primaryKey(),
  user: t.hex().notNull(),
  amount: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  txHash: t.hex().notNull(),
}));

export const borrowEvent = onchainTable("borrow_event", (t) => ({
  id: t.text().primaryKey(),
  user: t.hex().notNull(),
  amount: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  txHash: t.hex().notNull(),
}));

export const repayEvent = onchainTable("repay_event", (t) => ({
  id: t.text().primaryKey(),
  user: t.hex().notNull(),
  amount: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  txHash: t.hex().notNull(),
}));
