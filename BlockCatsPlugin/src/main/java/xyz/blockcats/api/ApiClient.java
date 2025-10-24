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

    public CompletableFuture<ClaimResponse> claimCat(String wallet, String catUuid) {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/minecraft/claim";

            final JsonObject payload = new JsonObject();
            payload.addProperty("wallet", wallet);
            payload.addProperty("catUuid", catUuid);

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
        public String error;
    }
}
