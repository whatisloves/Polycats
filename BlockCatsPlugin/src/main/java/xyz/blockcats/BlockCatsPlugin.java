package xyz.blockcats;

import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitRunnable;
import xyz.blockcats.commands.LinkWalletCommand;
import xyz.blockcats.commands.UnlinkWalletCommand;
import xyz.blockcats.commands.StatusCommand;
import xyz.blockcats.commands.SpawnCatCommand;
import xyz.blockcats.commands.BlockCatsAdminCommand;
import xyz.blockcats.commands.HelpCommand;
import xyz.blockcats.commands.MyCatsCommand;
import xyz.blockcats.commands.ChooseCatCommand;
import xyz.blockcats.listeners.CatTamingListener;
import xyz.blockcats.listeners.PlayerQuitListener;
import xyz.blockcats.api.ApiClient;
import xyz.blockcats.managers.WalletManager;
import xyz.blockcats.managers.SpawnManager;
import xyz.blockcats.managers.CatCollectionManager;

import java.util.logging.Logger;

public class BlockCatsPlugin extends JavaPlugin {

    private static BlockCatsPlugin instance;
    private ApiClient apiClient;
    private WalletManager walletManager;
    private SpawnManager spawnManager;
    private CatCollectionManager catCollectionManager;
    private Logger log;

    @Override
    public void onEnable() {
        instance = this;
        log = getLogger();

        // Save default config
        saveDefaultConfig();

        // Initialize managers
        apiClient = new ApiClient(this);
        walletManager = new WalletManager(this);
        spawnManager = new SpawnManager(this);
        catCollectionManager = new CatCollectionManager(this);

        // Register commands
        getCommand("linkwallet").setExecutor(new LinkWalletCommand(this));
        getCommand("unlinkwallet").setExecutor(new UnlinkWalletCommand(this));
        getCommand("status").setExecutor(new StatusCommand(this));
        getCommand("spawncat").setExecutor(new SpawnCatCommand(this));
        getCommand("bcadmin").setExecutor(new BlockCatsAdminCommand(this));
        getCommand("help").setExecutor(new HelpCommand(this));
        getCommand("mycats").setExecutor(new MyCatsCommand(this));
        getCommand("choosecat").setExecutor(new ChooseCatCommand(this));

        // Register event listeners
        getServer().getPluginManager().registerEvents(
            new CatTamingListener(this), this
        );
        getServer().getPluginManager().registerEvents(
            new PlayerQuitListener(this), this
        );

        // Start spawn scheduler
        startSpawnScheduler();

        log.info("BlockCats plugin enabled!");
    }

    @Override
    public void onDisable() {
        // Save wallet data
        walletManager.saveWallets();
        log.info("BlockCats plugin disabled!");
    }

    private void startSpawnScheduler() {
        if (!getConfig().getBoolean("spawn.enabled")) {
            return;
        }

        final int intervalMinutes = getConfig().getInt("spawn.interval-minutes");
        final long intervalTicks = intervalMinutes * 60 * 20; // 20 ticks = 1 second

        new BukkitRunnable() {
            @Override
            public void run() {
                spawnManager.trySpawnCat();
            }
        }.runTaskTimer(this, 100L, intervalTicks); // Start after 5 seconds

        log.info("Spawn scheduler started (interval: " + intervalMinutes + " minutes)");
    }

    public static BlockCatsPlugin getInstance() {
        return instance;
    }

    public ApiClient getApiClient() {
        return apiClient;
    }

    public WalletManager getWalletManager() {
        return walletManager;
    }

    public SpawnManager getSpawnManager() {
        return spawnManager;
    }

    public CatCollectionManager getCatCollectionManager() {
        return catCollectionManager;
    }
}
