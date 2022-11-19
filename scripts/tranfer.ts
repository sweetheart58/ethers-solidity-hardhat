import { BigNumber, ContractTransaction } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { Wallet } from "../typechain-types";

const transferFunction: () => Promise<void> = async () => {
    const [deployer, randomAddress1, randomAddress2] =
        await ethers.getSigners();
    const oneEther: BigNumber = ethers.utils.parseEther("1");

    if (network.name == "hardhat") {
        console.log("Running Script on Hardhat Network");
        await deployments.fixture(["all"]);
    } else {
        console.log(`Running Script on ${network.name} Network`);
    }

    const wallet: Wallet = await ethers.getContract("Wallet", deployer);
    console.log(`Wallet deployed at: ${wallet.address}`);

    const tx: ContractTransaction = await wallet.transfer(
        [randomAddress1.address, randomAddress2.address],
        [oneEther, oneEther],
        {
            value: ethers.utils.parseEther("2"),
        }
    );
    await tx.wait(1);

    console.log("Funds Transfered!!!");

    const balanceOfRandomAddress1: BigNumber = await ethers.provider.getBalance(
        randomAddress1.address
    );
    const balanceOfRandomAddress2: BigNumber = await ethers.provider.getBalance(
        randomAddress2.address
    );
    console.log(`Balance Of Random Address 1: ${balanceOfRandomAddress1}`);
    console.log(`Balance Of Random Address 2: ${balanceOfRandomAddress2}`);
};

transferFunction()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
