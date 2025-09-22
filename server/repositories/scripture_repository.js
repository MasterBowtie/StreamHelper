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
        let d = new Date(date)

        let mmdd = d.toISOString().slice(5,10);
        
        let data = await this.db.scripture.findMany({
            where: {md: mmdd},
            orderBy: { book: "asc" },
            include: { collection: true}
        })

        return data.length? data : {id: 0};
    }

    async getCollections() {
        let collections = await this.db.collection.findMany({
            orderBy: { id: "asc"}
        })
        return collections;
    }

    async createScripture(newScript) {
        var {date, book, reference, body } = newScript
        try {
            return await this.db.scripture.create({
                data: {
                    date: new Date(date),
                    book: parseInt(book),
                    body,
                    reference
                },
                select: {id: true, date: true }
            })
        } catch (err) {
            console.error("Prisma: ", err)
            return {id: 0, error: "Internal Server Error", status: 500}
        }
    }

    async updateScripture(newScript) {
        var { id, body, reference, date, book } = newScript;
        let d = date && new Date(date);
        try {
            let mmdd = d && d.toISOString().slice(5,10);
            // console.log(mmdd);
            return await this.db.scripture.update({
                where: { id: parseInt(id) },
                data: {
                    ...(date && { date : new Date(date)}),
                    ...(mmdd && { md: mmdd}),
                    ...(book && { book: parseInt(book) }),
                    ...(body && { body }),
                    ...(reference && { reference })
                },
                select: { id: true, date: true }
            })
        } catch (err) {
            console.error("Prisma: ", err)
            return {id: 0, error: "Internal Server Error", status: 500}
        }
    }
    async deleteScripture(data) {
        var { id } = data;
        try {
            return await this.db.scripture.delete({
                where: {id : parseInt(id)},
                select: { id: true, date: true }
            });
        } catch (err) {
            console.error("Prisma: ", err)
            return {id: 0, error: "Internal Server Error", status: 500}
        }
    }
}