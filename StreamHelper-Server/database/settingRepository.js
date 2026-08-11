export class SettingRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async createSetting({key, section, value, type, description}) {
        const [result] = await this.pool.execute(
            `INSERT INTO settings
            (setting_key, section, setting_value, setting_type, description)
            VALUES (?, ?, ?, ?, ?)`, 
            [key, section, value, type, description]);

        return result.insertId;
    }

    async updateSetting({key, section, value, type, description}) {
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
        query += " WHERE setting_key = ? AND section = ?"
        values.push(key);
        values.push(section)
        const [result] = await this.pool.execute(query, values);

        return  result.affectedRows === 1;
    }

    async findByKey(settingKey, section) {
        const [rows] = await this.pool.execute(
            `SELECT setting_value, setting_type, description
            FROM settings
            WHERE setting_key = ? AND section = ?`,
            [settingKey, section]
        );

        return rows[0] ?? null;
    }

    async getBySection(section) {
        const [rows] = await this.pool.execute(
            `SELECT section, setting_key, setting_value, setting_type, description
            FROM settings WHERE section = ?
            ORDER by section, setting_key`,
            [section]
        );

        return rows 
    } 

    async getSections() {
        const [rows] = await this.pool.execute(
            `SELECT section FROM settings GROUP BY section`
        )
        return rows;
    }

    async getAllSettings() {
        const [rows] = await this.pool.execute(
            `SELECT section, setting_key, setting_value, setting_type, description
            FROM settings ORDER BY section, setting_key`);
    
        return rows;
    }

    async removeByKey(settingKey, section) {
        const result = await this.pool.execute(
            `DELETE FROM settings 
            WHERE setting_key = ? AND section = ?`,
            [settingKey, section]
        );

        return result.affectedRows === 1;
    }
}