import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SonicStreamPay } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SonicStreamPay", function () {
  let streamPay: SonicStreamPay;
  let mockToken: any;
  let owner: SignerWithAddress;
  let sender: SignerWithAddress;
  let recipient: SignerWithAddress;

  const PRECISION = BigInt(10 ** 20);
  const INITIAL_BALANCE = ethers.parseUnits("10000", 18); // 10,000 tokens
  const AMOUNT_PER_SEC = ethers.parseUnits("1", 18); // 1 token per second

  beforeEach(async function () {
    [owner, sender, recipient] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MOCK", 18);
    await mockToken.waitForDeployment();

    // Deploy SonicStreamPay
    const SonicStreamPay = await ethers.getContractFactory("SonicStreamPay");
    streamPay = await SonicStreamPay.deploy();
    await streamPay.waitForDeployment();

    // Mint tokens to sender
    await mockToken.mint(sender.address, INITIAL_BALANCE);

    // Approve StreamPay contract
    await mockToken.connect(sender).approve(
      await streamPay.getAddress(),
      ethers.MaxUint256
    );
  });

  describe("Deposit", function () {
    it("Should deposit tokens", async function () {
      const depositAmount = ethers.parseUnits("1000", 18);

      await streamPay.connect(sender).deposit(
        await mockToken.getAddress(),
        depositAmount
      );

      const balance = await streamPay.getBalance(
        await mockToken.getAddress(),
        sender.address
      );
      expect(balance).to.equal(depositAmount);
    });

    it("Should emit Deposited event", async function () {
      const depositAmount = ethers.parseUnits("1000", 18);

      await expect(
        streamPay.connect(sender).deposit(
          await mockToken.getAddress(),
          depositAmount
        )
      )
        .to.emit(streamPay, "Deposited")
        .withArgs(await mockToken.getAddress(), sender.address, depositAmount);
    });
  });

  describe("Create Stream", function () {
    beforeEach(async function () {
      // Deposit funds first
      await streamPay.connect(sender).deposit(
        await mockToken.getAddress(),
        ethers.parseUnits("1000", 18)
      );
    });

    it("Should create a stream", async function () {
      await streamPay.connect(sender).createStream(
        await mockToken.getAddress(),
        recipient.address,
        AMOUNT_PER_SEC,
        0 // indefinite
      );

      const stream = await streamPay.getStream(
        await mockToken.getAddress(),
        sender.address,
        recipient.address
      );

      expect(stream.amountPerSec).to.equal(AMOUNT_PER_SEC * PRECISION);
    });

    it("Should emit StreamCreated event", async function () {
      await expect(
        streamPay.connect(sender).createStream(
          await mockToken.getAddress(),
          recipient.address,
          AMOUNT_PER_SEC,
          0
        )
      ).to.emit(streamPay, "StreamCreated");
    });

    it("Should revert if stream already exists", async function () {
      await streamPay.connect(sender).createStream(
        await mockToken.getAddress(),
        recipient.address,
        AMOUNT_PER_SEC,
        0
      );

      await expect(
        streamPay.connect(sender).createStream(
          await mockToken.getAddress(),
          recipient.address,
          AMOUNT_PER_SEC,
          0
        )
      ).to.be.revertedWithCustomError(streamPay, "StreamAlreadyExists");
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      // Deposit and create stream
      await streamPay.connect(sender).createStreamWithDeposit(
        await mockToken.getAddress(),
        recipient.address,
        AMOUNT_PER_SEC,
        0,
        ethers.parseUnits("1000", 18)
      );
    });

    it("Should allow recipient to withdraw streamed funds", async function () {
      // Advance time by 100 seconds
      await time.increase(100);

      const balanceBefore = await mockToken.balanceOf(recipient.address);

      await streamPay.connect(recipient).withdraw(
        await mockToken.getAddress(),
        sender.address,
        0 // withdraw all available
      );

      const balanceAfter = await mockToken.balanceOf(recipient.address);

      // Should have received approximately 100 tokens (1 token/sec * 100 sec)
      // Allow some variance for block timing
      expect(balanceAfter - balanceBefore).to.be.closeTo(
        ethers.parseUnits("100", 18),
        ethers.parseUnits("2", 18) // 2 token tolerance
      );
    });

    it("Should emit Withdrawn event", async function () {
      await time.increase(100);

      await expect(
        streamPay.connect(recipient).withdraw(
          await mockToken.getAddress(),
          sender.address,
          0
        )
      ).to.emit(streamPay, "Withdrawn");
    });
  });

  describe("Cancel Stream", function () {
    beforeEach(async function () {
      await streamPay.connect(sender).createStreamWithDeposit(
        await mockToken.getAddress(),
        recipient.address,
        AMOUNT_PER_SEC,
        0,
        ethers.parseUnits("1000", 18)
      );
    });

    it("Should cancel stream and refund remaining balance", async function () {
      await time.increase(100);

      const recipientBalanceBefore = await mockToken.balanceOf(recipient.address);

      await streamPay.connect(sender).cancelStream(
        await mockToken.getAddress(),
        recipient.address
      );

      const recipientBalanceAfter = await mockToken.balanceOf(recipient.address);

      // Recipient should have received streamed amount
      expect(recipientBalanceAfter - recipientBalanceBefore).to.be.closeTo(
        ethers.parseUnits("100", 18),
        ethers.parseUnits("2", 18)
      );

      // Stream should be deleted
      const stream = await streamPay.getStream(
        await mockToken.getAddress(),
        sender.address,
        recipient.address
      );
      expect(stream.amountPerSec).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set protocol fee", async function () {
      await streamPay.setProtocolFee(10); // 0.1%
      expect(await streamPay.protocolFeeBps()).to.equal(10);
    });

    it("Should revert if non-owner tries to set fee", async function () {
      await expect(
        streamPay.connect(sender).setProtocolFee(10)
      ).to.be.revertedWithCustomError(streamPay, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to pause/unpause", async function () {
      await streamPay.setPaused(true);
      expect(await streamPay.paused()).to.be.true;

      await streamPay.setPaused(false);
      expect(await streamPay.paused()).to.be.false;
    });
  });
});

// Mock ERC20 for testing
import { ethers as hardhatEthers } from "hardhat";
