require("@nomicfoundation/hardhat-ethers");
require("dotenv").config({
  path: require("node:path").join(__dirname, ".env"),
});
const { subtask } = require("hardhat/config");
const {
  TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD,
} = require("hardhat/builtin-tasks/task-names");

// Pinned npm compiler makes fresh installs independent of solc download servers.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(
  async ({ solcVersion }, _hre, runSuper) => {
    if (solcVersion !== "0.8.28") return runSuper();
    return {
      compilerPath: require.resolve("solc/soljson.js"),
      isSolcJs: true,
      version: solcVersion,
      longVersion: require("solc").version(),
    };
  },
);

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "paris" },
  },
  networks: {
    hederaTestnet: {
      url: process.env.HEDERA_RPC_URL || "https://testnet.hashio.io/api",
      chainId: 296,
      accounts: process.env.HEDERA_PRIVATE_KEY
        ? [process.env.HEDERA_PRIVATE_KEY]
        : [],
      timeout: 120000,
    },
  },
};
