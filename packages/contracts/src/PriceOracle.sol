// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title PriceOracle — POC oracle with manual NAV (open design question for production)
contract PriceOracle is Ownable {
    mapping(address => uint256) public priceUsd1e18;
    mapping(address => uint256) public updatedAt;
    uint256 public maxStaleness = 1 days;

    event PriceUpdated(address indexed asset, uint256 priceUsd1e18, uint256 updatedAt);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setPrice(address asset, uint256 price) external onlyOwner {
        priceUsd1e18[asset] = price;
        updatedAt[asset] = block.timestamp;
        emit PriceUpdated(asset, price, block.timestamp);
    }

    function setMaxStaleness(uint256 seconds_) external onlyOwner {
        maxStaleness = seconds_;
    }

    function getPrice(address asset) external view returns (uint256 price, bool isFresh) {
        price = priceUsd1e18[asset];
        isFresh = block.timestamp - updatedAt[asset] <= maxStaleness;
    }
}
