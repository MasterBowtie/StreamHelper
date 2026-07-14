import { buildEncryptionService } from "../services/encryptionService.js";
import { buildSettingsService } from "../services/settingService.js";
import { buildTwitchUserService } from "../services/twitchUserService.js";

export function buildServices({db}) {
    const encryptionService = buildEncryptionService();
    const twitchUserService = buildTwitchUserService({db});
    const settingService = buildSettingsService({db, encryptionService});
    
    return {
        twitchUserService,
        encryptionService,
        settingService,
    }
}