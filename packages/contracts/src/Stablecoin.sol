// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ausUSD — Simulated stablecoin for POC borrowing
contract Stablecoin is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Auron Simulated USD", "ausUSD") Ownable(initialOwner) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
