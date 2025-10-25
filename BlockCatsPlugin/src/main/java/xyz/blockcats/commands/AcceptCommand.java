package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.managers.BattleManager;

public class AcceptCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;
    private final BattleManager battleManager;

    public AcceptCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.battleManager = plugin.getBattleManager();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command");
            return true;
        }

        // Accept the challenge
        battleManager.acceptChallenge(player);

        return true;
    }
}
