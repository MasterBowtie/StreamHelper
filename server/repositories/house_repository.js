import { PrismaClient } from "@prisma/client";

export class HouseRepository {
    constructor (db) {
        this.db = db;
    }

    static getInstance(db) {
        if (!this.instance) {
            this.instance = new HouseRepository(db);
        }
        return this.instance;
    } 

    async getFullRandom() {
        let records = this.db.house.findMany()
        return records;
    }
}