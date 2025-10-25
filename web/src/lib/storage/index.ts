// In-memory storage for mock phase
// WARNING: Data resets on server restart

import { Cat, PlayerInventory, Battle } from './types';

// Storage maps
const cats = new Map<number, Cat>();
const inventories = new Map<string, PlayerInventory>();
const battles = new Map<string, Battle>();

let nextTokenId = 1;
let nextBattleId = 1;

// ===== CATS =====

export function addCat(cat: Omit<Cat, 'tokenId' | 'mintedAt'>): Cat {
  const tokenId = nextTokenId++;
  const newCat: Cat = {
    ...cat,
    tokenId,
    mintedAt: Date.now(),
  };
  cats.set(tokenId, newCat);

  // Add to owner's inventory
  const inventory = getOrCreateInventory(cat.owner);
  if (!inventory.catIds.includes(tokenId)) {
    inventory.catIds.push(tokenId);
  }

  return newCat;
}

export function getCat(tokenId: number): Cat | undefined {
  return cats.get(tokenId);
}

export function deleteCat(tokenId: number): boolean {
  const cat = cats.get(tokenId);
  if (!cat) return false;

  // Remove from inventory
  const inventory = inventories.get(cat.owner.toLowerCase());
  if (inventory) {
    inventory.catIds = inventory.catIds.filter(id => id !== tokenId);
    if (inventory.activeCatId === tokenId) {
      inventory.activeCatId = null;
    }
  }

  return cats.delete(tokenId);
}

export function getCatsByOwner(wallet: string): Cat[] {
  const inventory = inventories.get(wallet.toLowerCase());
  if (!inventory) return [];

  return inventory.catIds
    .map(id => cats.get(id))
    .filter((cat): cat is Cat => cat !== undefined);
}

export function updateCatCooldown(tokenId: number, cooldownUntil: number): boolean {
  const cat = cats.get(tokenId);
  if (!cat) return false;

  cat.cooldownUntil = cooldownUntil;
  return true;
}

export function canCatBattle(tokenId: number): boolean {
  const cat = cats.get(tokenId);
  if (!cat) return false;

  return Date.now() >= cat.cooldownUntil;
}

// ===== INVENTORY =====

function getOrCreateInventory(wallet: string): PlayerInventory {
  const key = wallet.toLowerCase();
  let inventory = inventories.get(key);

  if (!inventory) {
    inventory = {
      wallet: key,
      catIds: [],
      activeCatId: null,
    };
    inventories.set(key, inventory);
  }

  return inventory;
}

export function getInventory(wallet: string): PlayerInventory {
  return getOrCreateInventory(wallet);
}

export function setActiveCat(wallet: string, tokenId: number): boolean {
  const inventory = getOrCreateInventory(wallet);

  // Verify ownership
  if (!inventory.catIds.includes(tokenId)) {
    return false;
  }

  inventory.activeCatId = tokenId;
  return true;
}

export function getActiveCat(wallet: string): Cat | null {
  const inventory = inventories.get(wallet.toLowerCase());
  if (!inventory || !inventory.activeCatId) return null;

  return cats.get(inventory.activeCatId) || null;
}

// ===== BATTLES =====

export function createBattle(battle: Omit<Battle, 'battleId' | 'startTime' | 'endTime' | 'winner' | 'loser' | 'reason' | 'childTokenId' | 'deletedCatId'>): Battle {
  const battleId = `battle_${nextBattleId++}_${Date.now()}`;
  const newBattle: Battle = {
    ...battle,
    battleId,
    startTime: Date.now(),
    endTime: null,
    winner: null,
    loser: null,
    reason: null,
    childTokenId: null,
    deletedCatId: null,
  };

  battles.set(battleId, newBattle);
  return newBattle;
}

export function getBattle(battleId: string): Battle | undefined {
  return battles.get(battleId);
}

export function updateBattle(battleId: string, updates: Partial<Battle>): boolean {
  const battle = battles.get(battleId);
  if (!battle) return false;

  Object.assign(battle, updates);
  return true;
}

export function getPendingChallengeForPlayer(wallet: string): Battle | null {
  const key = wallet.toLowerCase();

  for (const battle of battles.values()) {
    if (
      battle.challenged.toLowerCase() === key &&
      battle.state === 'PENDING'
    ) {
      return battle;
    }
  }

  return null;
}

export function getActiveBattleForPlayer(wallet: string): Battle | null {
  const key = wallet.toLowerCase();

  for (const battle of battles.values()) {
    if (
      (battle.challenger.toLowerCase() === key || battle.challenged.toLowerCase() === key) &&
      battle.state === 'IN_PROGRESS'
    ) {
      return battle;
    }
  }

  return null;
}

// ===== UTILITY =====

export function getNextTokenId(): number {
  return nextTokenId;
}

export function getAllCats(): Cat[] {
  return Array.from(cats.values());
}

export function getAllBattles(): Battle[] {
  return Array.from(battles.values());
}

// Debug helpers
export function debugReset(): void {
  cats.clear();
  inventories.clear();
  battles.clear();
  nextTokenId = 1;
  nextBattleId = 1;
}

export function debugPrintState(): void {
  console.log('=== STORAGE STATE ===');
  console.log(`Cats: ${cats.size}`);
  console.log(`Inventories: ${inventories.size}`);
  console.log(`Battles: ${battles.size}`);
  console.log(`Next Token ID: ${nextTokenId}`);
  console.log(`Next Battle ID: ${nextBattleId}`);
}
