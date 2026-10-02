import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"; 
import { buildTwitchAuthService } from "../../twitch/twitchAuthService.js";
import { twitchConfig } from "../../twitch/twitchConfig.js";
import { buildPublicTwitchAuthService } from "../../twitch/publicTwitchAuthService.js"
import { buildPrivateTwitchAuthService } from "../../twitch/privateTwitchAuthService.js";
import { SETTINGS_DEFAULTS } from "../../server/constants.js";

let twitchAuthService;
let publicTwitchAuth;
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
    components = {
        db: vi.fn(),
        services: {
            settingService: {
                get: vi.fn()
            }
        },
        websocket: vi.fn(),
    }
    publicTwitchAuth = buildPublicTwitchAuthService(components);
    privateTwitchAuth = buildPrivateTwitchAuthService(components);
    twitchAuthService = buildTwitchAuthService(components);

    components.services.settingService.get.mockImplementation(async (key, section) => {
    const settings = {
        "twitch.clientId": {
                key: 'clientId',
                section: "twitch",
                value: '1234thisisatest',
                type: "string",
                description: "Twitch application client ID"
            },
        "twitch.clientType": {
                key: "clientType",
                section: "twitch",
                value: "private",
                type: "string",
                description: "Twitch"
            },
    };

    return settings[`${section}.${key}`];
});
})

describe("GetLoginURL", () => {
    it("return a valid URL", async () => {
        const url = await privateTwitchAuth.getLoginUrl();

        // Basic Test
        expect(()=> new URL(url)).not.toThrow();
    });

    it("uses the Twitch authorization endpoint", async () => {
        const url = new URL(await privateTwitchAuth.getLoginUrl());

        expect(url.origin + url.pathname).toBe(twitchConfig.oauth.authUrl)
    });

    it("includes the configured client id", async () => {
        const url = new URL(await privateTwitchAuth.getLoginUrl());
        let clientId = await components.services.settingService.get("clientId", "twitch");
        
        expect(url.searchParams.get("client_id")).toBe(clientId.value);
    })

    it("includes the redirect URI", async () => {
        const url = new URL(await privateTwitchAuth.getLoginUrl());

        expect(url.searchParams.get("redirect_uri")).toBe(twitchConfig.redirectUri);
    })

    it("requests an authorization code", async () => {
        const url = new URL(await privateTwitchAuth.getLoginUrl());

        expect(url.searchParams.get("response_type")).toBe("code");
    })

    it("includes all configured scopes", async () => {
        const url = new URL(await privateTwitchAuth.getLoginUrl());

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
        const result = await privateTwitchAuth.exchangeCodeForToken("test-code");

        expect(fetch).toHaveBeenCalledWith(
            twitchConfig.oauth.tokenUrl,
            expect.objectContaining({
                method: "POST"
            })
        );

        expect(result.data).toEqual({
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

        let result = await privateTwitchAuth.exchangeCodeForToken("bad-code")

        expect(result.success).toEqual(false);
    });
})

