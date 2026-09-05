// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title AURWA — Simulated tokenized treasury RWA for POC
/// @notice 1 token ≈ $1.00 NAV via oracle. Not a real RWA claim.
contract RWAToken is ERC20, Ownable {
    uint256 public constant FAUCET_MAX = 100_000e18;

    constructor(address initialOwner) ERC20("Auron Simulated Treasury RWA", "AURWA") Ownable(initialOwner) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice POC-only: anyone can mint demo collateral (capped per call).
    function faucet(uint256 amount) external {
        require(amount > 0 && amount <= FAUCET_MAX, "faucet cap");
        _mint(msg.sender, amount);
    }
}
