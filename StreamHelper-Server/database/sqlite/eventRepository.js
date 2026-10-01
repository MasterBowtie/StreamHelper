export class EventRepository {
    constructor(db) {
        this.db = db;
    }

    createEvent({eventType, twitchId, streamId=null, occurredAt, metadata=null}) {
        const result = this.db.prepare(
            `INSERT INTO events
            (event_type, twitch_id, stream_id, occurred_at, metadata)
            VALUES (?, ?, ?, ?, ?)`
        ).run(eventType, twitchId, streamId, occurredAt, JSON.stringify(metadata));

        return result.lastInsertRowid;
    }

    getEventById(id) {
        const result = this.db.prepare(
            `SELECT * FROM events WHERE event_id = ?`
        ).get(id);

        if (!result) {
            return null;
        }
        if (result.metadata !== null) {
            result.metadata = JSON.parse(result.metadata);
        }
        return result;
    }

    getEvents({eventType, streamId, limit=100, startAt, endAt} = {}) {
        let query = `SELECT * from events WHERE`;
        const conditions = [];
        const values = [];

        if (eventType !== undefined) {
            conditions.push("event_type = ?");
            values.push(eventType)
        }
        if (streamId !== undefined) {
            conditions.push("stream_id = ?");
            values.push(streamId)
        }
        if (startAt !== undefined) {
            conditions.push("occurred_at >= ?");
            values.push(startAt)
        }
        if (endAt !== undefined) {
            conditions.push("occurred_at < ?");
            values.push(endAt)
        }
        if (conditions.length === 0) {
            console.error("getEvents(): No conditions were given");
            return [];
        }

        query += conditions.join(" AND ");
        query += " ORDER BY occurred_at DESC";

        if (!Number.isInteger(limit) || limit <= 0) {
            console.error("getEvents(): limit must be a positive integer")
            return [];
        }
        query += " LIMIT ?";
        values.push(Number(limit));

        const results = this.db.prepare(query).all(...values);

        for (let row of results) {
            if (row.metadata !== null) {
                row.metadata = JSON.parse(i.metadata);
            }
        }
        return results;
    }
}