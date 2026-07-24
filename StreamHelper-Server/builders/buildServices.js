import { buildEncryptionService } from "../services/encryptionService.js";
import { buildSettingsService } from "../services/settingService.js";
import { buildTwitchUserService } from "../services/twitchUserService.js";

export function buildServices({db}) {
    const encryptionService = buildEncryptionService({key: process.env.ENCRYPTION_KEY});

    const settingService = buildSettingsService({db, encryptionService});
    
    const twitchUserService = buildTwitchUserService({db});


    async function initialize() {
        await settingService.initialize();

        console.log("Services Initialized...");
    }
    
    return {
        initialize,
        twitchUserService,
        encryptionService,
        settingService,
    }
}