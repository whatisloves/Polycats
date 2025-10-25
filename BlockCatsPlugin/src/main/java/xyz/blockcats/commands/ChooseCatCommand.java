package xyz.blockcats.commands;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.api.ApiClient;
import xyz.blockcats.managers.BuffManager;
import xyz.blockcats.managers.CatCollectionManager;
import xyz.blockcats.managers.WalletManager;

import java.util.List;

public class ChooseCatCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;
    private final CatCollectionManager catManager;
    private final WalletManager walletManager;
    private final BuffManager buffManager;
    private final ApiClient apiClient;

    public ChooseCatCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.catManager = plugin.getCatCollectionManager();
        this.walletManager = plugin.getWalletManager();
        this.buffManager = plugin.getBuffManager();
        this.apiClient = plugin.getApiClient();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                            String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command");
            return true;
        }

        if (args.length == 0) {
            player.sendMessage("§cUsage: /choosecat <name>");
            player.sendMessage("§7Use /mycats to see your available cats");
            return true;
        }

        final String catName = String.join(" ", args);
        final String prefix = plugin.getConfig().getString("messages.prefix");

        // Check if player has this cat
        if (!catManager.hasCat(player, catName)) {
            player.sendMessage(prefix + "§cYou don't have a cat named '" + catName + "'!");
            player.sendMessage("§7Use /mycats to see your available cats");
            return true;
        }

        // Check if it's already active
        final String currentActive = catManager.getActiveCat(player);
        if (catName.equals(currentActive)) {
            player.sendMessage(prefix + "§e" + catName + " is already your active cat!");
            return true;
        }

        // Check if player has wallet
        if (!walletManager.hasWallet(player)) {
            player.sendMessage(prefix + "§cYou need to link a wallet first! Use /linkwallet");
            return true;
        }

        // Get the cat's token ID
        final List<CatCollectionManager.CollectedCat> cats = catManager.getPlayerCats(player);
        final CatCollectionManager.CollectedCat cat = cats.stream()
            .filter(c -> c.getName().equals(catName))
            .findFirst()
            .orElse(null);

        if (cat == null) {
            player.sendMessage(prefix + "§cCat not found in collection");
            return true;
        }

        final String wallet = walletManager.getWallet(player);

        // Call API to set active cat
        apiClient.setActiveCat(wallet, cat.getTokenId()).thenAccept(response -> {
            // Run in main thread
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (response == null || !response.success) {
                    final String error = response != null ? response.error : "API error";
                    player.sendMessage(prefix + "§cFailed to set active cat: " + error);
                    return;
                }

                // Set as active cat locally
                catManager.setActiveCat(player, catName);

                // Apply buffs from new cat
                buffManager.applyBuffsFromCat(player, response.newActiveCat.stats);

                player.sendMessage(prefix + "§aYou chose §6" + catName + " §aas your active cat!");
                player.sendMessage("§7Your previous active cat has disappeared");
                player.sendMessage("§7Your new active cat has appeared nearby");
                player.sendMessage(buffManager.getBuffsSummary(player));
            });
        });

        return true;
    }
}
