export async function initialize({twitchUserRepository, eventSubService}) {
    console.log("Initializing Stream Helper...");

    const broadcaster = await twitchUserRepository.getBroadcaster();

    if (!broadcaster) {
        console.warn("No broadcaster configured. Waiting for authentication.");
        return;
    }

    console.log("Found broadcaster:", broadcaster.display_name);

    await eventSubService.start(broadcaster);

    console.log("Stream Helper ready.")
} 