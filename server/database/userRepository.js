export class UserRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async findUserById(id) {
        const [rows] = await this.pool.query(
            "SELECT * FROM twitch_users WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    async findUserBylogin(login) {
        const [rows] = await this.pool.query(
            "SELECT * FROM twitch_users WHERE login = ?",
            [login]
        );

        return rows[0];
    }

    async updateToken(id, {accessToken, refreshToken, expiresIn}) {
        const [result] = await this.pool.execute(
            `UPDATE twitch_users
            SET access_token = ?, refresh_token = ?, expires_at = NOW() + INTERVAL ? SECOND
            WHERE id = ?`,
            [accessToken, refreshToken, expiresIn, id]
        );

        return result.affectedRows === 1;
    }

    async updateBroadcaster({twitchUser, token}) {
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

        return result.insertId;
    }

    async createBroadcaster({twitchUser, token}) {
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

        return result.insertId;
    }

    async createUser({twitchUser, token}) {
        // TODO: Encrypt tokens

        const [result] = await this.pool.execute(
            `INSERT INTO twitch_users 
            (twitch_id, login, display_name, access_token, refresh_token, expires_at)
            VALUES (?, ?, ?, ?, NOW() + INTERVAL ? SECOND)`,
            [
            twitchUser.twitchId, 
            twitchUser.login,
            twitchUser.displayName, 
            token.accessToken, 
            token.refreshToken, 
            token.expiresIn]
        );

        return result.insertId;
    }

    async getBroadcaster() {
        const [rows] = await this.pool.execute(`SELECT * 
            FROM twitch_users
                WHERE id = 1 LIMIT 1`);
        
        return rows[0] || null;
    }
}