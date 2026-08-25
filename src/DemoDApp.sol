// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./RevenueSplitter.sol";
contract DemoDApp {
    RevenueSplitter public splitter;
    mapping(address => uint256) public purchases;
    event ItemPurchased(address indexed buyer, uint256 price);
    constructor(RevenueSplitter _splitter) { splitter = _splitter; }
    function purchaseItem() external payable {
        uint256 price = msg.value;
        require(price > 0, "No value");
        splitter.processPayment{value: price}();
        purchases[msg.sender] += 1;
        emit ItemPurchased(msg.sender, price);
    }
}
