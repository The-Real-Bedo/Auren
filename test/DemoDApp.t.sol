// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MudarabahVaultFactory.sol";
import "../src/DAppVault.sol";
import "../src/InvestmentPaymaster.sol";
import "../src/RevenueSplitter.sol";
import "../src/DemoDApp.sol";
import "./IsolatedVault.t.sol";

contract DemoDAppTest is Test {
    MockEntryPoint entryPoint;
    MudarabahVaultFactory factory;
    
    address verifyingSigner = address(100);
    address developer = address(101);
    
    DAppVault vault;
    InvestmentPaymaster paymaster;
    RevenueSplitter splitter;
    DemoDApp dapp;

    function setUp() public {
        entryPoint = new MockEntryPointStub();
        factory = new MudarabahVaultFactory(entryPoint, verifyingSigner);
        
        vm.prank(developer);
        (address v, address p, address s) = factory.createVault(5000); // 50% split
        vault = DAppVault(payable(v));
        paymaster = InvestmentPaymaster(payable(p));
        splitter = RevenueSplitter(s);
        
        dapp = new DemoDApp(splitter);
        
        vm.deal(address(entryPoint), 100000 ether);
    }
    
    function test_EndToEnd_PurchaseFlow() public {
        address lp = address(102);
        address user = address(103);
        
        uint256 depositAmount = 1000e18;
        vm.deal(lp, depositAmount);
        
        vm.prank(lp);
        vault.deposit{value: depositAmount}();
        
        uint256 gasDeployed = 2e18;
        vm.prank(address(paymaster));
        vault.deployCapital(gasDeployed);
        
        assertEq(vault.unrecoveredCapital(), gasDeployed);
        
        uint256 itemPrice = 10e18;
        vm.deal(user, itemPrice);
        
        vm.prank(user);
        dapp.purchaseItem{value: itemPrice}();
        
        assertEq(vault.unrecoveredCapital(), 0);
        assertEq(vault.totalCapitalRecovered(), 2e18);
        
        // Vault balance: 1000 (initial) - 2 (gas) + 2 (recovered) + 4 (profit) = 1004
        assertEq(address(vault).balance, 1004e18);
        assertEq(developer.balance, 4e18);
        
        assertEq(dapp.purchases(user), 1);
    }
    
    function test_Security_CannotDrainOtherVault() public {
        vm.startPrank(developer);
        (address v2, , ) = factory.createVault(5000);
        vm.stopPrank();
        
        DAppVault vault2 = DAppVault(payable(v2));
        vm.deal(address(vault2), 1000e18);
        
        vm.expectRevert();
        vault2.deployCapital(10e18);
    }
}
