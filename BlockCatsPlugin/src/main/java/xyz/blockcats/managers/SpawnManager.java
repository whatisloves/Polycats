package xyz.blockcats.managers;

import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.entity.Cat;
import org.bukkit.entity.EntityType;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.api.ApiClient;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

public class SpawnManager {

    private final BlockCatsPlugin plugin;
    private final Set<UUID> blockCats = new HashSet<>();
    private final java.util.HashMap<UUID, String> catDNA = new java.util.HashMap<>();
    private final Random random = new Random();

    public SpawnManager(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    public void trySpawnCat() {
        // Call API to check if we can spawn
        plugin.getApiClient().requestSpawn().thenAccept(response -> {
            if (response == null || !response.canSpawn) {
                plugin.getLogger().info("Cannot spawn cat: " + (response != null ? response.message : "API error"));
                return;
            }

            // Spawn cat in main thread
            Bukkit.getScheduler().runTask(plugin, () -> {
                final Cat cat = spawnCat(response.dna);
                if (cat != null) {
                    broadcastSpawnMessage(cat.getLocation());
                }
            });
        });
    }

    public Cat spawnCat(String dna) {
        // Get main world
        final World world = Bukkit.getWorlds().get(0);

        // Find a safe spawn location
        final Location catLocation = findSafeSpawnLocation(world);
        if (catLocation == null) {
            plugin.getLogger().warning("Could not find safe spawn location for BlockCat");
            return null;
        }

        // Spawn cat
        final Cat cat = (Cat) world.spawnEntity(catLocation, EntityType.CAT);
        cat.setTamed(false);
        cat.setCustomName("§6⛓️ BlockCat §7(Wallet Required)");
        cat.setCustomNameVisible(true);
        cat.setGlowing(true); // Make it glow to show it's special

        // Track as BlockCat and store DNA
        blockCats.add(cat.getUniqueId());
        catDNA.put(cat.getUniqueId(), dna);

        plugin.getLogger().info("Spawned BlockCat at " + catLocation.getBlockX() + ", " + catLocation.getBlockY() + ", " + catLocation.getBlockZ() + " with DNA: " + dna);

        return cat;
    }

    private Location findSafeSpawnLocation(World world) {
        final Location spawn = world.getSpawnLocation();
        final int maxAttempts = 50; // Increased attempts
        
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            // Try random locations around spawn with larger radius
            final int x = spawn.getBlockX() + random.nextInt(100) - 50; // ±50 blocks from spawn
            final int z = spawn.getBlockZ() + random.nextInt(100) - 50;
            
            // Get the highest safe Y coordinate at this location
            final int y = world.getHighestBlockYAt(x, z);
            
            // Check if this location is safe
            final Location testLocation = new Location(world, x, y, z);
            if (isSafeLocation(testLocation)) {
                plugin.getLogger().info("Found safe spawn location at " + x + ", " + y + ", " + z + " (attempt " + (attempt + 1) + ")");
                return testLocation;
            }
        }
        
        // Fallback: try spawn location itself
        final int spawnY = world.getHighestBlockYAt(spawn);
        final Location fallbackLocation = new Location(world, spawn.getX(), spawnY, spawn.getZ());
        if (isSafeLocation(fallbackLocation)) {
            plugin.getLogger().info("Using fallback spawn location at " + spawn.getBlockX() + ", " + spawnY + ", " + spawn.getBlockZ());
            return fallbackLocation;
        }
        
        // Last resort: spawn at world spawn with some Y offset
        plugin.getLogger().warning("No safe spawn found, using world spawn as last resort");
        return new Location(world, spawn.getX(), spawnY + 2, spawn.getZ());
    }

    private boolean isSafeLocation(Location location) {
        final World world = location.getWorld();
        final int x = location.getBlockX();
        final int y = location.getBlockY();
        final int z = location.getBlockZ();
        
        // Check if the location is not in a solid block
        if (world.getBlockAt(x, y, z).getType().isSolid()) {
            return false;
        }
        
        // Check if there's a solid block below (so the cat doesn't fall)
        if (!world.getBlockAt(x, y - 1, z).getType().isSolid()) {
            return false;
        }
        
        // More lenient: only check if there's space above if it's a solid block
        // Allow spawning even if there's a block above (cats can move)
        if (world.getBlockAt(x, y + 1, z).getType().isSolid() && 
            world.getBlockAt(x, y + 2, z).getType().isSolid()) {
            // Only fail if there are 2 solid blocks above (suffocation risk)
            return false;
        }
        
        return true;
    }

    private void broadcastSpawnMessage(Location loc) {
        final String message = plugin.getConfig().getString("messages.prefix") +
                plugin.getConfig().getString("messages.spawn")
                .replace("{x}", String.valueOf(loc.getBlockX()))
                .replace("{y}", String.valueOf(loc.getBlockY()))
                .replace("{z}", String.valueOf(loc.getBlockZ()));

        final String walletReminder = plugin.getConfig().getString("messages.prefix") +
                plugin.getConfig().getString("messages.spawn-wallet-reminder");

        Bukkit.broadcastMessage(message);
        Bukkit.broadcastMessage(walletReminder);
    }

    public boolean isBlockCat(Cat cat) {
        return blockCats.contains(cat.getUniqueId());
    }

    public String getCatDNA(Cat cat) {
        return catDNA.get(cat.getUniqueId());
    }

    public void removeBlockCat(Cat cat) {
        blockCats.remove(cat.getUniqueId());
        catDNA.remove(cat.getUniqueId());
    }
}
