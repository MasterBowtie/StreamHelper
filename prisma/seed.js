import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    await prisma.collection.upsert({
        where: { id: 1},
        update: {},
        create: {id: 1, name: "Old Testament"},
    });

    await prisma.collection.upsert({
        where: { id: 2},
        update: {},
        create: {id: 2, name: "New Testament"},
    });
    
    await prisma.collection.upsert({
        where: { id: 3},
        update: {},
        create: {id: 3, name: "Book of Mormon"},
    });
    
    await prisma.collection.upsert({
        where: { id: 4},
        update: {},
        create: {id: 4, name: "Doctrine and Covenants"},
    });
    
    await prisma.collection.upsert({
        where: { id: 5},
        update: {},
        create: {id: 5, name: "Pearl of Great Price"},
    });
    
    await prisma.collection.upsert({
        where: { id: 6},
        update: {},
        create: {id: 6, name: "General Conference"},
    });
    
    await prisma.collection.upsert({
        where: { id: 7},
        update: {},
        create: {id: 7, name: "Other"},
    });
}

main().finally(()=> {
    prisma.$disconnect()
});