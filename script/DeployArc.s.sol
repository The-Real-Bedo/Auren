// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MudarabahVaultFactory.sol";
import "../src/DemoDApp.sol";

contract DeployArc is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployerAddress = vm.envAddress("DEPLOYER_ADDRESS");

        uint256 backendSignerPrivateKey = vm.envUint("BACKEND_SIGNER_PRIVATE_KEY");
        address backendSignerAddress = vm.envAddress("BACKEND_SIGNER_ADDRESS");

        require(vm.addr(deployerPrivateKey) == deployerAddress, "Security Alert: Deployer Private Key derivation mismatch");
        require(vm.addr(backendSignerPrivateKey) == backendSignerAddress, "Security Alert: Backend Signer Private Key derivation mismatch");
        require(deployerAddress != backendSignerAddress, "Security Alert: Deployer and Backend Signer must be separate identities");

        address entryPointAddress = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;

        vm.startBroadcast(deployerPrivateKey);

        MudarabahVaultFactory factory = new MudarabahVaultFactory(
            IEntryPoint(entryPointAddress),
            backendSignerAddress
        );

        (address v, address p, address s) = factory.createVault(5000); // 50% split

        DemoDApp dapp = new DemoDApp(RevenueSplitter(s));

        vm.stopBroadcast();

        string memory json = "{\n";
        json = string.concat(json, '  "Factory": "', vm.toString(address(factory)), '",\n');
        json = string.concat(json, '  "Vault": "', vm.toString(v), '",\n');
        json = string.concat(json, '  "Paymaster": "', vm.toString(p), '",\n');
        json = string.concat(json, '  "Splitter": "', vm.toString(s), '",\n');
        json = string.concat(json, '  "DemoDApp": "', vm.toString(address(dapp)), '",\n');
        json = string.concat(json, '  "EntryPoint": "', vm.toString(entryPointAddress), '"\n');
        json = string.concat(json, "}");

        vm.writeJson(json, "./deployments/arc-testnet.json");
    }
}
