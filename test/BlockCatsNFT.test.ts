import { expect } from "chai";
import { ethers } from "hardhat";
import { BlockCatsNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BlockCatsNFT", function () {
  let nft: BlockCatsNFT;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;

  const sampleDNA = {
    variant: 3,
    collarColor: 14,
    speed: 8,
    luck: 5,
    strength: 7,
    regen: 3,
    defense: 9,
  };

  const sampleSeed = ethers.randomBytes(32);
  const metadataURI = "ipfs://QmTest123";

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("BlockCatsNFT");
    nft = await NFT.deploy();
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await nft.name()).to.equal("BlockCats");
      expect(await nft.symbol()).to.equal("BCAT");
    });

    it("Should set the deployer as owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint a cat with correct DNA", async function () {
      const tx = await nft.mintCat(
        player1.address,
        sampleDNA,
        sampleSeed,
        metadataURI,
        [0, 0]
      );

      await tx.wait();

      expect(await nft.ownerOf(0)).to.equal(player1.address);
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("Should store all DNA fields correctly", async function () {
      await nft.mintCat(
        player1.address,
        sampleDNA,
        sampleSeed,
        metadataURI,
        [0, 0]
      );

      const [catDna, seed] = await nft.getCat(0);

      expect(catDna.variant).to.equal(sampleDNA.variant);
      expect(catDna.collarColor).to.equal(sampleDNA.collarColor);
      expect(catDna.speed).to.equal(sampleDNA.speed);
      expect(catDna.luck).to.equal(sampleDNA.luck);
      expect(catDna.strength).to.equal(sampleDNA.strength);
      expect(catDna.regen).to.equal(sampleDNA.regen);
      expect(catDna.defense).to.equal(sampleDNA.defense);
      expect(seed).to.equal(ethers.hexlify(sampleSeed));
    });

    it("Should calculate rarity score correctly", async function () {
      await nft.mintCat(
        player1.address,
        sampleDNA,
        sampleSeed,
        metadataURI,
        [0, 0]
      );

      const [, , , , , , rarityScore] = await nft.getCat(0);
      const expectedScore = 8 + 5 + 7 + 3 + 9; // 32

      expect(rarityScore).to.equal(expectedScore);
    });

    it("Should store parent IDs correctly", async function () {
      await nft.mintCat(
        player1.address,
        sampleDNA,
        sampleSeed,
        metadataURI,
        [5, 7]
      );

      const [, , , parentIds] = await nft.getCat(0);
      expect(parentIds[0]).to.equal(5);
      expect(parentIds[1]).to.equal(7);
    });

    it("Should emit CatMinted event", async function () {
      await expect(
        nft.mintCat(player1.address, sampleDNA, sampleSeed, metadataURI, [0, 0])
      )
        .to.emit(nft, "CatMinted")
        .withArgs(0, player1.address, [0, 0]);
    });

    it("Should only allow owner to mint", async function () {
      await expect(
        nft.connect(player1).mintCat(
          player1.address,
          sampleDNA,
          sampleSeed,
          metadataURI,
          [0, 0]
        )
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  describe("Daily Limits", function () {
    it("Should enforce daily global limit", async function () {
      // Mint 10 cats (max)
      for (let i = 0; i < 10; i++) {
        await nft.mintCat(
          player1.address,
          sampleDNA,
          sampleSeed,
          metadataURI,
          [0, 0]
        );
      }

      // 11th should fail
      await expect(
        nft.mintCat(player1.address, sampleDNA, sampleSeed, metadataURI, [0, 0])
      ).to.be.revertedWith("Daily mint limit reached");
    });

    it("Should reset daily limit after 24 hours", async function () {
      // Mint 10 cats
      for (let i = 0; i < 10; i++) {
        await nft.mintCat(
          player1.address,
          sampleDNA,
          sampleSeed,
          metadataURI,
          [0, 0]
        );
      }

      // Fast forward 24 hours
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine", []);

      // Should work again
      await expect(
        nft.mintCat(player1.address, sampleDNA, sampleSeed, metadataURI, [0, 0])
      ).to.not.be.reverted;

      expect(await nft.totalSupply()).to.equal(11);
    });

    it("Should return correct mint status", async function () {
      // Mint 3 cats
      for (let i = 0; i < 3; i++) {
        await nft.mintCat(
          player1.address,
          sampleDNA,
          sampleSeed,
          metadataURI,
          [0, 0]
        );
      }

      const status = await nft.getMintStatus();
      expect(status.mintedToday).to.equal(3);
      expect(status.maxDaily).to.equal(10);
      expect(status.remaining).to.equal(7);
    });
  });

  describe("Reading Data", function () {
    it("Should read all cat info in one call", async function () {
      await nft.mintCat(
        player1.address,
        sampleDNA,
        sampleSeed,
        metadataURI,
        [5, 7]
      );

      const [catDna, , , parentIds, uri, owner] = await nft.getCat(0);

      expect(owner).to.equal(player1.address);
      expect(catDna.speed).to.equal(8);
      expect(parentIds[0]).to.equal(5);
      expect(parentIds[1]).to.equal(7);
      expect(uri).to.equal(metadataURI);
    });

    it("Should return correct total supply", async function () {
      expect(await nft.totalSupply()).to.equal(0);

      await nft.mintCat(
        player1.address,
        sampleDNA,
        sampleSeed,
        metadataURI,
        [0, 0]
      );
      expect(await nft.totalSupply()).to.equal(1);

      await nft.mintCat(
        player2.address,
        sampleDNA,
        sampleSeed,
        metadataURI,
        [0, 0]
      );
      expect(await nft.totalSupply()).to.equal(2);
    });
  });
});
