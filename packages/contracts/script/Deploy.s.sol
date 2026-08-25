// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {RWAToken} from "../src/RWAToken.sol";
import {Stablecoin} from "../src/Stablecoin.sol";
import {PriceOracle} from "../src/PriceOracle.sol";
import {LendingPool} from "../src/LendingPool.sol";
import {Governance} from "../src/Governance.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        RWAToken aurwa = new RWAToken(deployer);
        Stablecoin ausUsd = new Stablecoin(deployer);
        PriceOracle oracle = new PriceOracle(deployer);

        oracle.setPrice(address(aurwa), 1e18);
        oracle.setPrice(address(ausUsd), 1e18);

        LendingPool pool = new LendingPool(address(aurwa), address(ausUsd), address(oracle), deployer);
        Governance gov = new Governance(address(pool), deployer);

        ausUsd.mint(address(pool), 1_000_000e18);

        // Seed Anvil default accounts 0..9 with AURWA for MetaMask demos
        address[10] memory accounts = [
            0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,
            0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
            0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
            0x90F79bf6EB2c4f870365E785982E1f101E93b906,
            0x15d34AAf54267Db7D7c915123174Ad5ce9d3dAce,
            0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc,
            0x976EA74026E726554dB657fA54763abd0C3a0aa9,
            0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,
            0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f,
            0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
        ];
        for (uint256 i = 0; i < accounts.length; i++) {
            aurwa.mint(accounts[i], 50_000e18);
        }

        gov.createProposal("Change ausUSD LTV from 70% to 65%", 6500, 8000);

        vm.stopBroadcast();

        console2.log("AURWA", address(aurwa));
        console2.log("ausUSD", address(ausUsd));
        console2.log("Oracle", address(oracle));
        console2.log("LendingPool", address(pool));
        console2.log("Governance", address(gov));
    }
}
