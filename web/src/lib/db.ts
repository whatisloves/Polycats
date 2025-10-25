import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize database
const dbPath = join(process.cwd(), 'data', 'blockcats.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS battles (
    battleId TEXT PRIMARY KEY,
    challenger TEXT NOT NULL,
    challenged TEXT NOT NULL,
    challengerCatId INTEGER NOT NULL,
    challengedCatId INTEGER NOT NULL,
    state TEXT NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER,
    winner TEXT,
    loser TEXT,
    reason TEXT,
    childTokenId INTEGER,
    deletedCatId INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_battles_challenger ON battles(challenger);
  CREATE INDEX IF NOT EXISTS idx_battles_challenged ON battles(challenged);
  CREATE INDEX IF NOT EXISTS idx_battles_state ON battles(state);

  CREATE TABLE IF NOT EXISTS cats (
    tokenId INTEGER PRIMARY KEY,
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    dna TEXT NOT NULL,
    generation INTEGER NOT NULL,
    isGenesis INTEGER NOT NULL,
    parent1Id INTEGER,
    parent2Id INTEGER,
    rarityScore INTEGER NOT NULL,
    cooldownUntil INTEGER NOT NULL,
    textureUrl TEXT,
    speed INTEGER NOT NULL,
    strength INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    regen INTEGER NOT NULL,
    luck INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_cats_owner ON cats(owner);
  CREATE INDEX IF NOT EXISTS idx_cats_rarityScore ON cats(rarityScore);

  CREATE TABLE IF NOT EXISTS player_inventory (
    wallet TEXT PRIMARY KEY,
    activeCatId INTEGER
  );
`);

// Export database instance
export { db };

// Battle queries
export const battleQueries = {
  insert: db.prepare(`
    INSERT INTO battles (
      battleId, challenger, challenged, challengerCatId, challengedCatId,
      state, startTime
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `),

  update: db.prepare(`
    UPDATE battles
    SET state = ?, endTime = ?, winner = ?, loser = ?, reason = ?,
        childTokenId = ?, deletedCatId = ?
    WHERE battleId = ?
  `),

  findById: db.prepare(`
    SELECT * FROM battles WHERE battleId = ?
  `),

  findPendingByWallet: db.prepare(`
    SELECT * FROM battles
    WHERE (challenger = ? OR challenged = ?)
      AND state = 'PENDING'
    ORDER BY startTime DESC
    LIMIT 1
  `),
};

// Cat queries
export const catQueries = {
  insert: db.prepare(`
    INSERT INTO cats (
      tokenId, owner, name, dna, generation, isGenesis,
      parent1Id, parent2Id, rarityScore, cooldownUntil, textureUrl,
      speed, strength, defense, regen, luck
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  update: db.prepare(`
    UPDATE cats
    SET owner = ?, cooldownUntil = ?
    WHERE tokenId = ?
  `),

  delete: db.prepare(`
    DELETE FROM cats WHERE tokenId = ?
  `),

  findById: db.prepare(`
    SELECT * FROM cats WHERE tokenId = ?
  `),

  findByOwner: db.prepare(`
    SELECT * FROM cats WHERE owner = ? ORDER BY rarityScore DESC
  `),

  count: db.prepare(`
    SELECT COUNT(*) as count FROM cats
  `),

  maxTokenId: db.prepare(`
    SELECT MAX(tokenId) as maxId FROM cats
  `),
};

// Player inventory queries
export const inventoryQueries = {
  upsert: db.prepare(`
    INSERT INTO player_inventory (wallet, activeCatId)
    VALUES (?, ?)
    ON CONFLICT(wallet) DO UPDATE SET activeCatId = excluded.activeCatId
  `),

  findByWallet: db.prepare(`
    SELECT * FROM player_inventory WHERE wallet = ?
  `),

  updateActiveCat: db.prepare(`
    UPDATE player_inventory SET activeCatId = ? WHERE wallet = ?
  `),
};

console.log('✅ SQLite database initialized at:', dbPath);
