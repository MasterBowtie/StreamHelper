export class StreamRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async findId({id}) {
        const [rows] = await this.pool.execute(
            `SELECT * FROM stream
            WHERE id = ?`,
            [id]
        )

        return rows[0] ?? null;
    }

    async startStream({startAt}) {
        const [result] = await this.pool.execute(
            `INSERT INTO stream
            (start_at)
            VALUES (?)`,
            [startAt]
        )

        return result.insertId
    }

    async findActive() {
        const [rows] = this.pool.execute(
            `SELECT * FROM streams
            WHERE end_at IS NULL
            LIMIT 1`
        )

        return rows[0] ?? null;
    }

    async endStream({id, endAt}) {
        const[result] = await this.pool.execute(
                `UPDATE stream
                SET end_at = ?
                WHERE id = ?`,
                [endAt, id]
        )

        return result.affectedRows === 1;
    }

    async getLatest() {
        const [rows] = this.pool.execute(
            `SELECT * FROM stream
            ORDER BY start_at DESC
            LIMIT 1`
        );

        return rows[0] ?? null;
    }

    async updateStream({id, startAt, endAt}) {
        const [result] = await this.pool.execute(
            `UPDATE stream
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