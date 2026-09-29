import { buildDatabase as MySqlBuildDB } from "../database/mysql/connection.js";
import { TwitchUserRepository as MySqlTwitchUserRepository } from "../database/mysql/twitchUserRepository.js";
import { StreamRepository as MySqlStreamRepository } from "../database/mysql/streamRepository.js";
import { EventRepository as MySqlEventRepository } from "../database/mysql/eventRepository.js";
import { FollowerRepository as MySqlFollowerRepository } from "../database/mysql/followerRepository.js"
import { SubscriptionRepository as MySqlSubscriptionRepository } from "../database/mysql/subscriptionRepository.js"
import { RaidRepository as MySqlRaidRepository } from "../database/mysql/raidRepository.js"
import { SettingRepository as MySqlSettingRepository } from "../database/mysql/settingRepository.js";

export async function buildRepositories() {
    if (process.env.DB_TYPE === "sqlite") {
        return buildSqliteDatabase();
    } else if (process.env.DB_TYPE === "mysql") {
        return buildMySqlDatabase();
    }
}

async function buildMySqlDatabase() {
    const db = MySqlBuildDB();
    const settingRepository = new MySqlSettingRepository(db.pool);
    const twitchUserRepository = new MySqlTwitchUserRepository(db.pool);
    const streamRepository = new MySqlStreamRepository(db.pool);
    const eventRepository = new MySqlEventRepository(db.pool);
    const followerRepository = new MySqlFollowerRepository(db.pool);
    const subscriptionRepository = new MySqlSubscriptionRepository(db.pool);
    const raidRepository = new MySqlRaidRepository(db.pool);

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

async function buildSqliteDatabase() {

    async function initialize() {
        console.log("SQLite PENDING...");
    }

    return {
        initialize
    }
}

