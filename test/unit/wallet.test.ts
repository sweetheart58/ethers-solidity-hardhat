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
              await deployments.fixture(["all"]);

              wallet = await ethers.getContract("Wallet", deployer);
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

              it("should emit `Deposit` event", async () => {
                  await expect(
                      wallet.deposit({ value: ethers.utils.parseEther("1") })
                  ).to.emit(wallet, "Deposit");
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

          describe("transfer", () => {
              it("should revert if value is less than or equal to zero", async () => {
                  const [owner, randomAccount1] = await ethers.getSigners();

                  await expect(
                      wallet.transfer([randomAccount1.address], [oneEther], {
                          value: ethers.utils.parseEther("0"),
                      })
                  ).to.be.revertedWithCustomError(
                      wallet,
                      "Wallet__ValueShouldBeGreaterThanZero"
                  );
              });

              it("should revert if value is less than sum of amounts", async () => {
                  const [owner, randomAccount1, randomAccount2] =
                      await ethers.getSigners();

                  // * here we are tranfering 2 ethers 1 to each address but only sending 1 ether as a `msg.value`, it should revert.
                  await expect(
                      wallet.transfer(
                          [randomAccount1.address, randomAccount2.address],
                          [oneEther, oneEther],
                          { value: oneEther }
                      )
                  ).to.be.revertedWithCustomError(
                      wallet,
                      "Wallet__ValueIsLessThanTotalAmounts"
                  );
              });

              it("should tranfer funds to single address", async () => {
                  const [owner, randomAccount1, randomAccount2] =
                      await ethers.getSigners();

                  const randomAccount1WalletInstance: Wallet =
                      wallet.connect(randomAccount1);

                  await expect(
                      randomAccount1WalletInstance.transfer(
                          // * array of address to tranfer funds.
                          [randomAccount2.address],
                          // * amount for each address in order.
                          [oneEther],
                          // * sum of total amount should be pass here.
                          { value: oneEther }
                      )
                  ).to.changeEtherBalances(
                      [randomAccount1, randomAccount2],
                      [(-oneEther).toString(), (+oneEther).toString()]
                  );
              });
          });
      });
