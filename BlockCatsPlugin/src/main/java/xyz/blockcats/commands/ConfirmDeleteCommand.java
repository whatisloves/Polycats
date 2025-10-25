package xyz.blockcats.commands;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.api.ApiClient;
import xyz.blockcats.managers.CatCollectionManager;
import xyz.blockcats.managers.WalletManager;

public class ConfirmDeleteCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;
    private final DeleteCatCommand deleteCatCommand;
    private final WalletManager walletManager;
    private final CatCollectionManager catManager;
    private final ApiClient apiClient;

    public ConfirmDeleteCommand(BlockCatsPlugin plugin, DeleteCatCommand deleteCatCommand) {
        this.plugin = plugin;
        this.deleteCatCommand = deleteCatCommand;
        this.walletManager = plugin.getWalletManager();
        this.catManager = plugin.getCatCollectionManager();
        this.apiClient = plugin.getApiClient();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command");
            return true;
        }

        final String prefix = plugin.getConfig().getString("messages.prefix");

        // Check if there's a pending deletion
        final Integer tokenId = deleteCatCommand.getPendingDeletions().remove(player.getUniqueId());
        if (tokenId == null) {
            player.sendMessage(prefix + "§cNo pending deletion");
            player.sendMessage("§7Use /deletecat <catname> first");
            return true;
        }

        // Check if player has wallet
        if (!walletManager.hasWallet(player)) {
            player.sendMessage(prefix + "§cYou need to link a wallet first!");
            return true;
        }

        final String wallet = walletManager.getWallet(player);

        player.sendMessage(prefix + "§7Deleting cat...");

        // Call API to delete cat
        apiClient.deleteCat(tokenId, wallet).thenAccept(response -> {
            // Run in main thread
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (response == null || !response.success) {
                    final String error = response != null ? response.error : "API error";
                    player.sendMessage(prefix + "§cFailed to delete cat: " + error);
                    return;
                }

                player.sendMessage(prefix + "§a✔ Cat deleted successfully");
                player.sendMessage("§7" + response.message);

                // Refresh player's cat collection
                catManager.refreshPlayerCats(player);
            });
        });

        return true;
    }
}
