// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

contract CheckReadiness is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0));
        address deployerAddress = vm.envOr("DEPLOYER_ADDRESS", address(0));

        uint256 backendSignerPrivateKey = vm.envOr("BACKEND_SIGNER_PRIVATE_KEY", uint256(0));
        address backendSignerAddress = vm.envOr("BACKEND_SIGNER_ADDRESS", address(0));

        require(deployerPrivateKey != 0, "MISSING DEPLOYER_PRIVATE_KEY in .env");
        require(backendSignerPrivateKey != 0, "MISSING BACKEND_SIGNER_PRIVATE_KEY in .env");

        address derivedDeployer = vm.addr(deployerPrivateKey);
        address derivedSigner = vm.addr(backendSignerPrivateKey);

        console.log("Derived Deployer:", derivedDeployer);
        console.log("Expected Deployer:", deployerAddress);

        console.log("Derived Signer:", derivedSigner);
        console.log("Expected Signer:", backendSignerAddress);
    }
}
