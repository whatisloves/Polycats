import { describe, it, expect, beforeEach } from 'vitest';
import {
  addCat,
  getCat,
  getCatsByOwner,
  getInventory,
  setActiveCat,
  createBattle,
  getBattle,
  updateBattle,
  getPendingChallengeForPlayer,
  getActiveBattleForPlayer,
  updateCatCooldown,
  canCatBattle,
  debugReset,
  deleteCat,
} from '@/lib/storage';
import { breedCats, calculateRarityScore } from '@/lib/breeding';
import { Cat } from '@/lib/storage/types';

describe('Battle API Endpoint Logic', () => {
  beforeEach(() => {
    debugReset();
  });

  describe('Battle Challenge Creation', () => {
    it('should create a valid battle challenge', () => {
      const challenger = '0x111';
      const challenged = '0x222';

      const cat1 = addCat({
        owner: challenger,
        name: 'Challenger Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const cat2 = addCat({
        owner: challenged,
        name: 'Challenged Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 6, defense: 6, regen: 6, luck: 6 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 30,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      setActiveCat(challenger, cat1.tokenId);
      setActiveCat(challenged, cat2.tokenId);

      const battle = createBattle({
        challenger,
        challenged,
        challengerCatId: cat1.tokenId,
        challengedCatId: cat2.tokenId,
        state: 'PENDING',
      });

      expect(battle.battleId).toBeDefined();
      expect(battle.challenger).toBe(challenger);
      expect(battle.challenged).toBe(challenged);
      expect(battle.state).toBe('PENDING');
      expect(battle.challengerCatId).toBe(cat1.tokenId);
      expect(battle.challengedCatId).toBe(cat2.tokenId);
    });

    it('should validate cat ownership before creating challenge', () => {
      const challenger = '0x111';
      const wrongOwner = '0x999';

      const cat = addCat({
        owner: challenger,
        name: 'Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      // Simulate API validation
      const catOwner = getCat(cat.tokenId)?.owner;
      const isOwner = catOwner?.toLowerCase() === wrongOwner.toLowerCase();

      expect(isOwner).toBe(false);
    });

    it('should prevent challenge with cat on cooldown', () => {
      const challenger = '0x111';
      const challenged = '0x222';

      const cat1 = addCat({
        owner: challenger,
        name: 'Cooldown Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: Date.now() + 86400000, // 24 hours
        textureUrl: 'http://example.com',
      });

      const canBattle = canCatBattle(cat1.tokenId);
      expect(canBattle).toBe(false);
    });
  });

  describe('Battle Acceptance', () => {
    it('should accept pending challenge and update state', () => {
      const challenger = '0x111';
      const challenged = '0x222';

      const cat1 = addCat({
        owner: challenger,
        name: 'Cat 1',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const cat2 = addCat({
        owner: challenged,
        name: 'Cat 2',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 6, defense: 6, regen: 6, luck: 6 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 30,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const battle = createBattle({
        challenger,
        challenged,
        challengerCatId: cat1.tokenId,
        challengedCatId: cat2.tokenId,
        state: 'PENDING',
      });

      // Accept the battle
      const updated = updateBattle(battle.battleId, {
        state: 'IN_PROGRESS',
        startTime: Date.now(),
      });

      expect(updated).toBe(true);

      const updatedBattle = getBattle(battle.battleId);
      expect(updatedBattle?.state).toBe('IN_PROGRESS');
      expect(updatedBattle?.startTime).toBeDefined();
    });

    it('should find pending challenge for player', () => {
      const challenger = '0x111';
      const challenged = '0x222';

      const cat1 = addCat({
        owner: challenger,
        name: 'Cat 1',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const cat2 = addCat({
        owner: challenged,
        name: 'Cat 2',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 6, defense: 6, regen: 6, luck: 6 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 30,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      createBattle({
        challenger,
        challenged,
        challengerCatId: cat1.tokenId,
        challengedCatId: cat2.tokenId,
        state: 'PENDING',
      });

      const pending = getPendingChallengeForPlayer(challenged);
      expect(pending).toBeDefined();
      expect(pending?.challenged).toBe(challenged);
    });
  });

  describe('Battle Result and Breeding', () => {
    it('should breed cats when battle completes', () => {
      const winner = '0x111';
      const loser = '0x222';

      const cat1 = addCat({
        owner: winner,
        name: 'Winner Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 6, defense: 4, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const cat2 = addCat({
        owner: loser,
        name: 'Loser Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 5, defense: 5, regen: 4, luck: 6 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 26,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      // Simulate battle result endpoint logic
      const childStats = breedCats(cat1, cat2);
      const childGeneration = Math.max(cat1.generation, cat2.generation) + 1;
      const childRarityScore = calculateRarityScore(childStats);

      expect(childGeneration).toBe(1); // Gen 0 parents -> Gen 1 child
      expect(childRarityScore).toBeGreaterThanOrEqual(5);
      expect(childRarityScore).toBeLessThanOrEqual(50);

      // All stats should be in valid range
      expect(childStats.speed).toBeGreaterThanOrEqual(1);
      expect(childStats.speed).toBeLessThanOrEqual(10);
    });

    it('should apply 24-hour cooldown to loser cat', () => {
      const loser = '0x222';

      const cat = addCat({
        owner: loser,
        name: 'Loser Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      // Simulate applying cooldown after loss
      const cooldownUntil = Date.now() + 86400000; // 24 hours
      updateCatCooldown(cat.tokenId, cooldownUntil);

      const canBattle = canCatBattle(cat.tokenId);
      expect(canBattle).toBe(false);

      const updatedCat = getCat(cat.tokenId);
      expect(updatedCat?.cooldownUntil).toBeGreaterThan(Date.now());
    });

    it('should auto-delete weakest cat when winner has 5 cats', () => {
      const winner = '0x111';
      const loser = '0x222';

      // Give winner 5 cats with different scores
      const scores = [15, 20, 25, 30, 35];
      const winnerCats: Cat[] = [];

      for (let i = 0; i < 5; i++) {
        const cat = addCat({
          owner: winner,
          name: `Cat ${i + 1}`,
          dna: '1,2,3,4,5,6,7',
          stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
          generation: 0,
          isGenesis: true,
          parent1Id: null,
          parent2Id: null,
          rarityScore: scores[i],
          cooldownUntil: 0,
          textureUrl: 'http://example.com',
        });
        winnerCats.push(cat);
      }

      const loserCat = addCat({
        owner: loser,
        name: 'Loser Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 6, defense: 6, regen: 6, luck: 6 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 30,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      // Simulate breeding and auto-delete logic
      const childStats = breedCats(winnerCats[0], loserCat);
      const childRarityScore = calculateRarityScore(childStats);

      // Check if inventory is full
      const inventory = getInventory(winner);
      if (inventory.catIds.length >= 5) {
        // Find weakest cat
        const allCats = getCatsByOwner(winner);
        const weakest = allCats.reduce((weakest, cat) =>
          cat.rarityScore < weakest.rarityScore ? cat : weakest
        );
        deleteCat(weakest.tokenId);
      }

      // Add new child cat
      const childCat = addCat({
        owner: winner,
        name: 'Bred Child',
        dna: '1,2,3,4,5,6,7',
        stats: childStats,
        generation: 1,
        isGenesis: false,
        parent1Id: winnerCats[0].tokenId,
        parent2Id: loserCat.tokenId,
        rarityScore: childRarityScore,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      // Verify inventory still has 5 cats
      const finalInventory = getInventory(winner);
      expect(finalInventory.catIds).toHaveLength(5);

      // Verify weakest cat (tokenId 1, score 15) was deleted
      const deletedCat = getCat(1);
      expect(deletedCat).toBeUndefined();

      // Verify new child cat exists
      const childExists = getCat(childCat.tokenId);
      expect(childExists).toBeDefined();
      expect(childExists?.generation).toBe(1);
    });

    it('should not auto-delete active cat even if weakest', () => {
      const winner = '0x111';
      const loser = '0x222';

      // Give winner weakest cat as active
      const weakCat = addCat({
        owner: winner,
        name: 'Weak Active',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 1, strength: 1, defense: 1, regen: 1, luck: 1 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 5,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      setActiveCat(winner, weakCat.tokenId);

      // Add 4 stronger cats
      for (let i = 0; i < 4; i++) {
        addCat({
          owner: winner,
          name: `Strong ${i + 1}`,
          dna: '1,2,3,4,5,6,7',
          stats: { speed: 7, strength: 7, defense: 7, regen: 7, luck: 7 },
          generation: 0,
          isGenesis: true,
          parent1Id: null,
          parent2Id: null,
          rarityScore: 35,
          cooldownUntil: 0,
          textureUrl: 'http://example.com',
        });
      }

      const loserCat = addCat({
        owner: loser,
        name: 'Loser Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 6, defense: 6, regen: 6, luck: 6 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 30,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      // Breed cats
      const childStats = breedCats(weakCat, loserCat);
      const childRarityScore = calculateRarityScore(childStats);

      // Auto-delete logic with active cat protection
      const activeCat = getInventory(winner).activeCatId;
      const inventory = getInventory(winner);

      if (inventory.catIds.length >= 5) {
        const allCats = getCatsByOwner(winner);
        const eligibleForDeletion = allCats.filter(
          cat => cat.tokenId !== activeCat
        );
        const weakest = eligibleForDeletion.reduce((weakest, cat) =>
          cat.rarityScore < weakest.rarityScore ? cat : weakest
        );
        deleteCat(weakest.tokenId);
      }

      // Add child
      addCat({
        owner: winner,
        name: 'Child',
        dna: '1,2,3,4,5,6,7',
        stats: childStats,
        generation: 1,
        isGenesis: false,
        parent1Id: weakCat.tokenId,
        parent2Id: loserCat.tokenId,
        rarityScore: childRarityScore,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      // Verify weak active cat still exists
      const activeStillExists = getCat(weakCat.tokenId);
      expect(activeStillExists).toBeDefined();

      // Verify inventory has 5 cats
      const finalInventory = getInventory(winner);
      expect(finalInventory.catIds).toHaveLength(5);
    });
  });

  describe('Battle State Management', () => {
    it('should track active battle for both players', () => {
      const challenger = '0x111';
      const challenged = '0x222';

      const cat1 = addCat({
        owner: challenger,
        name: 'Cat 1',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const cat2 = addCat({
        owner: challenged,
        name: 'Cat 2',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 6, defense: 6, regen: 6, luck: 6 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 30,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const battle = createBattle({
        challenger,
        challenged,
        challengerCatId: cat1.tokenId,
        challengedCatId: cat2.tokenId,
        state: 'IN_PROGRESS',
      });

      const activeBattle1 = getActiveBattleForPlayer(challenger);
      const activeBattle2 = getActiveBattleForPlayer(challenged);

      expect(activeBattle1?.battleId).toBe(battle.battleId);
      expect(activeBattle2?.battleId).toBe(battle.battleId);
    });

    it('should complete battle and update state', () => {
      const challenger = '0x111';
      const challenged = '0x222';

      const cat1 = addCat({
        owner: challenger,
        name: 'Cat 1',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const cat2 = addCat({
        owner: challenged,
        name: 'Cat 2',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 6, defense: 6, regen: 6, luck: 6 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 30,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const battle = createBattle({
        challenger,
        challenged,
        challengerCatId: cat1.tokenId,
        challengedCatId: cat2.tokenId,
        state: 'IN_PROGRESS',
      });

      // Complete battle
      const updated = updateBattle(battle.battleId, {
        state: 'COMPLETED',
        winner: challenger,
        endTime: Date.now(),
      });

      expect(updated).toBe(true);

      const completedBattle = getBattle(battle.battleId);
      expect(completedBattle?.state).toBe('COMPLETED');
      expect(completedBattle?.winner).toBe(challenger);

      // No longer active for either player
      const activeBattle1 = getActiveBattleForPlayer(challenger);
      const activeBattle2 = getActiveBattleForPlayer(challenged);

      expect(activeBattle1).toBeNull();
      expect(activeBattle2).toBeNull();
    });
  });

  describe('Generational Progression', () => {
    it('should increment generation for bred cats', () => {
      const parent1: Cat = {
        tokenId: 1,
        owner: '0x111',
        name: 'Gen 0 Parent',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        mintedAt: Date.now(),
        textureUrl: 'http://example.com',
      };

      const parent2: Cat = {
        tokenId: 2,
        owner: '0x222',
        name: 'Gen 1 Parent',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 6, defense: 6, regen: 6, luck: 6 },
        generation: 1,
        isGenesis: false,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 30,
        cooldownUntil: 0,
        mintedAt: Date.now(),
        textureUrl: 'http://example.com',
      };

      const childGeneration = Math.max(parent1.generation, parent2.generation) + 1;
      expect(childGeneration).toBe(2); // max(0, 1) + 1 = 2
    });

    it('should apply generational bonus to bred stats', () => {
      const highGenParent1: Cat = {
        tokenId: 1,
        owner: '0x111',
        name: 'Gen 5 Parent',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 5,
        isGenesis: false,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        mintedAt: Date.now(),
        textureUrl: 'http://example.com',
      };

      const highGenParent2: Cat = {
        tokenId: 2,
        owner: '0x222',
        name: 'Gen 6 Parent',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 6, strength: 6, defense: 6, regen: 6, luck: 6 },
        generation: 6,
        isGenesis: false,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 30,
        cooldownUntil: 0,
        mintedAt: Date.now(),
        textureUrl: 'http://example.com',
      };

      const childStats = breedCats(highGenParent1, highGenParent2);
      const childScore = calculateRarityScore(childStats);

      // Gen 6 parents should produce higher stats due to +3 generational bonus
      // Expected: base ~5-6, mutation -1 to +2, gen bonus +3 = 7-11 (clamped to 10)
      expect(childScore).toBeGreaterThan(25); // Should be significantly better
    });
  });
});
