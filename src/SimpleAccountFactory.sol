// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/Create2.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "account-abstraction/interfaces/IEntryPoint.sol";
import "./SimpleAccount.sol";

/**
 * @title SimpleAccountFactory
 * Counterfactual factory for ERC-4337 v0.6 SimpleAccount proxies.
 */
contract SimpleAccountFactory {
    SimpleAccount public immutable accountImplementation;

    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new SimpleAccount(_entryPoint);
    }

    /**
     * Creates an account and returns its address.
     * Returns existing address if already deployed.
     */
    function createAccount(address owner, uint256 salt) public returns (SimpleAccount ret) {
        address addr = getAddress(owner, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return SimpleAccount(payable(addr));
        }
        ret = SimpleAccount(payable(new ERC1967Proxy{salt: bytes32(salt)}(
            address(accountImplementation),
            abi.encodeCall(SimpleAccount.initialize, (owner))
        )));
    }

    /**
     * Calculates the deterministic counterfactual address of this account.
     */
    function getAddress(address owner, uint256 salt) public view returns (address) {
        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(
                address(accountImplementation),
                abi.encodeCall(SimpleAccount.initialize, (owner))
            )
        );
        return Create2.computeAddress(bytes32(salt), keccak256(bytecode), address(this));
    }
}
