export async function initialize({db, events}) {
    console.log("Initializing Stream Helper...");

    const broadcaster = await db.twitchUserRepository.getBroadcaster();

    if (!broadcaster) {
        console.warn("No broadcaster configured. Waiting for authentication.");
        return;
    }

    console.log("Found broadcaster:", broadcaster.display_name);

    await events.eventSubService.start(broadcaster);

    console.log("Stream Helper ready.")
} 