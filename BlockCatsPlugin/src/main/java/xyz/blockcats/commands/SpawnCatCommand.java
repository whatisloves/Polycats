package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

public class SpawnCatCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;

    public SpawnCatCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                            String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Only players can use this command");
            return true;
        }

        // Manually trigger spawn
        plugin.getSpawnManager().trySpawnCat();

        player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                plugin.getConfig().getString("messages.spawn-manual"));

        return true;
    }
}
