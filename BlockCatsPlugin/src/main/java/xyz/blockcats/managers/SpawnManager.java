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

        // Find spawn location (random near spawn point)
        final Location spawn = world.getSpawnLocation();
        final Location catLocation = new Location(
            world,
            spawn.getX() + random.nextInt(20) - 10,
            world.getHighestBlockYAt(spawn) + 1,
            spawn.getZ() + random.nextInt(20) - 10
        );

        // Spawn cat
        final Cat cat = (Cat) world.spawnEntity(catLocation, EntityType.CAT);
        cat.setTamed(false);
        cat.setCustomName("§6⛓️ BlockCat §7(Wallet Required)");
        cat.setCustomNameVisible(true);
        cat.setGlowing(true); // Make it glow to show it's special

        // Track as BlockCat
        blockCats.add(cat.getUniqueId());

        plugin.getLogger().info("Spawned BlockCat at " + catLocation.getBlockX() + ", " + catLocation.getBlockY() + ", " + catLocation.getBlockZ());

        return cat;
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

    public void removeBlockCat(Cat cat) {
        blockCats.remove(cat.getUniqueId());
    }
}
