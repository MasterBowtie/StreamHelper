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

    async getWoods() {
        let woods = this.db.house.groupBy({
            by: ['wall'],
            select: { wall: true },
        })
        return woods;
    }

    async getStyles() {
        let styles = await this.db.house.groupBy({
            by: ['style'],
            select: {style: true},
        })
        return styles;
    }

    async getSingle(wall, roof, style) {
        let records = await this.db.house.findMany({
            where: { wall, roof, style, used: false}
        })
        if (records.length > 1) {
            let index = Math.round(Math.random() * records.length)
            return records[index];
        } else if (records.length === 0) {
            return {id: 0}
        } 
        return records[0];
    }

    async setHouse(wall, roof, style) {
        if (!wall || !roof || !style) {
            return {
                status: "error",
                results: "Not enough data"}
        }
        try {
            let search = await this.db.house.findFirst({
                where: {
                    wall,
                    roof,
                    style,
                }, 
                select: {
                    id: true
                }
            })
            let id = search.id;
            console.log(id);
            await this.db.house.update({
                where: {
                    id, 
                }, 
                data: {
                    used: true
                }
            })
            return {
                status: "ok",
                results: "House successfully updated"}
        } catch (error) {
            return {
                status: "error", 
                results: error}
        }
    }

    async getFullRandom() {
        let records = this.db.house.findMany()
        return records;
    }
}