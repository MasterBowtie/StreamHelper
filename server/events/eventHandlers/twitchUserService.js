function buildTwitchUserService({twitchUserRepository}) {
    async function service(event) {
        // Check for twitch User
        const result = await twitchUserRepository.findByTwitchId(event.user_id);

        // Check for Twitch User
        if (result === null) {
            await twitchUserRepository.createTwitchUser({
                twitchId: event.user_id,
                login: event.user_login,
                displayName: event.user_name
            });
        } else if (result.display_name !== event.user_name) {
            await twitchUserRepository.updateIdentity({
                twitchId: event.user_id,
                displayName: event.user_name
            });
        }
    }
    return service;
}

export { twitchUserService }