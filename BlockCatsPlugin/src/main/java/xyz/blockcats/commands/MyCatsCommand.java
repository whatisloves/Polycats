package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.managers.CatCollectionManager;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

public class MyCatsCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;

    public MyCatsCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                            String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command");
            return true;
        }

        String prefix = plugin.getConfig().getString("messages.prefix");
        CatCollectionManager catManager = plugin.getCatCollectionManager();
        
        List<CatCollectionManager.CollectedCat> cats = catManager.getPlayerCats(player);
        String activeCat = catManager.getActiveCat(player);
        
        if (cats.isEmpty()) {
            player.sendMessage(prefix + "§7You don't have any cats yet!");
            player.sendMessage("§7Tame BlockCats to start your collection!");
            return true;
        }
        
        player.sendMessage("§6=== Your Cat Collection ===");
        player.sendMessage("§7Total cats: §e" + cats.size());
        
        if (activeCat != null) {
            player.sendMessage("§7Active cat: §a" + activeCat);
        } else {
            player.sendMessage("§7Active cat: §cNone");
        }
        
        player.sendMessage("");
        player.sendMessage("§6Your Cats:");
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("MMM dd, yyyy");
        
        for (int i = 0; i < cats.size(); i++) {
            CatCollectionManager.CollectedCat cat = cats.get(i);
            String status = (activeCat != null && activeCat.equals(cat.getName())) ? "§a[ACTIVE]" : "§7[Inactive]";
            
            player.sendMessage("§7" + (i + 1) + ". §6" + cat.getName() + " " + status);
            player.sendMessage("§7   Token ID: §e" + cat.getTokenId());
            player.sendMessage("§7   Collected: §e" + dateFormat.format(new Date(cat.getCollectedAt())));
            player.sendMessage("");
        }
        
        player.sendMessage("§7Use §b/choosecat <name> §7to set an active cat");
        player.sendMessage("§7Use §b/help §7for more commands");
        
        return true;
    }
}
