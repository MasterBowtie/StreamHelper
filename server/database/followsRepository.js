class FollowsRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async getFollowers({streamId} = {}) {
        let query = `SELECT * FROM follows f
            JOIN twitch_users u ON u.twitch_id = f.twitch_id
            WHERE f.is_following = TRUE
            `;
        
        const values = [];

        if (streamId !== undefined) {
            query += `
            AND f.event_id IN (
            SELECT event_id FROM events WHERE stream_id = ?
            )`;
            values.push(streamId);
        }
        const [rows] = this.pool.execute(query, values);

        return rows;
    }


    async getMostRecentFollower() {
        const [rows] = await this.pool.execute(
        `SELECT f.twitch_id, e.occurred_at, u.display_name
        FROM follows f
        JOIN twitch_users u ON u.twitch_id = f.twitch_id
        JOIN events e ON e.event_id = f.event_id
        WHERE f.is_following = TRUE
        ORDER BY e.occurred_at DESC
        LIMIT 1;`
    );

        return rows[0] ?? null;
    }

    async getTotalFollowerCount() {
        const [rows] = await this.pool.execute(
            `SELECT COUNT(*) AS follower_count 
            FROM follows
            WHERE is_following = TRUE`
        );

        return rows[0].follower_count;
    }

    async gainedFollowersByStream(streamId) {
        const [rows] = this.pool.execute(`
            SELECT COUNT(DISTINCT f.twitch_id)
            FROM follows f
            JOIN events e ON e.events_id = f.event_id
            WHERE e.stream_id = ?
            AND f.is_following = TRUE`,
            [streamId]);
        return rows[0];
    }

    async findByTwitchId({twitchId}) {
        const [rows] = await this.pool.execute(
            `SELECT * FROM follows f
            JOIN twitch_users u ON u.twitch_id = f.twitch_id
            WHERE f.twitch_id = ?`,
            [twitchId]
        )

        return rows[0] ?? null;
    }

    async createFollow({twitchId, eventId}) {
        const [result] = await this.pool.execute(
            `INSERT INTO follows
            (twitch_id, event_id) VALUES (?, ?)`,
            [twitchId, eventId]
        )

        return result.insertId;
    }

// IMPORTANT
// Update eventId, verify and isFollowing when someone re-follows

    async updateFollower({twitchId, eventId, verify, isFollowing}) {
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
        
        if (updates.length > 0) {
            query += updates.join(", ");
        } else {
            console.warn("updateFollower() called with no fields to update.");
            return false;
        }
        query += " WHERE twitch_id = ?"
        values.push(twitchId);

        if (updates.length === 0)

        const [result] = await this.pool.execute(query, values);
        return result.affectedRows === 1;
    }
}

// follow_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
// twitch_id VARCHAR(50),
// event_id INT,
// last_verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
// is_following BOOLEAN DEFAULT TRUE,

// FOREIGN KEY (twitch_id) REFERENCES twitch_users(twitch_id),
// FOREIGN KEY (event_id) REFERENCES events(event_id),
// INDEX idx_follows_twitch_id (twitch_id)