// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

// * imports
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// * custom erros
error Wallet__FailedToTransfer();
error Wallet__ZeroBalance();
error Wallet__ValueShouldBeGreaterThanZero();
error Wallet__ValueIsLessThanTotalAmounts();

/**
    @title Wallet Smart Contract
    @author Ali Murtaza Memon
    @notice This smart contract works as a bank, users can deposit, withdrawn and transfer funds to other addresses.
    @dev This contract has an extra function contractWithdraw that only owner can use to withdrawn funds that accidentally store inside contract.
    @custom:portfolio This is a portfolio smart contract.
*/
contract Wallet is ReentrancyGuard, Ownable {
    // * STATIC VARIABLES

    // * mappings
    mapping(address => uint256) private s_addressToFunds;

    // * EVENTS
    /**
     * @notice Emit the information about sender and the amount it deposited on deposit function call.
     * @param sender is the address of the caller of deposit function.
     * @param receiver is the address of the contract which will receive the user funds.
     * @param timestamp is the time when the event will trigger.
     * @param value is the uint256 type amount that sender will deposit.
     */
    event Deposit(
        address indexed sender,
        address indexed receiver,
        uint256 indexed timestamp,
        uint256 value
    );
    /**
     * @notice Emit the information about the caller, amount and timestamp when this event will trigger.
     * @param caller is the address of the user who will call the withdraw function.
     * @param value is the amount that will be withdrawn from user balance.
     * @param timestamp is the time when this event will trigger.
     */
    event Withdraw(
        address indexed caller,
        uint256 indexed value,
        uint256 indexed timestamp
    );

    // * FUNCTIONS

    // * receive function
    receive() external payable {}

    // * fallback function
    fallback() external payable {}

    // * external functions

    /**
        @notice using deposit function any users can store their funds to their allocated mapping location.
    */
    function deposit() external payable {
        if (msg.value <= 0) {
            revert Wallet__ValueShouldBeGreaterThanZero();
        }

        s_addressToFunds[msg.sender] += msg.value;
        emit Deposit(msg.sender, address(this), msg.value, block.timestamp);
    }

    /**
        @notice using withdraw function users can get back their funds.
        @dev This function is using nonReentrant from Openzeppelin's ReentrancyGuard. This will lock our function until it will not complete.
    */
    function withdraw() external nonReentrant {
        uint256 amount = s_addressToFunds[msg.sender];

        if (amount <= 0) {
            revert Wallet__ZeroBalance();
        }

        s_addressToFunds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert Wallet__FailedToTransfer();
        }
        emit Withdraw(msg.sender, amount, block.timestamp);
    }

    /**
        @notice using transfer function users can transfer funds to address(s).
        @dev This function is using nonReentrant from Openzeppelin's ReentrancyGuard. This will lock our function until it will not complete.
        @dev The length of addresses and amounts array should be equal.
        @dev The sum of amounts should not be greater than the msg.value.
        @dev example: If the msg.value will be let's say 4 ethers and we only tranfer 2 ethers to addresses then 2 ethers will store inside the contract address. This could be accidental state.
        @param receivers will be an array of addresses.
        @param amounts will be an array of amounts.
    */
    function transfer(
        address[] memory receivers,
        uint256[] memory amounts
    ) external payable nonReentrant {
        if (msg.value <= 0) {
            revert Wallet__ValueShouldBeGreaterThanZero();
        }

        // * calculate the sum of amounts.
        uint256 sum = 0;

        for (uint16 i = 0; i < amounts.length; i++) {
            sum += amounts[i];
        }

        // * check if sum is greater than `msg.value` then revert the error.
        if (sum > msg.value) {
            revert Wallet__ValueIsLessThanTotalAmounts();
        }

        for (uint16 i = 0; i < receivers.length; i++) {
            address receiver = receivers[i];
            uint256 amount = amounts[i];

            (bool success, ) = payable(receiver).call{value: amount}("");
            if (!success) {
                revert Wallet__FailedToTransfer();
            }
        }
    }

    // * view function

    /**
        @notice getBalance will return the balance information of users funds.
        @param accountAddress of the user.
        @return balance of user of type uint256 will be returned.
    */
    function getBalance(
        address accountAddress
    ) external view returns (uint256) {
        return s_addressToFunds[accountAddress];
    }

    /**
        @notice contractBalance will return the balance information of a smart contract.
        @return balance of smart contract of type uint256 will be returned.
    */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
