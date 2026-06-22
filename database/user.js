
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

    async findUserByUsername(username) {
        const [rows] = await this.pool.query(
            "SELECT * FROM twitch_users WHERE user_name = ?",
            [username]
        );
        // TODO: Decrypt Tokens

        return rows[0];
    }

    async updateToken(id, accessToken, refreshToken, expiresAt) {
        const [result] = await this.pool.execute(
            `UPDATE twitch_users
            SET access_token = ?, refresh_token = ?, expires_at = ?
            WHERE id = ?`,
            [accessToken, refreshToken, expiresAt, id]
        );

        return result.affectedRows > 0;
    }

    async createUser(twitchUserId, twitchUsername, accessToken, refreshToken, expiresAt) {
        // TODO: Encrypt tokens

        const [result] = await this.pool.execute(
            `INSERT INTO twitch_users 
            (twitch_id, user_name, access_token, refresh_token, expires_at, created_at, updated_at)
            Values (?, ?, ?, ?, ?, ?, ?)`,
            [twitchUserId, twitchUsername, accessToken, refreshToken, expiresAt, new Date(), new Date()]
        );

        return result.insertId;
    }
}