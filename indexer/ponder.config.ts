import { createConfig } from "ponder";

export default createConfig({
  chains: {
    anvil: {
      id: Number(process.env.PONDER_CHAIN_ID ?? 31337),
      rpc: process.env.PONDER_RPC_URL ?? "http://127.0.0.1:8545",
    },
  },
  contracts: {
    LendingPool: {
      chain: "anvil",
      abi: "./abis/LendingPool.json",
      address: (process.env.LENDING_POOL_ADDRESS ??
        "0x0000000000000000000000000000000000000000") as `0x${string}`,
      startBlock: 0,
    },
  },
});
