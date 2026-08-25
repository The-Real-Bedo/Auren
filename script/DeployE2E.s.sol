// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../test/IsolatedVault.t.sol";
import "../src/DemoDApp.sol";

contract DeployE2E is Script {
    function run() external {
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; // Anvil Account 0
        vm.startBroadcast(deployerPrivateKey);

        MockEntryPointStub entryPoint = new MockEntryPointStub();
        address verifyingSigner = vm.addr(deployerPrivateKey);

        MudarabahVaultFactory factory = new MudarabahVaultFactory(entryPoint, verifyingSigner);
        (address v, address p, address s) = factory.createVault(5000);

        DAppVault(payable(v)).deposit{value: 1000e18}();

        console.log("EntryPoint:", address(entryPoint));
        console.log("Factory:", address(factory));
        console.log("Vault:", v);
        console.log("Paymaster:", p);
        console.log("Splitter:", s);
        DemoDApp dapp = new DemoDApp(RevenueSplitter(s));
        console.log("DemoDApp:", address(dapp));

        vm.stopBroadcast();
    }
}
