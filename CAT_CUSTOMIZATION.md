# BlockCats Customization System

## Uniqueness Layers

### 1. Visual (In Minecraft)
- 11 vanilla cat variants (TABBY, TUXEDO, SIAMESE, etc.)
- 16 collar colors (dye colors)
- Custom Kyrgyz names
- = 176 base combinations

### 2. DNA Stats → Gameplay Perks

```typescript
stats: {
  speed: 1-10,
  luck: 1-10,
  strength: 1-10,
  regen: 1-10,
  defense: 1-10
}

rarityScore = sum of all stats (5-50)
```

**Perk Mapping:**

| Stat 8+ | Perk | Effect |
|---------|------|--------|
| Speed | Swift Companion | Speed II when within 5 blocks |
| Luck | Fortune Aura | +20% drop rates nearby |
| Strength | Battle Cat | Strength I to owner |
| Regen | Healing Presence | Regeneration I aura |
| Defense | Guardian | Resistance I to owner |

**Cats are invulnerable (never die)**

### 3. Kyrgyz Names

**Format:** `[Kyrgyz Name] [Suffix] #[TokenID]`

**Name Pool:**
```typescript
common: ['Boz', 'Kara', 'Ak', 'Sary', 'Kyzyl']
uncommon: ['Tengri', 'Issyk', 'Naryn', 'Asman', 'Bermet']
rare: ['Cholpon', 'Altynai', 'Dinara', 'Kubat', 'Sanjar']
legendary: ['Ala-Too', 'Manas', 'Kurmanjan', 'Toktogul']

suffixes: ['Paws', 'Whiskers', 'Shadow', 'Runner', 'Flame',
           'Stripes', 'Tail', 'Eyes', 'Jumper', 'Hunter']
```

**Examples:**
- Common: "Boz Paws #1" (score 15)
- Rare: "Altynai Moonwalker #23" (score 35)
- Legendary: "Ala-Too Thunderborn #7" (score 48)

**Name Selection:**
- Rarity tier from score: <20=common, 20-30=uncommon, 30-40=rare, 40+=legendary
- Deterministic from DNA seed (same DNA = same name)

### 4. Website Gallery (True Appearance)

**NFT Metadata:**
- Full DNA (colors, patterns, stats)
- AI-generated unique image (DiceBear/Replicate)
- Optional: 3D model (Tripo API)
- Displays Kyrgyz name + all perks

### 5. Top 50 Texture Pack (Optional)

**For Legendary Cats (score 40+):**
- Generate custom texture via AI
- Include in downloadable resource pack
- Players install to see unique textures
- Creates VIP status for top collectors

**Regular cats:** Use vanilla variants

---

## Implementation Notes

**Plugin Side:**
```java
cat.setCatType(variantFromDNA); // TABBY, etc
cat.setCollarColor(colorFromDNA); // ORANGE, etc
cat.setCustomName("§6Tengri Shadow #42");
cat.setInvulnerable(true);

// Apply perks based on stats
if (stats.speed >= 8) applySpeedBuff(owner);
```

**Backend DNA Generation:**
```typescript
{
  variant: "TABBY",
  collarColor: "ORANGE",
  stats: { speed: 8, luck: 5, strength: 7, regen: 3, defense: 9 },
  rarityScore: 32,
  name: "Naryn Runner",
  seed: "a3f2d9"
}
```

**Website:**
- Show real custom-generated cat image
- List all perks
- Display Kyrgyz name prominently
- Add 🇰🇬 flag for branding

---

## Cultural Touch

**Pitch:** "BlockCats celebrates Kyrgyz culture with traditional names like Tengri (heaven) and Ala-Too (mountains), making each cat globally unique."

**Names Meaning:**
- Tengri = Sky/Heaven
- Ala-Too = Mountains
- Cholpon = Venus star
- Altynai = Golden moon
- Manas = Legendary hero
- Boz = Gray
- Kara = Black
- Ak = White
