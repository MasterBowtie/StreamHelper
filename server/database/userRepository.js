
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
        // TODO: Decrypt Tokens

        return rows[0];
    }

    async updateToken({accessToken, refreshToken, expiresIn}) {
        const [result] = await this.pool.execute(
            `UPDATE twitch_users
            SET access_token = ?, refresh_token = ?, expires_at = NOW() + INTERVAL ? SECOND
            WHERE id = 1`,
            [accessToken, refreshToken, expiresIn]
        );

        return result.affectedRows > 0;
    }

    async createBroadcaster({twitchUser, token}) {
        const [result] = await this.pool.execute(
            `INSERT INTO twitch_users 
            (id, twitch_id, login, display_name, access_token, refresh_token, expires_at, created_at, updated_at)
            Values (1, ?, ?, ?, ?, ?, NOW() + INTERVAL ? SECOND)`,
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
            (twitch_id, login, display_name, access_token, refresh_token, expires_at, created_at, updated_at)
            Values (?, ?, ?, ?, NOW() + INTERVAL ? SECOND)`,
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