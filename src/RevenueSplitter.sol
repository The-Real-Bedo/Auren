// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./DAppVault.sol";
contract RevenueSplitter {
    DAppVault public immutable vault;
    constructor(DAppVault _vault) { vault = _vault; }
    function processPayment() external payable {
        require(msg.value > 0, "No value");
        vault.processRevenue{value: msg.value}();
    }
}
