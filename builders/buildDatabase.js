import { buildDatabasePool } from "../database/database.js";
import { TwitchUserRepository } from "../database/twitchUserRepository.js";
import { StreamRepository } from "../database/streamRepository.js";
import { EventRepository } from "../database/eventRepository.js";
import { FollowerRepository} from "../database/followerRepository.js"
import { SubscriptionRepository } from "../database/subscriptionRepository.js"
import { RaidRepository } from "../database/raidRepository.js"

export function buildDatabase() {
    const db = buildDatabasePool();

    const twitchUserRepository = new TwitchUserRepository(db);
    const streamRepository = new StreamRepository(db);
    const eventRepository = new EventRepository(db);
    const followerRepository = new FollowerRepository(db);
    const subscriptionRepository = new SubscriptionRepository(db);
    const raidRepository = new RaidRepository(db);

    return {
        db,
        twitchUserRepository,
        streamRepository,
        eventRepository,
        followerRepository,
        subscriptionRepository,
        raidRepository
    }
}