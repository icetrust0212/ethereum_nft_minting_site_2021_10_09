// We import Chai to use its asserting functions here.
const {
  expect
} = require("chai");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("NFT contract", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let metadataUri = "https://gateway.pinata.cloud/ipfs/QmbHc4TRoZQh4ZnnM2UQSr11diDdFpeXt1dntVw7jUhTvH";
  let contractUri = "https://gateway.pinata.cloud/ipfs/QmTUsZSsWe7hgL5wJFxigmAjSovntYrq6rUtx5Qhr8LasP";
  let proxyAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  let VRFCoordinator = "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9";
  let LinkToken = "0xa36085F69e2889c224210F603D836748e7dC0088";
  let keyhash = "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4";
  let contractName = "MyNFT";
  let contractSymbol = "NFT";
  let tokenAmount = 6;
  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("MyNFT");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatToken = await Token.deploy(
      proxyAddress,
      contractUri,
      metadataUri,
      contractName,
      contractSymbol,
      tokenAmount,
      VRFCoordinator,
      LinkToken,
      keyhash);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });
  });

  describe("Mint", function () {
    it("Mint NFT", async function () {
      // Transfer 50 tokens from owner to addr1
      const amount = 2;
      const prevBalance = await hardhatToken.balanceOf(owner.address);
      const tokenId = await hardhatToken.requestRandomNFT(owner.address, amount);
      const tokenBalance = await hardhatToken.balanceOf(owner.address);
      expect(tokenBalance).to.equal(prevBalance + amount);
      const remainTokenAmount = await hardhatToken.getAvaiableTokenAmount()
      expect(remainTokenAmount).to.equal(tokenAmount - tokenBalance)
    });
    it("NFT less than total amount", async function () {
      const result = await hardhatToken.requestRandomNFT(owner.address, 50);
      expect(result).to.equal("Should Be less or equal than total amount");
    });
    it("NFT less than amount per transaction", async function () {
      const result = await hardhatToken.requestRandomNFT(owner.address, 25);
      expect(result).to.equal("Should Be less or equal than amount per tx");
    })
    it("nft amount test: ", async function () {
      const amount = await hardhatToken.getTokenAmount();
      expect(amount).to.equal(tokenAmount);
      const result = await hardhatToken.requestRandomNFT(owner.address, 6);
    })
  });
});