import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sonicTestnet: {
      url: "https://rpc.testnet.soniclabs.com",
      chainId: 14601,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      timeout: 120000,
    },
    sonicMainnet: {
      url: "https://rpc.soniclabs.com",
      chainId: 146,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      sonicMainnet: process.env.SONICSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "sonicMainnet",
        chainId: 146,
        urls: {
          apiURL: "https://api.sonicscan.org/api",
          browserURL: "https://sonicscan.org",
        },
      },
    ],
  },
};

export default config;
