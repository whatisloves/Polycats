package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.managers.BattleManager;

public class DeclineCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;
    private final BattleManager battleManager;

    public DeclineCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.battleManager = plugin.getBattleManager();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command");
            return true;
        }

        // Decline the challenge
        battleManager.declineChallenge(player);

        return true;
    }
}
