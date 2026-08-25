// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SimpleAccountFactory.sol";
import "../src/SimpleAccount.sol";
import "../src/MudarabahVaultFactory.sol";
import "../src/DemoDApp.sol";
import "./SimpleAccount.t.sol";

contract InvariantsTest is Test {
    MockEntryPointForAccount entryPoint;
    SimpleAccountFactory accountFactory;
    MudarabahVaultFactory vaultFactory;

    address backendSigner = address(0xB3D);
    uint256 backendSignerKey = 0xB3D;

    address developer = address(0x101);
    address attacker = address(0x666);

    DAppVault vault;
    InvestmentPaymaster paymaster;
    RevenueSplitter splitter;
    DemoDApp demoDApp;

    receive() external payable {}

    function setUp() public {
        entryPoint = new MockEntryPointForAccount();
        accountFactory = new SimpleAccountFactory(entryPoint);
        vaultFactory = new MudarabahVaultFactory(entryPoint, backendSigner);

        vm.prank(developer);
        (address v, address p, address s) = vaultFactory.createVault(5000);
        vault = DAppVault(payable(v));
        paymaster = InvestmentPaymaster(payable(p));
        splitter = RevenueSplitter(s);
        demoDApp = new DemoDApp(splitter);

        // Initial deposit by LP
        vm.deal(address(this), 1000 ether);
        vault.deposit{value: 100 ether}();
    }

    // Invariant 1: Unrecovered capital is never negative
    function testInvariant_UnrecoveredCapitalNonNegative() public view {
        uint256 unrec = vault.unrecoveredCapital();
        assertGe(unrec, 0);
    }

    // Invariant 2: Total capital recovered <= total gas deployed
    function testInvariant_CapitalRecoveredLeqGasDeployed(uint256 revenue) public {
        revenue = bound(revenue, 1 ether, 50 ether);

        vm.prank(address(paymaster));
        vault.deployCapital(10 ether);

        vm.deal(address(this), revenue);
        splitter.processPayment{value: revenue}();

        assertLe(vault.totalCapitalRecovered(), vault.totalGasDeployed());
    }

    // Invariant 3: Unauthorized actor cannot deploy vault capital
    function testInvariant_UnauthorizedCannotDeployCapital() public {
        vm.prank(attacker);
        vm.expectRevert();
        vault.deployCapital(1 ether);
    }

    // Invariant 4: Unauthorized actor cannot withdraw from DAppVault
    function testInvariant_UnauthorizedCannotWithdraw() public {
        vm.prank(attacker);
        vm.expectRevert();
        vault.withdraw(100);
    }

    // Invariant 5: Unauthorized actor cannot reclaim paymaster deposit
    function testInvariant_UnauthorizedCannotReclaimPaymasterDeposit() public {
        vm.prank(address(paymaster));
        vault.deployCapital(5 ether);

        vm.prank(attacker);
        vm.expectRevert();
        vault.reclaimPaymasterDeposit(2 ether);
    }

    // Invariant 6: Paymaster deposit reclamation restores vault balance exactly
    function testInvariant_PaymasterReclamationSolvent() public {
        vm.prank(address(paymaster));
        vault.deployCapital(10 ether);

        uint256 vaultBalBefore = address(vault).balance;
        uint256 epBalBefore = entryPoint.balanceOf(address(paymaster));

        vm.prank(developer);
        vault.reclaimPaymasterDeposit(4 ether);

        assertEq(address(vault).balance, vaultBalBefore + 4 ether);
        assertEq(entryPoint.balanceOf(address(paymaster)), epBalBefore - 4 ether);
    }

    // Invariant 7: SimpleAccount cannot be initialized twice
    function testInvariant_SimpleAccountCannotReinitialize() public {
        uint256 salt = 12345;
        SimpleAccount account = accountFactory.createAccount(address(0x111), salt);

        vm.prank(attacker);
        vm.expectRevert();
        account.initialize(attacker);
    }

    // Invariant 8: Execution fails on non-EntryPoint, non-owner caller
    function testInvariant_SimpleAccountOnlyOwnerOrEntryPoint() public {
        uint256 salt = 999;
        SimpleAccount account = accountFactory.createAccount(address(0x111), salt);

        vm.prank(attacker);
        vm.expectRevert();
        account.execute(address(demoDApp), 0, "");
    }
}
