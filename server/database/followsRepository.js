export class FollowsRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async createFollower({twitchId, eventId}) {
        const [result] = await this.pool.execute(
            `INSERT INTO follows
            (twitch_id, event_id) VALUES (?, ?)`,
            [twitchId, eventId]
        )

        return result.insertId;
    }

    async findByTwitchId(twitchId) {
        const [rows] = await this.pool.execute(
            `SELECT f.twitch_id, u.display_name, e.occurred_at
            FROM follows f
            JOIN twitch_users u ON u.twitch_id = f.twitch_id
            JOIN events e ON e.event_id = f.event_id
            WHERE f.twitch_id = ?`,
            [twitchId]
        )

        return rows[0] ?? null;
    }

    async getFollowers({streamId, isFollowing=true} = {}) {
        let query = `SELECT f.twitch_id, u.display_name, e.occurred_at FROM follows f
            JOIN twitch_users u ON u.twitch_id = f.twitch_id
            JOIN events e ON e.event_id = f.event_id
            WHERE f.is_following = ?
            `;
        
        const values = [isFollowing];

        if (streamId !== undefined) {
            query += `
            AND e.stream_id = ?`;
            values.push(streamId);
        }
        const [rows] = await this.pool.execute(query, values);

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

    async gainedFollowers(streamId, isFollowing=true) {
        let query = `
            SELECT COUNT(DISTINCT f.twitch_id) as follower_count
            FROM follows f
            JOIN events e ON e.events_id = f.event_id
            WHERE f.is_following = ?`
        const values = [isFollowing];

        if (streamId !== undefined) {
            query += " AND e.stream_id = ?";
            values.push(streamId);
        }

        const [rows] = await this.pool.execute(query, values);

        return rows[0].follower_count;
    }

    // IMPORTANT
    // Update eventId, verify and isFollowing when someone re-follows
    async updateFollower({twitchId, eventId, verify, isFollowing}={}) {
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
            throw new Error("updateFollower(): Called with no fields to update.");
        }
        query += " WHERE twitch_id = ?"
        values.push(twitchId);

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