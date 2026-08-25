// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./DAppVault.sol";
import "./InvestmentPaymaster.sol";
import "./RevenueSplitter.sol";
contract MudarabahVaultFactory {
    IEntryPoint public immutable entryPoint;
    address public immutable backendSigner;
    
    event VaultDeployed(address indexed developer, address vault, address paymaster, address splitter);

    constructor(IEntryPoint _entryPoint, address _backendSigner) {
        entryPoint = _entryPoint;
        backendSigner = _backendSigner;
    }

    function createVault(uint256 lpProfitShareBps) external returns (address vault, address paymaster, address splitter) {
        DAppVault v = new DAppVault(entryPoint, msg.sender, lpProfitShareBps);
        InvestmentPaymaster p = new InvestmentPaymaster(entryPoint, backendSigner, v);
        RevenueSplitter s = new RevenueSplitter(v);
        v.setInfrastructure(address(p), address(s));
        emit VaultDeployed(msg.sender, address(v), address(p), address(s));
        return (address(v), address(p), address(s));
    }
}
