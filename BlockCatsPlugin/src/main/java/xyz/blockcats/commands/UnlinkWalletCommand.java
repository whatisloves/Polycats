package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

public class UnlinkWalletCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;

    public UnlinkWalletCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                            String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command");
            return true;
        }

        if (!plugin.getWalletManager().hasWallet(player)) {
            player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                    "§cYou don't have a wallet linked!");
            player.sendMessage("§7Use /linkwallet <address> to link a wallet");
            return true;
        }

        String oldWallet = plugin.getWalletManager().getWallet(player);
        plugin.getWalletManager().unlinkWallet(player);
        
        player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                "§aWallet unlinked successfully!");
        player.sendMessage("§7Previous wallet: §b" + oldWallet);
        player.sendMessage("§7You can link a new wallet with /linkwallet <address>");
        
        // Log the unlinking
        plugin.getLogger().info("Player " + player.getName() + " unlinked wallet: " + oldWallet);

        return true;
    }
}
