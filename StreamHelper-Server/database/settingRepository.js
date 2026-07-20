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

        return {
            success: true,
            data: result.insertId
        };
    }

    async updateSetting({key, value, type, description}) {
        let query = `UPDATE settings SET `
        const values = [value];
        const updates = ['setting_value = ?'];

        if (type !== undefined) {
            values.push(type);
            updates.push('setting_type = ?');
        }
        if (description !== undefined) {
            values.push(description);
            updates.push('description = ?');
        }

        query += updates.join(", ");
        query += " WHERE setting_key = ?"
        values.push(key);
        const result = await this.pool.execute(query, values);

        return {
            success: true,
            data: result.affectedRows === 1
        };
    }

    async findByKey(settingKey) {
        const [rows] = await this.pool.execute(
            `SELECT setting_value, setting_type, description
            FROM settings
            WHERE setting_key = ?`,
            [settingKey]
        );

        return {
            success: true,
            data: rows[0] ?? null
        };
    }

    async getAllSettings() {
        const [rows] = await this.pool.execute(
            `SELECT setting_key, setting_value, setting_type, description
            FROM settings`);
    
        return {
            data: rows,
            success: true
        };
    }

    async removeByKey(settingKey) {
        const result = await this.pool.execute(
            `DELETE FROM settings 
            WHERE setting_key = ?`,
            [settingKey]
        );

        return {
            success: true,
            data: result.affectedRows === 1
        };
    }
}