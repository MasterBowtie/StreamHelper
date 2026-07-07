export class RaidRepository {
    constructor (pool) {
        this.pool = pool;
    }

    async createRaid({ eventId, raiderId, viewerCount}) {
        const [result] = await this.pool.execute(
            `INSERT INTO raids (event_id, raider_id, viewer_count)
            VALUES (?, ?, ?)`,
            [eventId, raiderId, viewerCount]
        );

        return result.insertId;
    }

    async getMostRecentRaid({streamId}={}) {
        let query = `
            SELECT r.raider_id, r.viewer_count, e.occurred_at, u.display_name
            FROM raids r
            JOIN events e ON e.event_id = r.event_id
            JOIN twitch_users u ON u.twitch_id = r.raider_id`;
        const values = [];

        if (streamId !== undefined) {
            query += ' WHERE e.stream_id = ?';
            values.push(streamId);
        }

        query += `
        ORDER BY e.occurred_at DESC
        LIMIT 1`;

        const [rows] = await this.pool.execute(query, values);
        return rows[0] ?? null;
    }

    async getRaidCount({ steamId }={}) {
        let query = `
            SELECT COUNT(*) AS raid_count
            FROM raids r
            JOIN events e ON e.event_id = r.event_id
            `;
        const values = [];

        if (streamId !== undefined) {
            query += ' WHERE e.stream_id = ?'
            values.push(streamId);
        }

        const [rows] = await this.pool.execute(query, values);
        return rows[0].raid_count;
    }

    async getRaidStats({
        streamId = null,
        since = null,
        metric = "max_viewers",
        limit = 3 } = {}) 
    {
        let select;

        if (metric === "count") {
            select = `
                r.raider_id,
                u.display_name,
                COUNT(*) AS value
            `;
        } else if (metric === "sum_viewers") {
            select = `
                r.raider_id,
                u.display_name,
                SUM(r.viewer_count) AS value
            `;
        } else {
            select = `
                r.raider_id,
                u.display_name,
                MAX(r.viewer_count) AS value
            `;
        }

        let query = `
            SELECT ${select}
            FROM raids r
            JOIN events e ON e.event_id = r.event_id
            JOIN twitch_users u ON u.twitch_id = r.raider_id
            WHERE 1=1
        `;

        const values = [];

        if (streamId !== null) {
            query += ` AND e.stream_id = ?`;
            values.push(streamId);
        }

        if (since !== null) {
            query += ` AND e.occurred_at >= ?`;
            values.push(since);
        }

        query += `
            GROUP BY r.raider_id
            ORDER BY value DESC
            LIMIT ?
        `;

        values.push(limit);

        const [rows] = await this.pool.execute(query, values);
        return rows;
    }
}