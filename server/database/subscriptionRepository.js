class SubscriptionRepository {
    constructor(pool) {
        this.pool = pool;
    }

    // TODO:
    async getSubscriberById(id) {

    }

    async getSubscribers() {
        const [rows] = await this.pool.execute(
            `SELECT * FROM subscriptions s
            JOIN twitch_users u ON u.twitch_id = s.twitch_id`
        );

        return rows;
    }

    async addSubscriber({twitchId, eventId, tier, months, isGift, giftedBy=null}) {
        const [result] = await this.pool.execute(
            `INSERT INTO subscriptions
            (twitch_id, event_id, tier, months, is_gift, gifted_by_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [twitchId, eventId, tier, months, isGift, giftedBy]
        );

        return result.insertId;
    }

    async updateSubscriber({twitchId, eventId, tier, months, isGift, giftedBy, isSubscribed, verified = new Date()}) {
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
            console.warn("updateSubscriber() called with no fields to update.");
            return false;
        }
        query += " WHERE twitch_id = ?";
        values.push(twitchId);

        const [result] = await this.pool.execute(query, values);
        return result.affectedRows === 1;
    }

    async getTotalSubscriberCount() {
        const [rows] = await this.pool.execute(
            `SELECT COUNT(*) as subscriber_count
            FROM subscriptions 
            WHERE is_subscribed = TRUE`
        );

        return rows[0].subscriber_count;
    }

    async getSubscriptionsByStream(streamId) {
        const [rows] = this.pool.execute(`
            SELECT COUNT(DISTINCT s.twitch_id)
            FROM subscriptions s
            JOIN events e ON e.events_id = s.event_id
            WHERE e.stream_id = ?
            AND s.is_subscribed = TRUE`,
            [streamId]);
        return rows[0];
    }
    
    async mostRecentSubscriber({tier, isGifted = false, streamId} = {}) {
        let query = `SELECT s.twitch_id, e.occurred_at, u.display_name
            FROM subscriptions s
            JOIN twitch_users u ON u.twitch_id = s.twitch_id
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

        const [rows] = await this.pool.execute(query, values);
        return rows;
    }
}