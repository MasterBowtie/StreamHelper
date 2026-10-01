export class FollowerRepository {
    constructor(db) {
        this.db = db;
    }

    createFollowerByEvent({twitchId, eventId}) {
        const result = this.db.prepare(
            `INSERT INTO follows
            (twitch_id, event_id)
            VALUES (?,?)`
        ).run(twitchId, eventId)

        return result.lastInsertRowid;
    }

    findByTwitchId(twitchId) {
        const result = this.db.prepare(
            `SELECT f.twitch_id, u.display_name, e.occurred_at, f.is_following
            FROM follows f
            JOIN twitch_users u ON u.twitch_id = f.twitch_id
            JOIN events e ON e.event_id = f.event_id
            WHERE f.twitch_id = ?`
        ).get(twitchId)

        return result ?? null;
    }

    getFollowers({streamId, isFollowing=true}={}) {
        let query = `SELECT f.twitch_id, u.display_name, e.occurred_at
        FROM follows f
        JOIN twitch_users u ON u.twitch_id = f.twitch_id
        JOIN events e ON e.event_id = f.event_id
        WHERE f.is_following = ?`;
        const values = [isFollowing];

        if (streamId !== undefined) {
            query += ` AND e.stream_id = ?`;
            values.push(streamId);
        }
        const results = this.db.prepare(query).all(...values);

        return results;
    }

    getMostRecentFollower() {
        const result = this.db.prepare(
            `SELECT f.twitch_id, e.occurred_at, u.display_name
            FROM follows f
            JOIN twitch_users u ON u.twitch_id = f.twitch_id
            JOIN events e ON e.event_id = f.event_id
            WHERE f.is_following = TRUE
            ORDER BY e.occurred_at DESC
            LIMIT 1`
        ).get()

        return result ?? null;
    }

    gainedFollowers({streamId, isFollowing=true}={}) {
        let query = `SELECT COUNT(DISTINCT f.twitch_id) as follower_count
            FROM follows f
            JOIN events e ON e.event_id = f.event_id
            WHERE f.is_following = ?`;
        const values = [isFollowing];

        if (streamId !== undefined) {
            query += " AND e.stream_id = ?";
            values.push(streamId);
        }

        const result = this.db.prepare(query).get(...values);

        return result;
    }

    updateFollower({twitchId, eventId, verify, isFollowing}= {}) {
        let query = `UPDATE follows SET `;
        const values = [];
        const updates = [];

        if (eventId !== undefined) {
            values.push(eventId);
            updates.push("event_id = ?");
        }
        if (verify !== undefined) {
            values.push(verify);
            updates.push("last_verified_at = ?");
        }
        if (isFollowing !== undefined) {
            values.push(isFollowing);
            updates.push("is_following = ?");
        }
        
        if (updates.length === 0) {
            console.error("updateFollower(): Called with no fields to update");
            return false
        }
        query += updates.join(", ");
        query += " WHERE twitch_id = ?";
        values.push(twitchId);

        const result = this.db.prepare(query).run(...values);

        return result.changes === 1;
    }
}