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
        
        sender.sendMessage("§6=== BlockCats Help ===");
        sender.sendMessage("");
        sender.sendMessage("§eHow to get started:");
        sender.sendMessage("§71. Link your wallet: §b/linkwallet <address>");
        sender.sendMessage("§72. Wait for server announcements about cat spawns");
        sender.sendMessage("§73. Race to tame the cat (right-click with fish)");
        sender.sendMessage("§74. First to tame wins the NFT!");
        sender.sendMessage("");
        sender.sendMessage("§eCommands:");
        sender.sendMessage("§7• §b/linkwallet <address> §7- Link your wallet");
        sender.sendMessage("§7• §b/unlinkwallet §7- Unlink your wallet");
        sender.sendMessage("§7• §b/status §7- Check your status");
        sender.sendMessage("§7• §b/mycats §7- View your collected cats");
        sender.sendMessage("§7• §b/choosecat <name> §7- Choose your active cat");
        sender.sendMessage("§7• §b/help §7- Show this help");
        sender.sendMessage("");
        sender.sendMessage("§eImportant:");
        sender.sendMessage("§7• Only 1 cat per player per day");
        sender.sendMessage("§7• Server spawns 10 cats per day max");
        sender.sendMessage("§7• View your cats at: §bhttps://blockcats.xyz");
        sender.sendMessage("§7• Cats spawn every §e" + plugin.getConfig().getInt("spawn.interval-minutes") + " minutes");
        
        if (sender.hasPermission("blockcats.admin")) {
            sender.sendMessage("");
            sender.sendMessage("§eAdmin Commands:");
            sender.sendMessage("§7• §b/bcadmin help §7- Admin help");
        }

        return true;
    }
}
