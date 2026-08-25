// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "account-abstraction/interfaces/IPaymaster.sol";
import "account-abstraction/interfaces/IEntryPoint.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import "./DAppVault.sol";

contract InvestmentPaymaster is IPaymaster {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    IEntryPoint public immutable entryPoint;
    address public immutable backendSigner;
    DAppVault public immutable vault;

    uint256 public constant VALIDATION_SUCCESS = 0;
    uint256 public constant SIG_VALIDATION_FAILED = 1;

    event DepositReclaimed(address indexed destination, uint256 amount);
    event GasReconciled(uint256 actualGasCost, uint256 prefundedMaxCost);

    error Unauthorized();
    error ZeroAmount();

    constructor(IEntryPoint _entryPoint, address _backendSigner, DAppVault _vault) {
        entryPoint = _entryPoint;
        backendSigner = _backendSigner;
        vault = _vault;
    }

    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external returns (bytes memory context, uint256 validationData) {
        if (msg.sender != address(entryPoint)) revert("Not EntryPoint");

        uint256 requiredFunds = maxCost;
        if (entryPoint.balanceOf(address(this)) < requiredFunds) {
            uint256 deficit = requiredFunds - entryPoint.balanceOf(address(this));
            vault.fundPaymasterDeposit(deficit);
        }

        if (userOp.paymasterAndData.length < 85) return ("", SIG_VALIDATION_FAILED);
        bytes memory signature = userOp.paymasterAndData[20:];
        bytes32 hash = keccak256(
            abi.encode(userOp.sender, userOp.nonce, keccak256(userOp.callData), maxCost, block.chainid)
        ).toEthSignedMessageHash();

        address recovered = hash.recover(signature);
        if (recovered != backendSigner) return ("", SIG_VALIDATION_FAILED);

        return (abi.encode(maxCost), VALIDATION_SUCCESS);
    }

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external {
        if (msg.sender != address(entryPoint)) revert("Not EntryPoint");
        if (context.length >= 32) {
            uint256 maxCost = abi.decode(context, (uint256));
            vault.reconcileGasSpent(actualGasCost, maxCost);
            emit GasReconciled(actualGasCost, maxCost);
        }
    }

    /**
     * Reclaims unused EntryPoint deposits back to the DAppVault.
     * Authorized: only callable by the bound DAppVault or Vault Developer.
     */
    function withdrawDepositToVault(uint256 amount) external {
        if (msg.sender != address(vault) && msg.sender != vault.developer()) revert Unauthorized();
        if (amount == 0) revert ZeroAmount();

        entryPoint.withdrawTo(payable(address(vault)), amount);
        emit DepositReclaimed(address(vault), amount);
    }

    receive() external payable {}
}
