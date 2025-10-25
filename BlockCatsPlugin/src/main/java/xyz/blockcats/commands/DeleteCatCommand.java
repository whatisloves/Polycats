package xyz.blockcats.commands;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.managers.CatCollectionManager;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class DeleteCatCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;
    private final CatCollectionManager catManager;

    // Pending deletions (player UUID -> token ID)
    private final Map<UUID, Integer> pendingDeletions = new HashMap<>();

    public DeleteCatCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.catManager = plugin.getCatCollectionManager();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command");
            return true;
        }

        if (args.length == 0) {
            player.sendMessage("§cUsage: /deletecat <catname>");
            player.sendMessage("§7Use /mycats to see your cats");
            return true;
        }

        final String catName = String.join(" ", args);
        final String prefix = plugin.getConfig().getString("messages.prefix");

        // Check if player has this cat
        if (!catManager.hasCat(player, catName)) {
            player.sendMessage(prefix + "§cYou don't have a cat named '" + catName + "'!");
            return true;
        }

        // Check if it's the active cat
        final String activeCat = catManager.getActiveCat(player);
        if (catName.equals(activeCat)) {
            player.sendMessage(prefix + "§cYou cannot delete your active cat!");
            player.sendMessage("§7Switch to another cat first using /choosecat");
            return true;
        }

        // Get token ID
        final CatCollectionManager.CollectedCat cat = catManager.getPlayerCats(player).stream()
            .filter(c -> c.getName().equals(catName))
            .findFirst()
            .orElse(null);

        if (cat == null) {
            player.sendMessage(prefix + "§cCat not found");
            return true;
        }

        // Store pending deletion
        pendingDeletions.put(player.getUniqueId(), cat.getTokenId());

        // Send confirmation message
        player.sendMessage("§c§l⚠ WARNING ⚠");
        player.sendMessage("§7You are about to permanently delete:");
        player.sendMessage("§6" + catName + " §8(Token #" + cat.getTokenId() + ")");
        player.sendMessage("§cThis action CANNOT be undone!");
        player.sendMessage("§a/confirmdelete §7to confirm §c(30 sec timeout)");

        // Auto-expire after 30 seconds
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            if (pendingDeletions.remove(player.getUniqueId()) != null) {
                player.sendMessage("§7Delete confirmation expired");
            }
        }, 600L); // 30 seconds

        return true;
    }

    public Map<UUID, Integer> getPendingDeletions() {
        return pendingDeletions;
    }
}
