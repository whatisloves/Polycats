package xyz.blockcats.commands;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.managers.BattleManager;

public class ChallengeCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;
    private final BattleManager battleManager;

    public ChallengeCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.battleManager = plugin.getBattleManager();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command");
            return true;
        }

        // Check arguments
        if (args.length < 2) {
            player.sendMessage("§cUsage: /challenge <player> breeding");
            return true;
        }

        // Get target player
        final String targetName = args[0];
        final Player target = Bukkit.getPlayer(targetName);

        if (target == null || !target.isOnline()) {
            player.sendMessage("§cPlayer not found: " + targetName);
            return true;
        }

        // Check not challenging self
        if (target.getUniqueId().equals(player.getUniqueId())) {
            player.sendMessage("§cYou cannot challenge yourself!");
            return true;
        }

        // Check battle type
        final String battleType = args[1].toLowerCase();
        if (!battleType.equals("breeding")) {
            player.sendMessage("§cInvalid battle type. Use: breeding");
            return true;
        }

        // Send challenge
        battleManager.challengePlayer(player, target);

        return true;
    }
}
