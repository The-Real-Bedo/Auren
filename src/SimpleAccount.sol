// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "account-abstraction/core/BaseAccount.sol";
import "account-abstraction/interfaces/IEntryPoint.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import "openzeppelin-contracts/contracts/proxy/utils/Initializable.sol";

/**
 * @title SimpleAccount
 * Minimal ERC-4337 v0.6 Smart Account compatible with Canonical EntryPoint.
 */
contract SimpleAccount is BaseAccount, Initializable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public owner;
    IEntryPoint private immutable _entryPoint;

    event SimpleAccountInitialized(IEntryPoint indexed entryPoint, address indexed owner);

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    function _onlyOwner() internal view {
        require(msg.sender == owner || msg.sender == address(this), "only owner");
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    receive() external payable {}

    function initialize(address anOwner) public virtual initializer {
        owner = anOwner;
        emit SimpleAccountInitialized(_entryPoint, owner);
    }

    function _requireFromEntryPointOrOwner() internal view {
        require(msg.sender == address(entryPoint()) || msg.sender == owner, "account: not Owner or EntryPoint");
    }

    /**
     * Executes a transaction (called by EntryPoint or owner directly).
     */
    function execute(address dest, uint256 value, bytes calldata func) external {
        _requireFromEntryPointOrOwner();
        (bool success, bytes memory result) = dest.call{value: value}(func);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * Executes batch transactions.
     */
    function executeBatch(address[] calldata dest, uint256[] calldata values, bytes[] calldata func) external {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length && dest.length == values.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            (bool success, bytes memory result) = dest[i].call{value: values[i]}(func[i]);
            if (!success) {
                assembly {
                    revert(add(result, 32), mload(result))
                }
            }
        }
    }

    /// @inheritdoc BaseAccount
    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
        internal
        view
        override
        returns (uint256 validationData)
    {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature)) {
            return SIG_VALIDATION_FAILED;
        }
        return 0;
    }
}
