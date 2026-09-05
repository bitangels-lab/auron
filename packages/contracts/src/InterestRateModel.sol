// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title InterestRateModel — simple utilization kink model (POC)
library InterestRateModel {
    uint256 internal constant BPS = 10_000;

    /// @notice Returns borrow APR in BPS given utilization BPS
    function borrowAprBps(uint256 utilizationBps) internal pure returns (uint256) {
        // base 2% + slope to 8% at 80% util, then steep to 25%
        uint256 base = 200;
        uint256 kink = 8000;
        if (utilizationBps <= kink) {
            return base + (utilizationBps * 600) / kink;
        }
        uint256 excess = utilizationBps - kink;
        return 800 + (excess * 1700) / (BPS - kink);
    }
}
