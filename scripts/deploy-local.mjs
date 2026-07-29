#!/usr/bin/env node
/**
 * Deploy contracts to local Anvil and write addresses for the web app.
 * Prerequisites: `npm run chain` (Anvil) + Foundry (`forge`) on PATH.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const CONTRACTS = path.join(ROOT, "packages", "contracts");
const DEPLOYER_KEY =
  process.env.DEPLOYER_PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  return execSync(cmd, {
    stdio: "inherit",
    cwd: opts.cwd || ROOT,
    env: { ...process.env, ...opts.env },
  });
}

function runCapture(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: "utf8",
    cwd: opts.cwd || ROOT,
    env: { ...process.env, ...opts.env },
  });
}

function ensureForge() {
  try {
    runCapture("forge --version");
  } catch {
    console.error(
      "Forge not found. Install Foundry: https://book.getfoundry.sh/getting-started/installation",
    );
    process.exit(1);
  }
}

async function ensureRpc() {
  try {
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.result) throw new Error("bad rpc response");
  } catch (e) {
    console.error(`Anvil not reachable at ${RPC}. Start it with: npm run chain`);
    console.error(String(e.message || e));
    process.exit(1);
  }
}

function ensureLibs() {
  const forgeStd = path.join(CONTRACTS, "lib", "forge-std");
  const oz = path.join(CONTRACTS, "lib", "openzeppelin-contracts");
  if (!fs.existsSync(forgeStd)) {
    run("forge install foundry-rs/forge-std --no-commit", { cwd: CONTRACTS });
  }
  if (!fs.existsSync(oz)) {
    run("forge install OpenZeppelin/openzeppelin-contracts --no-commit", { cwd: CONTRACTS });
  }
}

function readBroadcastAddresses() {
  const broadcast = path.join(
    CONTRACTS,
    "broadcast",
    "Deploy.s.sol",
    "31337",
    "run-latest.json",
  );
  if (!fs.existsSync(broadcast)) {
    throw new Error(`Missing broadcast file: ${broadcast}`);
  }
  const data = JSON.parse(fs.readFileSync(broadcast, "utf8"));
  const creates = (data.transactions || []).filter((t) => t.transactionType === "CREATE");
  if (creates.length < 5) {
    throw new Error(`Expected 5 CREATE txs, found ${creates.length}`);
  }
  return {
    aurwa: creates[0].contractAddress,
    ausUsd: creates[1].contractAddress,
    oracle: creates[2].contractAddress,
    lendingPool: creates[3].contractAddress,
    governance: creates[4].contractAddress,
  };
}

function writeEnv(addrs) {
  const lines = [
    `NEXT_PUBLIC_CHAIN_ID=31337`,
    `NEXT_PUBLIC_RPC_URL=${RPC}`,
    `NEXT_PUBLIC_AURWA_ADDRESS=${addrs.aurwa}`,
    `NEXT_PUBLIC_STABLECOIN_ADDRESS=${addrs.ausUsd}`,
    `NEXT_PUBLIC_LENDING_POOL_ADDRESS=${addrs.lendingPool}`,
    `NEXT_PUBLIC_ORACLE_ADDRESS=${addrs.oracle}`,
    `NEXT_PUBLIC_GOVERNANCE_ADDRESS=${addrs.governance}`,
    `NEXT_PUBLIC_API_URL=http://localhost:3001`,
  ];

  const webEnv = path.join(ROOT, "apps", "web", ".env.local");
  fs.writeFileSync(webEnv, lines.join("\n") + "\n");
  console.log(`Wrote ${webEnv}`);

  const tsPath = path.join(ROOT, "packages", "config", "src", "deployments", "local.ts");
  fs.mkdirSync(path.dirname(tsPath), { recursive: true });
  const ts = `export type LocalDeployment = {
  chainId: number;
  rpcUrl: string;
  aurwa: string;
  ausUsd: string;
  oracle: string;
  lendingPool: string;
  governance: string;
};

/** Updated by \`npm run deploy:local\`. */
export const localDeployment: LocalDeployment = {
  chainId: 31337,
  rpcUrl: ${JSON.stringify(RPC)},
  aurwa: ${JSON.stringify(addrs.aurwa)},
  ausUsd: ${JSON.stringify(addrs.ausUsd)},
  oracle: ${JSON.stringify(addrs.oracle)},
  lendingPool: ${JSON.stringify(addrs.lendingPool)},
  governance: ${JSON.stringify(addrs.governance)},
};
`;
  fs.writeFileSync(tsPath, ts);
  console.log(`Wrote ${tsPath}`);

  console.log("\nAddresses:");
  for (const [k, v] of Object.entries(addrs)) {
    console.log(`  ${k}: ${v}`);
  }
}

async function main() {
  ensureForge();
  await ensureRpc();
  ensureLibs();

  run(`forge script script/Deploy.s.sol:Deploy --rpc-url ${RPC} --broadcast`, {
    cwd: CONTRACTS,
    env: { DEPLOYER_PRIVATE_KEY: DEPLOYER_KEY },
  });

  const addrs = readBroadcastAddresses();
  writeEnv(addrs);
  console.log("\nDeploy complete. Restart `npm run dev` if it is already running.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
