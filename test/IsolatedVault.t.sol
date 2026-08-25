// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MudarabahVaultFactory.sol";
import "../src/DAppVault.sol";
import "../src/InvestmentPaymaster.sol";
import "../src/RevenueSplitter.sol";

abstract contract MockEntryPoint is IEntryPoint {
    mapping(address => uint256) public balances;
    function depositTo(address account) external payable { balances[account] += msg.value; }
    function balanceOf(address account) external view returns (uint256) { return balances[account]; }
    function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount) external {
        balances[msg.sender] -= withdrawAmount;
        (bool success, ) = withdrawAddress.call{value: withdrawAmount}("");
        require(success, "ETH transfer failed");
    }
    
    // Stubs for IEntryPoint
    function handleOps(UserOperation[] calldata, address payable) external {}
    function handleAggregatedOps(UserOpsPerAggregator[] calldata, address payable) external {}
    function getSenderAddress(bytes memory) external {}
    function simulateValidation(UserOperation calldata) external {}
    function getNonce(address, uint192) external pure returns (uint256) { return 0; }
    function getDepositInfo(address) external pure returns (DepositInfo memory info) { return info; }
    function getUserOpHash(UserOperation calldata userOp) external pure returns (bytes32) { return keccak256(abi.encode(userOp)); }
}

contract IsolatedVaultTest is Test {
    MockEntryPoint entryPoint;
    MudarabahVaultFactory factory;
    
    address verifyingSigner = address(100);
    address developer = address(101);
    
    DAppVault vault;
    InvestmentPaymaster paymaster;
    RevenueSplitter splitter;

    function setUp() public {
        entryPoint = new MockEntryPointStub();
        factory = new MudarabahVaultFactory(entryPoint, verifyingSigner);
        
        vm.prank(developer);
        (address v, address p, address s) = factory.createVault(5000); // 50% split
        vault = DAppVault(payable(v));
        paymaster = InvestmentPaymaster(payable(p));
        splitter = RevenueSplitter(s);
        
        vm.deal(address(entryPoint), 100000 ether);
    }
    
    function testFuzz_Cycle(uint256 depositAmt, uint256 gasDeployed, uint256 revenue) public {
        depositAmt = bound(depositAmt, 100, 1000000 ether);
        gasDeployed = bound(gasDeployed, 1, depositAmt);
        revenue = bound(revenue, 1, 2000000 ether);
        
        address lp = address(102);
        vm.deal(lp, depositAmt);
        
        vm.prank(lp);
        vault.deposit{value: depositAmt}();
        
        vm.prank(address(paymaster));
        vault.deployCapital(gasDeployed);
        
        assertEq(vault.unrecoveredCapital(), gasDeployed);
        
        vm.deal(address(this), revenue);
        splitter.processPayment{value: revenue}();
        
        if (revenue <= gasDeployed) {
            assertEq(vault.unrecoveredCapital(), gasDeployed - revenue);
        } else {
            assertEq(vault.unrecoveredCapital(), 0);
        }
        
        uint256 finalBalance = address(vault).balance;
        uint256 epBalance = entryPoint.balanceOf(address(paymaster));
        assertEq(vault.totalValue(), finalBalance + epBalance);
    }
}
// adding missing stubs to MockEntryPoint
contract MockEntryPointStub is MockEntryPoint {
    function addStake(uint32) external payable {}
    function incrementNonce(uint192) external {}
    function simulateHandleOp(UserOperation calldata, address, bytes calldata) external {}
    function unlockStake() external {}
    function withdrawStake(address payable) external {}
}
