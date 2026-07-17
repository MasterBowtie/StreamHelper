const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function buildTokenManager({db, twitchAuthService}) {
    
    async function getValidAccessToken() {
        const broadcaster = await db.twitchUserRepository.getBroadcaster();

        if (!broadcaster) {
            throw new Error('No broadcaster configured');
        }

        const expiresAt = new Date(broadcaster.expires_at);
        const refreshThreshold = Date.now() + REFRESH_BUFFER_MS;
        
        if (expiresAt.getTime() > refreshThreshold) {
            return broadcaster.access_token;
        }

        const token = await twitchAuthService.refreshAccessToken(broadcaster.refresh_token);

        if (!token.success) {
            return token;
        }
        
        await db.twitchUserRepository.updateToken({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            expiresIn: token.expiresIn
        });

        return token;
    }

    return {getValidAccessToken};
};

