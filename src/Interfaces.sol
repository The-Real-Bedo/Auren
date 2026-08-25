// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

interface IWUSDC is IERC20 {
    function withdraw(uint wad) external;
    function deposit() external payable;
}

interface IDAppVault {
    function deployCapital(uint256 amount) external;
    function processRevenue(uint256 amount) external;
    function recoverCapital(uint256 amount) external;
    function developer() external view returns (address);
}

interface IMudarabahVaultFactory {
    function isVault(address vault) external view returns (bool);
}
