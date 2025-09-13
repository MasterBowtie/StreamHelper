import { PrismaClient } from "@prisma/client";

export class ScriptureRepository {
    constructor (db) {
        this.db = db;
    }

    static getInstance(db) {
        if (!this.instance) {
            this.instance = new ScriptureRepository(db);
        }
    }

    async getDaily(date) {
        let d = date ?? new Date();

        let scriptures = await this.db.$queryRaw`SELECT * FROM scripture WHERE DATE_FORMAT(date, %m-%d) = DATE_FORMAT(${d}, '%m-%d)`;
        if (records.length < 1) {
            return {id: 0}
        }
        return scriptures;
    }
}