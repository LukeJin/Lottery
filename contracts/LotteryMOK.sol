// contracts/Lottery.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.6.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

// A lottery contract with an ERC20 Token called MOK
contract LotteryMOK is AccessControl {
    // State variables of Lottery contract
    mapping(address => uint256) public winnings;
    address[] public tickets;
    uint256[] public pastWinningTickets;

    IERC20 public mok;

    uint256 public ticketCount;
    uint256 public drawnNumber;
    address public recentWinner;
    uint256 public ticketPrice = 20 ether;

    // Create a new role identifier for the manager role
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    constructor(address[] memory managers, address owner, address _mok) public {
        // Grant owner role
        _setupRole(OWNER_ROLE, owner);
        mok = IERC20(_mok);

        // Grant manager role with a maximum of 2 managers
        require(
            managers.length <= 2 && managers.length > 0,
            "Can only have 1 or 2 Managers"
        );
        _setupRole(MANAGER_ROLE, managers[0]);
        if (managers.length > 1) {
            _setupRole(MANAGER_ROLE, managers[1]);
        }
    }

    // Only owner can change price
    function changePrice(uint256 newPrice) public {
        require(
            hasRole(OWNER_ROLE, msg.sender),
            "Only the owner can change the price"
        );
        ticketPrice = newPrice;
    }

    function draw() public {
        // Check to see if the account is a manager account
        require(
            hasRole(MANAGER_ROLE, msg.sender) ||
                hasRole(OWNER_ROLE, msg.sender),
            "Caller is not a manager or the owner, can not draw"
        );
        // Check to make sure there are players
        require(
            ticketCount > 0,
            "There are currently no players in the lottery"
        );

        // Randomly generate a number
        drawnNumber = uint256(blockhash(block.number - 1)) % ticketCount;

        // Find winner
        recentWinner = tickets[drawnNumber];

        // Winner gets 95% of winnings
        winnings[recentWinner] = (ticketCount * ticketPrice * 95) / 100;

        // Reset Lottery
        ticketCount = 0;
        delete tickets;
    }

    function buy(uint256 amount) public {
        // Must have enough MOK
        require(
            mok.balanceOf(msg.sender) >= ticketPrice * amount,
            "Not enough MOK"
        );
        require(amount > 0, "Must purchase at least one ticket");

        ticketCount += amount;
        
        mok.transferFrom(msg.sender, address(this), ticketPrice * amount);

        for (uint256 i = 0; i < amount; i++) {
            tickets.push(msg.sender);
        }
    }

    function withdraw() public {
        // must have winnings to withdraw
        require(winnings[msg.sender] > 0, "Must have winnings > 0 to withdraw");

        // wipe winnings when withdrawn
        uint256 amount = winnings[msg.sender];
        winnings[msg.sender] = 0;

        // Transfer to winner
        mok.transfer(msg.sender, amount);
    }
}
