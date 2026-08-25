export const ARC_TESTNET_CHAIN_ID = 5042002;
export const LOCAL_ANVIL_CHAIN_ID = 31337;

export const CONTRACTS = {
  [ARC_TESTNET_CHAIN_ID]: {
    factory: "0x8CB1E0Dcd5dA6F8C17b83535B4307128701BA7ab",
    vault: "0x851bD1E5d9CdeD0f183e861dB98157641C826a74",
    paymaster: "0x2a4122372B1A624118Ee3e7D4503B9525CfDE076",
    splitter: "0x8aA1197eFF337Db0c2aaF9e085c50cB46A7Fb2f7",
    demoDApp: "0xFE6389811C6690CC7B367EaEfdF344Ed1eFbd5f6",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    rpc: "https://rpc.testnet.arc.network",
    explorer: "https://testnet.arcscan.app"
  },
  [LOCAL_ANVIL_CHAIN_ID]: {
    // These will be overridden locally, or we provide defaults for local tests
    factory: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    vault: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    paymaster: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    splitter: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    demoDApp: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    rpc: "http://127.0.0.1:8545",
    explorer: ""
  }
};
