// Mock breeding algorithm for testing phase
// Simple random with upward bias (75% chance of improvement)

import { Cat, CatStats } from './storage/types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function breedStat(parent1Stat: number, parent2Stat: number, generationBonus: number): number {
  // 1. Average of both parents
  const baseValue = Math.floor((parent1Stat + parent2Stat) / 2);

  // 2. Random mutation with upward bias
  const roll = Math.random() * 100;
  let mutation = 0;

  if (roll < 5) mutation = -1;      // 5% chance: -1
  else if (roll < 25) mutation = 0;  // 20% chance: +0
  else if (roll < 65) mutation = 1;  // 40% chance: +1
  else mutation = 2;                 // 35% chance: +2

  // 3. Generational bonus (every 2 generations adds +1)
  const bonus = Math.floor(generationBonus / 2);

  // 4. Calculate final stat
  const result = baseValue + mutation + bonus;

  // 5. Clamp to 1-10
  return clamp(result, 1, 10);
}

export function breedCats(parent1: Cat, parent2: Cat): CatStats {
  const maxGen = Math.max(parent1.generation, parent2.generation);
  const generationBonus = maxGen;

  return {
    speed: breedStat(parent1.stats.speed, parent2.stats.speed, generationBonus),
    strength: breedStat(parent1.stats.strength, parent2.stats.strength, generationBonus),
    defense: breedStat(parent1.stats.defense, parent2.stats.defense, generationBonus),
    regen: breedStat(parent1.stats.regen, parent2.stats.regen, generationBonus),
    luck: breedStat(parent1.stats.luck, parent2.stats.luck, generationBonus),
  };
}

export function calculateRarityScore(stats: CatStats): number {
  return stats.speed + stats.strength + stats.defense + stats.regen + stats.luck;
}

export function generateRandomStats(min: number = 1, max: number = 5): CatStats {
  const random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    speed: random(min, max),
    strength: random(min, max),
    defense: random(min, max),
    regen: random(min, max),
    luck: random(min, max),
  };
}
