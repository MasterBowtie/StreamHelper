import { buildDatabase as MySqlBuildDB } from "../database/mysql/connection.js";
import { TwitchUserRepository as MySqlTwitchUserRepository } from "../database/mysql/twitchUserRepository.js";
import { StreamRepository as MySqlStreamRepository } from "../database/mysql/streamRepository.js";
import { EventRepository as MySqlEventRepository } from "../database/mysql/eventRepository.js";
import { FollowerRepository as MySqlFollowerRepository } from "../database/mysql/followerRepository.js"
import { SubscriptionRepository as MySqlSubscriptionRepository } from "../database/mysql/subscriptionRepository.js"
import { RaidRepository as MySqlRaidRepository } from "../database/mysql/raidRepository.js"
import { SettingRepository as MySqlSettingRepository } from "../database/mysql/settingRepository.js";
import { buildDatabase as SQLiteBuildDB } from "../database/sqlite/connection.js";
import { SettingRepository as SQLiteSettingRepository } from "../database/sqlite/settingRepository.js";
import { TwitchUserRepository as SQLiteTwitchUserRepository } from "../database/sqlite/twitchUserRepository.js";
import { StreamRepository as SQLiteStreamRepository } from "../database/sqlite/streamRepository.js";
import { EventRepository as SQLiteEventRepository } from "../database/sqlite/eventRepository.js";
import { FollowerRepository as SQLiteFollowerRepository } from "../database/sqlite/followerRepository.js";


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
    const db = SQLiteBuildDB();
    const settingRepository = new SQLiteSettingRepository(db.db);
    const twitchUserRepository = new SQLiteTwitchUserRepository(db.db);
    const streamRepository = new SQLiteStreamRepository(db.db);
    const eventRepository = new SQLiteEventRepository(db.db);
    const followerRepository = new SQLiteFollowerRepository(db.db);

    async function initialize() {
        db.initialize();
        console.log("SQLite PENDING...");
    }

    return {
        initialize,
        settingRepository,
        twitchUserRepository,
        streamRepository,
        eventRepository,
        followerRepository,
        // subscriptionRepository,
        // raidRepository
    }
}

