const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function buildTokenManager({db, twitchAuthService}) {
    
    async function getValidAccessToken() {
        const broadcaster = await db.twitchUserRepository.getBroadcaster();

        if (!broadcaster) {
            return {
                success: false,
                message: "No broadcaster configured"
            };
        } else if (!broadcaster.refresh_token) {
            return {
                success: false,
                message: "No refresh token"
            }
        }

        const expiresAt = new Date(broadcaster.expires_at);
        
        if (expiresAt.getTime() > Date.now() + REFRESH_BUFFER_MS) {
            return {
                success: true,
                data: {
                    accessToken: broadcaster.access_token
                }
            };
        }

        const token = await twitchAuthService.refreshAccessToken(broadcaster.refresh_token);

        if (!token.success) {
            return token;
        }
        
        await db.twitchUserRepository.updateToken({
            accessToken: token.data.accessToken,
            refreshToken: token.data.refreshToken,
            expiresIn: token.data.expiresIn
        });

        return token;
    }

    return {getValidAccessToken};
};

