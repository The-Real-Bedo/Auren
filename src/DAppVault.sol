// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "account-abstraction/interfaces/IEntryPoint.sol";
import "./Interfaces.sol";

contract DAppVault is ReentrancyGuard {
    IEntryPoint public immutable entryPoint;
    address public immutable developer;
    address public paymaster;
    address public splitter;
    address public factory;
    
    uint256 public immutable lpProfitShareBps;
    
    uint256 public totalGasDeployed;   
    uint256 public totalCapitalRecovered;   
    
    uint256 public totalSupplyShares;
    mapping(address => uint256) public lpShares;

    event Deposited(address indexed lp, uint256 usdcAmount, uint256 sharesIssued);
    event Withdrawn(address indexed lp, uint256 usdcAmount, uint256 sharesBurned);
    event CapitalDeployed(uint256 amount);
    event RevenueProcessed(uint256 totalAmount, uint256 capitalRecovery, uint256 vaultProfit, uint256 devProfit);

    error ZeroAmount();
    error Unauthorized();
    error InsufficientLiquidity();
    error AlreadyInitialized();

    constructor(
        IEntryPoint _entryPoint, 
        address _developer,
        uint256 _lpProfitShareBps
    ) {
        entryPoint = _entryPoint;
        developer = _developer;
        lpProfitShareBps = _lpProfitShareBps;
        factory = msg.sender;
    }

    function setInfrastructure(address _paymaster, address _splitter) external {
        if (msg.sender != factory) revert Unauthorized();
        if (paymaster != address(0)) revert AlreadyInitialized();
        
        paymaster = _paymaster;
        splitter = _splitter;
    }

    function totalValue() public view returns (uint256) {
        uint256 epBalance = 0;
        if (paymaster != address(0)) {
            epBalance = entryPoint.balanceOf(paymaster);
        }
        return address(this).balance + epBalance;
    }

    function unrecoveredCapital() public view returns (uint256) {
        if (totalGasDeployed > totalCapitalRecovered) {
            return totalGasDeployed - totalCapitalRecovered;
        }
        return 0;
    }

    function deposit() external payable nonReentrant returns (uint256 shares) {
        uint256 amount = msg.value;
        if (amount == 0) revert ZeroAmount();

        uint256 _totalValue = totalValue() - amount; // subtract just deposited value for ratio
        
        if (totalSupplyShares == 0) {
            shares = amount;
            totalSupplyShares += 1000;
            lpShares[address(0)] += 1000;
        } else {
            shares = (amount * totalSupplyShares) / _totalValue;
        }

        totalSupplyShares += shares;
        lpShares[msg.sender] += shares;

        emit Deposited(msg.sender, amount, shares);
    }

    function withdraw(uint256 shares) external nonReentrant returns (uint256 amount) {
        if (shares == 0) revert ZeroAmount();
        if (lpShares[msg.sender] < shares) revert Unauthorized();

        uint256 _totalValue = totalValue();
        uint256 _totalSupply = totalSupplyShares;
        
        amount = (shares * _totalValue) / _totalSupply;

        if (address(this).balance < amount) revert InsufficientLiquidity();

        totalSupplyShares -= shares;
        lpShares[msg.sender] -= shares;

        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount, shares);
    }

    function deployCapital(uint256 amount) external nonReentrant {
        if (msg.sender != paymaster) revert Unauthorized();
        if (amount == 0) revert ZeroAmount();
        if (address(this).balance < amount) revert InsufficientLiquidity();

        totalGasDeployed += amount;
        
        entryPoint.depositTo{value: amount}(paymaster);

        emit CapitalDeployed(amount);
    }

    function processRevenue() external payable nonReentrant {
        if (msg.sender != splitter) revert Unauthorized();
        uint256 amount = msg.value;
        if (amount == 0) revert ZeroAmount();
        
        uint256 unrecovered = unrecoveredCapital();
        uint256 capitalRecovery = 0;
        uint256 netProfit = 0;
        
        if (amount <= unrecovered) {
            capitalRecovery = amount;
        } else {
            capitalRecovery = unrecovered;
            netProfit = amount - unrecovered;
        }
        
        totalCapitalRecovered += capitalRecovery;
        
        uint256 vaultProfit = (netProfit * lpProfitShareBps) / 10000;
        uint256 devProfit = netProfit - vaultProfit;
        
        if (devProfit > 0) {
            (bool success,) = developer.call{value: devProfit}("");
            require(success, "Dev transfer failed");
        }
        
        emit RevenueProcessed(amount, capitalRecovery, vaultProfit, devProfit);
    }
    
    receive() external payable {}
}
