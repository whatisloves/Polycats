package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

import java.util.regex.Pattern;

public class LinkWalletCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;
    private static final Pattern ETH_ADDRESS_PATTERN = Pattern.compile("^0x[a-fA-F0-9]{40}$");

    public LinkWalletCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                            String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command");
            return true;
        }

        if (args.length != 1) {
            player.sendMessage("§cUsage: /linkwallet <address>");
            player.sendMessage("§7Example: /linkwallet 0x1234567890123456789012345678901234567890");
            return true;
        }

        final String address = args[0].trim();

        // Enhanced validation
        if (!isValidEthereumAddress(address)) {
            player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                    plugin.getConfig().getString("messages.invalid-wallet"));
            player.sendMessage("§7Make sure your address starts with '0x' and is 42 characters long");
            return true;
        }

        // Check if already linked
        if (plugin.getWalletManager().hasWallet(player)) {
            String currentWallet = plugin.getWalletManager().getWallet(player);
            player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                    "§eYou already have a wallet linked: §b" + currentWallet);
            player.sendMessage("§7To change your wallet, contact an admin or use /unlinkwallet");
            return true;
        }

        // Link wallet
        plugin.getWalletManager().linkWallet(player, address);
        
        // Send success messages
        player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                plugin.getConfig().getString("messages.link-wallet"));
        player.sendMessage("§7Your wallet: §b" + address);
        player.sendMessage("§7You can now claim BlockCats when they spawn!");
        
        // Log the linking
        plugin.getLogger().info("Player " + player.getName() + " linked wallet: " + address);

        return true;
    }

    private boolean isValidEthereumAddress(String address) {
        return ETH_ADDRESS_PATTERN.matcher(address).matches();
    }
}
