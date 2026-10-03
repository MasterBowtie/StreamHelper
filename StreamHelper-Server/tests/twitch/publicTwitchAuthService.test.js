import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { buildPublicTwitchAuthService } from "../../twitch/publicTwitchAuthService.js";
import { twitchConfig } from "../../twitch/twitchConfig.js";

let publicTwitchAuth;
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
        db: vi.fn(),

        services: {
            settingService: {
                get: vi.fn()
            }
        }
    };

    components.services.settingService.get.mockImplementation(
        async (key, section) => {
            const settings = {
                "twitch.clientId": "1234thisisatest",
                "twitch.clientType": "public",
            };

            return {
                success: true,
                data: settings[`${section}.${key}`]
            };
        }
    );

    publicTwitchAuth = buildPublicTwitchAuthService(components);
});


afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe("PublicTwitchAuthService", () => {

    describe("startDeviceAuth", () => {

        it("starts device authentication", async () => {
            mockFetch(true, {
                device_code: "device-code-123",
                user_code: "USER-123",
                expires_in: 1800,
                interval: 5
            });

            const result = await publicTwitchAuth.startDeviceAuth();

            expect(components.services.settingService.get).toHaveBeenCalledWith("clientId", "twitch");

            expect(fetch).toHaveBeenCalledWith(
                twitchConfig.oauth.deviceUrl,
                expect.objectContaining({
                    method: "POST"
                })
            );

            expect(result).toEqual({
                success: true,
                data: {
                    mode: "public",
                    deviceCode: "device-code-123",
                    userCode: "USER-123",
                    url: twitchConfig.oauth.activateUrl,
                    expiresIn: 1800,
                    interval: 5
                }
            })
        });

        it("returns a setting error", async () => {
            components.services.settingService.get.mockResolvedValue({
                success: false,
                message: "Failed to get client ID"
            });

            const result = await publicTwitchAuth.startDeviceAuth();

            expect(components.services.settingService.get)
                .toHaveBeenCalledWith("clientId", "twitch");

            expect(fetch).not.toHaveBeenCalled();

            expect(result).toEqual({
                success: false,
                message: "Failed to get client ID"
            });
        });

        it("returns a Twitch error", async () => {
            mockFetch(false, {
                message: "Invalid client ID"
            });

            const result = await publicTwitchAuth.startDeviceAuth();

            expect(fetch).toHaveBeenCalledWith(
                twitchConfig.oauth.deviceUrl,
                expect.objectContaining({
                    method: "POST"
                })
            );

            expect(result).toEqual({
                success: false,
                message: "Invalid client ID"
            });
        });
    });


    describe("pollDeviceToken", () => {

        it("returns the device token", async () => {
            mockFetch(true, {
                access_token: "access-token-123",
                refresh_token: "refresh-token-123",
                expires_in: 3600
            });

            const result = await publicTwitchAuth.pollDeviceToken("device-code-123");

            expect(components.services.settingService.get)
                .toHaveBeenCalledWith("clientId", "twitch");

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

        it("returns a pending result", async () => {
            mockFetch(false, {
                message: "authorization_pending"
            });

            const result = await publicTwitchAuth.pollDeviceToken("device-code-123");

            expect(result).toEqual({
                success: "pending"
            });
        });

        it("returns a Twitch error", async () => {
            mockFetch(false, {
                message: "Invalid device code"
            });

            const result = await publicTwitchAuth.pollDeviceToken("bad-device-code");

            expect(result).toEqual({
                success: false,
                message: "Invalid device code"
            });
        });

        it("returns a setting error", async () => {
            components.services.settingService.get.mockResolvedValue({
                success: false,
                message: "Failed to get client ID"
            });

            const result = await publicTwitchAuth.pollDeviceToken("device-code-123");

            expect(components.services.settingService.get)
                .toHaveBeenCalledWith("clientId", "twitch");

            expect(fetch).not.toHaveBeenCalled();

            expect(result).toEqual({
                success: false,
                message: "Failed to get client ID"
            });
        });

    });


    describe("awaitDeviceToken", () => {

        it("returns the token when authentication succeeds", async () => {
            mockFetch(true, {
                access_token: "access-token-123",
                refresh_token: "refresh-token-123",
                expires_in: 3600
            });

            const result = await publicTwitchAuth.awaitDeviceToken(
                "device-code-123",
                5,
                1800
            );

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

        it("returns an error when polling fails", async () => {
            mockFetch(false, {
                message: "Invalid device code"
            });

            const result = await publicTwitchAuth.awaitDeviceToken(
                "bad-device-code",
                5,
                1800
            );

            expect(result).toEqual({
                success: false,
                message: "Invalid device code"
            });
        });

        it("returns an expired result when the token expires", async () => {
            vi.useFakeTimers();

            mockFetch(false, {
                message: "authorization_pending"
            });

            const promise = publicTwitchAuth.awaitDeviceToken(
                "device-code-123",
                5,
                10
            );

            await vi.advanceTimersByTimeAsync(5000);
            await vi.advanceTimersByTimeAsync(5000);

            const result = await promise;

            expect(result).toEqual({
                success: false,
                message: "The token has expired"
            });

            vi.useRealTimers();
        });
    });

});