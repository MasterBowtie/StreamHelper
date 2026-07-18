import { buildDatabase } from "../database/database.js";
import { TwitchUserRepository } from "../database/twitchUserRepository.js";
import { StreamRepository } from "../database/streamRepository.js";
import { EventRepository } from "../database/eventRepository.js";
import { FollowerRepository} from "../database/followerRepository.js"
import { SubscriptionRepository } from "../database/subscriptionRepository.js"
import { RaidRepository } from "../database/raidRepository.js"
import { SettingRepository } from "../database/settingRepository.js";

export async function buildRepositories() {
    const db = buildDatabase();
    // TODO: update repository returns to {success: bool, message? data?}
    const settingRepository = new SettingRepository(db.pool);
    const twitchUserRepository = new TwitchUserRepository(db.pool);
    const streamRepository = new StreamRepository(db.pool);
    const eventRepository = new EventRepository(db.pool);
    const followerRepository = new FollowerRepository(db.pool);
    const subscriptionRepository = new SubscriptionRepository(db.pool);
    const raidRepository = new RaidRepository(db.pool);

    async function initialize() {
        await db.initialize();
        console.log("Database Initialized...");
    }


    return {
        initialize,
        settingRepository,
        twitchUserRepository,
        streamRepository,
        eventRepository,
        followerRepository,
        subscriptionRepository,
        raidRepository
    }
}

