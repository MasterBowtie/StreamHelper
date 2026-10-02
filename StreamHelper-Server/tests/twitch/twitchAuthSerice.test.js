import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"; 

import { buildTwitchAuthService } from "../../twitch/twitchAuthService.js";
import { buildPublicTwitchAuthService } from "../../twitch/publicTwitchAuthService.js"
import { buildPrivateTwitchAuthService } from "../../twitch/privateTwitchAuthService.js";
import { twitchConfig } from "../../twitch/twitchConfig.js";

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
        db: {
            twitchUserRepository: {
                updateBroadcaster: vi.fn()
            }
        },
        services: {
            settingService: {
                get: vi.fn()
            }
        },
        websocket: vi.fn(),
    }


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
                value: "public",
                type: "string",
                description: "Twitch"
            },
        "twitch.clientSecret": {
                key: "clientSecret",
                section: "twitch",
                value: "thisisatest1234",
                type: "password",
                description: "Private Twitch application client secret"
            }
    };

    return settings[`${section}.${key}`];
    });

    publicTwitchAuth = buildPublicTwitchAuthService(components);
    privateTwitchAuth = buildPrivateTwitchAuthService(components);
    twitchAuthService = buildTwitchAuthService({...components, publicTwitchAuth, privateTwitchAuth});
})


describe("TwitchAuthService", ()=>{
    describe("FetchTwitchUser",()=>{
        it("returns Twitch user data", async ()=>{
            mockFetch(true, {
                data: [{
                    id: "141981764",
                    login: "mctesterson",
                    display_name: "McTesterson",
                    type: "user",
                    broadcaster_type: "partner",
                    description: "A Twitch user",
                    profile_image_url: "https://...",
                    offline_image_url: "https://...",
                    view_count: 12345,
                    created_at: "2020-01-01T00:00:00Z"
                }]
            });
            const result = await twitchAuthService.fetchTwitchUser("good_token");

            expect(components.services.settingService.get)
                .toHaveBeenCalledWith("clientId", "twitch");

            expect(fetch).toHaveBeenCalledWith(
                `${twitchConfig.helix.baseUrl}/users`,
                {
                    headers: {
                        "Client-Id": "1234thisisatest",
                        "Authorization": "Bearer good_token"
                    }
                }
            );

            expect(result).toEqual({
                success: true,
                data: {
                    twitchId: "141981764",
                    login: "mctesterson",
                    displayName: "McTesterson"
                }
            });
        })
    
        it("returns an error when Twitch rejects the token", async () => {
            mockFetch(false, null);
        
            const result = await twitchAuthService.fetchTwitchUser("bad_token");
        
            expect(result).toEqual({
                success: false,
                message: "Failed to fetch Twitch user"
            });
        });
    
        it("returns an error when Twitch returns empty data", async () => {
            mockFetch(true, {
                data: []
            });

            const result = await twitchAuthService.fetchTwitchUser("empty_token");

            expect(result).toEqual({
                success: false,
                message: "User not found"
            });
        });
    })

    describe("RefreshAccessToken", ()=>{
        it("returns an error when Twitch rejects the refresh token", async () => {
            mockFetch(false, {
                message: "Invalid refresh token"
            });

            const result = await twitchAuthService.refreshAccessToken("bad-token");

            expect(result).toEqual({
                success: false,
                message: "RefreshAccessToken: Invalid refresh token"
            });
        });

        it("handles a client type setting error", async () => {
            components.services.settingService.get.mockImplementation(
                async (key, section) => {
                    if (key === "clientType" && section === "twitch") {
                        return {
                            success: false,
                            message: "Failed to get client type"
                        }
                    }
                    return {
                        success: true,
                        value: "1234thisisatest",
                    }
                }
            );

            const result = await twitchAuthService.refreshAccessToken("test-token");

            expect(result).toEqual({
                success: false,
                message: "Failed to get client type"
            });
        });

        it("handles a client ID setting error", async () => {
            components.services.settingService.get.mockImplementation(
                async (key, section) => {
                    if (key === "clientId" && section === "twitch") {
                        return {
                            success: false,
                            message: "Failed to get client ID"
                        }
                    }
                    return {
                        success: true,
                        value: "1234thisisatest",
                    }
                }
            );

            const result = await twitchAuthService.refreshAccessToken("test-token");

            expect(result).toEqual({
                success: false,
                message: "Failed to get client ID"
            });
        });

        it("includes client secret for private authentication", async () => {
            components.services.settingService.get.mockImplementation(
                async (key, section) => {
                    const settings = {
                        clientType: {
                            success: true,
                            value: "private"
                        },
                        clientId: {
                            success: true,
                            value: "1234thisisatest"
                        },
                        clientSecret: {
                            success: true,
                            value: "thisisatest1234"
                        }
                    };
                
                    return settings[key];
                }
            );
        
            mockFetch(true, {
                access_token: "access321",
                refresh_token: "refresh321",
                expires_in: 3600
            });
        
            await twitchAuthService.refreshAccessToken("test-token");
        
            const request = fetch.mock.calls[0][1];
        
            const body = new URLSearchParams(request.body);
        
            expect(body.get("client_id")).toBe("1234thisisatest");
            expect(body.get("grant_type")).toBe("refresh_token");
            expect(body.get("refresh_token")).toBe("test-token");
            expect(body.get("client_secret")).toBe("thisisatest1234");
        });

        it("does not include client secret for public authentication", async () => {
            components.services.settingService.get.mockImplementation(
                async (key, section) => {
                    const settings = {
                        "twitch.clientType": {
                            success: true,
                            value: "public"
                        },
                        "twitch.clientId": {
                            success: true,
                            value: "1234thisisatest"
                        },
                        "twitch.clientSecret": {
                            success: true,
                            value: "thisisatest1234"
                        }
                    };
                
                    return settings[`${section}.${key}`];
                }
            );
        
            mockFetch(true, {
                access_token: "access321",
                refresh_token: "refresh321",
                expires_in: 3600
            });
        
            await twitchAuthService.refreshAccessToken("test-token");
        
            const request = fetch.mock.calls[0][1];
            const body = new URLSearchParams(request.body);
        
            expect(body.get("client_id")).toBe("1234thisisatest");
            expect(body.get("grant_type")).toBe("refresh_token");
            expect(body.get("refresh_token")).toBe("test-token");
            expect(body.has("client_secret")).toBe(false);
        });
    })

    describe("AuthenticateBroadcaster", ()=>{
        describe("public authentication", () => {
            it("polls for the device token", async () => {
                publicTwitchAuth.pollDeviceToken = vi.fn().mockResolvedValue({
                    success: true,
                    data: {
                        accessToken: "access321",
                        refreshToken: "refresh321",
                        expiresIn: 3600
                    }
                });

                mockFetch(true, {
                    data: [{
                        id: "141981764",
                        login: "mctesterson",
                        display_name: "McTesterson"
                    }]
                });

                const authRequest = {
                    type: "public",
                    deviceCode: "test-device-code"
                };

                await twitchAuthService.authenticateBroadcaster(authRequest);

                expect(publicTwitchAuth.pollDeviceToken)
                    .toHaveBeenCalledWith("test-device-code");
            });

            it("returns the token error", async () => {
            });

        });


        describe("private authentication", () => {

            it("exchanges the authorization code", async () => {
            });

            it("returns the token error", async () => {
            });

        });


        it("returns an error for an unsupported authentication type", async () => {
        });

        it("returns the Twitch user error", async () => {
        });

        it("updates the broadcaster in the database", async () => {
        });

        it("returns the authenticated broadcaster data", async () => {
        });
    })
})
