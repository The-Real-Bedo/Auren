// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SimpleAccountFactory.sol";
import "../src/SimpleAccount.sol";
import "../src/MudarabahVaultFactory.sol";
import "../src/DemoDApp.sol";

contract MockEntryPointForAccount is IEntryPoint {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public nonces;

    function depositTo(address account) external payable { balances[account] += msg.value; }
    function balanceOf(address account) external view returns (uint256) { return balances[account]; }
    function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount) external {
        balances[msg.sender] -= withdrawAmount;
        (bool success, ) = withdrawAddress.call{value: withdrawAmount}("");
        require(success, "ETH transfer failed");
    }

    function getNonce(address sender, uint192) external view returns (uint256) {
        return nonces[sender];
    }

    function incrementNonce(uint192) external {}
    function simulateHandleOp(UserOperation calldata, address, bytes calldata) external {}

    function getUserOpHash(UserOperation calldata userOp) external view returns (bytes32) {
        return keccak256(abi.encode(userOp.sender, userOp.nonce, userOp.callData, address(this), block.chainid));
    }

    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external {
        for (uint256 i = 0; i < ops.length; i++) {
            UserOperation calldata op = ops[i];

            // 1. Create account if initCode present
            if (op.initCode.length >= 20) {
                address factory = address(bytes20(op.initCode[0:20]));
                bytes memory factoryCalldata = op.initCode[20:];
                (bool succ,) = factory.call(factoryCalldata);
                require(succ, "initCode failed");
            }

            // 2. Validate Account Signature
            bytes32 opHash = this.getUserOpHash(op);
            uint256 accVal = SimpleAccount(payable(op.sender)).validateUserOp(op, opHash, 0);
            require(accVal == 0, "Account validation failed");

            // 3. Validate Paymaster
            bytes memory context = "";
            address pm = address(0);
            if (op.paymasterAndData.length >= 20) {
                pm = address(bytes20(op.paymasterAndData[0:20]));
                uint256 maxCost = (op.callGasLimit + op.verificationGasLimit * 3 + op.preVerificationGas) * op.maxFeePerGas;
                uint256 pmVal;
                (context, pmVal) = IPaymaster(pm).validatePaymasterUserOp(op, opHash, maxCost);
                require(pmVal == 0, "Paymaster validation failed");
            }

            // 4. Execute UserOp
            (bool execSucc, ) = op.sender.call(op.callData);
            require(execSucc, "Execution failed");

            // 5. PostOp
            if (pm != address(0)) {
                uint256 actualGas = 100000 * op.maxFeePerGas;
                IPaymaster(pm).postOp(IPaymaster.PostOpMode.opSucceeded, context, actualGas);
            }

            nonces[op.sender]++;
        }
    }

    // Stubs
    function handleAggregatedOps(UserOpsPerAggregator[] calldata, address payable) external {}
    function getSenderAddress(bytes memory) external {}
    function simulateValidation(UserOperation calldata) external {}
    function getDepositInfo(address) external pure returns (DepositInfo memory info) { return info; }
    function addStake(uint32) external payable {}
    function unlockStake() external {}
    function withdrawStake(address payable) external {}
}

contract SimpleAccountTest is Test {
    MockEntryPointForAccount entryPoint;
    SimpleAccountFactory accountFactory;
    MudarabahVaultFactory vaultFactory;

    address backendSigner;
    uint256 backendSignerKey = 0xB3D;

    address userOwner;
    uint256 userOwnerKey = 0x1234;

    DAppVault vault;
    InvestmentPaymaster paymaster;
    RevenueSplitter splitter;
    DemoDApp demoDApp;

    receive() external payable {}

    function setUp() public {
        backendSigner = vm.addr(backendSignerKey);
        userOwner = vm.addr(userOwnerKey);

        entryPoint = new MockEntryPointForAccount();
        accountFactory = new SimpleAccountFactory(entryPoint);
        vaultFactory = new MudarabahVaultFactory(entryPoint, backendSigner);

        (address v, address p, address s) = vaultFactory.createVault(5000);
        vault = DAppVault(payable(v));
        paymaster = InvestmentPaymaster(payable(p));
        splitter = RevenueSplitter(s);
        demoDApp = new DemoDApp(splitter);

        // Fund Vault so it can sponsor capital
        vm.deal(address(this), 100 ether);
        vault.deposit{value: 50 ether}();
    }

    function test_CounterfactualAndExecute() public {
        uint256 salt = 0;
        address counterfactual = accountFactory.getAddress(userOwner, salt);

        // 1. Account not deployed yet
        assertEq(counterfactual.code.length, 0);

        // 2. Build UserOperation with initCode
        bytes memory initCode = abi.encodePacked(
            address(accountFactory),
            abi.encodeWithSelector(SimpleAccountFactory.createAccount.selector, userOwner, salt)
        );

        bytes memory callData = abi.encodeWithSelector(
            SimpleAccount.execute.selector,
            address(demoDApp),
            1 ether,
            abi.encodeWithSelector(DemoDApp.purchaseItem.selector)
        );

        UserOperation memory userOp;
        userOp.sender = counterfactual;
        userOp.nonce = 0;
        userOp.initCode = initCode;
        userOp.callData = callData;
        userOp.callGasLimit = 200000;
        userOp.verificationGasLimit = 350000;
        userOp.preVerificationGas = 50000;
        userOp.maxFeePerGas = 20 gwei;
        userOp.maxPriorityFeePerGas = 2 gwei;

        uint256 maxCost = (userOp.callGasLimit + userOp.verificationGasLimit * 3 + userOp.preVerificationGas) * userOp.maxFeePerGas;

        // 3. Backend Signer signs paymasterAndData
        bytes32 pmHash = keccak256(abi.encode(userOp.sender, userOp.nonce, keccak256(userOp.callData), maxCost, block.chainid));
        bytes32 pmEthHash = MessageHashUtils.toEthSignedMessageHash(pmHash);
        (uint8 pmV, bytes32 pmR, bytes32 pmS) = vm.sign(backendSignerKey, pmEthHash);
        bytes memory pmSig = abi.encodePacked(pmR, pmS, pmV);
        userOp.paymasterAndData = abi.encodePacked(address(paymaster), pmSig);

        // 4. User signs userOpHash
        bytes32 userOpHash = entryPoint.getUserOpHash(userOp);
        bytes32 userEthHash = MessageHashUtils.toEthSignedMessageHash(userOpHash);
        (uint8 uV, bytes32 uR, bytes32 uS) = vm.sign(userOwnerKey, userEthHash);
        userOp.signature = abi.encodePacked(uR, uS, uV);

        // Fund smart account with 1 ETH for item purchase
        vm.deal(counterfactual, 2 ether);

        // 5. Submit via handleOps
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = userOp;

        address payable beneficiary = payable(address(0x999));
        entryPoint.handleOps(ops, beneficiary);

        // 6. Verify assertions
        assertGt(counterfactual.code.length, 0); // Smart Account was deployed
        assertEq(demoDApp.purchases(counterfactual), 1); // Purchase was recorded
        assertGt(vault.totalGasDeployed(), 0); // Paymaster deployed capital for gas
    }

    function test_PaymasterDepositReclamation() public {
        // Developer deposits into EntryPoint
        vault.deployCapital(5 ether);
        assertEq(entryPoint.balanceOf(address(paymaster)), 5 ether);
        uint256 vaultBalBefore = address(vault).balance;

        // Developer reclaims unused deposit back to vault
        vault.reclaimPaymasterDeposit(3 ether);
        assertEq(entryPoint.balanceOf(address(paymaster)), 2 ether);
        assertEq(address(vault).balance, vaultBalBefore + 3 ether);
    }
}
