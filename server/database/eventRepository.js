export class EventRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async createEvent({eventType, twitchId, streamId=null, occurredAt, metaData=null}) {
        const [result] = await this.pool.execute(
            `INSERT INTO events
            (event_type, twitch_id, streamid, occurred_at, meta_data)`,
            [eventType, twitchId, streamId, occurredAt, metaData]
        );

        return result.insertId;
    }

    async getEventById(id) {
        const [rows] = await this.pool.execute(`SELECT * FROM events
        WHERE event_id = ?`,
        [id]);

        return rows[0] ?? null;
    }
    
    async getEvents({eventType, streamId, limit=100, startAt, endAt}={}) {
        let query = `SELECT * FROM events WHERE`;
        const conditions = [];
        const values = [];

        if (eventType !== undefined) {
            conditions.push("event_type = ?");
            values.push(eventType);
        }

        if (streamId !== undefined) {
            conditions.push("stream_id = ?");
            values.push(streamId);
        }

        if (startAt !== undefined) {
            conditions.push("occurred_at >= ?");
            values.push(startAt);
        }

        if (endAt !== undefined) {
            conditions.push("occurred_at < ?");
            values.push(endAt);
        }

        if (conditions.length === 0) {
            throw new Error("getEvents(): No conditions were given");
        }

        query += conditions.join(" AND ");
        query += " ORDER BY occurred_at DESC";

        if (!Number.isInteger(limit) || limit <= 0) {
            throw new Error("getEvents(): limit must be a positive integer");
        }
        query += " LIMIT ?";
        values.push(Number(limit));


        const [rows] = await this.pool.execute(query, values);
        return rows;
    }
}