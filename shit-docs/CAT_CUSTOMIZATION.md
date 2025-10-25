# BlockCats Customization & Buff System

## Core Concept

BlockCats are NFT companions that grant **passive combat buffs** to their owners in Minecraft. Better stats = stronger buffs = competitive advantage in PvP battles.

---

## Cat Types

### Genesis Cats (Gen 0)
- **Stats Range:** 1-5 (weak baseline)
- **Mortality:** Can die in-game
- **Acquisition:** Tame spawned cats (timer-based, 1/day per player)
- **Purpose:** Starter cats to begin breeding journey

### Bred Cats (Gen 1+)
- **Stats Range:** 1-10 (inherited + generational bonus)
- **Mortality:** IMMORTAL - cannot die
- **Acquisition:** Win PvP battles to breed
- **Purpose:** Progressive improvement through generations

---

## Stat System

Each cat has **4 core stats** (1-10 range):

```typescript
interface CatStats {
  speed: number;      // 1-10
  strength: number;   // 1-10
  health: number;     // 1-10
  luck: number;       // 1-10
}
```

**Total Stats Range:**
- Genesis: 4-20 (weak)
- Bred Gen 1-2: 8-24
- Bred Gen 3-5: 16-32
- Bred Gen 8+: 32-40 (max achievable)

---

## Buff System (Active Cat Only)

When a cat is **active**, it grants continuous potion effects to its owner based on stats:

### Speed Buffs

| Stat Value | Buff | Effect |
|------------|------|--------|
| 1-6 | Speed I | +20% movement speed |
| 7-9 | Speed II | +40% movement speed |
| 10 | Speed II + Jump Boost I | +40% speed + higher jumps |

**Use Cases:** Escape battles, chase enemies, parkour advantages

### Strength Buffs

| Stat Value | Buff | Effect |
|------------|------|--------|
| 1-6 | Strength I | +3 melee damage |
| 7-9 | Strength II | +6 melee damage |
| 10 | Strength II + Resistance I | +6 damage + 20% damage reduction |

**Use Cases:** Win PvP fights, kill mobs faster

### Health Buffs

| Stat Value | Buff | Effect |
|------------|------|--------|
| 1-6 | Regeneration I | Heal 1 ❤ every 10 seconds |
| 7-9 | Regeneration II + Health Boost I | Heal 1 ❤ every 5s + 2 extra hearts |
| 10 | Regeneration III + Health Boost II | Heal 1 ❤ every 2.5s + 4 extra hearts |

**Use Cases:** Sustain in battles, faster recovery

### Luck Buffs

| Stat Value | Buff | Effect |
|------------|------|--------|
| 1-6 | Luck I | +20% better loot/drops |
| 7-9 | Luck II | +40% better loot/drops |
| 10 | Luck II + Night Vision | +40% loot + see in darkness |

**Use Cases:** Better enchantments, rare drops, cave exploration

---

## Cat Inventory System

**Per Player:**
- Max 5 cats (1 active + 4 stored)
- Only active cat grants buffs
- Switch active cat with `/choosecat <name>`
- Full inventory auto-deletes weakest cat when breeding winner gets new cat

**Strategic Decisions:**
- Keep high-Speed cat for escaping
- Keep high-Strength cat for battles
- Keep balanced cat for general play
- Delete low-stat Genesis cats when better cats are bred

---

## Visual Appearance

### In Minecraft (Limited Customization)
Due to server plugin limitations (no client mods):

- **11 vanilla cat variants** (TABBY, TUXEDO, SIAMESE, etc.)
- **16 collar colors** (dye colors)
- **Kyrgyz names** displayed above cats
- **Glowing effect** (shows it's special)

**Example:**
```
§6⛓️ Aibek §7(Gen 3) [glowing]
```

### On Website (True Appearance)
Full customization visible in gallery:

- **Unique AI-generated image** (DiceBear API)
- **Complete stat breakdown**
- **Buff descriptions** ("Grants Speed II + Strength I")
- **Generation and lineage** (parent links)
- **Kyrgyz name with meaning**

**NFT Metadata Example:**
```json
{
  "name": "Aibek (BlockCat #123)",
  "description": "Gen 3 BlockCat. Grants Speed II and Regeneration II when active.",
  "image": "https://api.dicebear.com/7.x/bottts/svg?seed=123",
  "attributes": [
    { "trait_type": "Speed", "value": 8, "max_value": 10 },
    { "trait_type": "Strength", "value": 6, "max_value": 10 },
    { "trait_type": "Health", "value": 7, "max_value": 10 },
    { "trait_type": "Luck", "value": 5, "max_value": 10 },
    { "trait_type": "Total Stats", "value": 26, "max_value": 40 },
    { "trait_type": "Buffs", "value": "Speed II, Strength I, Regeneration II + Health Boost I, Luck I" },
    { "trait_type": "Generation", "value": 3 },
    { "trait_type": "Immortal", "value": "Yes" }
  ]
}
```

---

## Kyrgyz Names

### Name Pool (140 Names Total)

**Common (Boz, Kara, Ak, Sary, Kyzyl)**
- Simple color-based names
- Easy to remember

**Uncommon (Tengri, Issyk, Naryn, Asman, Bermet)**
- Geographic/nature references
- Mountain, lake, sky themes

**Rare (Cholpon, Altynai, Dinara, Kubat, Sanjar)**
- Celestial and traditional names
- Venus star, golden moon

**Legendary (Ala-Too, Manas, Kurmanjan, Toktogul)**
- Historical/cultural heroes
- Mountain ranges, legendary figures

### Name Assignment

**Rules:**
- Random selection during minting
- Name rarity not tied to stats (any cat can get legendary name)
- No suffixes (clean names only)
- Display format: `Name (BlockCat #ID)`

**Examples:**
- "Aibek (BlockCat #1)"
- "Cholpon (BlockCat #42)"
- "Manas (BlockCat #157)"

### Cultural Meanings

| Name | Meaning | Type |
|------|---------|------|
| Tengri | Sky/Heaven | Uncommon |
| Ala-Too | Mountain Range | Legendary |
| Cholpon | Venus Star | Rare |
| Altynai | Golden Moon | Rare |
| Manas | Legendary Hero | Legendary |
| Issyk-Kul | Warm Lake | Uncommon |
| Boz | Gray | Common |
| Kara | Black | Common |
| Ak | White | Common |

---

## Implementation Guide

### Plugin Side (Java)

**Apply buffs when cat is active:**
```java
public void applyActiveCatBuffs(Player player, CatStats stats) {
    // Speed buffs
    if (stats.speed >= 10) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, Integer.MAX_VALUE, 1));
        player.addPotionEffect(new PotionEffect(PotionEffectType.JUMP, Integer.MAX_VALUE, 0));
    } else if (stats.speed >= 7) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, Integer.MAX_VALUE, 1));
    } else if (stats.speed >= 1) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, Integer.MAX_VALUE, 0));
    }

    // Strength buffs
    if (stats.strength >= 10) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, Integer.MAX_VALUE, 1));
        player.addPotionEffect(new PotionEffect(PotionEffectType.DAMAGE_RESISTANCE, Integer.MAX_VALUE, 0));
    } else if (stats.strength >= 7) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, Integer.MAX_VALUE, 1));
    } else if (stats.strength >= 1) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, Integer.MAX_VALUE, 0));
    }

    // Health buffs
    if (stats.health >= 10) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.REGENERATION, Integer.MAX_VALUE, 2));
        player.addPotionEffect(new PotionEffect(PotionEffectType.HEALTH_BOOST, Integer.MAX_VALUE, 1));
    } else if (stats.health >= 7) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.REGENERATION, Integer.MAX_VALUE, 1));
        player.addPotionEffect(new PotionEffect(PotionEffectType.HEALTH_BOOST, Integer.MAX_VALUE, 0));
    } else if (stats.health >= 1) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.REGENERATION, Integer.MAX_VALUE, 0));
    }

    // Luck buffs
    if (stats.luck >= 10) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.LUCK, Integer.MAX_VALUE, 1));
        player.addPotionEffect(new PotionEffect(PotionEffectType.NIGHT_VISION, Integer.MAX_VALUE, 0));
    } else if (stats.luck >= 7) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.LUCK, Integer.MAX_VALUE, 1));
    } else if (stats.luck >= 1) {
        player.addPotionEffect(new PotionEffect(PotionEffectType.LUCK, Integer.MAX_VALUE, 0));
    }
}

public void removeActiveCatBuffs(Player player) {
    player.removePotionEffect(PotionEffectType.SPEED);
    player.removePotionEffect(PotionEffectType.JUMP);
    player.removePotionEffect(PotionEffectType.INCREASE_DAMAGE);
    player.removePotionEffect(PotionEffectType.DAMAGE_RESISTANCE);
    player.removePotionEffect(PotionEffectType.REGENERATION);
    player.removePotionEffect(PotionEffectType.HEALTH_BOOST);
    player.removePotionEffect(PotionEffectType.LUCK);
    player.removePotionEffect(PotionEffectType.NIGHT_VISION);
}
```

**Spawn cat in-game:**
```java
Cat cat = (Cat) world.spawnEntity(location, EntityType.CAT);
cat.setCatType(Cat.Type.TABBY);  // Random vanilla variant
cat.setCollarColor(DyeColor.ORANGE);  // Random color
cat.setCustomName("§6⛓️ " + name + " §7(Gen " + generation + ")");
cat.setCustomNameVisible(true);
cat.setGlowing(true);
cat.setInvulnerable(isImmortal);  // false for Gen 0, true for Gen 1+
```

### Backend (TypeScript)

**Generate Genesis stats:**
```typescript
function generateGenesisStats() {
  return {
    speed: randomInt(1, 5),
    strength: randomInt(1, 5),
    health: randomInt(1, 5),
    luck: randomInt(1, 5)
  };
}
```

**Generate Kyrgyz name:**
```typescript
const KYRGYZ_NAMES = {
  common: ['Boz', 'Kara', 'Ak', 'Sary', 'Kyzyl'],
  uncommon: ['Tengri', 'Issyk', 'Naryn', 'Asman', 'Bermet'],
  rare: ['Cholpon', 'Altynai', 'Dinara', 'Kubat', 'Sanjar'],
  legendary: ['Ala-Too', 'Manas', 'Kurmanjan', 'Toktogul']
};

function generateKyrgyzName(): string {
  const allNames = [
    ...KYRGYZ_NAMES.common,
    ...KYRGYZ_NAMES.uncommon,
    ...KYRGYZ_NAMES.rare,
    ...KYRGYZ_NAMES.legendary
  ];
  return allNames[Math.floor(Math.random() * allNames.length)];
}
```

**Calculate buff descriptions:**
```typescript
function getBuffDescriptions(stats: CatStats): string[] {
  const buffs: string[] = [];

  // Speed
  if (stats.speed >= 10) buffs.push('Speed II', 'Jump Boost I');
  else if (stats.speed >= 7) buffs.push('Speed II');
  else if (stats.speed >= 1) buffs.push('Speed I');

  // Strength
  if (stats.strength >= 10) buffs.push('Strength II', 'Resistance I');
  else if (stats.strength >= 7) buffs.push('Strength II');
  else if (stats.strength >= 1) buffs.push('Strength I');

  // Health
  if (stats.health >= 10) buffs.push('Regeneration III', 'Health Boost II (+4 hearts)');
  else if (stats.health >= 7) buffs.push('Regeneration II', 'Health Boost I (+2 hearts)');
  else if (stats.health >= 1) buffs.push('Regeneration I');

  // Luck
  if (stats.luck >= 10) buffs.push('Luck II', 'Night Vision');
  else if (stats.luck >= 7) buffs.push('Luck II');
  else if (stats.luck >= 1) buffs.push('Luck I');

  return buffs;
}
```

---

## Progression Example

### Player Journey

**Day 1:**
- Tame Genesis cat: Speed 3, Strength 2, Health 4, Luck 1 (Total: 10)
- Buffs: Speed I, Strength I, Regeneration I, Luck I
- Set as active cat

**Day 2:**
- Challenge player with Genesis cat
- Win battle
- Breed cat (Gen 1): Speed 5, Strength 4, Health 6, Luck 3 (Total: 18)
- New buffs: Speed I, Strength I, Regeneration II + Health Boost I, Luck I
- Set Gen 1 as active (stronger buffs)

**Week 2 (Gen 3):**
- Multiple battle wins
- Best cat: Speed 7, Strength 8, Health 7, Luck 6 (Total: 28)
- Buffs: Speed II, Strength II, Regeneration II + Health Boost I, Luck I
- Significant combat advantage

**Week 4 (Gen 8):**
- Maxed cat: Speed 9, Strength 10, Health 9, Luck 8 (Total: 36)
- Buffs: Speed II, Strength II + Resistance I, Regeneration II + Health Boost I, Luck II
- Elite player status

---

## Cultural Branding

**Pitch:** "BlockCats brings Kyrgyz culture to Web3 gaming with traditional names like Tengri (heaven) and Manas (legendary hero). Each cat is a unique companion that grows stronger through skill-based PvP battles."

**Visual Elements:**
- 🇰🇬 Kyrgyz flag in gallery
- Mountain imagery (Ala-Too references)
- Traditional color schemes (reds, golds)
- Cultural context for names

**Educational Aspect:**
- Introduce Kyrgyz geography (Issyk-Kul lake, Ala-Too mountains)
- Share historical figures (Manas, Kurmanjan Datka)
- Promote lesser-known culture to global audience

---

## Competitive Meta

### Cat Archetypes

**Speed Demon (High Speed + Luck)**
- Speed 9+, Luck 8+
- Use case: Escape losing battles, loot farming
- Strategy: Hit-and-run tactics

**Tank (High Health + Strength)**
- Health 9+, Strength 8+
- Use case: Frontline battles, sustained fights
- Strategy: Outlast opponents

**Glass Cannon (Max Strength, Low Health)**
- Strength 10, Health 3
- Use case: High-risk aggressive play
- Strategy: Kill before being killed

**Balanced (All stats 7+)**
- Speed 7, Strength 7, Health 7, Luck 7
- Use case: Versatile for all situations
- Strategy: Adaptability

### Battle Strategies

**Breeding for Meta:**
- Breed high-Speed cats with high-Strength cats
- Create balanced offspring for competitive edge
- Sacrifice low-stat Genesis cats to make room

**Cat Rotation:**
- Use Tank cat for breeding battles
- Switch to Speed cat when farming
- Keep Balanced cat for general play
