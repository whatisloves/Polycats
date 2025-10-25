import { describe, it, expect, beforeEach } from 'vitest';
import {
  addCat,
  getCat,
  deleteCat,
  getCatsByOwner,
  updateCatCooldown,
  canCatBattle,
  getInventory,
  setActiveCat,
  getActiveCat,
  createBattle,
  getBattle,
  updateBattle,
  getPendingChallengeForPlayer,
  getActiveBattleForPlayer,
  debugReset,
} from '@/lib/storage';

describe('Storage Operations', () => {
  beforeEach(() => {
    // Reset storage before each test
    debugReset();
  });

  describe('Cat Management', () => {
    it('should add and retrieve a cat', () => {
      const cat = addCat({
        owner: '0x123',
        name: 'Test Cat',
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

      expect(cat.tokenId).toBe(1);
      expect(cat.name).toBe('Test Cat');

      const retrieved = getCat(1);
      expect(retrieved).toEqual(cat);
    });

    it('should delete a cat', () => {
      const cat = addCat({
        owner: '0x123',
        name: 'Test Cat',
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

      const deleted = deleteCat(cat.tokenId);
      expect(deleted).toBe(true);

      const retrieved = getCat(cat.tokenId);
      expect(retrieved).toBeUndefined();
    });

    it('should get cats by owner', () => {
      addCat({
        owner: '0x123',
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

      addCat({
        owner: '0x123',
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

      addCat({
        owner: '0x456',
        name: 'Other Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 4, strength: 4, defense: 4, regen: 4, luck: 4 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 20,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      const owner123Cats = getCatsByOwner('0x123');
      expect(owner123Cats).toHaveLength(2);
      expect(owner123Cats[0].name).toBe('Cat 1');
      expect(owner123Cats[1].name).toBe('Cat 2');

      const owner456Cats = getCatsByOwner('0x456');
      expect(owner456Cats).toHaveLength(1);
      expect(owner456Cats[0].name).toBe('Other Cat');
    });

    it('should update cat cooldown', () => {
      const cat = addCat({
        owner: '0x123',
        name: 'Test Cat',
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

      const futureTime = Date.now() + 86400000; // 24 hours from now
      const updated = updateCatCooldown(cat.tokenId, futureTime);
      expect(updated).toBe(true);

      const retrieved = getCat(cat.tokenId);
      expect(retrieved?.cooldownUntil).toBe(futureTime);
    });

    it('should check if cat can battle based on cooldown', () => {
      const cat = addCat({
        owner: '0x123',
        name: 'Test Cat',
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

      // No cooldown - can battle
      expect(canCatBattle(cat.tokenId)).toBe(true);

      // Set cooldown in future - cannot battle
      updateCatCooldown(cat.tokenId, Date.now() + 10000);
      expect(canCatBattle(cat.tokenId)).toBe(false);

      // Set cooldown in past - can battle
      updateCatCooldown(cat.tokenId, Date.now() - 1000);
      expect(canCatBattle(cat.tokenId)).toBe(true);
    });
  });

  describe('Inventory Management', () => {
    it('should create inventory when adding first cat', () => {
      const cat = addCat({
        owner: '0x123',
        name: 'First Cat',
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

      const inventory = getInventory('0x123');
      expect(inventory.catIds).toContain(cat.tokenId);
      expect(inventory.wallet).toBe('0x123');
    });

    it('should set and get active cat', () => {
      const cat = addCat({
        owner: '0x123',
        name: 'Active Cat',
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

      const result = setActiveCat('0x123', cat.tokenId);
      expect(result).toBe(true);

      const activeCat = getActiveCat('0x123');
      expect(activeCat?.tokenId).toBe(cat.tokenId);
      expect(activeCat?.name).toBe('Active Cat');
    });

    it('should not set active cat if not owned', () => {
      const cat = addCat({
        owner: '0x123',
        name: 'Test Cat',
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

      const result = setActiveCat('0x456', cat.tokenId); // Different owner
      expect(result).toBe(false);
    });

    it('should handle case-insensitive wallet addresses', () => {
      const cat = addCat({
        owner: '0xABC123',
        name: 'Test Cat',
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

      const catsLower = getCatsByOwner('0xabc123');
      const catsUpper = getCatsByOwner('0xABC123');

      expect(catsLower).toHaveLength(1);
      expect(catsUpper).toHaveLength(1);
    });
  });

  describe('Battle Management', () => {
    it('should create and retrieve a battle', () => {
      const battle = createBattle({
        challenger: '0x123',
        challenged: '0x456',
        challengerCatId: 1,
        challengedCatId: 2,
        state: 'PENDING',
      });

      expect(battle.battleId).toBeDefined();
      expect(battle.challenger).toBe('0x123');
      expect(battle.challenged).toBe('0x456');
      expect(battle.state).toBe('PENDING');

      const retrieved = getBattle(battle.battleId);
      expect(retrieved).toEqual(battle);
    });

    it('should update battle state', () => {
      const battle = createBattle({
        challenger: '0x123',
        challenged: '0x456',
        challengerCatId: 1,
        challengedCatId: 2,
        state: 'PENDING',
      });

      const updated = updateBattle(battle.battleId, {
        state: 'IN_PROGRESS',
        startTime: Date.now(),
      });

      expect(updated).toBe(true);

      const retrieved = getBattle(battle.battleId);
      expect(retrieved?.state).toBe('IN_PROGRESS');
    });

    it('should get pending challenge for player', () => {
      createBattle({
        challenger: '0x123',
        challenged: '0x456',
        challengerCatId: 1,
        challengedCatId: 2,
        state: 'PENDING',
      });

      const pending = getPendingChallengeForPlayer('0x456');
      expect(pending).toBeDefined();
      expect(pending?.challenged).toBe('0x456');
      expect(pending?.state).toBe('PENDING');

      // No pending challenge for challenger
      const noPending = getPendingChallengeForPlayer('0x123');
      expect(noPending).toBeNull();
    });

    it('should get active battle for player', () => {
      const battle = createBattle({
        challenger: '0x123',
        challenged: '0x456',
        challengerCatId: 1,
        challengedCatId: 2,
        state: 'IN_PROGRESS',
      });

      const activeBattle1 = getActiveBattleForPlayer('0x123');
      expect(activeBattle1).toBeDefined();
      expect(activeBattle1?.battleId).toBe(battle.battleId);

      const activeBattle2 = getActiveBattleForPlayer('0x456');
      expect(activeBattle2).toBeDefined();
      expect(activeBattle2?.battleId).toBe(battle.battleId);
    });

    it('should not return completed battles as active', () => {
      createBattle({
        challenger: '0x123',
        challenged: '0x456',
        challengerCatId: 1,
        challengedCatId: 2,
        state: 'COMPLETED',
      });

      const activeBattle = getActiveBattleForPlayer('0x123');
      expect(activeBattle).toBeNull();
    });

    it('should handle case-insensitive wallet addresses for battles', () => {
      createBattle({
        challenger: '0xABC123',
        challenged: '0xDEF456',
        challengerCatId: 1,
        challengedCatId: 2,
        state: 'PENDING',
      });

      const pending1 = getPendingChallengeForPlayer('0xdef456');
      const pending2 = getPendingChallengeForPlayer('0xDEF456');

      expect(pending1).toBeDefined();
      expect(pending2).toBeDefined();
    });
  });
});
