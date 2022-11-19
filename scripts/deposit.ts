import { BigNumber, ContractTransaction } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { Wallet } from "../typechain-types";

const depositFunction: () => Promise<void> = async () => {
    const { deployer } = await getNamedAccounts();
    const oneEther: BigNumber = ethers.utils.parseEther("1");

    if (network.name == "hardhat") {
        console.log("Running Script on Hardhat Network");
        await deployments.fixture(["all"]);
    } else {
        console.log(`Running Script on ${network.name} Network`);
    }

    const wallet: Wallet = await ethers.getContract("Wallet", deployer);
    console.log(`Wallet deployed at: ${wallet.address}`);

    const tx: ContractTransaction = await wallet.deposit({ value: oneEther });
    await tx.wait(1);

    console.log("Funds Deposited!!!");
};

depositFunction()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
