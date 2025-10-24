package xyz.blockcats.managers;

import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class WalletManager {

    private final BlockCatsPlugin plugin;
    private final Map<UUID, String> wallets = new HashMap<>();
    private final File walletsFile;
    private FileConfiguration walletsConfig;

    public WalletManager(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.walletsFile = new File(plugin.getDataFolder(), "wallets.yml");
        loadWallets();
    }

    private void loadWallets() {
        if (!walletsFile.exists()) {
            try {
                walletsFile.createNewFile();
            } catch (IOException e) {
                plugin.getLogger().severe("Failed to create wallets.yml: " + e.getMessage());
            }
        }

        walletsConfig = YamlConfiguration.loadConfiguration(walletsFile);

        for (String key : walletsConfig.getKeys(false)) {
            UUID uuid = UUID.fromString(key);
            String wallet = walletsConfig.getString(key);
            wallets.put(uuid, wallet);
        }

        plugin.getLogger().info("Loaded " + wallets.size() + " wallet links");
    }

    public void saveWallets() {
        for (Map.Entry<UUID, String> entry : wallets.entrySet()) {
            walletsConfig.set(entry.getKey().toString(), entry.getValue());
        }

        try {
            walletsConfig.save(walletsFile);
        } catch (IOException e) {
            plugin.getLogger().severe("Failed to save wallets: " + e.getMessage());
        }
    }

    public void linkWallet(Player player, String address) {
        wallets.put(player.getUniqueId(), address);
        saveWallets();
    }

    public String getWallet(Player player) {
        return wallets.get(player.getUniqueId());
    }

    public boolean hasWallet(Player player) {
        return wallets.containsKey(player.getUniqueId());
    }
}
