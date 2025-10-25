package xyz.blockcats.commands;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

public class BlockCatsAdminCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;

    public BlockCatsAdminCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                            String label, String[] args) {
        if (!sender.hasPermission("blockcats.admin")) {
            sender.sendMessage("§cYou don't have permission to use this command");
            return true;
        }

        if (args.length == 0) {
            showHelp(sender);
            return true;
        }

        String subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "reload":
                handleReload(sender);
                break;
            case "spawn":
                handleSpawn(sender);
                break;
            case "status":
                handleStatus(sender);
                break;
            case "players":
                handlePlayers(sender);
                break;
            case "help":
            default:
                showHelp(sender);
                break;
        }

        return true;
    }

    private void showHelp(CommandSender sender) {
        sender.sendMessage("§6=== BlockCats Admin Commands ===");
        sender.sendMessage("§e/bcadmin reload §7- Reload plugin configuration");
        sender.sendMessage("§e/bcadmin spawn §7- Manually spawn a BlockCat");
        sender.sendMessage("§e/bcadmin status §7- Show server status");
        sender.sendMessage("§e/bcadmin players §7- List players with linked wallets");
        sender.sendMessage("§e/bcadmin help §7- Show this help");
    }

    private void handleReload(CommandSender sender) {
        plugin.reloadConfig();
        sender.sendMessage("§a✓ Configuration reloaded!");
    }

    private void handleSpawn(CommandSender sender) {
        sender.sendMessage("§6Spawning BlockCat...");
        plugin.getSpawnManager().trySpawnCat();
        sender.sendMessage("§a✓ BlockCat spawn triggered!");
    }

    private void handleStatus(CommandSender sender) {
        sender.sendMessage("§6=== BlockCats Server Status ===");
        sender.sendMessage("§7Plugin Version: §e" + plugin.getDescription().getVersion());
        sender.sendMessage("§7Spawn Enabled: §e" + plugin.getConfig().getBoolean("spawn.enabled"));
        sender.sendMessage("§7Spawn Interval: §e" + plugin.getConfig().getInt("spawn.interval-minutes") + " minutes");
        sender.sendMessage("§7API URL: §e" + plugin.getConfig().getString("api.url"));
        sender.sendMessage("§7Online Players: §e" + Bukkit.getOnlinePlayers().size());
    }

    private void handlePlayers(CommandSender sender) {
        sender.sendMessage("§6=== Players with Linked Wallets ===");
        
        int count = 0;
        for (Player player : Bukkit.getOnlinePlayers()) {
            if (plugin.getWalletManager().hasWallet(player)) {
                String wallet = plugin.getWalletManager().getWallet(player);
                sender.sendMessage("§7" + player.getName() + ": §b" + wallet);
                count++;
            }
        }
        
        if (count == 0) {
            sender.sendMessage("§7No players with linked wallets online");
        } else {
            sender.sendMessage("§7Total: §e" + count + " players");
        }
    }
}
