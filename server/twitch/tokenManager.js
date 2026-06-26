const REFRESH_BUFFER_MS = 5 * 60 * 1000;

function buildTokenManager({userRepository, twitchAuthService}) {
    
    async function getValidAccessToken() {
    const broadcaster = await userRepository.getBroadcaster();
    // console.log(broadcaster);

    if (!broadcaster) {
        throw new Error('No broadcaster configured');
    }

    const expiresAt = new Date(broadcaster.expires_at);
    const refreshThreshold = Date.now() + REFRESH_BUFFER_MS;
    
    if (expiresAt.getTime() > refreshThreshold) {
        return broadcaster.access_token;
    }
    
    const token = await twitchAuthService.refreshAccessToken(broadcaster.refresh_token);
    console.log("Token:", token);
    
    await userRepository.updateToken(1,{
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresIn: token.expiresIn
    });

    return token.accessToken;
    }

    return {getValidAccessToken};
};

export {buildTokenManager};

