package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

public class HelpCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;

    public HelpCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                            String label, String[] args) {
        String prefix = plugin.getConfig().getString("messages.prefix");
        
        sender.sendMessage("§6§l========================================");
        sender.sendMessage("§6§l         BlockCats Help");
        sender.sendMessage("§6§l========================================");
        sender.sendMessage("");
        sender.sendMessage("§e§lHow to get started:");
        sender.sendMessage("§71. Link your wallet: §b/linkwallet <address>");
        sender.sendMessage("§72. Wait for server announcements about cat spawns");
        sender.sendMessage("§73. Race to tame the cat (right-click with fish)");
        sender.sendMessage("§74. First to tame wins the NFT!");
        sender.sendMessage("");
        sender.sendMessage("§e§lBasic Commands:");
        sender.sendMessage("§7• §b/linkwallet <address> §7- Link your wallet");
        sender.sendMessage("§7• §b/unlinkwallet §7- Unlink your wallet");
        sender.sendMessage("§7• §b/status §7- Check your status");
        sender.sendMessage("§7• §b/help §7- Show this help");
        sender.sendMessage("");
        sender.sendMessage("§e§lCollection Management:");
        sender.sendMessage("§7• §b/mycats §7- View your collected cats");
        sender.sendMessage("§7• §b/choosecat <name> §7- Choose your active cat");
        sender.sendMessage("§7• §b/deletecat <name> §7- Delete a cat");
        sender.sendMessage("§7• §b/confirmdelete §7- Confirm cat deletion");
        sender.sendMessage("");
        sender.sendMessage("§e§lBreeding Battle Commands:");
        sender.sendMessage("§7• §b/challenge <player> breeding §7- Challenge to battle");
        sender.sendMessage("§7• §b/accept §7- Accept pending challenge");
        sender.sendMessage("§7• §b/decline §7- Decline pending challenge");
        sender.sendMessage("");
        sender.sendMessage("§e§lHow Battles Work:");
        sender.sendMessage("§7• Challenge another player to a breeding battle");
        sender.sendMessage("§7• Winner gets a §6new bred cat §7with better stats!");
        sender.sendMessage("§7• Loser's cat goes on §c24-hour cooldown");
        sender.sendMessage("§7• Battle anywhere - no arenas! §e(5 min limit)");
        sender.sendMessage("§7• Your active cat grants §bpotion buffs §7in combat");
        sender.sendMessage("");
        sender.sendMessage("§e§lImportant:");
        sender.sendMessage("§7• Max §65 cats §7per player (weakest auto-deleted)");
        sender.sendMessage("§7• Cats spawn every §e" + plugin.getConfig().getInt("spawn.interval-minutes") + " minutes");
        sender.sendMessage("§7• Better stats = stronger buffs in PvP!");
        
        if (sender.hasPermission("blockcats.admin")) {
            sender.sendMessage("");
            sender.sendMessage("§e§lAdmin Commands:");
            sender.sendMessage("§7• §b/bcadmin help §7- Admin help");
        }

        sender.sendMessage("");
        sender.sendMessage("§6§l========================================");

        return true;
    }
}
