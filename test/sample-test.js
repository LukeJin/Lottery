const { expect } = require("chai");
 
describe("LotteryMOK", function () {
  let Lottery, accounts, provider, MOK;
  beforeEach(async function () {
    // Create contract and account variables
    provider = await ethers.getDefaultProvider();
    accounts = await ethers.getSigners();
 
    // Deploy Mok token contract
    MOK = await ethers.getContractFactory("MOK");
    mok = await MOK.deploy();
 
    await mok.deployed();
 
    // Deploy Lottery contract address
    Lottery = await ethers.getContractFactory("LotteryMOK");
    lottery = await Lottery.deploy(
      [accounts[0].address, accounts[1].address],
      accounts[0].address,
      mok.address
    );
 
    await lottery.deployed();
  });
  it("Change the Price", async function () {
    // Change price and check if price changes
    await lottery.changePrice(ethers.utils.parseEther("15"));
    let ticketPrice = await lottery.ticketPrice();
    expect(ticketPrice.toString()).to.equal(ethers.utils.parseEther("15"));
 
    // Check non owner
    try {
      await lottery.connect(accounts[1]).changePrice(15);
      // if error fails
      throw new Error("Error: non Owner has changed price");
    } catch (err) {
      // error successful
      expect(err.message).to.match(/Only the owner can change the price/);
    }
  });
  it("Purchase a ticket, draw and withdraw winnings", async function () {
    let ticketCount = await lottery.ticketCount();
 
    // Check ticket count
    expect(ticketCount.toString()).to.equal("0");
 
    // Mint 10000 MOK tokens to account 1
    await mok.mint(accounts[1].address, ethers.utils.parseEther("10000"));
 
    // Display balance of account 1
    let account1Balance = await mok.balanceOf(accounts[1].address);
    console.log(account1Balance.toString());
 
    // Approve transfer from account 1 to lottery
    await mok
      .connect(accounts[1])
      .approve(lottery.address, ethers.utils.parseEther("40"));
    let allowance = await mok.allowance(accounts[1].address, lottery.address);
    console.log(allowance.toString());
 
    // Buy 2 tickets and check ticket count
    await lottery.connect(accounts[1]).buy(2);
    ticketCount = await lottery.ticketCount();
    expect(ticketCount.toString()).to.equal("2");
 
    // Create an array for the current ticket holders
    let ticketHolders = [];
    for (i = 0; i < ticketCount; i++) {
      ticketHolders.push(await lottery.tickets(i));
    }
 
    // Check the ticket holders
    expect(ticketHolders.toString()).to.equal(
      [accounts[1].address, accounts[1].address].toString()
    );
 
    // Check the ticket holders
    expect(ticketHolders.toString()).to.equal(
      [accounts[1].address, accounts[1].address].toString()
    );
 
    // Draw a random ticket
    await lottery.connect(accounts[0]).draw();
 
    // Try and draw if not an owner or manager
    try {
      await lottery.connect(accounts[3]).draw();
      // if error fails
      throw new Error("Error: A non owner or manager is drawing the lottery");
    } catch (err) {
      // error successful
      expect(err.message).to.match(
        /Caller is not a manager or the owner, can not draw/
      );
    }
 
    // Withdraw money for winner
    await lottery.connect(accounts[1]).withdraw();
    balance1 = await mok.balanceOf(accounts[1].address);
 
    //Winners balance should be 95% of winnings
    expect(balance1.toString()).to.equal(ethers.utils.parseEther("9998"));
 
    // Try to withdraw when you have no winnings
    try {
      await lottery.connect(accounts[0]).withdraw();
      // if error fails
      throw new Error("Error: Account is withdrawing without any winnnings");
    } catch (err) {
      // error successful
      expect(err.message).to.match(/Must have winnings > 0 to withdraw/);
    }
  });
});

