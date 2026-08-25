// Derived from the CURRENT deployed DAppVault.sol — do not change to match old ABIs
export const VAULT_ABI = [
    // View functions
    "function totalValue() public view returns (uint256)",
    "function unrecoveredCapital() public view returns (uint256)",
    // Public state variables (auto-generated getters)
    "function totalGasDeployed() external view returns (uint256)",
    "function totalCapitalRecovered() external view returns (uint256)",
    "function totalSupplyShares() external view returns (uint256)",
    "function lpShares(address account) external view returns (uint256)",
    "function developer() external view returns (address)",
    "function paymaster() external view returns (address)",
    "function splitter() external view returns (address)",
    "function lpProfitShareBps() external view returns (uint256)",
    // Write functions
    "function deposit() external payable returns (uint256 shares)",
    "function withdraw(uint256 shares) external returns (uint256 amount)"
];
