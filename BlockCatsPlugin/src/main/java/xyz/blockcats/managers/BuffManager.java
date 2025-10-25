package xyz.blockcats.managers;

import org.bukkit.attribute.Attribute;
import org.bukkit.entity.Player;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.api.ApiClient;

public class BuffManager {

    private final BlockCatsPlugin plugin;

    public BuffManager(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    /**
     * Apply buffs to a player based on cat stats
     */
    public void applyBuffsFromCat(Player player, ApiClient.CatStats stats) {
        // Remove existing buffs first
        clearBuffs(player);

        // Apply new buffs based on stats
        applySpeedBuff(player, stats.speed);
        applyStrengthBuff(player, stats.strength);
        applyDefenseBuff(player, stats.defense);
        applyRegenBuff(player, stats.regen);
        applyLuckBuff(player, stats.luck);

        plugin.getLogger().info("Applied buffs to " + player.getName() +
            " (Speed:" + stats.speed + " Str:" + stats.strength +
            " Def:" + stats.defense + " Regen:" + stats.regen + " Luck:" + stats.luck + ")");
    }

    /**
     * Clear all cat-related buffs from a player
     */
    public void clearBuffs(Player player) {
        // Remove potion effects
        player.removePotionEffect(PotionEffectType.SPEED);
        player.removePotionEffect(PotionEffectType.STRENGTH);
        player.removePotionEffect(PotionEffectType.RESISTANCE);
        player.removePotionEffect(PotionEffectType.REGENERATION);
        player.removePotionEffect(PotionEffectType.LUCK);
        player.removePotionEffect(PotionEffectType.JUMP_BOOST);

        // Reset health to default (20 = 10 hearts)
        // player.getAttribute(Attribute.GENERIC_MAX_HEALTH).setBaseValue(20.0);
    }

    private void applySpeedBuff(Player player, int speed) {
        if (speed >= 7) {
            // Speed II
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.SPEED,
                Integer.MAX_VALUE,
                1, // Amplifier (0 = Speed I, 1 = Speed II)
                false, // ambient
                false  // particles
            ));

            if (speed == 10) {
                // Bonus: Jump Boost I
                player.addPotionEffect(new PotionEffect(
                    PotionEffectType.JUMP_BOOST,
                    Integer.MAX_VALUE,
                    0,
                    false,
                    false
                ));
            }
        } else if (speed >= 4) {
            // Speed I
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.SPEED,
                Integer.MAX_VALUE,
                0,
                false,
                false
            ));
        }
    }

    private void applyStrengthBuff(Player player, int strength) {
        if (strength >= 7) {
            // Strength II
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.STRENGTH,
                Integer.MAX_VALUE,
                1,
                false,
                false
            ));
        } else if (strength >= 4) {
            // Strength I
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.STRENGTH,
                Integer.MAX_VALUE,
                0,
                false,
                false
            ));
        }
    }

    private void applyDefenseBuff(Player player, int defense) {
        if (defense >= 7) {
            // Resistance II
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.RESISTANCE,
                Integer.MAX_VALUE,
                1,
                false,
                false
            ));

            if (defense == 10) {
                // Bonus: 2 extra hearts (24 health = 12 hearts)
                // player.getAttribute(Attribute.GENERIC_MAX_HEALTH).setBaseValue(24.0);
                player.setHealth(24.0);
            }
        } else if (defense >= 4) {
            // Resistance I
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.RESISTANCE,
                Integer.MAX_VALUE,
                0,
                false,
                false
            ));
        }
    }

    private void applyRegenBuff(Player player, int regen) {
        if (regen >= 7) {
            // Regeneration II
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.REGENERATION,
                Integer.MAX_VALUE,
                1,
                false,
                false
            ));
        } else if (regen >= 4) {
            // Regeneration I
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.REGENERATION,
                Integer.MAX_VALUE,
                0,
                false,
                false
            ));
        }
    }

    private void applyLuckBuff(Player player, int luck) {
        if (luck >= 7) {
            // Luck II
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.LUCK,
                Integer.MAX_VALUE,
                1,
                false,
                false
            ));
        } else if (luck >= 4) {
            // Luck I
            player.addPotionEffect(new PotionEffect(
                PotionEffectType.LUCK,
                Integer.MAX_VALUE,
                0,
                false,
                false
            ));
        }
    }

    /**
     * Get a formatted string of buffs a player currently has
     */
    public String getBuffsSummary(Player player) {
        final StringBuilder sb = new StringBuilder("§7Active Buffs: ");
        boolean hasBuffs = false;

        if (player.hasPotionEffect(PotionEffectType.SPEED)) {
            final int level = player.getPotionEffect(PotionEffectType.SPEED).getAmplifier() + 1;
            sb.append("§bSpeed ").append(level).append(" ");
            hasBuffs = true;
        }

        if (player.hasPotionEffect(PotionEffectType.STRENGTH)) {
            final int level = player.getPotionEffect(PotionEffectType.STRENGTH).getAmplifier() + 1;
            sb.append("§cStrength ").append(level).append(" ");
            hasBuffs = true;
        }

        if (player.hasPotionEffect(PotionEffectType.RESISTANCE)) {
            final int level = player.getPotionEffect(PotionEffectType.RESISTANCE).getAmplifier() + 1;
            sb.append("§eResistance ").append(level).append(" ");
            hasBuffs = true;
        }

        if (player.hasPotionEffect(PotionEffectType.REGENERATION)) {
            final int level = player.getPotionEffect(PotionEffectType.REGENERATION).getAmplifier() + 1;
            sb.append("§aRegen ").append(level).append(" ");
            hasBuffs = true;
        }

        if (player.hasPotionEffect(PotionEffectType.LUCK)) {
            final int level = player.getPotionEffect(PotionEffectType.LUCK).getAmplifier() + 1;
            sb.append("§dLuck ").append(level).append(" ");
            hasBuffs = true;
        }

        if (player.hasPotionEffect(PotionEffectType.JUMP_BOOST)) {
            sb.append("§6Jump Boost ");
            hasBuffs = true;
        }

        if (!hasBuffs) {
            return "§7No active buffs";
        }

        return sb.toString().trim();
    }
}
