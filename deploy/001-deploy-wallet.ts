import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * * Important Notes
 *
 * * In order to run `npx hardhat deploy --typecheck` command we need to add `import hardhat-deploy` in `hardhat.config.js` file.
 *
 */

const deployWallet: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments } = hre;
    const { deploy } = deployments;
};

export default deployWallet;
