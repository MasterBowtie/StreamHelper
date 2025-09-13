import { PrismaClient } from "@prisma/client";

export class ScriptureRepository {
    constructor (db) {
        this.db = db;
    }

    static getInstance(db) {
        if (!this.instance) {
            this.instance = new ScriptureRepository(db);
        }
        return this.instance;
    }

    async getDaily(date) {
        let d = date ?? new Date();

        let scriptures = await this.db.$queryRaw`
      SELECT *
      FROM scripture
      WHERE DATE_FORMAT(date, '%m-%d') = DATE_FORMAT(${d}, '%m-%d')`;
        if (scriptures.length < 1) {
            return {id: 0}
        }

        // TODO
        // parse scriptures and format verses into list
        // Think about how to format the scriptures for clean formatting on client
        return scriptures;
    }
}