export class StreamRepository {
    constructor(db) {
        this.db = db;
    }

    findById(id) {
        const result = this.db.prepare(
            `SELECT * FROM streams
            WHERE stream_id = ?`
        ).get(id);

        return result ?? null;
    }

    startStream({start_at}) {
        const result = this.db.prepare(
            `INSERT INTO streams (start_at) VALUES (?)`
        ).run(start_at)

        return result.lastInsertRowid;
    }

    findActive() {
        const result = this.db.prepare(
            `SELECT * FROM streams
            WHERE end_at IS NULL 
            LIMIT 1`
        ).get();
        return result ?? null;
    }

    endStream(id) {
        if (!id) {
            return;
        }
        const result = this.db.prepare(
            `UPDATE streams
            SET end_at = (datetime('now'))
            WHERE stream_id = ?`
        ).run(id)

        return result.changes === 1;
    }

    getStream() {
        const result = this.db.prepare(
            `SELECT * FROM streams
            ORDER BY start_at DESC
            LIMIT 1`
        ).get()

        return result ?? null;
    }

    updateStream({id, startAt, endAt}) {
        const result = this.db.prepare(
            `UPDATE streams
            SET start_at = ?,
            end_at = ?
            WHERE stream_id = ?`
        ).run(startAt, endAt, id);

        return result.changes === 1;
    }
}