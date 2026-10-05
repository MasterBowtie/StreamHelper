import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"; 

import { buildTwitchAuthService } from "../../twitch/twitchAuthService.js";
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

beforeEach(() => {
    global.fetch = vi.fn();

    components = {
        db: {
            twitchUserRepository: {
                updateBroadcaster: vi.fn()
            }
        },
        services: {
            settingService: {
                get: vi.fn().mockImplementation(async (key, section) => {
                    const settings = {
                        "twitch.clientId": "1234thisisatest",
                        "twitch.clientType": "public",
                        "twitch.clientSecret": "thisisatest1234"
                    };

                    return {
                        success: true,
                        data: settings[`${section}.${key}`]
                    };
                })
            }
        },
        websocket: vi.fn()
    };

    publicTwitchAuth = {
        pollDeviceToken: vi.fn()
    };

    privateTwitchAuth = {
        exchangeCodeForToken: vi.fn()
    };

    twitchAuthService = buildTwitchAuthService({
        ...components,
        publicTwitchAuth,
        privateTwitchAuth
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});


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
                            data: "private"
                        },
                        clientId: {
                            success: true,
                            data: "1234thisisatest"
                        },
                        clientSecret: {
                            success: true,
                            data: "thisisatest1234"
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
                            data: "public"
                        },
                        "twitch.clientId": {
                            success: true,
                            data: "1234thisisatest"
                        },
                        "twitch.clientSecret": {
                            success: true,
                            data: "thisisatest1234"
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
                publicTwitchAuth.pollDeviceToken = vi.fn().mockResolvedValue({
                    success: false,
                    message: "Invalid device code"
                });

                const authRequest = {
                    type: "public",
                    deviceCode: "bad-device-code"
                };

                const result =
                    await twitchAuthService.authenticateBroadcaster(authRequest);

                expect(publicTwitchAuth.pollDeviceToken)
                    .toHaveBeenCalledWith("bad-device-code");

                expect(fetch).not.toHaveBeenCalled();

                expect(result).toEqual({
                    success: false,
                    message: "Invalid device code"
                });
            });
        });


        describe("private authentication", () => {
            it("exchanges the authorization code", async () => {
                privateTwitchAuth.exchangeCodeForToken = vi.fn().mockResolvedValue({
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
                    type: "private",
                    code: "test-auth-code"
                };

                await twitchAuthService.authenticateBroadcaster(authRequest);

                expect(privateTwitchAuth.exchangeCodeForToken)
                    .toHaveBeenCalledWith("test-auth-code");
            });

            it("returns the token error", async () => {
                privateTwitchAuth.exchangeCodeForToken.mockResolvedValue({
                    success: false,
                    message: "Invalid authorization code"
                });

                const authRequest = {
                    type: "private",
                    code: "bad-auth-code"
                };

                const result =
                    await twitchAuthService.authenticateBroadcaster(authRequest);

                expect(privateTwitchAuth.exchangeCodeForToken)
                    .toHaveBeenCalledWith("bad-auth-code");

                expect(fetch).not.toHaveBeenCalled();

                expect(result).toEqual({
                    success: false,
                    message: "Invalid authorization code"
                });
            });
        });

        it("returns an error for an unsupported authentication type", async () => {
            const authRequest = {
                type: "magic",
            };

            const result =
                await twitchAuthService.authenticateBroadcaster(authRequest);

            expect(publicTwitchAuth.pollDeviceToken)
                .not.toHaveBeenCalled();

            expect(privateTwitchAuth.exchangeCodeForToken)
                .not.toHaveBeenCalled();

            expect(result).toEqual({
                success: false,
                message: "Twitch Auth: Unsupported authentication type magic"
            });
        });

        it("returns the Twitch user error", async () => {
            publicTwitchAuth.pollDeviceToken.mockResolvedValue({
                success: true,
                data: {
                    accessToken: "access321",
                    refreshToken: "refresh321",
                    expiresIn: 3600
                }
            });

            mockFetch(false, {
                message: "Failed to fetch Twitch user"
            });

            const authRequest = {
                type: "public",
                deviceCode: "test-device-code"
            };

            const result =
                await twitchAuthService.authenticateBroadcaster(authRequest);

            expect(publicTwitchAuth.pollDeviceToken)
                .toHaveBeenCalledWith("test-device-code");

            expect(fetch).toHaveBeenCalled();

            expect(
                components.db.twitchUserRepository.updateBroadcaster
            ).not.toHaveBeenCalled();

            expect(result).toEqual({
                success: false,
                message: "Failed to fetch Twitch user"
            });
        });

        it("updates the broadcaster in the database", async () => {
            publicTwitchAuth.pollDeviceToken.mockResolvedValue({
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

            expect(components.db.twitchUserRepository.updateBroadcaster)
                .toHaveBeenCalledWith({
                    twitchUser: {
                        twitchId: "141981764",
                        login: "mctesterson",
                        displayName: "McTesterson"
                    },
                    token: {
                        accessToken: "access321",
                        refreshToken: "refresh321",
                        expiresIn: 3600
                    }
                });
        });

        it("returns the authenticated broadcaster data", async () => {
            publicTwitchAuth.pollDeviceToken.mockResolvedValue({
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

            const result =
                await twitchAuthService.authenticateBroadcaster(authRequest);

            expect(result).toEqual({
                success: true,
                data: {
                    twitchUser: {
                        twitchId: "141981764",
                        login: "mctesterson",
                        displayName: "McTesterson"
                    },
                    token: {
                        accessToken: "access321",
                        refreshToken: "refresh321",
                        expiresIn: 3600
                    }
                }
            });
        });
    })
})
