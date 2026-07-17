import { SETTINGS_DEFAULTS } from "../server/constants.js";

function buildSettingsService({ db, encryptionService }) {
    const cache = new Map();

    async function initialize() {
        await ensureDefaults();
        await load();
    }

    async function ensureDefaults() {
        for (const setting of SETTINGS_DEFAULTS) {
            const existing = await db.settingRepository.findByKey(setting.key);
        
            if (!existing) {
                await db.settingRepository.createSetting(setting);
            }
        }
    }

    async function load() {
        const settings = await db.settingRepository.getAllSettings();

        cache.clear();

        for (const setting of settings) {
            cache.set(setting.setting_key, 
                {
                    settingValue: setting.setting_value,
                    settingKey: setting.setting_key,
                    settingType: setting.setting_type,
                    description: setting.description
                }
            );
        }
    }

    async function get(key) {
        const setting = cache.get(key);

        if (!setting) {
            return null;
        }
        switch (setting.settingType) {

            case SETTING_TYPES.NUMBER: 
                return Number(setting.settingValue);

            case SETTING_TYPES.BOOLEAN:
                return setting.settingValue === "true";

            case SETTING_TYPES.JSON:
                return JSON.parse(setting.settingValue);
            
            case SETTING_TYPES.PASSWORD:
                return encryptionService.decrypt(setting.settingValue);
            
            case SETTING_TYPES.STRING:
            default:
                return setting.settingValue;
        }
    }

    async function set({key, value, type, description}) {
        const setting = cache.get(key);

        if (!setting) {
            throw new Error(`Unknown setting: ${key}`)
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

        await db.settingRepository.updateSetting({key, value: storedValue, type, description})
        setting.value = storedValue;
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