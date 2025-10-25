import { expect } from "chai";
import { ethers } from "hardhat";
import { BlockCatsNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BlockCatsNFT - Breeding System", function () {
  let nft: BlockCatsNFT;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;

  const sampleSeed = ethers.randomBytes(32);
  const metadataURI = "ipfs://QmTest123";

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("BlockCatsNFT");
    nft = await NFT.deploy();
    await nft.waitForDeployment();
  });

  describe("Genesis Cat Minting", function () {
    it("should mint genesis cat with generation 0 and isGenesis true", async function () {
      const genesisDNA = {
        variant: 0,
        collarColor: 0,
        speed: 3,
        luck: 4,
        strength: 2,
        regen: 5,
        defense: 3,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player1.address, genesisDNA, sampleSeed, metadataURI, [0, 0]);

      const [catDna] = await nft.getCat(0);
      expect(catDna.generation).to.equal(0);
      expect(catDna.isGenesis).to.equal(true);
      expect(catDna.speed).to.equal(3);
    });
  });

  describe("Breeding Algorithm", function () {
    it("should breed two genesis cats and produce Gen 1 child", async function () {
      // Mint parent 1 (Gen 0)
      const parent1DNA = {
        variant: 0,
        collarColor: 0,
        speed: 5,
        luck: 5,
        strength: 5,
        regen: 5,
        defense: 5,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player1.address, parent1DNA, sampleSeed, "ipfs://parent1", [0, 0]);

      // Mint parent 2 (Gen 0)
      const parent2DNA = {
        variant: 1,
        collarColor: 1,
        speed: 6,
        luck: 6,
        strength: 6,
        regen: 6,
        defense: 6,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player2.address, parent2DNA, sampleSeed, "ipfs://parent2", [0, 0]);

      // Breed cats
      const breedTx = await nft.breedCats(0, 1, player1.address, "ipfs://child");
      const receipt = await breedTx.wait();

      // Verify child exists (should be token ID 2)
      const [childDNA] = await nft.getCat(2);

      // Verify generation
      expect(childDNA.generation).to.equal(1); // Gen 0 + 1 = Gen 1

      // Verify not genesis
      expect(childDNA.isGenesis).to.be.false;

      // Verify stats are in valid range (1-10)
      expect(childDNA.speed).to.be.at.least(1);
      expect(childDNA.speed).to.be.at.most(10);
      expect(childDNA.strength).to.be.at.least(1);
      expect(childDNA.strength).to.be.at.most(10);
      expect(childDNA.defense).to.be.at.least(1);
      expect(childDNA.defense).to.be.at.most(10);
      expect(childDNA.regen).to.be.at.least(1);
      expect(childDNA.regen).to.be.at.most(10);
      expect(childDNA.luck).to.be.at.least(1);
      expect(childDNA.luck).to.be.at.most(10);

      // Verify variant and collar inherited correctly
      expect(childDNA.variant).to.equal(0); // From parent 1
      expect(childDNA.collarColor).to.equal(1); // From parent 2
    });

    it("should produce deterministic breeding results", async function () {
      // Mint two parents
      const parent1DNA = {
        variant: 0,
        collarColor: 0,
        speed: 7,
        luck: 8,
        strength: 6,
        regen: 9,
        defense: 7,
        generation: 0,
        isGenesis: true,
      };

      const parent2DNA = {
        variant: 1,
        collarColor: 1,
        speed: 5,
        luck: 6,
        strength: 8,
        regen: 5,
        defense: 9,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player1.address, parent1DNA, sampleSeed, "ipfs://p1", [0, 0]);
      await nft.mintCat(player2.address, parent2DNA, sampleSeed, "ipfs://p2", [0, 0]);

      // Breed once
      await nft.breedCats(0, 1, player1.address, "ipfs://child1");
      const [child1DNA] = await nft.getCat(2);

      // Redeploy contract and breed again with same parents
      const NFT2 = await ethers.getContractFactory("BlockCatsNFT");
      const nft2 = await NFT2.deploy();
      await nft2.waitForDeployment();

      await nft2.mintCat(player1.address, parent1DNA, sampleSeed, "ipfs://p1", [0, 0]);
      await nft2.mintCat(player2.address, parent2DNA, sampleSeed, "ipfs://p2", [0, 0]);

      await nft2.breedCats(0, 1, player1.address, "ipfs://child2");
      const [child2DNA] = await nft2.getCat(2);

      // Stats should be identical (deterministic)
      expect(child1DNA.speed).to.equal(child2DNA.speed);
      expect(child1DNA.strength).to.equal(child2DNA.strength);
      expect(child1DNA.defense).to.equal(child2DNA.defense);
      expect(child1DNA.regen).to.equal(child2DNA.regen);
      expect(child1DNA.luck).to.equal(child2DNA.luck);
    });

    it("should apply generational bonus correctly", async function () {
      // Create Gen 0 parents
      const parent1DNA = {
        variant: 0,
        collarColor: 0,
        speed: 5,
        luck: 5,
        strength: 5,
        regen: 5,
        defense: 5,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player1.address, parent1DNA, sampleSeed, "ipfs://p1", [0, 0]);
      await nft.mintCat(player2.address, parent1DNA, sampleSeed, "ipfs://p2", [0, 0]);

      // Breed to Gen 1
      await nft.breedCats(0, 1, player1.address, "ipfs://gen1");
      const [gen1DNA] = await nft.getCat(2);
      expect(gen1DNA.generation).to.equal(1);

      // Create another Gen 1
      await nft.mintCat(player1.address, parent1DNA, sampleSeed, "ipfs://p3", [0, 0]);
      await nft.breedCats(0, 3, player1.address, "ipfs://gen1b");

      // Breed two Gen 1s to create Gen 2 (should have +0 bonus since 1/2 = 0)
      await nft.breedCats(2, 4, player1.address, "ipfs://gen2");
      const [gen2DNA] = await nft.getCat(5);
      expect(gen2DNA.generation).to.equal(2);

      // Create Gen 4 parents (artificially for testing)
      const gen4DNA = {
        variant: 0,
        collarColor: 0,
        speed: 5,
        luck: 5,
        strength: 5,
        regen: 5,
        defense: 5,
        generation: 4,
        isGenesis: false,
      };

      await nft.mintCat(player1.address, gen4DNA, sampleSeed, "ipfs://g4a", [0, 0]);
      await nft.mintCat(player2.address, gen4DNA, sampleSeed, "ipfs://g4b", [0, 0]);

      // Breed two Gen 4s to create Gen 5 (should have +2 bonus since 4/2 = 2)
      await nft.breedCats(6, 7, player1.address, "ipfs://gen5");
      const [gen5DNA] = await nft.getCat(8);
      expect(gen5DNA.generation).to.equal(5);

      // Gen 5 stats should be higher due to generational bonus
      // Base would be 5, mutation can be -1 to +2, generational bonus is +2
      // So possible range is 5 + (-1) + 2 = 6 to 5 + 2 + 2 = 9
      expect(gen5DNA.speed).to.be.at.least(6);
    });

    it("should clamp stats to 1-10 range", async function () {
      // Test with very low stats (edge case)
      const lowStatsDNA = {
        variant: 0,
        collarColor: 0,
        speed: 1,
        luck: 1,
        strength: 1,
        regen: 1,
        defense: 1,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player1.address, lowStatsDNA, sampleSeed, "ipfs://low1", [0, 0]);
      await nft.mintCat(player2.address, lowStatsDNA, sampleSeed, "ipfs://low2", [0, 0]);

      await nft.breedCats(0, 1, player1.address, "ipfs://childLow");
      const [childLowDNA] = await nft.getCat(2);

      // Even with -1 mutation, stats should not go below 1
      expect(childLowDNA.speed).to.be.at.least(1);
      expect(childLowDNA.strength).to.be.at.least(1);

      // Test with very high stats
      const highStatsDNA = {
        variant: 0,
        collarColor: 0,
        speed: 10,
        luck: 10,
        strength: 10,
        regen: 10,
        defense: 10,
        generation: 8, // High gen for bonus
        isGenesis: false,
      };

      await nft.mintCat(player1.address, highStatsDNA, sampleSeed, "ipfs://high1", [0, 0]);
      await nft.mintCat(player2.address, highStatsDNA, sampleSeed, "ipfs://high2", [0, 0]);

      await nft.breedCats(3, 4, player1.address, "ipfs://childHigh");
      const [childHighDNA] = await nft.getCat(5);

      // Even with +2 mutation and +4 generational bonus, should not exceed 10
      expect(childHighDNA.speed).to.be.at.most(10);
      expect(childHighDNA.strength).to.be.at.most(10);
    });

    it("should emit CatBred and CatMinted events", async function () {
      const parent1DNA = {
        variant: 0,
        collarColor: 0,
        speed: 5,
        luck: 5,
        strength: 5,
        regen: 5,
        defense: 5,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player1.address, parent1DNA, sampleSeed, "ipfs://p1", [0, 0]);
      await nft.mintCat(player2.address, parent1DNA, sampleSeed, "ipfs://p2", [0, 0]);

      await expect(nft.breedCats(0, 1, player1.address, "ipfs://child"))
        .to.emit(nft, "CatBred")
        .withArgs(2, 0, 1)
        .and.to.emit(nft, "CatMinted");
    });

    it("should fail to breed non-existent cats", async function () {
      await expect(
        nft.breedCats(0, 1, player1.address, "ipfs://child")
      ).to.be.revertedWith("Parent 1 doesn't exist");
    });

    it("should only allow owner to breed", async function () {
      const parent1DNA = {
        variant: 0,
        collarColor: 0,
        speed: 5,
        luck: 5,
        strength: 5,
        regen: 5,
        defense: 5,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player1.address, parent1DNA, sampleSeed, "ipfs://p1", [0, 0]);
      await nft.mintCat(player2.address, parent1DNA, sampleSeed, "ipfs://p2", [0, 0]);

      await expect(
        nft.connect(player1).breedCats(0, 1, player1.address, "ipfs://child")
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  describe("Parent Tracking", function () {
    it("should correctly track parent IDs in bred cats", async function () {
      const parent1DNA = {
        variant: 0,
        collarColor: 0,
        speed: 5,
        luck: 5,
        strength: 5,
        regen: 5,
        defense: 5,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player1.address, parent1DNA, sampleSeed, "ipfs://p1", [0, 0]);
      await nft.mintCat(player2.address, parent1DNA, sampleSeed, "ipfs://p2", [0, 0]);

      await nft.breedCats(0, 1, player1.address, "ipfs://child");

      const [, , , parentIds] = await nft.getCat(2);
      expect(parentIds[0]).to.equal(0);
      expect(parentIds[1]).to.equal(1);
    });
  });

  describe("Realistic Breeding Scenario", function () {
    it("should handle a complete breeding flow", async function () {
      // Step 1: Mint two genesis cats with different stats
      const genesis1 = {
        variant: 0,
        collarColor: 14, // Red
        speed: 3,
        luck: 4,
        strength: 2,
        regen: 5,
        defense: 3,
        generation: 0,
        isGenesis: true,
      };

      const genesis2 = {
        variant: 1,
        collarColor: 4, // Yellow
        speed: 4,
        luck: 3,
        strength: 5,
        regen: 2,
        defense: 4,
        generation: 0,
        isGenesis: true,
      };

      await nft.mintCat(player1.address, genesis1, sampleSeed, "ipfs://g1", [0, 0]);
      await nft.mintCat(player2.address, genesis2, sampleSeed, "ipfs://g2", [0, 0]);

      // Step 2: Breed them
      const tx = await nft.breedCats(0, 1, player1.address, "ipfs://bred1");
      await tx.wait();

      // Step 3: Verify child
      const [childDNA, , birthTime, parentIds, uri, ownerAddr, rarityScore] = await nft.getCat(2);

      expect(ownerAddr).to.equal(player1.address);
      expect(childDNA.generation).to.equal(1);
      expect(childDNA.isGenesis).to.equal(false);
      expect(childDNA.variant).to.equal(0); // From parent 1
      expect(childDNA.collarColor).to.equal(4); // From parent 2
      expect(parentIds[0]).to.equal(0);
      expect(parentIds[1]).to.equal(1);

      // Stats should be around average of parents (3.5-4.5) plus mutation
      const avgSpeed = (genesis1.speed + genesis2.speed) / 2; // 3.5
      expect(childDNA.speed).to.be.at.least(1); // Can mutate down
      expect(childDNA.speed).to.be.at.most(10);

      // Rarity score should be sum of all stats
      const calculatedRarity = childDNA.speed + childDNA.luck + childDNA.strength +
                               childDNA.regen + childDNA.defense;
      expect(rarityScore).to.equal(calculatedRarity);

      console.log("\n=== Breeding Test Results ===");
      console.log(`Parent 1 Stats: [${genesis1.speed},${genesis1.strength},${genesis1.defense},${genesis1.regen},${genesis1.luck}] = ${genesis1.speed + genesis1.strength + genesis1.defense + genesis1.regen + genesis1.luck}`);
      console.log(`Parent 2 Stats: [${genesis2.speed},${genesis2.strength},${genesis2.defense},${genesis2.regen},${genesis2.luck}] = ${genesis2.speed + genesis2.strength + genesis2.defense + genesis2.regen + genesis2.luck}`);
      console.log(`Child Stats: [${childDNA.speed},${childDNA.strength},${childDNA.defense},${childDNA.regen},${childDNA.luck}] = ${rarityScore}`);
      console.log(`Child Generation: ${childDNA.generation}`);
      console.log(`Child IsGenesis: ${childDNA.isGenesis}`);
      console.log("=============================\n");
    });
  });
});
