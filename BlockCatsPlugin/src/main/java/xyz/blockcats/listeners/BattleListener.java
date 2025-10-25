package xyz.blockcats.listeners;

import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.managers.BattleManager;

public class BattleListener implements Listener {

    private final BlockCatsPlugin plugin;
    private final BattleManager battleManager;

    public BattleListener(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.battleManager = plugin.getBattleManager();
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerDeath(PlayerDeathEvent event) {
        final Player loser = event.getEntity();
        final Player killer = loser.getKiller();

        // Check if loser is in a battle
        final BattleManager.Battle battle = battleManager.getActiveBattle(loser);
        if (battle == null) {
            return;
        }

        // Check if killer is the opponent
        final Player opponent = battle.getOpponent(loser);
        if (opponent == null) {
            plugin.getLogger().warning("Battle opponent not found for " + loser.getName());
            return;
        }

        // Verify killer is the opponent (prevent outside interference)
        if (killer == null || !killer.getUniqueId().equals(opponent.getUniqueId())) {
            // Death was not caused by opponent - battle continues
            loser.sendMessage("§eYou died, but not to your opponent. Battle continues!");
            opponent.sendMessage("§e" + loser.getName() + " died to something else. Battle continues!");
            return;
        }

        // Valid battle death - opponent wins
        plugin.getLogger().info("Battle death: " + loser.getName() + " killed by " + killer.getName());
        battleManager.endBattle(killer, loser, "death");
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerQuit(PlayerQuitEvent event) {
        final Player quitter = event.getPlayer();

        // Check if player is in a battle
        final BattleManager.Battle battle = battleManager.getActiveBattle(quitter);
        if (battle == null) {
            return;
        }

        // Get opponent
        final Player opponent = battle.getOpponent(quitter);
        if (opponent == null) {
            plugin.getLogger().warning("Battle opponent not found for " + quitter.getName());
            return;
        }

        // Player quit - opponent wins by forfeit
        plugin.getLogger().info("Battle forfeit: " + quitter.getName() + " quit, " + opponent.getName() + " wins");
        battleManager.endBattle(opponent, quitter, "quit");
    }
}
