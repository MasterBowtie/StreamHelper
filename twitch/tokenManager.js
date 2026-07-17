const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function buildTokenManager({db, twitchAuthService}) {
    
    async function getValidAccessToken(broadcaster) {
        if (!broadcaster) {
            return {
                success: false,
                reason: "No broadcaster configured"
            };
        }

        const expiresAt = new Date(broadcaster.expires_at);
        
        if (expiresAt.getTime() > Date.now() + REFRESH_BUFFER_MS) {
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

