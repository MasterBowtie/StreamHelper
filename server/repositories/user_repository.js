import { PrismaClient } from "@prisma/client";

export class UserRepository {
    constructor(db) {
        this.db = db;
    }

    static getInstance(db) {
        if (!this.instance) {
            this.instance = new UserRepository(db);
        }
        return this.instance;
    }

    async createUser(username, client_id) {
        try {
            let results = await this.db.user.getUnique({
                where: {
                    name: username
                }
            })
        } catch {
            this.db.user.create({
                data: {
                    name: username,
                    client_id
                }
            })
        }
    }

    async setToken(client_id, token, expires, refresh, user_id) {
        console.log('updated Token', expires);
        await this.db.user.update({
            where: {
                client_id
            },
            data: {
                token,
                expires,
                refresh,
                user_id
            }
        })
    }

    async getToken(client_id) {
        let results = await this.db.user.findUnique({
            where: {
                client_id
            }
        })
        return results;
    }
}