// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SimpleAccountFactory.sol";
import "account-abstraction/interfaces/IEntryPoint.sol";

contract DeploySimpleAccountFactory is Script {
    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address entryPointAddress = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;

        vm.startBroadcast(deployerPrivateKey);

        SimpleAccountFactory factory = new SimpleAccountFactory(IEntryPoint(entryPointAddress));

        vm.stopBroadcast();

        console.log("SimpleAccountFactory deployed at:", address(factory));
        return address(factory);
    }
}
