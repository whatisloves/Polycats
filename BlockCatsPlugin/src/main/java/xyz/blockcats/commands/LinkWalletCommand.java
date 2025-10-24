package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

public class LinkWalletCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;

    public LinkWalletCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                            String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Only players can use this command");
            return true;
        }

        if (args.length != 1) {
            player.sendMessage("§cUsage: /linkwallet <address>");
            return true;
        }

        final String address = args[0];

        // Basic validation
        if (!address.startsWith("0x") || address.length() != 42) {
            player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                    plugin.getConfig().getString("messages.invalid-wallet"));
            return true;
        }

        plugin.getWalletManager().linkWallet(player, address);
        player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                plugin.getConfig().getString("messages.link-wallet"));

        return true;
    }
}
