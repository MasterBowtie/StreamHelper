import { describe, it, expect, vi, afterEach } from "vitest"; 
import { exchangeCodeForToken, getLoginUrl, refreshAccessToken } from "../server/twitch/twitchAuthService.js";
import { twitchConfig } from "../server/twitch/twitchConfig.js";

afterEach(()=> {
    vi.restoreAllMocks();
})

describe("GetLoginURL", () => {
    it("return a valid URL", () => {
        const url = getLoginUrl();

        // Basic Test
        expect(()=> new URL(url)).not.toThrow();
    });

    it("uses the Twitch authorization endpoint", () => {
        const url = new URL(getLoginUrl());

        expect(url.origin + url.pathname).toBe(twitchConfig.oauth.authUrl)
    });

    it("includes the configured client id", () => {
        const url = new URL(getLoginUrl());
        
        expect(url.searchParams.get("client_id")).toBe(twitchConfig.clientId);
    })

    it("includes the redirect URI", ()=> {
        const url = new URL(getLoginUrl());

        expect(url.searchParams.get("redirect_uri")).toBe(twitchConfig.redirectUri);
    })

    it("requests an authoriztion code", ()=> {
        const url = new URL(getLoginUrl());

        expect(url.searchParams.get("response_type")).toBe("code");
    })

    it("includes all configured scopes", () => {
        const url = new URL(getLoginUrl());

        expect(url.searchParams.get("scope")).toBe(twitchConfig.scopes.join(" "));
    })
})

describe("ExchangeCodeForToken", () => {
    it("return token data from Twitch", async () => {
        global.fetch = vi.fn()
            .mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({
                    access_token: "access123",
                    refresh_token: "refresh123",
                    expires_in: 3600
                })
            });
        
        const result = await exchangeCodeForToken("test-code");

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
        global.fetch = vi.fn().mockResolvedValue({
            ok: false
        })

        await expect(exchangeCodeForToken("bad-code")).rejects.toThrow("Failed to exchange code for token")
    });
})

describe("RefreshAccessToken", ()=>{
    it("return token data from Twitch", async()=>{
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                access_token: "access321",
                refresh_token: "refresh321",
                expires_in: 3600
            })
        });

        const result = await refreshAccessToken("test-token");

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

        await expect(refreshAccessToken("bad-token")).rejects.toThrow('Failed to refresh access token')
    })
})