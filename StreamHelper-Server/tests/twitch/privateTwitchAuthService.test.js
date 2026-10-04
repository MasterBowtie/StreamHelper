import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"; 
import { twitchConfig } from "../../twitch/twitchConfig.js";
import { buildPrivateTwitchAuthService } from "../../twitch/privateTwitchAuthService.js";


let privateTwitchAuth;
let components;

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
    global.fetch = vi.fn();
    components = {
        db: vi.fn(),
        services: {
            settingService: {
                get: vi.fn()
            }
        },
        websocket: vi.fn(),
    }
    privateTwitchAuth = buildPrivateTwitchAuthService(components);

    components.services.settingService.get.mockImplementation(
        async (key, section) => {
            const settings = {
                "twitch.clientId": "1234thisisatest",
                "twitch.clientType": "public",
                "twitch.clientSecret": "thisisatest1234"
            };

            return {
                success: true,
                data: settings[`${section}.${key}`]
            };
        }
    );
})


describe("PrivateTwitchAuth", ()=> {
    describe("GetLoginURL", () => {
        it("returns a the Twitch login URL", async () => {
            const result = await privateTwitchAuth.getLoginUrl();

            expect(components.services.settingService.get)
                .toHaveBeenCalledWith("clientId", "twitch");

            const url = new URL(result);

            expect(url.origin + url.pathname)
                .toBe(twitchConfig.oauth.authUrl);

            expect(url.searchParams.get("client_id"))
                .toBe("1234thisisatest");

            expect(url.searchParams.get("redirect_uri"))
                .toBe(twitchConfig.redirectUri);

            expect(url.searchParams.get("response_type"))
                .toBe("code");

            expect(url.searchParams.get("scope"))
                .toBe(twitchConfig.scopes.join(" "));
        });

        it("returns a setting error", async () => {
            components.services.settingService.get.mockResolvedValue({
                success: false,
                message: "Failed to get client ID"
            });

            const result = await privateTwitchAuth.getLoginUrl();

            expect(components.services.settingService.get)
                .toHaveBeenCalledWith("clientId", "twitch");

            expect(result).toEqual({
                success: false,
                message: "Failed to get client ID"
            });
        });

    })

    describe("ExchangeCodeForToken", () => {
        it("exchanges the authorization code for a token", async () => {
            mockFetch(true, {
                access_token: "access-token-123",
                refresh_token: "refresh-token-123",
                expires_in: 3600
            });

            const result = await privateTwitchAuth.exchangeCodeForToken(
                "auth-code-123"
            );

            expect(components.services.settingService.get)
                .toHaveBeenCalledWith("clientId", "twitch");

            expect(components.services.settingService.get)
                .toHaveBeenCalledWith("clientSecret", "twitch");

            expect(fetch).toHaveBeenCalledWith(
                twitchConfig.oauth.tokenUrl,
                expect.objectContaining({
                    method: "POST"
                })
            );

            expect(result).toEqual({
                success: true,
                data: {
                    accessToken: "access-token-123",
                    refreshToken: "refresh-token-123",
                    expiresIn: 3600
                }
            });
        });

        it("returns a Twitch error", async () => {
            mockFetch(false, {
                message: "Invalid authorization code"
            });

            const result = await privateTwitchAuth.exchangeCodeForToken(
                "bad-auth-code"
            );

            expect(fetch).toHaveBeenCalledWith(
                twitchConfig.oauth.tokenUrl,
                expect.objectContaining({
                    method: "POST"
                })
            );

            expect(result).toEqual({
                success: false,
                message: "Private Auth: Failed to exchange code for token",
                data: JSON.stringify({
                    message: "Invalid authorization code"
                })
            });
        });

        it("returns a client ID setting error", async () => {
            components.services.settingService.get.mockImplementationOnce(
                async () => ({
                    success: false,
                    message: "Failed to get client ID"
                })
            );

            const result = await privateTwitchAuth.exchangeCodeForToken(
                "auth-code-123"
            );

            expect(components.services.settingService.get)
                .toHaveBeenCalledWith("clientId", "twitch");

            expect(fetch).not.toHaveBeenCalled();

            expect(result).toEqual({
                success: false,
                message: "Failed to get client ID"
            });
        });

        it("returns a client secret setting error", async () => {
            components.services.settingService.get
                .mockImplementationOnce(async () => ({
                    success: true,
                    data: "1234thisisatest"
                }))
                .mockImplementationOnce(async () => ({
                    success: false,
                    message: "Failed to get client secret"
                }));

            const result = await privateTwitchAuth.exchangeCodeForToken(
                "auth-code-123"
            );

            expect(components.services.settingService.get)
                .toHaveBeenNthCalledWith(1, "clientId", "twitch");

            expect(components.services.settingService.get)
                .toHaveBeenNthCalledWith(2, "clientSecret", "twitch");

            expect(fetch).not.toHaveBeenCalled();

            expect(result).toEqual({
                success: false,
                message: "Failed to get client secret"
            });
        });
    })
    
})
