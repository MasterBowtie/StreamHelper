export class SettingRepository {
    constructor(db) {
        this.db = db;
    }

    createSetting({key, section, value, type, description}) {
        const statement = this.db.prepare(
            `INSERT INTO settings
            (setting_key, section, setting_value, setting_type, description)
            VALUES (?, ?, ?, ?, ?)`
        );

        const result = statement.run(key, section, value, type, description);

        return result.lastInsertRowid;
    }

    updateSetting({key, section, value, type, description}) {
        let query = `UPDATE settings SET `;
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
        query += " WHERE setting_key = ? AND section = ?";

        const result = this.db.prepare(query).run(...values);

        return result.changes === 1;
    }

    findByKey(settingKey, section) {
        const statement = this.db.prepare(
            `SELECT setting_value, setting_type, description
            FROM settings
            WHERE setting_key = ? AND section = ?`
        );
        return statement.get(settingKey, section) ?? null;
    }

    getBySection(section) {
        const statement = this.db.prepare(
            `SELECT section, setting_key, setting_value, setting_type, description
            FROM settings
            WHERE section = ?
            ORDER BY section, setting_key`
        );

        return statement.all(section);
    }

    getSections() {
        const statement = this.db.prepare(
            `SELECT section FROM settings GROUP BY section`
        );

        return statement.all();
    }

    getAllSettings() {
        const statement = this.db.prepare(
            `SELECT section, setting_key, setting_value, setting_type, description
            FROM setting
            ORDER BY section, setting_key`
        );

        return statement.all();
    }

    removeByKey(settingKey, section) {
        const result = this.db.prepare(
            `DELETE FROM settings
            WHERE setting_key = ? and section = ?`
        ).run(settingKey, section);

        return result.changes === 1;
    }
}