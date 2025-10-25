// SQLite-based storage for persistence
// Data persists across server restarts

import { Cat, PlayerInventory, Battle } from './types';
import { db, catQueries, battleQueries, inventoryQueries } from '../db';

let nextBattleId = 1;

// ===== CATS =====

export function addCat(cat: Omit<Cat, 'tokenId' | 'mintedAt'>): Cat {
  const tokenId = getNextTokenId();
  const newCat: Cat = {
    ...cat,
    tokenId,
    mintedAt: Date.now(),
  };

  catQueries.insert.run(
    tokenId,
    cat.owner.toLowerCase(),
    cat.name,
    cat.dna,
    cat.generation,
    cat.isGenesis ? 1 : 0,
    cat.parent1Id || null,
    cat.parent2Id || null,
    cat.rarityScore,
    cat.cooldownUntil,
    cat.textureUrl || null,
    cat.stats.speed,
    cat.stats.strength,
    cat.stats.defense,
    cat.stats.regen,
    cat.stats.luck
  );

  // Add to owner's inventory (create inventory if doesn't exist)
  const inventory = getOrCreateInventory(cat.owner);

  return newCat;
}

export function getCat(tokenId: number): Cat | undefined {
  const row = catQueries.findById.get(tokenId) as any;
  if (!row) return undefined;

  return {
    tokenId: row.tokenId,
    owner: row.owner,
    name: row.name,
    dna: row.dna,
    stats: {
      speed: row.speed,
      strength: row.strength,
      defense: row.defense,
      regen: row.regen,
      luck: row.luck,
    },
    generation: row.generation,
    isGenesis: Boolean(row.isGenesis),
    parent1Id: row.parent1Id,
    parent2Id: row.parent2Id,
    rarityScore: row.rarityScore,
    cooldownUntil: row.cooldownUntil,
    textureUrl: row.textureUrl,
    mintedAt: 0, // Not stored in DB for simplicity
  };
}

export function deleteCat(tokenId: number): boolean {
  const cat = getCat(tokenId);
  if (!cat) return false;

  // Remove from inventory
  const inventory = getInventory(cat.owner);
  if (inventory.activeCatId === tokenId) {
    setActiveCat(cat.owner, 0); // Clear active cat
  }

  catQueries.delete.run(tokenId);
  return true;
}

export function getCatsByOwner(wallet: string): Cat[] {
  const rows = catQueries.findByOwner.all(wallet.toLowerCase()) as any[];

  return rows.map(row => ({
    tokenId: row.tokenId,
    owner: row.owner,
    name: row.name,
    dna: row.dna,
    stats: {
      speed: row.speed,
      strength: row.strength,
      defense: row.defense,
      regen: row.regen,
      luck: row.luck,
    },
    generation: row.generation,
    isGenesis: Boolean(row.isGenesis),
    parent1Id: row.parent1Id,
    parent2Id: row.parent2Id,
    rarityScore: row.rarityScore,
    cooldownUntil: row.cooldownUntil,
    textureUrl: row.textureUrl,
    mintedAt: 0,
  }));
}

export function updateCatCooldown(tokenId: number, cooldownUntil: number): boolean {
  const cat = getCat(tokenId);
  if (!cat) return false;

  catQueries.update.run(cat.owner, cooldownUntil, tokenId);
  return true;
}

export function canCatBattle(tokenId: number): boolean {
  const cat = getCat(tokenId);
  if (!cat) return false;

  return Date.now() >= cat.cooldownUntil;
}

// ===== INVENTORY =====

function getOrCreateInventory(wallet: string): PlayerInventory {
  const key = wallet.toLowerCase();
  const row = inventoryQueries.findByWallet.get(key) as any;

  if (!row) {
    // Create new inventory
    inventoryQueries.upsert.run(key, null);
    return {
      wallet: key,
      catIds: [],
      activeCatId: null,
    };
  }

  // Get all cats owned by this wallet
  const cats = getCatsByOwner(key);

  return {
    wallet: key,
    catIds: cats.map(c => c.tokenId),
    activeCatId: row.activeCatId,
  };
}

export function getInventory(wallet: string): PlayerInventory {
  return getOrCreateInventory(wallet);
}

export function setActiveCat(wallet: string, tokenId: number): boolean {
  const inventory = getOrCreateInventory(wallet);

  // Verify ownership (if tokenId is not 0)
  if (tokenId !== 0 && !inventory.catIds.includes(tokenId)) {
    return false;
  }

  inventoryQueries.updateActiveCat.run(tokenId === 0 ? null : tokenId, wallet.toLowerCase());
  return true;
}

export function getActiveCat(wallet: string): Cat | null {
  const inventory = getInventory(wallet);
  if (!inventory.activeCatId) return null;

  return getCat(inventory.activeCatId) || null;
}

// ===== BATTLES =====

export function createBattle(battle: Omit<Battle, 'battleId' | 'startTime' | 'endTime' | 'winner' | 'loser' | 'reason' | 'childTokenId' | 'deletedCatId'>): Battle {
  const battleId = `battle_${nextBattleId++}_${Date.now()}`;
  const startTime = Date.now();

  battleQueries.insert.run(
    battleId,
    battle.challenger.toLowerCase(),
    battle.challenged.toLowerCase(),
    battle.challengerCatId,
    battle.challengedCatId,
    battle.state,
    startTime
  );

  return {
    ...battle,
    battleId,
    startTime,
    endTime: null,
    winner: null,
    loser: null,
    reason: null,
    childTokenId: null,
    deletedCatId: null,
  };
}

export function getBattle(battleId: string): Battle | undefined {
  const row = battleQueries.findById.get(battleId) as any;
  if (!row) return undefined;

  return {
    battleId: row.battleId,
    challenger: row.challenger,
    challenged: row.challenged,
    challengerCatId: row.challengerCatId,
    challengedCatId: row.challengedCatId,
    state: row.state,
    startTime: row.startTime,
    endTime: row.endTime,
    winner: row.winner,
    loser: row.loser,
    reason: row.reason,
    childTokenId: row.childTokenId,
    deletedCatId: row.deletedCatId,
  };
}

export function updateBattle(battleId: string, updates: Partial<Battle>): boolean {
  const battle = getBattle(battleId);
  if (!battle) return false;

  const updated = { ...battle, ...updates };

  battleQueries.update.run(
    updated.state,
    updated.endTime,
    updated.winner,
    updated.loser,
    updated.reason,
    updated.childTokenId,
    updated.deletedCatId,
    battleId
  );

  return true;
}

export function getPendingChallengeForPlayer(wallet: string): Battle | null {
  const row = battleQueries.findPendingByWallet.get(
    wallet.toLowerCase(),
    wallet.toLowerCase()
  ) as any;

  if (!row) return null;

  // Only return if this wallet is the challenged player
  if (row.challenged.toLowerCase() === wallet.toLowerCase()) {
    return getBattle(row.battleId) || null;
  }

  return null;
}

export function getActiveBattleForPlayer(wallet: string): Battle | null {
  const key = wallet.toLowerCase();
  const stmt = db.prepare(`
    SELECT * FROM battles
    WHERE (challenger = ? OR challenged = ?)
      AND state = 'IN_PROGRESS'
    ORDER BY startTime DESC
    LIMIT 1
  `);

  const row = stmt.get(key, key) as any;
  if (!row) return null;

  return getBattle(row.battleId) || null;
}

// ===== UTILITY =====

export function getNextTokenId(): number {
  const result = catQueries.maxTokenId.get() as any;
  const maxId = result.maxId || 0;
  return maxId + 1;
}

export function getAllCats(): Cat[] {
  const stmt = db.prepare('SELECT * FROM cats ORDER BY tokenId');
  const rows = stmt.all() as any[];

  return rows.map(row => ({
    tokenId: row.tokenId,
    owner: row.owner,
    name: row.name,
    dna: row.dna,
    stats: {
      speed: row.speed,
      strength: row.strength,
      defense: row.defense,
      regen: row.regen,
      luck: row.luck,
    },
    generation: row.generation,
    isGenesis: Boolean(row.isGenesis),
    parent1Id: row.parent1Id,
    parent2Id: row.parent2Id,
    rarityScore: row.rarityScore,
    cooldownUntil: row.cooldownUntil,
    textureUrl: row.textureUrl,
    mintedAt: 0,
  }));
}

export function getAllBattles(): Battle[] {
  const stmt = db.prepare('SELECT * FROM battles ORDER BY startTime DESC');
  const rows = stmt.all() as any[];

  return rows.map(row => ({
    battleId: row.battleId,
    challenger: row.challenger,
    challenged: row.challenged,
    challengerCatId: row.challengerCatId,
    challengedCatId: row.challengedCatId,
    state: row.state,
    startTime: row.startTime,
    endTime: row.endTime,
    winner: row.winner,
    loser: row.loser,
    reason: row.reason,
    childTokenId: row.childTokenId,
    deletedCatId: row.deletedCatId,
  }));
}

// Debug helpers
export function debugReset(): void {
  db.exec('DELETE FROM cats');
  db.exec('DELETE FROM battles');
  db.exec('DELETE FROM player_inventory');
  nextBattleId = 1;
  console.log('✅ Database cleared');
}

export function debugPrintState(): void {
  const catCount = (catQueries.count.get() as any).count;
  const battleCount = (db.prepare('SELECT COUNT(*) as count FROM battles').get() as any).count;
  const inventoryCount = (db.prepare('SELECT COUNT(*) as count FROM player_inventory').get() as any).count;

  console.log('=== STORAGE STATE (SQLite) ===');
  console.log(`Cats: ${catCount}`);
  console.log(`Inventories: ${inventoryCount}`);
  console.log(`Battles: ${battleCount}`);
  console.log(`Next Token ID: ${getNextTokenId()}`);
  console.log(`Next Battle ID: ${nextBattleId}`);
}
