import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains } from "../helper-hardhat-config";
import { network } from "hardhat";
import verify from "../utils/verify";

/**
 * * Important Notes
 *
 * * In order to run `npx hardhat deploy --typecheck` command we need to add `import hardhat-deploy` in `hardhat.config.js` file.
 *
 */

const deployWallet: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const wallet = await deploy("Wallet", {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: developmentChains.includes(network.name) ? 1 : 6,
    });

    console.log(`Deploy Script: Wallet contract address: ${wallet.address}`);

    // * only verify on testnets or mainnets.
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        console.log(`Verifing...`);
        await verify(wallet.address, []);
        console.log(`Verified!`);
    }
};

export default deployWallet;
deployWallet.tags = ["all", "wallet"];
