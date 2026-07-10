export function buildTwitchUserService({db}) {
    async function service(event) {
        // Check for twitch User
        const result = await db.twitchUserRepository.findByTwitchId(event.user_id);

        // Check for Twitch User
        if (result === null) {
            await db.twitchUserRepository.createTwitchUser({
                twitchId: event.user_id,
                login: event.user_login,
                displayName: event.user_name
            });
        } else if (result.display_name !== event.user_name) {
            await db.twitchUserRepository.updateIdentity({
                twitchId: event.user_id,
                displayName: event.user_name
            });
        }
    }
    return service;
}
