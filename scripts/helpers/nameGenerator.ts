import seedrandom from "seedrandom";

/**
 * Kyrgyz name pools by rarity tier
 */
const NAME_POOLS = {
  common: ["Boz", "Kara", "Ak", "Sary", "Kyzyl"],
  uncommon: ["Tengri", "Issyk", "Naryn", "Asman", "Bermet"],
  rare: ["Cholpon", "Altynai", "Dinara", "Kubat", "Sanjar"],
  legendary: ["Ala-Too", "Manas", "Kurmanjan", "Toktogul"],
};

const SUFFIXES = [
  "Paws",
  "Whiskers",
  "Shadow",
  "Runner",
  "Flame",
  "Stripes",
  "Tail",
  "Eyes",
  "Jumper",
  "Hunter",
  "Moonwalker",
  "Thunderborn",
  "Stormcaller",
  "Nightstalker",
  "Swiftfoot",
];

type RarityTier = "common" | "uncommon" | "rare" | "legendary";

/**
 * Determine rarity tier from score
 */
export function getRarityTier(rarityScore: number): RarityTier {
  if (rarityScore >= 40) return "legendary";
  if (rarityScore >= 30) return "rare";
  if (rarityScore >= 20) return "uncommon";
  return "common";
}

/**
 * Generate deterministic Kyrgyz name from seed and rarity
 * Same seed + rarity = Same name (always)
 */
export function generateKyrgyzName(
  seed: string,
  rarityScore: number,
  tokenId: number
): string {
  const tier = getRarityTier(rarityScore);

  // Create deterministic random number generator from seed
  const rng = seedrandom(seed);

  // Select name from appropriate pool
  const namePool = NAME_POOLS[tier];
  const firstName = namePool[Math.floor(rng() * namePool.length)];

  // Select suffix
  const suffix = SUFFIXES[Math.floor(rng() * SUFFIXES.length)];

  return `${firstName} ${suffix} #${tokenId}`;
}

/**
 * Get perks based on stats (8+ in a stat grants perk)
 */
export function calculatePerks(stats: {
  speed: number;
  luck: number;
  strength: number;
  regen: number;
  defense: number;
}): string[] {
  const perks: string[] = [];

  if (stats.speed >= 8) perks.push("Swift Companion");
  if (stats.luck >= 8) perks.push("Fortune Aura");
  if (stats.strength >= 8) perks.push("Battle Cat");
  if (stats.regen >= 8) perks.push("Healing Presence");
  if (stats.defense >= 8) perks.push("Guardian");

  return perks;
}

/**
 * Example usage
 */
export function example() {
  const seed = "0xa3f2d91234567890abcdef";
  const stats = {
    speed: 8,
    luck: 5,
    strength: 7,
    regen: 3,
    defense: 9,
  };
  const rarityScore = 32;
  const tokenId = 5;

  const name = generateKyrgyzName(seed, rarityScore, tokenId);
  const tier = getRarityTier(rarityScore);
  const perks = calculatePerks(stats);

  console.log("Name:", name);
  console.log("Tier:", tier);
  console.log("Perks:", perks.join(", "));

  // Output:
  // Name: Altynai Runner #5
  // Tier: rare
  // Perks: Swift Companion, Guardian
}

// Run example if executed directly
if (require.main === module) {
  example();
}
