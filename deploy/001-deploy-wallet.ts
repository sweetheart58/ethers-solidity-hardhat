import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains } from "../helper-hardhat-config";
import { network } from "hardhat";

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
        waitConfirmations: developmentChains.includes(network.name) ? 1 : 6,
    });

    console.log(`Deploy Script: Wallet contract address: ${wallet.address}`);
};

export default deployWallet;
deployWallet.tags = ["all", "wallet"];
