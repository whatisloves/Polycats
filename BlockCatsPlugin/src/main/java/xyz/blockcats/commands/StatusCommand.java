package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

public class StatusCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;

    public StatusCommand(BlockCatsPlugin plugin) {
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
        
        // Check wallet status
        if (plugin.getWalletManager().hasWallet(player)) {
            String wallet = plugin.getWalletManager().getWallet(player);
            player.sendMessage(prefix + "§a✓ Wallet Linked");
            player.sendMessage("§7Address: §b" + wallet);
        } else {
            player.sendMessage(prefix + "§c✗ No Wallet Linked");
            player.sendMessage("§7Use /linkwallet <address> to link your wallet");
            player.sendMessage("§7You need a linked wallet to claim BlockCats!");
        }

        // Show spawn info
        player.sendMessage("");
        player.sendMessage(prefix + "§6BlockCats Info:");
        player.sendMessage("§7• Cats spawn every §e" + plugin.getConfig().getInt("spawn.interval-minutes") + " minutes");
        player.sendMessage("§7• Server announces spawn locations in chat");
        player.sendMessage("§7• First player to tame wins the NFT");
        player.sendMessage("§7• View your cats at: §bhttps://blockcats.xyz");

        return true;
    }
}
