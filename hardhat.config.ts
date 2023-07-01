import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: "0.8.18",
    networks: {
        localhost: {
            url: "http://localhost:8545",
        },
        hardhat: {
            chainId: 1,
            forking: {
                url: process.env.FORKING_URL as string,
                blockNumber: parseInt(process.env.FORKING_BLOCK_NUMBER || ""),
            },
        },
    },
};

export default config;
