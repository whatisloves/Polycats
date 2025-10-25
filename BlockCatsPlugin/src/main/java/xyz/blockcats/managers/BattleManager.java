package xyz.blockcats.managers;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitTask;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.api.ApiClient;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class BattleManager {

    private final BlockCatsPlugin plugin;
    private final ApiClient apiClient;
    private final WalletManager walletManager;
    private final CatCollectionManager catCollectionManager;

    // Active battles (player UUID -> Battle)
    private final Map<UUID, Battle> activeBattles = new HashMap<>();

    // Pending challenges (challenged player UUID -> PendingChallenge)
    private final Map<UUID, PendingChallenge> pendingChallenges = new HashMap<>();

    public BattleManager(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.apiClient = plugin.getApiClient();
        this.walletManager = plugin.getWalletManager();
        this.catCollectionManager = plugin.getCatCollectionManager();
    }

    public void challengePlayer(Player challenger, Player challenged) {
        // Check if challenger has linked wallet
        if (!walletManager.hasWallet(challenger)) {
            challenger.sendMessage("§cYou need to link a wallet first! Use /linkwallet");
            return;
        }

        // Check if challenged has linked wallet
        if (!walletManager.hasWallet(challenged)) {
            challenger.sendMessage("§c" + challenged.getName() + " hasn't linked a wallet");
            return;
        }

        // Check if challenger has an active cat
        final int challengerCatId = catCollectionManager.getActiveCatTokenId(challenger);
        if (challengerCatId == -1) {
            challenger.sendMessage("§cYou need an active cat to battle! Use /choosecat");
            return;
        }

        // Check if challenged has an active cat
        final int challengedCatId = catCollectionManager.getActiveCatTokenId(challenged);
        if (challengedCatId == -1) {
            challenger.sendMessage("§c" + challenged.getName() + " doesn't have an active cat");
            return;
        }

        // Check if either player is already in a battle
        if (isInBattle(challenger)) {
            challenger.sendMessage("§cYou are already in a battle!");
            return;
        }

        if (isInBattle(challenged)) {
            challenger.sendMessage("§c" + challenged.getName() + " is already in a battle");
            return;
        }

        // Check if challenged already has a pending challenge
        if (pendingChallenges.containsKey(challenged.getUniqueId())) {
            challenger.sendMessage("§c" + challenged.getName() + " already has a pending challenge");
            return;
        }

        // Get wallet addresses
        final String challengerWallet = walletManager.getWallet(challenger);
        final String challengedWallet = walletManager.getWallet(challenged);

        // Call API to create challenge
        apiClient.createBattleChallenge(
            challengerWallet,
            challengedWallet,
            challengerCatId,
            challengedCatId
        ).thenAccept(response -> {
            // Run in main thread
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (response == null || !response.success) {
                    final String error = response != null ? response.error : "API error";
                    challenger.sendMessage("§cChallenge failed: " + error);
                    return;
                }

                // Store pending challenge
                final PendingChallenge challenge = new PendingChallenge(
                    challenger.getUniqueId(),
                    challenged.getUniqueId(),
                    response.battleId
                );
                pendingChallenges.put(challenged.getUniqueId(), challenge);

                // Notify both players
                challenger.sendMessage("§a§lChallenge sent to §e" + challenged.getName());
                challenger.sendMessage("§7Your cat: §6" + response.challengerCat.name + " §8(Score: " + response.challengerCat.rarityScore + ")");

                challenged.sendMessage("§6§l" + challenger.getName() + " challenged you to a breeding battle!");
                challenged.sendMessage("§7Their cat: §6" + response.challengerCat.name + " §8(Score: " + response.challengerCat.rarityScore + ")");
                challenged.sendMessage("§7Your cat: §6" + response.challengedCat.name + " §8(Score: " + response.challengedCat.rarityScore + ")");
                challenged.sendMessage("§a/accept §7or §c/decline §7(30 sec timeout)");

                // Auto-expire after 30 seconds
                Bukkit.getScheduler().runTaskLater(plugin, () -> {
                    if (pendingChallenges.containsKey(challenged.getUniqueId())) {
                        pendingChallenges.remove(challenged.getUniqueId());
                        challenger.sendMessage("§cChallenge to " + challenged.getName() + " expired");
                        challenged.sendMessage("§cChallenge from " + challenger.getName() + " expired");
                    }
                }, 600L); // 30 seconds
            });
        });
    }

    public void acceptChallenge(Player accepter) {
        // Check if there's a pending challenge
        final PendingChallenge challenge = pendingChallenges.remove(accepter.getUniqueId());
        if (challenge == null) {
            accepter.sendMessage("§cNo pending challenge");
            return;
        }

        // Check if challenger is still online
        final Player challenger = Bukkit.getPlayer(challenge.challengerId);
        if (challenger == null || !challenger.isOnline()) {
            accepter.sendMessage("§cChallenger is no longer online");
            return;
        }

        // Get wallet
        final String wallet = walletManager.getWallet(accepter);

        // Call API to accept battle
        apiClient.acceptBattleChallenge(challenge.battleId, wallet).thenAccept(response -> {
            // Run in main thread
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (response == null || !response.success) {
                    final String error = response != null ? response.error : "API error";
                    accepter.sendMessage("§cFailed to start battle: " + error);
                    return;
                }

                // Start battle
                startBattle(challenger, accepter, challenge.battleId);
            });
        });
    }

    public void declineChallenge(Player decliner) {
        final PendingChallenge challenge = pendingChallenges.remove(decliner.getUniqueId());
        if (challenge == null) {
            decliner.sendMessage("§cNo pending challenge");
            return;
        }

        final Player challenger = Bukkit.getPlayer(challenge.challengerId);
        if (challenger != null && challenger.isOnline()) {
            challenger.sendMessage("§c" + decliner.getName() + " declined your challenge");
        }

        decliner.sendMessage("§7Challenge declined");
    }

    private void startBattle(Player p1, Player p2, String battleId) {
        // Create battle object
        final Battle battle = new Battle(p1, p2, battleId);
        activeBattles.put(p1.getUniqueId(), battle);
        activeBattles.put(p2.getUniqueId(), battle);

        // Start 5-minute timer
        battle.startTimer(300); // 5 minutes

        // Announce battle
        Bukkit.broadcastMessage("§6§l========================================");
        Bukkit.broadcastMessage("§e§l⚔ BREEDING BATTLE STARTED ⚔");
        Bukkit.broadcastMessage("§f" + p1.getName() + " §7vs §f" + p2.getName());
        Bukkit.broadcastMessage("§7Winner gets a new bred cat!");
        Bukkit.broadcastMessage("§7Loser's cat goes on 24h cooldown");
        Bukkit.broadcastMessage("§8(5 minute time limit)");
        Bukkit.broadcastMessage("§6§l========================================");

        // Message to players
        p1.sendMessage("§a§lBATTLE STARTED! §7Fight wherever you want!");
        p1.sendMessage("§7Winner: Gets bred cat");
        p1.sendMessage("§7Loser: Cat on cooldown for 24h");

        p2.sendMessage("§a§lBATTLE STARTED! §7Fight wherever you want!");
        p2.sendMessage("§7Winner: Gets bred cat");
        p2.sendMessage("§7Loser: Cat on cooldown for 24h");
    }

    public void endBattle(Player winner, Player loser, String reason) {
        final Battle battle = activeBattles.get(winner.getUniqueId());
        if (battle == null) {
            return;
        }

        // Cancel timer
        battle.cancelTimer();

        // Remove from active battles
        activeBattles.remove(winner.getUniqueId());
        activeBattles.remove(loser.getUniqueId());

        // Get wallets
        final String winnerWallet = walletManager.getWallet(winner);
        final String loserWallet = walletManager.getWallet(loser);

        // Call API to report result
        apiClient.reportBattleResult(battle.battleId, winnerWallet, loserWallet, reason)
            .thenAccept(result -> {
                // Run in main thread
                Bukkit.getScheduler().runTask(plugin, () -> {
                    if (result == null || !result.success) {
                        final String error = result != null ? result.error : "API error";
                        plugin.getLogger().warning("Battle result failed: " + error);
                        return;
                    }

                    // Announce result
                    Bukkit.broadcastMessage("§6§l========================================");
                    Bukkit.broadcastMessage("§e§l⚔ BATTLE ENDED ⚔");
                    Bukkit.broadcastMessage("§a§lWinner: §f" + winner.getName());
                    Bukkit.broadcastMessage("§c§lLoser: §f" + loser.getName());
                    Bukkit.broadcastMessage("§7Reason: " + formatReason(reason));
                    Bukkit.broadcastMessage("§6§l========================================");

                    // Message winner
                    winner.sendMessage("§a§l✔ YOU WON THE BATTLE!");
                    winner.sendMessage("§7New cat: §6" + result.childName);
                    winner.sendMessage("§7Stats: §bSpeed §f" + result.childStats.speed +
                        " §cStrength §f" + result.childStats.strength +
                        " §eDefense §f" + result.childStats.defense +
                        " §aRegen §f" + result.childStats.regen +
                        " §dLuck §f" + result.childStats.luck);
                    winner.sendMessage("§7Generation: §f" + result.childGeneration);
                    winner.sendMessage("§7Rarity Score: §f" + result.childRarityScore);

                    if (result.deletedCatId != null) {
                        winner.sendMessage("§e(Auto-deleted weakest cat: " + result.deletedCatName + ")");
                    }

                    // Message loser
                    loser.sendMessage("§c§l✘ YOU LOST THE BATTLE");
                    loser.sendMessage("§7Your cat is on cooldown for 24 hours");
                    loser.sendMessage("§7You can battle with a different cat immediately");

                    // Refresh both players' collections
                    catCollectionManager.refreshPlayerCats(winner);
                    catCollectionManager.refreshPlayerCats(loser);
                });
            });
    }

    public void handleBattleTimeout(Battle battle) {
        final Player p1 = Bukkit.getPlayer(battle.player1Id);
        final Player p2 = Bukkit.getPlayer(battle.player2Id);

        // Remove from active battles
        activeBattles.remove(battle.player1Id);
        activeBattles.remove(battle.player2Id);

        // Announce timeout
        Bukkit.broadcastMessage("§6§l========================================");
        Bukkit.broadcastMessage("§e§l⚔ BATTLE TIMED OUT ⚔");
        if (p1 != null) Bukkit.broadcastMessage("§7" + p1.getName() + " §fvs §7" + p2.getName());
        Bukkit.broadcastMessage("§7No winner - no breeding");
        Bukkit.broadcastMessage("§6§l========================================");

        if (p1 != null) {
            p1.sendMessage("§c§lBATTLE TIMED OUT - Draw");
            p1.sendMessage("§7No breeding occurred");
        }

        if (p2 != null) {
            p2.sendMessage("§c§lBATTLE TIMED OUT - Draw");
            p2.sendMessage("§7No breeding occurred");
        }

        // Report timeout to API
        apiClient.reportBattleResult(battle.battleId, null, null, "timeout");
    }

    public boolean isInBattle(Player player) {
        return activeBattles.containsKey(player.getUniqueId());
    }

    public Battle getActiveBattle(Player player) {
        return activeBattles.get(player.getUniqueId());
    }

    private String formatReason(String reason) {
        return switch (reason) {
            case "death" -> "Player death";
            case "quit" -> "Player quit";
            case "timeout" -> "Time limit reached";
            default -> reason;
        };
    }

    // Battle class
    public class Battle {
        public final UUID player1Id;
        public final UUID player2Id;
        public final String battleId;
        private BukkitTask timerTask;

        public Battle(Player p1, Player p2, String battleId) {
            this.player1Id = p1.getUniqueId();
            this.player2Id = p2.getUniqueId();
            this.battleId = battleId;
        }

        public void startTimer(int seconds) {
            timerTask = Bukkit.getScheduler().runTaskLater(plugin, () -> {
                handleBattleTimeout(this);
            }, seconds * 20L);
        }

        public void cancelTimer() {
            if (timerTask != null) {
                timerTask.cancel();
            }
        }

        public Player getOpponent(Player player) {
            if (player.getUniqueId().equals(player1Id)) {
                return Bukkit.getPlayer(player2Id);
            } else {
                return Bukkit.getPlayer(player1Id);
            }
        }
    }

    // Pending challenge class
    private static class PendingChallenge {
        public final UUID challengerId;
        public final UUID challengedId;
        public final String battleId;

        public PendingChallenge(UUID challengerId, UUID challengedId, String battleId) {
            this.challengerId = challengerId;
            this.challengedId = challengedId;
            this.battleId = battleId;
        }
    }
}
