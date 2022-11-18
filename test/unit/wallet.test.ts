import { network, deployments, ethers, getNamedAccounts } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { Wallet, Wallet__factory } from "../../typechain-types";
import { assert, expect } from "chai";
import { BigNumber, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// * if the newwork will be hardhat or localhost then these tests will be run.
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Wallet Unit Tests", () => {
          const oneEther: BigNumber = ethers.utils.parseEther("1");
          let wallet: Wallet;
          let deployer: string;

          beforeEach(async () => {
              if (!developmentChains.includes(network.name)) {
                  throw "You need to be on a development chain to run tests";
              }
              deployer = (await getNamedAccounts()).deployer;
              //   await deployments.fixture(["all"]);
              const Wallet: Wallet__factory = await ethers.getContractFactory(
                  "Wallet"
              );
              wallet = await Wallet.deploy();
          });

          describe("deposit", () => {
              it("should revert if value is less than or equal to zero", async () => {
                  expect(
                      wallet.deposit({ value: ethers.utils.parseEther("0") })
                  ).to.be.revertedWithCustomError(
                      wallet,
                      "Wallet__ValueShouldBeGreaterThanZero"
                  );
              });

              it("should deposit funds of any user.", async () => {
                  // * get all signers using ethers.
                  const accounts: SignerWithAddress[] =
                      await ethers.getSigners();

                  // * get two accounts from ethers signers and renamed them.
                  // * first amount is by default deployer account so we skip that.
                  const [owner, randomAccount1, randomAccount2] = accounts;

                  // * connect each account with contract one by one and deposit funds.
                  await wallet
                      .connect(randomAccount1)
                      .deposit({ value: oneEther });
                  await wallet
                      .connect(randomAccount2)
                      .deposit({ value: oneEther });

                  // * now we have deposit 2 ethers, the contract should contains 2 ETH, let's test it.
                  const contractBalance: BigNumber =
                      await wallet.getContractBalance();
                  assert(
                      contractBalance.toString() ==
                          ethers.utils.parseEther("2").toString()
                  );

                  // * check balance of each users.
                  assert(
                      (
                          await wallet.getBalance(randomAccount1.address)
                      ).toString() == oneEther.toString()
                  );
                  assert(
                      (
                          await wallet.getBalance(randomAccount2.address)
                      ).toString() == oneEther.toString()
                  );
              });
          });

          describe("withdraw", () => {
              it("should revert if user's balance is less than or equal to zero", async () => {
                  // * we are withdrawing without funding, it should revert.
                  expect(wallet.withdraw()).to.be.revertedWithCustomError(
                      wallet,
                      "Wallet__ZeroBalance"
                  );
              });

              it("should allow user to withdraw", async () => {
                  // * before withdraw, should add funds for user.
                  // * first amount is by default deployer account so we skip that.
                  const [owner, randomAccount1] = await ethers.getSigners();

                  const otherUserWalletInstance: Wallet =
                      wallet.connect(randomAccount1);

                  // * deposit 1 ether
                  await otherUserWalletInstance.deposit({ value: oneEther });
                  // * check is it deposited?
                  const balance: BigNumber = await wallet.getBalance(
                      randomAccount1.address
                  );
                  assert(balance.toString() == oneEther.toString());

                  // * now check withdraw.
                  const tx: ContractTransaction =
                      await otherUserWalletInstance.withdraw();
                  await tx.wait(1);

                  const updatedBalance: BigNumber = await wallet.getBalance(
                      randomAccount1.address
                  );
                  assert(updatedBalance.toString() == "0");
              });

              it("should not revert if withdraw success", async () => {
                  await wallet.deposit({ value: oneEther });
                  expect(wallet.withdraw()).not.to.be.revertedWithCustomError(
                      wallet,
                      "Wallet__FailedToTransfer"
                  );
              });
          });

          describe("transfer", () => {});
      });
