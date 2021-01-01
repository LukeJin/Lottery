// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.6.8;
 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
 
contract MOK is ERC20("MOKCoin", "MOK"){
    constructor() public {
        // Mint 10000000 to deployer by default being account 0
        _mint(msg.sender, 1000000 ether);
    }
 
    function mint(address minter, uint256 amount) public {
        _mint(minter, amount);
    } 
}
