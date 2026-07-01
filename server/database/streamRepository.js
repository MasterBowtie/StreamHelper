export class StreamRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async findById(id) {
        const [rows] = await this.pool.execute(
            `SELECT * FROM streams
            WHERE id = ?`,
            [id]
        )

        return rows[0] ?? null;
    }

    // Uses Twitch stream start time
    async startStream({start_at}) {
        const [result] = await this.pool.execute(
            `INSERT INTO streams
            (start_at)
            VALUES (?)`,
            [start_at]
        )

        return result.insertId
    }

    async findActive() {
        const [rows] = await this.pool.execute(
            `SELECT * FROM streams
            WHERE end_at IS NULL
            LIMIT 1`
        )

        return rows[0] ?? null;
    }

    // Twitch does NOT give and end time for stream.
    async endStream(id) {
        const[result] = await this.pool.execute(
                `UPDATE streams
                SET end_at = NOW()
                WHERE id = ?`,
                [id]
        )

        return result.affectedRows === 1;
    }

    async getLatest() {
        const [rows] = await this.pool.execute(
            `SELECT * FROM streams
            ORDER BY start_at DESC
            LIMIT 1`
        );

        return rows[0] ?? null;
    }

    async updateStream({id, startAt, endAt}) {
        const [result] = await this.pool.execute(
            `UPDATE streams
            SET start_at = ?,
            end_at = ?
            WHERE id = ?`,
            [startAt, endAt, id]
        )

        return result.affectedRows === 1;
    }
}

//     id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
//     start_at DATETIME NOT NULL,
//     end_at DATETIME NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

//     INDEX idx_stream_time (start_at, end_at)
// );