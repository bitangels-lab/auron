// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LendingPool} from "./LendingPool.sol";

/// @title Governance — minimal parameter governance for POC demos
contract Governance is Ownable {
    LendingPool public pool;

    struct Proposal {
        string title;
        uint256 newLtvBps;
        uint256 newLiqThresholdBps;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool exists;
    }

    uint256 public nextProposalId = 1;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, string title);
    event Voted(uint256 indexed id, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);

    constructor(address pool_, address initialOwner) Ownable(initialOwner) {
        pool = LendingPool(pool_);
    }

    function createProposal(string calldata title, uint256 newLtvBps, uint256 newLiqThresholdBps)
        external
        onlyOwner
        returns (uint256 id)
    {
        id = nextProposalId++;
        proposals[id] = Proposal({
            title: title,
            newLtvBps: newLtvBps,
            newLiqThresholdBps: newLiqThresholdBps,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            exists: true
        });
        emit ProposalCreated(id, title);
    }

    /// @notice POC voting: 1 address = 1 vote (replace with token voting later)
    function vote(uint256 id, bool support) external {
        Proposal storage p = proposals[id];
        require(p.exists && !p.executed, "invalid proposal");
        require(!hasVoted[id][msg.sender], "already voted");
        hasVoted[id][msg.sender] = true;
        if (support) p.forVotes += 1;
        else p.againstVotes += 1;
        emit Voted(id, msg.sender, support, 1);
    }

    function execute(uint256 id) external onlyOwner {
        Proposal storage p = proposals[id];
        require(p.exists && !p.executed, "invalid proposal");
        require(p.forVotes > p.againstVotes, "not passed");
        p.executed = true;
        pool.setRiskParams(p.newLtvBps, p.newLiqThresholdBps);
        emit ProposalExecuted(id);
    }
}
