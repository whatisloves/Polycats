package xyz.blockcats.managers;

import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.entity.Cat;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.utils.CatNameGenerator;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class CatCollectionManager {
    
    private final BlockCatsPlugin plugin;
    private final Map<UUID, List<CollectedCat>> playerCats = new ConcurrentHashMap<>();
    private final Map<UUID, String> activeCats = new ConcurrentHashMap<>(); // Player UUID -> Active Cat Name
    private final Map<String, Cat> activeCatEntities = new ConcurrentHashMap<>(); // Cat Name -> Entity
    private final File catsFile;
    private org.bukkit.configuration.file.FileConfiguration catsConfig;
    
    public CatCollectionManager(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.catsFile = new File(plugin.getDataFolder(), "cats.yml");
        loadCats();
    }
    
    public static class CollectedCat {
        private String name;
        private String dna;
        private long collectedAt;
        private int tokenId;
        private String metadataUri;
        
        public CollectedCat(String name, String dna, int tokenId, String metadataUri) {
            this.name = name;
            this.dna = dna;
            this.collectedAt = System.currentTimeMillis();
            this.tokenId = tokenId;
            this.metadataUri = metadataUri;
        }
        
        // Getters
        public String getName() { return name; }
        public String getDna() { return dna; }
        public long getCollectedAt() { return collectedAt; }
        public int getTokenId() { return tokenId; }
        public String getMetadataUri() { return metadataUri; }
    }
    
    private void loadCats() {
        if (!catsFile.exists()) {
            try {
                catsFile.createNewFile();
            } catch (IOException e) {
                plugin.getLogger().severe("Failed to create cats.yml: " + e.getMessage());
            }
        }
        
        catsConfig = org.bukkit.configuration.file.YamlConfiguration.loadConfiguration(catsFile);
        
        // Load player cats
        for (String playerUuid : catsConfig.getKeys(false)) {
            UUID uuid = UUID.fromString(playerUuid);
            List<CollectedCat> cats = new ArrayList<>();
            
            if (catsConfig.isList(playerUuid + ".cats")) {
                for (Object catObj : catsConfig.getList(playerUuid + ".cats")) {
                    if (catObj instanceof Map) {
                        Map<?, ?> catMap = (Map<?, ?>) catObj;
                        String name = (String) catMap.get("name");
                        String dna = (String) catMap.get("dna");
                        int tokenId = (Integer) catMap.get("tokenId");
                        String metadataUri = (String) catMap.get("metadataUri");
                        cats.add(new CollectedCat(name, dna, tokenId, metadataUri));
                    }
                }
            }
            
            playerCats.put(uuid, cats);
            
            // Load active cat
            String activeCatName = catsConfig.getString(playerUuid + ".activeCat");
            if (activeCatName != null && !activeCatName.isEmpty()) {
                activeCats.put(uuid, activeCatName);
            }
        }
        
        plugin.getLogger().info("Loaded " + playerCats.size() + " player cat collections");
    }
    
    public void saveCats() {
        for (Map.Entry<UUID, List<CollectedCat>> entry : playerCats.entrySet()) {
            String playerUuid = entry.getKey().toString();
            List<Map<String, Object>> catList = new ArrayList<>();
            
            for (CollectedCat cat : entry.getValue()) {
                Map<String, Object> catMap = new HashMap<>();
                catMap.put("name", cat.getName());
                catMap.put("dna", cat.getDna());
                catMap.put("tokenId", cat.getTokenId());
                catMap.put("metadataUri", cat.getMetadataUri());
                catMap.put("collectedAt", cat.getCollectedAt());
                catList.add(catMap);
            }
            
            catsConfig.set(playerUuid + ".cats", catList);
            catsConfig.set(playerUuid + ".activeCat", activeCats.get(entry.getKey()));
        }
        
        try {
            catsConfig.save(catsFile);
        } catch (IOException e) {
            plugin.getLogger().severe("Failed to save cats: " + e.getMessage());
        }
    }
    
    public void addCat(Player player, String catName, String dna, int tokenId, String metadataUri) {
        UUID playerUuid = player.getUniqueId();
        
        // Add to collection
        if (!playerCats.containsKey(playerUuid)) {
            playerCats.put(playerUuid, new ArrayList<>());
        }
        
        CollectedCat newCat = new CollectedCat(catName, dna, tokenId, metadataUri);
        playerCats.get(playerUuid).add(newCat);
        
        // Set as active cat (remove previous active cat)
        setActiveCat(player, catName);
        
        plugin.getLogger().info("Player " + player.getName() + " collected cat: " + catName);
    }
    
    public void setActiveCat(Player player, String catName) {
        UUID playerUuid = player.getUniqueId();
        
        // Remove previous active cat entity
        String previousActive = activeCats.get(playerUuid);
        if (previousActive != null) {
            Cat previousEntity = activeCatEntities.get(previousActive);
            if (previousEntity != null && !previousEntity.isDead()) {
                previousEntity.remove();
            }
            activeCatEntities.remove(previousActive);
        }
        
        // Set new active cat
        activeCats.put(playerUuid, catName);
        
        // Spawn new active cat
        spawnActiveCat(player, catName);
        
        saveCats();
    }
    
    private void spawnActiveCat(Player player, String catName) {
        // Find the cat in player's collection
        List<CollectedCat> cats = playerCats.get(player.getUniqueId());
        if (cats == null) return;
        
        CollectedCat cat = cats.stream()
            .filter(c -> c.getName().equals(catName))
            .findFirst()
            .orElse(null);
        
        if (cat == null) return;
        
        // Spawn cat near player
        Location spawnLoc = player.getLocation().add(2, 0, 2);
        World world = spawnLoc.getWorld();
        
        if (world != null) {
            Cat catEntity = (Cat) world.spawnEntity(spawnLoc, EntityType.CAT);
            catEntity.setTamed(true);
            catEntity.setOwner(player);
            catEntity.setCustomName("§6" + catName);
            catEntity.setCustomNameVisible(true);
            catEntity.setGlowing(true);
            
            activeCatEntities.put(catName, catEntity);
            
            player.sendMessage(plugin.getConfig().getString("messages.prefix") +
                    "§aYour active cat §6" + catName + " §ahas appeared!");
        }
    }
    
    public List<CollectedCat> getPlayerCats(Player player) {
        return playerCats.getOrDefault(player.getUniqueId(), new ArrayList<>());
    }
    
    public String getActiveCat(Player player) {
        return activeCats.get(player.getUniqueId());
    }
    
    public boolean hasCat(Player player, String catName) {
        List<CollectedCat> cats = getPlayerCats(player);
        return cats.stream().anyMatch(cat -> cat.getName().equals(catName));
    }
    
    public void removeActiveCat(Player player) {
        UUID playerUuid = player.getUniqueId();
        String activeCat = activeCats.get(playerUuid);
        
        if (activeCat != null) {
            Cat entity = activeCatEntities.get(activeCat);
            if (entity != null && !entity.isDead()) {
                entity.remove();
            }
            activeCatEntities.remove(activeCat);
            activeCats.remove(playerUuid);
        }
    }
    
    public void onPlayerQuit(Player player) {
        // Remove active cat entity when player leaves
        removeActiveCat(player);
    }
}
