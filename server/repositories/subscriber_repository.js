import { PrismaClient } from "@prisma/client";

export class SubscriberRepository {
    constructor(db) {
        this.db = db;
    }

    static getInstance(db) {
        if (!this.instance) {
            this.instance = new SubscriberRepository(db);
        }
        return this.instance;
    }

    async createSub(data) {
        console.log("New Sub!")
        try {
            let results = await this.db.user.getUnique({
                where: {
                    id: data.id
                } 
            })
        } catch {
            this.db.subscriber.create({
                data: data
            })
        }
    }

    async updateSub(data) {
        console.log("Resub Update!")
        await this.db.subscriber.update({
            where: {
                id: data.id
            },
            data: {
                gifted: data.gifted,
                gifted_by_id: data.gifted_by_id,
                gifted_by_name: data.gifted_by_name,
                resub_date: data.resub_date
            }
        })
    }

    async getRecent() {
        let resub = await this.db.subscriber.findFirst({
            where: {
                resub_date: {not: null}
            },
            orderBy: [
                {resub_date: 'desc'},
                {start_date: 'desc'}
            ]
        })
        let start = await this.db.subscriber.findFirst({
            orderBy: {
                start_date: 'desc'
            }
        })
        if (resub && start && resub.resub_date < start.start_date) {
            return resub;
        }
        return start;
    }
}

// const findUser = await prisma.user.findFirst({
//   where: {
//     posts: {
//       some: {
//         likes: {
//           gt: 100,
//         },
//       },
//     },
//   },
//   orderBy: {
//     id: 'desc',
//   },
// })