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
                "twitch.clientId": {
                    key: "clientId",
                    section: "twitch",
                    value: "1234thisisatest",
                    type: "string",
                    description: "Twitch application client ID"
                }
            };

            return settings[`${section}.${key}`];
        }
    );

    publicTwitchAuth = buildPublicTwitchAuthService(components);
});


afterEach(() => {
    vi.restoreAllMocks();
});

describe("PublicTwitchAuthService", () => {

    describe("startDeviceAuth", () => {

        it("starts device authentication", async () => {
        });

        it("returns a setting error", async () => {
        });

        it("returns a Twitch error", async () => {
        });

    });


    describe("pollDeviceToken", () => {

        it("returns the device token", async () => {
        });

        it("returns a pending result", async () => {
        });

        it("returns a Twitch error", async () => {
        });

        it("returns a setting error", async () => {
        });

    });


    describe("awaitDeviceToken", () => {

        it("returns the token when authentication succeeds", async () => {
        });

        it("returns an error when polling fails", async () => {
        });

        it("returns an expired result when the token expires", async () => {
        });

    });

});