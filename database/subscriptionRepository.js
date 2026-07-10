export class SubscriptionRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async addSubscriber({twitchId, eventId, tier, months, isGift}) {
        const [result] = await this.pool.execute(
            `INSERT INTO subscriptions
            (twitch_id, event_id, tier, months, is_gift)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [twitchId, eventId, tier, months, isGift]
        );

        return result.insertId;
    }

    async getSubscriberById(id) {
        const [rows] = await this.pool.execute(
            `SELECT s.twitch_id, u.display_name, s.tier, s.gifted_by_id, g.display_name as gift_name FROM subscriptions s
            JOIN twitch_users u ON u.twitch_id = s.twitch_id
            LEFT JOIN twitch_users g ON g.twitch_id = s.gifted_by_id
            WHERE s.twitch_id = ?`,
            [id]
        );

        return rows[0] ?? null;
    }

    async getSubscribers(streamId) {
        let query = `
            SELECT s.twitch_id, u.display_name, s.tier, s.gifted_by_id, g.display_name as gift_name FROM subscriptions s
            JOIN twitch_users u ON u.twitch_id = s.twitch_id
            LEFT JOIN twitch_users g ON g.twitch_id = s.gifted_by_id
            JOIN events e ON e.event_id = s.event_id
            WHERE s.is_subscribed = TRUE`
        const values = [];
        
        if (streamId !== undefined) {
            query += ` AND e.stream_id = ?`;
            values.push(streamId);
        }

        const [rows] = await this.pool.execute(query, values);

        return rows;
    }

    async updateSubscriber({twitchId, eventId, tier, months, isGift, giftedBy, isSubscribed, verified}) {
        if (!twitchId) {
            throw new Error("updateSubscriber(): Invalid TwitchId")
        }        
        let query = `UPDATE subscriptions SET `;
        const values = [];
        const updates = [];

        
        if (eventId !== undefined) {
            values.push(eventId);
            updates.push("event_id = ?");
        }

        if (tier !== undefined) {
            values.push(tier);
            updates.push("tier = ?");
        }

        if (months !== undefined) {
            values.push(months);
            updates.push("months = ?");
        
        }
        
        if (isGift !== undefined) {
            values.push(isGift);
            updates.push("is_gift = ?");
        }

        if (giftedBy !== undefined) {
            values.push(giftedBy);
            updates.push("gifted_by_id = ?");
        }

        if (isSubscribed !== undefined) {
            values.push(isSubscribed);
            updates.push("is_subscribed = ?")
        }

        if (verified !== undefined) {
            values.push(verified);
            updates.push("last_verified_at = ?");
        }

        if (updates.length > 0) {
            query += updates.join(", ");
        } else {
            throw new Error("updateSubscriber() called with no fields to update.");
        }
        query += " WHERE twitch_id = ?";
        values.push(twitchId);

        const [result] = await this.pool.execute(query, values);
        return result.affectedRows === 1;
    }

    async getSubscriberCount(streamId) {
        let query = `
            SELECT COUNT(DISTINCT s.twitch_id) as subscriber_count
            FROM subscriptions s`;
        const values = [];

        if (streamId !== undefined) {
            query += ` JOIN events e ON e.event_id = s.event_id
            WHERE e.stream_id = ? AND `
            values.push(streamId);
        }else {
            query += ` WHERE `
        }
        query += `s.is_subscribed = TRUE`;

        const [rows] = await this.pool.execute(query, values);
        return rows[0].subscriber_count;
    }
    
    async mostRecentSubscriber({tier, isGifted = false, streamId} = {}) {
        let query = `SELECT s.twitch_id, e.occurred_at, u.display_name, g.display_name as gift_name
            FROM subscriptions s
            JOIN twitch_users u ON u.twitch_id = s.twitch_id
            LEFT JOIN twitch_users g ON g.twitch_id = s.gifted_by_id
            JOIN events e ON e.event_id = s.event_id
            WHERE s.is_subscribed = TRUE
              AND s.is_gift = ? `;
        const values = [isGifted];
        
        if (tier !== undefined) {
            query += ` AND s.tier = ? `
            values.push(tier);
        }

        if (streamId !== undefined) {
            query += ` AND e.stream_id = ?`;
            values.push(streamId);
        }
              
        query += ` ORDER BY e.occurred_at DESC LIMIT 1`

        const [rows] = await this.pool.execute(query, values);
        return rows[0] ?? null;
    }

    async getTopGifters({ streamId = null, tier = null, limit = 3 } = {}) {
        let query = `
            SELECT 
                s.gifted_by_id,
                u.display_name,
                s.tier,
                COUNT(*) AS gift_count
            FROM subscriptions s
            JOIN twitch_users u ON u.twitch_id = s.gifted_by_id
            JOIN events e ON e.event_id = s.event_id
            WHERE s.is_gift = TRUE
            AND s.gifted_by_id IS NOT NULL
        `;

        const values = [];

        if (streamId !== null) {
            query += ` AND e.stream_id = ?`;
            values.push(streamId);
        }

        if (tier !== null) {
            query += ` AND s.tier = ?`;
            values.push(tier);
        }

        query += `
            GROUP BY s.gifted_by_id, s.tier
            ORDER BY gift_count DESC
            LIMIT ?
        `;

        values.push(limit);

        if (!Number.isInteger(limit) || limit <= 0) {
            throw new Error("getTopGifters(): Invalid limit");
        }

        const [rows] = await this.pool.execute(query, values);
        return rows;
    }
}