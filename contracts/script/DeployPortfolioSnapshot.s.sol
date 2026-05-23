// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PortfolioSnapshot} from "../src/PortfolioSnapshot.sol";

/// @notice Deploys PortfolioSnapshot. Network selected via --rpc-url.
/// Mainnet deploys MUST be invoked manually with --broadcast + a hardware-backed signer.
/// Per CLAUDE.md: testnet first, always; mainnet requires explicit human confirmation.
contract DeployPortfolioSnapshot is Script {
    function run() external returns (PortfolioSnapshot deployed) {
        uint256 chainId = block.chainid;
        require(
            chainId == 84532 || chainId == 8453,
            "Unsupported chain (Base mainnet/Sepolia only)"
        );

        if (chainId == 8453) {
            console2.log("MAINNET DEPLOY — confirm via terminal prompt before broadcasting");
        }

        vm.startBroadcast();
        deployed = new PortfolioSnapshot();
        vm.stopBroadcast();

        console2.log("PortfolioSnapshot deployed at:", address(deployed));
        console2.log("Chain id:", chainId);
    }
}
