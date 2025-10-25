import { describe, it, expect } from 'vitest';
import { breedCats, calculateRarityScore, generateRandomStats } from '@/lib/breeding';
import { generateKyrgyzName } from '@/lib/nameGenerator';
import { Cat } from '@/lib/storage/types';

describe('Breeding Algorithm', () => {
  describe('breedCats', () => {
    it('should produce child stats within valid range (1-10)', () => {
      const parent1: Cat = {
        tokenId: 1,
        owner: '0x123',
        name: 'Parent 1',
        dna: '',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        mintedAt: Date.now(),
        textureUrl: '',
      };

      const parent2: Cat = {
        ...parent1,
        tokenId: 2,
        name: 'Parent 2',
        stats: { speed: 7, strength: 6, defense: 8, regen: 4, luck: 6 },
        rarityScore: 31,
      };

      const childStats = breedCats(parent1, parent2);

      // All stats should be between 1 and 10
      expect(childStats.speed).toBeGreaterThanOrEqual(1);
      expect(childStats.speed).toBeLessThanOrEqual(10);
      expect(childStats.strength).toBeGreaterThanOrEqual(1);
      expect(childStats.strength).toBeLessThanOrEqual(10);
      expect(childStats.defense).toBeGreaterThanOrEqual(1);
      expect(childStats.defense).toBeLessThanOrEqual(10);
      expect(childStats.regen).toBeGreaterThanOrEqual(1);
      expect(childStats.regen).toBeLessThanOrEqual(10);
      expect(childStats.luck).toBeGreaterThanOrEqual(1);
      expect(childStats.luck).toBeLessThanOrEqual(10);
    });

    it('should produce stats generally higher than parents (upward bias)', () => {
      const parent1: Cat = {
        tokenId: 1,
        owner: '0x123',
        name: 'Parent 1',
        dna: '',
        stats: { speed: 3, strength: 3, defense: 3, regen: 3, luck: 3 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 15,
        cooldownUntil: 0,
        mintedAt: Date.now(),
        textureUrl: '',
      };

      const parent2: Cat = {
        ...parent1,
        tokenId: 2,
        name: 'Parent 2',
        stats: { speed: 4, strength: 4, defense: 4, regen: 4, luck: 4 },
        rarityScore: 20,
      };

      // Run multiple times to test probabilistic upward bias
      let totalImprovement = 0;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const childStats = breedCats(parent1, parent2);
        const childScore = calculateRarityScore(childStats);
        const avgParentScore = (parent1.rarityScore + parent2.rarityScore) / 2;

        if (childScore > avgParentScore) {
          totalImprovement++;
        }
      }

      // At least 60% of children should be better than average parent
      // (accounting for 75% upward bias in mutations)
      expect(totalImprovement / iterations).toBeGreaterThan(0.6);
    });

    it('should apply generational bonus correctly', () => {
      const parent1: Cat = {
        tokenId: 1,
        owner: '0x123',
        name: 'Parent 1',
        dna: '',
        stats: { speed: 5, strength: 5, defense: 5, regen: 5, luck: 5 },
        generation: 4, // Gen 4 parent
        isGenesis: false,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 25,
        cooldownUntil: 0,
        mintedAt: Date.now(),
        textureUrl: '',
      };

      const parent2: Cat = {
        ...parent1,
        tokenId: 2,
        name: 'Parent 2',
        generation: 4, // Gen 4 parent
      };

      const childStats = breedCats(parent1, parent2);

      // Gen 4 parents should produce higher stats due to +2 generational bonus
      // Expected: base ~5, mutation -1 to +2, gen bonus +2 = 6-9 range
      const childScore = calculateRarityScore(childStats);

      // Child should generally be better due to generational bonus
      expect(childScore).toBeGreaterThan(20); // At least some improvement expected
    });

    it('should clamp extreme values to 1-10', () => {
      const lowParent: Cat = {
        tokenId: 1,
        owner: '0x123',
        name: 'Low Parent',
        dna: '',
        stats: { speed: 1, strength: 1, defense: 1, regen: 1, luck: 1 },
        generation: 0,
        isGenesis: true,
        parent1Id: null,
        parent2Id: null,
        rarityScore: 5,
        cooldownUntil: 0,
        mintedAt: Date.now(),
        textureUrl: '',
      };

      const childStats = breedCats(lowParent, lowParent);

      // Even with mutation -1, should clamp to 1 minimum
      expect(childStats.speed).toBeGreaterThanOrEqual(1);
      expect(childStats.strength).toBeGreaterThanOrEqual(1);
      expect(childStats.defense).toBeGreaterThanOrEqual(1);
      expect(childStats.regen).toBeGreaterThanOrEqual(1);
      expect(childStats.luck).toBeGreaterThanOrEqual(1);

      const highParent: Cat = {
        ...lowParent,
        tokenId: 2,
        name: 'High Parent',
        stats: { speed: 10, strength: 10, defense: 10, regen: 10, luck: 10 },
        generation: 8, // High gen for bonus
        rarityScore: 50,
      };

      const highChildStats = breedCats(highParent, highParent);

      // Even with high stats + mutation + gen bonus, should clamp to 10 maximum
      expect(highChildStats.speed).toBeLessThanOrEqual(10);
      expect(highChildStats.strength).toBeLessThanOrEqual(10);
      expect(highChildStats.defense).toBeLessThanOrEqual(10);
      expect(highChildStats.regen).toBeLessThanOrEqual(10);
      expect(highChildStats.luck).toBeLessThanOrEqual(10);
    });
  });

  describe('calculateRarityScore', () => {
    it('should sum all stat values correctly', () => {
      const stats = { speed: 3, strength: 4, defense: 5, regen: 2, luck: 6 };
      const score = calculateRarityScore(stats);
      expect(score).toBe(20);
    });

    it('should return minimum score of 5 for all 1s', () => {
      const stats = { speed: 1, strength: 1, defense: 1, regen: 1, luck: 1 };
      const score = calculateRarityScore(stats);
      expect(score).toBe(5);
    });

    it('should return maximum score of 50 for all 10s', () => {
      const stats = { speed: 10, strength: 10, defense: 10, regen: 10, luck: 10 };
      const score = calculateRarityScore(stats);
      expect(score).toBe(50);
    });
  });

  describe('generateRandomStats', () => {
    it('should generate stats in 1-5 range for genesis cats', () => {
      const stats = generateRandomStats(1, 5);

      expect(stats.speed).toBeGreaterThanOrEqual(1);
      expect(stats.speed).toBeLessThanOrEqual(5);
      expect(stats.strength).toBeGreaterThanOrEqual(1);
      expect(stats.strength).toBeLessThanOrEqual(5);
      expect(stats.defense).toBeGreaterThanOrEqual(1);
      expect(stats.defense).toBeLessThanOrEqual(5);
      expect(stats.regen).toBeGreaterThanOrEqual(1);
      expect(stats.regen).toBeLessThanOrEqual(5);
      expect(stats.luck).toBeGreaterThanOrEqual(1);
      expect(stats.luck).toBeLessThanOrEqual(5);
    });

    it('should produce varied stats across multiple generations', () => {
      const statSets = new Set<string>();

      for (let i = 0; i < 20; i++) {
        const stats = generateRandomStats(1, 5);
        statSets.add(JSON.stringify(stats));
      }

      // Should have some variety (not all identical)
      expect(statSets.size).toBeGreaterThan(5);
    });
  });

  describe('generateKyrgyzName', () => {
    it('should generate common tier names for low rarity scores', () => {
      const name = generateKyrgyzName(15, 1); // Score 15 = common
      expect(name).toContain('#1');
      // Common tier names: Boz, Kara, Ak, Sary, Kyzyl
      const commonNames = ['Boz', 'Kara', 'Ak', 'Sary', 'Kyzyl'];
      const hasCommonName = commonNames.some(n => name.includes(n));
      expect(hasCommonName).toBe(true);
    });

    it('should generate uncommon tier names for medium rarity scores', () => {
      const name = generateKyrgyzName(25, 2); // Score 25 = uncommon
      // Uncommon tier names: Tengri, Issyk, Naryn, Asman, Bermet
      const uncommonNames = ['Tengri', 'Issyk', 'Naryn', 'Asman', 'Bermet'];
      const hasUncommonName = uncommonNames.some(n => name.includes(n));
      expect(hasUncommonName).toBe(true);
    });

    it('should generate rare tier names for high rarity scores', () => {
      const name = generateKyrgyzName(35, 3); // Score 35 = rare
      // Rare tier names: Cholpon, Altynai, Dinara, Sanjar, Kubat
      const rareNames = ['Cholpon', 'Altynai', 'Dinara', 'Sanjar', 'Kubat'];
      const hasRareName = rareNames.some(n => name.includes(n));
      expect(hasRareName).toBe(true);
    });

    it('should generate legendary tier names for max rarity scores', () => {
      const name = generateKyrgyzName(48, 4); // Score 48 = legendary
      // Legendary tier names: Ala-Too, Manas, Kurmanjan, Toktogul
      const legendaryNames = ['Ala-Too', 'Manas', 'Kurmanjan', 'Toktogul'];
      const hasLegendaryName = legendaryNames.some(n => name.includes(n));
      expect(hasLegendaryName).toBe(true);
    });

    it('should include token ID in name', () => {
      const name = generateKyrgyzName(20, 42);
      expect(name).toContain('#42');
    });

    it('should include a suffix in name', () => {
      const name = generateKyrgyzName(20, 5);
      const suffixes = [
        'Paws', 'Shadow', 'Runner', 'Flame', 'Hunter',
        'Stripes', 'Eyes', 'Jumper', 'Tail', 'Whiskers',
        'Storm', 'Thunder', 'Lightning', 'Frost', 'Blaze'
      ];
      const hasSuffix = suffixes.some(s => name.includes(s));
      expect(hasSuffix).toBe(true);
    });
  });
});
