// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SonicStreamPay
 * @notice Streaming payment protocol optimized for Sonic blockchain
 * @dev Based on LlamaPay's efficient design with 20-digit precision
 */
contract SonicStreamPay is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    /// @notice Precision multiplier for rate calculations (20 digits)
    uint256 public constant PRECISION = 1e20;

    // ============ Structs ============

    struct Stream {
        address sender;
        address recipient;
        uint256 amountPerSec;  // Amount per second (with PRECISION)
        uint256 startTime;
        uint256 stopTime;      // 0 = indefinite
        uint256 withdrawn;     // Total withdrawn (with PRECISION)
    }

    // ============ State Variables ============

    /// @notice Token => Sender => Recipient => Stream
    mapping(address => mapping(address => mapping(address => Stream))) public streams;

    /// @notice Token => Sender => Total deposited balance
    mapping(address => mapping(address => uint256)) public balances;

    /// @notice Protocol fee (basis points, e.g., 10 = 0.1%)
    uint256 public protocolFeeBps = 0;  // Start with 0 for user acquisition

    /// @notice Accumulated protocol fees per token
    mapping(address => uint256) public accumulatedFees;

    /// @notice Paused state for emergency
    bool public paused;

    // ============ Events ============

    event StreamCreated(
        address indexed token,
        address indexed sender,
        address indexed recipient,
        uint256 amountPerSec,
        uint256 startTime,
        uint256 stopTime
    );

    event StreamCancelled(
        address indexed token,
        address indexed sender,
        address indexed recipient,
        uint256 senderRefund,
        uint256 recipientAmount
    );

    event Withdrawn(
        address indexed token,
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );

    event Deposited(
        address indexed token,
        address indexed sender,
        uint256 amount
    );

    // ============ Errors ============

    error StreamAlreadyExists();
    error StreamDoesNotExist();
    error InsufficientBalance();
    error InvalidAmount();
    error InvalidRecipient();
    error Paused();
    error OnlySenderOrRecipient();

    // ============ Modifiers ============

    modifier whenNotPaused() {
        if (paused) revert Paused();
        _;
    }

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {}

    // ============ External Functions ============

    /**
     * @notice Deposit tokens to fund streams
     * @param token ERC20 token address
     * @param amount Amount to deposit
     */
    function deposit(address token, uint256 amount) external whenNotPaused {
        if (amount == 0) revert InvalidAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        balances[token][msg.sender] += amount * PRECISION;

        emit Deposited(token, msg.sender, amount);
    }

    /**
     * @notice Create a new payment stream
     * @param token ERC20 token address
     * @param recipient Stream recipient
     * @param amountPerSec Amount per second (without PRECISION, will be multiplied)
     * @param duration Duration in seconds (0 = indefinite)
     */
    function createStream(
        address token,
        address recipient,
        uint256 amountPerSec,
        uint256 duration
    ) external whenNotPaused {
        if (recipient == address(0) || recipient == msg.sender) revert InvalidRecipient();
        if (amountPerSec == 0) revert InvalidAmount();

        Stream storage stream = streams[token][msg.sender][recipient];
        if (stream.amountPerSec != 0) revert StreamAlreadyExists();

        uint256 amountPerSecWithPrecision = amountPerSec * PRECISION;
        uint256 startTime = block.timestamp;
        uint256 stopTime = duration > 0 ? startTime + duration : 0;

        streams[token][msg.sender][recipient] = Stream({
            sender: msg.sender,
            recipient: recipient,
            amountPerSec: amountPerSecWithPrecision,
            startTime: startTime,
            stopTime: stopTime,
            withdrawn: 0
        });

        emit StreamCreated(token, msg.sender, recipient, amountPerSecWithPrecision, startTime, stopTime);
    }

    /**
     * @notice Create stream with initial deposit in one transaction
     * @param token ERC20 token address
     * @param recipient Stream recipient
     * @param amountPerSec Amount per second
     * @param duration Duration in seconds
     * @param depositAmount Initial deposit amount
     */
    function createStreamWithDeposit(
        address token,
        address recipient,
        uint256 amountPerSec,
        uint256 duration,
        uint256 depositAmount
    ) external whenNotPaused {
        // Deposit first
        if (depositAmount > 0) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), depositAmount);
            balances[token][msg.sender] += depositAmount * PRECISION;
            emit Deposited(token, msg.sender, depositAmount);
        }

        // Then create stream
        if (recipient == address(0) || recipient == msg.sender) revert InvalidRecipient();
        if (amountPerSec == 0) revert InvalidAmount();

        Stream storage stream = streams[token][msg.sender][recipient];
        if (stream.amountPerSec != 0) revert StreamAlreadyExists();

        uint256 amountPerSecWithPrecision = amountPerSec * PRECISION;
        uint256 startTime = block.timestamp;
        uint256 stopTime = duration > 0 ? startTime + duration : 0;

        streams[token][msg.sender][recipient] = Stream({
            sender: msg.sender,
            recipient: recipient,
            amountPerSec: amountPerSecWithPrecision,
            startTime: startTime,
            stopTime: stopTime,
            withdrawn: 0
        });

        emit StreamCreated(token, msg.sender, recipient, amountPerSecWithPrecision, startTime, stopTime);
    }

    /**
     * @notice Withdraw available funds from a stream
     * @param token ERC20 token address
     * @param sender Stream sender
     * @param amount Amount to withdraw (0 = max available)
     */
    function withdraw(
        address token,
        address sender,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        Stream storage stream = streams[token][sender][msg.sender];
        if (stream.amountPerSec == 0) revert StreamDoesNotExist();

        uint256 available = _withdrawable(token, sender, msg.sender);
        if (available == 0) revert InsufficientBalance();

        uint256 toWithdraw = amount == 0 ? available : amount;
        if (toWithdraw > available) revert InsufficientBalance();

        // Update state
        stream.withdrawn += toWithdraw;
        balances[token][sender] -= toWithdraw;

        // Calculate actual amount (remove precision)
        uint256 actualAmount = toWithdraw / PRECISION;

        // Apply protocol fee if any
        uint256 fee = 0;
        if (protocolFeeBps > 0) {
            fee = (actualAmount * protocolFeeBps) / 10000;
            accumulatedFees[token] += fee;
        }

        // Transfer tokens
        IERC20(token).safeTransfer(msg.sender, actualAmount - fee);

        emit Withdrawn(token, sender, msg.sender, actualAmount - fee);
    }

    /**
     * @notice Cancel a stream and refund remaining balance
     * @param token ERC20 token address
     * @param recipient Stream recipient
     */
    function cancelStream(
        address token,
        address recipient
    ) external nonReentrant whenNotPaused {
        Stream storage stream = streams[token][msg.sender][recipient];
        if (stream.amountPerSec == 0) revert StreamDoesNotExist();

        // Calculate withdrawable for recipient
        uint256 recipientAmount = _withdrawable(token, msg.sender, recipient);

        // Update balances
        if (recipientAmount > 0) {
            stream.withdrawn += recipientAmount;
            balances[token][msg.sender] -= recipientAmount;

            uint256 actualRecipientAmount = recipientAmount / PRECISION;
            IERC20(token).safeTransfer(recipient, actualRecipientAmount);
        }

        // Delete stream
        delete streams[token][msg.sender][recipient];

        emit StreamCancelled(
            token,
            msg.sender,
            recipient,
            balances[token][msg.sender] / PRECISION,
            recipientAmount / PRECISION
        );
    }

    /**
     * @notice Withdraw deposited balance (not streamed yet)
     * @param token ERC20 token address
     * @param amount Amount to withdraw
     */
    function withdrawDeposit(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        uint256 amountWithPrecision = amount * PRECISION;
        if (balances[token][msg.sender] < amountWithPrecision) revert InsufficientBalance();

        balances[token][msg.sender] -= amountWithPrecision;
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    // ============ View Functions ============

    /**
     * @notice Get withdrawable amount for a recipient
     * @param token ERC20 token address
     * @param sender Stream sender
     * @param recipient Stream recipient
     * @return Withdrawable amount (with PRECISION)
     */
    function withdrawable(
        address token,
        address sender,
        address recipient
    ) external view returns (uint256) {
        return _withdrawable(token, sender, recipient);
    }

    /**
     * @notice Get stream details
     * @param token ERC20 token address
     * @param sender Stream sender
     * @param recipient Stream recipient
     */
    function getStream(
        address token,
        address sender,
        address recipient
    ) external view returns (
        uint256 amountPerSec,
        uint256 startTime,
        uint256 stopTime,
        uint256 withdrawn,
        uint256 withdrawableAmount,
        uint256 senderBalance
    ) {
        Stream storage stream = streams[token][sender][recipient];
        return (
            stream.amountPerSec,
            stream.startTime,
            stream.stopTime,
            stream.withdrawn,
            _withdrawable(token, sender, recipient),
            balances[token][sender]
        );
    }

    /**
     * @notice Get sender's deposited balance
     * @param token ERC20 token address
     * @param sender Address to check
     */
    function getBalance(address token, address sender) external view returns (uint256) {
        return balances[token][sender] / PRECISION;
    }

    // ============ Internal Functions ============

    function _withdrawable(
        address token,
        address sender,
        address recipient
    ) internal view returns (uint256) {
        Stream storage stream = streams[token][sender][recipient];
        if (stream.amountPerSec == 0) return 0;

        uint256 endTime = stream.stopTime == 0 ? block.timestamp :
            (block.timestamp > stream.stopTime ? stream.stopTime : block.timestamp);

        uint256 elapsed = endTime - stream.startTime;
        uint256 totalStreamed = elapsed * stream.amountPerSec;
        uint256 available = totalStreamed - stream.withdrawn;

        // Cap at sender's balance
        uint256 senderBalance = balances[token][sender];
        return available > senderBalance ? senderBalance : available;
    }

    // ============ Admin Functions ============

    /**
     * @notice Set protocol fee (only owner)
     * @param newFeeBps New fee in basis points (max 100 = 1%)
     */
    function setProtocolFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 100, "Fee too high");
        protocolFeeBps = newFeeBps;
    }

    /**
     * @notice Withdraw accumulated protocol fees
     * @param token Token to withdraw
     */
    function withdrawFees(address token) external onlyOwner {
        uint256 amount = accumulatedFees[token];
        accumulatedFees[token] = 0;
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @notice Pause/unpause contract (emergency)
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
}
