import { Wallet } from "../typechain-types";
import { ContractTransaction } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";

const withdrawFunction: () => Promise<void> = async () => {
    const { deployer } = await getNamedAccounts();

    if (network.name == "hardhat") {
        console.log("Running Script on Hardhat Network");
        await deployments.fixture(["all"]);
    } else {
        console.log(`Running Script on ${network.name} Network`);
    }

    const wallet: Wallet = await ethers.getContract("Wallet", deployer);
    console.log(`Wallet deployed at: ${wallet.address}`);

    const tx: ContractTransaction = await wallet.withdraw();
    await tx.wait(1);

    console.log("Funds Withdrawn!!!");
};

withdrawFunction()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
