// In-memory storage types for mock phase

export interface CatStats {
  speed: number;       // 1-10
  strength: number;    // 1-10
  defense: number;     // 1-10
  regen: number;       // 1-10
  luck: number;        // 1-10
}

export interface Cat {
  tokenId: number;
  owner: string;
  name: string;
  dna: string;
  stats: CatStats;
  generation: number;
  isGenesis: boolean;
  parent1Id: number | null;
  parent2Id: number | null;
  rarityScore: number;
  cooldownUntil: number; // timestamp (0 = can battle)
  mintedAt: number;
  textureUrl: string;
}

export interface PlayerInventory {
  wallet: string;
  catIds: number[];
  activeCatId: number | null;
}

export interface Battle {
  battleId: string;
  challenger: string;
  challenged: string;
  challengerCatId: number;
  challengedCatId: number;
  state: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: number;
  endTime: number | null;
  winner: string | null;
  loser: string | null;
  reason: 'death' | 'quit' | 'timeout' | null;
  childTokenId: number | null;
  deletedCatId: number | null;
}
