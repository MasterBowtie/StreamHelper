export class SettingRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async createSetting({key, value, type, description}) {
        const [result] = await this.pool.execute(
            `INSERT INTO settings
            (setting_key, setting_value, setting_type, description)
            VALUES (?, ?, ?, ?)`, 
            [key, value, type, description]);

        return result.insertId;
    }

    async updateSetting({key, value, type, description}) {
        const result = await this.pool.execute(
            `UPDATE settings SET
                setting_value = ?,
                setting_type = ?,
                description = ?
                WHERE setting_key = ? 
            `, [value, type, description, key])

        return result.affectedRows === 1;
    }

    async getSetting(settingKey) {
        const [rows] = await this.pool.execute(
            `SELECT setting_value, setting_type, description
            FROM settings
            WHERE setting_key = ?`,
            [settingKey]
        );

        return rows[0] ?? null;
    }

    async getAllSettings() {
        const [rows] = await this.pool.execute(
            `SELECT setting_key, setting_value, setting_type, description
            FROM settings`);
    
        return rows;
    }

    async removeSetting(settingKey) {
        const result = await this.pool.execute(
            `DELETE FROM settings 
            WHERE setting_key = ?`,
            [settingKey]
        );

        return result.affectedRows === 1;
    }
}