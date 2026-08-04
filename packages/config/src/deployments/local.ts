export type LocalDeployment = {
  chainId: number;
  rpcUrl: string;
  aurwa: string;
  ausUsd: string;
  oracle: string;
  lendingPool: string;
  governance: string;
};

/** Updated by `npm run deploy:local`. */
export const localDeployment: LocalDeployment = {
  chainId: 31337,
  rpcUrl: "http://127.0.0.1:8545",
  aurwa: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  ausUsd: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
  oracle: "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0",
  lendingPool: "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707",
  governance: "0x0165878a594ca255338adfa4d48449f69242eb8f",
};
