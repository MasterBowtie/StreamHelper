export class EventRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async createEvent({eventId, eventType, twitchId, streamId=null, occurredAt, metaData=null}) {
        const [result] = await this.pool.execute(
            `INSERT INTO events
            (event_id, event_type, twitch_id, streamid, occurred_at, meta_data)`,
            [eventId, eventType, twitchId, streamId, occurredAt, metaData]
        );

        return result.insertId;
    }

    async getEventById(id) {
        const [rows] = await this.pool.execute(`SELECT * FROM events
        WHERE event_id = ?`,
        [id]);

        return rows[0] ?? null;
    }
    
    async getEventsByType({eventType, streamId, limit=100}) {
        let query = `SELECT * FROM events WHERE event_type = ?`;
        const values = [eventType];

        if (streamId !== undefined) {
            query += " AND stream_id = ?";
            values.push(streamId);
        }

        query += " ORDER BY occurred_at DESC";

        if (limit) {
            query += " LIMIT ?";
            values.push(Number(limit));
        }
        const [rows] = await this.pool.execute(query, values);
        return rows;
    }

    async getEventsByTimeSpan({startAt, endAt, limit=100, streamId}) {
        let query = `SELECT * FROM events
            WHERE occurred_at >= ? AND occurred_at < ?
            `;
        const values= [startAt, endAt];

        if (streamId !== undefined) {
            query += " AND stream_id = ?";
            values.push(streamId);
        }
        query += " ORDER BY occurred_at DESC";

        const [rows] = await this.pool.execute(query, values);
        return rows;
    }
}