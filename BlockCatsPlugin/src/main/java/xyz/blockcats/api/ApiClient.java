package xyz.blockcats.api;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;
import xyz.blockcats.BlockCatsPlugin;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

public class ApiClient {

    private final BlockCatsPlugin plugin;
    private final OkHttpClient client;
    private final Gson gson;
    private final String apiUrl;
    private final String apiSecret;
    private static final MediaType JSON = MediaType.parse("application/json");

    public ApiClient(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.client = new OkHttpClient();
        this.gson = new Gson();
        this.apiUrl = plugin.getConfig().getString("api.url");
        this.apiSecret = plugin.getConfig().getString("api.secret");
    }

    public CompletableFuture<SpawnResponse> requestSpawn() {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/minecraft/spawn";

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create("{}", JSON))
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Spawn request failed: " + response.code());
                    return null;
                }

                final String body = response.body().string();
                return gson.fromJson(body, SpawnResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Spawn request error: " + e.getMessage());
                return null;
            }
        });
    }

    public CompletableFuture<ClaimResponse> claimCat(String wallet, String catUuid, String dna) {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/minecraft/claim";

            final JsonObject payload = new JsonObject();
            payload.addProperty("wallet", wallet);
            payload.addProperty("catUuid", catUuid);
            payload.addProperty("dna", dna);

            final RequestBody body = RequestBody.create(
                gson.toJson(payload),
                JSON
            );

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Claim request failed: " + response.code());
                    return null;
                }

                final String responseBody = response.body().string();
                return gson.fromJson(responseBody, ClaimResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Claim request error: " + e.getMessage());
                return null;
            }
        });
    }

    public CompletableFuture<ChallengeResponse> createBattleChallenge(String challenger, String challenged, int challengerCatId, int challengedCatId) {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/battle/challenge";

            final JsonObject payload = new JsonObject();
            payload.addProperty("challenger", challenger);
            payload.addProperty("challenged", challenged);
            payload.addProperty("challengerCatId", challengerCatId);
            payload.addProperty("challengedCatId", challengedCatId);

            final RequestBody body = RequestBody.create(gson.toJson(payload), JSON);

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Battle challenge request failed: " + response.code());
                    return null;
                }

                final String responseBody = response.body().string();
                return gson.fromJson(responseBody, ChallengeResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Battle challenge error: " + e.getMessage());
                return null;
            }
        });
    }

    public CompletableFuture<AcceptResponse> acceptBattleChallenge(String battleId, String accepter) {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/battle/accept";

            final JsonObject payload = new JsonObject();
            payload.addProperty("battleId", battleId);
            payload.addProperty("accepter", accepter);

            final RequestBody body = RequestBody.create(gson.toJson(payload), JSON);

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Battle accept request failed: " + response.code());
                    return null;
                }

                final String responseBody = response.body().string();
                return gson.fromJson(responseBody, AcceptResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Battle accept error: " + e.getMessage());
                return null;
            }
        });
    }

    public CompletableFuture<BattleResultResponse> reportBattleResult(String battleId, String winner, String loser, String reason) {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/battle/result";

            final JsonObject payload = new JsonObject();
            payload.addProperty("battleId", battleId);
            payload.addProperty("winner", winner);
            payload.addProperty("loser", loser);
            payload.addProperty("reason", reason);

            final RequestBody body = RequestBody.create(gson.toJson(payload), JSON);

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Battle result request failed: " + response.code());
                    return null;
                }

                final String responseBody = response.body().string();
                return gson.fromJson(responseBody, BattleResultResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Battle result error: " + e.getMessage());
                return null;
            }
        });
    }

    public CompletableFuture<InventoryResponse> getInventory(String wallet) {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/player/" + wallet + "/inventory";

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .get()
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Inventory request failed: " + response.code());
                    return null;
                }

                final String responseBody = response.body().string();
                return gson.fromJson(responseBody, InventoryResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Inventory request error: " + e.getMessage());
                return null;
            }
        });
    }

    public CompletableFuture<SetActiveResponse> setActiveCat(String wallet, int tokenId) {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/player/setactive";

            final JsonObject payload = new JsonObject();
            payload.addProperty("playerWallet", wallet);
            payload.addProperty("tokenId", tokenId);

            final RequestBody body = RequestBody.create(gson.toJson(payload), JSON);

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Set active cat request failed: " + response.code());
                    return null;
                }

                final String responseBody = response.body().string();
                return gson.fromJson(responseBody, SetActiveResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Set active cat error: " + e.getMessage());
                return null;
            }
        });
    }

    public CompletableFuture<DeleteCatResponse> deleteCat(int tokenId, String wallet) {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/cat/" + tokenId;

            final JsonObject payload = new JsonObject();
            payload.addProperty("ownerWallet", wallet);

            final RequestBody body = RequestBody.create(gson.toJson(payload), JSON);

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .addHeader("Content-Type", "application/json")
                .delete(body)
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Delete cat request failed: " + response.code());
                    return null;
                }

                final String responseBody = response.body().string();
                return gson.fromJson(responseBody, DeleteCatResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Delete cat error: " + e.getMessage());
                return null;
            }
        });
    }

    // Response classes
    public static class SpawnResponse {
        public boolean canSpawn;
        public String dna;
        public String message;
    }

    public static class ClaimResponse {
        public boolean success;
        public int tokenId;
        public String transactionHash;
        public String catName;
        public CatStats stats;
        public int rarityScore;
        public String error;
    }

    public static class ChallengeResponse {
        public boolean success;
        public String battleId;
        public String expiresAt;
        public CatInfo challengerCat;
        public CatInfo challengedCat;
        public String error;
    }

    public static class AcceptResponse {
        public boolean success;
        public String startTime;
        public String battleId;
        public String message;
        public String error;
    }

    public static class BattleResultResponse {
        public boolean success;
        public String result; // "win" or "draw"
        public int childTokenId;
        public String childName;
        public CatStats childStats;
        public int childGeneration;
        public int childRarityScore;
        public Integer deletedCatId;
        public String deletedCatName;
        public int loserCatId;
        public String cooldownUntil;
        public String message;
        public String error;
    }

    public static class InventoryResponse {
        public CatInventoryItem[] cats;
        public Integer activeCatId;
        public int count;
        public int maxCount;
    }

    public static class SetActiveResponse {
        public boolean success;
        public Integer previousActiveCatId;
        public CatInfo newActiveCat;
        public String error;
    }

    public static class DeleteCatResponse {
        public boolean success;
        public int deletedTokenId;
        public String deletedCatName;
        public String message;
        public String error;
    }

    // Nested classes for response data
    public static class CatStats {
        public int speed;
        public int strength;
        public int defense;
        public int regen;
        public int luck;
    }

    public static class CatInfo {
        public int tokenId;
        public String name;
        public CatStats stats;
        public int rarityScore;
    }

    public static class CatInventoryItem {
        public int tokenId;
        public String name;
        public CatStats stats;
        public int generation;
        public int rarityScore;
        public boolean isActive;
        public String cooldownUntil;
        public boolean canBattle;
        public boolean isGenesis;
        public String textureUrl;
    }
}
