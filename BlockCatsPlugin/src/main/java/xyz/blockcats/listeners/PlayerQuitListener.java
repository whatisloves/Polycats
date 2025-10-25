package xyz.blockcats.listeners;

import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerQuitEvent;
import xyz.blockcats.BlockCatsPlugin;

public class PlayerQuitListener implements Listener {

    private final BlockCatsPlugin plugin;

    public PlayerQuitListener(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        // Remove active cat when player leaves
        plugin.getCatCollectionManager().onPlayerQuit(event.getPlayer());
    }
}
