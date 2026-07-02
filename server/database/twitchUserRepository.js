export class UserRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async updateBroadcaster({twitchUser, token}) {
        const broadcaster = await this.getBroadcaster();

        if (!broadcaster) {
            const [result] = await this.pool.execute(
                `INSERT INTO twitch_users 
                (id, twitch_id, login, display_name, access_token, refresh_token, expires_at)
                VALUES (1, ?, ?, ?, ?, ?, NOW() + INTERVAL ? SECOND)`,
                [
                twitchUser.twitchId, 
                twitchUser.login,
                twitchUser.displayName, 
                token.accessToken, 
                token.refreshToken, 
                token.expiresIn
                ]
            )

            return result.affectedRows === 1;
        } else {
            const [result] = await this.pool.execute(
                `UPDATE twitch_users
                SET twitch_id=?,
                login=?,
                display_name=?,
                access_token=?,
                refresh_token=?
                expires_at = NOW() + INTERVAL ? SECOND
                WHERE id = 1`,
                [twitchUser.twitchId, 
                twitchUser.login,        
                twitchUser.displayName,
                token.accessToken,
                token.refreshToken,
                token.expiresIn]
            )
            return result.affectedRows === 1;
        }
    }

    async getBroadcaster() {
        const [rows] = await this.pool.execute(`SELECT * 
            FROM twitch_users
                WHERE id = 1 LIMIT 1`);
        
        return rows[0] || null;
    }

    async updateToken({accessToken, refreshToken, expiresIn}) {
        const [result] = await this.pool.execute(
            `UPDATE twitch_users
            SET access_token = ?, refresh_token = ?, expires_at = NOW() + INTERVAL ? SECOND
            WHERE id = 1`,
            [accessToken, refreshToken, expiresIn]
        );

        return result.affectedRows === 1;
    }

    async findByTwitchId(twitchId) {
        const [rows] = await this.pool.execute(
            `SELECT * FROM twitch_users
            WHERE twitch_id = ?`,
            [twitchId]
        );
        return rows[0] || null;
    }

    async createTwitchUser({twitchUser, token}) {
        const [result] = await this.pool.execute(
            `INSERT INTO twitch_users 
            (twitch_id, login, display_name, access_token, refresh_token, expires_at)
            VALUES (?, ?, ?, ?, NOW() + INTERVAL ? SECOND)`,
            [
            twitchUser.twitchId, 
            twitchUser.login,
            twitchUser.displayName
            ]
        );

        return result.insertId;
    }

    async updateIdentity({twitchUser}) {
        const [result] = await this.pool.execute(
            `UPDATE twitch_users
            SET display_name = ?
            WHERE twitch_id = ?`,
            [   
            twitchUser.displayName,
            twitchUser.twitchId 
            ]
        )
    }
}