package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.managers.CatCollectionManager;

import java.util.List;

public class ChooseCatCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;

    public ChooseCatCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
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

        String catName = String.join(" ", args);
        String prefix = plugin.getConfig().getString("messages.prefix");
        CatCollectionManager catManager = plugin.getCatCollectionManager();
        
        // Check if player has this cat
        if (!catManager.hasCat(player, catName)) {
            player.sendMessage(prefix + "§cYou don't have a cat named '" + catName + "'!");
            player.sendMessage("§7Use /mycats to see your available cats");
            return true;
        }
        
        // Check if it's already active
        String currentActive = catManager.getActiveCat(player);
        if (catName.equals(currentActive)) {
            player.sendMessage(prefix + "§e" + catName + " is already your active cat!");
            return true;
        }
        
        // Set as active cat
        catManager.setActiveCat(player, catName);
        
        player.sendMessage(prefix + "§aYou chose §6" + catName + " §aas your active cat!");
        player.sendMessage("§7Your previous active cat has disappeared");
        player.sendMessage("§7Your new active cat has appeared nearby");
        
        return true;
    }
}
