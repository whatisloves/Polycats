import { describe, it, expect, beforeEach } from 'vitest';
import {
  addCat,
  getCat,
  deleteCat,
  getCatsByOwner,
  getInventory,
  setActiveCat,
  getActiveCat,
  debugReset,
} from '@/lib/storage';
import { Cat } from '@/lib/storage/types';

describe('Inventory Management', () => {
  beforeEach(() => {
    debugReset();
  });

  describe('5-Cat Inventory Limit', () => {
    it('should allow adding up to 5 cats', () => {
      const owner = '0x123';

      for (let i = 0; i < 5; i++) {
        addCat({
          owner,
          name: `Cat ${i + 1}`,
          dna: '1,2,3,4,5,6,7',
          stats: { speed: i + 1, strength: i + 1, defense: i + 1, regen: i + 1, luck: i + 1 },
          generation: 0,
          isGenesis: true,
          parent1Id: null,
          parent2Id: null,
          rarityScore: (i + 1) * 5,
          cooldownUntil: 0,
          textureUrl: 'http://example.com',
        });
      }

      const inventory = getInventory(owner);
      expect(inventory.catIds).toHaveLength(5);

      const cats = getCatsByOwner(owner);
      expect(cats).toHaveLength(5);
    });

    it('should identify weakest cat by rarity score', () => {
      const owner = '0x123';
      const cats: Cat[] = [];

      // Add 5 cats with different rarity scores
      const scores = [15, 28, 42, 19, 35]; // Weakest is 15 (tokenId 1)

      for (let i = 0; i < 5; i++) {
        const cat = addCat({
          owner,
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
        cats.push(cat);
      }

      // Manually find weakest
      const allCats = getCatsByOwner(owner);
      const weakest = allCats.reduce((weakest, cat) =>
        cat.rarityScore < weakest.rarityScore ? cat : weakest
      );

      expect(weakest.tokenId).toBe(1); // First cat with score 15
      expect(weakest.rarityScore).toBe(15);
    });

    it('should handle auto-delete weakest when adding 6th cat', () => {
      const owner = '0x123';

      // Add 5 cats with known rarity scores
      const scores = [15, 20, 25, 30, 35]; // Weakest is 15 (tokenId 1)

      for (let i = 0; i < 5; i++) {
        addCat({
          owner,
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
      }

      // Simulate auto-delete logic (would be in API endpoint)
      const allCats = getCatsByOwner(owner);
      if (allCats.length >= 5) {
        const weakest = allCats.reduce((weakest, cat) =>
          cat.rarityScore < weakest.rarityScore ? cat : weakest
        );
        deleteCat(weakest.tokenId);
      }

      // Add new stronger cat
      const newCat = addCat({
        owner,
        name: 'Strong Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 8, strength: 8, defense: 8, regen: 8, luck: 8 },
        generation: 1,
        isGenesis: false,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 40,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      // Verify inventory still has 5 cats
      const inventory = getInventory(owner);
      expect(inventory.catIds).toHaveLength(5);

      // Verify weakest cat (tokenId 1) was deleted
      const deletedCat = getCat(1);
      expect(deletedCat).toBeUndefined();

      // Verify new strong cat is present
      const strongCat = getCat(newCat.tokenId);
      expect(strongCat).toBeDefined();
      expect(strongCat?.rarityScore).toBe(40);

      // Verify remaining cats are the 4 stronger ones + new one
      const remainingCats = getCatsByOwner(owner);
      const scores_remaining = remainingCats.map(c => c.rarityScore).sort((a, b) => a - b);
      expect(scores_remaining).toEqual([20, 25, 30, 35, 40]);
    });

    it('should not delete active cat even if weakest', () => {
      const owner = '0x123';

      // Add cat with lowest score
      const weakCat = addCat({
        owner,
        name: 'Weak Active Cat',
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

      // Set as active
      setActiveCat(owner, weakCat.tokenId);

      // Add 4 stronger cats
      for (let i = 0; i < 4; i++) {
        addCat({
          owner,
          name: `Strong Cat ${i + 1}`,
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

      // Simulate auto-delete logic with active cat protection
      const activeCat = getActiveCat(owner);
      const allCats = getCatsByOwner(owner);

      if (allCats.length >= 5) {
        const eligibleForDeletion = allCats.filter(
          cat => cat.tokenId !== activeCat?.tokenId
        );
        const weakest = eligibleForDeletion.reduce((weakest, cat) =>
          cat.rarityScore < weakest.rarityScore ? cat : weakest
        );
        deleteCat(weakest.tokenId);
      }

      // Add 6th cat
      addCat({
        owner,
        name: 'New Cat',
        dna: '1,2,3,4,5,6,7',
        stats: { speed: 8, strength: 8, defense: 8, regen: 8, luck: 8 },
        generation: 1,
        isGenesis: false,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 40,
        cooldownUntil: 0,
        textureUrl: 'http://example.com',
      });

      // Verify active cat still exists
      const activeStillExists = getCat(weakCat.tokenId);
      expect(activeStillExists).toBeDefined();
      expect(activeStillExists?.rarityScore).toBe(5);

      // Verify one of the stronger cats was deleted instead
      const remainingCats = getCatsByOwner(owner);
      expect(remainingCats).toHaveLength(5);

      const activeStillActive = getActiveCat(owner);
      expect(activeStillActive?.tokenId).toBe(weakCat.tokenId);
    });
  });

  describe('Active Cat Management', () => {
    it('should prevent deleting active cat', () => {
      const owner = '0x123';

      const cat = addCat({
        owner,
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

      setActiveCat(owner, cat.tokenId);

      // Simulate deletion validation (would be in API endpoint)
      const activeCat = getActiveCat(owner);
      const canDelete = cat.tokenId !== activeCat?.tokenId;

      expect(canDelete).toBe(false);
      expect(activeCat?.tokenId).toBe(cat.tokenId);
    });

    it('should allow deleting non-active cat', () => {
      const owner = '0x123';

      const cat1 = addCat({
        owner,
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

      const cat2 = addCat({
        owner,
        name: 'Inactive Cat',
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

      setActiveCat(owner, cat1.tokenId);

      // Simulate deletion validation
      const activeCat = getActiveCat(owner);
      const canDelete = cat2.tokenId !== activeCat?.tokenId;

      expect(canDelete).toBe(true);

      // Perform deletion
      const deleted = deleteCat(cat2.tokenId);
      expect(deleted).toBe(true);

      const retrievedCat2 = getCat(cat2.tokenId);
      expect(retrievedCat2).toBeUndefined();

      // Active cat unchanged
      const stillActive = getActiveCat(owner);
      expect(stillActive?.tokenId).toBe(cat1.tokenId);
    });

    it('should clear active cat when owner has no cats', () => {
      const owner = '0x123';

      const cat = addCat({
        owner,
        name: 'Only Cat',
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

      setActiveCat(owner, cat.tokenId);

      // Delete the only cat (force delete for testing)
      deleteCat(cat.tokenId);

      // Active cat should return null since cat doesn't exist
      const activeCat = getActiveCat(owner);
      expect(activeCat).toBeNull();
    });
  });

  describe('Inventory Edge Cases', () => {
    it('should handle multiple players with separate inventories', () => {
      const owner1 = '0x111';
      const owner2 = '0x222';

      const cat1 = addCat({
        owner: owner1,
        name: 'Player 1 Cat',
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
        owner: owner2,
        name: 'Player 2 Cat',
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

      const inventory1 = getInventory(owner1);
      const inventory2 = getInventory(owner2);

      expect(inventory1.catIds).toHaveLength(1);
      expect(inventory2.catIds).toHaveLength(1);
      expect(inventory1.catIds[0]).toBe(cat1.tokenId);
      expect(inventory2.catIds[0]).toBe(cat2.tokenId);
    });

    it('should return empty inventory for new player', () => {
      const inventory = getInventory('0xNEW');

      expect(inventory.wallet).toBe('0xnew'); // normalized to lowercase
      expect(inventory.catIds).toHaveLength(0);
      expect(inventory.activeCatId).toBeNull();
    });

    it('should handle getting cats by owner when owner has no cats', () => {
      const cats = getCatsByOwner('0xNONE');
      expect(cats).toHaveLength(0);
    });
  });
});
