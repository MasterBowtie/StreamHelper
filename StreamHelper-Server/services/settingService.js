import { SETTINGS_DEFAULTS } from "../server/constants.js";

function buildSettingsService({ db, encryptionService }) {
    const cache = new Map();

    async function initialize() {
        await ensureDefaults();
        await load();
    }

    async function ensureDefaults() {
        for (const setting of SETTINGS_DEFAULTS) {
            const data = await db.settingRepository.findByKey(setting.key, setting.section);
            if (!data) {
                await db.settingRepository.createSetting(setting);
            }
        }
    }

    async function load() {
        const data = await db.settingRepository.getAllSettings();

        cache.clear();

        for (const setting of data) {
            cache.set(`${setting.section}.${setting.setting_key}`, 
                {
                    section: setting.section,
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

    async function get(key, section) {
        const setting = cache.get(`${section}.${key}`);

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

    async function getAll() {
        const results = [];

        for (const key of cache.keys()) {
            let k = key.split(".")
            let data = await get(k[1], k[0]);
            let value = cache.get(key)
            if (data.success) {
                value.settingValue = data.data
                results.push(value);
            }
        }
        return results;
    }

    async function getSection(section) {
        const results = [];

        for (const key of cache.keys()) {
            let value = cache.get(key);
            if (section === value.section) {
                let k = key.split(".")
                let data = await get(k[1], k[0]);
                if (data.success) {
                    value.settingValue = data.data
                    results.push(value);
                }
            }
        }
        return results;
    }

    async function set({key, section, value}) {
        const setting = cache.get(`${key}.${section}`);

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

        // FIXME
        let data = {key: setting.settingKey, section: setting.section, value: storedValue}
        console.log(data);

        // const dbData = await db.settingRepository.updateSetting()
        setting.value = storedValue;

        // return dbData;
    }

    return {
        initialize,
        load,
        get,
        getAll,
        getSection,
        set,
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