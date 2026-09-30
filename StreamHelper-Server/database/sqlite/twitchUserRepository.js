export class TwitchUserRepository {
    constructor(db) {
        this.db = db;
    }

    updateBroadcaster({twitchUser, token}) {
        const broadcaster = this.getBroadcaster();

        if (!broadcaster) {
            const result = this.db.prepare(
                `INSERT INTO twitch_users
                (id, twitch_id, login, display_name, access_token, refresh_token, expires_at)
                VALUES (1, ?, ?, ?, ?, ?, datetime('now', '+' || ? || ' seconds'))`
            ).run(twitchUser.twitchId, twitchUser.login, twitchUser.displayName, token.accessToken, token.refreshToken, token.expiresIn);
            return result.changes === 1;
        } else {
            const result = this.db.prepare(
                `UPDATE twitch_users
                SET twitch_id = 1,
                login = ?,
                display_name = ?, 
                access_token = ?,
                refresh_token = ?,
                expires_at = datetime('now', '+' || ? || ' seconds')
                WHERE id = 1`
            ).run(twitchUser.twitchId, twitchUser.login, twitchUser.displayName, token.accessToken, token.refreshToken, token.expiresIn);
            return result.changes === 1;
        }
    }

    getBroadcaster() {
        const result = this.db.prepare(`
            SELECT * FROM twitch_users WHERE id = 1`).get();
        return result ?? null;
    }

    updateToken({accessToken, refreshToken, expiresIn}) {
        const statement = this.db.prepare(
            `UPDATE twitch_users
            SET access_token = ?, refresh_token = ?, expires_at = datetime('now', '+' || ? || ' seconds)
            WHERE id = 1`
        );
        const result = statement.run(accessToken, refreshToken, expiresIn);

        return result.changes === 1;
    }

    findByTwitchId(twitchId) {
        const result = this.db.prepare(
            `SELECT twitch_id, login, display_name FROM twitch_users
            WHERE twitch_id = ?`
        ).get(twitchId);
        return result ?? null;
    }

    createTwitchUser({twitchId, login, displayName}) {
        const result = this.db.prepare(
            `INSERT INTO twitch_users
            (twitch_id, login, display_name)
            VALUES (?, ?, ?)`
        ).run(twitchId, login, displayName);
        return result.lastInsertRowid;
    }

    updateIdentity({twitchId, displayName}) {
        const result = this.db.prepare(
            `UPDATE twitch_users
            SET display_name = ?
            WHERE twitch_id = ?`
        ).run(displayName, twitchId);
        return result.changes === 1;
    }
}