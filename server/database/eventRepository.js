export class EventRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async createEvent({eventId, eventType, twitchId, occurredAt, metaData}) {
        const [result] = await this.pool.execute(
            `INSERT INTO events
            (event_id, event_type, twitch_id, occurred_at, meta_data)`,
            [eventId, eventType, twitchId, occurredAt, metaData]
        );

        return result.insertId;
    }

    async getEventById(id) {
        const [rows] = await this.pool.execute(`SELECT * FROM events
        WHERE event_id = ?`,
        [id]);

        return rows[0] ?? null;
    }
    
    async getEventsByType({eventType, twitchId, start, end, limit}) {
        let query = `SELECT * FROM events WHERE event_type = ?`;
        const values = [eventType];
        const conditions = [];

        if (twitchId) {
            conditions.push("twitch_id = ?");
            values.push(twitchId);
        }

        if (start) {
            conditions.push("occurred_at >= ?");
            values.push(start);
        }

        if (end) {
            conditions.push("occurred_at < ?");
            values.push(end);
        }

        if (conditions > 0) {
            query += " AND " + conditions.join(" AND ");
        }
        query += " ORDER BY occurred_at DESC";

        if (limit) {
            query += " LIMIT ?";
            values.push(Number(limit));
        }
        const [rows] = await this.pool.execute(query, values);
        return rows;
    }

    async getEventsByTimeSpan({startAt, endAt, limit=100}) {
        if (!startAt || !endAt) {
            throw new Error("startAt and endAt are required");
        }

        const [rows] = await this.pool.execute(
            `SELECT * FROM events
            WHERE occurred_at >= ? AND occurred_at < ?
            ORDER BY occurred_at DESC
            LIMIT = ?`,
            [startAt, endAt, limit]
        );

        return rows;
    }
}