package xyz.blockcats.listeners;

import org.bukkit.Bukkit;
import org.bukkit.entity.Cat;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityTameEvent;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.api.ApiClient;
import xyz.blockcats.managers.SpawnManager;
import xyz.blockcats.managers.WalletManager;

public class CatTamingListener implements Listener {

    private final BlockCatsPlugin plugin;
    private final WalletManager walletManager;
    private final SpawnManager spawnManager;
    private final ApiClient apiClient;

    public CatTamingListener(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.walletManager = plugin.getWalletManager();
        this.spawnManager = plugin.getSpawnManager();
        this.apiClient = plugin.getApiClient();
    }

    @EventHandler
    public void onCatTame(EntityTameEvent event) {
        if (!(event.getEntity() instanceof Cat cat)) {
            return;
        }

        if (!(event.getOwner() instanceof Player player)) {
            return;
        }

        // Check if this is a BlockCat
        if (!spawnManager.isBlockCat(cat)) {
            return;
        }

        // Check if player has linked wallet
        if (!walletManager.hasWallet(player)) {
            player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                    plugin.getConfig().getString("messages.no-wallet"));
            event.setCancelled(true);
            return;
        }

        final String wallet = walletManager.getWallet(player);
        final String catUuid = cat.getUniqueId().toString();

        // Remove from pending claims
        spawnManager.removeBlockCat(cat);

        // Call API to claim and mint NFT (async)
        apiClient.claimCat(wallet, catUuid).thenAccept(response -> {
            // Run in main thread for player messaging
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (response == null || !response.success) {
                    final String error = response != null ? response.error : "API error";
                    player.sendMessage("§c" + error);
                    return;
                }

                final String message = plugin.getConfig().getString("messages.prefix") +
                        plugin.getConfig().getString("messages.claimed")
                        .replace("{id}", String.valueOf(response.tokenId));

                player.sendMessage(message);
                player.sendMessage("§7TX: " + response.transactionHash);
            });
        });
    }
}
