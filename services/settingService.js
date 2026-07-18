import { SETTINGS_DEFAULTS } from "../server/constants.js";

function buildSettingsService({ db, encryptionService }) {
    const cache = new Map();

    async function initialize() {
        await ensureDefaults();
        await load();
    }

    async function ensureDefaults() {
        for (const setting of SETTINGS_DEFAULTS) {
            const {success, data, message} = await db.settingRepository.findByKey(setting.key);
        
            if (success && !data) {
                await db.settingRepository.createSetting(setting);
            }
        }
    }

    async function load() {
        const {success, data, message} = await db.settingRepository.getAllSettings();

        if (!success) {
            return {
                success,
                message
            };
        }

        cache.clear();

        for (const setting of data) {
            cache.set(setting.setting_key, 
                {
                    settingValue: setting.setting_value,
                    settingKey: setting.setting_key,
                    settingType: setting.setting_type,
                    description: setting.description
                }
            );
        }

        return {
            success: true
        }
    }

    async function get(key) {
        const setting = cache.get(key);

        if (!setting) {
            return {
                success: false,
                message: "There is no setting with that key"
            };
        }
        switch (setting.settingType) {

            case SETTING_TYPES.NUMBER: 
                return {
                    success: true,
                    data: Number(setting.settingValue)
                };

            case SETTING_TYPES.BOOLEAN:
                return {
                    success: true,
                    data: setting.settingValue === "true"
                };

            case SETTING_TYPES.JSON:
                return {
                    success: true,
                    data: JSON.parse(setting.settingValue)
                };
            
            case SETTING_TYPES.PASSWORD:
                return {
                    success: true,
                    data: encryptionService.decrypt(setting.settingValue)
                };
            
            case SETTING_TYPES.STRING:
            default:
                return {
                    success: true,
                    data: setting.settingValue
                };
        }
    }

    async function set({key, value}) {
        const setting = cache.get(key);

        if (!setting) {
            return {
                success: false,
                message: "Unknown setting"
            }
        }

        let storedValue;

        switch (setting.settingType) {
            case SETTING_TYPES.NUMBER:
                storedValue = String(value);
                break;

            case SETTING_TYPES.BOOLEAN:
                storedValue = value ? 'true': 'false'
                break;
            
            case SETTING_TYPES.JSON:
                storedValue = JSON.stringify(value);
                break;
            
            case SETTING_TYPES.PASSWORD:
                storedValue = encryptionService.encrypt(value);
                break;
            
            case SETTING_TYPES.STRING:
            default:
                storedValue = value;
                break;
        }

        const dbData = await db.settingRepository.updateSetting({key, value: storedValue})
        setting.value = storedValue;

        return dbData;
    }

    return {
        initialize,
        load,
        get,
        set
    }
}

const SETTING_TYPES = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    JSON: 'json',
    PASSWORD: 'password'
}

export {SETTING_TYPES, buildSettingsService}