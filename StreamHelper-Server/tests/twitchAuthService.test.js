import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"; 
import { buildTwitchAuthService } from "../server/twitch/twitchAuthService.js";
import { twitchConfig } from "../server/twitch/twitchConfig.js";

let twitchAuthService;

function mockFetch(ok, body) {
    global.fetch = vi.fn().mockResolvedValue({
        ok,
        json: vi.fn().mockResolvedValue(body)
    });
}

afterEach(()=> {
    vi.restoreAllMocks();
})
beforeEach(()=>{
    twitchAuthService = buildTwitchAuthService();
})

describe("GetLoginURL", () => {
    it("return a valid URL", () => {
        const url = twitchAuthService.getLoginUrl();

        // Basic Test
        expect(()=> new URL(url)).not.toThrow();
    });

    it("uses the Twitch authorization endpoint", () => {
        const url = new URL(twitchAuthService.getLoginUrl());

        expect(url.origin + url.pathname).toBe(twitchConfig.oauth.authUrl)
    });

    it("includes the configured client id", () => {
        const url = new URL(twitchAuthService.getLoginUrl());
        
        expect(url.searchParams.get("client_id")).toBe(twitchConfig.clientId);
    })

    it("includes the redirect URI", ()=> {
        const url = new URL(twitchAuthService.getLoginUrl());

        expect(url.searchParams.get("redirect_uri")).toBe(twitchConfig.redirectUri);
    })

    it("requests an authoriztion code", ()=> {
        const url = new URL(twitchAuthService.getLoginUrl());

        expect(url.searchParams.get("response_type")).toBe("code");
    })

    it("includes all configured scopes", () => {
        const url = new URL(twitchAuthService.getLoginUrl());

        expect(url.searchParams.get("scope")).toBe(twitchConfig.scopes.join(" "));
    })
})

describe("ExchangeCodeForToken", () => {
    it("return token data from Twitch", async () => {
        mockFetch(true, {
            access_token: "access123",
            refresh_token: "refresh123",
            expires_in: 3600
            })
        const result = await twitchAuthService.exchangeCodeForToken("test-code");

        expect(fetch).toHaveBeenCalledWith(
            twitchConfig.oauth.tokenUrl,
            expect.objectContaining({
                method: "POST"
            })
        );

        expect(result).toEqual({
            accessToken: "access123",
            refreshToken: "refresh123",
            expiresIn: 3600
        });
    });

    it("thows when Twitch rejects the code", async()=> {
        mockFetch(false, {
            status: 400,
            message: "Invalid authorization code"
        });

        await expect(twitchAuthService.exchangeCodeForToken("bad-code")).rejects.toThrow("Failed to exchange code for token")
    });
})

describe("RefreshAccessToken", ()=>{
    it("return token data from Twitch", async()=>{
        mockFetch(true, {
            access_token: "access321",
            refresh_token: "refresh321",
            expires_in: 3600
        });

        const result = await twitchAuthService.refreshAccessToken("test-token");

        expect(fetch).toHaveBeenCalledWith(
            twitchConfig.oauth.tokenUrl,
            expect.objectContaining({
                method: "POST"
            })
        );

        expect(result).toEqual({
            accessToken: "access321",
            refreshToken: "refresh321",
            expiresIn: 3600
        })
    })

    it("throws when Twitch rejects the code", async()=>{
        global.fetch = vi.fn().mockResolvedValue({
            ok: false
        })

        await expect(twitchAuthService.refreshAccessToken("bad-token")).rejects.toThrow('Failed to refresh access token')
    })
})

describe("FetchTwitchUser",()=>{
    it("return the Twitch user data", async()=>{
        mockFetch(true, {
            "data": [{
                "id": "141981764",
                "login": "mctesterson",
                "display_name": "McTesterson",
                "type": "user",
                "broadcaster_type": "partner",
                "description": "A Twitch user",
                "profile_image_url": "https://...",
                "offline_image_url": "https://...",
                "view_count": 12345,
                "created_at": "2020-01-01T00:00:00Z"
            }]
        });

        const result = await twitchAuthService.fetchTwitchUser("good_token");

        expect(fetch).toHaveBeenCalledWith(
            `${twitchConfig.helix.baseUrl}/users`,
            expect.objectContaining({
                headers: {
                    'Client-Id': twitchConfig.clientId,
                    'Authorization': `Bearer ${"good_token"}`
                }
            })
        );

        expect(result).toEqual({
            twitchId: "141981764",
            login: "mctesterson",
            displayName: "McTesterson"
        })
    })

    it("throws when Twitch rejects the token", async()=>{
        mockFetch(false, null)

        await expect(twitchAuthService.fetchTwitchUser("bad_token")).rejects.toThrow("Failed to fetch Twitch user");
    })

    it("throws when Twitch returns emtpy data", async()=>{
        mockFetch(true,{
            "data": []
        });

        await expect(twitchAuthService.fetchTwitchUser("emtpy_token")).rejects.toThrow("User not found");
    })
})