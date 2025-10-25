package xyz.blockcats.utils;

import java.util.Random;

public class CatNameGenerator {
    
    private static final String[] PREFIXES = {
        "Whiskers", "Fluffy", "Shadow", "Luna", "Mittens", "Tiger", "Smokey", "Ginger",
        "Snowball", "Midnight", "Sunny", "Coco", "Oreo", "Pepper", "Cinnamon", "Honey",
        "Storm", "Thunder", "Lightning", "Blaze", "Frost", "Crystal", "Ruby", "Sapphire",
        "Emerald", "Gold", "Silver", "Copper", "Bronze", "Steel", "Iron", "Diamond"
    };
    
    private static final String[] SUFFIXES = {
        "paws", "tail", "whiskers", "ears", "eyes", "nose", "claws", "fur",
        "heart", "soul", "spirit", "dream", "hope", "joy", "love", "peace",
        "storm", "wind", "fire", "water", "earth", "sky", "moon", "star",
        "sun", "dawn", "dusk", "night", "day", "light", "dark", "bright"
    };
    
    private static final String[] SPECIAL_SUFFIXES = {
        "the Brave", "the Wise", "the Swift", "the Strong", "the Clever", "the Noble",
        "the Mystic", "the Royal", "the Ancient", "the Eternal", "the Legendary",
        "the Guardian", "the Protector", "the Wanderer", "the Seeker", "the Dreamer"
    };
    
    private static final Random random = new Random();
    
    /**
     * Generate a unique cat name based on the cat's UUID
     * @param catUuid The UUID of the cat
     * @return A unique name for the cat
     */
    public static String generateCatName(String catUuid) {
        // Use UUID hash to ensure consistent naming
        int hash = catUuid.hashCode();
        random.setSeed(hash);
        
        String prefix = PREFIXES[Math.abs(hash) % PREFIXES.length];
        
        // 20% chance for special suffix, 80% for regular suffix
        String suffix;
        if (random.nextInt(100) < 20) {
            suffix = SPECIAL_SUFFIXES[Math.abs(hash >> 8) % SPECIAL_SUFFIXES.length];
        } else {
            suffix = SUFFIXES[Math.abs(hash >> 4) % SUFFIXES.length];
        }
        
        return prefix + " " + suffix;
    }
    
    /**
     * Generate a cat name with a specific rarity level
     * @param catUuid The UUID of the cat
     * @param rarityLevel The rarity level (1-5, where 5 is most rare)
     * @return A unique name for the cat
     */
    public static String generateCatName(String catUuid, int rarityLevel) {
        String baseName = generateCatName(catUuid);
        
        // Add rarity indicators for higher levels
        if (rarityLevel >= 4) {
            return "✨ " + baseName + " ✨";
        } else if (rarityLevel >= 3) {
            return "⭐ " + baseName + " ⭐";
        }
        
        return baseName;
    }
}
