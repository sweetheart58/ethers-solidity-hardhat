import { network, deployments, ethers, getNamedAccounts } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { Wallet } from "../../typechain-types";

// * if the newwork will be hardhat or localhost then these tests will be run.
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Wallet Unit Tests", function () {
          let wallet: Wallet, deployer;

          beforeEach(async function () {
              if (!developmentChains.includes(network.name)) {
                  throw "You need to be on a development chain to run tests";
              }
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              wallet = await ethers.getContractAt("Wallet", deployer);
          });
      });
