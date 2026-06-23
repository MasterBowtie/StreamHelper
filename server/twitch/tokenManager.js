const REFRESH_BUFFER_MS = 5 * 60 * 1000;

function buildTokenManager({userRepository, twitchAuthService}) {
    
    async function getValidAccessToken() {
    const broadcaster = await userRepository.getBroadcaster();

    if (!broadcaster) {
        throw new Error('No broadcaster configured');
    }

    const expiresAt = new Date(broadcaster.expires_at);
    const refreshThreshold = Date.now() + REFRESH_BUFFER_MS;
    
    if (expiresAt.getTime() > refreshThreshold) {
        return broadcaster.access_token;
    }
    
    const token = await twitchAuthService.refreshAccessToken(broadcaster.refresh_token);
    await userRepository.updateTokens({
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: token.expiresAt
    });

    return token.accessToken;
    }

    return {getValidAccessToken};
};

export {buildTokenManager};

