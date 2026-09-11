// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PriceOracle} from "./PriceOracle.sol";
import {InterestRateModel} from "./InterestRateModel.sol";

/// @title LendingPool — deposit AURWA collateral, borrow ausUSD
/// @dev POC architecture: credible surface, deliberately open production questions
contract LendingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant WAD = 1e18;
    uint256 public constant HF_PRECISION = 1e18;

    IERC20 public immutable collateralToken;
    IERC20 public immutable debtToken;
    PriceOracle public oracle;

    uint256 public ltvBps = 7000; // 70%
    uint256 public liquidationThresholdBps = 8000; // 80%
    uint256 public liquidationBonusBps = 500; // 5%

    struct Position {
        uint256 collateral;
        uint256 debt;
    }

    mapping(address => Position) public positions;
    uint256 public totalCollateral;
    uint256 public totalDebt;

    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event Liquidated(address indexed user, address indexed liquidator, uint256 repayAmount, uint256 collateralSeized);
    event RiskParamsUpdated(uint256 ltvBps, uint256 liquidationThresholdBps);

    error StaleOracle();
    error InsufficientCollateral();
    error UnhealthyPosition();
    error HealthyPosition();
    error ZeroAmount();

    constructor(
        address collateral_,
        address debt_,
        address oracle_,
        address initialOwner
    ) Ownable(initialOwner) {
        collateralToken = IERC20(collateral_);
        debtToken = IERC20(debt_);
        oracle = PriceOracle(oracle_);
    }

    function setRiskParams(uint256 ltvBps_, uint256 liqThresholdBps_) external onlyOwner {
        require(ltvBps_ <= liqThresholdBps_, "ltv > threshold");
        ltvBps = ltvBps_;
        liquidationThresholdBps = liqThresholdBps_;
        emit RiskParamsUpdated(ltvBps_, liqThresholdBps_);
    }

    function depositCollateral(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        positions[msg.sender].collateral += amount;
        totalCollateral += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        Position storage pos = positions[msg.sender];
        require(pos.collateral >= amount, "insufficient collateral");
        pos.collateral -= amount;
        totalCollateral -= amount;
        _requireHealthy(msg.sender);
        collateralToken.safeTransfer(msg.sender, amount);
        emit CollateralWithdrawn(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        Position storage pos = positions[msg.sender];
        pos.debt += amount;
        totalDebt += amount;
        _requireHealthy(msg.sender);
        // POC: mint path via owner-funded pool liquidity
        debtToken.safeTransfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount);
    }

    function repay(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        Position storage pos = positions[msg.sender];
        uint256 pay = amount > pos.debt ? pos.debt : amount;
        debtToken.safeTransferFrom(msg.sender, address(this), pay);
        pos.debt -= pay;
        totalDebt -= pay;
        emit Repaid(msg.sender, pay);
    }

    function liquidate(address user, uint256 repayAmount) external nonReentrant {
        if (repayAmount == 0) revert ZeroAmount();
        if (healthFactor(user) >= HF_PRECISION) revert HealthyPosition();

        Position storage pos = positions[user];
        uint256 pay = repayAmount > pos.debt ? pos.debt : repayAmount;
        debtToken.safeTransferFrom(msg.sender, address(this), pay);

        uint256 seizeUsd = (pay * _price(address(debtToken)) * (10_000 + liquidationBonusBps)) / (WAD * 10_000);
        uint256 collPrice = _price(address(collateralToken));
        uint256 seizeColl = (seizeUsd * WAD) / collPrice;
        if (seizeColl > pos.collateral) seizeColl = pos.collateral;

        pos.debt -= pay;
        pos.collateral -= seizeColl;
        totalDebt -= pay;
        totalCollateral -= seizeColl;

        collateralToken.safeTransfer(msg.sender, seizeColl);
        emit Liquidated(user, msg.sender, pay, seizeColl);
    }

    function getPosition(address user)
        external
        view
        returns (uint256 collateral, uint256 debt, uint256 hf)
    {
        Position memory pos = positions[user];
        return (pos.collateral, pos.debt, healthFactor(user));
    }

    function healthFactor(address user) public view returns (uint256) {
        Position memory pos = positions[user];
        if (pos.debt == 0) return type(uint256).max;
        uint256 collValue = _collateralUsd(pos.collateral);
        uint256 debtValue = _debtUsd(pos.debt);
        return (collValue * liquidationThresholdBps * HF_PRECISION) / (debtValue * 10_000);
    }

    function currentBorrowAprBps() external view returns (uint256) {
        if (totalCollateral == 0) return InterestRateModel.borrowAprBps(0);
        // rough util proxy: debt / collateral in token units (POC)
        uint256 util = (totalDebt * 10_000) / (totalCollateral == 0 ? 1 : totalCollateral);
        if (util > 10_000) util = 10_000;
        return InterestRateModel.borrowAprBps(util);
    }

    function _requireHealthy(address user) internal view {
        if (healthFactor(user) < HF_PRECISION) revert UnhealthyPosition();
        // also enforce LTV on new borrow/withdraw
        Position memory pos = positions[user];
        if (pos.debt == 0) return;
        uint256 maxDebtUsd = (_collateralUsd(pos.collateral) * ltvBps) / 10_000;
        if (_debtUsd(pos.debt) > maxDebtUsd) revert InsufficientCollateral();
    }

    function _collateralUsd(uint256 amount) internal view returns (uint256) {
        return (amount * _price(address(collateralToken))) / WAD;
    }

    function _debtUsd(uint256 amount) internal view returns (uint256) {
        return (amount * _price(address(debtToken))) / WAD;
    }

    function _price(address asset) internal view returns (uint256) {
        (uint256 price, bool fresh) = oracle.getPrice(asset);
        if (!fresh || price == 0) revert StaleOracle();
        return price;
    }
}
